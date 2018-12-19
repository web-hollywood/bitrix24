<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();

use Bitrix\Main\Localization\Loc;

use Bitrix\Tasks\Util\Type;
use Bitrix\Tasks\Item;
use Bitrix\Tasks\Util\Error;

Loc::loadMessages(__FILE__);

CBitrixComponent::includeComponentClass("bitrix:tasks.base");

class TasksWidgetAccessComponent extends TasksBaseComponent
{
	protected function checkParameters()
	{
		static::tryParseStringParameter($this->arParams['ENTITY_CODE'], '');
		if($this->arParams['ENTITY_CODE'] == '')
		{
			$this->errors->add('ILLEGAL_PARAMETER.ENTITY_CODE', 'Entity code not specified');
		}

		static::tryParseBooleanParameter($this->arParams['CAN_READ'], true);
		static::tryParseBooleanParameter($this->arParams['CAN_UPDATE'], true);
		static::tryParseArrayParameter($this->arParams['USER_DATA']);

		if(!$this->arParams['CAN_READ'])
		{
			$this->errors->add('NO_READ_ACCESS', Loc::getMessage('TASKS_COMPONENT_TWR_CAN_NOT_READ'), Error::TYPE_WARNING);
		}
		else
		{
			if(!Type::isIterable($this->arParams['DATA']))
			{
				$this->arParams['DATA'] = array();
			}
		}

		foreach($this->arParams['DATA'] as $k => $item)
		{
			$legal = false;

			if($item instanceof \Bitrix\Tasks\Item\Task\Template\Access)
			{
				if($item->getGroupPrefix() == 'U')
				{
					// currently only "user" type is supported
					$legal = true;
				}
			}

			if(!$legal)
			{
				unset($this->arParams['DATA'][$k]);
			}
		}

		//_print_r($this->arParams['DATA']->export());

		return $this->errors->checkNoFatals();
	}

	protected function getData()
	{
		// get access levels
		$this->getAccessLevelData();
	}

	protected function getAuxData()
	{
		parent::getAuxData();
		$this->getMissingUserData();
	}

	protected function getAccessLevelData()
	{
		$levels = \Bitrix\Tasks\Util\User::getAccessLevelsForEntity($this->arParams['ENTITY_CODE']);
		if(!count($levels))
		{
			$this->errors->add('NO_ACCESS_LEVELS', Loc::getMessage('TASKS_COMPONENT_NO_ACCESS_LEVELS'));
		}

		$this->arResult['DATA']['LEVELS'] = $levels;
	}

	protected function getMissingUserData()
	{
		$users = array();
		foreach($this->arParams['DATA'] as $item)
		{
			if($item->getGroupPrefix() == 'U')
			{
				$users[] = $item->getGroupId();
			}
		}

		$knownUsers = $this->arParams['USER_DATA'];
		$knownUserIds = array_map(function($item){
			return $item['ID'];
		}, $knownUsers);

		$unKnownIds = array_diff($users, $knownUserIds);
		if(count($unKnownIds))
		{
			$users = \Bitrix\Tasks\Util\User::getData($unKnownIds);
			foreach($users as $user)
			{
				$knownUsers[$user['ID']] = $user;
			}
		}

		$this->arResult['AUX_DATA']['USERS'] = $knownUsers;
	}
}