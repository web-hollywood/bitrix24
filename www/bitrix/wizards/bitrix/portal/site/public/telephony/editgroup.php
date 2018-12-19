<?
require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");

IncludeModuleLangFile($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/intranet/public/telephony/editgroup.php");
require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_after.php");

$APPLICATION->SetTitle(GetMessage("VI_PAGE_EDIT_GROUP_TITLE"));

if (isset($_REQUEST['IFRAME']) && $_REQUEST['IFRAME'] == 'Y')
{
	$APPLICATION->IncludeComponent(
		'bitrix:voximplant.slider.wrapper',
		'',
		array(
			'COMPONENT_NAME' => 'bitrix:voximplant.queue.edit',
			'COMPONENT_TEMPLATE_NAME' => '',
			'COMPONENT_PARAMS' => array(
				'ID' => (int)$_REQUEST['ID'],
				'INLINE_MODE' => true
			),
		)
	);
}
else
{
	$APPLICATION->IncludeComponent(
		"bitrix:voximplant.queue.edit",
		"",
		array(
			'ID' => (int)$_REQUEST['ID']
		)
	);
}

require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");
