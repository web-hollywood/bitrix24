<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
IncludeModuleLangFile($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/intranet/public_bitrix24/crm/configs/exch1c/index.php");
$APPLICATION->SetTitle(GetMessage("TITLE"));

$templateName = ".default";
if ($license_name = COption::GetOptionString("main", "~controller_group_name"))
{
	$f = preg_match("/(project|tf)$/is", $license_name, $matches);
	if (strlen($matches[0]) > 0)
		$templateName = "free";
}

$APPLICATION->IncludeComponent(
	"bitrix:crm.config.exch1c",
	$templateName,
	array(
		"SEF_MODE" => "Y",
		"SEF_FOLDER" => "/crm/configs/exch1c/",
		"PATH_TO_CONFIGS_INDEX" => "/crm/configs/"
	),
	false
);?><?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>