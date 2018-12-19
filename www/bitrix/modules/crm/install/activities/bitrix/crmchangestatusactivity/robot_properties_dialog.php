<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();
/** @var \Bitrix\Bizproc\Activity\PropertiesDialog $dialog */

$map = $dialog->getMap();
$status = $map['TargetStatus'];
$selected = $dialog->getCurrentValue($status['FieldName']);
?>
<div class="crm-automation-popup-settings">
	<span class="crm-automation-popup-settings-title"><?=htmlspecialcharsbx($status['Name'])?>: </span>
	<select class="crm-automation-popup-settings-dropdown" name="<?=htmlspecialcharsbx($status['FieldName'])?>">
		<?foreach ($status['Options'] as $value => $optionLabel):?>
			<option value="<?=htmlspecialcharsbx($value)?>"
				<?=($value == $selected) ? ' selected' : ''?>
			><?=htmlspecialcharsbx($optionLabel)?></option>
		<?endforeach;?>
	</select>
</div>
<?if (isset($map['ModifiedBy'])):

	$config = array(
		'valueInputName' => $map['ModifiedBy']['FieldName'],
		'selected' => \Bitrix\Crm\Automation\Helper::prepareUserSelectorEntities(
			$dialog->getDocumentType(),
			$dialog->getCurrentValue($map['ModifiedBy']['FieldName'])
		),
		'multiple' => $map['ModifiedBy']['Multiple'],
		'required' => $map['ModifiedBy']['Required'],
	);

	$configAttributeValue = htmlspecialcharsbx(\Bitrix\Main\Web\Json::encode($config));
	?>
	<div class="crm-automation-popup-settings">
		<span class="crm-automation-popup-settings-title crm-automation-popup-settings-title-autocomplete">
			<?=htmlspecialcharsbx($map['ModifiedBy']['Name'])?>:
		</span>
		<div data-role="user-selector" data-config="<?=$configAttributeValue?>"></div>
	</div>
<?endif;?>