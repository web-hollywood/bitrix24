<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");

$APPLICATION->IncludeComponent(
	"bitrix:tasks.iframe.popup",
	"public",
	array(),
	null,
	array("HIDE_ICONS" => "Y")
);

require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");