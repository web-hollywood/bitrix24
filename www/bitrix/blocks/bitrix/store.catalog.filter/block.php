<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

$editMode = \Bitrix\Landing\Landing::getEditMode();
$isSearch = isset($_REQUEST['q']) && trim($_REQUEST['q']);
$sectionId = 0;

$settings = \Bitrix\Landing\Hook\Page\Settings::getDataForSite(
	$landing ? $landing->getSiteId() : null
);

if (!$isSearch)
{
	$variables = \Bitrix\Landing\Landing::getVariables();
	$sectionCode = isset($variables['sef'][0]) ? $variables['sef'][0] : '';
	if (\Bitrix\Main\Loader::includeModule('iblock'))
	{
		$sectionId = \CIBlockFindTools::GetSectionIDByCodePath($settings['IBLOCK_ID'], $sectionCode);
	}
}
?>
<section class="landing-block g-pt-0 g-pb-0">
	<div class="bx-sidebar-block g-pt-0 g-pb-0">
		<? if ($sectionId || $editMode): ?>
			<? $APPLICATION->IncludeComponent(
				"bitrix:catalog.smart.filter",
				"bootstrap_v4",
				array(
					"IBLOCK_TYPE" => "",
					"IBLOCK_ID" => $settings['IBLOCK_ID'],
					"SECTION_ID" => $sectionId,
					"FILTER_NAME" => "arrFilter",
					"CACHE_TYPE" => "A",
					"CACHE_TIME" => "36000000",
					"CACHE_GROUPS" => "N",
					"SAVE_IN_SESSION" => "N",
					"FILTER_VIEW_MODE" => "VERTICAL",
					"XML_EXPORT" => "Y",
					"SECTION_TITLE" => "NAME",
					"SECTION_DESCRIPTION" => "DESCRIPTION",
					"HIDE_NOT_AVAILABLE" => "N",
					"TEMPLATE_THEME" => "vendor",
					"CONVERT_CURRENCY" => "N",
					"CURRENCY_ID" => "",
					"SEF_MODE" => "N",
					"SEF_RULE" => "",
					//"SEF_RULE" => "/store/catalog/#SECTION_CODE#/filter/#SMART_FILTER_PATH#/apply/"
					//"SMART_FILTER_PATH" => $arResult["VARIABLES"]["SMART_FILTER_PATH"],
					"PAGER_PARAMS_NAME" => "",
					"INSTANT_RELOAD" => "N",
					"PRICE_CODE" => $settings['PRICE_CODE'],
				),
				false
			);
			?>
		<? endif; ?>
	</div>
</section>