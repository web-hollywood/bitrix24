<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) die();
use \Bitrix\Main\Localization\Loc;
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
/** $arResult["CONNECTION_STATUS"]; */
/** $arResult["REGISTER_STATUS"]; */
/** $arResult["ERROR_STATUS"]; */
/** $arResult["SAVE_STATUS"]; */

Loc::loadMessages(__FILE__);

CJSCore::Init(array('clipboard'));

if ($arParams['INDIVIDUAL_USE'] != 'Y')
{
	$this->addExternalCss('/bitrix/components/bitrix/imconnector.settings/templates/.default/style.css');
	$this->addExternalJs('/bitrix/components/bitrix/imconnector.settings/templates/.default/script.js');
	\Bitrix\Main\UI\Extension::load("ui.buttons");
	\Bitrix\Main\UI\Extension::load("ui.hint");
	\Bitrix\ImConnector\Connector::initIconCss();
}

$iconCode = \Bitrix\ImConnector\Connector::getIconByConnector($arResult["CONNECTOR"]);
?>
<form action="<?=$arResult["URL"]["DELETE"]?>" method="post" id="form_delete_<?=$arResult["CONNECTOR"]?>">
	<input type="hidden" name="<?=$arResult["CONNECTOR"]?>_form" value="true">
	<input type="hidden" name="<?=$arResult["CONNECTOR"]?>_del" value="Y">
	<?=bitrix_sessid_post();?>
</form>
<?
if (empty($arResult['PAGE']) && $arResult['ACTIVE_STATUS']) //case when first time open active connector
{
	?>
	<div class="imconnector-field-container">
		<div class="imconnector-field-section imconnector-field-section-social">
			<div class="imconnector-field-box">
				<div class="connector-icon ui-icon ui-icon-service-<?=$iconCode?>"><i></i></div>
			</div>
			<div class="imconnector-field-box">
				<div class="imconnector-field-main-subtitle">
					<?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_CONNECTED')?>
				</div>
				<div class="imconnector-field-box-content">
					<?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_DESCRIPTION_1')?>
				</div>
				<div class="ui-btn-container">
					<a href="<?=$arResult["URL"]["SIMPLE_FORM"]?>" class="ui-btn ui-btn-primary show-preloader-button">
						<?=Loc::getMessage('IMCONNECTOR_COMPONENT_SETTINGS_CHANGE_SETTING')?>
					</a>
					<button class="ui-btn ui-btn-light-border"
							onclick="popupShow(<?=CUtil::PhpToJSObject($arResult["CONNECTOR"])?>)">
						<?=Loc::getMessage('IMCONNECTOR_COMPONENT_SETTINGS_DISABLE')?>
					</button>
				</div>
			</div>
		</div>
	</div>
	<?include 'messages.php'?>
	<div class="imconnector-field-container">
		<div class="imconnector-field-section">
			<div class="imconnector-field-main-title">
				<?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_INFO')?>
			</div>
			<div class="imconnector-field-box">
				<div class="imconnector-field-box-entity-row">

					<?
					if ($arResult["INFO_CONNECTION"]['URL_CODE_PUBLIC_ID'] > 0)
					{
						?>
						<div class="imconnector-field-box-subtitle">
							<?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_LINK')?>
						</div>
						<span class="imconnector-field-box-text-bold">
							<?=htmlspecialcharsbx($arResult["INFO_CONNECTION"]["URL_PUBLIC"])?>
						</span>
						<span class="imconnector-field-box-entity-icon-copy-to-clipboard copy-to-clipboard"
							  data-text="<?=htmlspecialcharsbx(CUtil::JSEscape($arResult["INFO_CONNECTION"]["URL_PUBLIC"]))?>"></span>
						<?
					}
					else
					{
						?>
						<div class="imconnector-field-box-subtitle">
							<?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_WO_PUBLUC')?>
						</div>
						<?
					}
					?>

				</div>
			</div>
		</div>
	</div>
	<?
}
elseif (!$arResult['ACTIVE_STATUS']) //case when open not active connector
{
	?>
	<div class="imconnector-field-container">
		<div class="imconnector-field-section imconnector-field-section-social">
			<div class="imconnector-field-box">
				<div class="connector-icon ui-icon ui-icon-service-<?=$iconCode?>"><i></i></div>
			</div>
			<div class="imconnector-field-box">
				<div class="imconnector-field-main-subtitle">
					<?= $arResult['NAME'] ?>
				</div>
				<div class="imconnector-field-box-content">
					<?= Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_INDEX_DESCRIPTION') ?>
				</div>
			</div>
		</div>
	</div>
	<?include 'messages.php'?>
	<div class="imconnector-field-container">
		<div class="imconnector-field-section">
			<div class="imconnector-field-main-title">
				<?= Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_CONNECT_ACTIVE') ?>
			</div>
			<div class="imconnector-field-box">
				<div class="imconnector-field-box-content">
					<?= Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_INDEX_DESCRIPTION') ?>
				</div>
			</div>
			<div class="imconnector-field-social-connector">
				<div class="connector-icon ui-icon ui-icon-service-<?=$iconCode?> imconnector-field-social-connector-icon"><i></i></div>
				<form action="<?= $arResult["URL"]["SIMPLE_FORM"] ?>" method="post">
					<input type="hidden" name="<?= $arResult["CONNECTOR"] ?>_form" value="true">
					<?= bitrix_sessid_post(); ?>
					<button class="ui-btn ui-btn-light-border"
							name="<?= $arResult["CONNECTOR"] ?>_active"
							type="submit"
							value="<?= Loc::getMessage('IMCONNECTOR_COMPONENT_SETTINGS_TO_CONNECT') ?>">
						<?= Loc::getMessage('IMCONNECTOR_COMPONENT_SETTINGS_TO_CONNECT') ?>
					</button>
				</form>
			</div>
		</div>
	</div>
	<?
}
else
{
	?>
	<div class="imconnector-field-container">
		<div class="imconnector-field-section imconnector-field-section-social">
			<div class="imconnector-field-box">
				<div class="connector-icon ui-icon ui-icon-service-<?=$iconCode?>"><i></i></div>
			</div>
			<div class="imconnector-field-box">
				<div class="imconnector-field-main-subtitle">
					<?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_CONNECTED')?>
				</div>
			</div>
		</div>
	</div>
	<?include 'messages.php'?>
	<div class="imconnector-field-container">
		<div class="imconnector-field-section">
			<form action="<?=$arResult["URL"]["SIMPLE_FORM"]?>" method="post" enctype="multipart/form-data">
				<input type="hidden" name="<?=$arResult["CONNECTOR"]?>_form" value="true">
				<div class="imconnector-step-text imconnector-livechat-inner-container" style="padding-top: 0;">
					<div class="imconnector-livechat-public-link">
						<?
						if ($arResult['INFO_CONNECTION']['BUTTON_INTERFACE'] == 'Y')
						{
							?>
							<div class="imconnector-livechat-public-link-header">
								<div class="imconnector-livechat-public-link-header-item">
									<?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_WIDGET')?>
								</div>
							</div>

							<div class="imconnector-livechat-public-link-inner">
								<?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_BUTTON_TEXT', array(
									'#LINK#' => '<a href=" ' . $arResult["PUBLIC_TO_BUTTON_OL"] . '" target="_blank">'.Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_BUTTON_LINK').'</a>'
								));?>
							</div>
							<?
						}
						?>
						<div class="imconnector-livechat-public-link-header">
							<div class="imconnector-livechat-public-link-header-item">
								<?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_PL_HEADER')?>
							</div>
						</div><!--imconnector-livechat-public-link-header-->
						<div class="imconnector-livechat-public-link-inner">
							<div class="imconnector-livechat-public-link-inner-copy">
								<div class="imconnector-livechat-public-link-inner-copy-inner">
									<div class="imconnector-livechat-public-link-inner-copy-field">
										<span><?=htmlspecialcharsbx($arResult['INFO_CONNECTION']['URL_SERVER'])?></span>
										<input id="imconnector-livechat-public-link-url-code" class="imconnector-livechat-public-link-inner-copy-field-item imconnector-livechat-public-link-inner-copy-field-item-livechat" type="text" placeholder="<?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_NAME')?>" name="URL_CODE_PUBLIC" value="<?=htmlspecialcharsbx($arResult['INFO_CONNECTION']['URL_CODE_PUBLIC'])?>">
									</div>
									<div class="imconnector-livechat-public-link-inner-copy-button">
										<span class="webform-small-button imconnector-public-link-inner-copy-button-item" id="imconnector-copy-public-link"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_COPY')?></span>
									</div>
								</div><!--imconnector-livechat-public-link-inner-copy-inner-->
								<div class="imconnector-livechat-public-link-inner-copy-description">
									<div class="imconnector-livechat-public-link-inner-copy-description-item">
										<?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_LINK_TIP')?>
									</div>
									<div id="imconnector-copy-public-link-content-box" class="imconnector-copy-public-link-content-box" style="height: <?=(empty($arResult['INFO_CONNECTION']['URL_CODE_PUBLIC'])? '0px': '20px')?>;">
										<span class="imconnector-livechat-public-link-inner-copy-description-item"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_FINAL_LINK')?>:</span>
										<span class="imconnector-livechat-public-link-inner-copy-description-link" id="imconnector-copy-public-link-content" data-pattern="<?=htmlspecialcharsbx($arResult['INFO_CONNECTION']['URL_SERVER'])?>"><?=htmlspecialcharsbx($arResult['INFO_CONNECTION']['URL_PUBLIC'])?></span>
									</div>
									<div class="imconnector-livechat-public-link-inner-copy-description-item">(<?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_LINK_NOTICE')?>)</div>
								</div>
								<div class="imconnector-livechat-public-link-inner-copy-description">
								</div>
								<script type="text/javascript">
									BX.clipboard.bindCopyClick(BX('imconnector-copy-public-link'), {text: BX('imconnector-copy-public-link-content'), offsetLeft: 130});
									BX.lastCheck = {};
									BX.bind(BX('imconnector-livechat-public-link-url-code'), 'bxchange', function(){
										clearTimeout(BX.tempTimeout1);
										BX.tempTimeout1 = setTimeout(function(){
											imconnectorCheckUrlCode(BX('imconnector-livechat-public-link-url-code').value, 'formatName');
											BX.lastCheck['checkName'] = '';
										}, 400);

										clearTimeout(BX.tempTimeout2);
										BX.tempTimeout2 = setTimeout(function(){
											imconnectorCheckUrlCode(BX('imconnector-livechat-public-link-url-code').value, 'checkName');
										}, 2000);

									});
									function imconnectorCheckUrlCode(text, command)
									{
										if (BX.lastCheck[command] == text)
											return true;

										BX.lastCheck[command] = text;

										BX.ajax({
											url: '<?=$this->getComponent()->getPath().'/ajax.php'?>',
											method: 'POST',
											data: {
												'ACTION': command,
												'CONFIG_ID': <?=intval($arResult['INFO_CONNECTION']['CONFIG_ID'])?>,
												'ALIAS': text,
												'sessid': BX.bitrix_sessid()
											},
											timeout: 30,
											dataType: 'json',
											processData: true,
											onsuccess: function(data){
												data = data || {};
												if (command == 'formatName')
												{
													BX('imconnector-copy-public-link-content').href = BX('imconnector-copy-public-link-content').getAttribute('data-pattern')+data.ALIAS;
													BX('imconnector-copy-public-link-content').innerHTML = BX('imconnector-copy-public-link-content').href;
													BX.removeClass(BX('imconnector-livechat-public-link-url-code'), 'imconnector-livechat-public-link-inner-copy-field-item-livechat-error');
													BX('imconnector-copy-public-link-content-box').style = data.ALIAS? 'height: 20px': 'height: 0px';
												}
												else if (command == 'checkName')
												{
													if (data.AVAILABLE == 'N')
													{
														BX.addClass(BX('imconnector-livechat-public-link-url-code'), 'imconnector-livechat-public-link-inner-copy-field-item-livechat-error');
													}
												}
											}
										});
									}
								</script>
							</div><!--imconnector-livechat-public-link-inner-copy-->
							<div class="imconnector-livechat-border"></div><!--imconnector-livechat-border-->
						</div><!--imconnector-livechat-public-link-inner-->
					</div><!--imconnector-livechat-public-link-->
					<?/**/?>
					<div id="imconnector-livechat-public-link-settings-toggle" class="imconnector-livechat-public-link-settings" style="margin-top: 2px;">
						<span class="imconnector-livechat-public-link-settings-item"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_CONFIG')?></span>
						<span class="imconnector-livechat-public-link-settings-triangle-down"></span>
					</div><!--imconnector-livechat-public-link-settings-->
					<input type="hidden" name="open_block" id="imconnector-livechat-open-block" value="<?=$arResult['OPEN_BLOCK']?>">
					<div id="imconnector-livechat-open" class="imconnector-livechat-public-link-settings-inner<?=empty($arResult['OPEN_BLOCK'])?'':' imconnector-livechat-public-open';?>">
						<div class="imconnector-livechat-public-link-settings-inner-container">
							<span class="imconnector-livechat-public-link-settings-inner-param"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_TYPE')?>:</span>
							<div class="imconnector-livechat-public-link-settings-inner-content">
								<div class="imconnector-livechat-public-link-settings-inner-type">
									<?/*
										<span class="imconnector-livechat-public-link-settings-inner-chat">
											<label for="colorless" class="imconnector-livechat-public-link-settings-inner-chat-container">
												<div class="imconnector-livechat-public-link-settings-inner-chat-image imconnector-livechat-colorless"></div>
												<div class="imconnector-livechat-public-link-settings-inner-field-container">
													<input id="colorless" class="imconnector-public-link-settings-inner-chat-field" type="radio" value="colorless" name="TEMPLATE_ID" <?=($arResult['INFO_CONNECTION']['TEMPLATE_ID'] == "colorless"? "checked": "")?>>
													<span class="imconnector-public-link-settings-inner-chat-text"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_TYPE_1')?></span>
												</div>
											</label><!--imconnector-livechat-public-link-settings-inner-chat-container-->
										</span><!--imconnector-livechat-public-link-settings-inner-chat-->
											<span class="imconnector-livechat-public-link-settings-inner-chat">
											<label for="color" class="imconnector-livechat-public-link-settings-inner-chat-container">
												<div class="imconnector-livechat-public-link-settings-inner-chat-image imconnector-livechat-color"></div>
												<div class="imconnector-livechat-public-link-settings-inner-field-container">
													<input id="color" class="imconnector-public-link-settings-inner-chat-field" type="radio" value="color" name="TEMPLATE_ID" <?=($arResult['INFO_CONNECTION']['TEMPLATE_ID'] == "color"? "checked": "")?>>
													<span class="imconnector-public-link-settings-inner-chat-text"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_TYPE_2')?></span>
												</div>
											</label><!--imconnector-livechat-public-link-settings-inner-chat-container-->
										</span><!--imconnector-livechat-public-link-settings-inner-chat-->
										*/?>
									<div class="imconnector-livechat-public-link-settings-inner-upload">
										<div class="imconnector-public-public-link-settings-inner-upload-description">
												<span class="imconnector-public-link-settings-inner-upload-description-item">
													<?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_IMAGE_LOAD')?>
												</span>
										</div>
										<div class="imconnector-livechat-public-link-settings-inner-upload-field">
											<button class="imconnector-livechat-public-link-settings-inner-upload-button"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_IMAGE_LOAD_BUTTON')?></button>
											<input class="imconnector-livechat-public-link-settings-inner-upload-item" type="file" name="BACKGROUND_IMAGE">
										</div>
										<span id="BACKGROUND_IMAGE_TEXT" class="imconnector-livechat-public-link-settings-inner-upload-info"></span>
										<?
										if($arResult['INFO_CONNECTION']['BACKGROUND_IMAGE'] > 0)
										{
											?>
											<label class="imconnector-livechat-public-link-upload-checkbox-container" for="BACKGROUND_IMAGE_del">
												<input type="checkbox" class="imconnector-livechat-public-link-upload-checkbox" value="Y" name="BACKGROUND_IMAGE_del" id="BACKGROUND_IMAGE_del">
												<span class="imconnector-livechat-public-link-upload-checkbox-element"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_IMAGE_DELETE')?></span>
											</label>
											<div class="imconnector-livechat-public-link-upload-image-container">
												<img class="imconnector-livechat-public-link-upload-image" alt="" src="<?=$arResult['INFO_CONNECTION']['BACKGROUND_IMAGE_LINK']?>">
											</div>
											<?
										}
										?>
									</div><!--imconnector-livechat-public-link-settings-inner-upload-->
								</div><!--imconnector-livechat-public-link-settings-inner-type-->
							</div><!--imconnector-livechat-public-link-settings-inner-content-->
						</div><!--imconnector-livechat-public-link-settings-inner-container-->

						<div class="imconnector-border"></div><!--imconnector-border-->
						<div class="imconnector-livechat-public-link-settings-inner-settings-container">
							<span class="imconnector-livechat-public-link-settings-inner-param imconnector-livechat-public-link-settings-inner-param-text-input"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PHONE_CODE')?>:</span>
							<div class="imconnector-livechat-public-link-settings-inner-content">
								<div class="imconnector-public-link-settings-inner-option">
									<label for="phone_code" class="imconnector-livechat-public-link-settings-inner-option-container">
										<input type="text" placeholder="<?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PHONE_CODE_PLACEHOLDER')?>" class="imconnector-livechat-public-link-settings-inner-add-input" name="PHONE_CODE" value="<?=htmlspecialcharsbx($arResult['INFO_CONNECTION']['PHONE_CODE'])?>">
									</label><!--imconnector-livechat-public-link-settings-inner-option-container-->
								</div><!--imconnector-public-link-settings-inner-option-->
							</div>
						</div><!--imconnector-livechat-public-link-settings-inner-container-->

						<div class="imconnector-border"></div><!--imconnector-border-->
						<div class="imconnector-livechat-public-link-settings-inner-settings-container">
							<span class="imconnector-livechat-public-link-settings-inner-param"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_CSS')?>:</span>
							<div class="imconnector-livechat-public-link-settings-inner-content">
								<div class="imconnector-public-link-settings-inner-option" onchange="BX.toggleClass(BX('imconnector-add-open'), 'imconnector-livechat-public-add-open');">
									<label for="css" class="imconnector-livechat-public-link-settings-inner-option-container">
										<input id="css" class="imconnector-public-link-settings-inner-option-field" type="checkbox" name="CSS_ACTIVE" <?=($arResult['INFO_CONNECTION']['CSS_ACTIVE'] == "Y"? "checked": "")?>>
										<span class="imconnector-public-link-settings-inner-option-text"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_CSS_2')?></span>
									</label><!--imconnector-public-link-settings-inner-option-->
								</div><!--imconnector-public-link-settings-inner-option-->

								<div id="imconnector-add-open" class="imconnector-livechat-public-link-settings-inner-add-wrapper <?=($arResult['INFO_CONNECTION']['CSS_ACTIVE'] == "Y"? "imconnector-livechat-public-add-open": "")?>">
									<div class="imconnector-livechat-public-link-settings-inner-add-container">
										<div class="imconnector-livechat-public-link-settings-inner-add-checkbox-container">
											<div class="imconnector-livechat-public-link-settings-inner-add-item-container">
												<span class="imconnector-livechat-public-link-settings-inner-add-item"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_CSS_PATH')?>:</span>
											</div>
										</div>
										<div class="imconnector-livechat-public-link-settings-inner-add-input-container">
											<input type="text" placeholder="http://" class="imconnector-livechat-public-link-settings-inner-add-input" name="CSS_PATH" value="<?=htmlspecialcharsbx($arResult['INFO_CONNECTION']['CSS_PATH'])?>">
										</div>
									</div><!--imconnector-livechat-public-link-settings-inner-add-container-->
									<div class="imconnector-livechat-public-link-settings-inner-add-textarea">
										<div class="imconnector-livechat-public-link-settings-inner-add-textarea-header">
											<span class="imconnector-livechat-public-link-settings-inner-add-textarea-header-item"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_CSS_TEXT')?>:</span>
										</div>
										<div class="imconnector-livechat-public-link-settings-inner-add-textarea-field">
											<textarea name="CSS_TEXT" id="" cols="30" rows="10" class="imconnector-livechat-public-link-settings-inner-add-textarea-item"><?=htmlspecialcharsbx($arResult['INFO_CONNECTION']['CSS_TEXT'])?></textarea>
										</div>
									</div><!--imconnector-livechat-public-link-settings-inner-add-textarea-->
								</div><!--imconnector-livechat-public-link-settings-inner-add-wrapper-->

							</div><!--imconnector-livechat-public-link-settings-inner-content-->
						</div><!--imconnector-livechat-public-link-settings-inner-container-->
						<div class="imconnector-border"></div><!--imconnector-border-->
						<div class="imconnector-livechat-public-link-settings-inner-settings-container">
							<span class="imconnector-livechat-public-link-settings-inner-param"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_SIGN')?>:</span>
							<div class="imconnector-livechat-public-link-settings-inner-content">
								<div class="imconnector-public-link-settings-inner-option">
									<label for="logo" class="imconnector-livechat-public-link-settings-inner-option-container">
										<input id="logo" name="COPYRIGHT_REMOVED" class="imconnector-public-link-settings-inner-option-field" type="checkbox" <?=($arResult['INFO_CONNECTION']['COPYRIGHT_REMOVED'] == "Y"? "checked": "")?>>
										<span class="imconnector-public-link-settings-inner-option-text <?=($arResult['INFO_CONNECTION']['CAN_REMOVE_COPYRIGHT'] == "Y"? "": "imconnector-lock-icon")?>">
													<span class="imconnector-livechat-public-link-settings-normal"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_SIGN_2')?></span>
													<span class="imconnector-livechat-public-link-settings-bold"><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_SIGN_3')?></span>
												</span>
									</label><!--imconnector-livechat-public-link-settings-inner-option-container-->
									<?
									if($arResult['INFO_CONNECTION']['CAN_REMOVE_COPYRIGHT'] == "N")
									{
										?>
										<script type="text/javascript">
											BX.bind(BX('logo'), 'change', function(e){
												this.checked = false;

												if(!B24 || !B24['licenseInfoPopup'])
												{
													return;
												}

												B24.licenseInfoPopup.show(
													'imopenlines_livechat_copyright',
													'<?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_SIGN_HINT_1')?>',
													'<span><?=Loc::getMessage('IMCONNECTOR_COMPONENT_LIVECHAT_SF_PAGE_SIGN_HINT_2')?></span>'
												);
											});
										</script>
										<?
									}
									?>
								</div><!--imconnector-public-link-settings-inner-option-->
							</div>
						</div><!--imconnector-livechat-public-link-settings-inner-container-->
					</div><!--imconnector-livechat-public-link-settings-inner-->
				</div>
				<div class="imconnector-border imconnctor-outer-border" style="display: none"></div><!--imconnector-border-->
				<input type="submit"
					   class="webform-small-button webform-small-button-accept"
					   id="webform-small-button-have-bot"
					   name="<?=$arResult["CONNECTOR"]?>_save"
					   value="<?=Loc::getMessage('IMCONNECTOR_COMPONENT_SETTINGS_SAVE')?>">
				<?=bitrix_sessid_post();?>
			</form>
		</div>
	</div>
	<?
}
?>