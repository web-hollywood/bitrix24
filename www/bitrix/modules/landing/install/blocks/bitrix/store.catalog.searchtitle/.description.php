<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true)
{
	die();
}

use \Bitrix\Main\Localization\Loc;

return array(
	'block' =>
		array(
			'name' => Loc::getMessage('LD_BLOCK_STORE_CATALOG_ST_NAME'),
			'section' => array('store'),
			'type' => 'null',
			'html' => false
		),
	'nodes' =>
		array(
		),
	'style' => array(
	),
	'assets' => array(
		'js' => array(
			'/bitrix/components/bitrix/search.title/script.js',
		),
		'css' => array(
			'/bitrix/components/bitrix/search.title/templates/bootstrap_v4/style.css',
		),
	),
);