<? use Bitrix\Main\Localization\Loc;

if(!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED!==true) die();

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
/** @var \Bitrix\Disk\Internals\BaseComponent $component */
if (empty($arResult['IMAGES']) && empty($arResult['FILES']))
	return;
CJSCore::Init(array('viewer',));
\Bitrix\Main\Page\Asset::getInstance()->addCss('/bitrix/js/disk/css/legacy_uf_common.css');

$this->IncludeLangFile("show.php");
include_once(str_replace(array("\\", "//"), "/", __DIR__."/messages.php"));
?><div id="disk-attached-objects-block-<?=$arResult['UID']?>" class="feed-com-files diskuf-files-entity"><?
	if (!empty($arResult['IMAGES']))
	{
		$jsIds = "";

		?><div class="feed-com-files">
			<div class="feed-com-files-title"><?=GetMessage("WDUF_PHOTO")?></div>
			<div class="feed-com-files-cont"><?
				foreach($arResult['IMAGES'] as $id => $file)
				{
					?><span class="feed-com-files-photo feed-com-files-photo-load" id="disk-attach-<?=$file['ID']?>"<?
						?> style="width:<?=$file["THUMB"]["width"]?>px;height:<?=$file["THUMB"]["height"]?>px;"><?

						$id = "disk-attach-image-".$file['ID'];
						if (
							isset($arParams["LAZYLOAD"]) 
							&& $arParams["LAZYLOAD"] == "Y"
						)
						{
							$jsIds .= $jsIds !== "" ? ', "'.$id.'"' : '"'.$id.'"';
						}

						?><img id="<?=$id?>" onload="this.parentNode.className='feed-com-files-photo';" <?
						if (
							isset($arParams["LAZYLOAD"]) 
							&& $arParams["LAZYLOAD"] == "Y"
						)
						{
							?> src="<?=\Bitrix\Disk\Ui\LazyLoad::getBase64Stub()?>" <?
							?> data-src="<?=$file["THUMB"]["src"] ?>"<?
						}
						else
						{
							?> src="<?=$file["THUMB"]["src"] ?>" <?
						}
						?> width="<?=$file["THUMB"]["width"]?>"<?
						?> height="<?=$file["THUMB"]["height"]?>"<?
						?> border="0"<?
						?> alt="<?=htmlspecialcharsbx($file["NAME"])?>"<?
						?> data-bx-viewer="image"<?
						?> data-bx-title="<?=htmlspecialcharsbx($file["NAME"])?>"<?
						?> data-bx-size="<?=$file["SIZE"]?>"<?
						?> data-bx-download="<?=$file["DOWNLOAD_URL"] ?>"<?
						?> data-bx-storage="<?=htmlspecialcharsbx($file["STORAGE"]) ?>"<?
						?> data-bx-src="<?=$file["BASIC"]["src"] ?>"<?
						?> data-bx-edit="<?=$file["EDIT_URL"]?>"<?
						?> data-bx-width="<?=$file["BASIC"]["width"]?>"<?
						?> data-bx-height="<?=$file["BASIC"]["height"]?>"<?
						?> bx-attach-file-id="<?=$file['FILE_ID']?>"<?
						if ($file['XML_ID']): ?> bx-attach-xml-id="<?=$file['XML_ID']?>"<?endif;
						if (!empty($file["ORIGINAL"]))
						{
							?> data-bx-full="<?=$file["ORIGINAL"]["src"]?>"<?
							?> data-bx-full-width="<?=$file["ORIGINAL"]["width"]?>" <?
							?> data-bx-full-height="<?=$file["ORIGINAL"]["height"]?>"<?
							?> data-bx-full-size="<?=$file["SIZE"]?>"<?
						}
						?> /><?
					?></span><?
				}
			?></div>
		</div><?

		if (strlen($jsIds) > 0)
		{
			?><script>BX.LazyLoad.registerImages([<?=$jsIds?>]);</script><?		
		}
	}

	if (!empty($arResult['FILES']))
	{
		?><div class="feed-com-docs">
		<div class="feed-com-files-title"><?=GetMessage('WDUF_FILES')?></div>
		<div class="feed-com-files-cont"><?

		foreach($arResult['FILES'] as $file)
		{
			?><div class="feed-com-file-wrap">
				<span class="feed-con-file-icon feed-file-icon-<?=htmlspecialcharsbx($file['EXTENSION'])?>"></span>
				<span class="feed-com-file-name-wrap">
					<a <?= ($file['FROM_EXTERNAL_SYSTEM'] && $file['CAN_UPDATE'])? 'style="color:#d9930a;"' : '' ?> target="_blank" href="<?=htmlspecialcharsbx($file['DOWNLOAD_URL'])?>"<?
						?> id="disk-attach-<?=$file['ID']?>"<?
						?> class="feed-com-file-name" <?
						?> title="<?=htmlspecialcharsbx($file['NAME'])?>" <?
						?> bx-attach-file-id="<?=$file['FILE_ID']?>"<?
						if ($file['XML_ID']): ?> bx-attach-xml-id="<?=$file['XML_ID']?>"<?endif;
						?> data-bx-baseElementId="disk-attach-<?=$file['ID']?>" <?=
							$file['ATTRIBUTES_FOR_VIEWER']
						?> alt="<?=htmlspecialcharsbx($file['NAME'])?>"<?
					?>><?=htmlspecialcharsbx($file['NAME'])?><?
					?></a><?
					?><span class="feed-com-file-size"><?=$file['SIZE']?></span><?
					?><script type="text/javascript">
						BX.namespace("BX.Disk.Files");
						BX.Disk.Files['<?= $file['ID'] ?>'] = [
							{text : BX.message('JS_CORE_VIEWER_VIEW_ELEMENT'), className : "bx-viewer-popup-item item-view", href : "#", onclick: function(e){
								BX.fireEvent(BX.findPreviousSibling(BX(this.bindElement), function(node){ return BX.type.isElementNode(node) && (node.getAttribute('data-bx-viewer'));}, true), 'click');
								BX.PopupMenu.currentItem.popupWindow.close();
								return BX.PreventDefault(e);
							}},
							<? if($file['EDITABLE'] && $file['CAN_UPDATE']){ ?>
							{text : BX.message('JS_CORE_VIEWER_EDIT'), className : "bx-viewer-popup-item item-edit", href : "#", onclick: function(e){
								BX.fireEvent(BX.findPreviousSibling(BX(this.bindElement), function(node){ return BX.type.isElementNode(node) && (node.getAttribute('data-bx-viewer'));}, true), 'click'); top.BX.CViewer.objNowInShow.runActionByCurrentElement('forceEdit', {obElementViewer: top.BX.CViewer.objNowInShow});
								BX.PopupMenu.currentItem.popupWindow.close();
								return BX.PreventDefault(e);
							}},
							<? } ?>
							<? if(!$arParams['DISABLE_LOCAL_EDIT']){ ?>
							{text : BX.message('JS_CORE_VIEWER_SAVE_TO_OWN_FILES'), className : "bx-viewer-popup-item item-b24", href : "#", onclick: function(e){
								top.BX.CViewer.getWindowCopyToDisk({link: "<?=CUtil::JSUrlEscape($file['COPY_TO_ME_URL'])?>", selfViewer: false, showEdit: <?= ($file['EDITABLE']? 'true' : 'false')  ?>, title: "<?= CUtil::JSEscape($file["NAME"]) ?>"});
								BX.PopupMenu.currentItem.popupWindow.close();
								return BX.PreventDefault(e);
							}},
							<? } ?>
							<? if($file['FROM_EXTERNAL_SYSTEM'] && $file['CAN_UPDATE']){ ?>
							{text : '<?= GetMessageJS('DISK_UF_FILE_RUN_FILE_IMPORT') ?>', className : "bx-viewer-popup-item item-toload", href : "#", onclick: function(e){
								top.BX.Disk.UF.runImport({id: <?= $file['ID'] ?>, name: '<?= CUtil::JSEscape($file['NAME']) ?>'});
								BX.PopupMenu.currentItem.popupWindow.close();
								return BX.PreventDefault(e);
							}},
							<? } ?>
							{text : BX.message('JS_CORE_VIEWER_DOWNLOAD_TO_PC'), className : "bx-viewer-popup-item item-download", href : "<?=$file["DOWNLOAD_URL"]?>", onclick: function(e){BX.PopupMenu.currentItem.popupWindow.close();}}
							<? if(!$arParams['DISABLE_LOCAL_EDIT']){ ?>
							,
							{text : '<?= GetMessageJS('DISK_UF_FILE_SETTINGS_DOCS') ?>', className : "bx-viewer-popup-item item-setting", href : "#", onclick: function(e){
								var viewer = new BX.CViewer({});
								viewer.openWindowForSelectDocumentService({viewInUf: true});
								BX.PopupMenu.currentItem.popupWindow.close();
								return BX.PreventDefault(e);
							}}
							<? } ?>
						];
					</script><?
					if($file['EDITABLE'] && $file['CAN_UPDATE']) {
						?><a class="feed-con-file-changes-link" href="#" onclick="BX.fireEvent(BX.findPreviousSibling(BX(this), function(node){ return BX.type.isElementNode(node) && (node.getAttribute('data-bx-viewer'));}, true), 'click');top.BX.CViewer.objNowInShow.runActionByCurrentElement('forceEdit', {obElementViewer: top.BX.CViewer.objNowInShow}); return false;"><?= GetMessage('WDUF_FILE_EDIT') ?></a><?
					}
					?><span bx-attach-id="<?= $file['ID'] ?>" class="feed-con-file-changes-link feed-con-file-changes-link-more"><?= GetMessage('WDUF_MORE_ACTIONS') ?></span>
				</span>
			</div><?      
		} 
		?></div>
		</div><?
	}
	?>
	<? if((count($arResult['FILES']) + count($arResult['IMAGES'])) > 1 && $arResult['ENABLED_MOD_ZIP']){ ?>
		<div class="feed-com-info">
			<div class="feed-com-info-download">
				<span class="feed-com-download-link">
					<a href="<?= $arResult['DOWNLOAD_ARCHIVE_URL'] ?>"><?= Loc::getMessage('DISK_UF_FILE_DOWNLOAD_ALL_FILES_BY_ARCHIVE') ?></a>
					<span class="feed-com-download-size">(<?= \CFile::FormatSize($arResult['COMMON_SIZE']) ?>)</span>
				</span>
			</div>
			<div class="feed-com-info-pager"></div>
		</div>
	<? } ?>
</div>
<script type="text/javascript">
	BX.ready(function () {
		new BX.Disk.CommentsAttachedObjectClass({
			containerId: "disk-attached-objects-block-<?=$arResult['UID']?>",
			menuButtonsByFile: BX.Disk.Files,
			selectorToFindMoreLinks: {
				className: 'feed-con-file-changes-link-more',
				tagName: 'span'
			}
		});
	});
</script>
<? if($arParams['ENABLE_AUTO_BINDING_VIEWER']){ ?>
<script type="text/javascript">
	top.BX.viewElementBind(
		BX("disk-attached-objects-block-<?=$arResult['UID']?>"),
		{},
		function(node){
			return BX.type.isElementNode(node) && (node.getAttribute('data-bx-viewer') || node.getAttribute('data-bx-image'));
		}
	);
</script>
<? } ?>