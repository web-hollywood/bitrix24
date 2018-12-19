<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED!==true)die();
global $APPLICATION;

Bitrix\Main\Page\Asset::getInstance()->addJs('/bitrix/js/main/utils.js');

if (!empty($arResult['BUTTONS']))
{
	$type = $arParams['TYPE'];
	$APPLICATION->IncludeComponent(
		'bitrix:crm.interface.toolbar',
		$type === 'list' ?  (SITE_TEMPLATE_ID === 'bitrix24' ? 'title' : '') : 'type2',
		array(
			'TOOLBAR_ID' => 'crm_invoice_toolbar',
			'BUTTONS' => $arResult['BUTTONS']
		),
		$component,
		array('HIDE_ICONS' => 'Y')
	);
}

