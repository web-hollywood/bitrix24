<?if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();?>

<table cellpadding="0" cellspacing="0" border="0" class="bx-edit-tab-title" style="width: 100%; ">
	<tr>
		<td class="bx-form-title">
			<?=GetMessage('VI_BACKUP_LINE_TITLE')?>
		</td>
	</tr>
</table>
<div class="tel-set-item bx-vi-options" style="margin-top:20px; margin-bottom: 10px;">
	<form id="backup_line_common">
		<input type="hidden" name="act" value="save">
		<div>
			<dl>
				<dt><?=GetMessage("VI_BACKUP_NUMBER_LABEL")?>:</dt>
				<dd>
					<input id="vi-backup-number" class="tel-set-inp" name="BACKUP_NUMBER" value="<?=htmlspecialcharsbx($arResult['BACKUP_NUMBER'])?>" size="20" maxlength="20">
				</dd>
			</dl>
			<dl>
				<dt><?=GetMessage("VI_BACKUP_LINE_LABEL")?>:</dt>
				<dd>
					<select id="vi-backup-line" name="BACKUP_LINE" class="tel-set-inp">
						<?foreach ($arResult['LINES'] as $k => $v):?>
							<option value="<?= $k ?>" <?= ($arResult["BACKUP_LINE"] == $k ? "selected" : "")?>><?= $v ?></option>
						<?endforeach;?>
					</select>
				</dd>
			</dl>
		</div>
		<a id="backup_number_btn" href="javascript:void(0);" class="webform-small-button webform-small-button-accept">
			<span class="webform-small-button-left"></span>
			<span class="webform-small-button-text"><?=GetMessage('VI_BACKUP_LINE_SAVE'); ?></span>
			<span class="webform-small-button-right"></span>
		</a>
	</form>
</div>
<script type="text/javascript">
	BX.ready(function()
	{
		BX.Voximplant.BackupLine.init('<?=$this->__component->GetPath()?>/ajax.php');
	});
</script>
