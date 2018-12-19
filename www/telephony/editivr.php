<?
require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");

IncludeModuleLangFile($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/intranet/public/telephony/editivr.php");
require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_after.php");

$APPLICATION->SetTitle(GetMessage("VI_PAGE_EDIT_IVR_TITLE_2"));

if (isset($_REQUEST['IFRAME']) && $_REQUEST['IFRAME'] == 'Y')
{
	$APPLICATION->IncludeComponent(
		'bitrix:voximplant.slider.wrapper',
		'',
		array(
			'COMPONENT_NAME' => 'bitrix:voximplant.ivr.edit',
			'COMPONENT_TEMPLATE_NAME' => '',
			'COMPONENT_PARAMS' => array(),
		)
	);
}
else
{
	$APPLICATION->IncludeComponent(
		"bitrix:voximplant.ivr.edit",
		"",
		array()
	);
}

require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");
