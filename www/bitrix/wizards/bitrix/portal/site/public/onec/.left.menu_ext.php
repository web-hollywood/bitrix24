<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();
IncludeModuleLangFile($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/intranet/public/onec/.left.menu_ext.php");

if (IsModuleInstalled("rest") && IsModuleInstalled("faceid"))
{
	$aMenuLinks[] = array(
		GetMessage("MENU_FACE_CARD"),
		SITE_DIR."onec/",
		array(),
		array(),
		""
	);
}
if (IsModuleInstalled("rest"))
{
	$aMenuLinks[] = array(
		GetMessage("MENU_TRACKER"),
		SITE_DIR."onec/tracker/",
		array(),
		array(),
		""
	);

	$aMenuLinks[] = array(
		GetMessage("MENU_REPORT"),
		SITE_DIR."onec/report/",
		array(),
		array(),
		""
	);
}

$aMenuLinks[] = array(
	GetMessage("MENU_EXCHANGE"),
	SITE_DIR."onec/exchange/",
	array(),
	array(),
	""
);