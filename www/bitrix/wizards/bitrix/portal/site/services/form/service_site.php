<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)
	die();

if(!CModule::IncludeModule("form"))
	return;

require_once("functions.php");

$formID = false;
$rsForms = CForm::GetList($by="s_id", $order="desc", Array("SID" => "WORK_SITE_" . WIZARD_SITE_ID, "arSITE" => array(WIZARD_SITE_ID)), $is_filtered);
while ($arForm = $rsForms->Fetch())
{
	$formID = $arForm["ID"]; 
}
if($formID == false && WIZARD_SITE_ID == "s1"){
	$rsForms = CForm::GetList($by="s_id", $order="desc", Array("SID" => "WORK_SITE", "arSITE" => array(WIZARD_SITE_ID)), $is_filtered);
	while ($arForm = $rsForms->Fetch())
	{
		$formID = $arForm["ID"]; 
	}
}
if($formID == false){
	$arForm = array(
		"NAME" => GetMessage("SERVICE_SITE_FORM_NAME"),
		"SID" => "WORK_SITE_" . WIZARD_SITE_ID,
		"C_SORT" => 200,
		"BUTTON" => GetMessage("SERVICE_SITE_FORM_BUTTON"),
		"DESCRIPTION" => "",
		"DESCRIPTION_TYPE" => "text",
		
		"USE_CAPTCHA" => "N",
		"USE_RESTRICTIONS" => "N",
		
		"STAT_EVENT1" => "form",
		"STAT_EVENT2" => "work_site",
		"STAT_EVENT4" => "",
		
		"arSITE" => array(WIZARD_SITE_ID),
		"arMENU" => array(),
		"arGROUP" => Array(WIZARD_EMPLOYEES_GROUP => "15", WIZARD_PERSONNEL_DEPARTMENT_GROUP => "30",WIZARD_PORTAL_ADMINISTRATION_GROUP => "30"),
	);
	
	$arFormFields = array(
		Array(
			"SID" => "DEPARTMENT",
			"REQUIRED" => "Y",
			"arANSWER" => array(
				array(
					"MESSAGE" => " ",
					"VALUE" => "",
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "text",
					"FIELD_WIDTH" => 50,
				),
			),
			"arFILTER_USER" => array("text"),
		),
		
		Array(
			"SID" => "ROOM",
			"REQUIRED" => "N",
			"arANSWER" => array(
				array(
					"MESSAGE" => " ",
					"VALUE" => "",
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "text",
					"FIELD_WIDTH" => 50,
				),
			),
			"arFILTER_USER" => array("text"),
		),
		
		Array(
			"SID" => "STOCK",
			"REQUIRED" => "Y",
			"arANSWER" => array(
				array(
					"MESSAGE" => GetMessage("STOCK_ANSWER1"),
					"VALUE" => "desk",
					"C_SORT" => 100,
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "checkbox",
				),
				array(
					"MESSAGE" => GetMessage("STOCK_ANSWER2"),
					"VALUE" => "chair",
					"C_SORT" => 200,
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "checkbox",
				),
	
				array(
					"MESSAGE" => GetMessage("STOCK_ANSWER3"),
					"VALUE" => "PC",
					"C_SORT" => 300,
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "checkbox",
				),
				array(
					"MESSAGE" => GetMessage("STOCK_ANSWER4"),
					"VALUE" => "phone",
					"C_SORT" => 400,
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "checkbox",
				),
				array(
					"MESSAGE" => GetMessage("STOCK_ANSWER5"),
					"VALUE" => "other",
					"C_SORT" => 500,
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "checkbox",
				),
			),
			
			"arFILTER_ANSWER_VALUE" => array("text", "dropdown"),
		),
	
		Array(
			"SID" => "OTHER",
			"REQUIRED" => "N",
			"arANSWER" => array(
				array(
					"MESSAGE" => " ",
					"VALUE" => "",
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "textarea",
					"FIELD_WIDTH" => 40,
					"FIELD_HEIGHT" => 10,
				),
			),
			"arFILTER_USER" => array("text"),
		),
	
		Array(
			"SID" => "DATE",
			"REQUIRED" => "N",
			"arANSWER" => array(
				array(
					"MESSAGE" => " ",
					"VALUE" => "",
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "date",
				),
			),
		),
	
		Array(
			"SID" => "COMMENT",
			"REQUIRED" => "N",
			"arANSWER" => array(
				array(
					"MESSAGE" => " ",
					"VALUE" => "",
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "textarea",
					"FIELD_WIDTH" => 40,
					"FIELD_HEIGHT" => 4,
				),
			),
		),
		
		Array(
			"SID" => "ADMIN_NOTE",
			"ADDITIONAL" => 'Y',
			"FIELD_TYPE" => "text", 
		),
	);
	
	$formID = CreateForm($arForm, $arFormFields, "service_site.php");
}
?>