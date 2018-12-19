<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

return array(
	"css" => "/bitrix/js/ui/viewer/css/style.css",
	"js" => array(
		"/bitrix/js/ui/viewer/ui.viewer.item.js",
		"/bitrix/js/ui/viewer/ui.viewer.js",
	),
	'rel' => [
		'ui.actionpanel',
		'ui.buttons',
		'ui.buttons.icons',
	],
);