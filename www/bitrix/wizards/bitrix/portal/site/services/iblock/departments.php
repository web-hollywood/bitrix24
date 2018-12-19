<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)
	die();

if(!CModule::IncludeModule("iblock"))
	return;

$iblockXMLFile = WIZARD_SERVICE_RELATIVE_PATH."/xml/".LANGUAGE_ID."/departments.xml";
$iblockCode = "departments"; 
$iblockType = "structure";

$rsIBlock = CIBlock::GetList(array(), array("CODE" => $iblockCode, "TYPE" => $iblockType));
$iblockID = false; 
if ($arIBlock = $rsIBlock->Fetch())
{
	$iblockID = $arIBlock["ID"]; 
}

if($iblockID == false)
{
	$iblockID = WizardServices::ImportIBlockFromXML(
		$iblockXMLFile, 
		"departments", 
		$iblockType, 
		WIZARD_SITE_ID, 
		$permissions = Array(
			"1" => "X",
			"2" => "R",
			WIZARD_PORTAL_ADMINISTRATION_GROUP => "X",
			WIZARD_PERSONNEL_DEPARTMENT_GROUP => "W",
		)
	);
	
	if ($iblockID < 1)
		return;

	$dbRes = CUserTypeEntity::GetList(Array(), Array("ENTITY_ID" => 'USER', "FIELD_NAME" => 'UF_DEPARTMENT'));
	if ($userField = $dbRes->Fetch())
	{
		$userField['SETTINGS'] = array(
			'DISPLAY' => 'LIST',
			'LIST_HEIGHT' => '8',
			'IBLOCK_ID' => $iblockID,
			'ACTIVE_FILTER' => 'Y'
		);

		$userType = new CUserTypeEntity();
		$userType->Update($userField["ID"], $userField);
	}

	$prop = array(
		"ENTITY_ID" => "SONET_GROUP",
		"FIELD_NAME" => "UF_SG_DEPT",
		"USER_TYPE_ID" => "iblock_section",
		"MULTIPLE" => "Y",
		"SETTINGS" => array(
			'DISPLAY' => 'LIST',
			'LIST_HEIGHT' => '8',
			'IBLOCK_ID' => $iblockID,
			'ACTIVE_FILTER' => 'Y'
		)
	);

	$rsData = CUserTypeEntity::getList(array("ID" => "ASC"), array("ENTITY_ID" => $prop["ENTITY_ID"], "FIELD_NAME" => $prop["FIELD_NAME"]));
	if (!($rsData && ($arRes = $rsData->Fetch())))
	{
		$userField = array(
			"ENTITY_ID" => $prop["ENTITY_ID"],
			"FIELD_NAME" => $prop["FIELD_NAME"],
			"XML_ID" => $prop["FIELD_NAME"],
			"USER_TYPE_ID" => $prop["USER_TYPE_ID"],
			"SORT" => 100,
			"MULTIPLE" => $prop["MULTIPLE"],
			"MANDATORY" => "N",
			"SHOW_FILTER" => "N",
			"SHOW_IN_LIST" => "N",
			"EDIT_IN_LIST" => "Y",
			"IS_SEARCHABLE" => "N",
			"SETTINGS" => $prop["SETTINGS"],
		);

		$dbLangs = CLanguage::GetList(($b = ""), ($o = ""), array("ACTIVE" => "Y"));
		while ($arLang = $dbLangs->Fetch())
		{
			$messages = IncludeModuleLangFile($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/socialnetwork/install/index.php", $arLang["LID"], true);
			$userField["EDIT_FORM_LABEL"][$arLang["LID"]] = $messages["SONET_".$prop["FIELD_NAME"]."_EDIT_FORM_LABEL"];
			$userField["LIST_COLUMN_LABEL"][$arLang["LID"]] = $messages["SONET_".$prop["FIELD_NAME"]."_LIST_COLUMN_LABEL"];
			$userField["LIST_FILTER_LABEL"][$arLang["LID"]] = $messages["SONET_".$prop["FIELD_NAME"]."_LIST_FILTER_LABEL"];
		}

		$uf = new CUserTypeEntity;
		$uf->add($userField, false);
	}
	else
	{
		$dbRes = CUserTypeEntity::GetList(Array(), Array("ENTITY_ID" => 'SONET_GROUP', "FIELD_NAME" => 'UF_SG_DEPT'));
		if ($userField = $dbRes->Fetch())
		{
			$userField['SETTINGS'] = array(
				'DISPLAY' => 'LIST',
				'LIST_HEIGHT' => '8',
				'IBLOCK_ID' => $iblockID,
				'ACTIVE_FILTER' => 'Y'
			);

			$uf = new CUserTypeEntity();
			$uf->update($userField["ID"], $userField);
		}
	}

	//edit form customization
	WizardServices::SetUserOption("form", "form_section_".$iblockID, Array(
		"tabs"=>"edit1--#--".GetMessage("iblock_dep_dep")."--,--ID--#--  ID--,--DATE_CREATE--#--  ".GetMessage("iblock_dep_created")."--,--TIMESTAMP_X--#--  ".GetMessage("iblock_dep_changed")."--,--NAME--#--*".GetMessage("iblock_dep_name")."--,--IBLOCK_SECTION_ID--#--  ".GetMessage("iblock_dep_parent")."--,--UF_HEAD--#--  ".GetMessage("iblock_dep_chief")."--,--PICTURE--#--  ".GetMessage("iblock_dep_pict")."--,--DESCRIPTION--#--  ".GetMessage("iblock_dep_desc")."--;--edit2--#--".GetMessage("iblock_dep_addit")."--,--ACTIVE--#--  ".GetMessage("iblock_dep_act")."--,--SORT--#--  ".GetMessage("iblock_dep_sort")."--,--CODE--#--  ".GetMessage("iblock_dep_code")."--,--DETAIL_PICTURE--#--  ".GetMessage("iblock_dep_det_pict")."--,--edit2_csection1--#----".GetMessage("iblock_dep_userprop")."--,--USER_FIELDS_ADD--#--  ".GetMessage("iblock_dep_userprop_add")."--;--"
	), $common = true);
			
	//IBlock fields
		$iblock = new CIBlock;
		$arFields = Array(
			"CODE" => $iblockCode, 
			"XML_ID" => $iblockCode,
		);
	
	$iblock->Update($iblockID, $arFields);
}
else
{
	$arSites = array(); 
	$db_res = CIBlock::GetSite($iblockID);
	while ($res = $db_res->Fetch())
		$arSites[] = $res["LID"]; 
	if (!in_array(WIZARD_SITE_ID, $arSites))
	{
		$arSites[] = WIZARD_SITE_ID; 
		$iblock = new CIBlock;
		$iblock->Update($iblockID, array("LID" => $arSites));
	}
}	
?>