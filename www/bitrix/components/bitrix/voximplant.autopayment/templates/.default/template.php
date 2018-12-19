<?if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();?>

<table cellpadding="0" cellspacing="0" border="0" class="bx-edit-tab-title" style="width: 100%; ">
	<tr>
		<td class="bx-form-title">
			<?=GetMessage('VI_AUTOPAY_TITLE')?>
		</td>
	</tr>
</table>
<div class="tel-set-item" style="margin-top:20px; margin-bottom: 10px;">
	<div style="padding-bottom: 15px">
		<input type="checkbox" id="allowAutoPay" <?=($arResult['AUTOPAY_ALLOWED'] == 'Y' ? 'checked' : '')?>></input>
		<label for="allowAutoPay"><?=GetMessage('VI_AUTOPAY_LABEL_2')?></label>
	</div>
	<a id="allowAutoPayButton" href="javascript:void(0);" class="webform-small-button webform-small-button-accept">
		<span class="webform-small-button-left"></span>
		<span class="webform-small-button-text"><?=GetMessage('VI_INTERFACE_SAVE'); ?></span>
		<span class="webform-small-button-right"></span>
	</a>
</div>
<script type="text/javascript">
	BX.Voximplant.Autopay.init('<?=$this->__component->GetPath()?>/ajax.php');
</script>
