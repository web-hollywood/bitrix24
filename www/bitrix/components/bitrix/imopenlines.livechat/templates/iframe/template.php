<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED!==true)die();

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<?php
	/** @var CMain $APPLICATION */
	use Bitrix\Main\Localization\Loc;
	Loc::loadMessages(__FILE__);
	$APPLICATION->ShowHead();
	$APPLICATION->ShowCSS(true, true);
	$APPLICATION->ShowHeadStrings();
	$APPLICATION->ShowHeadScripts();

	$this->addExternalJs($this->GetFolder() . '/masked.js');
	$this->addExternalCss($this->GetFolder() . '/flag.css');
	?>
</head>
<body style="height: 100%;margin: 0;padding: 0; background: #fff" id="workarea-content">
	<script type="text/javascript">
	BX.ready(function(){
		BX.LiveChatBackend = new LiveChatBackend({
			'LINE_NAME': '<?=CUtil::JSEscape($arResult['LINE_NAME'])?>',
			'QUEUE': <?=$arResult["QUEUE"]? CUtil::PhpToJSObject($arResult["QUEUE"]): '[]'?>,
			'CONNECTORS': <?=$arResult["CONNECTORS"]? CUtil::PhpToJSObject($arResult["CONNECTORS"]): '[]'?>,
			'ERROR_CODE': '<?=$arResult['ERROR_CODE']?>'
		});
	});
	<?='BX.message('.\CUtil::PhpToJSObject(\Bitrix\Main\Localization\Loc::loadLanguageFile(__FILE__)).');'?>
	BX.message(
		{
			'PHONE_BASE_PATH': '<?=$this->GetFolder().'/base/'?>',
			'PHONE_BASE_LANG': '<?=LANGUAGE_ID?>',
			'DEFAULT_GUEST_NAME': '<?=htmlspecialcharsbx(\Bitrix\ImOpenLines\LiveChat::getDefaultGuestName())?>',
			'PHONE_CODE': '<?=$arResult['PHONE_CODE']?>'
		});
</script>
<?
if ($arResult['ERROR_CODE'] == '')
{
	$APPLICATION->IncludeComponent("bitrix:im.messenger", "content", Array(
		"CONTEXT" => "LINES",
		"DESIGN" => "POPUP",
		"RECENT" => "Y",
		"CURRENT_TAB" => "chat".$arResult['CHAT']['ID']
	), false, Array("HIDE_ICONS" => "Y"));
}
?>
</body>
</html>