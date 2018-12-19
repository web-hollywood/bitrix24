<?
/** @global CMain $APPLICATION */

require($_SERVER['DOCUMENT_ROOT'].'/bitrix/header.php');
IncludeModuleLangFile($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/intranet/public/crm/configs/index.php");
$APPLICATION->SetTitle(GetMessage('CRM_TITLE'));

$APPLICATION->includeComponent('bitrix:crm.control_panel', '',
	array(
		'ID' => 'CONFIG',
		'ACTIVE_ITEM_ID' => ''
	),
	$component
);

$APPLICATION->includeComponent('bitrix:crm.configs', '', array('SHOW_TITLE' => 'N'), $component);

require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");
?>
