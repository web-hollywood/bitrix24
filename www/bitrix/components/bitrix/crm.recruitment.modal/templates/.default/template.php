<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();

if ($_SERVER['REQUEST_METHOD'] == 'POST'):
	//$APPLICATION->RestartBuffer();
	?>
	<script type="text/javascript">
		<?if(strlen($arResult['ERROR_MSG']) > 0 ):?>
			alert("<?=$arResult['ERROR_MSG']?>");
			BX.closeWait();
		<?else:?>
			parent.crmImportLocations.onImportButClick();
			//top.location.href = '<?=CUtil::JSEscape($arResult['BACK_URL'])?>';
		<?endif;?>
	</script><?
	die();
endif;

?>
<div id="form_container" style="display:block;">
<script src="<?=$templateFolder.'/script.js'?>" type="text/javascript"></script>
<link href="<?=$templateFolder.'/style.css'?>" type="text/css" rel="stylesheet" />
<form action="<?=$componentPath?>/box.php" target="loc_import" name="import_form" method="post" enctype="multipart/form-data">
<?=bitrix_sessid_post()?>
<input type="hidden" name="BACK_URL" value="<?=$arResult['BACK_URL']?>" id="BACK_URL"/>
<input type="hidden" name="TMP_PATH" value="<?=$arResult['TMP_PATH']?>" id="TMP_PATH"/>

<b><?=GetMessage('CRM_LOC_FIRST_NAME')?>:</b><br>
<div>
	<input type="text" name="first_name" id="first_name">
</div>

<b><?=GetMessage('CRM_LOC_LAST_NAME')?>:</b><br>
<div>
	<input type="text" name="last_name" id="last_name">
</div>

<b><?=GetMessage('CRM_LOC_EMAIL')?>:</b><br>
<div>
	<input type="text" name="email" id="email">
</div>

<b><?=GetMessage('CRM_LOC_PHONE')?>:</b><br>
<div>
	<input type="text" name="phone" id="phone">
</div>

<b><?=GetMessage('CRM_LOC_NOTES')?>:</b><br>
<div>
	<input type="text" name="notes" id="notes">
</div>

<b><?=GetMessage('CRM_LOC_SOURCE')?>:</b><br>
<div>
	<input type="text" name="source" id="source">
</div>


</form>
</div>

<div class="instal-load-block" id="instal-load-block" style="display:none;">
	<div class="instal-load-title" id="instal-load-title"></div>
	<div class="instal-load-label" id="instal-load-label"></div>
	<div class="instal-load-error" id="instal-load-error"></div>
	<div style="width: 500px;" class="instal-progress-bar-outer" id="instal-progress-bar-outer">
		<div class="instal-progress-bar-alignment">
			<div style="width: 0%;" class="instal-progress-bar-inner" id="instal-progress-bar-inner">
				<div style="width: 500px;" class="instal-progress-bar-inner-text" id="instal-progress-bar-inner-text">0%</div>
			</div>
			<span class="instal-progress-bar-span" id="instal-progress-bar-span">0%</span>
		</div>
	</div>
</div>

<iframe name="loc_import" style="display: none;">
</iframe>

<script type="text/javascript">
	BX('BACK_URL').value = window.location.href;

	BX.WindowManager.Get().SetTitle("<?=GetMessage('MODAL_WINDOW_TITLE');?>");

	var _BTN = [
		{
			'title': "<?=GetMessage('CRM_SAVE_BUTTON');?>",
			'id': 'crm_loc_save',
			'action': function () {
					BX('crm_loc_save').disabled = true;
					document.forms.import_form.submit();
					BX.showWait();
			}
		},
		{
			'title': "<?=GetMessage('CRM_CANCEL_BUTTON');?>",
			'id': 'crm_loc_cancel',
			'action': function () {
					BX.closeWait();
					BX.WindowManager.Get().Close();
			}

		}
		//BX.CDialog.btnCancel
	];

	var _BTN2 = [
		{
			'title': "<?=GetMessage('CRM_CLOSE_BUTTON');?>",
			'id': 'crm_loc_close',
			'action': function () {
					BX.closeWait();
					BX.WindowManager.Get().Close();
					top.location.href = '<?=CUtil::JSEscape($arResult['BACK_URL'])?>';
				}
		}
	];

	BX.WindowManager.Get().ClearButtons();
	BX.WindowManager.Get().SetButtons(_BTN);
	BX.WindowManager.Get().adjustSizeEx();

	BX.ready( function(){
				crmImportLocations.init({
					url: "<?=$componentPath?>"
				})
			});

	BX.message({
		CRM_LOC_IMP_JS_IMPORT_SUCESS: '<?=CUtil::JSEscape(GetMessage("CRM_LOC_IMP_JS_IMPORT_SUCESS"))?>',
		CRM_LOC_IMP_JS_IMPORT_PROCESS: '<?=CUtil::JSEscape(GetMessage("CRM_LOC_IMP_JS_IMPORT_PROCESS"))?>',
		CRM_LOC_IMP_JS_FILE_PROCESS: '<?=CUtil::JSEscape(GetMessage("CRM_LOC_IMP_JS_FILE_PROCESS"))?>',
		CRM_LOC_IMP_STEP_CHECK: '<?=CUtil::JSEscape(GetMessage("CRM_LOC_IMP_STEP_CHECK"))?>',
		CRM_LOC_IMP_JS_ERROR: '<?=CUtil::JSEscape(GetMessage("CRM_LOC_IMP_JS_ERROR"))?>'
	});
</script>
