<?php

if(!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

if($arResult['ERRORS'])
{
	echo implode('<br />', $arResult['ERRORS']);
	return;
}

\Bitrix\Main\Localization\Loc::loadLanguageFile(__FILE__);

if($arResult['imageUrl'])
{
	$APPLICATION->IncludeComponent('bitrix:pdf.viewer', '', [
		'PATH' => $arResult['pdfUrl'],
		'IFRAME' => 'N',
		'WIDTH' => 1000,
		'HEIGHT' => 1200,
		'PRINT' => 'Y',
		'PRINT_URL' => $arResult['printUrl'],
	]);
}
else
{
	\CJSCore::init(["loader", "documentpreview", "sidepanel"]);
	?>
	<h2><?=\Bitrix\Main\Localization\Loc::getMessage('DOCGEN_PUBLIC_VIEW_WAIT_TRANSFORMATION');?></h2>
<script>
BX.ready(function()
{
	var options = <?=\CUtil::PhpToJSObject($arResult)?>;
	options.onReady = function(options)
	{
		location.reload();
	};
	var preview = new BX.DocumentGenerator.DocumentPreview(options);
});
</script><?
}