<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
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

$APPLICATION->SetTitle(Loc::getMessage("CRM_1C_START_EXCHANGE_NAME"));
?>

<div class="b24-integration-container">
	<div class="adm-promo-title adm-promo-main-title">
		<span class="adm-promo-title-item"><?=Loc::getMessage("CRM_1C_START_EXCHANGE_ADV_TITLE")?></span>
	</div>
</div><!--b24-integration-container-->

<div class="b24-integration-container">
	<div class="b24-report-container-logo"></div>
</div>

<div class="b24-integration-container">
	<div class="b24-report-advantage b24-report-advantage-1c-and-b24">
		<span class="b24-report-advantage-item advantage-item-1"><?=Loc::getMessage("CRM_1C_START_EXCHANGE_ADV_1")?></span>
		<span class="b24-report-advantage-item advantage-item-2"><?=Loc::getMessage("CRM_1C_START_EXCHANGE_ADV_2")?></span>
		<span class="b24-report-advantage-item advantage-item-3"><?=Loc::getMessage("CRM_1C_START_EXCHANGE_ADV_3")?></span>
	</div><!--b24-report-advantage-->
	<div class="b24-integration-border"></div>
</div><!--b24-integration-container-->

<div class="b24-integration-container">
	<div class="adm-promo-title b24-list-title">
		<span class="adm-promo-title-item"><?=Loc::getMessage("CRM_1C_START_EXCHANGE_INFO_TITLE")?></span>
	</div>
	<div class="b24-list-subtitle">
        <?=Loc::getMessage("CRM_1C_START_EXCHANGE_INFO_TEXT")?>
	</div>
	<ul class="b24-report-list">
		<li class="b24-integration-list-item b24-integration-count-block-1"><?=Loc::getMessage("CRM_1C_START_EXCHANGE_INFO_1")?></li>
		<li class="b24-integration-list-item b24-integration-count-block-2"><?=Loc::getMessage("CRM_1C_START_EXCHANGE_INFO_2")?></li>
		<li class="b24-integration-list-item b24-integration-count-block-3"><?=Loc::getMessage("CRM_1C_START_EXCHANGE_INFO_3")?></li>
		<li class="b24-integration-list-item b24-integration-count-block-4"><?=Loc::getMessage("CRM_1C_START_EXCHANGE_INFO_4")?></li>
	</ul>
	<div class="b24-integration-container">
		<div class="b24-report-notification"><?=Loc::getMessage("CRM_1C_START_EXCHANGE_NOTICE")?></div>
	</div>
	<div class="b24-integration-border"></div>
</div><!--b24-integration-container-->
<div id="b24-integration-active" class="b24-integration-container b24-integration-centering-text-block">
	<div class="b24-integration-button b24-integration-button-blue" onclick="BX.toggleClass(BX('b24-integration-active'), 'b24-integration-wrap-animate')"><?=Loc::getMessage("CRM_1C_START_EXCHANGE_DO_START")?></div>
        <div id="b24-integration-inner-active" class="b24-integration-wrap b24-integration-left-text-block">
            <?$APPLICATION->IncludeComponent(
				"bitrix:crm.config.exch1c",
				$templateName,
				array(
					"SEF_MODE" => "Y",
					"SEF_FOLDER" => "/crm/configs/exch1c/",
					"PATH_TO_CONFIGS_INDEX" => "/crm/configs/",
					"HIDE_CONTROL_PANEL" => "Y",
                    "HIDE_TOOLBAR" => "Y"
				),
				false
			);?>
        </div>
</div>