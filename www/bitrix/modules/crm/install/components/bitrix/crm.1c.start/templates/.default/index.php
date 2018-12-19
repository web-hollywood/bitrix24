<?if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

use Bitrix\Main\Localization\Loc;

/**
 * Bitrix vars
 *
 * @var array $arParams
 * @var array $arResult
 * @var CBitrixComponentTemplate $this
 * @global CMain $APPLICATION
 * @global CUser $USER
 */

$APPLICATION->SetTitle(Loc::getMessage("CRM_1C_START_FACE_CARD_NAME"));


$jsMessages = array();

if($arResult['RESTRICTED_LICENCE'] === true)
{
	$jsMessagesCodes = array(
		'CRM_1C_START_FACE_CARD_B24_BLOCK_TITLE',
		'CRM_1C_START_FACE_CARD_B24_BLOCK_TEXT',
	);
}
elseif($arResult['LICENSE_ACCEPTED'] === false)
{
	$jsMessagesCodes = array(
		'CRM_1C_START_FACE_CARD_CONSENT_TITLE',
		'CRM_1C_START_FACE_CARD_CONSENT_AGREED',
	);
}

if(count($jsMessagesCodes)>0)
{
	foreach ($jsMessagesCodes as $code)
	{
		$jsMessages[$code] = Loc::getMessage($code);
	}
}
?>

<div class="b24-integration-container">
	<div class="adm-promo-title adm-promo-main-title">
		<span class="adm-promo-title-item"><?=Loc::getMessage("CRM_1C_START_FACE_CARD_ADV_TITLE")?></span>
	</div>
</div><!--b24-integration-container-->

<div class="b24-integration-container b24-integration-video-container">
	<div class="b24-integration-container-logo">
		<div class="b24-integration-video-block">
			<div class="b24-integration-video">
			<?$APPLICATION->IncludeComponent(
                    "bitrix:player",
                    ".default",
                    array(
                        "ADVANCED_MODE_SETTINGS" => "Y",
                        "AUTOSTART" => "Y",
                        "HEIGHT" => "337",
                        "MUTE" => "Y",
                        "PATH" => "https://youtu.be/8x-rTY9LlAw",
                        "PLAYBACK_RATE" => "1",
                        "PLAYER_ID" => "",
                        "PLAYER_TYPE" => "videojs",
                        "SHOW_CONTROLS" => "Y",
                        "SIZE_TYPE" => "absolute",
                        "USE_PLAYLIST" => "N",
                        "VOLUME" => "90",
                        "WIDTH" => "532",
                        "COMPONENT_TEMPLATE" => ".default"
                    ),
                    false
                );?>
			</div>
		</div>
	</div>
</div>

<div class="b24-integration-container">
	<div class="b24-integration-advantage">
		<span class="b24-integration-advantage-item advantage-item-1"><?=Loc::getMessage("CRM_1C_START_FACE_CARD_ADV_1")?></span>
		<span class="b24-integration-advantage-item advantage-item-2"><?=Loc::getMessage("CRM_1C_START_FACE_CARD_ADV_2")?></span>
		<span class="b24-integration-advantage-item advantage-item-3"><?=Loc::getMessage("CRM_1C_START_FACE_CARD_ADV_3")?></span>
	</div><!--b24-integration-advantage-->
	<div class="b24-integration-border"></div>
</div><!--b24-integration-container-->

<div class="b24-integration-container">
	<div class="adm-promo-title b24-list-title">
		<span class="adm-promo-title-item"><?=Loc::getMessage("CRM_1C_START_FACE_CARD_INFO_TITLE")?></span>
	</div>
	<div class="b24-integration-desc"><?=Loc::getMessage("CRM_1C_START_FACE_CARD_INFO_TEXT")?></div>
	<ul class="b24-integration-list">
		<li class="b24-integration-list-item b24-integration-count-block-1"><?=Loc::getMessage("CRM_1C_START_FACE_CARD_INFO_1")?></li>
		<li class="b24-integration-list-item b24-integration-count-block-2"><?=Loc::getMessage("CRM_1C_START_FACE_CARD_INFO_2")?></li>
		<li class="b24-integration-list-item b24-integration-count-block-3"><?=Loc::getMessage("CRM_1C_START_FACE_CARD_INFO_3")?></li>
	</ul>

	<?if(IsModuleInstalled("bitrix24")):?>
        <div class="b24-integration-desc-block b24-integration-desc-text-small b24-integration-desc-block-red b24-integration-desc-warning b24-integration-no-border-state">
            <div><?=Loc::getMessage("CRM_1C_START_FACE_CARD_WARN_TEXT")?></div>
        </div>
    <?else:?>
        <div class="b24-integration-border"></div>
	<?endif;?>

</div><!--b24-integration-container-->
<div id="b24-integration-active" class="b24-integration-container b24-integration-centering-text-block">
	<div id="b24-integration-active-button" class="b24-integration-button b24-integration-button-blue"><?=Loc::getMessage("CRM_1C_START_FACE_CARD_DO_START")?></div>
	<div id="b24-integration-inner-active" class="b24-integration-wrap b24-integration-left-text-block">
		<?
		$sid = $APPLICATION->IncludeComponent(
			'bitrix:app.layout',
			'',
			array(
				'ID' => $arResult['APP']['ID'],
				'CODE' => $arResult['APP']['CODE'],
				'INITIALIZE' => 'N',
				'SET_TITLE' => 'N',
				'PLACEMENT_OPTIONS' => array(
					'tab' => 'face'
				),
			),
			$this,
			array('HIDE_ICONS' => 'Y')
		);
	?>
	</div>
</div>

<script>
    BX.message(<?=\Bitrix\Main\Web\Json::encode($jsMessages)?>);

    <?if($arResult['LICENSE_ACCEPTED'] === false)
	{
	    ?>BX.message({"CRM_1C_START_FACE_CARD_CONSENT_AGREEMENT":'<?=CUtil::JSEscape($arResult['LICENSE_TEXT'])?>'});<?
    }?>

    window.ONEC_APP_INACTIVE = <?=$arResult['APP_INACTIVE']?'true':'false'?>;
    window.LICENCE_RESTRICTED = <?=$arResult['RESTRICTED_LICENCE']?'true':'false'?>;
    window.LICENCE_ACCEPTED = <?=$arResult['LICENSE_ACCEPTED']?'true':'false'?>;
    window.ONEC_APP_SID = '<?=CUtil::JSEscape($sid)?>';
    window.ONEC_AJAX_URL = '<?=CUtil::JSEscape($APPLICATION->GetCurPageParam('', \Bitrix\Main\HttpRequest::getSystemParameters()))?>';

	<?
	if($arResult['RESTRICTED_LICENCE'])
    {
		CBitrix24::initLicenseInfoPopupJS();
    }
	?>
    BXOneCStart();
</script>