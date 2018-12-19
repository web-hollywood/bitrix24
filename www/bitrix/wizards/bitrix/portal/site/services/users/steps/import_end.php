<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)
	die();

unset($_SESSION["WIZARD_USER_IMPORT_POSITION"]);

$departmentIBlockID = 0;
if (CModule::IncludeModule("iblock"))
{
	$dbIBlock = CIBlock::GetList(Array(), Array("CODE" => "departments"));
	if ($arIBlock = $dbIBlock->Fetch())
		$departmentIBlockID = $arIBlock["ID"];

	// moving all root departments into the one
	if (IntVal($departmentIBlockID) > 0)
	{
		$dbs = CIBlockSection::GetList(Array(), Array("IBLOCK_ID" => $departmentIBlockID, "SECTION_ID" => 0));
		$arRoot = array();
		while ($ars = $dbs->Fetch())
			$arRoot[] = $ars["ID"];

		if (count($arRoot) > 1)
		{
			$dbSect = CIBlockSection::GetList(array("ID" => "ASC"), array("DEPTH_LEVEL" => 1, "IBLOCK_ID" => $departmentIBlockID));
			if ($arSect = $dbSect->Fetch())
			{
				$secid = $arSect["ID"];

				foreach ($arRoot as $chsecid)
				{
					$ss = new CIBlockSection();
					$ss->Update($chsecid, Array("IBLOCK_SECTION_ID" => $secid));
				}
			}
		}

		//default department when user adding
		$dbRes = CUserTypeEntity::GetList(Array(), Array("ENTITY_ID" => "USER", "FIELD_NAME" => "UF_DEPARTMENT"));
		if ($arProp = $dbRes->Fetch())
		{
			$arProperty = array('SETTINGS' => $arProp["SETTINGS"]);

			$res_sect = CIBlockSection::GetList(array(), array("IBLOCK_ID" => $departmentIBlockID, "DEPTH_LEVEL" => 1));
			if ($res_sect_arr = $res_sect->Fetch())
				$arProperty['SETTINGS']['DEFAULT_VALUE'] = $res_sect_arr["ID"];

			$userType = new CUserTypeEntity();
			$userType->Update($arProp["ID"], $arProperty);
		}
	}
}
?>