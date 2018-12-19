<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");

$APPLICATION->IncludeComponent(
	"bitrix:crm.1c.start",
	$templateName,	
	array(
		"SEF_MODE" => "Y",
		"SEF_FOLDER" => "/onec/"		
	),
	false
);?><?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>