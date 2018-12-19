<?
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED!==true)die();

use Bitrix\Crm\Conversion\DealConversionConfig;
use Bitrix\Crm\Conversion\DealConversionWizard;
use Bitrix\Crm\Conversion\LeadConversionConfig;
use Bitrix\Crm\Conversion\LeadConversionWizard;
use Bitrix\Crm\Conversion\LeadConversionScheme;
use Bitrix\Crm\Conversion\LeadConversionType;
use Bitrix\Crm\Synchronization\UserFieldSynchronizer;

class CBPCrmConvertDocumentActivity extends CBPActivity
{
	public function __construct($name)
	{
		parent::__construct($name);
		$this->arProperties = array(
			"Title" => "",
			"Items" => array(),
			"DealCategoryId" => 0,
			'DisableActivityCompletion' => 'N'
		);
	}

	public function Execute()
	{
		if ($this->Items == null || !CModule::IncludeModule("crm"))
			return CBPActivityExecutionStatus::Closed;

		$documentId = $this->GetDocumentId();
		if ($documentId[0] !== 'crm')
		{
			$this->WriteToTrackingService(GetMessage("CRM_CVTDA_INCORRECT_DOCUMENT"), 0, CBPTrackingType::Error);
			return CBPActivityExecutionStatus::Closed;
		}

		list($entityTypeName, $entityId) = explode('_', $documentId[2]);
		$entityTypeId = \CCrmOwnerType::ResolveID($entityTypeName);

		$conversionConfig = $this->getConversionConfig($entityTypeId, $entityId);
		if (!$conversionConfig)
		{
			$this->WriteToTrackingService(GetMessage('CRM_CVTDA_WIZARD_NOT_FOUND'), 0, CBPTrackingType::Error);
			return CBPActivityExecutionStatus::Closed;
		}

		$this->synchronizeFields($entityTypeId, $conversionConfig);
		$wizard = $this->getConversionWizard($entityTypeId, $conversionConfig);

		if (!$wizard)
		{
			$this->WriteToTrackingService(GetMessage('CRM_CVTDA_WIZARD_NOT_FOUND'), 0, CBPTrackingType::Error);
			return CBPActivityExecutionStatus::Closed;
		}

		if(!$wizard->execute())
		{
			$errorText = $wizard->getErrorText();
			$this->WriteToTrackingService($errorText, 0, CBPTrackingType::Error);
			$this->createRequest($errorText);
		}

		return CBPActivityExecutionStatus::Closed;
	}

	private function createRequest($errorText)
	{
		$start = ConvertTimeStamp(time() + CTimeZone::GetOffset(), 'FULL');

		$documentId = $this->GetDocumentId();
		list($typeName, $id) = explode('_', $documentId[2]);
		$typeId = \CCrmOwnerType::ResolveID($typeName);

		$allItems = static::getItemsList($documentId);
		$items = $this->Items;
		foreach ($items as $key => $item)
			$items[$key] = $allItems[$item];

		$responsibleId = \CCrmOwnerType::GetResponsibleID($typeId, $id, false);
		$activityFields = array(
			'AUTHOR_ID' => $responsibleId,
			'START_TIME' => $start,
			'END_TIME' => $start,
			'SUBJECT' => GetMessage('CRM_CVTDA_REQUEST_SUBJECT_'.$typeName),
			'PRIORITY' => CCrmActivityPriority::Medium,
			'DESCRIPTION' => GetMessage('CRM_CVTDA_REQUEST_DESCRIPTION_'.$typeName, array(
				'#ITEMS#' => implode(' + ', $items)
			)),
			'DESCRIPTION_TYPE' => CCrmContentType::PlainText,
			'PROVIDER_ID' => \Bitrix\Crm\Activity\Provider\Request::getId(),
			'PROVIDER_TYPE_ID' => \Bitrix\Crm\Activity\Provider\Request::getTypeId(array()),
			'RESPONSIBLE_ID' => $responsibleId
		);

		$activityFields['BINDINGS'] = array(
			array('OWNER_TYPE_ID' => $typeId, 'OWNER_ID' => $id)
		);

		if(!($id = CCrmActivity::Add($activityFields, false, true, array('REGISTER_SONET_EVENT' => true))))
		{
			$this->WriteToTrackingService(CCrmActivity::GetLastErrorMessage(), 0, CBPTrackingType::Error);
			return CBPActivityExecutionStatus::Closed;
		}

		if ($id > 0)
		{
			$this->requestId = $id;
			if ($typeId == \CCrmOwnerType::Lead)
			{
				CCrmActivity::SaveCommunications($id, array(array(
					'ENTITY_ID' => (int)str_replace('LEAD_', '', $documentId[2]),
					'ENTITY_TYPE_ID' => CCrmOwnerType::Lead,
					'ENTITY_TYPE' => CCrmOwnerType::LeadName,
					'TYPE' => ''
				)), $activityFields, false, false);
			}
		}
	}

	private function getConversionWizard($entityTypeId, $conversionConfig)
	{
		$wizard = null;

		if ($entityTypeId == \CCrmOwnerType::Lead)
		{
			LeadConversionWizard::remove($this->getEntityId());
			$wizard = new LeadConversionWizard($this->getEntityId(), $conversionConfig);

			if ($this->DisableActivityCompletion === 'Y')
			{
				$wizard->enableActivityCompletion(false);
			}
		}
		elseif ($entityTypeId == \CCrmOwnerType::Deal)
		{
			DealConversionWizard::remove($this->getEntityId());
			$wizard = new DealConversionWizard($this->getEntityId(), $conversionConfig);
		}

		$wizard->enableUserFieldCheck(false);
		$wizard->enableBizProcCheck(false);

		return $wizard;
	}

	private function getConversionConfig($entityTypeId, $entityId)
	{
		$config = null;
		$typeId = 0;
		if ($entityTypeId === \CCrmOwnerType::Lead)
		{
			$config = new LeadConversionConfig();
			$typeId = LeadConversionType::resolveByEntityID($entityId);
		}
		elseif ($entityTypeId === \CCrmOwnerType::Deal)
		{
			$config = new DealConversionConfig();
		}

		if (!$config)
			return false;

		$config->enablePermissionCheck(false);

		$items = $this->Items;
		foreach ($items as $itemName)
		{
			$itemTypeId = \CCrmOwnerType::ResolveID($itemName);

			if ($entityTypeId === \CCrmOwnerType::Lead &&
				!LeadConversionScheme::isTargetTypeSupported($itemTypeId, array('TYPE_ID' => $typeId))
			)
			{
				continue;
			}

			$item = $config->getItem($itemTypeId);
			if (!$item)
				continue;

			$item->setActive(true);
			$item->enableSynchronization(true);

			if ($itemName == \CCrmOwnerType::ContactName)
			{
				$item->setInitData(array (
					'defaultName' => GetMessage('CRM_CVTDA_DEFAULT_CONTACT_NAME'),
				));
			}
			else if ($itemName == \CCrmOwnerType::DealName)
			{
				$item->setInitData(array (
					'categoryId' => (int)$this->DealCategoryId,
				));
			}
		}

		return $config;

	}

	private function synchronizeFields($srcEntityTypeId, \Bitrix\Crm\Conversion\EntityConversionConfig $config)
	{
		foreach ($config->getItems() as $item)
		{
			$dstEntityTypeId = (int)$item->getEntityTypeID();
			if(!UserFieldSynchronizer::needForSynchronization($srcEntityTypeId, $dstEntityTypeId))
			{
				continue;
			}

			if ($item->isSynchronizationEnabled())
			{
				UserFieldSynchronizer::synchronize($srcEntityTypeId, $dstEntityTypeId);
			}
			else
			{
				UserFieldSynchronizer::markAsSynchronized($srcEntityTypeId, $dstEntityTypeId);
			}
		}
	}

	private function getEntityId()
	{
		//extract real entity id from string like LEAD_123 or DEAL_345
		$id = $this->GetDocumentId();
		$pairs = explode('_', $id[2]);

		return count($pairs) > 1 ? $pairs[1] : $pairs[0];
	}

	public static function ValidateProperties($arTestProperties = array(), CBPWorkflowTemplateUser $user = null)
	{
		$arErrors = array();

		if (empty($arTestProperties["Items"]) || !is_array($arTestProperties["Items"]))
		{
			$arErrors[] = array("code" => "NotExist", "parameter" => "Responsible", "message" => GetMessage("CRM_CVTDA_EMPTY_PROP"));
		}

		return array_merge($arErrors, parent::ValidateProperties($arTestProperties, $user));
	}

	public static function GetPropertiesDialog($documentType, $activityName, $arWorkflowTemplate, $arWorkflowParameters, $arWorkflowVariables, $arCurrentValues = null, $formName = "", $popupWindow = null, $siteId = '')
	{
		if (!CModule::IncludeModule("crm"))
			return '';

		$dialog = new \Bitrix\Bizproc\Activity\PropertiesDialog(__FILE__, array(
			'documentType' => $documentType,
			'activityName' => $activityName,
			'workflowTemplate' => $arWorkflowTemplate,
			'workflowParameters' => $arWorkflowParameters,
			'workflowVariables' => $arWorkflowVariables,
			'currentValues' => $arCurrentValues,
			'formName' => $formName,
			'siteId' => $siteId
		));

		$map = [
			'Items' => [
				'Name' => GetMessage('CRM_CVTDA_ITEMS'),
				'FieldName' => 'items',
				'Type' => 'select',
				'Required' => true,
				'Multiple' => true,
				'Options' => static::getItemsList($documentType)
			],
			'DealCategoryId' => [
				'Name' => GetMessage('CRM_CVTDA_DEAL_CATEGORY_ID'),
				'FieldName' => 'deal_category_id',
				'Type' => 'select',
				'Options' => \Bitrix\Crm\Category\DealCategory::getSelectListItems()
			]
		];

		if ($documentType[2] === \CCrmOwnerType::LeadName)
		{
			$map['DisableActivityCompletion'] = [
				'Name' => GetMessage('CRM_CVTDA_DISABLE_ACTIVITY_COMPLETION'),
				'FieldName' => 'disable_activity_completion',
				'Type' => 'bool',
				'Default' => 'N'
			];
		}

		$dialog->setMap($map);

		return $dialog;
	}

	private static function getItemsList($documentType)
	{
		$items = array();

		if ($documentType[1] == 'CCrmDocumentLead')
		{
			$items = array(
				\CCrmOwnerType::DealName => GetMessage('CRM_CVTDA_DEAL'),
				\CCrmOwnerType::ContactName => GetMessage('CRM_CVTDA_CONTACT'),
				\CCrmOwnerType::CompanyName => GetMessage('CRM_CVTDA_COMPANY'),
			);
		}
		elseif ($documentType[1] == 'CCrmDocumentDeal')
		{
			$items = array(
				\CCrmOwnerType::InvoiceName => GetMessage('CRM_CVTDA_INVOICE'),
				\CCrmOwnerType::QuoteName => GetMessage('CRM_CVTDA_QUOTE'),
			);
		}

		return $items;
	}

	public static function GetPropertiesDialogValues($documentType, $activityName, &$arWorkflowTemplate, &$arWorkflowParameters, &$arWorkflowVariables, $arCurrentValues, &$arErrors)
	{
		$arErrors = Array();

		$arProperties = array(
			'Items' => $arCurrentValues['items'],
			'DealCategoryId' => $arCurrentValues['deal_category_id'],
			'DisableActivityCompletion' => $arCurrentValues['disable_activity_completion']
		);

		if (count($arErrors) > 0)
			return false;

		$arErrors = self::ValidateProperties($arProperties, new CBPWorkflowTemplateUser(CBPWorkflowTemplateUser::CurrentUser));
		if (count($arErrors) > 0)
			return false;

		$arCurrentActivity = &CBPWorkflowTemplateLoader::FindActivityByName($arWorkflowTemplate, $activityName);
		$arCurrentActivity["Properties"] = $arProperties;

		return true;
	}
}