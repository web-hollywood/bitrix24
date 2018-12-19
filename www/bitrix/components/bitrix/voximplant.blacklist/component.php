<?if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();

if (!CModule::IncludeModule('voximplant'))
	return;

$permissions = \Bitrix\Voximplant\Security\Permissions::createWithCurrentUser();
if(!$permissions->canPerform(\Bitrix\Voximplant\Security\Permissions::ENTITY_SETTINGS, \Bitrix\Voximplant\Security\Permissions::ACTION_MODIFY))
	return;



$arResult["ITEMS"] = array();

$dbBlacklist = Bitrix\Voximplant\BlacklistTable::getList();
while($arBlacklist = $dbBlacklist->Fetch())
{
	$arResult["ITEMS"][] = $arBlacklist;
}

$arResult["BLACKLIST_AUTO"] = Bitrix\Main\Config\Option::get("voximplant", "blacklist_auto", "N");
$arResult["BLACKLIST_TIME"] = intval(Bitrix\Main\Config\Option::get("voximplant", "blacklist_time", 5));
$arResult["BLACKLIST_COUNT"] = intval(Bitrix\Main\Config\Option::get("voximplant", "blacklist_count", 5));

$arResult['IFRAME'] = $_REQUEST['IFRAME'] === 'Y';

$this->IncludeComponentTemplate();
?>