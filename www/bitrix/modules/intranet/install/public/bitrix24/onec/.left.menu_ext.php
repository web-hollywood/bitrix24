<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();
IncludeModuleLangFile($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/intranet/public_bitrix24/onec/.left.menu_ext.php");

if (IsModuleInstalled("rest") && \Bitrix\Main\Loader::includeModule('faceId'))
{
	if(\Bitrix\FaceId\FaceId::isAvailable())
	{
		$aMenuLinks[] = array(
			GetMessage("MENU_FACE_CARD"),
			"/onec/",
			array(),
			array(),
			""
		);
	}
}
if (IsModuleInstalled("rest"))
{
	$aMenuLinks[] = array(
		GetMessage("MENU_TRACKER"),
		"/onec/tracker/",
		array(),
		array(),
		""
	);

	$aMenuLinks[] = array(
		GetMessage("MENU_REPORT"),
		"/onec/report/",
		array(),
		array(),
		""
	);
}

$aMenuLinks[] = array(
	GetMessage("MENU_EXCHANGE"),
	"/onec/exchange/",
	array(),
	array(),
	""
);