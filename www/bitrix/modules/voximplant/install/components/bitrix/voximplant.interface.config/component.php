<?if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();
/**
 * @var $arParams array
 * @var $arResult array
 * @var $this CBitrixComponent
 * @var $APPLICATION CMain
 * @var $USER CUser
 */

if (!CModule::IncludeModule('voximplant'))
	return;

$permissions = \Bitrix\Voximplant\Security\Permissions::createWithCurrentUser();
if(!$permissions->canPerform(\Bitrix\Voximplant\Security\Permissions::ENTITY_SETTINGS,\Bitrix\Voximplant\Security\Permissions::ACTION_MODIFY))
	return false;


$arResult['INTERFACE_CHAT_OPTIONS'] = array(CVoxImplantConfig::INTERFACE_CHAT_ADD, CVoxImplantConfig::INTERFACE_CHAT_APPEND, CVoxImplantConfig::INTERFACE_CHAT_NONE);
$arResult['INTERFACE_CHAT_ACTION'] = CVoxImplantConfig::GetChatAction();

if (!(isset($arParams['TEMPLATE_HIDE']) && $arParams['TEMPLATE_HIDE'] == 'Y'))
	$this->IncludeComponentTemplate();

return $arResult;
?>