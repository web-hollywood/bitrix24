<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");

$APPLICATION->IncludeComponent("bitrix:sender.rc", ".default", array(
	'SEF_FOLDER' => '#SITE_DIR#marketing/rc/',
	'PATH_TO_SEGMENT_ADD' => '#SITE_DIR#marketing/segment/edit/0/',
	'PATH_TO_SEGMENT_EDIT' => '#SITE_DIR#marketing/segment/edit/#id#/',
));

require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");