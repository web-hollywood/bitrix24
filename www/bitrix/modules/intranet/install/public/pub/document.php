<?
define("NO_KEEP_STATISTIC", "Y");
define("NO_AGENT_STATISTIC","Y");
define('SKIP_TEMPLATE_AUTH_ERROR', true);
define('NOT_CHECK_PERMISSIONS', true);

$siteId = '';
if(isset($_REQUEST['site_id']) && is_string($_REQUEST['site_id']))
{
	$siteId = substr(preg_replace('/[^a-z0-9_]/i', '', $_REQUEST['site_id']), 0, 2);
}
if($siteId)
{
	define('SITE_ID', $siteId);
}

require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");

global $APPLICATION;
$request = \Bitrix\Main\Application::getInstance()->getContext()->getRequest();

$APPLICATION->includeComponent(
	'bitrix:documentgenerator.view', '',
	[
		'ID' => $request->get('id'),
		'HASH' => $request->get('hash'),
	]
);

define('SKIP_TEMPLATE_B24_SIGN', \Bitrix\Main\Config\Option::get('documentgenerator', 'document_enable_public_b24_sign', 'Y') != 'Y');
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");