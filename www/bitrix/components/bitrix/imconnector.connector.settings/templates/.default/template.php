<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();

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

Loc::loadMessages($_SERVER["DOCUMENT_ROOT"] . '/bitrix/components/bitrix/imconnector.settings/templates/.default/template.php');

if (\Bitrix\Main\Loader::includeModule("bitrix24"))
{
	CBitrix24::initLicenseInfoPopupJS();
}

$this->addExternalCss('/bitrix/components/bitrix/imconnector.settings/templates/.default/style.css');
$this->addExternalJs('/bitrix/components/bitrix/imconnector.settings/templates/.default/script.js');
\Bitrix\Main\UI\Extension::load("ui.buttons");
\Bitrix\Main\UI\Extension::load("ui.hint");
\Bitrix\ImConnector\Connector::initIconCss();
?>

<?
if (empty($arResult['RELOAD']) && empty($arResult['URL_RELOAD']))
{
	if (!empty($arResult['ACTIVE_LINE']))
	{
		?>
		<?
		$APPLICATION->IncludeComponent(
			$arResult['COMPONENT'],
			"",
			Array(
				"LINE" => $arResult['ACTIVE_LINE']['ID'],
				"CONNECTOR" => $arResult['ID'],
				"AJAX_MODE" =>  "N",
				"AJAX_OPTION_ADDITIONAL" => "",
				"AJAX_OPTION_HISTORY" => "N",
				"AJAX_OPTION_JUMP" => "Y",
				"AJAX_OPTION_STYLE" => "Y",
				"INDIVIDUAL_USE" => "Y"
			)
		); ?>
		<?= $arResult['LANG_JS_SETTING']; ?>
		<?
		$status = \Bitrix\ImConnector\Status::getInstance($arResult['ID'], $arResult['ACTIVE_LINE']['ID'])->isStatus();
		\Bitrix\ImConnector\Status::cleanCache($arResult['ID'], $arResult['ACTIVE_LINE']['ID']);
		if ($status || count($arResult['LIST_LINE']) > 1)
		{
			?>
			<div class="imconnector-field-container" id="bx-connector-user-list">
				<div class="imconnector-field-section">
					<div class="imconnector-field-section-title">
						<?= Loc::getMessage('IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_CONFIGURE_CHANNEL') ?>
					</div>

					<?
					if ($arResult['SHOW_LIST_LINES'])
					{
						?>
						<div class="imconnector-field-box">
							<div class="imconnector-field-box-subtitle">
								<?= Loc::getMessage('IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_OPEN_LINE') ?>
							</div>
							<div class="imconnector-field-control-box">
								<?
								if (count($arResult['LIST_LINE']) > 0)
								{
									?>
									<select type="text"
											class="imconnector-field-control-input imconnector-field-control-select"
											data-role="select"
											data-iframe="<?= ($arParams['IFRAME'] ? 'Y' : 'N')?>">
										<?
										foreach ($arResult['LIST_LINE'] as $line)
										{
											?>
											<option value="<?= CUtil::JSEscape($line['URL']) ?>"
												<?
												if (!empty($line['ACTIVE']))
												{
													?>
													selected="selected"
													<?
												}
												?>>
												<?= $line['NAME'] ?>
											</option>
											<?
										}
										?>
										<?
										if (!empty($arResult['PATH_TO_ADD_LINE']))
										{
											?>
											<option value="<?= CUtil::JSEscape($arResult['PATH_TO_CONNECTOR_LINE_ADAPTED']) ?>"
													data-new="Y">
												<?= Loc::getMessage('IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_CREATE_OPEN_LINE') ?>
											</option>
											<?
										}
										?>
									</select>
									<?
									if (!empty($arResult['ACTIVE_LINE']['URL_EDIT']))
									{
										?>
										<?
										if ($arParams['IFRAME'])
										{
											?>
											<button onclick="BX.SidePanel.Instance.open('<?= CUtil::JSEscape($arResult['ACTIVE_LINE']['URL_EDIT']) ?>')"
													class="ui-btn ui-btn-link">
												<?= Loc::getMessage('IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_CONFIGURE') ?>
											</button>
											<?
										}
										else
										{
											?>
											<a href="<?= CUtil::JSEscape($arResult['ACTIVE_LINE']['URL_EDIT']) ?>"
											   class="ui-btn ui-btn-link">
												<?= Loc::getMessage('IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_CONFIGURE') ?>
											</a>
											<?
										}
									}
								}
								else
								{
									?>
									<button onclick="BX.OpenLinesConfigEdit.createLineAction('<?= CUtil::JSEscape($arResult['PATH_TO_CONNECTOR_LINE_ADAPTED']) ?>', <?=CUtil::PhpToJSObject($arParams['IFRAME'])?>)"
											class="ui-btn ui-btn-link">
										<?= Loc::getMessage('IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_CREATE_OPEN_LINE') ?>
									</button>
									<?
								}
								?>
							</div>
						</div>
						<?
					}
					?>

					<?
					if ($arResult['CAN_CHANGE_USERS'])
					{
						CUtil::InitJSCore(array("socnetlogdest"));
						?>
						<form name="users-queue" id="user-queue-save">
							<div class="tel-set-destination-container" id="users_for_queue"></div>
							<input type="hidden" name="lineId" value="<?= $arResult['ACTIVE_LINE']['ID'] ?>">
						</form>
						<script type="text/javascript">
							BX.ready(function () {
								BX.message({
									LM_ADD1: '<?=GetMessageJS("IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_LM_ADD1")?>',
									LM_ADD2: '<?=GetMessageJS("IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_LM_ADD2")?>',
									LM_ERROR_BUSINESS: '<?=GetMessageJS("IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_LM_ERROR_BUSINESS")?>',
									'LM_BUSINESS_USERS': '<?=CUtil::JSEscape($arResult['BUSINESS_USERS'])?>',
									'LM_BUSINESS_USERS_ON': '<?=CUtil::JSEscape($arResult['BUSINESS_USERS_LIMIT'])?>',
									'LM_BUSINESS_USERS_TEXT': '<?=GetMessageJS("IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_POPUP_LIMITED_BUSINESS_USERS_TEXT")?>',
									'LM_QUEUE_DESCRIPTION': '<?=GetMessageJS("IMCONNECTOR_COMPONENT_CONNECTOR_QUEUE_DESCRIPTION")?>'
								});

								BX.OpenLinesConfigEdit.initDestination(BX('users_for_queue'), 'QUEUE', <?=CUtil::PhpToJSObject($arResult["QUEUE_DESTINATION"])?>);
							});
						</script>
						<?
					}
					else
					{
						?>
						<div class="imconnector-field-box imconnector-field-user-box">
							<div class="imconnector-field-box-subtitle">
								<?= Loc::getMessage('IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_QUEUE') ?>
								<div class="imconnector-field-box-subtitle-tooltip"
									 data-hint="<?=Loc::getMessage("IMCONNECTOR_COMPONENT_CONNECTOR_QUEUE_DESCRIPTION")?>"></div>
							</div>
							<div class="imconnector-field-user">
								<?
								foreach ($arResult["QUEUE_DESTINATION"]["SELECTED"]["USERS"] as $userId)
								{
									$user = $arResult["QUEUE_DESTINATION"]["USERS"]["U" . $userId];
									?>
									<div class="imconnector-field-user-item">
										<div class="imconnector-field-user-icon"
											 <?
											 if ($user['avatar'] != '')
											 {
											 	?>
												 style="background-image: url(<?= $user['avatar'] ?>)"
											 	<?
											 }
											 ?>>
										</div>
										<div class="imconnector-field-user-info">
											<a href="<?= $user['link'] ?>" target="_top"
											   class="imconnector-field-user-name"><?= $user['name'] ?></a>
											<div class="imconnector-field-user-desc"><?= $user['desc'] ?></div>
										</div>
									</div>
									<?
								}
								?>
							</div>
						</div>
						<?
					}
					?>
				</div>
			</div>

			<?
			if (count($arResult['LIST_LINE']) > 0)
			{
				?>
				<script>
					BX.message({
						IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_POPUP_LIMITED_TITLE: '<?= GetMessageJS('IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_POPUP_LIMITED_TITLE') ?>',
						IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_POPUP_LIMITED_TEXT: '<?= GetMessageJS('IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_POPUP_LIMITED_TEXT') ?>',
						IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_ERROR_ACTION: '<?= GetMessageJS('IIMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_ERROR_ACTION') ?>',
						IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_CLOSE: '<?= GetMessageJS('IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_CLOSE') ?>',
						IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_QUEUE: '<?= GetMessageJS('IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_QUEUE')?>'
					});
				</script>
				<?
			}

		}
	}
	elseif (empty($arResult['ACTIVE_LINE']) && !empty($arResult['PATH_TO_ADD_LINE']))
	{
		?>
		<div class="imconnector-field-container">
			<div class="imconnector-field-section imconnector-field-section-social">
				<div class="imconnector-field-box">
					<?= Loc::getMessage('IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_NO_OPEN_LINE'); ?>
					<a class="imconnector-field-box-link" onclick="BX.OpenLinesConfigEdit.createLineAction('<?= CUtil::JSEscape($arResult['PATH_TO_CONNECTOR_LINE_ADAPTED']) ?>', <?=CUtil::PhpToJSObject($arParams['IFRAME'])?>)" target="_top">
						<?=Loc::getMessage('IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_CREATE_OPEN_LINE')?>
					</a>
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
					<?= Loc::getMessage('IMCONNECTOR_COMPONENT_CONNECTOR_SETTINGS_NO_OPEN_LINE_AND_NOT_ADD_OPEN_LINE'); ?>
				</div>
			</div>
		</div>
		<?
	}
}
elseif (!empty($arResult['URL_RELOAD']))
{
	?>
	<html>
	<body>
	<script>
		window.reloadAjaxImconnector = function (urlReload)
		{
			parent.window.opener.location.href = urlReload; //parent.window.opener construction is used for both frame and page mode as universal
			parent.window.opener.addPreloader();
			window.close();
		};
		reloadAjaxImconnector(<?=CUtil::PhpToJSObject($arResult['URL_RELOAD'])?>);
	</script>
	</body>
	</html>
	<?
}
else
{
	?>
	<html>
	<body>
	<script>
		window.reloadAjaxImconnector = function (urlReload, idReload)
		{
			parent.window.opener.BX.ajax.insertToNode(urlReload, idReload);
			window.close();
		};
		reloadAjaxImconnector(<?=CUtil::PhpToJSObject($arResult['URL_RELOAD'])?>, <?=CUtil::PhpToJSObject('comp_' . $arResult['RELOAD'])?>);
	</script>
	</body>
	</html>
	<?
}
?>
