<?php
use Bitrix\Main\Localization\Loc;

if(!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED!==true) die();
/** @var array $arParams */
/** @var array $arResult */
/** @global CMain $APPLICATION */
/** @global CUser $USER */
/** @global CDatabase $DB */
/** @var CBitrixComponentTemplate $this */
/** @var string $templateName */
/** @var string $templateFile */
/** @var string $templateFolder */
/** @var string $componentPath */
/** @var \Bitrix\Disk\Internals\BaseComponent $component */

$APPLICATION->ShowAjaxHead();

Loc::loadMessages(__DIR__ . '/template.php');
?>

<div>
	<?
	$APPLICATION->IncludeComponent(
		'bitrix:main.ui.grid',
		'',
		array(
			'AJAX_MODE' => 'Y',
			//Strongly required
			'AJAX_OPTION_JUMP'    => 'N',
			'AJAX_OPTION_STYLE'   => 'N',
			'AJAX_OPTION_HISTORY' => 'N',

			'GRID_ID' => $arResult['VERSION_GRID']['ID'],
			'CURRENT_URL' => $APPLICATION->GetCurPageParam("", array("action")),
			'HEADERS' => $arResult['VERSION_GRID']['HEADERS'],
			'SORT' => $arResult['VERSION_GRID']['SORT'],
			'SORT_VARS' => $arResult['VERSION_GRID']['SORT_VARS'],
			'ROWS' => $arResult['VERSION_GRID']['ROWS'],

			"SHOW_CHECK_ALL_CHECKBOXES" => false,
			"SHOW_ROW_CHECKBOXES" => false,
			"SHOW_ROW_ACTIONS_MENU" => true,
			"SHOW_GRID_SETTINGS_MENU" => true,
			"SHOW_NAVIGATION_PANEL" => false,
			"SHOW_PAGINATION" => true,
			"SHOW_SELECTED_COUNTER" => false,
			"SHOW_TOTAL_COUNTER" => true,
			"SHOW_PAGESIZE" => false,
			"SHOW_ACTION_PANEL" => false,
		),
		$component
	);
	?>

</div>

<script type="text/javascript">
	BX(function () {

		BX.Disk['FileViewClass_<?= $component->getComponentId() ?>'] = new BX.Disk.FileViewClass({
			withoutEventBinding: true,
			gridId: 'file_version_list',
			object: {
				id: <?= $arResult['FILE']['ID'] ?>
			}
		});

		BX.viewElementBind(
			'<?=$arResult['VERSION_GRID']['ID']?>',
			{showTitle: true},
			{attr: 'data-bx-viewer'}
		);
	});
</script>