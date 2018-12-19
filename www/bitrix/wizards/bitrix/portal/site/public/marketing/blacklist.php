<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");

$APPLICATION->IncludeComponent("bitrix:sender.blacklist", ".default", array(
	'SEF_FOLDER' => '#SITE_DIR#marketing/blacklist/',
));

require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");