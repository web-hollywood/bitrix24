<?if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();

if (isset($_REQUEST['AJAX_CALL']) && $_REQUEST['AJAX_CALL'] == 'Y')
	return;

if (!CModule::IncludeModule('voximplant'))
	return;

$permissions = \Bitrix\Voximplant\Security\Permissions::createWithCurrentUser();
if(!$permissions->canPerform(\Bitrix\Voximplant\Security\Permissions::ENTITY_LINE, \Bitrix\Voximplant\Security\Permissions::ACTION_MODIFY))
	return;

$arResult = Array();

$arResult['LIST_RENT_NUMBERS'] = Array();
$res = Bitrix\Voximplant\ConfigTable::getList(Array(
	'filter' => Array('=PORTAL_MODE' => CVoxImplantConfig::MODE_RENT)
));
while ($row = $res->fetch())
{
	$arResult['LIST_RENT_NUMBERS'][$row['ID']] = Array(
		'PHONE_NAME' => htmlspecialcharsbx($row['PHONE_NAME']),
		'TO_DELETE' => $row['TO_DELETE'] == 'Y',
	);
}

$viAccount = new CVoxImplantAccount();
$arResult['ACCOUNT_NAME'] = str_replace('.bitrixphone.com', '', $viAccount->GetAccountName());
$arResult['ACCOUNT_LANG'] = $viAccount->GetAccountLang();
$arResult['ORDER_STATUS'] = CVoxImplantPhoneOrder::GetStatus();

$arResult['IFRAME'] = $_REQUEST['IFRAME'] === 'Y';

if (!(isset($arParams['TEMPLATE_HIDE']) && $arParams['TEMPLATE_HIDE'] == 'Y'))
	$this->IncludeComponentTemplate();

return $arResult;
?>