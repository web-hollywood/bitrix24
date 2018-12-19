<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();
$APPLICATION->SetAdditionalCSS("/bitrix/components/bitrix/voximplant.main/templates/.default/telephony.css");

CJSCore::RegisterExt('voximplant_config_sip', array(
	'js' => '/bitrix/components/bitrix/voximplant.config.sip/templates/.default/template.js',
	'lang' => '/bitrix/components/bitrix/voximplant.config.sip/templates/.default/lang/'.LANGUAGE_ID.'/template.php',
));
CJSCore::Init(array('voximplant_config_sip'));

if(IsModuleInstalled('rest'))
	\Bitrix\Main\Page\Asset::getInstance()->addCss('/bitrix/components/bitrix/rest.marketplace/templates/.default/style.css');

\Bitrix\Main\UI\Extension::load("ui.buttons.icons");

?>
<div class="">
	<div class="tel-sip-header-container">
		<? if(IsModuleInstalled('rest')): ?>
			<div id="header-rest" class="tel-sip-header-block tel-sip-header-block-active">
				<span class="tel-sip-header-icon tel-sip-header-icon-rest">
					<svg width="54px" height="53px" viewBox="0 0 54 53" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
						<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
							<g transform="translate(-430.000000, -752.000000)" fill="#1D5997">
								<g id="Group-3" transform="translate(430.000000, 746.000000)">
									<g id="Group" transform="translate(0.000000, 6.000000)">
										<path d="M50.2758621,36.7456395 C46.6052586,36.7456395 43.0673276,36.1601744 39.7505172,35.077064 C38.7333621,34.7550581 37.5687931,34.9892442 36.7580172,35.7942587 L30.2718103,42.2490116 C21.9281897,38.0336628 15.102931,31.2569041 10.8426724,22.9725727 L17.3288793,16.5178198 C18.1396552,15.7128052 18.3755172,14.5565116 18.0512069,13.5465843 C16.9603448,10.253343 16.3706897,6.7259157 16.3706897,3.08139535 C16.3706897,1.45672965 15.0587069,0.154069767 13.4224138,0.154069767 L3.10344828,0.154069767 C1.46715517,0.154069767 0.155172414,1.45672965 0.155172414,3.08139535 C0.155172414,30.5689826 22.5915517,52.8459302 50.2758621,52.8459302 C51.9121552,52.8459302 53.2241379,51.5432703 53.2241379,49.9186047 L53.2241379,39.6729651 C53.2241379,38.0482994 51.9121552,36.7456395 50.2758621,36.7456395 Z" id="Shape"></path>
										<path d="M32.0375172,13.5581395 L35.1657931,13.5581395 L31.3597241,1.47906977 L27.5884138,1.47906977 L23.678069,13.5581395 L26.8237241,13.5581395 L27.5710345,10.9525116 L31.2902069,10.9525116 L32.0375172,13.5581395 Z M29.5001379,4.22274419 L30.8904828,8.98534884 L28.0055172,8.98534884 L29.5001379,4.22274419 Z M37.0427586,1.47906977 L37.0427586,13.5581395 L40.032,13.5581395 L40.032,10.0897209 L41.4571034,10.0897209 C44.9851034,10.0897209 46.4449655,8.91632558 46.4449655,5.724 C46.4449655,2.54893023 44.9851034,1.47906977 41.4571034,1.47906977 L37.0427586,1.47906977 Z M40.032,3.77409302 L41.4571034,3.77409302 C42.7257931,3.77409302 43.4209655,4.15372093 43.4209655,5.70674419 C43.4209655,7.48409302 42.552,7.81195349 41.4571034,7.81195349 L40.032,7.81195349 L40.032,3.77409302 Z M47.4529655,3.75683721 L49.1735172,3.75683721 L49.1735172,11.2803721 L47.5572414,11.2803721 L47.5572414,13.5581395 L53.9875862,13.5581395 L53.9875862,11.2803721 L52.1627586,11.2803721 L52.1627586,3.75683721 L53.8833103,3.75683721 L53.8833103,1.47906977 L47.4529655,1.47906977 L47.4529655,3.75683721 Z" id="API"></path>
									</g>
								</g>
							</g>
						</g>
					</svg>
				</span>
				<span class="tel-sip-header-title">
					<?=GetMessage('VI_CONFIG_SIP_REST_HEADER')?>
				</span>
			</div>
		<? endif ?>
		<div id="header-connector" class="tel-sip-header-block <?=(IsModuleInstalled('rest') ? 'tel-sip-header-block-inactive' : '')?>">
			<span class="tel-sip-header-icon tel-sip-header-icon-connector">
				<svg width="54px" height="53px" viewBox="0 0 54 53" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
					<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
						<g transform="translate(-1009.000000, -751.000000)" fill="#1D5997">
							<g id="Group-2" transform="translate(1009.000000, 746.000000)">
								<g id="Group" transform="translate(0.000000, 5.000000)">
									<path d="M50.2758621,36.7456395 C46.6052586,36.7456395 43.0673276,36.1601744 39.7505172,35.077064 C38.7333621,34.7550581 37.5687931,34.9892442 36.7580172,35.7942587 L30.2718103,42.2490116 C21.9281897,38.0336628 15.102931,31.2569041 10.8426724,22.9725727 L17.3288793,16.5178198 C18.1396552,15.7128052 18.3755172,14.5565116 18.0512069,13.5465843 C16.9603448,10.253343 16.3706897,6.7259157 16.3706897,3.08139535 C16.3706897,1.45672965 15.0587069,0.154069767 13.4224138,0.154069767 L3.10344828,0.154069767 C1.46715517,0.154069767 0.155172414,1.45672965 0.155172414,3.08139535 C0.155172414,30.5689826 22.5915517,52.8459302 50.2758621,52.8459302 C51.9121552,52.8459302 53.2241379,51.5432703 53.2241379,49.9186047 L53.2241379,39.6729651 C53.2241379,38.0482994 51.9121552,36.7456395 50.2758621,36.7456395 Z" id="Shape"></path>
									<path d="M30.3194483,1.30651163 C27.4692414,1.30651163 25.5227586,2.2555814 25.5227586,4.77493023 C25.5227586,7.95 27.782069,8.22609302 30.8755862,9.14065116 C31.8662069,9.434 32.2137931,9.64106977 32.2137931,10.3485581 C32.2137931,10.6936744 32.0226207,11.4184186 30.3194483,11.4184186 C29.1202759,11.4184186 27.1042759,11.0733023 25.9051034,10.7109302 L25.5748966,12.9714419 C26.7914483,13.4546047 28.7031724,13.7306977 30.302069,13.7306977 C33.0653793,13.7306977 35.2204138,12.8161395 35.2204138,10.1414884 C35.2204138,6.75934884 32.7525517,6.63855814 29.6937931,5.62046512 C28.9638621,5.37888372 28.5293793,5.13730233 28.5293793,4.56786047 C28.5293793,3.94665116 29.0333793,3.53251163 30.4932414,3.53251163 C31.5012414,3.53251163 33.1870345,3.77409302 34.4904828,4.13646512 L34.8206897,1.87595349 C33.5346207,1.54809302 32.0226207,1.30651163 30.3194483,1.30651163 Z M36.2284138,3.75683721 L37.9489655,3.75683721 L37.9489655,11.2803721 L36.3326897,11.2803721 L36.3326897,13.5581395 L42.7630345,13.5581395 L42.7630345,11.2803721 L40.9382069,11.2803721 L40.9382069,3.75683721 L42.6587586,3.75683721 L42.6587586,1.47906977 L36.2284138,1.47906977 L36.2284138,3.75683721 Z M44.2576552,1.47906977 L44.2576552,13.5581395 L47.2468966,13.5581395 L47.2468966,10.0897209 L48.672,10.0897209 C52.2,10.0897209 53.6598621,8.91632558 53.6598621,5.724 C53.6598621,2.54893023 52.2,1.47906977 48.672,1.47906977 L44.2576552,1.47906977 Z M47.2468966,3.77409302 L48.672,3.77409302 C49.9406897,3.77409302 50.6358621,4.15372093 50.6358621,5.70674419 C50.6358621,7.48409302 49.7668966,7.81195349 48.672,7.81195349 L47.2468966,7.81195349 L47.2468966,3.77409302 Z" id="SIP"></path>
								</g>
							</g>
						</g>
					</g>
				</svg>
			</span>
			<span class="tel-sip-header-title">
				<?=GetMessage('VI_CONFIG_SIP_CONNECTOR_HEADER')?>
			</span>
		</div>
	</div>
	<? if(IsModuleInstalled('rest')): ?>
		<div id="detail-rest" class="tel-set-item-group tel-set-item-group-margin">
			<div>
				<div class="tel-set-text-block">
					<div class="tel-set-item-group-margin"><?=GetMessage('VI_CONFIG_SIP_REST_SELECT_MARKET')?></div>
					<div>
						<?
						$APPLICATION->IncludeComponent("bitrix:rest.marketplace.category", "", array(
							"CATEGORY" => 'telephony',
							"DETAIL_URL_TPL" => '/marketplace/detail/#app#/',
							"AJAX_MODE" => $arResult['IFRAME'] ? "N" : "Y",
							"SET_TITLE" => "N",
							"IFRAME" => $arResult['IFRAME']
						), $component);
						?>
					</div>
					<? if($arResult['LINK_TO_REST_DOC'] != ''): ?>
						<span><?=GetMessage('VI_CONFIG_SIP_REST_CREATE_YOUR', array("#URL#" => $arResult['LINK_TO_REST_DOC']))?></span>
					<? endif; ?>
				</div>
			</div>
		</div>
	<? endif ?>
	<div id="detail-connector" class="tel-set-item-group" <?=(IsModuleInstalled('rest') ? 'style="display: none"' : '')?>>
		<div>
			<div class="tel-set-text-block">
			<?if (!$arResult['SIP_ENABLE']):?>
				<?=GetMessage('VI_CONFIG_SIP_INFO');?><br><br>
				<?if (!empty($arResult['LINK_TO_BUY'])):?>
					<?=GetMessage('VI_CONFIG_SIP_CONNECT_INFO_NEW');?><br>
					<?=GetMessage('VI_CONFIG_SIP_CONNECT_INFO_2_NEW');?><br><br>
					<div><b><?=GetMessage('VI_CONFIG_SIP_CONNECT_NOTICE_2');?></b></div>
					<div class="tel-set-inp-add-new" style="padding-left: 6px; padding-top: 4px;">
						<span class="webform-button webform-button-create" onclick="BX.VoxImplant.sip.connectModule('<?=$arResult['LINK_TO_BUY']?>')" ><span class="webform-button-left"></span><span class="webform-button-text"><?=GetMessage('VI_CONFIG_SIP_ACCEPT_3')?></span><span class="webform-button-right"></span></span>
					</div>
					<br>
				<?else:?>
					<div><?=GetMessage('VI_CONFIG_SIP_CONNECT_DISABLE');?></div><br>
				<?endif;?>
			<?else:?>
				<?=GetMessage('VI_CONFIG_SIP_FIRST_STEP');?><br><br>
			<?endif;?>
				<div class="tel-set-item-block tel-set-item-block-margin tel-set-item-icon">
					<?=GetMessage('VI_CONFIG_SIP_CONNECT_DESC_NEW');?><br><br>
					<?=GetMessage('VI_CONFIG_SIP_CONFIG_INFO', Array('#LINK_START#' => '<a href="'.$arResult['LINK_TO_DOC'].'" target="_blank">', '#LINK_END#' => '</a>'));?>
				</div>
			</div>
			<?if (!empty($arResult['LIST_SIP_NUMBERS'])):?>
				<div id="phone-confing-sip-wrap">
					<div class="tel-set-text-block" id="phone-confing-title">
						<strong><?=GetMessage('VI_CONFIG_SIP_PHONES')?></strong>
					</div>
				<?foreach ($arResult['LIST_SIP_NUMBERS'] as $id => $config):?>
					<div class="tel-set-num-block tel-set-num-sip-block" id="phone-confing-<?=$id?>">
						<span class="tel-set-inp tel-set-inp-ready-to-use"><?=$config['PHONE_NAME']?></span>
						<a class="webform-button" href="<?=CVoxImplantMain::GetPublicFolder()?>edit.php?ID=<?=$id?>&LINE_TYPE=SIP&ACTION=show<?=$arResult['IFRAME'] ? '&IFRAME=Y' : ''?>">
							<span class="webform-button-left"></span>
							<span class="webform-button-text">
								<?=GetMessage('VI_CONFIG_SIP_CONFIGURE_2')?>
							</span>
							<span class="webform-button-right"></span>
						</a>
						&nbsp;
						<span id="phone-confing-unlink-<?=$id?>" class="webform-button-ajax" onclick="BX.VoxImplant.sip.unlinkPhone(<?=$id?>)"><?=GetMessage('VI_CONFIG_SIP_DELETE_2')?></span>
					</div>
				<?endforeach;?>
				</div>
			<?endif;?>
			<div class="tel-set-inp-add-new">
				<a class="webform-button webform-button-create"  href="#cloudPBX" id="vi_sip_cloud_options"><span class="webform-button-left"></span><span class="webform-button-text"><?=GetMessage('VI_CONFIG_SIP_CONNECT_CLOUD')?></span><span class="webform-button-right"></span></a>
				<a class="webform-button webform-button-create"  href="#officePBX" id="vi_sip_office_options"><span class="webform-button-left"></span><span class="webform-button-text"><?=GetMessage('VI_CONFIG_SIP_CONNECT_OFFICE')?></span><span class="webform-button-right"></span></a>
			</div>
			<div class="tel-set-item-group-margin"></div>
			<div class="tel-set-main-wrap tel-set-main-wrap-white tel-connect-pbx" id="vi_sip_cloud_options_div" style="display: none; margin-top: 15px;">
				<div class="tel-set-inner-wrap">
					<table class="tel-set-sip-table">
						<tbody>
							<tr>
								<td class="tel-set-sip-td-l"><?=GetMessage('VI_CONFIG_SIP_OUT_NC')?></td>
								<td class="tel-set-sip-td-r">
									<div class="tel-set-sip-inp-wrap">
										<input class="tel-set-inp" type="text" id="vi_sip_cloud_title"/>
										<br/>
										<span class="tel-set-sip-description"><?=GetMessage('VI_CONFIG_SIP_OUT_NC_DESC')?></span>
									</div>
								</td>
							</tr>
							<tr>
								<td class="tel-set-sip-td-l"><?=GetMessage('VI_CONFIG_SIP_OUT_SERVER')?></td>
								<td class="tel-set-sip-td-r">
									<div class="tel-set-sip-inp-wrap">
										<input class="tel-set-inp" type="text" id="vi_sip_cloud_server"/>
										<br/>
										<span class="tel-set-sip-description"><?=GetMessage('VI_CONFIG_SIP_OUT_SERVER_DESC_2')?></span>
									</div>
								</td>
							</tr>
							<tr>
								<td class="tel-set-sip-td-l"><?=GetMessage('VI_CONFIG_SIP_OUT_LOGIN')?></td>
								<td class="tel-set-sip-td-r">
									<div class="tel-set-sip-inp-wrap">
										<input class="tel-set-inp" type="text" id="vi_sip_cloud_login"/>
										<br/>
										<span class="tel-set-sip-description"><?=GetMessage('VI_CONFIG_SIP_OUT_LOGIN_DESC_2')?></span>
									</div>
								</td>
							</tr>
							<tr>
								<td class="tel-set-sip-td-l"><?=GetMessage('VI_CONFIG_SIP_OUT_PASSWORD')?></td>
								<td class="tel-set-sip-td-r"><input class="tel-set-inp" type="text" id="vi_sip_cloud_password"/></td>
							</tr>
						</tbody>
						<tbody id="vi-tel-sip-show-additional-fields">
							<tr align="right">
								<td class="tel-set-sip-td-l">
									<span class="tel-set-sip-additional-fields js-tel-set-sip-additional-fields"><?=GetMessage("VI_CONFIG_SIP_ADDITIONAL_FIELDS")?></span>
								</td>
								<td>&nbsp;</td>
							</tr>
						</tbody>
						<tbody id="vi-tel-sip-additional-fields" class="tel-set-sip-additional-fields-hidden tel-connect-pbx-animate">
							<tr>
								<td class="tel-set-sip-td-l"><?=GetMessage('VI_CONFIG_SIP_OUT_AUTH_USER')?></td>
								<td class="tel-set-sip-td-r">
									<div class="tel-set-sip-inp-wrap">
										<input class="tel-set-inp" type="text" id="vi_sip_cloud_auth_user"/>
										<br/>
										<span class="tel-set-sip-description"><?=GetMessage('VI_CONFIG_SIP_OUT_AUTH_USER_DESC')?></span>
									</div>
								</td>
							</tr>
							<tr>
								<td class="tel-set-sip-td-l"><?=GetMessage('VI_CONFIG_SIP_OUT_OUTBOUND_PROXY')?></td>
								<td class="tel-set-sip-td-r">
									<div class="tel-set-sip-inp-wrap">
										<input class="tel-set-inp" type="text" id="vi_sip_cloud_outbound_proxy"/>
										<br/>
										<span class="tel-set-sip-description"><?=GetMessage('VI_CONFIG_SIP_OUT_OUTBOUND_PROXY_DESC')?></span>
									</div>
								</td>
							</tr>
						</tbody>
						<tbody>
							<tr>
								<td class="tel-set-sip-td-l"></td>
								<td class="tel-set-sip-td-r">
									<div class="webform-button webform-button-create" id="vi_sip_cloud_add"><span class="webform-button-left"></span><span class="webform-button-text"><?=GetMessage('VI_CONFIG_SIP_CONNECT_FIRST')?></span><span class="webform-button-right"></span></div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			<div class="tel-set-main-wrap tel-set-main-wrap-white" id="vi_sip_office_options_div" style="display: none; margin-top: 15px;">
				<div class="tel-set-inner-wrap">
					<table class="tel-set-sip-table">
						<tr>
							<td class="tel-set-sip-td-l"><?=GetMessage('VI_CONFIG_SIP_OUT_NC')?></td>
							<td class="tel-set-sip-td-r">
								<div class="tel-set-sip-inp-wrap">
									<input class="tel-set-inp" type="text" id="vi_sip_office_title"/>
									<br/>
									<span class="tel-set-sip-description"><?=GetMessage('VI_CONFIG_SIP_OUT_NC_DESC')?></span>
								</div>
							</td>
						</tr>
						<tr>
							<td class="tel-set-sip-td-l"><?=GetMessage('VI_CONFIG_SIP_OUT_SERVER')?></td>
							<td class="tel-set-sip-td-r">
								<div class="tel-set-sip-inp-wrap">
									<input class="tel-set-inp" type="text" id="vi_sip_office_server"/>
									<br/>
									<span class="tel-set-sip-description"><?=GetMessage('VI_CONFIG_SIP_OUT_SERVER_DESC')?></span>
								</div>
							</td>
						</tr>
						<tr>
							<td class="tel-set-sip-td-l"><?=GetMessage('VI_CONFIG_SIP_OUT_LOGIN')?></td>
							<td class="tel-set-sip-td-r">
								<div class="tel-set-sip-inp-wrap">
									<input class="tel-set-inp" type="text" id="vi_sip_office_login"/>
									<br/>
									<span class="tel-set-sip-description"><?=GetMessage('VI_CONFIG_SIP_OUT_LOGIN_DESC')?></span>
								</div>
							</td>
						</tr>
						<tr>
							<td class="tel-set-sip-td-l"><?=GetMessage('VI_CONFIG_SIP_OUT_PASSWORD')?></td>
							<td class="tel-set-sip-td-r"><input class="tel-set-inp" type="text" id="vi_sip_office_password"/></td>
						</tr>
						<tr>
							<td class="tel-set-sip-td-l"></td>
							<td class="tel-set-sip-td-r">
								<div class="webform-button webform-button-create" id="vi_sip_office_add"><span class="webform-button-left"></span><span class="webform-button-text"><?=GetMessage('VI_CONFIG_SIP_CONNECT_FIRST')?></span><span class="webform-button-right"></span></div>
							</td>
						</tr>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>
<script type="text/javascript">
	BX.VoxImplant.sip.init({
		'publicFolder': '<?=CVoxImplantMain::GetPublicFolder()?>',
		'iframe': <?=CUtil::PhpToJSObject($arResult['IFRAME'])?>
	})
</script>