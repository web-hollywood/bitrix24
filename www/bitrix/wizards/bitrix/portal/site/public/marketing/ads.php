<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");

$APPLICATION->IncludeComponent("bitrix:sender.ads", ".default", array(
	'SEF_FOLDER' => '#SITE_DIR#marketing/ads/',
	'PATH_TO_SEGMENT_ADD' => '#SITE_DIR#marketing/segment/edit/0/',
	'PATH_TO_SEGMENT_EDIT' => '#SITE_DIR#marketing/segment/edit/#id#/',
	'IS_ADS' => 'Y',
));

require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");