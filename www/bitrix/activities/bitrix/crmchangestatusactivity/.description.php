<?
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED!==true) die();

$arActivityDescription = array(
	'NAME' => GetMessage('CRM_CHANGE_STATUS_NAME'),
	'DESCRIPTION' => GetMessage('CRM_CHANGE_STATUS_DESC'),
	'TYPE' => array('activity', 'robot_activity'),
	'CLASS' => 'CrmChangeStatusActivity',
	'JSCLASS' => 'BizProcActivity',
	'CATEGORY' => array(
		'ID' => 'document',
		"OWN_ID" => 'crm',
		"OWN_NAME" => 'CRM',
	),
	'FILTER' => array(
		'INCLUDE' => array(
			['crm', 'CCrmDocumentDeal'],
			['crm', 'CCrmDocumentLead'],
			['crm', 'Bitrix\Crm\Integration\BizProc\Document\Order'],
			['crm', 'Bitrix\Crm\Integration\BizProc\Document\Invoice'],
		),
	),
	'ROBOT_SETTINGS' => array(
		'CATEGORY' => 'employee',
		'TITLE' =>  (isset($documentType) && $documentType[2] === 'DEAL') ? GetMessage('CRM_CHANGE_DEAL_STAGE_NAME') : GetMessage('CRM_CHANGE_STATUS_NAME')
	),
);