<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

IncludeModuleLangFile($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/intranet/public/timeman/.left.menu_ext.php");

$aMenuLinks = Array();


$aMenuLinks[] = array(
	GetMessage("TOP_MENU_ABSENCE"),
	SITE_DIR."timeman/index.php",
	array(),
	array("menu_item_id"=>"menu_absence"),
	"CBXFeatures::IsFeatureEnabled('StaffAbsence')"
);

if (IsModuleInstalled("timeman"))
{
	$aMenuLinks[] = Array(
		GetMessage("TOP_MENU_TIMEMAN"),
		SITE_DIR."timeman/timeman.php",
		Array(),
		Array("menu_item_id"=>"menu_timeman"),
		"CBXFeatures::IsFeatureEnabled('timeman')"
	);

	if (IsModuleInstalled("faceid"))
	{
		$aMenuLinks[] = array(
			'Bitrix24.Time',
			SITE_DIR."timeman/bitrix24time.php",
			array(),
			array("menu_item_id"=>"menu_bitrix24time"),
			""
		);
	}

	$aMenuLinks[] = Array(
		GetMessage("TOP_MENU_WORK_REPORT"),
		SITE_DIR."timeman/work_report.php",
		Array(),
		Array("menu_item_id"=>"menu_work_report"),
		"CBXFeatures::IsFeatureEnabled('timeman')"
	);
}

if (IsModuleInstalled("meeting"))
{
	$aMenuLinks[] = Array(
		GetMessage("TOP_MENU_MEETING"),
		SITE_DIR."timeman/meeting/",
		Array(),
		Array("menu_item_id"=>"menu_meeting"),
		"CBXFeatures::IsFeatureEnabled('Meeting')"
	);
}