<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

return array(
	'js' => '/bitrix/js/ui/vue/'.(defined('VUEJS_DEBUG') && VUEJS_DEBUG? 'vue-dev.js': 'vue.js'),
	'skip_core' => true,
	'bundle_js' => 'ui_vue'.(defined('VUEJS_DEBUG') && VUEJS_DEBUG? '_debug': '')
);