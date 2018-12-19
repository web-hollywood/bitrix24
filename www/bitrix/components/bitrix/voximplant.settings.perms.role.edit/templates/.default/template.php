<?
/**
 * @var array $arResult
 * @var CMain $APPLICATION
 */
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();
$APPLICATION->SetAdditionalCSS("/bitrix/components/bitrix/voximplant.main/templates/.default/telephony.css");
$this->addExternalCss('/bitrix/css/main/table/style.css');

if($arResult['ERRORS'] && $arResult['ERRORS'] instanceof \Bitrix\Main\ErrorCollection)
{
	foreach ($arResult['ERRORS']->toArray() as $error)
	{
		ShowError($error);
	}
}

?>
<form method="POST">
	<input type="hidden" name="act" value="save">
	<input type="hidden" name="ID" value="<?=htmlspecialcharsbx($arResult['ID'])?>">
	<?echo bitrix_sessid_post()?>
	<label for="form-input-name"><?=GetMessage('VOXIMPLANT_ROLE_LABEL')?>:</label>
	<input id="form-input-name" name="NAME" value="<?=htmlspecialcharsbx($arResult['NAME'])?>">
	<br>
	<br>
	<table class="table-blue-wrapper">
		<tr>
			<td>
				<table class="table-blue">
					<tr>
						<th class="table-blue-td-title"><?=GetMessage('VOXIMPLANT_ROLE_ENTITY')?></th>
						<th class="table-blue-td-title"><?=GetMessage('VOXIMPLANT_ROLE_ACTION')?></th>
						<th class="table-blue-td-title"><?=GetMessage('VOXIMPLANT_ROLE_PERMISSION')?></th>
					</tr>
					<?foreach ($arResult['PERMISSION_MAP'] as $entity => $actions)
					{
						$firstAction = true;
						foreach ($actions as $action => $availablePermissions)
						{
							?>
								<tr class="<?=($firstAction ? 'tr-first' : '')?>">
									<td class="table-blue-td-name"><?=($firstAction ? htmlspecialcharsbx(\Bitrix\Voximplant\Security\Permissions::getEntityName($entity)) : '&nbsp;')?></td>
									<td class="table-blue-td-param"><?=htmlspecialcharsbx(\Bitrix\Voximplant\Security\Permissions::getActionName($action))?></td>
									<td class="table-blue-td-select">
										<select name="PERMISSIONS[<?=$entity?>][<?=$action?>]" class="table-blue-select">
											<?foreach ($availablePermissions as $permission):?>
												<option value="<?=$permission?>" <?=($permission === $arResult['PERMISSIONS'][$entity][$action] ? 'selected' : '')?>>
													<?=htmlspecialcharsbx(\Bitrix\Voximplant\Security\Permissions::getPermissionName($permission))?>
												</option>
											<?endforeach;?>
										</select>
									</td>

								</tr>
							<?
							$firstAction = false;
						}
					}
					?>
				</table>
			</td>
		</tr>
	</table>
	<?if($arResult['CAN_EDIT']):?>
		<input type="submit" class="webform-small-button webform-small-button-accept" value="<?=GetMessage('VOXIMPLANT_ROLE_SAVE')?>">
	<?else:?>
		<span class="webform-small-button webform-small-button-accept" onclick="viOpenTrialPopup('vi_role')">
			<?=GetMessage('VOXIMPLANT_ROLE_SAVE')?>
			<div class="tel-lock-holder-title"><div class="tel-lock"></div></div></span>
	<?endif?>
	<a class="webform-small-button" href="<?=$arResult['PERMISSIONS_URL']?>"><?=GetMessage('VOXIMPLANT_ROLE_CANCEL')?></a>
</form>
<?
if(!$arResult['CAN_EDIT'])
{
	CBitrix24::initLicenseInfoPopupJS();
	?>
	<script type="text/javascript">
		function viOpenTrialPopup(dialogId)
		{
			B24.licenseInfoPopup.show(dialogId, "<?=CUtil::JSEscape($arResult["TRIAL"]['TITLE'])?>", "<?=CUtil::JSEscape($arResult["TRIAL"]['TEXT'])?>");
		}
		BX.ready(function()
		{
			viOpenTrialPopup('permissions');
		});
	</script>
	<?
}