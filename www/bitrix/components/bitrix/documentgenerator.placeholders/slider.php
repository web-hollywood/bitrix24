<?php

//define("NOT_CHECK_PERMISSIONS", true);
//define("STOP_STATISTICS", true);
//define("NO_KEEP_STATISTIC", "Y");
//define("NO_AGENT_STATISTIC","Y");
//define("DisableEventsCheck", true);

$siteId = '';
if(isset($_REQUEST['site_id']) && is_string($_REQUEST['site_id']))
{
	$siteId = substr(preg_replace('/[^a-z0-9_]/i', '', $_REQUEST['site_id']), 0, 2);
}

if($siteId)
{
	define('SITE_ID', $siteId);
}

require($_SERVER['DOCUMENT_ROOT'].'/bitrix/header.php');

$request = \Bitrix\Main\Application::getInstance()->getContext()->getRequest();

$APPLICATION->includeComponent(
	'bitrix:documentgenerator.placeholders', '',
	[
		'MODULE' => $request->get('MODULE'),
		'TEMPLATE_ID' => $request->get('TEMPLATE_ID'),
		'PROVIDER' => $request->get('PROVIDER'),
	]
);

require($_SERVER['DOCUMENT_ROOT'].'/bitrix/footer.php');