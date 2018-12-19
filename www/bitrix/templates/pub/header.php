<?php

if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();

\Bitrix\Main\Localization\Loc::loadMessages(__FILE__);
\Bitrix\Main\Localization\Loc::loadMessages(dirname(__FILE__)."/footer.php");

CUtil::initJSCore(array('ajax', 'popup'));

?><!DOCTYPE html>
<html>
<head>
<meta name="robots" content="noindex, nofollow, noarchive">
<?
$APPLICATION->showHead();
$APPLICATION->setAdditionalCSS("/bitrix/templates/bitrix24/interface.css", true);
\Bitrix\Main\Page\Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/template_scripts.js", true);
?>
<title><? $APPLICATION->showTitle(); ?></title>
</head>

<body class="<?$APPLICATION->showProperty("BodyClass")?>">
<?
/*
This is commented to avoid Project Quality Control warning
$APPLICATION->ShowPanel();
*/
?>

<table class="main-wrapper">
	<tr>
		<td class="main-wrapper-content-cell">
			<div class="content-wrap">
				<div class="content">
					<h1 class="main-title">
					<? if (isModuleInstalled('bitrix24')) : ?>
						<? if ($clientLogo = COption::getOptionString('bitrix24', 'client_logo', '')) : ?>
						<img class="intranet-pub-title-user-logo" src="<?=CFile::getPath($clientLogo); ?>">
						<? else : ?>
						<span class="main-title-inner"><?=htmlspecialcharsbx(COption::getOptionString('bitrix24', 'site_title', '')); ?></span>
						<? if (COption::getOptionString('bitrix24', 'logo24show', 'Y') !== 'N') : ?><span class="title-num">24</span><? endif; ?>
						<? endif; ?>
					<? else : ?>
						<? if ($logoID = COption::getOptionString('main', 'wizard_site_logo', '', SITE_ID)) : ?>
						<? $APPLICATION->includeComponent(
							'bitrix:main.include', '',
							array('AREA_FILE_SHOW' => 'file', 'PATH' => SITE_DIR.'include/company_name.php')
						); ?>
						<? else : ?>
						<span class="main-title-inner"><?=htmlspecialcharsbx(COption::getOptionString('main', 'site_name', '')); ?></span>
						<span class="title-num">24</span>
						<? endif; ?>
					<? endif; ?>
					</h1>
