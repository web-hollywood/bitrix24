<?if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();?>

<table cellpadding="0" cellspacing="0" border="0" class="bx-edit-tab-title" style="width: 100%; ">
	<tr>
		<td class="bx-form-title">
			<?=GetMessage('VI_CRM_INTEGRATION_TITLE')?>
		</td>
	</tr>
</table>
<div class="tel-set-item bx-vi-options" style="margin-top:20px; margin-bottom: 10px;">
	<form id="interface_crm_option_form">
		<input type="hidden" name="act" value="save">
		<dl>
			<dt><?=GetMessage("VI_CRM_INTEGRATION_WORKFLOW_EXECUTION_TITLE")?></dt>
			<dd>
				<select name="leadWorkflowAction" class="tel-set-inp" style="width: 380px;">
					<?foreach ($arResult['WORKFLOW_OPTIONS'] as $k => $v): ?>
					<option value="<?=$k?>" <? if ($arResult['WORKFLOW_OPTION'] == $k): ?> selected <? endif; ?>><?=$v?></option>
					<?endforeach;?>
				</select>
			</dd>
		</dl>
		<a id="interface_crm_option_btn" href="javascript:void(0);" class="webform-small-button webform-small-button-accept">
			<span class="webform-small-button-left"></span>
			<span class="webform-small-button-text"><?=GetMessage('VI_CRM_INTEGRATION_SAVE'); ?></span>
			<span class="webform-small-button-right"></span>
		</a>
	</form>
</div>
<script type="text/javascript">
	BX.ready(function()
	{
		BX.Voximplant.CRM.init('<?=$this->__component->GetPath()?>/ajax.php');
	});
</script>
