<?
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED!==true)die();

use Bitrix\Main\Localization\Loc;


?>
<?if(count($arResult['ITEMS']) == 0):?>
	<?=Loc::getMessage('CRM_UTM_VIEW_NOT_FOUND')?>
<?else:?>
	<table>
		<?foreach ($arResult['ITEMS'] as $item):?>
		<tr>
			<td><?=htmlspecialcharsbx($item['NAME'])?>:</td>
			<td><?=htmlspecialcharsbx($item['VALUE'])?></td>
		</tr>
		<?endforeach;?>
	</table>
<?endif;?>