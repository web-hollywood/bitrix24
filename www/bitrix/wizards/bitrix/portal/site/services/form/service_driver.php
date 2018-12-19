<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)
	die();

if(!CModule::IncludeModule("form"))
	return;

require_once("functions.php");

$formID = false;
$rsForms = CForm::GetList($by="s_id", $order="desc", Array("SID" => "DRIVER_SERVICES_" . WIZARD_SITE_ID, "arSITE" => array(WIZARD_SITE_ID)), $is_filtered);
while ($arForm = $rsForms->Fetch())
{
	$formID = $arForm["ID"]; 
}
if($formID == false && WIZARD_SITE_ID == "s1"){
	$rsForms = CForm::GetList($by="s_id", $order="desc", Array("SID" => "DRIVER_SERVICES", "arSITE" => array(WIZARD_SITE_ID)), $is_filtered);
	while ($arForm = $rsForms->Fetch())
	{
		$formID = $arForm["ID"]; 
	}
}
if($formID == false){

	$arForm = array(
		"NAME" => GetMessage("SERVICE_DRIVER_FORM_NAME"),
		"SID" => "DRIVER_SERVICES_" . WIZARD_SITE_ID,
		"C_SORT" => 200,
		"BUTTON" => GetMessage("SERVICE_DRIVER_FORM_BUTTON"),
		"DESCRIPTION" => "",
		"DESCRIPTION_TYPE" => "text",
		
		"USE_CAPTCHA" => "N",
		"USE_RESTRICTIONS" => "N",
		
		"STAT_EVENT1" => "form",
		"STAT_EVENT2" => "driver_services",
		"STAT_EVENT4" => "",
		
		"arSITE" => array(WIZARD_SITE_ID),
		"arMENU" => array(),
		"arGROUP" => Array(WIZARD_EMPLOYEES_GROUP => "15", WIZARD_PERSONNEL_DEPARTMENT_GROUP => "30",WIZARD_PORTAL_ADMINISTRATION_GROUP => "30"),
	);
	
	$arFormFields = array(
	
		Array(
			"SID" => "VEHICLE_TYPE",
			"REQUIRED" => "Y",
			"arANSWER" => array(
				array(
					"MESSAGE" => GetMessage("VEHICLE_TYPE_ANSWER1"),
					"VALUE" => "car",
					"C_SORT" => 100,
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "dropdown",
				),
				array(
					"MESSAGE" => GetMessage("VEHICLE_TYPE_ANSWER2"),
					"VALUE" => "lorry",
					"C_SORT" => 200,
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "dropdown",
				),
	
				array(
					"MESSAGE" => GetMessage("VEHICLE_TYPE_ANSWER3"),
					"VALUE" => "bus",
					"C_SORT" => 300,
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "dropdown",
				),
				array(
					"MESSAGE" => GetMessage("VEHICLE_TYPE_ANSWER4"),
					"VALUE" => "limousine",
					"C_SORT" => 400,
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "dropdown",
				),
			),
			
			"arFILTER_ANSWER_VALUE" => array("text", "dropdown"),
		),
	
		Array(
			"SID" => "DATE",
			"REQUIRED" => "Y",
			"arANSWER" => array(
				array(
					"MESSAGE" => " ",
					"VALUE" => "",
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "date",
				),
			),
			"arFILTER_USER" => array("date"),
		),
	
		Array(
			"SID" => "TIME",
			"REQUIRED" => "N",
			"arANSWER" => array(
				array(
					"MESSAGE" => " ",
					"VALUE" => "",
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "text",
				),
			),
		),
	
		Array(
			"SID" => "DESTINATION",
			"REQUIRED" => "Y",
			"arANSWER" => array(
				array(
					"MESSAGE" => " ",
					"VALUE" => "",
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "text",
				),
			),
		),
		
		Array(
			"SID" => "DURATION",
			"REQUIRED" => "N",
			"arANSWER" => array(
				array(
					"MESSAGE" => " ",
					"VALUE" => "",
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "text",
					"FIELD_WIDTH" => 3,
				),
			),
		),
	
		Array(
			"SID" => "PLACES",
			"REQUIRED" => "N",
			"arANSWER" => array(
				array(
					"MESSAGE" => " ",
					"VALUE" => "",
					"ACTIVE" => "Y",
					"FIELD_TYPE" => "text",
					"FIELD_WIDTH" => 3,
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
	
	$formID = CreateForm($arForm, $arFormFields, "service_driver.php");
}
?>