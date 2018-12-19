<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();
$APPLICATION->SetAdditionalCSS("/bitrix/components/bitrix/voximplant.main/templates/.default/telephony.css");

$APPLICATION->IncludeComponent("bitrix:voximplant.documents", "", array());

$APPLICATION->IncludeComponent("bitrix:voximplant.lines.default", "", array());

$APPLICATION->IncludeComponent("bitrix:voximplant.settings.backupline", "", array());

$APPLICATION->IncludeComponent("bitrix:voximplant.interface.config", "", array());

$APPLICATION->IncludeComponent("bitrix:voximplant.settings.crm", "", array());

$APPLICATION->IncludeComponent("bitrix:voximplant.settings.combinations", "", array());

if($arResult['SHOW_AUTOPAY'])
{
	$APPLICATION->IncludeComponent("bitrix:voximplant.autopayment", "", array());
}

$APPLICATION->IncludeComponent("bitrix:voximplant.blacklist", "", array());
?>

