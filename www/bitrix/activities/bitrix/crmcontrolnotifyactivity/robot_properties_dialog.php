<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();
/** @var \Bitrix\Bizproc\Activity\PropertiesDialog $dialog */

$map = $dialog->getMap();
$messageText = $map['MessageText'];

$selected = \Bitrix\Crm\Automation\Helper::prepareUserSelectorEntities(
	$dialog->getDocumentType(),
	$dialog->getCurrentValue($map['ToUsers']['FieldName'], $map['ToUsers']['Default'])
);

if ($dialog->getCurrentValue($map['ToHead']['FieldName']) !== 'N')
{
	array_unshift($selected, array(
		'id' => 'BPR_CONTROL_HEAD',
		'entityId' => 'CONTROL_HEAD',
		'name' => GetMessage('CRM_CTRNA_RPD_HEAD'),
	));
}

$toAttributeValue = htmlspecialcharsbx(\Bitrix\Main\Web\Json::encode(array(
	'valueInputName' => $map['ToUsers']['FieldName'],
	'selected'       => $selected,
	'multiple' => true,
	'required' => true,
	'additionalFields' => array(
		array(
			'id' => 'BPR_CONTROL_HEAD',
			'entityId' => 'CONTROL_HEAD',
			'name' => GetMessage('CRM_CTRNA_RPD_HEAD'),
		)
	)
)));
?>
<div class="crm-automation-popup-settings">
	<textarea name="<?=htmlspecialcharsbx($messageText['FieldName'])?>"
			class="crm-automation-popup-textarea"
			placeholder="<?=htmlspecialcharsbx($messageText['Name'])?>"
			data-role="inline-selector-target"
	><?=htmlspecialcharsbx($dialog->getCurrentValue($messageText['FieldName'], $messageText['Default']))?></textarea>
</div>
<div class="crm-automation-popup-settings">
<span class="crm-automation-popup-settings-title crm-automation-popup-settings-title-autocomplete">
	<?=htmlspecialcharsbx($map['ToUsers']['Name'])?>:</span>
	<div data-role="user-selector" data-config="<?= $toAttributeValue ?>"></div>
</div>