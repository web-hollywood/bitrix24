<?php

use Bitrix\Main\Localization\Loc;

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

$message = $arResult['MESSAGE'];

$this->setViewTarget('pagetitle_icon');

?>

<span class="mail-msg-title-icon mail-msg-title-icon-<?=($message['__is_outcome'] ? 'outcome' : 'income') ?>"></span>
<span class="mail-msg-title-icon-placeholder ">&nbsp;</span>

<?

$this->endViewTarget();

$createMenu = array(
	'TASKS_TASK' => array(
		'title' => Loc::getMessage('MAIL_MESSAGE_CREATE_TASK_BTN'),
		'href' => \CHTTP::urlAddParams(
			\CComponentEngine::makePathFromTemplate(
				$arParams['PATH_TO_USER_TASKS_TASK'],
				array(
					'action' => 'edit',
					'task_id' => '0',
				)
			),
			array(
				'TITLE' => rawurlencode(Loc::getMessage('MAIL_MESSAGE_TASK_TITLE', array('#SUBJECT#' => $message['SUBJECT']))),
				'UF_MAIL_MESSAGE' => (int) $message['ID'],
			)
		),
	),
	'CRM_ACTIVITY' => array(
		'title' => Loc::getMessage('MAIL_MESSAGE_CREATE_CRM_BTN'),
	),
	'CRM_EXCLUDE' => array(
		'title' => Loc::getMessage('MAIL_MESSAGE_CREATE_CRM_EXCLUDE_BTN'),
	),
	'BLOG_POST' => array(
		'title' => Loc::getMessage('MAIL_MESSAGE_CREATE_LF_BTN'),
		'disabled' => true,
	),
	'IM_CHAT' => array(
		'title' => Loc::getMessage('MAIL_MESSAGE_CREATE_IM_BTN'),
		'disabled' => true,
	),
	'CALENDAR_EVENT' => array(
		'title' => Loc::getMessage('MAIL_MESSAGE_CREATE_EVENT_BTN'),
		'disabled' => true,
	),
);

foreach ($createMenu as $id => $item)
{
	$createMenu[$id]['id'] = $id;
	$createMenu[$id]['binded'] = in_array($id, $message['BIND']);
}

$createMenu['__default'] = &$createMenu[\CUserOptions::getOption('mail', 'default_create_action', 'TASKS_TASK')];

if (SITE_TEMPLATE_ID == 'bitrix24' || $_REQUEST['IFRAME'] == 'Y' && $_REQUEST['IFRAME_TYPE'] == 'SIDE_SLIDER')
{
	$this->setViewTarget('pagetitle');
}

?>

<div class="ui-btn-double ui-btn-primary"> 
	<a class="ui-btn-main" id="mail-msg-view-create-btn"><?=$createMenu['__default']['title'] ?></a> 
	<a class="ui-btn-extra" id="mail-msg-view-create-menu-btn"></a> 
</div>

<?

if (SITE_TEMPLATE_ID == 'bitrix24' || $_REQUEST['IFRAME'] == 'Y' && $_REQUEST['IFRAME_TYPE'] == 'SIDE_SLIDER')
{
	$this->endViewTarget();
}

?>

<script type="text/javascript">

BX.ready(function ()
{
	BXMailMessageController.init({
		messageId: <?=intval($message['ID']) ?>,
		ajaxUrl: '/bitrix/services/main/ajax.php?c=<?=rawurlencode($this->__component->getName()) ?>&mode=class',
		pageSize: <?=intval($arParams['PAGE_SIZE']) ?>,
		<? if (isset($_REQUEST['mail_uf_message_token']) && is_string($_REQUEST['mail_uf_message_token'])): ?>
			mail_uf_message_token: '<?=\CUtil::jsEscape($_REQUEST['mail_uf_message_token']) ?>',
		<? endif ?>
		pathNew: '<?=\CUtil::jsEscape(\CHTTP::urlAddParams(
			$arParams['~PATH_TO_MAIL_MSG_NEW'],
			array(
				'IFRAME' => $_REQUEST['IFRAME'],
				'IFRAME_TYPE' => $_REQUEST['IFRAME_TYPE'],
			)
		)) ?>',
		createMenu: <?=\Bitrix\Main\Web\Json::encode($createMenu) ?>,
		isCrmEnabled: <?= CUtil::PhpToJSObject($arResult['CRM_ENABLE'] === 'Y'); ?>
	});
});

</script>

<div class="mail-msg-view-wrapper" data-uid-key="<?= htmlspecialcharsbx($arResult['MESSAGE_UID_KEY']); ?>">

	<div class="mail-msg-view-log-separator"
		style="margin-bottom: 1px; <? if (count($arResult['LOG']['A']) < $arParams['PAGE_SIZE']): ?> display: none; <? endif ?>">
		<a class="mail-msg-view-log-more mail-msg-view-log-more-a" href="#"><?=Loc::getMessage('MAIL_MESSAGE_LOG_MORE') ?></a>
	</div>

	<?

	$list = $arResult['LOG']['A'];
	include __DIR__ . '/__log.php';

	?>

	<div style="display: none; "></div>
	<div class="mail-msg-view-details" data-id="<?=intval($message['ID']) ?>"
		id="mail-msg-view-details-<?=intval($message['ID']) ?>">
		<? include __DIR__ . '/__body.php'; ?>
	</div>

	<?

	$list = $arResult['LOG']['B'];
	include __DIR__ . '/__log.php';

	?>

	<div class="mail-msg-view-log-separator"
		style="margin-top: 1px; <? if (count($arResult['LOG']['B']) < $arParams['PAGE_SIZE']): ?> display: none; <? endif ?>">
		<a class="mail-msg-view-log-more mail-msg-view-log-more-b" href="#"><?=Loc::getMessage('MAIL_MESSAGE_LOG_MORE') ?></a>
	</div>

</div>

<script type="text/javascript">

BX.message({
	MAIL_MESSAGE_AJAX_ERROR: '<?=\CUtil::jsEscape(Loc::getMessage('MAIL_MESSAGE_AJAX_ERROR')) ?>',
	MAIL_MESSAGE_NEW_EMPTY_RCPT: '<?=\CUtil::jsEscape(Loc::getMessage('MAIL_MESSAGE_NEW_EMPTY_RCPT')) ?>',
	MAIL_MESSAGE_NEW_UPLOADING: '<?=\CUtil::jsEscape(Loc::getMessage('MAIL_MESSAGE_NEW_UPLOADING')) ?>',
	MAIL_MESSAGE_READ_CONFIRMED_SHORT: '<?=\CUtil::jsEscape(Loc::getMessage('MAIL_MESSAGE_READ_CONFIRMED_SHORT')) ?>',
	MAIL_MESSAGE_DELETE_CONFIRM: '<?=\CUtil::jsEscape(Loc::getMessage('CRM_ACT_EMAIL_DELETE_CONFIRM')) ?>',
	MAIL_MESSAGE_SPAM_CONFIRM: '<?=\CUtil::jsEscape(Loc::getMessage('CRM_ACT_EMAIL_SPAM_CONFIRM')) ?>',
	MAIL_MESSAGE_LIST_CONFIRM_DELETE: '<?= Loc::getMessage('MAIL_MESSAGE_LIST_CONFIRM_DELETE') ?>',
	MAIL_MESSAGE_LIST_CONFIRM_DELETE_BTN: '<?= Loc::getMessage('MAIL_MESSAGE_LIST_CONFIRM_DELETE_BTN') ?>',
	MAIL_MESSAGE_LIST_CONFIRM_TITLE: '<?= Loc::getMessage('MAIL_MESSAGE_LIST_CONFIRM_TITLE') ?>',
	MAIL_MESSAGE_LIST_CONFIRM_CANCEL_BTN: '<?= Loc::getMessage('MAIL_MESSAGE_LIST_CONFIRM_CANCEL_BTN') ?>',
	MAIL_MESSAGE_SEND_SUCCESS: '<?= Loc::getMessage('MAIL_MESSAGE_SEND_SUCCESS') ?>',
	MAIL_MESSAGE_LIST_NOTIFY_ADDED_TO_CRM: '<?=\CUtil::jsEscape(Loc::getMessage('MAIL_MESSAGE_LIST_NOTIFY_ADDED_TO_CRM')) ?>',
	MAIL_MESSAGE_LIST_NOTIFY_NOT_ADDED_TO_CRM: '<?=\CUtil::jsEscape(Loc::getMessage('MAIL_MESSAGE_LIST_NOTIFY_NOT_ADDED_TO_CRM')) ?>',
	MAIL_MESSAGE_LIST_NOTIFY_EXCLUDED_FROM_CRM: '<?=\CUtil::jsEscape(Loc::getMessage('MAIL_MESSAGE_LIST_NOTIFY_EXCLUDED_FROM_CRM')) ?>'
});

top.BX.SidePanel.Instance.postMessage(
	window,
	'mail-message-view',
	{
		id: <?=intval($message['ID']) ?>
	}
);

</script>
