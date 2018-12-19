<?
require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");

IncludeModuleLangFile($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/intranet/public/services/openlines/list/edit.php");
require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_after.php");

$APPLICATION->SetTitle(GetMessage("OL_PAGE_LINES_EDIT_TITLE"));
?>

<?$APPLICATION->IncludeComponent("bitrix:intranet.popup.provider",
								 "",
								 array(
									 "COMPONENT_NAME" => "bitrix:imopenlines.lines.edit",
									 "COMPONENT_TEMPLATE" => "",
									 "MODULES" => array("im")));?>

<?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>
