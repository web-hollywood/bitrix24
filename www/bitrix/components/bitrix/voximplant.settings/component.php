<?if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();

if (isset($_REQUEST['AJAX_CALL']) && $_REQUEST['AJAX_CALL'] == 'Y')
	return;

if (!CModule::IncludeModule('voximplant'))
	return;

$permissions = \Bitrix\Voximplant\Security\Permissions::createWithCurrentUser();
if(!$permissions->canPerform(\Bitrix\Voximplant\Security\Permissions::ENTITY_SETTINGS, \Bitrix\Voximplant\Security\Permissions::ACTION_MODIFY))
{
	ShowError(GetMessage('COMP_VI_ACCESS_DENIED'));
	return;
}

$account = new CVoxImplantAccount();
$arResult['SHOW_AUTOPAY'] = \Bitrix\Main\ModuleManager::isModuleInstalled('bitrix24') && !in_array($account->GetAccountLang(), array('ru', 'ua', 'kz', 'by'));

if (!(isset($arParams['TEMPLATE_HIDE']) && $arParams['TEMPLATE_HIDE'] == 'Y'))
	$this->IncludeComponentTemplate();

return $arResult;
