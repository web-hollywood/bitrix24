<?if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();?>

<table cellpadding="0" cellspacing="0" border="0" class="bx-edit-tab-title" style="width: 100%; ">
	<tr>
		<td class="bx-form-title">
			<?=GetMessage('VI_COMBINATIONS_TITLE')?>
		</td>
	</tr>
</table>
<div class="tel-set-item bx-vi-options" style="margin-top:20px; margin-bottom: 10px;">
	<form id="interface_crm_option_form">
		<input type="hidden" name="act" value="save">
		<div>
			<?=GetMessage("VI_COMBINATION_INTERCEPT_GROUP")?>
			<input type="text"
				   id="combinationInterceptGroup"
				   class="tel-set-inp"
				   style="width: initial; margin: 0 10px"
				   size="5"
				   maxlength="5"
				   value="<?=htmlspecialcharsbx($arResult["COMBINATION_INTERCEPT_GROUP"])?>"
			>
		</div>
		<a id="interface_combinations_btn" href="javascript:void(0);" class="webform-small-button webform-small-button-accept">
			<span class="webform-small-button-left"></span>
			<span class="webform-small-button-text"><?=GetMessage('VI_COMBINATIONS_SAVE'); ?></span>
			<span class="webform-small-button-right"></span>
		</a>
	</form>
</div>
<script type="text/javascript">
	BX.ready(function()
	{
		BX.Voximplant.Combinations.init('<?=$this->__component->GetPath()?>/ajax.php');
	});
</script>
