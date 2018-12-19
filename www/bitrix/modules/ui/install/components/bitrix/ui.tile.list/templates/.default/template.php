<?if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();
/** @var array $arParams */
/** @var array $arResult */
/** @global \CAllMain $APPLICATION */
/** @global \CAllUser $USER */
/** @global \CAllDatabase $DB */
/** @var CBitrixComponentTemplate $this */
/** @var string $templateName */
/** @var string $templateFile */
/** @var string $templateFolder */
/** @var string $componentPath */
/** @var CBitrixComponent $component */

use Bitrix\Main\Web\Json;
use Bitrix\Main\Localization\Loc;

$containerId = 'ui-tile-list-';
$containerId .= $arParams['ID'] ?: 'def';
?>
<script type="text/javascript">
	BX.ready(function () {
		new BX.UI.Tile.List(<?=Json::encode(array(
			'containerId' => $containerId,
			'id' => $arParams['ID'],
		))?>);
	});
</script>
<div id="<?=htmlspecialcharsbx($containerId)?>" class="ui-tile-list-wrapper">

</div>