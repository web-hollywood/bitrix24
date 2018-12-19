<?
/**
 * Global variables
 * @var array $arResult
 */
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();
?>
<table cellpadding="0" cellspacing="0" border="0" class="bx-edit-tab-title" style="width: 100%; ">
	<tr>
		<td class="bx-form-title">
			<?=GetMessage('VI_DOCS_TITLE')?>
		</td>
	</tr>
</table>
<div class="tel-set-item" style="margin-top:20px; margin-bottom: 10px;">
	<div class="bx-vi-docs-body"><?=GetMessage('VI_DOCS_BODY_2');?></div>

	<?foreach ($arResult['DOCUMENTS'] as $verification):?>
	<div class="bx-vi-docs-title"><?=$verification['ADDRESS'];?></div>
	<div class="bx-vi-docs-box">
		<div class="tel-phones-list-notice tel-phones-list-notice-status-<?=$verification['STATUS'];?>">
			<?=GetMessage('VI_DOCS_STATUS');?> <strong style="text-transform: lowercase"><?=($verification['STATUS'] == 'ERROR' ? GetMessage('VI_DOCS_SERVICE_ERROR') : $verification['STATUS_NAME']);?></strong><br>
		<?if($verification['UNVERIFIED_HOLD_UNTIL']):?>
			<?=GetMessage('VI_DOCS_UNTIL_DATE', Array('#DATE#' => '<b>'.$verification['UNVERIFIED_HOLD_UNTIL'].'</b>'));?><br><br>
			<?=GetMessage('VI_DOCS_UNTIL_DATE_NOTICE');?>
		<?endif;?>
		</div>
		<?if(!empty($verification['DOCUMENTS'])):?>
			<?if($verification['STATUS'] == 'VERIFIED'):?>
				<div id="vi_docs_table_btn_<?=$verification['COUNTRY_CODE']?>" class="tel-phones-list-link"><?=GetMessage("VI_DOCS_TABLE_LINK")?></div>
			<?endif;?>
			<div id="vi_docs_table_body_<?=$verification['COUNTRY_CODE']?>"  class="tel-phones-list-body" style="<?=($verification['STATUS'] == 'VERIFIED'?'display:none':'')?>">
				<table cellspacing="0" cellpadding="0" class="tel-phones-list tel-phones-list-status">
					<tr>
						<td class="tel-phones-list-th tel-phones-list-th-first" ><?=GetMessage('VI_DOCS_TABLE_UPLOAD');?></td>
						<td class="tel-phones-list-th"><?=GetMessage('VI_DOCS_TABLE_STATUS');?></td>
						<td class="tel-phones-list-th"><?=GetMessage('VI_DOCS_TABLE_TYPE');?></td>
						<td class="tel-phones-list-th tel-phones-list-th-last"><?=GetMessage('VI_DOCS_TABLE_COMMENT');?></td>
					</tr>
					<?foreach ($verification['DOCUMENTS'] as $document):?>
					<?
						$tdColor = 'red';
						if ($document['DOCUMENT_STATUS'] == 'ACCEPTED')
							$tdColor = 'green';
						else if ($document['DOCUMENT_STATUS'] == 'IN_PROGRESS')
							$tdColor = 'yellow';
						else
							$tdColor = 'red';
					?>
					<tr class="tel-phones-list-tr-<?=$tdColor?>">
						<td class="tel-phones-list-td tel-phones-list-td-first"><?=$document['UPLOADED']?></td>
						<td class="tel-phones-list-td" style="white-space: nowrap;"><?=$document['DOCUMENT_STATUS_NAME']?></td>
						<td class="tel-phones-list-td"><?=$document['IS_INDIVIDUAL_NAME']?></td>
						<td class="tel-phones-list-td tel-phones-list-td-last"><?=(strlen($document['REVIEWER_COMMENT'])>0? $document['REVIEWER_COMMENT']: '-')?></td>
					</tr>
					<?endforeach;?>
					<tr>
						<td class="tel-phones-list-td-footer tel-phones-list-td-footer-first"></td>
						<td class="tel-phones-list-td-footer"></td>
						<td class="tel-phones-list-td-footer"></td>
						<td class="tel-phones-list-td-footer tel-phones-list-td-footer-last"></td>
					</tr>
				</table>
				<script type="text/javascript">
					BX.bind(BX('vi_docs_table_btn_<?=$verification['COUNTRY_CODE']?>'), 'click', function(e)
					{
						if (BX('vi_docs_table_body_<?=$verification['COUNTRY_CODE']?>').style.display == 'none')
						{
							BX.addClass(BX('vi_docs_table_body_<?=$verification['COUNTRY_CODE']?>'), 'tel-connect-pbx-animate');
							BX('vi_docs_table_body_<?=$verification['COUNTRY_CODE']?>').style.display = 'block';
						}
						else
						{
							BX.removeClass(BX('vi_docs_table_body_<?=$verification['COUNTRY_CODE']?>'), 'tel-connect-pbx-animate');
							BX('vi_docs_table_body_<?=$verification['COUNTRY_CODE']?>').style.display = 'none';
						}

						BX.PreventDefault(e);
					});
				</script>
			</div>
		<?endif;?>
	</div>
	<?if(isset($verification['UPLOAD_IFRAME_URL'])):?>
		<?if($verification['COUNTRY_CODE']==='RU'):?>
			<a id="vi_docs_upload_btn_<?=$verification['COUNTRY_CODE']?>" href="#docs" class="webform-small-button webform-small-button-accept">
				<span class="webform-small-button-text"><?=($verification['STATUS'] == 'REQUIRED'? GetMessage('VI_DOCS_UPLOAD_BTN'): GetMessage('VI_DOCS_UPDATE_BTN'))?></span>
			</a>
		<?endif?>
		<div id="vi_docs_upload_form_<?=$verification['COUNTRY_CODE']?>" class="tel-set-block-wrap tel-set-block-wrap-2" <?=($verification['SHOW_UPLOAD_IFRAME'] ? '' : 'style="display: none;"')?>>
			<div class="tel-set-block tel-set-block-active">
				<div style="display: block;" class="tel-set-block-inner-wrap" id="tel-set-first">
					<div class="tel-set-inner">
						<?=GetMessage('VI_DOCS_UPLOAD_NOTICE')?>
						<div class="bx-vi-docs-iframe">
							<iframe src="<?=$verification['UPLOAD_IFRAME_URL']?>" frameborder="0" width="100%" height="100%"></iframe>
						</div>
					</div>
				</div>
			</div>
		</div>
		<?if($verification['SHOW_UPLOAD_IFRAME']):?>
			<script>
				BX.scrollToNode("vi_docs_upload_form_<?=$verification['COUNTRY_CODE']?>");
			</script>
		<?endif?>
	<?endif?>
	<script type="text/javascript">
		BX.bind(BX('vi_docs_upload_btn_<?=$verification['COUNTRY_CODE']?>'), 'click', function(e)
		{
			if (BX('vi_docs_upload_form_<?=$verification['COUNTRY_CODE']?>').style.display == 'none')
			{
				BX.removeClass(BX('vi_docs_upload_btn_<?=$verification['COUNTRY_CODE']?>'), 'webform-small-button-accept');
				BX.addClass(BX('vi_docs_upload_form_<?=$verification['COUNTRY_CODE']?>'), 'tel-connect-pbx-animate');
				BX('vi_docs_upload_form_<?=$verification['COUNTRY_CODE']?>').style.display = 'block';

			}
			else
			{
				BX.addClass(BX('vi_docs_upload_btn_<?=$verification['COUNTRY_CODE']?>'), 'webform-small-button-accept');
				BX.removeClass(BX('vi_docs_upload_form_<?=$verification['COUNTRY_CODE']?>'), 'tel-connect-pbx-animate');
				BX('vi_docs_upload_form_<?=$verification['COUNTRY_CODE']?>').style.display = 'none';
			}

			BX.PreventDefault(e);
		});
	</script>
	<?endforeach;?>
</div>