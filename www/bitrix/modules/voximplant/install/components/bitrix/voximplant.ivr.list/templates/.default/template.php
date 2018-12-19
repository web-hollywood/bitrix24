<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) die();

CJSCore::Init("sidepanel");

$isBitrix24Template = (SITE_TEMPLATE_ID == "bitrix24");
if($isBitrix24Template)
{
	$this->SetViewTarget("pagetitle", 100);
}
?>
<div class="pagetitle-container pagetitle-align-right-container">
	<a class="webform-small-button webform-small-button-blue bx24-top-toolbar-add" href="<?=$arResult['CREATE_IVR_URL']?>">
		<span class="webform-small-button-left"></span>
		<span class="webform-small-button-icon"></span>
		<span class="webform-small-button-text"><?=GetMessage('VOX_IVR_LIST_ADD_2')?></span>
		<span class="webform-small-button-right"></span>
	</a>
</div>
<?

if($isBitrix24Template)
{
	$this->EndViewTarget();
}

$APPLICATION->IncludeComponent(
	"bitrix:main.ui.grid",
	"",
	array(
		"GRID_ID" => $arResult["GRID_ID"],
		"HEADERS" => $arResult["HEADERS"],
		"ROWS" => $arResult["ROWS"],
		"NAV_OBJECT" => $arResult["NAV_OBJECT"],
		"SORT" => $arResult["SORT"],
		"FOOTER" => array(
			array("title" => GetMessage("VOX_IVR_LIST_SELECTED"), "value" => $arResult["ROWS_COUNT"])
		),
		"AJAX_MODE" => "N",
	),
	$component, array("HIDE_ICONS" => "Y")
);
