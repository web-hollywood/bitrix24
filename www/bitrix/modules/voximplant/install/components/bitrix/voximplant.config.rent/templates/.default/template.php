<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();
\Bitrix\Main\Page\Asset::getInstance()->addCss("/bitrix/components/bitrix/voximplant.main/templates/.default/telephony.css");

CJSCore::RegisterExt('voximplant_config_rent', array(
	'js' => '/bitrix/components/bitrix/voximplant.config.rent/templates/.default/template.js',
	'lang' => '/bitrix/components/bitrix/voximplant.config.rent/templates/.default/lang/'.LANGUAGE_ID.'/template.php',
));
CJSCore::Init(array('voximplant_common', 'voximplant_config_rent'));
\Bitrix\Voximplant\Ui\Helper::initLicensePopups();
?>
<?if (empty($arResult['LIST_RENT_NUMBERS'])):?>
	<div class="tel-set-text-block">
		<?=GetMessage('VI_CONFIG_RENT_ADD_DESC_2');?>
		<div class="tel-set-text-block-price-include">
			<?=GetMessage('VI_CONFIG_RENT_INCLUDE_2');?>
		</div>
	</div>
	<div class="tel-set-inp-add-new" style="padding-left: 6px">
		<a class="webform-button webform-button-create"  href="#rent" id="vi_rent_options">
			<span class="webform-button-left"></span>
			<span class="webform-button-text"><?=GetMessage('VI_CONFIG_RENT_FIRST')?></span>
		</a>
	</div>
<?else:?>
	<div class="tel-set-text-block" id="phone-confing-title"><strong><?=GetMessage('VI_CONFIG_RENT_PHONES')?></strong></div>
	<div id="phone-confing-wrap">
	<?foreach ($arResult['LIST_RENT_NUMBERS'] as $id => $config):?>
		<div class="tel-set-num-block" id="phone-confing-<?=$id?>">
			<span class="tel-set-inp tel-set-inp-ready-to-use"><?=$config['PHONE_NAME_FORMATTED']?></span>
			<a class="webform-button" href="<?=CVoxImplantMain::GetPublicFolder()?>edit.php?ID=<?=$id?><?=$arResult['IFRAME'] ? '&IFRAME=Y' : ''?>">
				<span class="webform-button-left"></span>
				<span class="webform-button-text">
					<?=GetMessage('VI_CONFIG_RENT_PHONE_CONFIGURE')?>
				</span>
				<span class="webform-button-right"></span>
			</a>
			<?if (!$config['PHONE_VERIFIED']):?>
			<a class="webform-button tel-set-inp-upload-document"
			<?
			if ($arResult['IFRAME'])
			{
			   ?> onclick="BX.SidePanel.Instance.open('<?=CVoxImplantMain::GetPublicFolder()?>configs.php')"<?
			}
			else
			{
			   ?> href="<?=CVoxImplantMain::GetPublicFolder()?>configs.php"<?
			}
			?>
			>
				<span class="webform-button-left"></span>
				<span class="webform-button-text"><?=GetMessage('VI_CONFIG_RENT_PHONE_DOCS')?></span>
				<span class="webform-button-right"></span>
			</a>
			<?endif;?>
			&nbsp;
			<span id="phone-confing-unlink-<?=$id?>" style="display: <?=($config['TO_DELETE']? 'none': 'inline-block')?>" class="webform-button-ajax" onclick="BX.Voximplant.rentPhone.getInstance('vi-rent-phone').unlinkPhone(<?=$id?>)"><?=GetMessage('VI_CONFIG_RENT_PHONE_DELETE_2')?></span>
			<span id="phone-confing-link-<?=$id?>" style="display: <?=(!$config['TO_DELETE']? 'none': 'inline-block')?>">
				<span class="webform-button-ajax-text" style=" color: #b01f1f; font-weight: bold; "><?=GetMessage('VI_CONFIG_RENT_PHONE_PROCESS_DELETE')?></span>
				<span class="webform-button-ajax" onclick="BX.Voximplant.rentPhone.getInstance('vi-rent-phone').cancelUnlinkPhone(<?=$id?>)"><?=GetMessage('VI_CONFIG_RENT_PHONE_CANCEL_DELETE')?></span>
			</span>
		</div>
	<?endforeach;?>
	</div>
	<div class="tel-set-inp-add-new" style="padding-left: 6px; padding-top: 17px;">
		<a class="webform-button webform-button-create"  href="#rent" id="vi_rent_options">
			<span class="webform-button-left"></span>
			<span class="webform-button-text"><?=GetMessage('VI_CONFIG_RENT_ADD')?></span>
			<? if(!$arResult['CAN_RENT_NUMBER']): ?>
				<span class="webform-button-right voximplant-config-rent-lock-icon"></span>
			<? endif ?>
			<span class="webform-button-right"></span>
		</a>
	</div>
<?endif;?>

<div class="tel-set-main-wrap tel-set-main-wrap-white" id="vi_rent_options_div" style="display: none; margin-top: 15px;">
	<div class="tel-set-inner-wrap">
		<div class="tel-set-select-block" id="rent-select-placeholder">
			<div class="tel-set-item-select-wrap">
				<select class="tel-set-item-select">
					<option style="color: #888888"><?=GetMessage('VI_CONFIG_RENT_COUNTRY')?></option>
					<option style="color: #888888">...</option>
				</select>
			</div>
		</div>
		<div id="tel-address-verification"></div>
		<div id="rent-numbers-placeholder"></div>
	</div>
</div>
<script type="text/javascript">
	BX.ready(function()
	{
		BX.Voximplant.rentPhone.create({
			id: 'vi-rent-phone',
			selectPlaceholder: BX('rent-select-placeholder'),
			numbersPlaceholder: BX('rent-numbers-placeholder'),
			verifiedAddressesPlaceholder: BX('tel-address-verification'),
			location: BX.message('LANGUAGE_ID').toUpperCase(),
			publicFolder: '<?=CVoxImplantMain::GetPublicFolder()?>',
			canRent: <?= $arResult['CAN_RENT_NUMBER'] ? 'true' : 'false' ?>,
			iframe: <?=CUtil::PhpToJSObject($arResult['IFRAME'])?>
		})
	})
</script>