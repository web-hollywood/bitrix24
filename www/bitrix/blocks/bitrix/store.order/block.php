<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

use \Bitrix\Main\Localization\Loc;
Loc::loadMessages(Bitrix\Main\Application::getDocumentRoot().'/bitrix/blocks/bitrix/store.order/block.php');

$settings = \Bitrix\Landing\Hook\Page\Settings::getDataForSite(
	isset($landing) ? $landing->getSiteId() : null
);

$emptyPath = '#system_mainpage';

if (isset($landing))
{
	$syspages = \Bitrix\Landing\Syspage::get(
		$landing->getSiteId(),
		true
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
			"bitrix:sale.order.ajax",
			"bootstrap_v4",
			array(
				"PAY_FROM_ACCOUNT" => "Y",
				"ONLY_FULL_PAY_FROM_ACCOUNT" => "N",
				"COUNT_DELIVERY_TAX" => "N",
				"ALLOW_AUTO_REGISTER" => "Y",
				"SEND_NEW_USER_NOTIFY" => "Y",
				"DELIVERY_NO_AJAX" => "N",
				"TEMPLATE_LOCATION" => "popup",
				"PATH_TO_BASKET" => "#system_cart",
				"PATH_TO_PERSONAL" => "#system_personal",
				"PATH_TO_PAYMENT" => "#system_payment",
				"PATH_TO_ORDER" => "#system_personal?SECTION=orders",
				"SET_TITLE" => "N" ,
				"DELIVERY_NO_SESSION" => "Y",
				"COMPATIBLE_MODE" => "N",
				"BASKET_POSITION" => "before",
				"BASKET_IMAGES_SCALING" => "adaptive",
				"SERVICES_IMAGES_SCALING" => "adaptive",
				"DISABLE_BASKET_REDIRECT" => "Y",
				"SHOW_DISCOUNT_PERCENT" => $settings['SHOW_DISCOUNT_PERCENT'],
				"USE_ENHANCED_ECOMMERCE" => $settings['USE_ENHANCED_ECOMMERCE'],
				"DATA_LAYER_NAME" => $settings['DATA_LAYER_NAME'],
				"BRAND_PROPERTY" => $settings['BRAND_PROPERTY'],
				"HIDE_DETAIL_PAGE_URL" => "Y",
				"EMPTY_BASKET_HINT_PATH" => $emptyPath,
				"HIDE_ORDER_DESCRIPTION" => "Y",
				"USE_CUSTOM_MAIN_MESSAGES" => "Y",
				"MESS_REGION_BLOCK_NAME" => Loc::getMessage('LANDING_BLOCK_STORE_ORDER--REGION_NAME'),
			),
			false
		);?>
	</div>
</section>
