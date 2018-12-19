<? if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

use Bitrix\Main\Text\HtmlFilter;

\Bitrix\Main\UI\Extension::load("ui.buttons");

$this->SetViewTarget('pagetitle');
?>

<? if ($arParams['SECTION'] == 'TEMPLATES')
{
	$button = $arParams['ADD_BUTTON'];
	?>
	<a class="webform-small-button webform-small-button-blue webform-small-button-add sonet-groups-add-button" href="<?= HtmlFilter::encode($button['URL']);?>">
	    <span class="webform-small-button-icon"></span>
		<?= HtmlFilter::encode($button['NAME']);?>
	</a>
	<?
}
elseif ($arParams['SECTION'] == 'EDIT_TASK')
{
	$APPLICATION->IncludeComponent(
		"bitrix:tasks.task.detail.parts",
		"flat",
		array(
			"MODE" => "VIEW TASK",
			"BLOCKS" => array("templateselector"),
			"TEMPLATE_DATA" => array(
				"ID" => "templateselector",
				"DATA" => array(
					"TEMPLATES" => $arParams["TEMPLATES"],
				),
				"PATH_TO_TASKS_TASK" => $arParams["PATH_TO_TASKS_TASK"],
				"PATH_TO_TASKS_TEMPLATES" => $arParams["PATH_TO_TASKS_TEMPLATES"],
				"BUTTON_LABEL" => $arParams['TEMPLATES_TOOLBAR_LABEL'],
				"USE_SLIDER" => $arParams['TEMPLATES_TOOLBAR_USE_SLIDER']
			)
		),
		null,
		array("HIDE_ICONS" => "Y", "ACTIVE_COMPONENT" => "Y")
	);
}
elseif ($arParams['SECTION'] == 'VIEW_TASK')
{
	$button = $arParams['ADD_BUTTON'];
	?>
	<span class="ui-btn-double ui-btn-primary">
		<a class="ui-btn-main" href="<?= HtmlFilter::encode($button['URL']);?>" id="<?= HtmlFilter::encode($button['ID']);?>-btn">
			<?= HtmlFilter::encode($button['NAME']);?>
		</a>
		<span class="ui-btn-extra" id="<?= HtmlFilter::encode($button['ID']);?>"></span>
	</span>
	<?
}?>

<? $this->EndViewTarget(); ?>