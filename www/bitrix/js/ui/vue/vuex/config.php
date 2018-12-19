<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

return array(
	'js' => '/bitrix/js/ui/vue/vuex/vuex.js',
	'rel' => array('ui.vue', 'main.polyfill.promise'),
	'skip_core' => true,
	'bundle_js' => 'ui_vue'.(defined('VUEJS_DEBUG') && VUEJS_DEBUG? '_debug': '')
);