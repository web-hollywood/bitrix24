<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();

IncludeModuleLangFile($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/intranet/public_bitrix24/marketing/.left.menu.php");

$aMenuLinks = Array();

if (!\Bitrix\Main\Loader::includeModule('sender'))
{
	return;
}

if (\Bitrix\Sender\Security\Access::current()->canViewStart())
{
	$aMenuLinks[] = Array(
		GetMessage('SERVICES_MENU_MARKETING_START'),
		"#SITE_DIR#marketing/",
		Array(),
		Array(),
		""
	);
}

if (\Bitrix\Sender\Security\Access::current()->canViewLetters())
{
	$aMenuLinks[] = Array(
		GetMessage('SERVICES_MENU_MARKETING_LETTERS'),
		"#SITE_DIR#marketing/letter/",
		Array(),
		Array(),
		""
	);
}

if (\Bitrix\Sender\Security\Access::current()->canViewAds())
{
	$aMenuLinks[] = Array(
		GetMessage('SERVICES_MENU_MARKETING_ADS'),
		"#SITE_DIR#marketing/ads/",
		Array(),
		Array(),
		""
	);
}

if (\Bitrix\Sender\Security\Access::current()->canViewSegments())
{
	$aMenuLinks[] = Array(
		GetMessage('SERVICES_MENU_MARKETING_SEGMENTS'),
		"#SITE_DIR#marketing/segment/",
		Array(),
		Array(),
		""
	);
}

if (\Bitrix\Sender\Security\Access::current()->canViewRc())
{
	$aMenuLinks[] = Array(
		GetMessage('SERVICES_MENU_MARKETING_RETURN_CUSTOMER'),
		"#SITE_DIR#marketing/rc/",
		Array(),
		Array(),
		""
	);
}

if (\Bitrix\Sender\Security\Access::current()->canViewLetters())
{
	$aMenuLinks[] = Array(
		GetMessage('SERVICES_MENU_MARKETING_TEMPLATES'),
		"#SITE_DIR#marketing/template/",
		Array(),
		Array(),
		""
	);
}

if (\Bitrix\Sender\Security\Access::current()->canViewBlacklist())
{
	$aMenuLinks[] = Array(
		GetMessage('SERVICES_MENU_MARKETING_BLACKLIST'),
		"#SITE_DIR#marketing/blacklist/",
		Array(),
		Array(),
		""
	);
}

if (\Bitrix\Sender\Security\Access::current()->canViewSegments())
{
	$aMenuLinks[] = Array(
		GetMessage('SERVICES_MENU_MARKETING_CONTACT'),
		"#SITE_DIR#marketing/contact/",
		Array(),
		Array(),
		""
	);
}

if (\Bitrix\Sender\Security\Access::current()->canModifySettings())
{
	$aMenuLinks[] = Array(
		GetMessage('SERVICES_MENU_MARKETING_CONFIG'),
		"#SITE_DIR#marketing/config.php",
		Array(),
		Array(),
		""
	);
}

if (\Bitrix\Sender\Security\Access::current()->canModifySettings())
{
	$aMenuLinks[] = Array(
		GetMessage('SERVICES_MENU_MARKETING_ROLE'),
		"#SITE_DIR#marketing/config/role/",
		Array(),
		Array(),
		""
	);
}