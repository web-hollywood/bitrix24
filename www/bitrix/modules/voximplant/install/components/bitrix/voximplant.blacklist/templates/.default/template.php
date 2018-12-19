<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();
$APPLICATION->SetAdditionalCSS("/bitrix/components/bitrix/voximplant.main/templates/.default/telephony.css");

CJSCore::Init(array('voximplant_common'));
?>
<div class="bx-vi-block bx-vi-options adm-workarea">
	<table cellpadding="0" cellspacing="0" border="0" class="bx-edit-tab-title" style="width: 100%; ">
		<tr>
			<td class="bx-form-title">
				<?=GetMessage('BLACKLIST_TITLE')?>
			</td>
		</tr>
	</table>
</div>
<div class="tel-set-item tel-set-item-border" style="margin-top:20px; margin-bottom: 10px;">
	<form id="bl-settings-form" method="POST" name="BLACKLIST_SETTINGS" action="<?=POST_FORM_ACTION_URI?>">
		<?=bitrix_sessid_post();?>
		<div class="tel-set-item-cont-block">
			<div>
				<input type="checkbox" name="BLACKLIST_AUTO" id="BLACKLIST_AUTO" value="Y" <?if ($arResult["BLACKLIST_AUTO"] == "Y"):?>checked<?endif?> style="margin: 0px;"/>
				<label for="BLACKLIST_AUTO"  class="tel-set-item-bl-label" style="font-weight:bold"><?=GetMessage("BLACKLIST_ENABLE")?></label>
			</div>
		</div>
		<div id="vi_blacklist_settings_block" style="height:40px; margin: 8px 0 6px 0;" class="tel-set-item-bl-rule">
			<?=GetMessage("BLACKLIST_TEXT1")?>
			<input type="text" name="BLACKLIST_COUNT" style="width:50px; text-align: center;" class="tel-set-inp" value="<?=$arResult["BLACKLIST_COUNT"]?>" />
			<?=GetMessage("BLACKLIST_TEXT2")?>
			<input type="text" name="BLACKLIST_TIME" style="width:50px; text-align: center;" class="tel-set-inp" value="<?=$arResult["BLACKLIST_TIME"]?>" />
			<?=GetMessage("BLACKLIST_TEXT3")?>
		</div>
		<div style="padding-bottom: 10px;"><?=GetMessage("BLACKLIST_ENABLE_TEXT")?></div>
		<span id="bl-save-settings" class="webform-small-button webform-small-button-accept">
			<span class="webform-small-button-text">
				<?=GetMessage("BLACKLIST_SAVE")?>
			</span>
		</span>
	</form>
</div>
<?
if (!empty($arResult["ERROR"]))
{
	echo '<div class="tel-set-cont-error" style="margin-top: 33px">'.$arResult["ERROR"].'</div>';
}
?>
<div class="tel-set-item">
	<p style="font-weight:bold"><?=GetMessage("BLACKLIST_NUMBERS")?></p>
	<div>
		<input id="bl-new-number" type="text" name="BLACKLIST_NEW_NUMBER" class="tel-set-inp">
		<span id="bl-add-number" class="webform-small-button webform-small-button-accept">
			<span class="webform-small-button-text">
				<?=GetMessage("BLACKLIST_NUMBER_ADD")?>
			</span>
		</span>
	</div>
	<div id="bl-numbers-container" class="tel-bl-phone-box"></div>

	<div class="tel-set-item-alert" style="margin-top: 25px">
		<?=GetMessage(
				'BLACKLIST_ABOUT_2',
				Array('#LINK#' => $arResult['IFRAME'] ?
					'<a onclick="BX.SidePanel.Instance.open(\''.CVoxImplantMain::GetPublicFolder().'detail.php?CODE=423\')">'.GetMessage('BLACKLIST_ABOUT_LINK').'</a>' :
					'<a href="'.CVoxImplantMain::GetPublicFolder().'detail.php?CODE=423">'.GetMessage('BLACKLIST_ABOUT_LINK').'</a>'
				)
		)?>
	</div>
</div>

<script>
	BX.message({
		BLACKLIST_DELETE_ERROR: '<?=GetMessageJS('BLACKLIST_DELETE_ERROR')?>',
		BLACKLIST_DELETE_CONFIRM: '<?=GetMessageJS("BLACKLIST_DELETE_CONFIRM")?>',
		BLACKLIST_ERROR_TITLE: '<?=GetMessageJS("BLACKLIST_ERROR_TITLE")?>',
		VI_BLACKLIST_NUMBER_ALREADY_EXISTS: '<?=GetMessageJS("VI_BLACKLIST_NUMBER_ALREADY_EXISTS")?>',
		VI_BLACKLIST_NUMBER_ERROR: '<?=GetMessageJS("VI_BLACKLIST_NUMBER_ERROR")?>'
	});

	BX.Voximplant.Blacklist.init({
		ajaxUrl: '<?= $this->__component->GetPath()?>/ajax.php',
		numbers: <?= CUtil::PhpToJSObject($arResult['ITEMS'])?>

	});
</script>
