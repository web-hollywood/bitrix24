<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) die();
$this->addExternalJs('/bitrix/js/imopenlines/livechat.js');
$this->addExternalCss('/bitrix/js/imopenlines/livechat.css');
$this->addExternalCss('/bitrix/js/imconnector/icon.css');

if($arResult['CUSTOMIZATION']['CSS_PATH'])
{
	$this->addExternalCss($arResult['CUSTOMIZATION']['CSS_PATH']);
}

$APPLICATION->SetTitle($arResult['LINE_NAME']);

?>
<div id="imopenlines-page-placeholder" class="imopenlines-page-placeholder"></div>
<?=\Bitrix\ImOpenLines\LiveChat::getLocalize();?>
<script type="text/javascript">
	BX.ready(function(){
		BX.LiveChat.init({context: 'PAGE', placeholder: 'imopenlines-page-placeholder'});
	});
</script>
<?if ($arResult['COPYRIGHT_REMOVED'] == 'N'):?>
<a href="<?=$arResult['CUSTOMIZATION']['REF_LINK']?>" target="_blank" class="livechat-footer-logo-block">
	<span class="livechat-footer-logo-text"><?=GetMessage('WORK_WITH')?></span>
	<span class="livechat-footer-logo-img <?=$arResult['COPYRIGHT_LANG']?>"></span>
</a>
<?endif;?>