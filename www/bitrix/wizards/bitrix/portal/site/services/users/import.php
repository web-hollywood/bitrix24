<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)
	die();

if (WIZARD_INSTALL_DEMO_STRUCTURE === false)
	return;

require_once($_SERVER["DOCUMENT_ROOT"].BX_ROOT."/modules/main/classes/general/csv_user_import.php");

//Reference to iblock
$departmentIBlockID = 0;
if (CModule::IncludeModule("iblock"))
{
	$dbIBlock = CIBlock::GetList(Array(), Array("CODE" => "departments"));
	if ($arIBlock = $dbIBlock->Fetch())
		$departmentIBlockID = $arIBlock["ID"];

	$dbSect = CIBlockSection::GetList(array(), array("DEPTH_LEVEL" => 1, "IBLOCK_ID" => $departmentIBlockID));
	if (!$dbSect->Fetch())
	{
		$company_name = COption::GetOptionString("main", "site_name", "");
		if($company_name == '')
		{
			$dbrs = CSite::GetList($o, $b, Array("DEFAULT"=>"Y"));
			if($ars = $dbrs->Fetch())
				$company_name = $ars["NAME"];

		}

		$arFields = Array(
			"NAME" => $company_name,
			"IBLOCK_ID"=>$departmentIBlockID
		);

		$ss = new CIBlockSection();
		$secid = $ss->Add($arFields);
	}
}

$csvImport = new CSVUserImport(WIZARD_SERVICE_ABSOLUTE_PATH."/users_".LANGUAGE_ID.".csv", ";");
$csvImport->IgnoreDuplicate($ignoreDuplicate = true);
if ($csvImport->IsErrorOccured())
	return;

//User groups
$userGroups = Array(2);
$dbResult = CGroup::GetList($by, $order, Array("STRING_ID" => "EMPLOYEES_".WIZARD_SITE_ID, "STRING_ID_EXACT_MATCH" => "Y"));
if ($arGroup = $dbResult->Fetch())
	$userGroups[] = $arGroup["ID"];
$csvImport->SetUserGroups($userGroups);

$csvImport->AttachUsersToIBlock($departmentIBlockID);
$csvImport->SetImageFilePath(WIZARD_SERVICE_RELATIVE_PATH."/photos/");

$csvFile =& $csvImport->GetCsvObject();
$position = (isset($_SESSION["WIZARD_USER_IMPORT_POSITION"]) && intval($_SESSION["WIZARD_USER_IMPORT_POSITION"]) > 0 ? intval($_SESSION["WIZARD_USER_IMPORT_POSITION"]) : false);
if ($position !== false)
	$csvFile->SetPos($position);

$userImportCnt = 0;
while ($csvImport->ImportUser())
{
	$userImportCnt++;

	if ($userImportCnt >= 50)
	{
		$_SESSION["WIZARD_USER_IMPORT_POSITION"] = $csvFile->GetPos();
		return;
	}
}

?>