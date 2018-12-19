<?php
use Bitrix\Disk\Configuration;
use Bitrix\Disk\Internals\BaseComponent;
use Bitrix\Disk\Document\DocumentHandler;
use Bitrix\Disk\Ui;

if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();

class CDiskUfVersionComponent extends BaseComponent
{
	protected function prepareParams()
	{
		if(!empty($this->arParams['DISABLE_LOCAL_EDIT']))
		{
			$this->arParams['DISABLE_LOCAL_EDIT'] = true;
		}
		else
		{
			$this->arParams['DISABLE_LOCAL_EDIT'] = null;
		}

		return $this;
	}

	protected function processActionDefault()
	{
		$this->arResult = array(
			'ONLY_HEAD_VERSION' => !Configuration::isEnabledKeepVersion(),
			'VERSIONS' => $this->loadData(),
			'UID' => randString(5),
		);

		$this->includeComponentTemplate();
	}

	private function loadData()
	{
		if(empty($this->arParams['PARAMS']['arUserField']))
		{
			return array();
		}
		$userId = $this->getUser()->getId();
		$values = $this->arParams['PARAMS']['arUserField']['VALUE'];
		if(!is_array($this->arParams['PARAMS']['arUserField']['VALUE']))
		{
			$values = array($values);
		}
		$urlManager = \Bitrix\Disk\Driver::getInstance()->getUrlManager();
		$isEnabledObjectLock = Configuration::isEnabledObjectLock();

		$versions = array();
		foreach($values as $value)
		{
			$attachedObjectId = (int)$value;
			if($attachedObjectId <= 0)
			{
				continue;
			}
			/** @var \Bitrix\Disk\AttachedObject $attachedModel */
			$attachedModel = \Bitrix\Disk\AttachedObject::loadById($attachedObjectId, array('VERSION.OBJECT'));
			if(!$attachedModel)
			{
				continue;
			}
			$version = $attachedModel->getVersion();
			if(!$version)
			{
				continue;
			}
			$extension = $version->getExtension();

			$additionalParams = array(
				'version' => $version->getGlobalContentVersion(),
				'canUpdate' => $attachedModel->canUpdate($userId),
				'showStorage' => false,
				'externalId' => false,
				'relativePath' => false,
			);
			$versionData = array(
				'ID' => $attachedModel->getId(),
				'NAME' => $version->getName(),
				'CONVERT_EXTENSION' => DocumentHandler::isNeedConvertExtension($extension),
				'EDITABLE' => DocumentHandler::isEditable($extension),
				'CAN_UPDATE' => $attachedModel->canUpdate($userId),
				'FROM_EXTERNAL_SYSTEM' => $version->getObject()->getContentProvider() && $version->getObject()->getCreatedBy() == $userId,
				'EXTENSION' => $extension,
				'SIZE' => \CFile::formatSize($version->getSize()),
				'HISTORY_URL' => $urlManager->getUrlUfController('history', array('attachedId' => $attachedModel->getId())),
				'DOWNLOAD_URL' => $urlManager->getUrlUfController('download', array('attachedId' => $attachedModel->getId())),
				'COPY_TO_ME_URL' => $urlManager->getUrlUfController('copyTome', array('attachedId' => $attachedModel->getId())),
				'VIEW_URL' => $urlManager->getUrlToShowAttachedFileByService($attachedModel->getId(), 'gvdrive'),
				'EDIT_URL' => $urlManager->getUrlToStartEditUfFileByService($attachedModel->getId(), 'gdrive'),
				'GLOBAL_CONTENT_VERSION' => $version->getGlobalContentVersion(),
			);

			if($isEnabledObjectLock && $version->getObject()->getLock())
			{
				$objectLock = $version->getObject()->getLock();
				$versionData['CREATED_BY'] = $objectLock->getCreatedBy();
				$versionData['IS_LOCKED'] = true;
				$versionData['IS_LOCKED_BY_SELF'] = $this->getUser()->getId() == $objectLock->getCreatedBy();

				$additionalParams['lockedBy'] = $objectLock->getCreatedBy();
			}
			$versionData['ATTRIBUTES_FOR_VIEWER'] = Ui\Viewer::getAttributesByAttachedObject($attachedModel, $additionalParams);

			$versions[] = $versionData;
		}
		unset($value);

		return $versions;
	}
}