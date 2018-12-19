<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
IncludeModuleLangFile($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/intranet/public_bitrix24/search/index.php");
$APPLICATION->SetTitle(GetMessage("TITLE"));
?>

<?$APPLICATION->IncludeComponent(
	"bitrix:search.page",
	"icons",
	Array(
		"AJAX_MODE" => "N", 
		"RESTART" => "N", 
		"CHECK_DATES" => "N", 
		"USE_TITLE_RANK" => "N",
		"arrFILTER" => Array(), 
		"SHOW_WHERE" => "N",
		"PAGE_RESULT_COUNT" => "50", 
		"CACHE_TYPE" => "A", 
		"CACHE_TIME" => "36000000", 
		"PAGER_SHOW_ALWAYS" => "N", 
		"PAGER_TEMPLATE" => "", 
		"SHOW_RATING" => "",
		"RATING_TYPE" => "",
		"PATH_TO_USER_PROFILE" => "/company/personal/user/#user_id#/",
		"PATH_TO_USER_EDIT" => "/company/personal/user/#user_id#/edit/",
		"AJAX_OPTION_SHADOW" => "Y", 
		"AJAX_OPTION_JUMP" => "N", 
		"AJAX_OPTION_STYLE" => "Y", 
		"AJAX_OPTION_HISTORY" => "N",
		"USE_LANGUAGE_GUESS" => (LANGUAGE_ID == "ru") ? "Y" : "N"

	)
);?>

<?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>