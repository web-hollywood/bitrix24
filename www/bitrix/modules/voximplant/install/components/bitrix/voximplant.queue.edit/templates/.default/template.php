<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) die();
/**
 * @global array $arResult
 */

\Bitrix\Main\Page\Asset::getInstance()->addCss('/bitrix/components/bitrix/voximplant.main/templates/.default/telephony.css');
\Bitrix\Main\Page\Asset::getInstance()->addCss('/bitrix/components/bitrix/voximplant.config.edit/templates/.default/style.css');
\Bitrix\Main\UI\Extension::load("ui.buttons");

if (IsModuleInstalled("socialnetwork"))
{
	CUtil::InitJSCore(array("socnetlogdest"));
}

\Bitrix\Voximplant\Ui\Helper::initLicensePopups();

if($arResult['ERROR'])
{
	ShowError($arResult['ERROR']);
}
?>
<script>
	BX.message({
		VI_CONFIG_EDIT_QUEUE_TIME: '<?=GetMessageJS("VI_CONFIG_EDIT_QUEUE_TIME")?>',
		VI_CONFIG_EDIT_QUEUE_TIME_QUEUE_ALL: '<?=GetMessageJS("VI_CONFIG_EDIT_QUEUE_TIME_QUEUE_ALL")?>',
	})
</script>
<div id="group_edit_form">
	<?=bitrix_sessid_post()?>
	<input type="hidden" name="action" value="save" />
	<input type="hidden" name="ID" value="<?=htmlspecialcharsbx($arResult['ITEM']['ID'])?>" />

	<div class="tel-set-main-wrap" id="tel-set-main-wrap">
		<div id="tel-queue-name" class="tel-set-top-title">
			<?=htmlspecialcharsbx($arResult['ITEM']['NAME'])?>
		</div>
		<div class="tel-set-inner-wrap">
			<div class="tel-set-item">
				<div class="tel-set-item-cont-block">
					<div class="tel-set-cont-title"><?=GetMessage("VI_CONFIG_EDIT_QUEUE")?></div>
					<div class="tel-set-item">
						<div class="tel-set-item-select-block">
							<div class="tel-set-item-select-text"><?=GetMessage("VI_CONFIG_EDIT_QUEUE_NAME")?></div>
							<input class="tel-set-inp" type="text" name="NAME" value="<?=htmlspecialcharsbx($arResult["ITEM"]["NAME"])?>" style="width: 500px;">
						</div>
						<div class="tel-set-item-text">
							<?=GetMessage("VI_CONFIG_EDIT_QUEUE_TIP_2")?>
						</div>
						<div class="tel-set-destination-container" id="users_for_queue"></div>
						<div class="tel-set-item-select-block">
							<div class="tel-set-item-select-text"><?=GetMessage("VI_CONFIG_EDIT_QUEUE_TYPE")?></div>
							<select class="tel-set-inp tel-set-item-select" name="TYPE" id="QUEUE_TYPE">
								<?foreach (array(CVoxImplantConfig::QUEUE_TYPE_EVENLY, CVoxImplantConfig::QUEUE_TYPE_STRICTLY, CVoxImplantConfig::QUEUE_TYPE_ALL) as $k):?>
									<option value="<?=$k?>"<?=($k == $arResult["ITEM"]["TYPE"] ? " selected" : "")?>><?=GetMessage("VI_CONFIG_EDIT_QUEUE_TYPE_".strtoupper($k))?></option>
								<?endforeach;?>
							</select>
							<span class="tel-context-help" data-text="<?=htmlspecialcharsbx(GetMessage("VI_CONFIG_EDIT_QUEUE_TYPE_TIP"))?><br><br><?=htmlspecialcharsbx(GetMessage("VI_CONFIG_EDIT_QUEUE_TYPE_TIP_2"))?><br><i><?=htmlspecialcharsbx(GetMessage("VI_CONFIG_EDIT_QUEUE_TYPE_TIP_ASTERISK_3"))?></i>">?</span>
							<?if (!CVoxImplantAccount::IsPro() || CVoxImplantAccount::IsDemo()):?>
								<div class="tel-lock-holder-select" title="<?=GetMessage("VI_CONFIG_LOCK_ALT")?>"><div onclick="BX.Voximplant.showLicensePopup('main')" class="tel-lock tel-lock-half <?=(CVoxImplantAccount::IsDemo()? 'tel-lock-demo': '')?>"></div></div>
							<?endif;?>
							<script type="text/javascript">
								<?if (!CVoxImplantAccount::IsPro()):?>
								var queueType = BX('QUEUE_TYPE');
								for (var i = 0; i < queueType.options.length; i++)
								{
									if (queueType.options[i].value == '<?=CVoxImplantConfig::QUEUE_TYPE_ALL?>')
									{
										queueType.options[i].style="color: #636363;";
									}
								}
								<?endif;?>
								BX.bind(BX('QUEUE_TYPE'), 'change', function(e){
									<?if (!CVoxImplantAccount::IsPro()):?>
									if (this.options[this.selectedIndex].value == '<?=CVoxImplantConfig::QUEUE_TYPE_ALL?>')
									{
										BX.Voximplant.showLicensePopup('main');
										this.selectedIndex = 0;
										return false;
									}
									<?endif;?>

									if (this.options[this.selectedIndex].value == '<?=CVoxImplantConfig::QUEUE_TYPE_ALL?>')
									{
										BX.adjust(BX('vi_queue_time_hint'), {
											html: BX.message('VI_CONFIG_EDIT_QUEUE_TIME_QUEUE_ALL')
										});
									}
									else
									{
										BX.adjust(BX('vi_queue_time_hint'), {
											html: BX.message('VI_CONFIG_EDIT_QUEUE_TIME')
										});
									}
								});
							</script>
						</div>
						<div id="vi_queue_time" class="tel-set-item-select-block">
							<div id="vi_queue_time_hint" class="tel-set-item-select-text">
								<?= $arResult["ITEM"]["TYPE"] == CVoxImplantConfig::QUEUE_TYPE_ALL ? GetMessage("VI_CONFIG_EDIT_QUEUE_TIME_QUEUE_ALL") : GetMessage("VI_CONFIG_EDIT_QUEUE_TIME")?>
							</div>
							<select class="tel-set-inp tel-set-item-select" name="WAIT_TIME">
								<?foreach (array("2", "3", "4", "5", "6", "7") as $k):?>
									<option value="<?=$k?>"<?=($k == $arResult["ITEM"]["WAIT_TIME"] ? " selected" : "")?>><?=GetMessage("VI_CONFIG_EDIT_QUEUE_AMOUNT_OF_BEEPS_BEFORE_REDIRECT_".$k)?></option>
								<?endforeach;?>
							</select>
						</div>
					</div>
				</div>
			</div>

			<div class="tel-set-item">
				<div class="tel-set-item-cont-block">
					<div class="tel-set-cont-title"><?=GetMessage("VI_CONFIG_EDIT_NO_ANSWER_2")?></div>
					<div class="tel-set-item">
						<div class="tel-set-item-text">
							<?=GetMessage("VI_CONFIG_EDIT_NO_ANSWER_TIP_2")?>
						</div>
						<div class="tel-set-item-select-block">
							<div class="tel-set-item-select-text"><?=GetMessage("VI_CONFIG_EDIT_NO_ANSWER_ACTION")?></div>
							<select class="tel-set-inp tel-set-item-select" name="NO_ANSWER_RULE" id="vi_no_answer_rule">
								<option value="<?=CVoxImplantIncoming::RULE_VOICEMAIL?>"<?=(CVoxImplantIncoming::RULE_VOICEMAIL == $arResult["ITEM"]["NO_ANSWER_RULE"] ? " selected" : "")?>><?=GetMessage("VI_CONFIG_EDIT_NO_ANSWER_ACTION_2")?></option>
								<option value="<?=CVoxImplantIncoming::RULE_PSTN?>"<?=(CVoxImplantIncoming::RULE_PSTN == $arResult["ITEM"]["NO_ANSWER_RULE"] ? " selected" : "")?>><?=GetMessage("VI_CONFIG_EDIT_NO_ANSWER_ACTION_3_2")?></option>
								<option value="<?=CVoxImplantIncoming::RULE_PSTN_SPECIFIC?>"<?=(CVoxImplantIncoming::RULE_PSTN_SPECIFIC == $arResult["ITEM"]["NO_ANSWER_RULE"] ? " selected" : "")?>><?=GetMessage("VI_CONFIG_EDIT_NO_ANSWER_ACTION_5")?></option>
								<option value="<?=CVoxImplantIncoming::RULE_QUEUE?>"<?=(CVoxImplantIncoming::RULE_QUEUE == $arResult["ITEM"]["NO_ANSWER_RULE"] ? " selected" : "")?>><?=GetMessage("VI_CONFIG_EDIT_NO_ANSWER_ACTION_QUEUE")?></option>
								<option value="<?=CVoxImplantIncoming::RULE_NEXT_QUEUE?>"
									<?=(CVoxImplantIncoming::RULE_NEXT_QUEUE == $arResult["ITEM"]["NO_ANSWER_RULE"] ? " selected" : "")?>
									<?=(CVoxImplantAccount::IsPro() ? '' : 'style="color: #636363;"')?>
								>
									<?=GetMessage("VI_CONFIG_EDIT_NO_ANSWER_ACTION_7")?>
								</option>
								<option value="<?=CVoxImplantIncoming::RULE_HUNGUP?>"<?=(CVoxImplantIncoming::RULE_HUNGUP == $arResult["ITEM"]["NO_ANSWER_RULE"] ? " selected" : "")?>><?=GetMessage("VI_CONFIG_EDIT_NO_ANSWER_ACTION_4")?></option>
							</select>
							<?if (!CVoxImplantAccount::IsPro() || CVoxImplantAccount::IsDemo()):?>
								<div class="tel-lock-holder-select" title="<?=GetMessage("VI_CONFIG_LOCK_ALT")?>"><div onclick="BX.Voximplant.showLicensePopup('main')" class="tel-lock tel-lock-half <?=(CVoxImplantAccount::IsDemo()? 'tel-lock-demo': '')?>"></div></div>
							<?endif;?>
						</div>
						<div class="tel-set-item-select-block tel-set-item-forward-number" id="vi_forward_number" style="<?=(CVoxImplantIncoming::RULE_PSTN_SPECIFIC == $arResult["ITEM"]["NO_ANSWER_RULE"]? 'height: 55px': '')?>">
							<div class="tel-set-item-select-text"><?=GetMessage("VI_CONFIG_EDIT_FORWARD_NUMBER")?></div>
							<input class="tel-set-inp" type="text" name="FORWARD_NUMBER" value="<?=htmlspecialcharsbx($arResult["ITEM"]["FORWARD_NUMBER"])?>">
						</div>
						<div class="tel-set-item-select-block tel-set-item-forward-number" id="vi_next_queue" style="<?=(CVoxImplantIncoming::RULE_NEXT_QUEUE == $arResult["ITEM"]["NO_ANSWER_RULE"]? 'height: 55px': '')?>">
							<div class="tel-set-item-select-text"><?=GetMessage("VI_CONFIG_EDIT_NEXT_QUEUE")?></div>
							<select class="tel-set-inp tel-set-item-select" name="NEXT_QUEUE_ID">
								<? foreach($arResult['QUEUE_LIST'] as $queue): ?>
									<option value="<?=(int)$queue['ID']?>" <?= ($queue['ID'] == $arResult['ITEM']['NEXT_QUEUE_ID'] ? 'selected' : '')?>><?= htmlspecialcharsbx($queue['NAME'])?></option>
								<? endforeach ?>
							</select>
						</div>
						<?if (!CVoxImplantAccount::IsPro()):?>
							<script>
								BX.bind(BX('vi_no_answer_rule'), 'bxchange', function(e)
								{
									var noAnswerSelect = e.target;
									if (noAnswerSelect.value == '<?=CVoxImplantIncoming::RULE_NEXT_QUEUE?>')
									{
										BX.Voximplant.showLicensePopup('main');
										noAnswerSelect.selectedIndex = 0;
										return false;
									}
								})
							</script>
						<?endif;?>
						<input id="vi_allow_intercept"
							   class="tel-set-checkbox" value="Y"
							   type="checkbox"
							   name="ALLOW_INTERCEPT"
							   <?if ($arResult["ITEM"]["ALLOW_INTERCEPT"] === "Y"):?>checked="checked"<?endif?>
							   data-locked="<?=(\Bitrix\Voximplant\Limits::canInterceptCall() ? "0" : "1")?>"
						/>
						<div class="tel-set-item-select-text"><?=GetMessage("VI_CONFIG_EDIT_ALLOW_INTERCEPT")?></div>
						<?if (!\Bitrix\Voximplant\Limits::canInterceptCall() || CVoxImplantAccount::IsDemo()):?>
							<div class="tel-lock-holder-select" title="<?=GetMessage("VI_CONFIG_LOCK_ALT")?>">
								<div onclick="BX.Voximplant.showLicensePopup('main')" class="tel-lock tel-lock-half <?=(CVoxImplantAccount::IsDemo()? 'tel-lock-demo': '')?>"></div>
							</div>
						<?endif;?>
					</div>
				</div>
			</div>
			<div class="tel-set-footer-btn">
				<span class="ui-btn ui-btn-success" data-role="vi-group-edit-submit"><?=GetMessage("VI_CONFIG_EDIT_SAVE")?></span>
				<? if($arResult['INLINE_MODE']): ?>
					<span class="ui-btn ui-btn-link" data-role="vi-group-edit-cancel"><?=GetMessage("VI_CONFIG_EDIT_CANCEL")?></span>
				<? else: ?>
					<a href="<?=CVoxImplantMain::GetPublicFolder().'groups.php'?>" class="ui-btn ui-btn-link"><?=GetMessage("VI_CONFIG_EDIT_BACK")?></a>
				<? endif ?>
			</div>
		</div>
	</div>
</div>

<script>
	BX.ready(function()
	{
		BX.message({
			LM_ADD1 : '<?=GetMessageJS("LM_ADD1")?>',
			LM_ADD2 : '<?=GetMessageJS("LM_ADD2")?>'
		});

		new BX.ViGroupEdit({
			node: BX('group_edit_form'),
			destinationParams: <?= CUtil::PhpToJSObject($arResult["DESTINATION"])?>,
			rulePstnSpecific: '<?= CVoxImplantIncoming::RULE_PSTN_SPECIFIC?>',
			groupListUrl: '<?= CVoxImplantMain::GetPublicFolder() . "groups.php"?>',
			inlineMode: <?= $arResult['INLINE_MODE'] ? 'true' : 'false'?>,
			externalRequestId: '<?= CUtil::JSEscape($arResult["EXTERNAL_REQUEST_ID"])?>',
			maximumGroupMembers: <?= $arResult['MAXIMUM_GROUP_MEMBERS']?>
		});
	});
</script>

