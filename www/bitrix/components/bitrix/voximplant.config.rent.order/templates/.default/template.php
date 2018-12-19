<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();
$APPLICATION->SetAdditionalCSS("/bitrix/components/bitrix/voximplant.main/templates/.default/telephony.css");

\Bitrix\Main\Page\Asset::getInstance()->addJs('/bitrix/js/voximplant/common.js');
CJSCore::RegisterExt('voximplant_config_rent_order', array(
	'js' => '/bitrix/components/bitrix/voximplant.config.rent.order/templates/.default/template.js',
	'lang' => '/bitrix/components/bitrix/voximplant.config.rent.order/templates/.default/lang/'.LANGUAGE_ID.'/template.php',
));
CJSCore::Init(array('voximplant_config_rent_order'));

$showAddButton = in_array($arResult['ORDER_STATUS']['OPERATOR_STATUS'], Array(CVoxImplantPhoneOrder::OPERATOR_STATUS_NONE, CVoxImplantPhoneOrder::OPERATOR_STATUS_DECLINE));
$showExtraButton = $arResult['ORDER_STATUS']['OPERATOR_STATUS'] == CVoxImplantPhoneOrder::OPERATOR_STATUS_ACCEPT;
$statusMessage = GetMessage('VI_CONFIG_RENT_ORDER_INFO_'.$arResult['ORDER_STATUS']['OPERATOR_STATUS']);
if (!$statusMessage)
{
	$statusMessage = GetMessage('VI_CONFIG_RENT_ORDER_INFO_NA');
}
?>

<?if (empty($arResult['LIST_RENT_NUMBERS'])):?>
<div class="tel-set-text-block">
	<?=GetMessage('VI_CONFIG_RENT_ORDER_DESC');?>
	<div class="tel-set-text-block-price-include">
		<?=GetMessage('VI_CONFIG_RENT_INCLUDE_2');?>
	</div>
</div>
<?else:?>
<div class="tel-set-text-block" id="phone-confing-title"><strong><?=GetMessage('VI_CONFIG_RENT_PHONES')?></strong></div>
<div id="phone-confing-wrap">
<?foreach ($arResult['LIST_RENT_NUMBERS'] as $id => $config):?>
<div class="tel-set-num-block" id="phone-confing-<?=$id?>">
	<span class="tel-set-inp tel-set-inp-ready-to-use"><?=$config['PHONE_NAME']?></span>
	<a class="webform-button" href="<?=CVoxImplantMain::GetPublicFolder()?>edit.php?ID=<?=$id?><?=$arResult['IFRAME'] ? '&IFRAME=Y' : ''?>">
		<span class="webform-button-left"></span>
		<span class="webform-button-text">
			<?=GetMessage('VI_CONFIG_RENT_PHONE_CONFIGURE')?>
		</span>
		<span class="webform-button-right"></span>
	</a>
</div>
<?endforeach;?>
</div>
<?endif;?>

<?if ($arResult['ORDER_STATUS']['OPERATOR_STATUS'] != CVoxImplantPhoneOrder::OPERATOR_STATUS_NONE):?>
<div class="tel-set-main-wrap tel-set-main-wrap-white" style="<?=($showAddButton? 'margin-bottom: 32px;': '')?>">
	<div class="tel-set-inner-wrap">
		<div class="tel-set-select-block">
		<?if (substr($arResult['ORDER_STATUS']['OPERATOR_STATUS'], 0, 7) == 'ACTIVE_'):?>
			<div class="tel-order-form-desc"><?=GetMessage('VI_CONFIG_RENT_ORDER_INFO_TITLE_2')?></div>
			<div class="tel-order-form-info-box">
				<div class="tel-order-form-info"><?=GetMessage('VI_CONFIG_RENT_ORDER_INFO_ACCOUNT')?> <b><?=$arResult['ACCOUNT_NAME']?></b></div>
				<div class="tel-order-form-info"><?=GetMessage('VI_CONFIG_RENT_ORDER_INFO_STATUS')?> <span class="tel-order-form-status tel-order-form-status-<?=$arResult['ORDER_STATUS']['OPERATOR_STATUS']?>"><?=GetMessage('VI_CONFIG_RENT_ORDER_INFO_'.$arResult['ORDER_STATUS']['OPERATOR_STATUS'])?></span></div>
				<div class="tel-order-form-info"><?=GetMessage('VI_CONFIG_RENT_ORDER_INFO_DATE_MODIFY')?> <b><?=$arResult['ORDER_STATUS']['DATE_MODIFY']?></b></div>
			</div>
		<?elseif ($arResult['ORDER_STATUS']['OPERATOR_STATUS'] != CVoxImplantPhoneOrder::OPERATOR_STATUS_ACCEPT):?>
			<div class="tel-order-form-desc"><?=GetMessage('VI_CONFIG_RENT_ORDER_INFO_TITLE_1')?></div>
			<div class="tel-order-form-info-box">
				<div class="tel-order-form-info"><?=GetMessage('VI_CONFIG_RENT_ORDER_INFO_ACCOUNT')?> <b><?=$arResult['ACCOUNT_NAME']?></b></div>
				<div class="tel-order-form-info"><?=GetMessage('VI_CONFIG_RENT_ORDER_INFO_STATUS')?> <span class="tel-order-form-status tel-order-form-status-<?=$arResult['ORDER_STATUS']['OPERATOR_STATUS']?>"><?=$statusMessage?></span></div>
				<div class="tel-order-form-info"><?=GetMessage('VI_CONFIG_RENT_ORDER_INFO_DATE')?> <b><?=$arResult['ORDER_STATUS']['DATE_CREATE']?></b></div>
				<div class="tel-order-form-info"><?=GetMessage('VI_CONFIG_RENT_ORDER_INFO_DATE_MODIFY')?> <b><?=$arResult['ORDER_STATUS']['DATE_MODIFY']?></b></div>
			</div>
		<?else:?>
			<div class="tel-order-form-desc"><?=GetMessage('VI_CONFIG_RENT_ORDER_INFO_TITLE_2')?></div>
			<div class="tel-order-form-info-box">
				<div class="tel-order-form-info"><?=GetMessage('VI_CONFIG_RENT_ORDER_INFO_ACCOUNT')?> <b><?=$arResult['ACCOUNT_NAME']?></b></div>
				<div class="tel-order-form-info"><?=GetMessage('VI_CONFIG_RENT_ORDER_INFO_OID')?> <b><?=$arResult['ORDER_STATUS']['OPERATOR_CONTRACT']?></b></div>
			</div>
		<?endif;?>
		</div>
	</div>
</div>
<?endif;?>

<?if ($showAddButton):?>
<div class="tel-set-inp-add-new">
	<a class="webform-button webform-button-create" href="#order" id="vi_rent_order"><span class="webform-button-left"></span><span class="webform-button-text"><?=GetMessage('VI_CONFIG_RENT_FORM_BTN')?></span><span class="webform-button-right"></span></a>
</div>
<div class="tel-set-main-wrap tel-set-main-wrap-white" id="vi_rent_order_div" style="display: none; margin-top: 15px;">
	<div class="tel-set-inner-wrap">
		<div class="tel-set-select-block" id="rent-select-placeholder">

			<div class="tel-order-form-desc"><?=GetMessage('VI_CONFIG_RENT_FORM_TITLE_'.strtoupper($arResult['ACCOUNT_LANG']))?></div>

			<div class="tel-order-form-name"><?=GetMessage('VI_CONFIG_RENT_ORDER_COMPANY_NAME')?></div>
			<div class="tel-order-form-value"><input type="text" class="tel-set-inp" value="" id="vi_rent_order_name"></div>
			<div class="tel-order-form-name"><?=GetMessage('VI_CONFIG_RENT_ORDER_COMPANY_CONTACT')?></div>
			<div class="tel-order-form-value"><input type="text" class="tel-set-inp" value="" id="vi_rent_order_contact"></div>
			<div class="tel-order-form-name">
				<?if($arResult['ACCOUNT_LANG'] == 'ua'):?>
					<?=GetMessage('VI_CONFIG_RENT_ORDER_COMPANY_REG_CODE')?>
				<?elseif($arResult['ACCOUNT_LANG'] == 'kz'):?>
					<?=GetMessage('VI_CONFIG_RENT_ORDER_COMPANY_BIN')?>
				<?endif?>
			</div>
			<div class="tel-order-form-value"><input type="text" class="tel-set-inp" value="" id="vi_rent_order_reg_code"></div>
			<div class="tel-order-form-name"><?=GetMessage('VI_CONFIG_RENT_ORDER_COMPANY_PHONE')?></div>
			<div class="tel-order-form-value"><input type="text" class="tel-set-inp" value="" id="vi_rent_order_phone"></div>
			<div class="tel-order-form-name"><?=GetMessage('VI_CONFIG_RENT_ORDER_COMPANY_EMAIL')?></div>
			<div class="tel-order-form-value"><input type="text" class="tel-set-inp" value="" id="vi_rent_order_email"></div>

			<div class="tel-order-form-button">
				<div id="tel-order-form-button"  class="webform-button webform-button-create"><span class="webform-button-left"></span><span class="webform-button-text"><?=GetMessage('VI_CONFIG_RENT_ORDER_BTN')?></span><span class="webform-button-right"></span></div>
				<div id="tel-order-form-success" class="tel-order-form-confirm" style="display:none"><?=GetMessage('VI_CONFIG_RENT_ORDER_COMPLETE')?></div>
			</div>

		</div>
	</div>
</div>
<script type="text/javascript">
	BX.ready(function(){
		BX.VoxImplant.rentPhoneOrder.init();
	});
</script>
<?endif;?>
<?if ($showExtraButton):?>
<div class="tel-set-inp-add-new" style="margin-top: 15px;">
	<a class="webform-button webform-button-create" href="#orderExtra" id="vi_rent_order_extra"><span class="webform-button-left"></span><span class="webform-button-text"><?=GetMessage('VI_CONFIG_RENT_ORDER_EXTRA_TITLE')?></span><span class="webform-button-right"></span></a>
</div>
<div class="tel-set-main-wrap tel-set-main-wrap-white" id="vi_rent_order_extra_div" style="display: none; margin-top: 15px;">
	<div class="tel-set-inner-wrap">
		<div class="tel-set-select-block" id="rent-extra-placeholder">
			<div class="tel-order-form-value">
				<select id="vi_rent_order_extra_type" class="tel-set-inp tel-set-item-select">
					<option value="TOLLFREE"><?=GetMessage('VI_CONFIG_RENT_ORDER_EXTRA_TOLLFREE')?></option>
					<option value="LINE"><?=GetMessage('VI_CONFIG_RENT_ORDER_EXTRA_LINE')?></option>
					<option value="NUMBER"><?=GetMessage('VI_CONFIG_RENT_ORDER_EXTRA_NUMBER')?></option>
					<option value="CITY"><?=GetMessage('VI_CONFIG_RENT_ORDER_EXTRA_CITY')?></option>
					<option value="CHANGE"><?=GetMessage('VI_CONFIG_RENT_ORDER_EXTRA_CHANGE')?></option>
				</select>
			</div>

			<div class="tel-order-form-button">
				<div id="tel-order-extra-form-button"  class="webform-button webform-button-create"><span class="webform-button-left"></span><span class="webform-button-text"><?=GetMessage('VI_CONFIG_RENT_ORDER_BTN')?></span><span class="webform-button-right"></span></div>
				<div id="tel-order-extra-form-success" class="tel-order-form-confirm" style="display:none"><?=GetMessage('VI_CONFIG_RENT_ORDER_COMPLETE')?></div>
			</div>

		</div>
	</div>
</div>
<script type="text/javascript">
	BX.ready(function(){
		BX.VoxImplant.rentPhoneOrderExtra.init();
	});
</script>
<?endif;?>