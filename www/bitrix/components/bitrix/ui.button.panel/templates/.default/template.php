<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();

use Bitrix\Main\UI\Extension;
use Bitrix\Main\Web\Json;

/** @var CAllMain $APPLICATION */
/** @var array $arParams */
/** @var array $arResult */

Extension::load("ui.pinner");
Extension::load("ui.buttons");
Extension::load("ui.buttons.icons");

if ($arResult['HAS_HINTS'])
{
	Extension::load("ui.hint");
}

?>
<script type="text/javascript">
	BX.ready(function () {
		BX.UI.ButtonPanel.init(<?=Json::encode([
			'containerId' => 'ui-button-panel',
			'isFrame' => $arParams['FRAME'],
			'hasHints' => $arResult['HAS_HINTS'],
			'buttons' => $arResult['LIST']
		])?>);
	});
</script>

<div id="ui-button-panel" class="ui-button-panel-wrapper ui-pinner ui-pinner-bottom <?=($arParams['FRAME'] ? 'ui-pinner-full-width' : '')?>">
	<div class="ui-button-panel">
		<?foreach ($arResult['LIST'] as $item)
		{
			$item['CLASS_NAME'] = '';
			if ($item['TYPE'] === UiButtonPanel::TYPE_SAVE)
			{
				$item['CLASS_NAME'] = 'ui-btn-success';
			}
			elseif ($item['TYPE'] === UiButtonPanel::TYPE_APPLY)
			{
				$item['CLASS_NAME'] = 'ui-btn-primary';
			}
			elseif ($item['TYPE'] === UiButtonPanel::TYPE_CANCEL)
			{
				$item['CLASS_NAME'] = 'ui-btn-link';
			}
			elseif ($item['TYPE'] === UiButtonPanel::TYPE_CLOSE)
			{
				$item['CLASS_NAME'] = 'ui-btn-light-border';
			}
			elseif ($item['TYPE'] === UiButtonPanel::TYPE_BUTTON)
			{
				$item['CLASS_NAME'] = 'ui-btn-light-border';
			}

			switch ($item['TYPE'])
			{
				case UiButtonPanel::TYPE_SAVE:
				case UiButtonPanel::TYPE_APPLY:
				case UiButtonPanel::TYPE_BUTTON:
					?>
					<button
						id="<?=htmlspecialcharsbx($item['ID'])?>"
						name="<?=htmlspecialcharsbx($item['NAME'])?>"
						value="<?=htmlspecialcharsbx($item['VALUE'])?>"
						class="ui-btn <?=htmlspecialcharsbx($item['CLASS_NAME'])?>"
						<?if(!empty($item['ONCLICK'])):?>onclick="<?=htmlspecialcharsbx($item['ONCLICK'])?>"<?endif?>
					><?=htmlspecialcharsbx($item['CAPTION'])?></button>
					<?
					break;

				case UiButtonPanel::TYPE_CLOSE:
				case UiButtonPanel::TYPE_CANCEL:
					?>
					<a
						id="<?=htmlspecialcharsbx($item['ID'])?>"
						name="<?=htmlspecialcharsbx($item['NAME'])?>"
						class="ui-btn <?=htmlspecialcharsbx($item['CLASS_NAME'])?>"
						<?if(!empty($item['LINK'])):?>href="<?=htmlspecialcharsbx(\CUtil::JSEscape($item['LINK']))?>"<?endif?>
						<?if(!empty($item['ONCLICK'])):?>onclick="<?=htmlspecialcharsbx($item['ONCLICK'])?>"<?endif?>
					><?=htmlspecialcharsbx($item['CAPTION'])?></a>
					<?
					break;

				case UiButtonPanel::TYPE_CHECKBOX:
					?>
					<div class="ui-button-panel-checkbox">
						<label class="ui-button-panel-checkbox-label">
							<input
								id="<?=htmlspecialcharsbx($item['ID'])?>"
								type="checkbox"
								name="<?=htmlspecialcharsbx($item['NAME'])?>"
								value="Y"
								<?if(!empty($item['ONCLICK'])):?>onclick="<?=htmlspecialcharsbx($item['ONCLICK'])?>"<?endif?>
								<?=($item['CHECKED'] ? 'checked' : '')?>
							>
							<?=htmlspecialcharsbx($item['CAPTION'])?>
						</label>
						<?if(!empty($item['HINT'])):?>
							<span data-hint="<?=htmlspecialcharsbx($item['HINT'])?>"></span>
						<?endif;?>
					</div>
					<?
					break;

				case UiButtonPanel::TYPE_CUSTOM:
					echo $item['LAYOUT'];
					break;
			}
		}
		?>
	</div>
</div>