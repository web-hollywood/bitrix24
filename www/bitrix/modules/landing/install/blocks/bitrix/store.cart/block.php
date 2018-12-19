<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

\CUtil::initJSCore(array('fx'));

$settings = \Bitrix\Landing\Hook\Page\Settings::getDataForSite(
	isset($landing) ? $landing->getSiteId() : null
);

$emptyPath = '#system_mainpage';

if (isset($landing))
{
	$syspages = \Bitrix\Landing\Syspage::get(
		$landing->getSiteId()
	);
	if (isset($syspages['catalog']))
	{
		$emptyPath = '#system_catalog';
	}
}
?>
<section class="landing-block g-pt-100 g-pb-100">
	<div class="container g-font-size-13">
		<?$APPLICATION->IncludeComponent(
			"bitrix:sale.basket.basket",
			"bootstrap_v4",
			array(
				"COUNT_DISCOUNT_4_ALL_QUANTITY" => "N",
				"COLUMNS_LIST" => array(
					"NAME",
					"DISCOUNT",
					"PRICE",
					"QUANTITY",
					"SUM",
					"DELETE",
					"DELAY",
				),
				"AJAX_MODE" => "N",
				"AJAX_OPTION_JUMP" => "N",
				"AJAX_OPTION_STYLE" => "Y",
				"AJAX_OPTION_HISTORY" => "N",
				"PATH_TO_ORDER" => "#system_order",
				"HIDE_COUPON" => "N",
				"QUANTITY_FLOAT" => "N",
				"PRICE_VAT_SHOW_VALUE" => "Y",
				"TEMPLATE_THEME" => "vendor",
				"SET_TITLE" => "N",
				"AJAX_OPTION_ADDITIONAL" => "",
				"OFFERS_PROPS" => array(
					"SIZES_SHOES",
					"SIZES_CLOTHES",
					"COLOR_REF",
				),
				"GIFTS_DETAIL_URL" => "#system_catalogitem/#ELEMENT_CODE#/",
				"PRICE_CODE" => $settings['PRICE_CODE'],
				"USE_ENHANCED_ECOMMERCE" => $settings['USE_ENHANCED_ECOMMERCE'],
				"DATA_LAYER_NAME" => $settings['DATA_LAYER_NAME'],
				"BRAND_PROPERTY" => $settings['BRAND_PROPERTY'],
				"EMPTY_BASKET_HINT_PATH" => $emptyPath,
				"DEFERRED_REFRESH" => 'N',
				"SHOW_FILTER" => 'N',
				"TOTAL_BLOCK_DISPLAY" => ['top', 'bottom'],
				"AJAX_PATH" => "/bitrix/blocks/bitrix/store.cart/ajax.php"
			),
		 	false
		);?>
	</div>
</section>
