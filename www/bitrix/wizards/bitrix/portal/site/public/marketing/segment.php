<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");

$APPLICATION->IncludeComponent("bitrix:sender.segment", ".default", array(
	'SEF_FOLDER' => '#SITE_DIR#marketing/segment/',
	'PATH_TO_CONTACT_LIST' => '#SITE_DIR#marketing/contact/list/',
	'PATH_TO_CONTACT_IMPORT' => '#SITE_DIR#marketing/contact/import/',
	'ONLY_CONNECTOR_FILTERS' => true,
));

require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>