<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

$settings = \Bitrix\Landing\Hook\Page\Settings::getDataForSite(
	isset($landing) ? $landing->getSiteId() : null
);
?>
<section class="landing-block g-pt-100 g-pb-100">
	<div class="container g-font-size-13">
		<?$APPLICATION->IncludeComponent(
			"bitrix:catalog.compare.result",
			"",
			array(
				"IBLOCK_TYPE" => "",
				"IBLOCK_ID" => $settings['IBLOCK_ID'],
				"BASKET_URL" => "#system_cart",
				"ACTION_VARIABLE" => "action_ccr",
				"PRODUCT_ID_VARIABLE" => "id",
				"SECTION_ID_VARIABLE" => "section_id",
				"FIELD_CODE" => array(),
				"PROPERTY_CODE" => array(
					0 => "ARTNUMBER",
					1 => "MANUFACTURER",
					2 => "MATERIAL",
				),
				"NAME" => "CATALOG_COMPARE_LIST",
				"CACHE_TYPE" => "A",
				"CACHE_TIME" => "36000000",
				"CACHE_GROUPS" => "N",
				"PRICE_VAT_SHOW_VALUE" => "Y",
				"ELEMENT_SORT_FIELD" => "sort",
				"ELEMENT_SORT_ORDER" => "asc",
				"DETAIL_URL" => "#system_catalogitem/#ELEMENT_CODE#/",
				"OFFERS_FIELD_CODE" => array(),
				"OFFERS_PROPERTY_CODE" => array(
					0 => "COLOR_REF",
					1 => "SIZES_SHOES",
					2 => "SIZES_CLOTHES",
				),
				"OFFERS_CART_PROPERTIES" => array(
					0 => "ARTNUMBER",
					1 => "COLOR_REF",
					2 => "SIZES_SHOES",
					3 => "SIZES_CLOTHES"
				),
				'CONVERT_CURRENCY' => "Y",
				'TEMPLATE_THEME' => "red",
				"HIDE_NOT_AVAILABLE" => $settings['HIDE_NOT_AVAILABLE'],
				"HIDE_NOT_AVAILABLE_OFFERS" => $settings['HIDE_NOT_AVAILABLE_OFFERS'],
				"PRODUCT_SUBSCRIPTION" => $settings['PRODUCT_SUBSCRIPTION'],
				"USE_PRODUCT_QUANTITY" => $settings['USE_PRODUCT_QUANTITY'],
				"DISPLAY_COMPARE" => $settings['DISPLAY_COMPARE'],
				"PRICE_CODE" => $settings['PRICE_CODE'],
				"USE_PRICE_COUNT" => $settings['USE_PRICE_COUNT'],
				"SHOW_PRICE_COUNT" => $settings['SHOW_PRICE_COUNT'],
				"CURRENCY_ID" => $settings['CURRENCY_ID'],
				"PRICE_VAT_INCLUDE" => $settings['PRICE_VAT_INCLUDE'],
				"SHOW_OLD_PRICE" => $settings['SHOW_OLD_PRICE'],
				"SHOW_DISCOUNT_PERCENT" => $settings['SHOW_DISCOUNT_PERCENT'],
				"USE_ENHANCED_ECOMMERCE" => $settings['USE_ENHANCED_ECOMMERCE'],
				"DATA_LAYER_NAME" => $settings['DATA_LAYER_NAME'],
				"BRAND_PROPERTY" => $settings['BRAND_PROPERTY']
			),
			false
		);?>
	</div>
</section>
