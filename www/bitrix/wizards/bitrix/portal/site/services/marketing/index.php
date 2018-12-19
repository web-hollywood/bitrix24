<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)
{
	die();
}

use Bitrix\Main;
use Bitrix\Sender;

if(!Main\Loader::includeModule('sender'))
{
	return;
}

if (WIZARD_INSTALL_DEMO_DATA)
{
	$ruleFields = [
		[
			"CONDITION" => "#^/marketing/letter/#",
			"RULE" => "",
			"ID" => "",
			"PATH" => "/marketing/letter.php",
		],
		[
			"CONDITION" => "#^/marketing/ads/#",
			"RULE" => "",
			"ID" => "",
			"PATH" => "/marketing/ads.php",
		],
		[
			"CONDITION" => "#^/marketing/segment/#",
			"RULE" => "",
			"ID" => "",
			"PATH" => "/marketing/segment.php",
		],
		[
			"CONDITION" => "#^/marketing/template/#",
			"RULE" => "",
			"ID" => "",
			"PATH" => "/marketing/template.php",
		],
		[
			"CONDITION" => "#^/marketing/blacklist/#",
			"RULE" => "",
			"ID" => "",
			"PATH" => "/marketing/blacklist.php",
		],
		[
			"CONDITION" => "#^/marketing/contact/#",
			"RULE" => "",
			"ID" => "",
			"PATH" => "/marketing/contact.php",
		],
		[
			"CONDITION" => "#^/marketing/rc/#",
			"RULE" => "",
			"ID" => "",
			"PATH" => "/marketing/rc.php",
		],
		[
			"CONDITION" => "#^/marketing/config/role/#",
			"RULE" => "",
			"ID" => "",
			"PATH" => "/marketing/config/role.php",
		],
	];
	foreach ($ruleFields as $fields)
	{
		$replaceFrom = '/marketing';
		$replaceTo = WIZARD_SITE_DIR . 'marketing';
		$fields['CONDITION'] = str_replace($replaceFrom, $replaceTo, $fields['CONDITION']);
		$fields['PATH'] = str_replace($replaceFrom, $replaceTo, $fields['PATH']);
		Main\UrlRewriter::add(SITE_ID, $fields);
	}
}

if (WIZARD_INSTALL_DEMO_DATA && WIZARD_SITE_ID == "s1")
{
	Sender\Security\Role\Manager::installRoles();
}