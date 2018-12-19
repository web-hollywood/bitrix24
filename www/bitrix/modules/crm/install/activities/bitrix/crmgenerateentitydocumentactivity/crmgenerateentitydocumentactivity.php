<?
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED!==true)die();

use Bitrix\Crm\Integration\DocumentGeneratorManager;
use Bitrix\Main\Loader;
use Bitrix\Crm\Integration\DocumentGenerator\DataProvider;
use Bitrix\DocumentGenerator;

/**
 * Class CBPCrmGenerateEntityDocumentActivity
 * @property-read int TemplateId
 * @property-read string UseSubscription
 * @property-read string WithStamps
 * @property-read int DocumentId
 * @property-read string DocumentUrl
 * @property-read int DocumentPdf
 */
class CBPCrmGenerateEntityDocumentActivity
	extends CBPActivity
	implements IBPEventActivity, IBPActivityExternalEventListener
{
	public function __construct($name)
	{
		parent::__construct($name);
		$this->arProperties = array(
			'Title' => '',
			'TemplateId' => null,
			'UseSubscription' => 'N',
			'WithStamps' => '',
			'Values' => [],

			//return
			'DocumentId' => null,
			'DocumentUrl' => null,
			'DocumentPdf' => null,
		);

		$this->SetPropertiesTypes([
			'DocumentId' => ['Type' => 'int'],
			'DocumentUrl' => ['Type' => 'string'],
			'DocumentPdf' => ['Type' => 'file']
		]);
	}

	protected function ReInitialize()
	{
		parent::ReInitialize();
		$this->DocumentId = null;
		$this->DocumentUrl = null;
		$this->DocumentPdf = null;
	}

	public function Cancel()
	{
		if ($this->UseSubscription === 'Y')
		{
			$this->Unsubscribe($this);
		}

		return CBPActivityExecutionStatus::Closed;
	}

	public function Execute()
	{
		if ($this->TemplateId == null || !Loader::includeModule("crm"))
		{
			return CBPActivityExecutionStatus::Closed;
		}

		if(!DocumentGeneratorManager::getInstance()->isEnabled())
		{
			$this->WriteToTrackingService('No module documentgenerator', 0, CBPTrackingType::Error);
			return CBPActivityExecutionStatus::Closed;
		}

		list($entityTypeName, $entityId) = explode('_', $this->GetDocumentId()[2]);
		$entityTypeId = \CCrmOwnerType::ResolveID($entityTypeName);
		$providerClassName = static::getDataProviderByEntityTypeId($entityTypeId);
		if(!$providerClassName)
		{
			$this->WriteToTrackingService('Unknown Entity Type', 0, CBPTrackingType::Error);
			return CBPActivityExecutionStatus::Closed;
		}
		$templateId = $this->TemplateId;
		$template = DocumentGenerator\Template::loadById($templateId);
		if(!$template)
		{
			$this->WriteToTrackingService('Could not load template', 0, CBPTrackingType::Error);
			return CBPActivityExecutionStatus::Closed;
		}
		$template->setSourceType($providerClassName);
		$document = \Bitrix\DocumentGenerator\Document::createByTemplate($template, $entityId);
		if($this->WithStamps === 'Y')
		{
			$document->enableStamps(true);
		}
		elseif($this->WithStamps === 'N')
		{
			$document->enableStamps(false);
		}
		$result = $document->getFile();
		if(!$result->isSuccess())
		{
			$this->WriteToTrackingService(implode(',', $result->getErrorMessages()), 0, CBPTrackingType::Error);
			return CBPActivityExecutionStatus::Closed;
		}
		$documentData = $result->getData();

		$this->DocumentId = $documentData['id'];
		$result = $document->enablePublicUrl();
		if($result->isSuccess())
		{
			$this->DocumentUrl = $document->getPublicUrl();
		}

		//If don`t need to wait for PDF - close activity
		if ($this->UseSubscription !== 'Y')
		{
			return CBPActivityExecutionStatus::Closed;
		}

		//Subscribe for PDF generation event.
		$this->Subscribe($this);
		$this->WriteToTrackingService(GetMessage("CRM_GEDA_NAME_WAIT_FOR_EVENT_LOG"));
		return CBPActivityExecutionStatus::Executing;
	}

	public function Subscribe(IBPActivityExternalEventListener $eventHandler)
	{
		$schedulerService = $this->workflow->GetService("SchedulerService");
		$schedulerService->SubscribeOnEvent(
			$this->workflow->GetInstanceId(),
			$this->name,
			"documentgenerator",
			"onDocumentTransformationComplete",
			$this->DocumentId
		);

		$this->workflow->AddEventHandler($this->name, $eventHandler);
	}


	public function Unsubscribe(IBPActivityExternalEventListener $eventHandler)
	{
		$schedulerService = $this->workflow->GetService("SchedulerService");
		$schedulerService->UnSubscribeOnEvent(
			$this->workflow->GetInstanceId(),
			$this->name,
			"documentgenerator",
			"onDocumentTransformationComplete",
			$this->DocumentId
		);

		$this->workflow->RemoveEventHandler($this->name, $eventHandler);
	}

	public function OnExternalEvent($arEventParameters = array())
	{
		if($this->DocumentId != $arEventParameters[0])
		{
			return;
		}
		if ($this->executionStatus != CBPActivityExecutionStatus::Closed)
		{
			$documentData = $arEventParameters[1];
			if(empty($documentData))
			{
				$this->WriteToTrackingService('Transformation Error', 0, CBPTrackingType::Error);
				$this->Unsubscribe($this);
				$this->workflow->CloseActivity($this);
			}
			else
			{
				$bFileId = null;
				$pdfId = $documentData['pdfId'];
				if($pdfId > 0)
				{
					$bFileId = DocumentGenerator\Model\FileTable::getBFileId($pdfId);
				}
				$this->DocumentPdf = $bFileId;
				$this->WriteToTrackingService(GetMessage("CRM_GEDA_NAME_WAIT_FOR_EVENT_LOG_COMPLETE"));
				$this->Unsubscribe($this);
				$this->workflow->CloseActivity($this);
			}
		}
	}

	public function HandleFault(Exception $exception)
	{
		$status = $this->Cancel();
		if ($status == CBPActivityExecutionStatus::Canceling)
		{
			return CBPActivityExecutionStatus::Faulting;
		}

		return $status;
	}

	public static function GetPropertiesDialog($documentType, $activityName, $arWorkflowTemplate, $arWorkflowParameters, $arWorkflowVariables, $arCurrentValues = null, $formName = '', $popupWindow = null, $siteId = '')
	{
		if (!Loader::includeModule("crm"))
		{
			return '';
		}
		if(!DocumentGeneratorManager::getInstance()->isEnabled())
		{
			return GetMessage('CRM_GEDA_MODULE_DOCGEN_ERROR');
		}

		$entityTypeName = $documentType[2];
		$entityTypeId = \CCrmOwnerType::ResolveID($documentType[2]);
		$providerClassName = static::getDataProviderByEntityTypeId($entityTypeId);
		if(!$providerClassName)
		{
			return '';
		}

		$templatesList = [];
		$templates = DocumentGenerator\Model\TemplateTable::getListByClassName($providerClassName, \Bitrix\Main\Engine\CurrentUser::get()->getId());
		foreach($templates as $template)
		{
			$templatesList[$template['ID']] = $template['NAME'];
		}

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

		$dialog->setMap(array(
			'TemplateId' => array(
				'Name' => GetMessage('CRM_GEDA_NAME_TEMPLATE_ID'),
				'FieldName' => 'template_id',
				'Type' => 'select',
				'Required' => true,
				'Options' => $templatesList
			),
			'UseSubscription' => array(
				'Name' => GetMessage('CRM_GEDA_NAME_USE_SUBSCRIPTION'),
				'FieldName' => 'use_subscription',
				'Type' => 'bool',
				'Default' => 'N'
			),
			'WithStamps' => [
				'Name' => GetMessage('CRM_GEDA_NAME_WITH_STAMPS'),
				'FieldName' => 'with_stamps',
				'Type' => 'bool',
			],
		));

		return $dialog;
	}

	public static function GetPropertiesDialogValues($documentType, $activityName, &$arWorkflowTemplate, &$arWorkflowParameters, &$arWorkflowVariables, $arCurrentValues, &$errors)
	{
		$errors = [];
		$properties = [
			'TemplateId' => $arCurrentValues['template_id'],
			'UseSubscription' => ($arCurrentValues['use_subscription'] === 'Y') ? 'Y' : 'N',
			'WithStamps' => $arCurrentValues['with_stamps'],
		];

		$errors = self::ValidateProperties($properties, new CBPWorkflowTemplateUser(CBPWorkflowTemplateUser::CurrentUser));
		if (count($errors) > 0)
		{
			return false;
		}

		$activity = &CBPWorkflowTemplateLoader::FindActivityByName($arWorkflowTemplate, $activityName);
		$activity['Properties'] = $properties;

		return true;
	}

	public static function ValidateProperties($arTestProperties = array(), CBPWorkflowTemplateUser $user = null)
	{
		$arErrors = [];

		if (empty($arTestProperties['TemplateId']))
		{
			$arErrors[] = [
				"code" => "NotExist",
				"parameter" => "TemplateId",
				"message" => GetMessage("CRM_GEDA_EMPTY_TEMPLATE_ID")
			];
		}

		return array_merge($arErrors, parent::ValidateProperties($arTestProperties, $user));
	}

	/**
	 * @param int $entityTypeId
	 * @return bool|string
	 */
	protected static function getDataProviderByEntityTypeId($entityTypeId)
	{
		switch($entityTypeId)
		{
			case CCrmOwnerType::Lead:
				return DataProvider\Lead::class;
			case CCrmOwnerType::Deal:
				return DataProvider\Deal::class;
			case CCrmOwnerType::Contact:
				return DataProvider\Contact::class;
			case CCrmOwnerType::Company:
				return DataProvider\Company::class;
			case CCrmOwnerType::Invoice:
				return DataProvider\Invoice::class;
			case CCrmOwnerType::Quote:
				return DataProvider\Quote::class;
			case CCrmOwnerType::Order:
				return DataProvider\Order::class;
		}

		return false;
	}
}