<?
	require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
	$APPLICATION->SetTitle(GetMessage("RECRUIT_TITLE"));
	$APPLICATION->SetPageProperty("BodyClass", " page-one-column");

	$APPLICATION->IncludeComponent(
		'bitrix:recruitment.control_panel',
		'',
		array(
			'ID' => 'COMPANY_LIST',
			'ACTIVE_ITEM_ID' => '',
			'PATH_TO_COMPANY_LIST' => '/crm/company/',
			'PATH_TO_COMPANY_EDIT' => '/crm/company/edit/#company_id#/',
			'PATH_TO_CONTACT_LIST' => '/crm/contact/',
			'PATH_TO_CONTACT_EDIT' => '/crm/contact/edit/#contact_id#/',
			'PATH_TO_DEAL_LIST' => '/crm/deal/',
			'PATH_TO_DEAL_EDIT' => '/crm/deal/edit/#deal_id#/',
			'PATH_TO_QUOTE_LIST' => '/crm/quote/',
			'PATH_TO_QUOTE_EDIT' => '/crm/quote/edit/#quote_id#/',
			'PATH_TO_INVOICE_LIST' => '/crm/invoice/',
			'PATH_TO_INVOICE_EDIT' => '/crm/invoice/edit/#invoice_id#/',
			'PATH_TO_LEAD_LIST' => '/crm/lead/',
			'PATH_TO_LEAD_EDIT' => '/crm/lead/edit/#lead_id#/',
			'PATH_TO_REPORT_LIST' => '/crm/reports/report/',
			'PATH_TO_DEAL_FUNNEL' => '/crm/reports/',
			'PATH_TO_EVENT_LIST' => '/crm/events/',
			'PATH_TO_PRODUCT_LIST' => '/crm/product/',
			'PATH_TO_SETTINGS' => '/crm/configs/',
			'PATH_TO_SEARCH_PAGE' => '/search/index.php?where=crm'
		)
	);

	require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");
?>