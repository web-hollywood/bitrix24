<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();
$APPLICATION->AddHeadString('<script type="text/javascript" src="'.CUtil::GetAdditionalFileURL(SITE_TEMPLATE_PATH."/im_mobile.js").'"></script>');
$APPLICATION->AddHeadString('<link href="'.CUtil::GetAdditionalFileURL(BX_PERSONAL_ROOT.'/js/im/css/common.css').'" type="text/css" rel="stylesheet" />');

if(empty($arResult['NOTIFY'])):?>
	<div class="notif-block-empty"><?=GetMessage('NM_EMPTY');?></div>
<?else:?>
	<div class="notif-block-wrap" id="notif-block-wrap">
	<?
	$jsIds = "";
	$maxId = 0;
	$newFlag = false;
	$firstNewFlag = true;
	foreach ($arResult['NOTIFY'] as $data):
		$avatarId = "notif-avatar-".randString(5);
		$jsIds .= $jsIds !== "" ? ', "'.$avatarId.'"' : '"'.$avatarId.'"';

		$arFormat = Array(
			"tommorow" => "tommorow, ".GetMessage('NM_FORMAT_TIME'),
			"today" => "today, ".GetMessage('NM_FORMAT_TIME'),
			"yesterday" => "yesterday, ".GetMessage('NM_FORMAT_TIME'),
			"" => GetMessage('NM_FORMAT_DATE')
		);
		$maxId = $data['id'] > $maxId? $data['id']: $maxId;
		$data['date'] = FormatDate($arFormat, $data['date']);
		$data['text'] = preg_replace("/<img.*?data-code=\"([^\"]*)\".*?>/i", "$1", $data['text']);
		$data['text'] = preg_replace("/\[USER=([0-9]{1,})\](.*?)\[\/USER\]/i", "$2", $data['text']);
		$data['text'] = preg_replace("/\[RATING=([1-5]{1})\]/i", "$1", $data['text']);
		$data['text'] = preg_replace("/\[CHAT=(imol\|)?([0-9]{1,})\](.*?)\[\/CHAT\]/i", "$3", $data['text']);
		$data['text'] = strip_tags($data['text'], '<br>');

		$data['text'] = preg_replace("/\[LIKE\]/i", '<span class="bx-smile bx-im-smile-like"></span>', $data['text']);
		$data['text'] = preg_replace("/\[DISLIKE\]/i", '<span class="bx-smile bx-im-smile-dislike"></span>', $data['text']);
		$data['link'] = CMobileHelper::createLink($data['originalTag']);

		if ($data['read'] == 'N' && !$newFlag || $data['read'] == 'Y' && $newFlag):
			$newFlag = $newFlag? false: true;
			if (!$firstNewFlag):
				?><div class="notif-new"></div><?
			endif;
		endif;
		$firstNewFlag = false;
	?>
		<div id="notify<?=$data['id']?>" class="notif-block" <?=($data['link'] && $data['type'] != 1? ' onclick="'.$data['link'].'"':'')?>>
			<div class="notif-avatar ml-avatar"><div class="ml-avatar-sub" id="<?=$avatarId?>" data-src="<?=$data['userAvatar']?>" style="background-size:cover;"></div></div>
			<div class="notif-cont">
				<div class="notif-title"><?=$data['userName']?></div>
				<div class="notif-text"><?=$data['text']?></div>
				<?if(isset($data['params'])):?>
					<?=getNotifyParamsHtml($data['params'])?>
				<?endif;?>
				<?if(isset($data['buttons'])):?>
				<div class="notif-buttons">
					<?foreach ($data['buttons'] as $button):?>
						<div data-notifyId="<?=$data['id']?>"  data-notifyValue="<?=$button['VALUE']?>" class="notif-button notif-button-<?=$button['TYPE']?>" onclick="_confirmRequest(this)"><?=$button['TITLE']?></div>
					<?endforeach;?>
				</div>
				<?endif;?>
				<div class="notif-options">
					<?=($data['link']? '<div class="notif-counter" '.($data['type'] != 1? '': ' onclick="'.$data['link'].'"').'>'.GetMessage('NM_MORE').'</div>': '')?>
					<div class="notif-time"><?=$data['date']?></div>
				</div>
			</div>
		</div>
	<?endforeach;?>
	</div>
	<script type="text/javascript">
		BX.ImLegacy.notifyLastId = <?=$maxId?>;
		BitrixMobile.LazyLoad.registerImages([<?=$jsIds?>]);
	</script>

	<script type="text/javascript">

		newNotifyReload = null;
		BX.addCustomEvent("onPull-im", function(data) {
			if (data.command == 'confirmNotify')
			{
				var notifyId = parseInt(data.params.id);
				if (BX('notify'+notifyId))
				{
					var elements = BX.findChildren(BX('notify'+notifyId), {className : "notif-buttons"}, true);
					for (var i = 0; i < elements.length; i++)
						BX.remove(elements[i]);
				}
			}
		});

		function _confirmRequest(el)
		{
			BX.remove(el.parentNode);
			BX.ImLegacy.confirmRequest({
				notifyId: el.getAttribute('data-notifyId'),
				notifyValue: el.getAttribute('data-notifyValue')
			})
		}
	</script>
<?endif;?>
<script type="text/javascript">
	if (app.enableInVersion(10))
	{
		BXMobileApp.UI.Page.TopBar.title.setText("<?=GetMessage("NM_TITLE")?>");
		BXMobileApp.UI.Page.TopBar.title.show();

		app.titleAction("setParams", {text: "<?=GetMessage("NM_TITLE")?>", useProgress: false});
	}
	app.pullDown({
		'enable': true,
		'pulltext': '<?=GetMessage('NM_PULLTEXT')?>',
		'downtext': '<?=GetMessage('NM_DOWNTEXT')?>',
		'loadtext': '<?=GetMessage('NM_LOADTEXT')?>',
		'callback': function(){
			app.titleAction("setParams", {text: "<?=GetMessage("NM_TITLE_2")?>", useProgress: true});
			app.BasicAuth({
				success: function() {
					location.reload();
				},
				failture: function() {
					app.titleAction("setParams", {text: "<?=GetMessage("NM_TITLE")?>", useProgress: false});
					app.pullDownLoadingStop();
				}
			});
		}
	});

	clearTimeout(window.onNotificationsOpenTimeout);
	window.onNotificationsOpenTimeout = setTimeout(function(){
		var lastId = <?=$arResult['UNREAD_NOTIFY_ID']?>;

		BXMobileApp.onCustomEvent("onNotificationsOpen", {lastId: lastId}, true);

		if (lastId > 0)
		{
			BX.ajax({
				url: '/mobile/ajax.php?mobile_action=im',
				method: 'POST',
				dataType: 'json',
				skipAuthCheck: true,
				data: {'IM_NOTIFY_READ': 'Y', 'ID': lastId, 'IM_AJAX_CALL': 'Y', 'sessid': BX.bitrix_sessid()},
			});
		}

	}, 300);

	BX.addCustomEvent("onFrameDataReceived", function(data){
		BitrixMobile.LazyLoad.showImages();
	});

	window.refreshEasingStart = false;

	BXMobileApp.addCustomEvent("onBeforeNotificationsReload", function(){
		app.titleAction("setParams", {text: "<?=GetMessage("NM_TITLE_2")?>", useProgress: true});
	});
</script>
<?
function getNotifyParamsHtml($params)
{
	$result = '';
	if (empty($params['ATTACH']))
		return $result;

	foreach ($params['ATTACH'] as $attachBlock)
	{
		$blockResult = '';
		foreach ($attachBlock['BLOCKS'] as $attach)
		{
			if (isset($attach['USER']))
			{
				$subResult = '';
				foreach ($attach['USER'] as $userNode)
				{
					$subResult .= '<span class="bx-messenger-attach-user">
						<span class="bx-messenger-attach-user-avatar">
							'.($userNode['AVATAR']? '<img src="'.$userNode['AVATAR'].'" class="bx-messenger-attach-user-avatar-img">': '<span class="bx-messenger-attach-user-avatar-img bx-messenger-attach-user-avatar-default">').'
						</span>
						<span class="bx-messenger-attach-user-name">'.$userNode['NAME'].'</span>
					</span>';
				}
				$blockResult .= '<span class="bx-messenger-attach-users">'.$subResult.'</span>';
			}
			else if (isset($attach['LINK']))
			{
				$subResult = '';
				foreach ($attach['LINK'] as $linkNode)
				{
					$subResult .= '<span class="bx-messenger-attach-link bx-messenger-attach-link-with-preview">
						<span class="bx-messenger-attach-link-name">'.($linkNode['NAME']? $linkNode['NAME']: $linkNode['LINK']).'</span>
						'.(!$linkNode['PREVIEW']? '': '<span class="bx-messenger-file-image-src"><img src="'.$linkNode['PREVIEW'].'" class="bx-messenger-file-image-text"></span>').'
					</span>';
				}
				$blockResult .= '<span class="bx-messenger-attach-links">'.$subResult.'</span>';
			}
			else if (isset($attach['MESSAGE']))
			{
				$blockResult .= '<span class="bx-messenger-attach-message">'.$attach['MESSAGE'].'</span>';
			}
			else if (isset($attach['HTML']))
			{
				$blockResult .= '<span class="bx-messenger-attach-message">'.$attach['HTML'].'</span>';
			}
			else if (isset($attach['GRID']))
			{
				$subResult = '';
				foreach ($attach['GRID'] as $gridNode)
				{
					$width = $gridNode['WIDTH'] ? 'width: '.$gridNode['WIDTH'].'px' : '';
					$subResult .= '<span class="bx-messenger-attach-block bx-messenger-attach-block-'.(strtolower($gridNode['DISPLAY'])).'" style="'.($gridNode['DISPLAY'] == 'LINE' ? $width : '').'">
							<div class="bx-messenger-attach-block-name" style="'.($gridNode['DISPLAY'] == 'ROW' ? $width : '').'">'.$gridNode['NAME'].'</div>
							<div class="bx-messenger-attach-block-value" style="'.($gridNode['COLOR'] ? 'color: '.$gridNode['COLOR'] : '').'">'.$gridNode['VALUE'].'</div>
						</span>';
				}
				$blockResult .= '<span class="bx-messenger-attach-blocks">'.$subResult.'</span>';
			}
			else if (isset($attach['DELIMITER']))
			{
				$style = "";
				if ($attach['DELIMITER']['SIZE'])
				{
					$style .= "width: ".$attach['DELIMITER']['SIZE']."px;";
				}
				if ($attach['DELIMITER']['COLOR'])
				{
					$style .= "background-color: ".$attach['DELIMITER']['COLOR'];
				}
				if ($style)
				{
					$style = 'style="'.$style.'"';
				}
				$blockResult .= '<span class="bx-messenger-attach-delimiter" '.$style.'></span>';
			}
			else if (isset($attach['IMAGE']))
			{
				$subResult = '';
				foreach ($attach['IMAGE'] as $imageNode)
				{
					$imageNode['PREVIEW'] = $imageNode['PREVIEW']? $imageNode['PREVIEW']: $imageNode['LINK'];
					$subResult .= '<span class="bx-messenger-file-image-src"><img src="'.$imageNode['PREVIEW'].'" class="bx-messenger-file-image-text"></span>';
				}
				$blockResult .= '<span class="bx-messenger-attach-images">'.$subResult.'</span>';
			}
			else if (isset($attach['FILE']))
			{
				$subResult = '';
				foreach ($attach['FILE'] as $fileNode)
				{
					$subResult .=
						'<div class="bx-messenger-file">
							<div class="bx-messenger-file-attrs">
								<span class="bx-messenger-file-title">
									<span class="bx-messenger-file-title-name">'.$fileNode['NAME'].'</span>
								</span>
								'.($fileNode['SIZE']? '<span class="bx-messenger-file-size">'.CFile::FormatSize($fileNode['SIZE']).'</span>':'').'
							</div>
						</div>';
				}
				$blockResult .= '<span class="bx-messenger-attach-files">'.$subResult.'</span>';
			}
		}
		if ($blockResult)
		{
			$color = $attachBlock['COLOR']? $attachBlock['COLOR']: '#818181';
			$result .= '<div class="bx-messenger-attach" style="border-color:'.$color.'">'.$blockResult.'</div>';
		}
	}
	if ($result)
	{
		$result = '<div class="bx-messenger-attach-box">'.$result.'</div>';
	}
	return $result;
}
?>