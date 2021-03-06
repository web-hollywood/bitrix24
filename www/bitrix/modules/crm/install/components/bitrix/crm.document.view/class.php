<?php

use Bitrix\Crm\Integration\DocumentGenerator\DataProvider\CrmEntityDataProvider;
use Bitrix\Crm\Integration\SmsManager;
use Bitrix\DocumentGenerator\Integration\Bitrix24Manager;
use Bitrix\Main\Application;
use Bitrix\Main\Localization\Loc;
use Bitrix\Main\Web\Uri;

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

if(!\Bitrix\Main\Loader::includeModule('documentgenerator'))
{
	die('Module documentgenerator is not installed');
}

class CrmDocumentViewComponent extends \Bitrix\DocumentGenerator\Components\ViewComponent
{
	public function executeComponent()
	{
		if(!$this->includeModules())
		{
			ShowError(Loc::getMessage('CRM_DOCUMENT_VIEW_COMPONENT_MODULE_ERROR'));
			return;
		}
		if($this->arParams['MODE'] === 'change' && !check_bitrix_sessid())
		{
			ShowError(Loc::getMessage('CRM_DOCUMENT_VIEW_COMPONENT_CSRF_ERROR'));
			return;
		}
		$result = $this->initDocument();
		if(!$result->isSuccess())
		{
			$this->arResult['ERRORS'] = $result->getErrorMessages();
			$this->includeComponentTemplate();
			return;
		}
		if($this->document->ID > 0 && $this->arParams['MODE'] == 'edit')
		{
			$this->arResult['FIELDS'] = $this->document->getFields([], false, true);
			$this->includeComponentTemplate('edit');
			return;
		}
		if($this->document->ID > 0 && $this->arParams['MODE'] == 'sms')
		{
			$this->arResult['smsConfig'] = [
				'ENTITY_TYPE_ID' => $this->getCrmOwnerType(),
				'ENTITY_ID' => $this->getValue(),
				'TEXT' => Loc::getMessage('CRM_DOCUMENT_VIEW_COMPONENT_SMS_TEXT', [
					'#TITLE#' => $this->document->getTitle(),
					'#LINK#' => $this->document->getPublicUrl(true)->getLocator(),
				]),
			];
			$this->includeComponentTemplate('sms');
			return;
		}
		if(!$this->document->ID && Bitrix24Manager::isEnabled() && Bitrix24Manager::isDocumentsLimitReached())
		{
			$this->includeComponentTemplate('limit');
			return;
		}
		$isNewDocument = true;
		if($this->document->ID > 0)
		{
			$isNewDocument = false;
		}
		$emptyFields = $this->document->checkFields();
		if((!empty($emptyFields) && !$this->document->ID && $this->arParams['MODE'] !== 'change') || $this->arParams['EDIT'])
		{
			$this->arResult['FIELDS'] = $this->document->getFields([], false, true);
			$this->includeComponentTemplate('edit');
			return;
		}
		if($this->arParams['MODE'] === 'change' && $this->document->ID > 0)
		{
			$result = $this->document->update($this->arParams['VALUES']);
		}
		else
		{
			$result = $this->document->getFile();
		}
		$this->arResult = $result->getData();
		if(!$result->isSuccess())
		{
			if($this->arResult['isTransformationError'] !== true)
			{
				$this->arResult['ERRORS'] = $result->getErrorMessages();
			}
		}
		if($isNewDocument)
		{
			$this->arResult['documentUrl'] = $this->getDocumentUrl();
		}
		$this->arResult['values'] = $this->arParams['VALUES'];
		$this->arResult['emailCommunication'] = $this->getEmailCommunication();
		if(\Bitrix\DocumentGenerator\Driver::getInstance()->getDefaultStorage() instanceof \Bitrix\DocumentGenerator\Storage\Disk)
		{
			$this->arResult['storageTypeID'] = \Bitrix\Crm\Integration\StorageType::Disk;
			$this->arResult['emailDiskFile'] = $this->getEmailDiskFile(!$result->isSuccess());
		}
		$this->arResult['editTemplateUrl'] = $this->getEditTemplateUrl();
		if($this->arResult['editTemplateUrl'])
		{
			$this->arResult['editDocumentUrl'] = $this->getEditDocumentUrl();
		}
		$this->arResult['sendSmsUrl'] = $this->getSendSmsUrl();
		/** @var CrmEntityDataProvider $provider */
		$provider = $this->document->getProvider();
		if($provider)
		{
			$this->arResult['PROVIDER'] = get_class($provider);
			$this->arResult['editMyCompanyRequisitesUrl'] = $provider->getMyCompanyEditUrl(false);
		}
		else
		{
			$this->arResult['PROVIDER'] = '';
			$this->arResult['editMyCompanyRequisitesUrl'] = '';
		}
		$this->arResult['TEMPLATE_NAME'] = '';
		$this->arResult['TEMPLATE_CODE'] = '';
		if($this->template)
		{
			$this->arResult['TEMPLATE_NAME'] = $this->template->NAME;
			$this->arResult['TEMPLATE_CODE'] = $this->template->CODE;
		}

		$this->includeComponentTemplate();
	}

	/**
	 * @return string
	 */
	protected function getModule()
	{
		return 'crm';
	}

	/**
	 * @return string
	 */
	protected function getEditDocumentUrl()
	{
		$uri = new Uri(Application::getInstance()->getContext()->getRequest()->getRequestUri());
		return $uri->deleteParams(['mode', 'templateId', 'values', 'value', 'provider'])->addParams(['documentId' => $this->document->ID, 'mode' => 'edit'])->getLocator();
	}

	/**
	 * @return CrmEntityDataProvider|false
	 */
	protected function getCrmDataProvider()
	{
		if($this->document)
		{
			$provider = $this->document->getProvider();
			if($provider instanceof CrmEntityDataProvider)
			{
				return $provider;
			}
		}

		return false;
	}

	/**
	 * @return array
	 */
	protected function getEmailCommunication()
	{
		$result = [];

		$provider = $this->getCrmDataProvider();
		if($provider)
		{
			$result = $provider->getEmailCommunication();
		}

		return $result;
	}

	/**
	 * @return int
	 */
	public function getCrmOwnerType()
	{
		$result = 0;

		$provider = $this->getCrmDataProvider();
		if($provider)
		{
			$result = $provider->getCrmOwnerType();
		}

		return $result;
	}

	/**
	 * @param bool $docx
	 * @return int
	 */
	protected function getEmailDiskFile($docx = false)
	{
		$result = 0;

		if($this->document)
		{
			$result = $this->document->getEmailDiskFile($docx);
		}

		return $result;
	}

	/**
	 * @return bool
	 */
	protected function isSmsEnabled()
	{
		if(!SmsManager::canSendMessage())
		{
			return false;
		}

		$phones = SmsManager::getEntityPhoneCommunications($this->getCrmOwnerType(), $this->getValue());
		return !empty($phones);
	}

	/**
	 * @return string
	 * @throws \Bitrix\Main\SystemException
	 */
	protected function getSendSmsUrl()
	{
		if($this->isSmsEnabled())
		{
			$uri = new Uri(Application::getInstance()->getContext()->getRequest()->getRequestUri());
			return $uri->deleteParams(['mode', 'templateId', 'values', 'value', 'provider'])->addParams(['documentId' => $this->document->ID, 'mode' => 'sms'])->getLocator();
		}

		return '';
	}

	/**
	 * @return string
	 */
	protected function getDocumentUrl()
	{
		$uri = new Uri(Application::getInstance()->getContext()->getRequest()->getRequestUri());
		return $uri->deleteParams(['mode', 'templateId', 'values', 'value', 'provider'])->addParams(['documentId' => $this->document->ID])->getLocator();
	}
}