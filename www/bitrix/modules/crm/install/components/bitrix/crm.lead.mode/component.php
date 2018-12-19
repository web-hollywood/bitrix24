<?
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED!==true)die();

if (!CModule::IncludeModule('crm'))
{
	ShowError(GetMessage('CRM_MODULE_NOT_INSTALLED'));
	return;
}

$arResult["CURRENT_LANG"] = in_array(LANGUAGE_ID, array("ru", "en", "de", "ua")) ? LANGUAGE_ID : \Bitrix\Main\Localization\Loc::getDefaultLang(LANGUAGE_ID);
$arResult["IS_LEAD_ENABLED"] = \Bitrix\Crm\Settings\LeadSettings::isEnabled();

$arResult["IS_CRM_ADMIN"] = false;
$CrmPerms = CCrmPerms::GetCurrentUserPermissions();
if ($CrmPerms->HavePerm('CONFIG', BX_CRM_PERM_CONFIG, 'WRITE'))
{
	$arResult["IS_CRM_ADMIN"] = true;
}

$this->IncludeComponentTemplate($componentPage);
?>