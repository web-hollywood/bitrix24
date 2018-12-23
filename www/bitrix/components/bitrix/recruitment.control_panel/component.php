<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

$arResult['ADDITIONAL_ITEM'] = array(
	'ID' => 'MORE',
	'NAME' => GetMessage('CRM_CTRL_PANEL_ITEM_MORE'),
	'TITLE' => GetMessage('CRM_CTRL_PANEL_ITEM_MORE_TITLE'),
	'ICON' => 'more'
);

$arResult['ITEMS'] = array();

$arResult['ITEMS'][0] = array(
    'ID' => 'All Recruits',
    'MENU_ID' => 'menu_crm_start',
    'NAME' => 'All Recruits',
    'TITLE' => 'All Recruits'
);
$arResult['ITEMS'][1] = array(
    'ID' => 'Candidates',
    'MENU_ID' => 'menu_crm_start',
    'NAME' => 'Candidates',
    'TITLE' => 'Candidates'
);
$arResult['ITEMS'][2] = array(
    'ID' => 'Interview',
    'MENU_ID' => 'menu_crm_start',
    'NAME' => 'Interview',
    'TITLE' => 'Interview'
);
$arResult['ITEMS'][3] = array(
    'ID' => 'In Progress',
    'MENU_ID' => 'menu_crm_start',
    'NAME' => 'In Progress',
    'TITLE' => 'In Progress'
);
$arResult['ITEMS'][4] = array(
    'ID' => 'Signed Recruits',
    'MENU_ID' => 'menu_crm_start',
    'NAME' => 'Signed Recruits',
    'TITLE' => 'Signed Recruits'
);
$arResult['ITEMS'][5] = array(
    'ID' => 'Follow Up',
    'MENU_ID' => 'menu_crm_start',
    'NAME' => 'Follow Up',
    'TITLE' => 'Follow Up'
);
$arResult['ITEMS'][6] = array(
    'ID' => 'Not Interested',
    'MENU_ID' => 'menu_crm_start',
    'NAME' => 'Not Interested',
    'TITLE' => 'Not Interested'
);

$this->IncludeComponentTemplate();