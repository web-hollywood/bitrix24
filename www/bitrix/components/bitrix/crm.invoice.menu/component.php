<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED!==true)die();

use Bitrix\Crm\Integration\DocumentGenerator;
use Bitrix\Crm\Integration\DocumentGeneratorManager;

if (!CModule::IncludeModule('crm'))
	return;

$CrmPerms = new CCrmPerms($USER->GetID());
if ($CrmPerms->HavePerm('INVOICE', BX_CRM_PERM_NONE))
	return;

$arParams['PATH_TO_INVOICE_LIST'] = CrmCheckPath('PATH_TO_INVOICE_LIST', $arParams['PATH_TO_INVOICE_LIST'], $APPLICATION->GetCurPage());
$arParams['PATH_TO_INVOICE_RECUR'] = CrmCheckPath('PATH_TO_INVOICE_RECUR', $arParams['PATH_TO_INVOICE_RECUR'], $APPLICATION->GetCurPage());
$arParams['PATH_TO_INVOICE_RECUR_SHOW'] = CrmCheckPath('PATH_TO_INVOICE_RECUR_SHOW', $arParams['PATH_TO_INVOICE_RECUR_SHOW'], $arParams['PATH_TO_INVOICE_RECUR'].'?invoice_id=#invoice_id#&show');
$arParams['PATH_TO_INVOICE_RECUR_EDIT'] = CrmCheckPath('PATH_TO_INVOICE_RECUR_EDIT', $arParams['PATH_TO_INVOICE_RECUR_EDIT'], $arParams['PATH_TO_INVOICE_RECUR'].'?invoice_id=#invoice_id#&edit');
$arParams['PATH_TO_INVOICE_RECUR_EXPOSE'] = CrmCheckPath('PATH_TO_INVOICE_RECUR_EXPOSE', $arParams['PATH_TO_INVOICE_RECUR_EXPOSE'], $APPLICATION->GetCurPage().'?invoice_id=#invoice_id#&edit&recur&expose=Y');
$arParams['PATH_TO_INVOICE_SHOW'] = CrmCheckPath('PATH_TO_INVOICE_SHOW', $arParams['PATH_TO_INVOICE_SHOW'], $APPLICATION->GetCurPage().'?invoice_id=#invoice_id#&show');
$arParams['PATH_TO_INVOICE_PAYMENT'] = CrmCheckPath('PATH_TO_INVOICE_PAYMENT', $arParams['PATH_TO_INVOICE_PAYMENT'], $APPLICATION->GetCurPage().'?invoice_id=#invoice_id#&payment');
$arParams['PATH_TO_INVOICE_EDIT'] = CrmCheckPath('PATH_TO_INVOICE_EDIT', $arParams['PATH_TO_INVOICE_EDIT'], $APPLICATION->GetCurPage().'?invoice_id=#invoice_id#&edit');

if (!isset($arParams['TYPE']))
	$arParams['TYPE'] = 'list';

if (isset($_REQUEST['copy']))
	$arParams['TYPE'] = 'copy';

$arResult['TYPE'] = $arParams['TYPE'];

$arResult['BUTTONS'] = array();
$arFields = array();

$arParams['ELEMENT_ID'] = intval($arParams['ELEMENT_ID']);

if ($arParams['TYPE'] == 'list')
{
	$bRead   = !$CrmPerms->HavePerm('INVOICE', BX_CRM_PERM_NONE, 'READ');
	$bExport = !$CrmPerms->HavePerm('INVOICE', BX_CRM_PERM_NONE, 'EXPORT') && $arParams['IS_RECURRING'] !== 'Y';
	$bImport = !$CrmPerms->HavePerm('INVOICE', BX_CRM_PERM_NONE, 'IMPORT') && $arParams['IS_RECURRING'] !== 'Y';
	$bAdd    = !$CrmPerms->HavePerm('INVOICE', BX_CRM_PERM_NONE, 'ADD');
	$bWrite  = !$CrmPerms->HavePerm('INVOICE', BX_CRM_PERM_NONE, 'WRITE');
	$bDelete = false;
}
else
{
	$arFields = CCrmInvoice::GetByID($arParams['ELEMENT_ID']);

	$arEntityAttr[$arParams['ELEMENT_ID']] = array();
	if ($arFields !== false)
		$arEntityAttr = $CrmPerms->GetEntityAttr('INVOICE', array($arParams['ELEMENT_ID']));

	$bRead   = $arFields !== false;
	$bExport = false;
	$bImport = false;
	$bAdd    = !$CrmPerms->HavePerm('INVOICE', BX_CRM_PERM_NONE, 'ADD');
	$bWrite  = $CrmPerms->CheckEnityAccess('INVOICE', 'WRITE', $arEntityAttr[$arParams['ELEMENT_ID']]);
	$bDelete = $CrmPerms->CheckEnityAccess('INVOICE', 'DELETE', $arEntityAttr[$arParams['ELEMENT_ID']]);
}

if (isset($arParams['DISABLE_EXPORT']) && $arParams['DISABLE_EXPORT'] == 'Y')
{
	$bExport = false;
}

if (!$bRead && !$bAdd && !$bWrite)
	return false;

if($arParams['TYPE'] === 'list')
{
	if ($bAdd)
	{
		$arResult['BUTTONS'][] = array(
			'TEXT' => GetMessage('INVOICE_ADD'),
			'TITLE' => GetMessage('INVOICE_ADD_TITLE'),
			'LINK' => CComponentEngine::MakePathFromTemplate($arParams['PATH_TO_INVOICE_EDIT'],
				array(
					'invoice_id' => 0
				)
			),
			//'ICON' => 'btn-new',
			'HIGHLIGHT' => true
		);
	}

//		if ($bImport)
//		{
//			$arResult['BUTTONS'][] = array(
//				'TEXT' => GetMessage('INVOICE_IMPORT'),
//				'TITLE' => GetMessage('INVOICE_IMPORT_TITLE'),
//				'LINK' => CComponentEngine::MakePathFromTemplate($arParams['PATH_TO_INVOICE_IMPORT'], array()),
//				'ICON' => 'btn-import'
//			);
//		}

		if ($bExport)
		{
			$filterParams = Bitrix\Crm\Widget\Data\InvoiceDataSource::extractDetailsPageUrlParams($_REQUEST);
			$arResult['BUTTONS'][] = array(
				'TITLE' => GetMessage('INVOICE_EXPORT_CSV_TITLE'),
				'TEXT' => GetMessage('INVOICE_EXPORT_CSV'),
				'LINK' => CHTTP::urlAddParams(
					CComponentEngine::MakePathFromTemplate($APPLICATION->GetCurPage(), array()),
					array_merge(array('type' => 'csv', 'ncc' => '1'), $filterParams)
				),
				'ICON' => 'btn-export'
			);

			$arResult['BUTTONS'][] = array(
				'TITLE' => GetMessage('INVOICE_EXPORT_EXCEL_TITLE'),
				'TEXT' => GetMessage('INVOICE_EXPORT_EXCEL'),
				'LINK' => CHTTP::urlAddParams(
					CComponentEngine::MakePathFromTemplate($APPLICATION->GetCurPage(), array()),
					array_merge(array('type' => 'excel', 'ncc' => '1'), $filterParams)
				),
				'ICON' => 'btn-export'
			);
		}

		if(count($arResult['BUTTONS']) > 1)
		{
			//Force start new bar after first button
			array_splice($arResult['BUTTONS'], 1, 0, array(array('NEWBAR' => true)));
		}

	if (empty($arParams['NAVIGATION_ITEMS']))
	{
		$arParams['NAVIGATION_ITEMS'] =	array(
			array(
				'id' => 'list',
				'name' => GetMessage('INVOICE_LIST_FILTER_NAV_BUTTON_LIST'),
				'active' =>$arParams['IS_RECURRING'] !== 'Y',
				'url' =>  $arParams['PATH_TO_INVOICE_LIST']
			),
			array(
				'id' => 'recur',
				'name' => GetMessage('INVOICE_LIST_FILTER_NAV_BUTTON_RECUR'),
				'active' => $arParams['IS_RECURRING'] === 'Y',
				'url' => $arParams['PATH_TO_INVOICE_RECUR']
			)
		);
	}

	$this->IncludeComponentTemplate();
	return;
}

if ($arParams['TYPE'] == 'show' && !empty($arParams['ELEMENT_ID']) && $arParams['IS_RECURRING'] !== 'Y')
{
	\CJSCore::init(["sidepanel", "documentpreview"]);

	/** @var DocumentGeneratorManager $documentGenerator */
	$documentGenerator = DocumentGeneratorManager::getInstance();
	$documentLinks = $documentGenerator->getPreviewList(
		DocumentGenerator\DataProvider\Invoice::class,
		$arParams['ELEMENT_ID']
	);
	if(!empty($documentLinks))
	{
		$arResult['BUTTONS'][] = [
			'CODE' => 'document',
			'TEXT' => GetMessage('INVOICE_DOCUMENT_BUTTON_TEXT'),
			'TITLE' => GetMessage('INVOICE_DOCUMENT_BUTTON_TITLE'),
			'TYPE' => 'crm-document-button',
			'ITEMS' => $documentLinks,
		];

		$documentGenerator->showSpotlight('.crm-btn-dropdown-document');
	}
	$menuItems = [];
	$paySystem = \Bitrix\Sale\PaySystem\Manager::getById($arFields['PAY_SYSTEM_ID']);
	if ($documentGenerator->isEnabled() && $paySystem['ACTION_FILE'] === 'invoicedocument')
	{
		$componentPath = \CComponentEngine::makeComponentPath('bitrix:crm.document.view');
		$componentPath = getLocalPath('components'.$componentPath.'/slider.php');

		$params = [
			'templateId' => $paySystem['PS_MODE'],
			'providerClassName' => \Bitrix\Crm\Integration\DocumentGenerator\DataProvider\Invoice::class,
			'value' => $arParams['ELEMENT_ID']
		];

		$res = Bitrix\DocumentGenerator\Model\DocumentTable::getList([
			'select' => ['ID', 'UPDATE_TIME'],
			'filter' => [
				'=ACTIVE' => 'Y',
				'=PROVIDER' => Bitrix\Crm\Integration\DocumentGenerator\DataProvider\Invoice::class,
				'=VALUE' => $arParams['ELEMENT_ID']
			],
			'order' => ['ID' => 'DESC'],
			'limit' => 1,
		]);

		if ($data = $res->fetch())
		{
			$params['documentId'] = $data['ID'];
			$params['sessid'] = bitrix_sessid();
			$params['mode'] = 'change';
		}

		$uri = new \Bitrix\Main\Web\Uri($componentPath);
		$href = $uri->addParams($params)->getLocator();

		$menuItems[] = [
			'text' => GetMessage('INVOICE_PAYMENT_HTML'),
			'title' => GetMessage('INVOICE_PAYMENT_HTML_TITLE'),
			'onclick' => 'BX.DocumentGenerator.Document.onBeforeCreate(\''.\CUtil::JSEscape($href).'\', '.
				\CUtil::PhpToJSObject(['checkNumber' => true]).');'
		];

		unset($componentPath, $params, $res, $data, $uri, $href);
	}
	elseif(strpos($paySystem['ACTION_FILE'], 'bill') !== false)
	{
		$menuItems[] = [
			'text' => GetMessage('INVOICE_PAYMENT_HTML'),
			'title' => GetMessage('INVOICE_PAYMENT_HTML_TITLE'),
			'onclick' => "var menu = BX.PopupMenu.getCurrentMenu(); ".
				"if(menu && menu.popupWindow) { menu.popupWindow.close(); } ".
				"jsUtils.OpenWindow('".CHTTP::urlAddParams(
					CComponentEngine::MakePathFromTemplate(
						$arParams['PATH_TO_INVOICE_PAYMENT'],
						array('invoice_id' => $arParams['ELEMENT_ID'])
					),
					array('PRINT' => 'Y', 'ncc' => '1'))."', 960, 600)"
		];
		$menuItems[] = [
			'text' => GetMessage('INVOICE_PAYMENT_HTML_BLANK'),
			'title' => GetMessage('INVOICE_PAYMENT_HTML_BLANK_TITLE'),
			'onclick' => "var menu = BX.PopupMenu.getCurrentMenu(); ".
				"if(menu && menu.popupWindow) { menu.popupWindow.close(); } ".
				"jsUtils.OpenWindow('".CHTTP::urlAddParams(
					CComponentEngine::MakePathFromTemplate(
						$arParams['PATH_TO_INVOICE_PAYMENT'],
						array('invoice_id' => $arParams['ELEMENT_ID'])
					),
					array('PRINT' => 'Y', 'BLANK' => 'Y', 'ncc' => '1'))."', 960, 600)"
		];

		if (is_callable(array('CSalePdf', 'isPdfAvailable')) && CSalePdf::isPdfAvailable())
		{
			$menuItems[] = [
				'text' => GetMessage('INVOICE_PAYMENT_PDF'),
				'title' => GetMessage('INVOICE_PAYMENT_PDF_TITLE'),
				'onclick' => "var menu = BX.PopupMenu.getCurrentMenu(); ".
					"if(menu && menu.popupWindow) { menu.popupWindow.close(); } ".
					"jsUtils.Redirect(null, '".CHTTP::urlAddParams(
						CComponentEngine::MakePathFromTemplate(
							$arParams['PATH_TO_INVOICE_PAYMENT'],
							array('invoice_id' => $arParams['ELEMENT_ID'])
						),
						array('pdf' => 1, 'DOWNLOAD' => 'Y', 'ncc' => '1'))."')"
			];
			$menuItems[] = [
				'text' => GetMessage('INVOICE_PAYMENT_PDF_BLANK'),
				'title' => GetMessage('INVOICE_PAYMENT_PDF_BLANK_TITLE'),
				'onclick' => "var menu = BX.PopupMenu.getCurrentMenu(); ".
					"if(menu && menu.popupWindow) { menu.popupWindow.close(); } ".
					"jsUtils.Redirect(null, '".CHTTP::urlAddParams(
						CComponentEngine::MakePathFromTemplate(
							$arParams['PATH_TO_INVOICE_PAYMENT'],
							array('invoice_id' => $arParams['ELEMENT_ID'])
						),
						array('pdf' => 1, 'DOWNLOAD' => 'Y', 'BLANK' => 'Y', 'ncc' => '1'))."')"
			];
			$menuItems[] = [
				'text' => GetMessage('INVOICE_PAYMENT_EMAIL'),
				'title' => GetMessage('INVOICE_PAYMENT_EMAIL_TITLE'),
				'onclick' => "var menu = BX.PopupMenu.getCurrentMenu(); ".
					"if(menu && menu.popupWindow) { menu.popupWindow.close(); } ".
					"onCrmInvoiceSendEmailButtClick()"
			];
		}
	}
	$menuItems[] = [
		'text' => GetMessage('INVOICE_PAYMENT_PUBLIC_LINK'),
		'title' => GetMessage('INVOICE_PAYMENT_PUBLIC_LINK_TITLE'),
		'onclick' => 'var menu = BX.PopupMenu.getCurrentMenu(); '.
			'if(menu && menu.popupWindow) { menu.popupWindow.close(); } '.
			'generateExternalLink(BX("crm_invoice_toolbar_leftMenu"))'
	];
	if (!empty($menuItems))
	{
		$arResult['BUTTONS'][] = [
			'CODE' => 'leftMenu',
			'TEXT' => GetMessage('INVOICE_LEFT_MENU_TEXT'),
			'TITLE' => GetMessage('INVOICE_LEFT_MENU_TITLE'),
			'TYPE' => 'toolbar-menu-left',
			'ITEMS' => $menuItems,
		];
	}
	unset($menuItems);

	if($bWrite)
	{
		$arResult['BUTTONS'][] = array(
			'TEXT' => GetMessage('INVOICE_EDIT'),
			'TITLE' => GetMessage('INVOICE_EDIT_TITLE'),
			'LINK' => CComponentEngine::MakePathFromTemplate($arParams['PATH_TO_INVOICE_EDIT'],
				array(
					'invoice_id' => $arParams['ELEMENT_ID']
				)
			),
			'ICON' => 'btn-edit'
		);
	}
}
elseif ($arParams['TYPE'] == 'show' && $arParams['IS_RECURRING'] === 'Y' && $bWrite)
{
	$arResult['BUTTONS'][] = array(
		'TEXT' => GetMessage('INVOICE_EDIT'),
		'TITLE' => GetMessage('INVOICE_EDIT_TITLE'),
		'LINK' => CComponentEngine::MakePathFromTemplate($arParams['PATH_TO_INVOICE_RECUR_EDIT'],
			array(
				'invoice_id' => $arParams['ELEMENT_ID']
			)
		),
		'ICON' => 'btn-edit'
	);
}

if ($arParams['TYPE'] == 'show' && $arParams['IS_RECURRING'] === 'Y' && $bAdd)
{
	$arResult['BUTTONS'][] = array(
		'TEXT' => GetMessage('INVOICE_EXPOSE'),
		'TITLE' => GetMessage('INVOICE_EXPOSE_TITLE'),
		'LINK' => CComponentEngine::MakePathFromTemplate($arParams['PATH_TO_INVOICE_RECUR_EXPOSE'],
			array(
				'invoice_id' => $arParams['ELEMENT_ID']
			)
		),
		'ICON' => 'btn-copy'
	);
}


if ($arParams['TYPE'] == 'edit' && $bRead && !empty($arParams['ELEMENT_ID']))
{
	$path = $arParams['IS_RECURRING'] === 'Y' ? $arParams['PATH_TO_INVOICE_RECUR_SHOW'] : $arParams['PATH_TO_INVOICE_SHOW'];
	$arResult['BUTTONS'][] = array(
		'TEXT' => GetMessage('INVOICE_SHOW'),
		'TITLE' => GetMessage('INVOICE_SHOW_TITLE'),
		'LINK' => CComponentEngine::MakePathFromTemplate($path,
			array(
				'invoice_id' => $arParams['ELEMENT_ID']
			)
		),
		'ICON' => 'btn-view'
	);
}

if (($arParams['TYPE'] == 'edit' || $arParams['TYPE'] == 'show') && $bAdd
	&& !empty($arParams['ELEMENT_ID']) && !isset($_REQUEST['copy']) && $arParams['IS_RECURRING'] !== 'Y')
{
	$arResult['BUTTONS'][] = array(
		'TEXT' => GetMessage('INVOICE_COPY'),
		'TITLE' => GetMessage('INVOICE_COPY_TITLE'),
		'LINK' => CHTTP::urlAddParams(CComponentEngine::MakePathFromTemplate($arParams['PATH_TO_INVOICE_EDIT'],
			array(
				'invoice_id' => $arParams['ELEMENT_ID']
			)),
			array('copy' => 1)
		),
		'ICON' => 'btn-copy'
	);
}

$qty = count($arResult['BUTTONS']);

if (!empty($arResult['BUTTONS']) && $arParams['TYPE'] == 'edit' && empty($arParams['ELEMENT_ID']))
	$arResult['BUTTONS'][] = array('SEPARATOR' => true);
elseif ($arParams['TYPE'] == 'show' && $qty > 1)
	$arResult['BUTTONS'][] = array('NEWBAR' => true);
elseif ($qty >= 3)
	$arResult['BUTTONS'][] = array('NEWBAR' => true);

if (($arParams['TYPE'] == 'edit' || $arParams['TYPE'] == 'show') && $bDelete && !empty($arParams['ELEMENT_ID']))
{
	$arResult['BUTTONS'][] = array(
		'TEXT' => GetMessage('INVOICE_DELETE'),
		'TITLE' => GetMessage('INVOICE_DELETE_TITLE'),
		'LINK' => "javascript:invoice_delete('".GetMessage('INVOICE_DELETE_DLG_TITLE')."', '".
			GetMessage('INVOICE_DELETE_DLG_MESSAGE')."', '".GetMessage('INVOICE_DELETE_DLG_BTNTITLE').
			"', '".CHTTP::urlAddParams(CComponentEngine::MakePathFromTemplate($arParams['PATH_TO_INVOICE_EDIT'],
			array(
				'invoice_id' => $arParams['ELEMENT_ID']
			)),
			array('delete' => '', 'sessid' => bitrix_sessid())
		)."')",
		'ICON' => 'btn-delete'
	);
}

//	if ($bAdd)
//	{
//		$arResult['BUTTONS'][] = array(
//			'TEXT' => GetMessage('INVOICE_ADD'),
//			'TITLE' => GetMessage('INVOICE_ADD_TITLE'),
//			'LINK' => CComponentEngine::MakePathFromTemplate($arParams['PATH_TO_INVOICE_EDIT'],
//				array(
//					'invoice_id' => 0
//				)
//			),
//			'ICON' => 'btn-new'
//		);
//	}

$this->IncludeComponentTemplate();
?>
