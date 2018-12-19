<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();
/** @var \Bitrix\Bizproc\Activity\PropertiesDialog $dialog */

$map = $dialog->getMap();
$template = $map['TemplateId'];
$selected = $dialog->getCurrentValue($template['FieldName']);
?>
<div class="crm-automation-popup-settings">
	<span class="crm-automation-popup-settings-title"><?=htmlspecialcharsbx($template['Name'])?>: </span>
	<select class="crm-automation-popup-settings-dropdown" name="<?=htmlspecialcharsbx($template['FieldName'])?>">
		<?foreach ($template['Options'] as $value => $optionLabel):?>
			<option value="<?=htmlspecialcharsbx($value)?>"
				<?=($value == $selected) ? ' selected' : ''?>
			><?=htmlspecialcharsbx($optionLabel)?></option>
		<?endforeach;?>
	</select>
</div>