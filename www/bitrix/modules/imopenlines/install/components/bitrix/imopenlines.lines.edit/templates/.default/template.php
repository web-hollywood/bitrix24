<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) die();
use \Bitrix\Main\Localization\Loc;
use \Bitrix\Imopenlines\Limit;
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
/** @var CBitrixComponent $component */

Loc::loadMessages(__FILE__);

\Bitrix\Main\UI\Extension::load("ui.buttons");
\Bitrix\Main\UI\Extension::load("ui.alerts");
\Bitrix\Main\UI\Extension::load("ui.hint");
CUtil::InitJSCore(array("socnetlogdest"));
if (\Bitrix\Main\Loader::includeModule('bitrix24'))
{
	\CBitrix24::initLicenseInfoPopupJS();
}
?>

<script type="text/javascript">
	BX.ready(function() {
		BX.message({
			'IMOL_CONFIG_EDIT_POPUP_LIMITED_TITLE': '<?=GetMessageJS("IMOL_CONFIG_EDIT_POPUP_LIMITED_TITLE")?>',
			'IMOL_CONFIG_EDIT_POPUP_LIMITED_QUEUE_ALL': '<?=GetMessageJS("IMOL_CONFIG_EDIT_POPUP_LIMITED_QUEUE_ALL")?>',
			'IMOL_CONFIG_EDIT_POPUP_LIMITED_VOTE': '<?=GetMessageJS("IMOL_CONFIG_EDIT_POPUP_LIMITED_VOTE")?>',
			'IMOL_CONFIG_EDIT_NO_ANSWER_RULE_FORM': '<?=GetMessageJS("IMOL_CONFIG_EDIT_NO_ANSWER_RULE_FORM")?>',
			'IMOL_CONFIG_EDIT_NO_ANSWER_RULE_TEXT': '<?=GetMessageJS("IMOL_CONFIG_EDIT_NO_ANSWER_RULE_TEXT")?>',
			'IMOL_CONFIG_EDIT_NO_ANSWER_RULE_QUEUE': '<?=GetMessageJS("IMOL_CONFIG_EDIT_NO_ANSWER_RULE_QUEUE")?>',
			'IMOL_CONFIG_EDIT_NO_ANSWER_RULE_NONE': '<?=GetMessageJS("IMOL_CONFIG_EDIT_NO_ANSWER_RULE_NONE")?>',
			'IMOL_CONFIG_EDIT_QUEUE_TIME': '<?=GetMessageJS("IMOL_CONFIG_EDIT_QUEUE_TIME")?>',
			'IMOL_CONFIG_EDIT_NA_TIME': '<?=GetMessageJS("IMOL_CONFIG_EDIT_NA_TIME")?>'
		});
	});
</script>

<div class="imopenlines-field-container" id="imopenlines-field-container">
	<form action="<?=POST_FORM_ACTION_URI?>" method="POST" id="imol_config_edit_form">
		<?=bitrix_sessid_post()?>
		<input type="hidden" name="CONFIG_ID" value="<?=$arResult['CONFIG']['ID']?>" />
		<input type="hidden" name="form" value="imopenlines_edit_form" />
		<input type="hidden" name="action" value="save" id="imol_config_edit_form_action" />
		<input type="hidden" name="opened" value="<?=$arResult['IS_OPENED'] ? 'Y' : 'N'?>" id="imol_config_opened">
		<div class="imopenlines-title-wrap">
			<div class="imopenlines-title">
				<?/*<input class="imopenlines-title-text imopenlines-title-input imopenlines-input-short <? if($arResult["IFRAME"]) {?>ui-form-iframe-background<?}?>"
						   id="bx-line-title-input"
						   name="CONFIG[LINE_NAME]"
						   value="<?=htmlspecialcharsbx($arResult['CONFIG']['LINE_NAME'])?>"
						   type="text">*/?>
				<span class="imopenlines-title-text imopenlines-show-inline" id="bx-line-title">
					<?=htmlspecialcharsbx($arResult['CONFIG']['LINE_NAME'])?>
				</span>
				<input class="ui-control-input imopenlines-input-short imopenlines-show-none"
					   id="bx-line-title-input"
					   name="CONFIG[LINE_NAME]"
					   value="<?=htmlspecialcharsbx($arResult['CONFIG']['LINE_NAME'])?>"
					   type="text">
				<span class="imopenlines-editable-btn" id="bx-title-edit-btn"></span>
			</div>
		</div>
		<span class="imopenlines-title-channels">
			<?=Loc::getMessage("IMOL_CONFIG_EDIT_CONNECTED_SOURCE")?>
		</span>
		<? $APPLICATION->IncludeComponent("bitrix:imconnector.settings.status", "", array(
			"LINE" => $arResult['CONFIG']['ID'],
			"LINK_ON" => $arResult['CAN_EDIT_CONNECTOR'] ? "Y" : "",
			"IFRAME" => $arResult["IFRAME"]
		)); ?>
		<div class="imopenlines-field-section">
			<?
			if($arResult['ERROR'] != '')
			{
				?>
				<div class="ui-alert ui-alert-danger">
					<span class="ui-alert-message">
						<?=$arResult['ERROR']?>
					</span>
				</div>
				<?
			}
			?>
			<div class="ui-form-settings-container">
				<div class="ui-form-settings-row">
					<div class="ui-form-settings-block-left">
						<div class="ui-form-settings-title">
							<?=Loc::getMessage('IMOL_CONFIG_EDIT_RESPONSIBLE_QUEUE')?>
							<span data-hint="<?=GetMessageJS('IMOL_CONFIG_EDIT_QUEUE_DESC_NEW')?>"></span>
						</div>
					</div>
					<div class="ui-form-settings-block-right">
						<div class="imopenlines-user-list-input" id="users_for_queue">
							<?
							if ($arResult['CAN_EDIT'])
							{
								?>
								<script type="text/javascript">
									BX.ready(function(){
										BX.message({
											LM_ADD1 : '<?=GetMessageJS("IMOL_CONFIG_EDIT_LM_ADD1")?>',
											LM_ADD2 : '<?=GetMessageJS("IMOL_CONFIG_EDIT_LM_ADD2")?>',
											LM_ERROR_BUSINESS: '<?=GetMessageJS("IMOL_CONFIG_EDIT_LM_ERROR_BUSINESS")?>',
											'LM_BUSINESS_USERS': '<?=CUtil::JSEscape($arResult['BUSINESS_USERS'])?>',
											'LM_BUSINESS_USERS_ON': '<?=CUtil::JSEscape($arResult['BUSINESS_USERS_LIMIT'])?>',
											'LM_BUSINESS_USERS_TEXT': "<?=GetMessageJS("IMOL_CONFIG_EDIT_POPUP_LIMITED_BUSINESS_USERS_TEXT")?>"
										});
										BX.OpenLinesConfigEdit.initDestination(
											BX('users_for_queue'),
											'QUEUE',
											<?=CUtil::PhpToJSObject($arResult["QUEUE_DESTINATION"])?>
										);
									});
								</script>
								<?
							}
							else
							{
								foreach ($arResult["QUEUE_DESTINATION"]["SELECTED"]["USERS"] as $userId)
								{
									?>
										<span class="bx-destination bx-destination-users">
											<span class="bx-destination-text">
												<?=$arResult["QUEUE_DESTINATION"]["USERS"]['U'.$userId]["name"]?>
											</span>
										</span>
									<?
								}
							}
							?>
						</div>
					</div>
				</div>
				<?
				if(defined('IMOL_FDC'))
				{
					?>
					<div class="ui-form-settings-row">
						<div class="ui-form-settings-block-left">
							<div class="ui-form-settings-title">
								<?=Loc::getMessage('IMOL_CONFIG_EDIT_LANG_SESSION_PRIORITY')?>
								<span data-hint="<?=GetMessageJS('IMOL_CONFIG_EDIT_LANG_SESSION_PRIORITY_TIP')?>"></span>
							</div>
						</div>
						<div class="ui-form-settings-block-right">
							<div class="ui-control-inner" style="min-width: 80px;width: 80px">
								<input type="number"
									   min="0"
									   max="86400"
									   class="ui-control-input"
									   name="CONFIG[SESSION_PRIORITY]"
									   value="<?=htmlspecialcharsbx($arResult['CONFIG']['SESSION_PRIORITY'])?>">
							</div>
							<div class="ui-control-subtitle"><?=Loc::getMessage('IMOL_CONFIG_EDIT_LANG_SESSION_PRIORITY_2')?></div>
						</div>
					</div>
					<?
				}
				?>
			</div>

			<div class="ui-form-settings-extra-container <? if(!$arResult['IS_OPENED']) { ?> ui-form-border-bottom<? } ?>" id="imol_extra_container">
				<div class="ui-form-settings-extra-btn">
					<div class="ui-form-settings-extra-name <? if($arResult['IS_OPENED']) { ?>imopenlines-extra-btn-container-active<? } ?>" id="imol_extra_btn">
						<?=Loc::getMessage('IMOL_CONFIG_EDIT_ADDITIONAL')?>
					</div>
					<div class="ui-form-settings-extra-link-box">
						<span class="ui-form-settings-extra-link-item"
							  data-item-id="imol_crm_checkbox">
							<?=Loc::getMessage('IMOL_CONFIG_EDIT_CRM_BASE')?>
						</span>
						<span class="ui-form-settings-extra-link-item"
							  data-item-id="imol_queue_settings_link">
							<?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE")?>
						</span>
						<span class="ui-form-settings-extra-link-item"
							  data-item-id="imol_welcome_bot">
							<?=Loc::getMessage('IMOL_CONFIG_EDIT_BOT_SETTINGS')?>
						</span>
						<span class="ui-form-settings-extra-link-item"
							  data-item-id="imol_auto_action_settings_link">
							<?=Loc::getMessage('IMOL_CONFIG_EDIT_AUTO_ACTION')?>
						</span>
						<span class="ui-form-settings-extra-link-item"
							  data-item-id="imol_history_checkbox">
							<?=Loc::getMessage('IMOL_CONFIG_EDIT_HISTORY_SETTINGS')?>
						</span>
						<span class="ui-form-settings-extra-link-item"
							  data-item-id="imol_agreement_message">
							<?=Loc::getMessage('IMOL_CONFIG_EDIT_ACTIONS')?>
						</span>
						<span class="ui-form-settings-extra-link-item"
							  data-item-id="imol_lang_select">
							<?=Loc::getMessage("IMOL_CONFIG_EDIT_LANG")?>
						</span>
					</div>
				</div>
				<div class="ui-form-settings-container <? if(!$arResult['IS_OPENED']) { ?>invisible <? } ?>" id="imol_setting_container">
					<div class="ui-form-settings-row ui-form-settings-multiple-lines">
						<div class="ui-form-settings-block-left">
							<div class="ui-form-settings-title">
								<?=Loc::getMessage('IMOL_CONFIG_EDIT_CRM_BASE')?>
							</div>
						</div>
						<div class="ui-form-settings-block-right">
							<div class="ui-control-checkbox-container">
								<label class="ui-control-checkbox-label">
									<input type="checkbox"
										   name="CONFIG[CRM]"
										   value="Y"
										   id="imol_crm_checkbox"
										   class="ui-control-checkbox"
										<? if ($arResult['CONFIG']['CRM'] == 'Y'  && $arResult['IS_CRM_INSTALLED'] == 'Y') { ?>
											checked
										<? } elseif($arResult['IS_CRM_INSTALLED'] != 'Y') { ?>
											disabled
										<? } ?>>
									<?=Loc::getMessage('IMOL_CONFIG_EDIT_CRM')?>
								</label>
							</div>
							<?
							if ($arResult['IS_CRM_INSTALLED'] != 'Y')
							{
								?>
								<div class="ui-control-checkbox-container">
									<label class="ui-control-checkbox-label">
										<?= Loc::getMessage('IMOL_CONFIG_EDIT_CRM_DISABLED') ?>
									</label>
								</div>
								<?
							}
							?>
							<div id="imol_crm_block" <?if (!($arResult['CONFIG']['CRM'] == 'Y'  && $arResult['IS_CRM_INSTALLED'] == 'Y')){?>class="invisible"<?}?>>
								<div class="ui-control-container ui-control-select">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage('IMOL_CONFIG_EDIT_CRM_CREATE')?>
										<span data-hint="<?=GetMessageJS('IMOL_CONFIG_EDIT_CRM_CREATE_LEAD_DESC')?>"></span>
									</div>
									<div class="ui-control-inner">
										<select name="CONFIG[CRM_CREATE]" id="imol_crm_create" class="ui-control-input">
											<option value="none" <?if($arResult["CONFIG"]["CRM_CREATE"] == "none") { ?>selected<? }?>>
												<?=Loc::getMessage("IMOL_CONFIG_EDIT_CRM_CREATE_IN_CHAT")?>
											</option>
											<option value="lead" <?if($arResult["CONFIG"]["CRM_CREATE"] == "lead") { ?>selected<? }?>>
												<?=Loc::getMessage("IMOL_CONFIG_EDIT_CRM_CREATE_LEAD")?>
											</option>
										</select>
									</div>
								</div>
								<div class="ui-control-container ui-control-select" id="imol_crm_source">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_CRM_SOURCE")?>
										<span data-hint="<?=htmlspecialcharsbx(Loc::getMessage("IMOL_CONFIG_EDIT_CRM_SOURCE_INFO"))?>"></span>
									</div>
									<div class="ui-control-inner">
										<select name="CONFIG[CRM_SOURCE]" id="imol_crm_source_select" class="ui-control-input">
											<?
											foreach ($arResult['CRM_SOURCES'] as $value => $name)
											{
												?>
												<option value="<?=$value?>" <?if($arResult["CONFIG"]["CRM_SOURCE"] == $value) { ?>selected<? }?> >
													<?=htmlspecialcharsbx($name)?>
												</option>
												<?
											}
											?>
										</select>
									</div>
								</div>
								<div class="ui-control-checkbox-container">
									<label class="ui-control-checkbox-label">
										<input type="checkbox"
											   class="ui-control-checkbox"
											   name="CONFIG[CRM_FORWARD]"
											   id="imol_crm_forward"
											   value="Y"
											   <?if($arResult["CONFIG"]["CRM_FORWARD"] == "Y") { ?>checked<? }?>>
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_CRM_FORWARD_NEW")?>
									</label>
								</div>
								<div class="ui-control-checkbox-container <?=($arResult["CONFIG"]["CRM_CREATE"] != 'none' ? '' : 'invisible')?>"
									 id="imol_crm_source_rule">
									<label class="ui-control-checkbox-label">
										<input type="checkbox"
											   class="ui-control-checkbox"
											   name="CONFIG[CRM_TRANSFER_CHANGE]"
											   value="Y"
											   <?if($arResult["CONFIG"]["CRM_TRANSFER_CHANGE"] == "Y") { ?>checked<? }?>  >
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_CRM_TRANSFER_CHANGE_2")?>
									</label>
								</div>
							</div>
						</div>
					</div>
					<div class="ui-form-settings-row ui-form-settings-multiple-lines">
						<div class="ui-form-settings-block-left">
							<div class="ui-form-settings-title">
								<?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_WORK")?>
							</div>
						</div>
						<div class="ui-form-settings-block-right">
							<div class="ui-control-checkbox-container">
								<a href="#" id="imol_queue_settings_link" class="ui-control-link">
									<?=Loc::getMessage('IMOL_CONFIG_EDIT_QUEUE_WORK_CONFIG')?>
								</a>
								<?
								if (!Limit::canUseQueueAll() || Limit::isDemoLicense())
								{
									?>
									<span id="imol_queue_all"
										  data-hint="<?=GetMessageJS('IMOL_CONFIG_LOCK_ALT')?>">
									</span>
									<?
								}
								?>
							</div>
							<input type="hidden" value="<?=$arResult['SHOW_QUEUE_SETTINGS']?>" name="SHOW_QUEUE_SETTINGS" id="imol_queue_settings_input">
							<div id="imol_queue_settings_block" <? if ($arResult['SHOW_QUEUE_SETTINGS'] != 'Y') { ?>class="invisible" <? } ?>>
								<div class="ui-control-container ui-control-select">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TYPE_NEW")?>
										<span data-hint="<?=htmlspecialcharsbx(Loc::getMessage('IMOL_CONFIG_EDIT_QUEUE_TYPE_TIP_ALL'))?>">
										</span>
									</div>
									<div class="ui-control-inner">
										<select name="CONFIG[QUEUE_TYPE]" id="imol_queue_type" class="ui-control-input">
											<option value="evenly" <?if($arResult["CONFIG"]["QUEUE_TYPE"] == "evenly") { ?>selected<? }?>>
												<?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TYPE_EVENLY")?>
											</option>
											<option value="strictly" <?if($arResult["CONFIG"]["QUEUE_TYPE"] == "strictly") { ?>selected<? }?>>
												<?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TYPE_STRICTLY")?>
											</option>
											<option value="all" <?if($arResult["CONFIG"]["QUEUE_TYPE"] == "all") { ?>selected<? }?> <?if(!Limit::canUseQueueAll()) { ?>disabled<? }?>>
												<?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TYPE_ALL")?>
											</option>
										</select>
										<a href="#" class="ui-control-link" id="imol_workers_time_link">
											<?= ($arResult["CONFIG"]["QUEUE_TYPE"] == "all") ? Loc::getMessage('IMOL_CONFIG_EDIT_NA_TIME') : Loc::getMessage('IMOL_CONFIG_EDIT_QUEUE_TIME')?>
										</a>
									</div>
								</div>
								<input type="hidden" value="<?=$arResult['SHOW_WORKERS_TIME']?>" name="SHOW_WORKERS_TIME" id="imol_workers_time_input">
								<div class="ui-control-container ui-control-select <? if($arResult['SHOW_WORKERS_TIME'] != 'Y') { ?>invisible<? } ?>" id="imol_workers_time_block">
									<div class="ui-control-subtitle" id="imol_queue_time_title">
										<?= ($arResult["CONFIG"]["QUEUE_TYPE"] == "all") ? Loc::getMessage('IMOL_CONFIG_EDIT_NA_TIME') : Loc::getMessage('IMOL_CONFIG_EDIT_QUEUE_TIME')?>
									</div>
									<div class="ui-control-inner">
										<select class="ui-control-input" name="CONFIG[QUEUE_TIME]">
											<option value="60" <?if($arResult["CONFIG"]["QUEUE_TIME"] == "60") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_1")?></option>
											<option value="180" <?if($arResult["CONFIG"]["QUEUE_TIME"] == "180") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_3")?></option>
											<option value="300" <?if($arResult["CONFIG"]["QUEUE_TIME"] == "300") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_5")?></option>
											<option value="600" <?if($arResult["CONFIG"]["QUEUE_TIME"] == "600") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_10")?></option>
											<option value="900" <?if($arResult["CONFIG"]["QUEUE_TIME"] == "900") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_15")?></option>
											<option value="1800" <?if($arResult["CONFIG"]["QUEUE_TIME"] == "1800") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_30")?></option>

											<option value="3600" <?if($arResult["CONFIG"]["QUEUE_TIME"] == "3600") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_60")?></option>
											<option value="7200" <?if($arResult["CONFIG"]["QUEUE_TIME"] == "7200") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_120")?></option>
											<option value="10800" <?if($arResult["CONFIG"]["QUEUE_TIME"] == "10800") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_180")?></option>
											<option value="21600" <?if($arResult["CONFIG"]["QUEUE_TIME"] == "21600") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_360")?></option>
											<option value="28800" <?if($arResult["CONFIG"]["QUEUE_TIME"] == "28800") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_480")?></option>
											<option value="43200" <?if($arResult["CONFIG"]["QUEUE_TIME"] == "43200") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_720")?></option>
										</select>
									</div>
								</div>
								<div class="ui-control-checkbox-container">
									<label class="ui-control-checkbox-label">
										<input id="imol_timeman"
											   type="checkbox"
											   name="CONFIG[TIMEMAN]"
											   value="Y"
											   class="ui-control-checkbox"
											   <?if($arResult["CONFIG"]["TIMEMAN"] == "Y") { ?>checked<? }?>>
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_TIMEMAN_NEW")?>
									</label>
								</div>

								<div class="ui-control-checkbox-container">
									<label class="ui-control-checkbox-label">
										<input id="imol_check_online"
											   type="checkbox"
											   name="CONFIG[CHECK_ONLINE]"
											   value="Y"
											   class="ui-control-checkbox"
											   <?if($arResult["CONFIG"]["CHECK_ONLINE"] == "Y") { ?>checked<? }?>>
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_CHECK_ONLINE")?>
									</label>
								</div>

								<div id="imol_check_online_block" class="ui-control-checkbox-container<?if ($arResult["CONFIG"]["CHECK_ONLINE"] != "Y"){?> invisible<?}?>">
									<label class="ui-control-checkbox-label">
										<input id="imol_checking_offline"
											   type="checkbox"
											   name="CONFIG[CHECKING_OFFLINE]"
											   value="Y"
											   class="ui-control-checkbox"
											   <?if($arResult["CONFIG"]["CHECKING_OFFLINE"] == "Y") { ?>checked<? }?>>
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_CHECKING_OFFLINE")?>
										<span data-hint="<?=htmlspecialcharsbx(Loc::getMessage('IMOL_CONFIG_EDIT_CHECKING_OFFLINE_DESC'))?>">
											</span>
									</label>
								</div>

								<div id="imol_limitation_max_chat_block" <? if ($arResult["CONFIG"]["QUEUE_TYPE"] == "all") { ?>class="invisible"<? } ?>>
									<div class="ui-control-checkbox-container">
										<label class="ui-control-checkbox-label">
											<input id="imol_limitation_max_chat"
												   type="checkbox"
												   name="CONFIG[LIMITATION_MAX_CHAT]"
												   value="Y"
												   class="ui-control-checkbox"
												   <?if($arResult["CONFIG"]["MAX_CHAT"] > "0") { ?>checked<? }?>>
											<?=Loc::getMessage("IMOL_CONFIG_EDIT_LIMITATION_MAX_CHAT_TITLE")?>
										</label>
									</div>
									<div <?if($arResult["CONFIG"]["MAX_CHAT"] == "0" || empty($arResult["CONFIG"]["MAX_CHAT"] || $arResult["CONFIG"]["QUEUE_TYPE"] == "all")) {?>class="invisible"<?}?> id="imol_max_chat">
										<div class="ui-control-container ui-control-select">
											<div class="ui-control-subtitle">
												<?= Loc::getMessage('IMOL_CONFIG_EDIT_TYPE_MAX_CHAT_TITLE') ?>
												<span data-hint="<?=htmlspecialcharsbx(Loc::getMessage('IMOL_CONFIG_EDIT_TYPE_MAX_CHAT_TIP'))?>"></span>
											</div>
											<div class="ui-control-inner">
												<select class="ui-control-input" name="CONFIG[TYPE_MAX_CHAT]">
													<option value="answered_new" <?if($arResult["CONFIG"]["TYPE_MAX_CHAT"] == "answered_new" || empty($arResult["CONFIG"]["TYPE_MAX_CHAT"])) { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_TYPE_MAX_CHAT_OPTION_ANSWERED_NEW")?></option>
													<option value="answered" <?if($arResult["CONFIG"]["TYPE_MAX_CHAT"] == "answered") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_TYPE_MAX_CHAT_OPTION_ANSWERED")?></option>
													<option value="closed" <?if($arResult["CONFIG"]["TYPE_MAX_CHAT"] == "closed") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_TYPE_MAX_CHAT_OPTION_CLOSED")?></option>
												</select>
											</div>
										</div>
										<div class="ui-control-container">
											<div class="ui-control-subtitle">
												<?= Loc::getMessage('IMOL_CONFIG_EDIT_MAX_CHAT_TITLE') ?>
											</div>
											<div class="ui-control-inner">
												<input type="text" name="CONFIG[MAX_CHAT]" class="ui-control-input" value="<?=$arResult["CONFIG"]["MAX_CHAT"]?>">
											</div>
										</div>
									</div>
								</div>
								<?
								if (!IsModuleInstalled("timeman"))
								{
									?>
									<script type="text/javascript">
										BX.bind(BX('imol_timeman'), 'change', function(e){
											BX('imol_timeman').checked = false;
											alert('<?=GetMessageJS(!IsModuleInstalled("bitrix24")? "IMOL_CONFIG_EDIT_TIMEMAN_SUPPORT_B24": "IMOL_CONFIG_EDIT_TIMEMAN_SUPPORT_CP")?>');
										});
									</script>
									<?
								}
								?>
							</div>
						</div>
					</div>
					<div class="ui-form-settings-row ui-form-settings-multiple-lines">
						<div class="ui-form-settings-block-left">
							<div class="ui-form-settings-title">
								<?=Loc::getMessage('IMOL_CONFIG_EDIT_BOT_SETTINGS')?>
								<span data-hint="<?=GetMessageJS("IMOL_CONFIG_EDIT_BOT_JOIN_TIP")?>"></span>
							</div>
						</div>
						<div class="ui-form-settings-block-right">
							<div class="ui-control-checkbox-container">
								<label class="ui-control-checkbox-label">
									<input id="imol_welcome_bot"
										   type="checkbox"
										   class="ui-control-checkbox"
										   name="CONFIG[WELCOME_BOT_ENABLE]"
										   value="Y"
										   <?if($arResult["CONFIG"]["WELCOME_BOT_ENABLE"] == "Y") { ?>checked<? }?>>
									<?=Loc::getMessage("IMOL_CONFIG_EDIT_BOT_JOIN_2")?>
								</label>
							</div>
							<div id="imol_welcome_bot_block" <? if($arResult["CONFIG"]["WELCOME_BOT_ENABLE"] != "Y") {?>class="invisible"<?}?>>
								<div class="ui-control-container ui-control-select">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_BOT_ID")?>
									</div>
									<div class="ui-control-inner">
										<select name="CONFIG[WELCOME_BOT_ID]" id="WELCOME_BOT_ID" class="ui-control-input">
											<?
											foreach ($arResult['BOT_LIST'] as $value => $name)
											{
												?>
												<option value="<?=$value?>" <?if($arResult["CONFIG"]["WELCOME_BOT_ID"] == $value) { ?>selected<? }?> ><?=htmlspecialcharsbx($name)?></option>
												<?
											}
											?>
										</select>
									</div>
								</div>
								<div class="ui-control-container ui-control-select">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_WELCOME_BOT_JOIN")?>
									</div>
									<div class="ui-control-inner">
										<select name="CONFIG[WELCOME_BOT_JOIN]" class="ui-control-input">
											<option value="first" <?if($arResult["CONFIG"]["WELCOME_BOT_JOIN"] == "first") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_WELCOME_BOT_JOIN_FIRST")?></option>
											<option value="always" <?if($arResult["CONFIG"]["WELCOME_BOT_JOIN"] == "always") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_WELCOME_BOT_JOIN_ALWAYS")?></option>
										</select>
									</div>
								</div>
								<div class="ui-control-container ui-control-select">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_BOT_TIME")?>
										<span data-hint="<?=GetMessageJS("IMOL_CONFIG_EDIT_BOT_TIME_TIP")?>"></span>
									</div>
									<div class="ui-control-inner">
										<select name="CONFIG[WELCOME_BOT_TIME]" class="ui-control-input">
											<option value="60" <?if($arResult["CONFIG"]["WELCOME_BOT_TIME"] == "60") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_1")?></option>
											<option value="180" <?if($arResult["CONFIG"]["WELCOME_BOT_TIME"] == "180") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_3")?></option>
											<option value="300" <?if($arResult["CONFIG"]["WELCOME_BOT_TIME"] == "300") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_5")?></option>
											<option value="600" <?if($arResult["CONFIG"]["WELCOME_BOT_TIME"] == "600") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_10")?></option>
											<option value="900" <?if($arResult["CONFIG"]["WELCOME_BOT_TIME"] == "900") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_15")?></option>
											<option value="1800" <?if($arResult["CONFIG"]["WELCOME_BOT_TIME"] == "1800") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_30")?></option>
											<option value="0" <?if($arResult["CONFIG"]["WELCOME_BOT_TIME"] == "0") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_QUEUE_TIME_0")?></option>
										</select>
									</div>
								</div>
								<div class="ui-control-container ui-control-select">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_WELCOME_BOT_LEFT")?>
									</div>
									<div class="ui-control-inner">
										<select name="CONFIG[WELCOME_BOT_LEFT]" class="ui-control-input">
											<option value="queue" <?if($arResult["CONFIG"]["WELCOME_BOT_LEFT"] == "queue") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_WELCOME_BOT_LEFT_QUEUE")?></option>
											<option value="close" <?if($arResult["CONFIG"]["WELCOME_BOT_LEFT"] == "close") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_WELCOME_BOT_LEFT_CLOSE")?></option>
										</select>
									</div>
								</div>
							</div>
						</div>
						<script type="text/javascript">
							BX.bind(BX('imol_welcome_bot'), 'change', function(e){
								<?
								if(empty($arResult['BOT_LIST']))
								{
								?>
									BX('imol_welcome_bot').checked = false;
									alert('<?=GetMessageJS("IMOL_CONFIG_EDIT_BOT_EMPTY")?>');
								<?
								}
								else
								{
								?>
									BX.OpenLinesConfigEdit.toggleBotBlock('imol_welcome_bot_block');
								<?
								}
								?>
							});
						</script>
					</div>
					<div class="ui-form-settings-row ui-form-settings-multiple-lines">
						<div class="ui-form-settings-block-left">
							<div class="ui-form-settings-title">
								<?=Loc::getMessage('IMOL_CONFIG_EDIT_AUTO_ACTION')?>
							</div>
						</div>
						<div class="ui-form-settings-block-right">
							<div class="ui-control-checkbox-container">
								<a href="#" id="imol_auto_action_settings_link" class="ui-control-link">
									<?=Loc::getMessage('IMOL_CONFIG_EDIT_AUTO_ACTION_CONFIG')?>
								</a>
							</div>
							<input type="hidden" value="<?=$arResult['SHOW_AUTO_ACTION_SETTINGS']?>" name="SHOW_AUTO_ACTION_SETTINGS" id="imol_auto_action_settings_input">
							<div id="imol_auto_action_settings_block" <? if ($arResult['SHOW_AUTO_ACTION_SETTINGS'] != 'Y') { ?>class="invisible" <? } ?>>
								<div class="imopenlines-border-block">
									<div class="ui-control-checkbox-container">
										<label class="ui-control-checkbox-label">
											<input type="checkbox"
												   id="imol_welcome_message"
												   name="CONFIG[WELCOME_MESSAGE]"
												   value="Y"
												   class="ui-control-checkbox"
												   <? if ($arResult['CONFIG']['WELCOME_MESSAGE'] == "Y") { ?>checked<? } ?>>
											<?=Loc::getMessage('IMOL_CONFIG_EDIT_WELCOME_MESSAGE')?>
											<span data-hint="<?=GetMessageJS("IMOL_CONFIG_EDIT_WELCOME_MESSAGE_TIP")?>"></span>
										</label>
									</div>
									<div class="ui-control-container <? if ($arResult['CONFIG']['WELCOME_MESSAGE'] != 'Y') { ?>invisible<? } ?>" id="imol_action_welcome">
										<div class="ui-control-subtitle"><?=Loc::getMessage("IMOL_CONFIG_EDIT_WELCOME_MESSAGE_TEXT")?></div>
										<div class="ui-control-inner">
											<textarea type="text"
													  class="ui-control-input ui-control-textarea"
													  name="CONFIG[WELCOME_MESSAGE_TEXT]"><?=htmlspecialcharsbx($arResult["CONFIG"]["WELCOME_MESSAGE_TEXT"])?></textarea>
										</div>
									</div>
								</div>
								<div class="imopenlines-border-block">
									<div class="ui-control-container ui-control-select">
										<div class="ui-control-subtitle">
											<?=Loc::getMessage('IMOL_CONFIG_NO_ANSWER_RULE_NEW')?>
											<span data-hint="<?=GetMessageJS('IMOL_CONFIG_NO_ANSWER_DESC_NEW')?>"></span>
										</div>
										<div class="ui-control-inner">
											<select name="CONFIG[NO_ANSWER_RULE]" id="imol_no_answer_rule" class="ui-control-input">
												<?
												foreach ($arResult["NO_ANSWER_RULES"] as $value => $name)
												{
													?>
													<option value="<?=$value?>" <?if($arResult["CONFIG"]["NO_ANSWER_RULE"] == $value) { ?>selected<? }?> <?if($value == 'disabled') { ?>disabled<? }?>>
														<?=$name?>
													</option>
													<?
												}
												?>
											</select>
										</div>
									</div>
									<div class="ui-control-container ui-control-select invisible" id="imol_no_answer_rule_form_form">
										<div class="ui-control-subtitle">
											<?=Loc::getMessage("IMOL_CONFIG_NO_ANSWER_FORM_ID")?>
											<span data-hint="<?=GetMessageJS('IMOL_CONFIG_NO_ANSWER_FORM_TEXT')?>"></span>
										</div>
										<div class="ui-control-inner">
											<select name="CONFIG[NO_ANSWER_FORM_ID]" class="ui-control-input">
												<?
												foreach ($arResult["NO_ANSWER_RULES"] as $value => $name)
												{
													?>
													<option value="<?=$value?>" <?if($arResult["CONFIG"]["NO_ANSWER_RULE"] == $value) { ?>selected<? }?> <?if($value == 'disabled') { ?>disabled<? }?>>
														<?=$name?>
													</option>
													<?
												}
												?>
											</select>
										</div>
									</div>
									<div class="ui-control-container invisible" id="imol_no_answer_rule_text">
										<div class="ui-control-subtitle"><?=Loc::getMessage("IMOL_CONFIG_NO_ANSWER_TEXT")?></div>
										<div class="ui-control-inner">
											<textarea type="text"
													  name="CONFIG[NO_ANSWER_TEXT]"
													  class="ui-control-input ui-control-textarea"><?=htmlspecialcharsbx($arResult["CONFIG"]["NO_ANSWER_TEXT"])?></textarea>
										</div>
									</div>
								</div>
								<div class="imopenlines-border-block">
									<div class="ui-control-container ui-control-select">
										<div class="ui-control-subtitle">
											<?=Loc::getMessage('IMOL_CONFIG_EDIT_CLOSE_ACTION')?>
										</div>
										<div class="ui-control-inner">
											<select name="CONFIG[CLOSE_RULE]" id="imol_action_close" class="ui-control-input">
												<?
												foreach($arResult["CLOSE_RULES"] as $value=>$name)
												{
													?>
													<option value="<?=$value?>" <?if($arResult["CONFIG"]["CLOSE_RULE"] == $value) { ?>selected<? }?> <?if($value == 'disabled') { ?>disabled<? }?>>
														<?=$name?>
													</option>
													<?
												}
												?>
											</select>
										</div>
									</div>
									<div class="ui-control-container ui-control-select" id="imol_action_close_form">
										<div class="ui-control-subtitle">
											<?=Loc::getMessage('IMOL_CONFIG_EDIT_CLOSE_FORM_ID')?>
										</div>
										<div class="ui-control-inner">
											<select class="ui-control-input" name="CONFIG[CLOSE_FORM_ID]"></select>
										</div>
									</div>
									<div class="ui-control-container ui-control-block" id="imol_action_close_text">
										<div class="ui-control-subtitle">
											<?=Loc::getMessage('IMOL_CONFIG_EDIT_CLOSE_TEXT')?>
										</div>
										<div class="ui-control-inner">
											<textarea class="ui-control-input ui-control-textarea" name="CONFIG[CLOSE_TEXT]"><?=htmlspecialcharsbx($arResult["CONFIG"]["CLOSE_TEXT"])?></textarea>
										</div>
									</div>

									<div class="ui-control-container ui-control-select">
										<div class="ui-control-subtitle">
											<?=Loc::getMessage('IMOL_CONFIG_EDIT_FULL_CLOSE_TIME')?>
											<span data-hint="<?=GetMessageJS('IMOL_CONFIG_FULL_CLOSE_TIME_DESC')?>"></span>
										</div>
										<div class="ui-control-inner">
											<select name="CONFIG[FULL_CLOSE_TIME]" class="ui-control-input">
												<option value="0" <?if($arResult["CONFIG"]["FULL_CLOSE_TIME"] == "0") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_FULL_CLOSE_TIME_0")?></option>
												<option value="1" <?if($arResult["CONFIG"]["FULL_CLOSE_TIME"] == "1") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_FULL_CLOSE_TIME_1")?></option>
												<option value="2" <?if($arResult["CONFIG"]["FULL_CLOSE_TIME"] == "2") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_FULL_CLOSE_TIME_2")?></option>
												<option value="5" <?if($arResult["CONFIG"]["FULL_CLOSE_TIME"] == "5") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_FULL_CLOSE_TIME_5")?></option>
												<option value="10" <?if($arResult["CONFIG"]["FULL_CLOSE_TIME"] == "10" || !isset($arResult["CONFIG"]["FULL_CLOSE_TIME"])) { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_FULL_CLOSE_TIME_10")?></option>
												<option value="30" <?if($arResult["CONFIG"]["FULL_CLOSE_TIME"] == "30") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_FULL_CLOSE_TIME_30")?></option>
												<option value="60" <?if($arResult["CONFIG"]["FULL_CLOSE_TIME"] == "60") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_FULL_CLOSE_TIME_60")?></option>
											</select>
										</div>
									</div>
								</div>
								<div class="ui-control-container ui-control-select"
									 id="imol_queue_time">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage('IMOL_CONFIG_EDIT_AUTO_CLOSE_TIME')?>
									</div>
									<div class="ui-control-inner">
										<select class="ui-control-input" name="CONFIG[AUTO_CLOSE_TIME]">
											<option value="3600" <?if($arResult["CONFIG"]["AUTO_CLOSE_TIME"] == "3600") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_AUTO_CLOSE_TIME_1_H")?></option>
											<option value="14400" <?if($arResult["CONFIG"]["AUTO_CLOSE_TIME"] == "14400") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_AUTO_CLOSE_TIME_4_H")?></option>
											<option value="28800" <?if($arResult["CONFIG"]["AUTO_CLOSE_TIME"] == "28800") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_AUTO_CLOSE_TIME_8_H")?></option>
											<option value="86400" <?if($arResult["CONFIG"]["AUTO_CLOSE_TIME"] == "86400") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_AUTO_CLOSE_TIME_1_D")?></option>
											<option value="172800" <?if($arResult["CONFIG"]["AUTO_CLOSE_TIME"] == "172800") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_AUTO_CLOSE_TIME_2_D")?></option>
											<option value="604800" <?if($arResult["CONFIG"]["AUTO_CLOSE_TIME"] == "604800") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_AUTO_CLOSE_TIME_1_W")?></option>
											<option value="2678400" <?if($arResult["CONFIG"]["AUTO_CLOSE_TIME"] == "2678400") { ?>selected<? }?>><?=Loc::getMessage("IMOL_CONFIG_EDIT_AUTO_CLOSE_TIME_1_M")?></option>
										</select>
									</div>
								</div>
								<div class="ui-control-container ui-control-select">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage('IMOL_CONFIG_EDIT_AUTO_CLOSE_RULE')?>
									</div>
									<div class="ui-control-inner">
										<select name="CONFIG[AUTO_CLOSE_RULE]" id="imol_action_auto_close" class="ui-control-input">
											<?
											foreach($arResult["CLOSE_RULES"] as $value=>$name)
											{
												?>
												<option value="<?=$value?>" <?if($arResult["CONFIG"]["AUTO_CLOSE_RULE"] == $value) { ?>selected<? }?> <?if($value == 'disabled') { ?>disabled<? }?>>
													<?=$name?>
												</option>
												<?
											}
											?>
										</select>
									</div>
								</div>
								<div class="ui-control-container ui-control-select"
									 id="imol_action_auto_close_form">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage('IMOL_CONFIG_EDIT_AUTO_CLOSE_FORM_ID')?>
									</div>
									<div class="ui-control-inner">
										<select class="ui-control-input" name="CONFIG[AUTO_CLOSE_FORM_ID]"></select>
									</div>
								</div>
								<div class="ui-control-container ui-control-block"
									 id="imol_action_auto_close_text">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage('IMOL_CONFIG_EDIT_AUTO_CLOSE_TEXT')?>
									</div>
									<div class="ui-control-inner">
										<textarea class="ui-control-input ui-control-textarea" name="CONFIG[AUTO_CLOSE_TEXT]"><?=htmlspecialcharsbx($arResult["CONFIG"]["AUTO_CLOSE_TEXT"])?></textarea>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="ui-form-settings-row">
						<div class="ui-form-settings-block-left">
							<div class="ui-form-settings-title">
								<?=Loc::getMessage('IMOL_CONFIG_EDIT_QUICK_ANSWERS')?>
							</div>
						</div>
						<div class="ui-form-settings-block-right">
							<div class="ui-control-container ui-control-select">
								<div class="ui-control-subtitle">
									<?=Loc::getMessage("IMOL_CONFIG_EDIT_QUICK_ANSWERS_STORAGE")?>
								</div>
								<div class="ui-control-inner">
									<select name="CONFIG[QUICK_ANSWERS_IBLOCK_ID]" class="ui-control-input">
										<?
										foreach($arResult['QUICK_ANSWERS_STORAGE_LIST'] as $id => $item)
										{
											?>
											<option value="<?=intval($id);?>"<?if($id == $arResult['CONFIG']['QUICK_ANSWERS_IBLOCK_ID']){?> selected<?}?>>
												<?=htmlspecialcharsbx($item['NAME']);?>
											</option>
											<?
										}
										?>
									</select>
									<?if($arResult['CONFIG']['QUICK_ANSWERS_IBLOCK_ID'] > 0)
									{
										echo Loc::getMessage('IMOL_CONFIG_QUICK_ANSWERS_LIST_MANAGE', array('#LIST_URL#' => $arResult['QUICK_ANSWERS_MANAGE_URL']));
									}
									else
									{
										echo Loc::getMessage('IMOL_CONFIG_QUICK_ANSWERS_CREATE_NEW', array('#LIST_URL#' => $arResult['QUICK_ANSWERS_MANAGE_URL']));
									}?>
								</div>
								<div class="ui-control-subtitle">
									<?=Loc::getMessage("IMOL_CONFIG_QUICK_ANSWERS_DESC")?>
								</div>
							</div>
						</div>
					</div>
					<div class="ui-form-settings-row ui-form-settings-multiple-lines">
						<div class="ui-form-settings-block-left">
							<div class="ui-form-settings-title">
								<?=Loc::getMessage("IMOL_CONFIG_EDIT_WORKTIME")?>
							</div>
						</div>
						<div class="ui-form-settings-block-right">
							<div class="ui-control-checkbox-container">
								<label class="ui-control-checkbox-label">
									<input type="checkbox"
										   name="CONFIG[WORKTIME_ENABLE]"
										   id="imol_worktime_checkbox"
										   class="ui-control-checkbox"
										   value="Y"
										<? if ($arResult['CONFIG']['WORKTIME_ENABLE'] == 'Y') { ?>
											checked
										<? } ?>>
									<?=Loc::getMessage('IMOL_CONFIG_EDIT_WORKTIME_ENABLE')?>
								</label>
							</div>
							<div id="imol_worktime_block" <? if ($arResult['CONFIG']['WORKTIME_ENABLE'] != 'Y') { ?>class="invisible" <? } ?>>
								<div class="ui-control-container ui-control-select">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_WORKTIME_TIMEZONE")?>
									</div>
									<div class="ui-control-inner">
										<select name="CONFIG[WORKTIME_TIMEZONE]" class="ui-control-input">
											<?
											if (is_array($arResult["TIME_ZONE_LIST"]) && !empty($arResult["TIME_ZONE_LIST"]))
											{
												foreach($arResult["TIME_ZONE_LIST"] as $tz => $tz_name)
												{
													?>
													<option value="<?=htmlspecialcharsbx($tz)?>"<?=($arResult["CONFIG"]["WORKTIME_TIMEZONE"] == $tz? ' selected="selected"' : '')?>>
														<?=htmlspecialcharsbx($tz_name)?>
													</option>
													<?
												}
											}
											?>
										</select>
									</div>
								</div>
								<?
								if (!empty($arResult["WORKTIME_LIST_FROM"]) && !empty($arResult["WORKTIME_LIST_TO"]))
								{
									?>
									<div class="ui-control-container ui-control-select">
										<div class="ui-control-subtitle">
											<?=Loc::getMessage("IMOL_CONFIG_EDIT_WORKTIME_TIME")?>
										</div>
										<div class="ui-control-inner">
											<select name="CONFIG[WORKTIME_FROM]" class="ui-control-input">
												<?
												foreach($arResult["WORKTIME_LIST_FROM"] as $key => $val)
												{
													?>
													<option value="<?= $key?>" <?if ($arResult["CONFIG"]["WORKTIME_FROM"] == $key) echo ' selected="selected" ';?>>
														<?= $val?>
													</option>
													<?
												}
												?>
											</select>
											<select name="CONFIG[WORKTIME_TO]" class="ui-control-input">
												<?
												foreach($arResult["WORKTIME_LIST_TO"] as $key => $val)
												{
													?>
													<option value="<?= $key?>" <?if ($arResult["CONFIG"]["WORKTIME_TO"] == $key) echo ' selected="selected" ';?>>
														<?= $val?>
													</option>
													<?
												}
												?>
											</select>
										</div>
									</div>
									<?
								}
								?>
								<div class="ui-control-container ui-control-select">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_WORKTIME_DAYOFF")?>
									</div>
									<div class="ui-control-inner">
										<select size="7" multiple="true" name="CONFIG[WORKTIME_DAYOFF][]" class="ui-control-input ui-control-select-multiple">
											<?
											foreach($arResult["WEEK_DAYS"] as $day)
											{
												?>
												<option value="<?=$day?>" <?=(is_array($arResult["CONFIG"]["WORKTIME_DAYOFF"]) && in_array($day, $arResult["CONFIG"]["WORKTIME_DAYOFF"]) ? ' selected="selected"' : '')?>>
													<?= Loc::getMessage('IMOL_CONFIG_WEEK_'.$day)?>
												</option>
												<?
											}
											?>
										</select>
									</div>
								</div>
								<div class="ui-control-container">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_WORKTIME_HOLIDAYS")?>
									</div>
									<div class="ui-control-inner">
										<input type="text"
											   name="CONFIG[WORKTIME_HOLIDAYS]"
											   class="ui-control-input"
											   value="<?=htmlspecialcharsbx($arResult["CONFIG"]["WORKTIME_HOLIDAYS"])?>">
									</div>
									<div class="ui-control-subtitle">
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_WORKTIME_HOLIDAYS_EXAMPLE")?>
									</div>
								</div>
								<div class="ui-control-container ui-control-select">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_WORKTIME_DAYOFF_RULE_NEW")?>
									</div>
									<div class="ui-control-inner">
										<select name="CONFIG[WORKTIME_DAYOFF_RULE]" id="imol_worktime_dayoff_rule" class="ui-control-input">
											<?
											foreach($arResult["SELECT_RULES"] as $value => $name)
											{
												?>
												<option value="<?=$value?>" <?if($arResult["CONFIG"]["WORKTIME_DAYOFF_RULE"] == $value) { ?>selected<? }?> <?if($value == 'disabled') { ?>disabled<? }?>>
													<?=$name?>
												</option>
												<?
											}
											?>
										</select>
									</div>
								</div>
								<div class="ui-control-container ui-control-select" id="imol_worktime_dayoff_rule_form">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_WORKTIME_DAYOFF_FORM_ID")?>
									</div>
									<div class="ui-control-inner">
										<select class="ui-control-input" name="CONFIG[WORKTIME_DAYOFF_FORM_ID]"></select>
									</div>
									<div class="ui-control-subtitle">
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_WORKTIME_DAYOFF_FORM_ID_NOTICE")?>
									</div>
								</div>
								<div class="ui-control-container ui-control-block" id="imol_worktime_dayoff_rule_text">
									<div class="ui-control-subtitle">
										<?=Loc::getMessage('IMOL_CONFIG_EDIT_WORKTIME_DAYOFF_TEXT')?>
									</div>
									<div class="ui-control-inner">
										<textarea class="ui-control-input ui-control-textarea" name="CONFIG[WORKTIME_DAYOFF_TEXT]"><?=htmlspecialcharsbx($arResult["CONFIG"]["WORKTIME_DAYOFF_TEXT"])?></textarea>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="ui-form-settings-row">
						<div class="ui-form-settings-block-left">
							<div class="ui-form-settings-title">
								<?=Loc::getMessage('IMOL_CONFIG_EDIT_HISTORY_SETTINGS')?>
							</div>
						</div>
						<div class="ui-form-settings-block-right">
							<div class="ui-control-checkbox-container">
								<label class="ui-control-checkbox-label">
									<input type="checkbox"
										   id="imol_history_checkbox"
										   name="CONFIG[RECORDING]"
										   checked
										   value="Y"
										   disabled
										   class="ui-control-checkbox">
									<?=Loc::getMessage('IMOL_CONFIG_RECORDING')?>
									<span data-hint="<?=GetMessageJS('IMOL_CONFIG_RECORDING_DESC')?>"></span>
								</label>
							</div>
						</div>
					</div>
					<div class="ui-form-settings-row ui-form-settings-multiple-lines">
						<div class="ui-form-settings-block-left">
							<div class="ui-form-settings-title">
								<?=Loc::getMessage('IMOL_CONFIG_EDIT_WARNINGS')?>
							</div>
						</div>
						<div class="ui-form-settings-block-right">
							<div class="ui-control-checkbox-container imopenlines-agreement-container">
								<label class="ui-control-checkbox-label">
									<input type="checkbox"
										   class="ui-control-checkbox"
										   id="imol_agreement_message"
										   name="CONFIG[AGREEMENT_MESSAGE]"
										   value="Y"
										   <? if ($arResult['CONFIG']['AGREEMENT_MESSAGE'] == "Y") { ?>checked<? } ?>>
									<?=Loc::getMessage("IMOL_CONFIG_EDIT_AGREEMENT_MESSAGE")?>
								</label>
							</div>
							<div id="imol_agreement_message_block" <? if ($arResult['CONFIG']['AGREEMENT_MESSAGE'] != "Y") { ?>class="invisible" <? } ?>>
								<div class="ui-control-container">
									<?$APPLICATION->IncludeComponent(
										"bitrix:intranet.userconsent.selector",
										"",
										array(
											'ID' => $arResult['CONFIG']['AGREEMENT_ID'],
											'INPUT_NAME' => 'CONFIG[AGREEMENT_ID]'
										)
									);?>
								</div>
							</div>
						</div>
					</div>
					<div class="ui-form-settings-row ui-form-settings-multiple-lines">
						<div class="ui-form-settings-block-left">
							<div class="ui-form-settings-title">
								<?=Loc::getMessage('IMOL_CONFIG_EDIT_QUALITY_MARK')?>
							</div>
						</div>
						<div class="ui-form-settings-block-right">
							<div class="ui-control-checkbox-container">
								<label class="ui-control-checkbox-label">
									<input type="checkbox"
										   class="ui-control-checkbox"
										   id="imol_vote_message"
										   name="CONFIG[VOTE_MESSAGE]"
										   value="Y"
										   <? if ($arResult['CONFIG']['VOTE_MESSAGE'] == "Y") { ?>checked<? } ?>>
									<?=Loc::getMessage("IMOL_CONFIG_EDIT_VOTE_MESSAGE")?>
									<?
									if (!Limit::canUseVoteClient() || Limit::isDemoLicense())
									{
										?>
										<span id="imol_vote"
											  data-hint="<?=GetMessageJS('IMOL_CONFIG_LOCK_ALT')?>">
										</span>
										<?
										if (!Limit::canUseVoteClient())
										{
											?>
											<script type="text/javascript">
												BX.bind(BX('imol_vote_message'), 'change', function(e){
													BX('imol_vote_message').checked = false;
													window.BX.imolTrialHandler.openPopupQueueVote();
												});
											</script>
											<?
										}
									}
									?>
								</label>
							</div>
							<?/*Block from old template - important, but without new markup*/?>
							<div id="imol_vote_message_block" <? if ($arResult['CONFIG']['VOTE_MESSAGE'] != "Y") { ?>class="invisible"<? } ?>>

								<div class="ui-control-checkbox-container">
									<label class="ui-control-checkbox-label">
										<input type="checkbox"
											   class="ui-control-checkbox"
											   id="imol_vote_message"
											   name="CONFIG[VOTE_CLOSING_DELAY]"
											   value="Y"
											   <? if ($arResult['CONFIG']['VOTE_CLOSING_DELAY'] == "Y") { ?>checked<? } ?>>
										<?=Loc::getMessage("IMOL_CONFIG_EDIT_VOTE_CLOSING_DELAY")?>
									</label>
								</div>

								<div class="ui-control-container imopenlines-vote-block">
									<div class="imol-vote-container">
										<div class="imol-vote-title">
											<?=Loc::getMessage('IMOL_CONFIG_EDIT_VOTE_MESSAGE_1_TITLE')?>
										</div>
										<div class="imol-vote-inner">
											<div class="imol-vote-block">
												<div class="imol-vote-description">
													<?=Loc::getMessage('IMOL_CONFIG_EDIT_VOTE_MESSAGE_TEXT')?>
												</div>
												<div class="imol-vote-content-border-element imol-vote-content-middle">
													<div class="imol-vote-content-element-block">
														<div class="imol-vote-content-element">
																<span class="imol-vote-text-container-input">
																	<span class="imol-vote-text-container-input-text">
																		<?=str_replace(array('[BR]', '[br]', '#BR#', "\n"), '<br/>', htmlspecialcharsbx($arResult['CONFIG']['VOTE_MESSAGE_1_TEXT']))?>
																	</span>
																	<div class="imol-vote-content-button" onclick="BX.toggleClass(this.parentNode.parentNode.parentNode, 'imol-vote-state');">
																		<div class="imol-vote-content-button-item">
																			<?=Loc::getMessage('IMOL_CONFIG_EDIT_BUTTON')?>
																		</div>
																	</div>
																</span>
														</div>
														<div class="ui-control-inner">
															<textarea class="imol-vote-content-text-control imol-vote-content-hidden-element imol-vote-content-border-element imol-vote-content-textarea imol-vote-content-textarea-small"
																	  name="CONFIG[VOTE_MESSAGE_1_TEXT]"><?=str_replace(array('[BR]', '[br]', '#BR#'), "\n", htmlspecialcharsbx($arResult['CONFIG']['VOTE_MESSAGE_1_TEXT']))?></textarea>
														</div>
													</div>
													<div class="imol-vote-content-icon-block">
														<div class="imol-vote-content-icon imol-vote-content-icon-like-big"></div>
														<div class="imol-vote-content-icon imol-vote-content-icon-dislike-big"></div>
													</div>
												</div>
											</div>
											<div class="imol-vote-block-icon imol-vote-icon-like-small"></div>
											<div class="imol-vote-block">
												<div class="imol-vote-description">
													<?=Loc::getMessage('IMOL_CONFIG_EDIT_VOTE_MESSAGE_LIKE')?>
												</div>
												<div class="imol-vote-content-border-element imol-vote-content-middle">
													<div class="imol-vote-content-element-block">
														<div class="imol-vote-content-element">
																<span class="imol-vote-text-container-input">
																	<span class="imol-vote-text-container-input-text">
																		<?=str_replace(array('[BR]', '[br]', '#BR#', "\n"), '<br/>', htmlspecialcharsbx($arResult['CONFIG']['VOTE_MESSAGE_1_LIKE']))?>
																	</span>
																	<div class="imol-vote-content-button" onclick="BX.toggleClass(this.parentNode.parentNode.parentNode, 'imol-vote-state');">
																		<div class="imol-vote-content-button-item">
																			<?=Loc::getMessage('IMOL_CONFIG_EDIT_BUTTON')?>
																		</div>
																	</div>
																</span>
														</div>
														<div class="ui-control-inner">
															<textarea class="imol-vote-content-text-control imol-vote-content-hidden-element imol-vote-content-border-element imol-vote-content-textarea imol-vote-content-textarea-small"
																	  name="CONFIG[VOTE_MESSAGE_1_LIKE]"><?=str_replace(array('[BR]', '[br]', '#BR#'), "\n", htmlspecialcharsbx($arResult['CONFIG']['VOTE_MESSAGE_1_LIKE']))?></textarea>
														</div>
													</div>
													<div class="imol-vote-content-icon imol-vote-content-icon-smile"></div>
												</div>
											</div>
											<div class="imol-vote-block-icon imol-vote-icon-dislike-small"></div>
											<div class="imol-vote-block">
												<div class="imol-vote-description">
													<?=Loc::getMessage('IMOL_CONFIG_EDIT_VOTE_MESSAGE_DISLIKE')?>
												</div>
												<div class="imol-vote-content-border-element imol-vote-content-middle">
													<div class="imol-vote-content-element-block">
														<div class="imol-vote-content-element">
																<span class="imol-vote-text-container-input">
																	<span class="imol-vote-text-container-input-text">
																		<?=str_replace(array('[BR]', '[br]', '#BR#', "\n"), '<br/>', htmlspecialcharsbx($arResult['CONFIG']['VOTE_MESSAGE_1_DISLIKE']))?>
																	</span>
																	<div class="imol-vote-content-button" onclick="BX.toggleClass(this.parentNode.parentNode.parentNode, 'imol-vote-state');">
																		<div class="imol-vote-content-button-item">
																			<?=Loc::getMessage('IMOL_CONFIG_EDIT_BUTTON')?>
																		</div>
																	</div>
																</span>
														</div>
														<div class="ui-control-inner">
															<textarea class="imol-vote-content-text-control imol-vote-content-hidden-element imol-vote-content-border-element imol-vote-content-textarea imol-vote-content-textarea-small"
																	  name="CONFIG[VOTE_MESSAGE_1_DISLIKE]"><?=str_replace(array('[BR]', '[br]', '#BR#'), "\n", htmlspecialcharsbx($arResult['CONFIG']['VOTE_MESSAGE_1_DISLIKE']))?></textarea>
														</div>
													</div>
													<div class="imol-vote-content-icon imol-vote-content-icon-sad"></div>
												</div>
											</div>
										</div>
										<div class="imol-vote-important-info">
											<?=Loc::getMessage('IMOL_CONFIG_EDIT_VOTE_MESSAGE_1_DESC')?>
										</div>
									</div>
									<div class="imol-vote-container">
										<div class="imol-vote-title">
											<?=Loc::getMessage('IMOL_CONFIG_EDIT_VOTE_MESSAGE_2_TITLE')?>
										</div>
										<div class="imol-vote-inner">
											<div class="imol-vote-block">
												<div class="imol-vote-description"><?=Loc::getMessage('IMOL_CONFIG_EDIT_VOTE_MESSAGE_TEXT')?></div>
												<div class="imol-vote-content-border-element imol-vote-content-small">
													<div class="imol-vote-content-element">
															<span class="imol-vote-text-container">
																<span class="imol-vote-text-container-input">
																	<?=str_replace(array('[BR]', '[br]', '#BR#', "\n"), '<br/>', htmlspecialcharsbx($arResult['CONFIG']['VOTE_MESSAGE_2_TEXT']))?>
																</span>
															</span>
														<div class="imol-vote-content-button" onclick="BX.toggleClass(this.parentNode.parentNode.parentNode, 'imol-vote-state');">
															<div class="imol-vote-content-button-item">
																<?=Loc::getMessage('IMOL_CONFIG_EDIT_BUTTON')?>
															</div>
														</div>
													</div>
													<div class="ui-control-inner">
														<textarea class="imol-vote-content-text-control imol-vote-content-hidden-element imol-vote-content-border-element imol-vote-content-textarea"
																  name="CONFIG[VOTE_MESSAGE_2_TEXT]"><?=str_replace(array('[BR]', '[br]', '#BR#'), "\n", htmlspecialcharsbx($arResult['CONFIG']['VOTE_MESSAGE_2_TEXT']))?></textarea>
													</div>
												</div>
											</div>
											<div class="imol-vote-block-icon imol-vote-icon-like-small"></div>
											<div class="imol-vote-block">
												<div class="imol-vote-description">
													<?=Loc::getMessage('IMOL_CONFIG_EDIT_VOTE_MESSAGE_LIKE')?>
												</div>
												<div class="imol-vote-content-border-element imol-vote-content-small">
													<div class="imol-vote-content-element">
															<span class="imol-vote-text-container">
																<span class="imol-vote-text-container-input">
																	<?=str_replace(array('[BR]', '[br]', '#BR#', "\n"), '<br/>', htmlspecialcharsbx($arResult['CONFIG']['VOTE_MESSAGE_2_LIKE']))?>
																</span>
															</span>
														<div class="imol-vote-content-button" onclick="BX.toggleClass(this.parentNode.parentNode.parentNode, 'imol-vote-state');">
															<div class="imol-vote-content-button-item">
																<?=Loc::getMessage('IMOL_CONFIG_EDIT_BUTTON')?>
															</div>
														</div>
													</div>
													<div class="ui-control-inner">
														<textarea class="imol-vote-content-text-control imol-vote-content-hidden-element imol-vote-content-border-element imol-vote-content-textarea"
																  name="CONFIG[VOTE_MESSAGE_2_LIKE]"><?=str_replace(array('[BR]', '[br]', '#BR#'), "\n", htmlspecialcharsbx($arResult['CONFIG']['VOTE_MESSAGE_2_LIKE']))?></textarea>
													</div>
												</div>
											</div>
											<div class="imol-vote-block-icon imol-vote-icon-dislike-small"></div>
											<div class="imol-vote-block">
												<div class="imol-vote-description">
													<?=Loc::getMessage('IMOL_CONFIG_EDIT_VOTE_MESSAGE_DISLIKE')?>
												</div>
												<div class="imol-vote-content-border-element imol-vote-content-small">
													<div class="imol-vote-content-element">
															<span class="imol-vote-text-container">
																<span class="imol-vote-text-container-input">
																	<?=str_replace(array('[BR]', '[br]', '#BR#', "\n"), '<br/>', htmlspecialcharsbx($arResult['CONFIG']['VOTE_MESSAGE_2_DISLIKE']))?>
																</span>
															</span>
														<div class="imol-vote-content-button" onclick="BX.toggleClass(this.parentNode.parentNode.parentNode, 'imol-vote-state');">
															<div class="imol-vote-content-button-item">
																<?=Loc::getMessage('IMOL_CONFIG_EDIT_BUTTON')?>
															</div>
														</div>
													</div>
													<div class="ui-control-inner">
														<textarea class="imol-vote-content-text-control imol-vote-content-hidden-element imol-vote-content-border-element imol-vote-content-textarea"
																  name="CONFIG[VOTE_MESSAGE_2_DISLIKE]"><?=str_replace(array('[BR]', '[br]', '#BR#'), "\n", htmlspecialcharsbx($arResult['CONFIG']['VOTE_MESSAGE_2_DISLIKE']))?></textarea>
													</div>
												</div>
											</div>
										</div>
										<div class="imol-vote-important-info">
											<?=Loc::getMessage('IMOL_CONFIG_EDIT_VOTE_MESSAGE_2_DESC')?>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="ui-form-settings-row">
						<div class="ui-form-settings-block-left">
							<div class="ui-form-settings-title">
								<?=Loc::getMessage("IMOL_CONFIG_EDIT_LANG")?>
								<span data-hint="<?=htmlspecialcharsbx(Loc::getMessage("IMOL_CONFIG_EDIT_LANG_EMAIL_TIP"))?>"></span>
							</div>
						</div>
						<div class="ui-form-settings-block-right">
							<div class="ui-control-container ui-control-select">
								<div class="ui-control-inner">
									<select name="CONFIG[LANGUAGE_ID]" id="imol_lang_select" class="ui-control-input">
										<?
										foreach ($arResult['LANGUAGE_LIST'] as $lang => $langText)
										{
											?>
											<option value="<?=$lang?>" <?if($arResult["CONFIG"]["LANGUAGE_ID"] == $lang) { ?>selected<? }?>>
												<?=$langText?>
											</option>
											<?
										}
										?>
									</select>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="ui-btn-container">
				<?
				if ($arResult['CAN_EDIT'])
				{
					?>
					<?
					if (!$arResult['IFRAME'])
					{
						?>
						<span class="ui-btn ui-btn-primary" onclick="BX.submit(BX('imol_config_edit_form'))">
							<?=Loc::getMessage("IMOL_CONFIG_EDIT_SAVE")?>
						</span>
						<?
					}
					?>
					<span class="ui-btn ui-btn-primary" onclick="BX('imol_config_edit_form_action').value = 'apply';BX.submit(BX('imol_config_edit_form'))">
						<?=Loc::getMessage("IMOL_CONFIG_EDIT_APPLY")?>
					</span>
					<?
				}
				?>
				<a href="<?=$arResult['PATH_TO_LIST']?>"
				   target="_top"
				   class="ui-btn ui-btn-light-border">
					<?=Loc::getMessage("IMOL_CONFIG_EDIT_BACK")?>
				</a>
			</div>
		</div>
	</form>
</div>