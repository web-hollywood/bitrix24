<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");

$APPLICATION->IncludeComponent("bitrix:sender.start", ".default", array(
	'PATH_TO_LETTER_ADD' => '#SITE_DIR#marketing/letter/edit/0/',
));

require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");