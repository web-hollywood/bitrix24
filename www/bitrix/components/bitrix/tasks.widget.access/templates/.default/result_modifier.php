<?

use Bitrix\Main\Localization\Loc;
use Bitrix\Tasks\Util\Type;

if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) die();

// create template controller with js-dependency injections
$arResult['HELPER'] = $helper = require(dirname(__FILE__).'/helper.php');

if ($helper->checkHasFatals())
{
	return;
}

$this->__component->tryParseStringParameter($arParams['INPUT_PREFIX'], '');

$data = array();
foreach($arParams['DATA'] as $item)
{
	if(!array_key_exists($item['TASK_ID'], $arResult['DATA']['LEVELS']))
	{
		// unknown level
		continue;
	}

	$rule = $item->export();
	$rule['TITLE'] = $arResult['DATA']['LEVELS'][$item['TASK_ID']]['TITLE'];
	$rule['MEMBER_ID'] = $item->getGroupId();

	if(array_key_exists($item->getGroupId(), $arResult['AUX_DATA']['USERS']))
	{
		$rule['DISPLAY'] = \Bitrix\Tasks\Util\User::formatName($arResult['AUX_DATA']['USERS'][$item->getGroupId()]);
	}
	else
	{
		$rule['DISPLAY'] = 'Unknown';
	}

	$rule['VALUE'] = Bitrix\Tasks\Util::hashCode(rand(100, 999).rand(100, 999));
	$rule['ITEM_SET_INVISIBLE'] = '';

	$data[] = $rule;
}

$arResult['TEMPLATE_DATA']['URL'] = \Bitrix\Tasks\UI::convertActionPathToBarNotation(
	$helper->getComponent()->findParameterValue('PATH_TO_USER_PROFILE'),
	array('user_id' => 'MEMBER_ID')
);
$arResult['JS_DATA'] = array(
	'data' => $data,
	'levels' => array_map(function($item){
		return array(
			'ID' => $item['ID'],
			'TITLE' => $item['TITLE'],
		);
	}, $arResult['DATA']['LEVELS']),
);