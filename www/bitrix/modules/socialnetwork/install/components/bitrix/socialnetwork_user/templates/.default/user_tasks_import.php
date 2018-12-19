<?php
//use Bitrix\Disk\Desktop;

if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();
$pageId = "user_tasks_import";
include("util_menu.php");
include("util_profile.php");

if (CSocNetFeatures::IsActiveFeature(SONET_ENTITY_USER, $arResult["VARIABLES"]["user_id"], "tasks") &&
	\CModule::IncludeModule('tasks'))
{
	$APPLICATION->IncludeComponent('bitrix:tasks.import', '', $arResult, $component);
}
