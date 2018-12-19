<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)
	die();

//echo "WIZARD_SITE_ID=".WIZARD_SITE_ID." | ";
//echo "WIZARD_SITE_PATH=".WIZARD_SITE_PATH." | ";
//echo "WIZARD_RELATIVE_PATH=".WIZARD_RELATIVE_PATH." | ";
//echo "WIZARD_ABSOLUTE_PATH=".WIZARD_ABSOLUTE_PATH." | ";
//echo "WIZARD_TEMPLATE_ID=".WIZARD_TEMPLATE_ID." | ";
//echo "WIZARD_TEMPLATE_RELATIVE_PATH=".WIZARD_TEMPLATE_RELATIVE_PATH." | ";
//echo "WIZARD_TEMPLATE_ABSOLUTE_PATH=".WIZARD_TEMPLATE_ABSOLUTE_PATH." | ";
//echo "WIZARD_THEME_ID=".WIZARD_THEME_ID." | ";
//echo "WIZARD_THEME_RELATIVE_PATH=".WIZARD_THEME_RELATIVE_PATH." | ";
//echo "WIZARD_THEME_ABSOLUTE_PATH=".WIZARD_THEME_ABSOLUTE_PATH." | ";
//echo "WIZARD_SERVICE_RELATIVE_PATH=".WIZARD_SERVICE_RELATIVE_PATH." | ";
//echo "WIZARD_SERVICE_ABSOLUTE_PATH=".WIZARD_SERVICE_ABSOLUTE_PATH." | ";
//echo "WIZARD_IS_RERUN=".WIZARD_IS_RERUN." | ";
//die();

if (!defined("WIZARD_TEMPLATE_ID"))
	return;

function ___writeToAreasFile($fn, $text)
{
	if(file_exists($fn) && !is_writable($fn) && defined("BX_FILE_PERMISSIONS"))
		@chmod($fn, BX_FILE_PERMISSIONS);

	$fd = @fopen($fn, "wb");
	if(!$fd)
		return false;

	if(false === fwrite($fd, $text))
	{
		fclose($fd);
		return false;
	}

	fclose($fd);

	if(defined("BX_FILE_PERMISSIONS"))
		@chmod($fn, BX_FILE_PERMISSIONS);
}


function __isDefaultLogoOrText($fileName)
{
	if (!file_exists($fileName))
		return false;

	$contents = file_get_contents($fileName);

	if ($contents === false || strlen($contents) < 1)
		return true;

	return (strpos($contents, "default_logo") !== false || !preg_match("/src\s*=\s*(\S+)[ \t\r\n\/>]*/i", $contents));
}


$bitrixTemplateDir = $_SERVER["DOCUMENT_ROOT"].BX_PERSONAL_ROOT."/templates/";


if (WIZARD_TEMPLATE_ID === "bitrix24")
{
	$bTemplateDir = $bitrixTemplateDir.WIZARD_TEMPLATE_ID;
	BXClearCache(true, "/bx/user_slmenu/");
}
else
	$bTemplateDir = $bitrixTemplateDir.WIZARD_TEMPLATE_ID.'_'.WIZARD_THEME_ID;

if (WIZARD_TEMPLATE_ID === "bitrix24")
{
	CopyDirFiles(
		WIZARD_TEMPLATE_ABSOLUTE_PATH,
		$bTemplateDir,
		$rewrite = true,
		$recursive = true,
		$delete_after_copy = false
	);
}
else
{
	CopyDirFiles(
		WIZARD_TEMPLATE_ABSOLUTE_PATH,
		$bTemplateDir,
		$rewrite = true,
		$recursive = true,
		$delete_after_copy = false,
		$exclude = "themes"
	);
}

CopyDirFiles(
	$_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/intranet/install/templates/login/",
	$bitrixTemplateDir."login/",
	$rewrite = true,
	$recursive = true,
	$delete_after_copy = false
);

CopyDirFiles(
	$_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/intranet/install/templates/pub/",
	$bitrixTemplateDir."pub/",
	$rewrite = true,
	$recursive = true,
	$delete_after_copy = false
);

//wizard customization file
$bxProductConfig = array();
if(file_exists($_SERVER["DOCUMENT_ROOT"].BX_ROOT."/.config.php"))
	include($_SERVER["DOCUMENT_ROOT"].BX_ROOT."/.config.php");

if(isset($bxProductConfig["intranet_public"]["copyright"]))
	$templ_copyright = $bxProductConfig["intranet_public"]["copyright"];
else
	$templ_copyright = GetMessage("main_template_copyright");

if(WIZARD_TEMPLATE_ID=="light")
{
	CheckDirPath(WIZARD_SITE_PATH."/include/");

	___writeToAreasFile(WIZARD_SITE_PATH."/include/copyright.php", $templ_copyright);
	___writeToAreasFile(WIZARD_SITE_PATH."/include/company_name.php", COption::GetOptionString("main", "site_name", "Compamy Name", WIZARD_SITE_ID));
}
elseif (WIZARD_TEMPLATE_ID=="bitrix24")
{
	CheckDirPath(WIZARD_SITE_PATH."/include/");
	___writeToAreasFile(WIZARD_SITE_PATH."/include/company_name.php", COption::GetOptionString("main", "site_name", "Compamy Name", WIZARD_SITE_ID));
}
else
{
	CWizardUtil::ReplaceMacros(
		$bitrixTemplateDir.WIZARD_TEMPLATE_ID.'_'.WIZARD_THEME_ID.'/include_areas/company_name.php',
		array(
			"COMPANY_NAME" => COption::GetOptionString('main', 'site_name', '', WIZARD_SITE_ID),
			"SITE_DIR" => WIZARD_SITE_DIR,
		)
	);

	CWizardUtil::ReplaceMacros(
		$bitrixTemplateDir.WIZARD_TEMPLATE_ID.'/footer.php',
		array(
			"COPYRIGHT" => $templ_copyright,
		)
	);
}

//Attach template to default site
$obSite = CSite::GetList($by = "def", $order = "desc", Array("LID" => WIZARD_SITE_ID));
if ($arSite = $obSite->Fetch())
{
	$arTemplates = Array();
	$found = false;
	$foundMobile = false;
	$foundEmpty = false;
	$foundPub = false;
	$foundLanding = false;
	$current_template = "";
	$allowGuests = $wizard->GetVar("allowGuests");
	$obTemplate = CSite::GetTemplateList($arSite["LID"]);
	while($arTemplate = $obTemplate->Fetch())
	{
		if(!$found && strlen(trim($arTemplate["CONDITION"]))<=0)
		{
			$current_template = $arTemplate["TEMPLATE"];
			if (WIZARD_TEMPLATE_ID === "bitrix24")
				$arTemplate["TEMPLATE"] = WIZARD_TEMPLATE_ID;
			else
				$arTemplate["TEMPLATE"] = WIZARD_TEMPLATE_ID.'_'.WIZARD_THEME_ID;
			$found = true;
		}
		if($arTemplate["TEMPLATE"] == "login")
		{
			$foundEmpty = true;
			if($allowGuests == "Y")
				continue;
		}
		if(!$foundMobile && trim($arTemplate["CONDITION"]) == "CSite::InDir('".WIZARD_SITE_DIR."m/')")
		{
			$foundMobile = true;
		}

		if (!$foundPub && trim($arTemplate["CONDITION"]) == "CSite::InDir('".WIZARD_SITE_DIR."pub/')")
		{
			$foundPub = true;
		}

		if (!$foundLanding && trim($arTemplate["CONDITION"]) == "preg_match('#/sites/site/[\\d]+/view/[\\d]+/#', \$GLOBALS['APPLICATION']->GetCurPage(0))")
		{
			$foundLanding = true;
		}

		$arTemplates[]= $arTemplate;
	}

	if (!$found)
	{
		if (WIZARD_TEMPLATE_ID === "bitrix24")
			$arTemplates[]= Array("CONDITION" => "", "SORT" => 150, "TEMPLATE" => WIZARD_TEMPLATE_ID);
		else
			$arTemplates[]= Array("CONDITION" => "", "SORT" => 150, "TEMPLATE" => WIZARD_TEMPLATE_ID.'_'.WIZARD_THEME_ID);
	}

	if (!$foundEmpty && $allowGuests <> "Y")
		$arTemplates[]= Array("CONDITION" => "!\$GLOBALS['USER']->IsAuthorized() && \$_SERVER['REMOTE_USER']==''", "SORT" => 250, "TEMPLATE" => "login");

	if (!$foundPub)
		$arTemplates[]= Array("CONDITION" => "CSite::InDir('".WIZARD_SITE_DIR."pub/')", "SORT" => 1, "TEMPLATE" => "pub");

	if (!$foundLanding)
		$arTemplates[]= Array("CONDITION" => "preg_match('#".WIZARD_SITE_DIR."sites/site/[\\d]+/view/[\\d]+/#', \$GLOBALS['APPLICATION']->GetCurPage(0)) && \$GLOBALS['USER']->IsAuthorized()", "SORT" => 300, "TEMPLATE" => "landing24");

	$arFields = Array(
		"TEMPLATE" => $arTemplates,
		"NAME" => $arSite["NAME"],
	);
	
// for b24	
	if (
		WIZARD_TEMPLATE_ID === "bitrix24" 
		&& $current_template !== "bitrix24" 
		&& WIZARD_FIRST_INSTAL == "Y"
	)
	{
		CopyDirFiles(
			WIZARD_SITE_PATH."index.php",
			WIZARD_SITE_PATH."index_old.php",
			$rewrite = true,
			$recursive = true,
			$delete_after_copy = true
		);

		if (file_exists(WIZARD_SITE_PATH."index_b24.php"))
		{
			CopyDirFiles(
				WIZARD_SITE_PATH."index_b24.php",
				WIZARD_SITE_PATH."index.php",
				$rewrite = true,
				$recursive = true,
				$delete_after_copy = true
			);
		}
		else
		{
			$path = WIZARD_SITE_PATH."company/personal.php";
			if (file_exists($path))
			{
				$fp = fopen($path, 'r');
				$contents = fread($fp, filesize($path));
				fclose($fp);
			}
			preg_match('/\$APPLICATION->IncludeComponent\(\"bitrix:socialnetwork_user\"?.*\)[\n\s\t]*\);/si', $contents, $matches);//preg_match('<\?/\$APPLICATION->IncludeComponent\(\"bitrix:socialnetwork_user\"?.*\)[\n\s\t]*\);/si', $contents, $matches); 
			$socialnetwork_user_component = $matches[0];

			CopyDirFiles(
				WIZARD_ABSOLUTE_PATH."/site/public/".LANGUAGE_ID."/index_b24.php",
				WIZARD_SITE_PATH."index.php",
				$rewrite = true,
				$recursive = true,
				$delete_after_copy = false
			);
		}				
	}
	elseif (WIZARD_TEMPLATE_ID !== "bitrix24" && $current_template === "bitrix24"  && WIZARD_FIRST_INSTAL == "Y")
	{	
		CopyDirFiles(
			WIZARD_SITE_PATH."index.php",
			WIZARD_SITE_PATH."index_b24.php",
			$rewrite = true,
			$recursive = true,
			$delete_after_copy = true
		);
		
		CopyDirFiles(
			WIZARD_SITE_PATH."index_old.php",
			WIZARD_SITE_PATH."index.php",
			$rewrite = true,
			$recursive = true,
			$delete_after_copy = true
		);
		if (file_exists(WIZARD_SITE_PATH."crm/.top.menu_ext_old.php"))
			CopyDirFiles(
				WIZARD_SITE_PATH."crm/.top.menu_ext_old.php",
				WIZARD_SITE_PATH."crm/.top.menu_ext.php",
				$rewrite = true,
				$recursive = true,
				$delete_after_copy = true
			);
		if (file_exists(WIZARD_SITE_PATH."crm/.top.menu_old.php"))
			CopyDirFiles(
				WIZARD_SITE_PATH."crm/.top.menu_old.php",
				WIZARD_SITE_PATH."crm/.top.menu.php",
				$rewrite = true,
				$recursive = true,
				$delete_after_copy = true
			);
	}
	if (WIZARD_TEMPLATE_ID === "bitrix24")
	{
		if (file_exists(WIZARD_SITE_PATH."crm/.top.menu_ext.php"))
			CopyDirFiles(
				WIZARD_SITE_PATH."crm/.top.menu_ext.php",
				WIZARD_SITE_PATH."crm/.top.menu_ext_old.php",
				$rewrite = true,
				$recursive = true,
				$delete_after_copy = true
			);
		if (file_exists(WIZARD_SITE_PATH."crm/.top.menu.php"))
			CopyDirFiles(
				WIZARD_SITE_PATH."crm/.top.menu.php",
				WIZARD_SITE_PATH."crm/.top.menu_old.php",
				$rewrite = true,
				$recursive = true,
				$delete_after_copy = true
			);
		if (!file_exists(WIZARD_SITE_PATH.".top.menu_ext.php"))
			CopyDirFiles(
				WIZARD_ABSOLUTE_PATH."/site/public/".LANGUAGE_ID."/.top.menu_ext.php",
				WIZARD_SITE_PATH.".top.menu_ext.php",
				$rewrite = true,
				$recursive = true,
				$delete_after_copy = false
			);
		if (!file_exists(WIZARD_SITE_PATH.".left.menu.php"))
			CopyDirFiles(
				WIZARD_ABSOLUTE_PATH."/site/public/".LANGUAGE_ID."/.left.menu.php",
				WIZARD_SITE_PATH.".left.menu.php",
				$rewrite = true,
				$recursive = true,
				$delete_after_copy = false
			);
		if (!file_exists(WIZARD_SITE_PATH.".left.menu_ext.php"))
			CopyDirFiles(
				WIZARD_ABSOLUTE_PATH."/site/public/".LANGUAGE_ID."/.left.menu_ext.php",
				WIZARD_SITE_PATH.".left.menu_ext.php",
				$rewrite = true,
				$recursive = true,
				$delete_after_copy = false
			);
		if (!file_exists(WIZARD_SITE_PATH."departments/.left.menu.php"))
			CopyDirFiles(
				WIZARD_ABSOLUTE_PATH."/site/public/".LANGUAGE_ID."/departments/.left.menu.php",
				WIZARD_SITE_PATH."departments/.left.menu.php",
				$rewrite = true,
				$recursive = true,
				$delete_after_copy = false
			);
		if (!file_exists(WIZARD_SITE_PATH."departments/.left.menu_ext.php"))
			CopyDirFiles(
				WIZARD_ABSOLUTE_PATH."/site/public/".LANGUAGE_ID."/departments/.left.menu_ext.php",
				WIZARD_SITE_PATH."departments/.left.menu_ext.php",
				$rewrite = true,
				$recursive = true,
				$delete_after_copy = false
			);
		CopyDirFiles(
			WIZARD_ABSOLUTE_PATH."/site/public/".LANGUAGE_ID."/workgroups/.left.menu_ext.php",
			WIZARD_SITE_PATH."workgroups/.left.menu_ext.php",
			$rewrite = true,
			$recursive = true,
			$delete_after_copy = false
		);		
	}
//*************************************	
	$obSite = new CSite();
	$obSite->Update($arSite["LID"], $arFields);
}

COption::SetOptionString("main", "wizard_template_id", WIZARD_TEMPLATE_ID, false, WIZARD_SITE_ID);
?>