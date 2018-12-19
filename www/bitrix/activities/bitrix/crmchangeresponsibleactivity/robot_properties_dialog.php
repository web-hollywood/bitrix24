<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();
/** @var array $arResult */

/** @var \Bitrix\Bizproc\Activity\PropertiesDialog $dialog */

$map = $dialog->getMap();

foreach (['Responsible', 'ModifiedBy'] as $propertyKey):

	if (!isset($map[$propertyKey]))
	{
		continue;
	}

	$config = array(
		'valueInputName' => $map[$propertyKey]['FieldName'],
		'selected' => \Bitrix\Crm\Automation\Helper::prepareUserSelectorEntities(
			$dialog->getDocumentType(),
			$dialog->getCurrentValue($map[$propertyKey]['FieldName'])
		),
		'multiple' => $map[$propertyKey]['Multiple'],
		'required' => $map[$propertyKey]['Required'],
	);

	$configAttributeValue = htmlspecialcharsbx(\Bitrix\Main\Web\Json::encode($config));
	?>
	<div class="crm-automation-popup-settings">
		<span class="crm-automation-popup-settings-title crm-automation-popup-settings-title-autocomplete">
			<?=htmlspecialcharsbx($map[$propertyKey]['Name'])?>:
		</span>
		<div data-role="user-selector" data-config="<?=$configAttributeValue?>"></div>
	</div>
<?endforeach;?>