<?php

use Bitrix\Mail\Helper\MessageFolder;
use Bitrix\Mail\Internals\MessageAccessTable;
use Bitrix\Main;
use Bitrix\Main\Localization\Loc;
use Bitrix\Mail;

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

class CMailClientMessageListComponent extends CBitrixComponent
{
	protected $componentId;

	public function getComponentId()
	{
		if ($this->componentId === null)
		{
			$this->componentId = 'mail-client-list-manager';
		}
		return $this->componentId;
	}

	public function executeComponent()
	{
		global $USER, $APPLICATION;

		$APPLICATION->setTitle(Loc::getMessage('MAIL_CLIENT_HOME_TITLE'));

		if (!is_object($USER) || !$USER->isAuthorized())
		{
			$APPLICATION->authForm('');
			return;
		}

		$vars = $this->arParams['VARIABLES'];

		\Bitrix\Main\Loader::includeModule('mail');

		$this->arResult['MAILBOXES'] = Mail\MailboxTable::getUserMailboxes();
		$this->arResult['MAILBOX'] = array();
		$this->arResult['USER_OWNED_MAILBOXES_COUNT'] = 0;

		foreach ($this->arResult['MAILBOXES'] as $k => $item)
		{
			if (empty($item['NAME']))
			{
				$item['NAME'] = $item['EMAIL'] ?: $item['LOGIN'] ?: sprintf('#%u', $item['ID']);
			}

			$this->arResult['MAILBOXES'][$k] = $item;

			if (empty($vars['id']) && empty($this->arResult['MAILBOX']) || $vars['id'] == $item['ID'])
			{
				$mailbox = $this->arResult['MAILBOX'] = $item;
			}

			if ($item['USER_ID'] == $USER->getId())
			{
				$this->arResult['USER_OWNED_MAILBOXES_COUNT']++;
			}
		}

		if (empty($mailbox))
		{
			if (isset($_REQUEST['strict']) && 'N' == $_REQUEST['strict'])
			{
				localRedirect($this->arParams['PATH_TO_MAIL_HOME'], true);
			}
			else
			{
				showError(Loc::getMessage('MAIL_CLIENT_ELEMENT_NOT_FOUND'));
				return;
			}
		}

		if (empty($mailbox['OPTIONS']['imap']['dirs']) || !is_array($mailbox['OPTIONS']['imap']['dirs']))
		{
			$mailboxHelper = Mail\Helper\Mailbox::createInstance($mailbox['ID']);
			$mailboxHelper->cacheDirs();

			$mailbox['OPTIONS']['imap']['dirs'] = $mailboxHelper->getMailbox()['OPTIONS']['imap']['dirs'];
		}

		$this->rememberCurrentMailboxId($mailbox['ID']);
		$this->arResult['userHasCrmActivityPermission'] = Main\Loader::includeModule('crm') && \CCrmPerms::isAccessEnabled();
		$mailboxesUnseen = \Bitrix\Mail\Helper\Message::getTotalUnseenForMailboxes(Main\Engine\CurrentUser::get()->getId());
		foreach ($mailboxesUnseen as $mailboxId => $mailboxData)
		{
			$this->arResult['MAILBOXES'][$mailboxId]['__total'] = $mailboxData['TOTAL'];
			$this->arResult['MAILBOXES'][$mailboxId]['__unseen'] = $mailboxData['UNSEEN'];
		}

		$this->arResult['GRID_ID']   = 'mail-message-list-' . $mailbox['ID'];
		$this->arResult['FILTER_ID'] = 'mail-message-list-' . $mailbox['ID'];

		$this->setFilterSettings($mailbox);
		$this->setFilterPresets($mailbox);

		$gridOptions = new \Bitrix\Main\Grid\Options($this->arResult['GRID_ID'], $this->arResult['FILTER_PRESETS']);

		$navData = $gridOptions->getNavParams(array('nPageSize' => 25));
		$navigation = new \Bitrix\Main\UI\PageNavigation('mail-message-list');
		$navigation->setPageSize($navData['nPageSize'])->initFromUri();

		$request = \Bitrix\Main\Context::getCurrent()->getRequest();
		if (preg_match('/^\s*(\d+)\s*$/', $request->getQuery($navigation->getId()), $matches))
		{
			$navigation->setCurrentPage($matches[1]);
		}

		$filter = $this->getFilterForMessagesQuery($mailbox);

		$itemsQuery = \Bitrix\Mail\MailMessageTable::query()
			->registerRuntimeField('', new \Bitrix\Main\Entity\ReferenceField(
				'MESSAGE_UID',
				'Bitrix\Mail\MailMessageUidTable',
				array(
					'=this.MAILBOX_ID' => 'ref.MAILBOX_ID',
					'=this.ID' => 'ref.MESSAGE_ID',
				),
				array(
					'join_type' => 'INNER',
				)
			))
			->registerRuntimeField('', new \Bitrix\Main\Entity\ReferenceField(
				'MESSAGE_ACCESS',
				MessageAccessTable::class,
				[
					'=this.MAILBOX_ID' => 'ref.MAILBOX_ID',
					'=this.ID' => 'ref.MESSAGE_ID',
				]
			))
			->addSelect(new \Bitrix\Main\Entity\ExpressionField(
					'BIND',
					'GROUP_CONCAT(CONCAT(%s, "-", %s))',
					[
						'MESSAGE_ACCESS.ENTITY_TYPE',
						'MESSAGE_ACCESS.ENTITY_ID',
					]
				))
			->addSelect('MESSAGE_UID.ID', 'RID')
			->addSelect('MESSAGE_UID.DIR_MD5', 'DIR_MD5')
			->addSelect('ID', 'MID')
			->addSelect('SUBJECT')
			->addSelect('FIELD_FROM')
			->addSelect('FIELD_DATE')
			->addSelect('ATTACHMENTS')
			->addSelect('MESSAGE_UID.IS_SEEN', 'IS_SEEN')
			->addSelect(new \Bitrix\Main\Entity\ExpressionField('MSG_UID', 'MAX(%s)', 'MESSAGE_UID.MSG_UID'))
			->setFilter($filter)
			->addGroup('MID')
			->addOrder('FIELD_DATE', 'DESC')
			->addOrder('ID', 'DESC')
			->setOffset($navigation->getOffset())
			->setLimit($navigation->getLimit() + 1);

		if (Main\Loader::includeModule('crm'))
		{
			$itemsQuery = $itemsQuery
				->addSelect(new \Bitrix\Main\Entity\ExpressionField('CRM_ACTIVITY_OWNER_TYPE_ID', 'MAX(%s)', 'MESSAGE_ACCESS.CRM_ACTIVITY.OWNER_TYPE_ID'))
				->addSelect(new \Bitrix\Main\Entity\ExpressionField('CRM_ACTIVITY_OWNER_ID', 'MAX(%s)', 'MESSAGE_ACCESS.CRM_ACTIVITY.OWNER_ID'));
		}
		$items = $itemsQuery->exec()->fetchAll();

		$this->arResult['gridActionsData'] = $this->getGridActionsData();

		$this->arResult['ROWS'] = $this->getRows($items, $mailbox, $navigation);
		$this->arResult['NAV_OBJECT'] = $navigation;

		$unseen = \Bitrix\Mail\MailMessageTable::getList(array(
			'runtime' => array(
				new \Bitrix\Main\Entity\ReferenceField(
					'MESSAGE_UID',
					'Bitrix\Mail\MailMessageUidTable',
					array(
						'=this.MAILBOX_ID' => 'ref.MAILBOX_ID',
						'=this.ID' => 'ref.MESSAGE_ID',
					),
					array(
						'join_type' => 'INNER',
					)
				)
			),
			'select' => array(
				new \Bitrix\Main\Entity\ExpressionField('UNSEEN', 'COUNT(%s)', 'ID'),
			),
			'filter' => array(
				'=MAILBOX_ID' => $mailbox['ID'],
				'=MESSAGE_UID.DIR_MD5' => $filter['=MESSAGE_UID.DIR_MD5'],
				'!@MESSAGE_UID.IS_SEEN' => array('Y', 'S'),
			),
		))->fetch();

		$this->arResult['UNSEEN'] = isset($unseen['UNSEEN']) ? $unseen['UNSEEN'] : 0;

		$accessSubquery = new Main\Entity\Query(Mail\Internals\MessageAccessTable::getEntity());
		$accessSubquery->addFilter('=MAILBOX_ID', new \Bitrix\Main\DB\SqlExpression('%s'));
		$accessSubquery->addFilter('=MESSAGE_ID', new \Bitrix\Main\DB\SqlExpression('%s'));

		$unbind = \Bitrix\Mail\MailMessageTable::getList(array(
			'runtime' => array(
				new Main\Entity\ReferenceField(
					'MESSAGE_UID',
					'Bitrix\Mail\MailMessageUidTable',
					array(
						'=this.MAILBOX_ID' => 'ref.MAILBOX_ID',
						'=this.ID' => 'ref.MESSAGE_ID',
					),
					array(
						'join_type' => 'INNER',
					)
				),
				new Main\Entity\ExpressionField(
					'IS_ACCESS',
					sprintf('EXISTS(%s)', $accessSubquery->getQuery()),
					array('MAILBOX_ID', 'ID')
				),
			),
			'select' => array(
				new \Bitrix\Main\Entity\ExpressionField('UNBIND', 'COUNT(%s)', 'ID'),
			),
			'filter' => array(
				'=MAILBOX_ID' => $mailbox['ID'],
				'=MESSAGE_UID.DIR_MD5' => $filter['=MESSAGE_UID.DIR_MD5'],
				'==IS_ACCESS' => false,
			),
		))->fetch();

		$this->arResult['UNBIND'] = isset($unbind['UNBIND']) ? $unbind['UNBIND'] : 0;

		if ($this->request->getPost('errorMessage'))
		{
			$this->arResult["MESSAGES"][] = [
				"TYPE"  => \Bitrix\Main\Grid\MessageType::ERROR,
				"TITLE" => Loc::getMessage('MAIL_CLIENT_AJAX_ERROR'),
				"TEXT"  => \Bitrix\Main\Text\Encoding::convertEncodingToCurrent($this->request->getPost('errorMessage')),
			];
		}
		$this->arResult['spamDir'] = MessageFolder::getFolderNameByType(MessageFolder::SPAM, $mailbox['OPTIONS']);
		$this->arResult['trashDir'] = MessageFolder::getFolderNameByType(MessageFolder::TRASH, $mailbox['OPTIONS']);
		$this->arResult['outcomeDir'] = MessageFolder::getFolderNameByType(MessageFolder::OUTCOME, $mailbox['OPTIONS']);
		$this->arResult['taskViewUrlIdForReplacement'] = '#TASK_ID#';
		$this->arResult['taskViewUrlTemplate'] = \CComponentEngine::makePathFromTemplate(
			$this->arParams['PATH_TO_USER_TASKS_TASK'],
			[
				'action' => 'view',
				'task_id' => $this->arResult['taskViewUrlIdForReplacement'],
			]
		);
		$this->arResult['MAX_ALLOWED_CONNECTED_MAILBOXES'] = Mail\Helper\LicenseManager::getUserMailboxesLimit();
		$this->includeComponentTemplate();
	}

	/**
	 * @param $items
	 * @param $mailbox
	 * @param \Bitrix\Main\UI\PageNavigation $navigation
	 * @return array
	 * @throws Main\ArgumentException
	 * @throws Main\ObjectPropertyException
	 * @throws Main\SystemException
	 */
	private function getRows($items, $mailbox, $navigation)
	{
		$rows = [];
		$avatarConfigs = $this->getAvatarConfigs($items);
		foreach ($items as $index => $item)
		{
			if (count($rows) >= $navigation->getLimit())
			{
				$this->arResult['ENABLE_NEXT_PAGE'] = true;
				break;
			}

			$item['ID'] = $item['RID'] . '-' . $mailbox['ID'];

			$columns = array();

			$columns['DATE'] = \CComponentUtil::getDateTimeFormatted(
				makeTimeStamp($item['FIELD_DATE']),
				(\Bitrix\Main\Loader::includeModule('intranet') ? \CIntranetUtils::getCurrentDatetimeFormat() : false),
				\CTimeZone::getOffset()
			);

			$columns['FROM'] = '<span class="mail-msg-from-title">' . htmlspecialcharsbx($item['FIELD_FROM']) . '</span>';
			$columns['SUBJECT'] = htmlspecialcharsbx($item['SUBJECT']);

			$from = new \Bitrix\Main\Mail\Address($item['FIELD_FROM']);
			if ($from->validate())
			{
				$columns['FROM'] = sprintf(
					'<span class="mail-msg-from-title" title="%s">%s</span>',
					htmlspecialcharsbx($from->getEmail()),
					htmlspecialcharsbx($from->getName() ? $from->getName() : $from->getEmail())
				);
			}
			$avatarParams = !empty($avatarConfigs[$from->getEmail()]) ? $avatarConfigs[$from->getEmail()] : [];

			$columns['FROM'] = $this->getSenderColumnCell($avatarParams) . $columns['FROM'];

			if ($item['ATTACHMENTS'] > 0)
			{
				$columns['SUBJECT'] = sprintf('(%u) %s', $item['ATTACHMENTS'], $columns['SUBJECT']);
			}
			$columns['SUBJECT'] = sprintf(
				'<a href="%s" class="mail-msg-list-subject" onclick="BX.PreventDefault(); ">%s</a>',
				htmlspecialcharsbx(\CComponentEngine::makePathFromTemplate(
					$this->arParams['PATH_TO_MAIL_MSG_VIEW'],
					array('id' => $item['MID'])
				)),
				$columns['SUBJECT']
			);
			$isSpam = MessageFolder::getFolderNameByHash($item['DIR_MD5'], $mailbox['OPTIONS']) == MessageFolder::getFolderNameByType(MessageFolder::SPAM, $mailbox['OPTIONS']);
			$isDisabled = ($item['MSG_UID'] == 0);
			$jsFromClassNames = $isSpam ? 'js-spam ' : '';
			$jsFromClassNames .= $isDisabled ? 'js-disabled ' : '';
			$columns['FROM'] = sprintf(
				'<span data-message-id="%u" class="' . $jsFromClassNames . ' mail-msg-list-cell-%u mail-msg-list-cell-nowrap %s">%s</span>',
				$item['MID'],
				$item['MID'],
				!in_array($item['IS_SEEN'], array('Y', 'S')) ? 'mail-msg-list-cell-unseen' : '',
				$columns['FROM']
			);
			$columns['SUBJECT'] = sprintf(
				'<span class="mail-msg-list-cell-%u %s">%s</span>',
				$item['ID'],
				!in_array($item['IS_SEEN'], array('Y', 'S')) ? 'mail-msg-list-cell-unseen' : '',
				$columns['SUBJECT']
			);
			$columns['BIND'] = '<span class="js-bind-' . $item['MID'] . '">';
			if ($item['BIND'])
			{
				$bindingsWithId = explode(',', $item['BIND']);
				$bindColumns = [];
				foreach ($bindingsWithId as $bindWithId)
				{
					list($bindEntityType, $bindEntityId) = explode('-', $bindWithId);
					switch ($bindEntityType)
					{
						case MessageAccessTable::ENTITY_TYPE_TASKS_TASK:
							$bindColumns[$bindEntityType] = '<a data-type="'.$bindEntityType.'" 
								href="' .
								\CComponentEngine::makePathFromTemplate(
									$this->arParams['PATH_TO_USER_TASKS_TASK'],
									[
										'action' => 'view',
										'task_id' => $bindEntityId,
									]
								). '">' .
								Loc::getMessage('MAIL_MESSAGE_LIST_COLUMN_BIND_' . $bindEntityType)
							. '</a>';
							break;
						case MessageAccessTable::ENTITY_TYPE_CRM_ACTIVITY:
							if ($this->arResult['userHasCrmActivityPermission'] )
							{
								$bindColumns[$bindEntityType] = '<span 
									data-role="crm-binding-link"
									data-entity-id="'. $bindEntityId .'"
									data-type="' . $bindEntityType . '" 
								><a href="' .
										CCrmOwnerType::GetEntityShowPath($item['CRM_ACTIVITY_OWNER_TYPE_ID'], $item['CRM_ACTIVITY_OWNER_ID'])
									. '">' . Loc::getMessage('MAIL_MESSAGE_LIST_COLUMN_BIND_' . $bindEntityType) . '</a></span>';
								break;
							}
						default:
							$bindColumns[$bindEntityType] = '<span 
									data-type="'.$bindEntityType.'" 
								>' . Loc::getMessage('MAIL_MESSAGE_LIST_COLUMN_BIND_' . $bindEntityType) .'</span>';
							break;
					}
				}
				$columns['BIND'] .= implode('<span data-role="comma-separator">,&nbsp;</span>', $bindColumns);
			}
			$columns['BIND'] .= '</span>';

			$rows[$item['ID']] = array(
				'id' => $item['ID'],
				'data' => $item,
				'columns' => $columns,
			);
			$taskHref = \CHTTP::urlAddParams(
				\CComponentEngine::makePathFromTemplate(
					$this->arParams['PATH_TO_USER_TASKS_TASK'],
					array(
						'action' => 'edit',
						'task_id' => '0',
					)
				),
				array(
					'TITLE' => rawurlencode(Loc::getMessage('MAIL_MESSAGE_TASK_TITLE', array('#SUBJECT#' => $item['SUBJECT']))),
					'UF_MAIL_MESSAGE' => (int) $item['MID'],
				)
			);

			$rows[$item['ID']]['actions'] = [
				[
					'id' => $this->arResult['gridActionsData']['view']['id'],
					'text' => $this->arResult['gridActionsData']['view']['text'],
					'icon' => $this->arResult['gridActionsData']['view']['icon'],
					'default' => true,
					'onclick' => "BX.Mail.Client.Message.List['" . CUtil::JSEscape($this->getComponentId()) . "'].onViewClick('{$item['MID']}');",
					'hideInActionPanel' => true,
				],
				[
					'id' => $this->arResult['gridActionsData']['notRead']['id'],
					'text' => '<span data-role="not-read-action">'
							. $this->arResult['gridActionsData']['notRead']['text'] . '</span>',
					'icon' => $this->arResult['gridActionsData']['notRead']['icon'],
					'disabled' => $isDisabled,
					'className' => "menu-popup-no-icon",
					'default' => true,
					'onclick' => "BX.Mail.Client.Message.List['" . CUtil::JSEscape($this->getComponentId()) . "'].onReadClick('{$item['ID']}');",
				],
				[
					'id' => $this->arResult['gridActionsData']['read']['id'],
					'text' => '<span data-role="read-action">'
							. $this->arResult['gridActionsData']['read']['text'] . '</span>',
					'icon' => $this->arResult['gridActionsData']['read']['icon'],
					'disabled' => $isDisabled,
					'className' => "menu-popup-no-icon",
					'default' => true,
					'onclick' => "BX.Mail.Client.Message.List['" . CUtil::JSEscape($this->getComponentId()) . "'].onReadClick('{$item['ID']}');",
				],
				[
					'id' => $this->arResult['gridActionsData']['delete']['id'],
					'icon' => $this->arResult['gridActionsData']['delete']['icon'],
					'text' => $this->arResult['gridActionsData']['delete']['text'],
					'disabled' => $isDisabled,
					'onclick' => "BX.Mail.Client.Message.List['" . CUtil::JSEscape($this->getComponentId()) . "'].onDeleteClick('{$item['ID']}');",
				],
				[
					'id' => $this->arResult['gridActionsData']['notSpam']['id'],
					'icon' => $this->arResult['gridActionsData']['notSpam']['icon'],
					'text' => '<span data-role="not-spam-action">'
							. $this->arResult['gridActionsData']['notSpam']['text'] . '</span>',
					'disabled' => $isDisabled,
					'onclick' => "BX.Mail.Client.Message.List['" . CUtil::JSEscape($this->getComponentId()) . "'].onSpamClick('{$item['ID']}');",
				],
				[
					'id' => $this->arResult['gridActionsData']['spam']['id'],
					'icon' => $this->arResult['gridActionsData']['spam']['icon'],
					'text' => '<span data-role="spam-action">'
							. $this->arResult['gridActionsData']['spam']['text'] . '</span>',
					'disabled' => $isDisabled,
					'onclick' => "BX.Mail.Client.Message.List['" . CUtil::JSEscape($this->getComponentId()) . "'].onSpamClick('{$item['ID']}');",
				],
				[
					'id' => $this->arResult['gridActionsData']['move']['id'],
					'icon' => $this->arResult['gridActionsData']['move']['icon'],
					'text' => $this->arResult['gridActionsData']['move']['text'],
					'items' => $this->prepareFoldersHierarchyForGrid($mailbox['OPTIONS'], $item),
				],
				[
					'id' => $this->arResult['gridActionsData']['task']['id'],
					'icon' => $this->arResult['gridActionsData']['task']['icon'],
					'text' => $this->arResult['gridActionsData']['task']['text'],
					'href' => $isDisabled ? '' : $taskHref,
					'disabled' => $isDisabled,
				],
			];
			if ($this->arResult['userHasCrmActivityPermission'])
			{
				$rows[$item['ID']]['actions'] = array_merge($rows[$item['ID']]['actions'], [
					[
						'id' => $this->arResult['gridActionsData']['addToCrm']['id'],
						'icon' => $this->arResult['gridActionsData']['addToCrm']['icon'],
						'text' => '<span data-role="crm-action">' . $this->arResult['gridActionsData']['addToCrm']['text'] . '</span>',
						'onclick' => "BX.Mail.Client.Message.List['" . CUtil::JSEscape($this->getComponentId()) . "'].onCrmClick('{$item['ID']}');",
					],
					[
						'id' => $this->arResult['gridActionsData']['excludeFromCrm']['id'],
						'icon' => $this->arResult['gridActionsData']['excludeFromCrm']['icon'],
						'text' => '<span data-role="not-crm-action">' . $this->arResult['gridActionsData']['excludeFromCrm']['text'] . '</span>',
						'onclick' => "BX.Mail.Client.Message.List['" . CUtil::JSEscape($this->getComponentId()) . "'].onCrmClick('{$item['ID']}');",
					],
				]);
			}
			$rows[$item['ID']]['actions'] = array_merge($rows[$item['ID']]['actions'], [
				[
					'id' => $this->arResult['gridActionsData']['liveFeed']['id'],
					'icon' => $this->arResult['gridActionsData']['liveFeed']['icon'],
					'text' => $this->arResult['gridActionsData']['liveFeed']['text'],
					'disabled' => true,
				],
				[
					'id' => $this->arResult['gridActionsData']['discuss']['id'],
					'icon' => $this->arResult['gridActionsData']['discuss']['icon'],
					'text' => $this->arResult['gridActionsData']['discuss']['text'],
					'disabled' => true,
				],
				[
					'id' => $this->arResult['gridActionsData']['event']['id'],
					'icon' => $this->arResult['gridActionsData']['event']['icon'],
					'text' => $this->arResult['gridActionsData']['event']['text'],
					'disabled' => true,
				],
			]);
		}
		return $rows;
	}

	/**
	 * @param $emails
	 * @return array
	 * @throws Main\ArgumentException
	 * @throws Main\ObjectPropertyException
	 * @throws Main\SystemException
	 */
	private function getAvatarConfigs($items)
	{
		$emails = [];
		$column = 'FIELD_FROM';
		foreach ($items as $key => $element)
		{
			if ((isset($element[$column]) || $element[$column]))
			{
				$emails[$element[$column]] = $element[$column];
			}
		}
		$emails = array_values($emails);
		$configs = (new Mail\MessageView\AvatarManager(Main\Engine\CurrentUser::get()->getId()))
			->getAvatarParamsFromEmails($emails);

		return $configs;
	}

	private function getGridActionsData()
	{
		return [
			'view' => [
				'id' => 'view',
				'icon' => '/bitrix/js/ui/actionpanel/images/ui_icon_actionpanel_open_mail.svg',
				'text' => Loc::getMessage('MAIL_MESSAGE_LIST_BTN_VIEW'),
			],
			'delete' => [
				'id' => 'delete',
				'icon' => '/bitrix/js/ui/actionpanel/images/ui_icon_actionpanel_remove.svg',
				'text' => Loc::getMessage('MAIL_MESSAGE_LIST_BTN_DELETE'),
			],
			'spam' => [
				'id' => 'spam',
				'icon' => '/bitrix/js/ui/actionpanel/images/ui_icon_actionpanel_lock.svg',
				'text' => Loc::getMessage('MAIL_MESSAGE_LIST_BTN_SPAM'),
			],
			'notSpam' => [
				'id' => 'notSpam',
				'icon' => '/bitrix/js/ui/actionpanel/images/ui_icon_actionpanel_not_spam.svg',
				'text' => Loc::getMessage('MAIL_MESSAGE_LIST_BTN_NOT_SPAM'),
			],
			'addToCrm' => [
				'id' => 'addToCrm',
				'icon' => '/bitrix/js/ui/actionpanel/images/ui_icon_actionpanel_save_to_crm.svg',
				'text' => Loc::getMessage('MAIL_MESSAGE_CREATE_CRM_BTN'),
			],
			'excludeFromCrm' => [
				'id' => 'excludeFromCrm',
				'icon' => '/bitrix/js/ui/actionpanel/images/ui_icon_actionpanel_exclude.svg',
				'text' => Loc::getMessage('MAIL_MESSAGE_CREATE_CRM_EXCLUDE_BTN'),
			],
			'task' => [
				'id' => 'task',
				'icon' => '/bitrix/js/ui/actionpanel/images/ui_icon_actionpanel_create.svg',
				'text' => Loc::getMessage('MAIL_MESSAGE_CREATE_TASK_BTN'),
			],
			'event' => [
				'id' => 'event',
				'icon' => '/bitrix/js/ui/actionpanel/images/ui_icon_actionpanel_event.svg',
				'text' => Loc::getMessage('MAIL_MESSAGE_CREATE_EVENT_BTN'),
			],
			'liveFeed' => [
				'id' => 'liveFeed',
				'icon' => '/bitrix/js/ui/actionpanel/images/ui_icon_actionpanel_discuss.svg',
				'text' => Loc::getMessage('MAIL_MESSAGE_CREATE_LF_BTN'),
			],
			'discuss' => [
				'id' => 'discuss',
				'icon' => '/bitrix/js/ui/actionpanel/images/ui_icon_actionpanel_discuss_in_chat.svg',
				'text' => Loc::getMessage('MAIL_MESSAGE_CREATE_IM_BTN'),
			],
			'read' => [
				'id' => 'read',
				'icon' => '/bitrix/js/ui/actionpanel/images/ui_icon_actionpanel_read.svg',
				'text' => Loc::getMessage('MAIL_MESSAGE_LIST_BTN_SEEN'),
			],
			'notRead' => [
				'id' => 'notRead',
				'icon' => '/bitrix/js/ui/actionpanel/images/ui_icon_actionpanel_not_read.svg',
				'text' => Loc::getMessage('MAIL_MESSAGE_LIST_BTN_UNSEEN'),
			],
			'move' => [
				'id' => 'move',
				'icon' => '/bitrix/js/ui/actionpanel/images/ui_icon_actionpanel_move_to_folder.svg',
				'text' => Loc::getMessage('MAIL_MESSAGE_LIST_BTN_MOVE'),
			],
		];
	}

	private function getSenderColumnCell($avatarParams)
	{
		global $APPLICATION;
		static $contactAvatars = [];

		$email = !empty($avatarParams['email']) ? $avatarParams['email'] : 'default';
		$name = !empty($avatarParams['name']) ? $avatarParams['name'] : 'default';
		$key = md5($email.$name);

		if (!array_key_exists($key, $contactAvatars))
		{
			ob_start();
			$APPLICATION->IncludeComponent('bitrix:mail.contact.avatar', '', $avatarParams);
			$contactAvatars[$key] = ob_get_clean();
		}
		return $contactAvatars[$key];

	}

	private function setFilterSettings($mailbox)
	{
		$dirs = array_map(
			function ($dirName) use ($mailbox)
			{
				return Bitrix\Mail\Helper\MessageFolder::getFormattedName($dirName, $mailbox['OPTIONS']);
			},
			array_filter(
				(array) $mailbox['OPTIONS']['imap']['dirs'],
				function ($item) use ($mailbox)
				{
					return !MessageFolder::isDisabledFolder($item, $mailbox['OPTIONS']);
				},
				ARRAY_FILTER_USE_KEY
			)
		);
		// set default folder by adding '' => "defaultFolderName" to filter DIR list
		$defaultFolder = $this->getDefaultFolderName($mailbox);
		foreach ($dirs as $folderName => $folderFormattedName)
		{
			if ($folderName === $defaultFolder)
			{
				unset($dirs[$folderName]);
				$dirs = array_merge(['' => $folderFormattedName], $dirs);
				break;
			}
		}
		$this->arResult['FILTER'] = array(
			array(
				'id'      => 'DIR',
				'name'    => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_DIR'),
				'type'    => 'list',
				'params'  => array('multiple' => 'N'),
				'items'   => $dirs,
				'default' => true,
				'strict'  => true,
			),
			array(
				'id'      => 'DATE',
				'name'    => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_DATE'),
				'type'    => 'date',
				'default' => true,
				'exclude' => array(
					\Bitrix\Main\UI\Filter\DateType::TOMORROW,
					\Bitrix\Main\UI\Filter\DateType::NEXT_DAYS,
					\Bitrix\Main\UI\Filter\DateType::NEXT_WEEK,
					\Bitrix\Main\UI\Filter\DateType::NEXT_MONTH,
				),
			),
			array(
				'id'      => 'IS_SEEN',
				'name'    => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_IS_SEEN'),
				'type'    => 'list',
				'params'  => array('multiple' => 'N'),
				'items'   => array(
					'' => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_OPTION_ANY'),
					'Y' => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_OPTION_Y'),
					'N' => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_OPTION_N'),
				),
				'default' => true,
			),
			array(
				'id'      => 'BIND',
				'name'    => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_BIND'),
				'type'    => 'list',
				'default' => true,
				'params'  => array('multiple' => 'N'),
				'items'   => array(
					'' => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_OPTION_ANY'),
					MessageAccessTable::ENTITY_TYPE_TASKS_TASK => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_PRESET_BIND_TASK'),
					MessageAccessTable::ENTITY_TYPE_CRM_ACTIVITY => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_PRESET_BIND_CRM'),
					MessageAccessTable::ENTITY_TYPE_NO_BIND => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_OPTION_N'),
				),
			),
		);
	}

	private function setFilterPresets($mailbox)
	{
		$presetBindings = [
			'bindTask' => [
				'name' => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_PRESET_BIND_TASK'),
				'fields' => [
					'BIND' => MessageAccessTable::ENTITY_TYPE_TASKS_TASK,
				],
			],
			'bindCrm' => [
				'name' => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_PRESET_BIND_CRM'),
				'fields' => [
					'BIND' => MessageAccessTable::ENTITY_TYPE_CRM_ACTIVITY,
				],
			],
		];
		$presetFolders = [
			MessageFolder::INCOME => [
				'name' => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_PRESET_INCOME'),
				'fields' => [
					'DIR' => MessageFolder::getFolderNameByType(MessageFolder::INCOME, $mailbox['OPTIONS']),
				],
			],
			MessageFolder::OUTCOME => [
				'name' => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_PRESET_OUTCOME'),
				'fields' => [
					'DIR' => MessageFolder::getFolderNameByType(MessageFolder::OUTCOME, $mailbox['OPTIONS']),
				],
			],
			MessageFolder::SPAM => [
				'name' => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_PRESET_SPAM'),
				'fields' => [
					'DIR' => MessageFolder::getFolderNameByType(MessageFolder::SPAM, $mailbox['OPTIONS']),
				],
			],
			MessageFolder::TRASH => [
				'name' => Loc::getMessage('MAIL_MESSAGE_LIST_FILTER_PRESET_TRASH'),
				'fields' => [
					'DIR' => MessageFolder::getFolderNameByType(MessageFolder::TRASH, $mailbox['OPTIONS']),
				],
			],
		];
		$defaultPresetKeys = array_keys(array_merge($presetFolders, $presetBindings));
		$defaultPresetKeys[] = '';
		$this->arResult['FILTER_PRESETS'] = [];
		$defaultPreset = [];
		$defaultFolderName = $this->getDefaultFolderName($mailbox);
		foreach ($presetFolders as $presetKey => $preset)
		{
			$dir = $preset['fields']['DIR'];

			if ('' == $dir || !array_key_exists($dir, (array) $mailbox['OPTIONS']['imap']['dirs']))
			{
				continue;
			}

			if (!MessageFolder::isDisabledFolder($dir, $mailbox['OPTIONS']))
			{
				if ($dir === $defaultFolderName)
				{
					$preset['fields']['DIR'] = '';
					$preset['default'] = true;
					$defaultPreset[$presetKey] = $preset;
					continue;
				}
				if (empty($defaultPreset))
				{
					$preset['default'] = true;
					$defaultPreset[$presetKey] = $preset;
					continue;
				}
				$this->arResult['FILTER_PRESETS'][$presetKey] = $preset;
			}
		}
		if (!empty($defaultPreset))
		{
			$this->arResult['FILTER_PRESETS'] = array_merge(
				[array_pop(array_keys($defaultPreset)) => array_pop(array_values($defaultPreset))],
				$this->arResult['FILTER_PRESETS']
			);
		}
		$this->arResult['FILTER_PRESETS'] = $this->arResult['FILTER_PRESETS'] + $presetBindings;
		$currentAllowedPresetKeys = array_keys($this->arResult['FILTER_PRESETS']);
		$filterOptions = new \Bitrix\Main\UI\Filter\Options($this->arResult['FILTER_ID'], $this->arResult['FILTER_PRESETS']);
		$userPresets = $filterOptions->getPresets();
		foreach ($userPresets as $presetUserKey => $userPreset)
		{
			if (in_array($presetUserKey, $defaultPresetKeys, true))
			{
				$userPresets[$presetUserKey]['fields']['DIR'] = $this->arResult['FILTER_PRESETS'][$presetUserKey]['fields']['DIR'];
				$userPresets[$presetUserKey]['name'] = $this->arResult['FILTER_PRESETS'][$presetUserKey]['name'];
				if (!in_array($presetUserKey, $currentAllowedPresetKeys, true))
				{
					unset($userPresets[$presetUserKey]);
				}
			}
			else if ('' != $userPreset['fields']['DIR'])
			{
				if (!array_key_exists($userPreset['fields']['DIR'], (array) $mailbox['OPTIONS']['imap']['dirs']))
				{
					unset($userPresets[$presetUserKey]);
				}
				else if (MessageFolder::isDisabledFolder($userPreset['fields']['DIR'], $mailbox['OPTIONS']))
				{
					unset($userPresets[$presetUserKey]);
				}
			}
		}
		$curPresets = $filterOptions->getPresets();
		if ($this->arrayDiffRecursive($curPresets, $userPresets))
		{
			$filterOptions->setPresets($userPresets);
			$filterOptions->save();
		}
	}

	private function getDefaultFolderName($mailbox)
	{
		$inboxFolder = MessageFolder::getFolderNameByType(MessageFolder::INCOME, $mailbox['OPTIONS']);
		$sendFolder = MessageFolder::getFolderNameByType(MessageFolder::OUTCOME, $mailbox['OPTIONS']);
		foreach ([$inboxFolder, $sendFolder] as $index => $folder)
		{
			if (!MessageFolder::isDisabledFolder($folder, $mailbox['OPTIONS']))
			{
				return $folder;
			}
		}
		foreach ($mailbox['OPTIONS']['imap']['dirs'] as $folder => $pathParts)
		{
			if (!MessageFolder::isDisabledFolder($folder, $mailbox['OPTIONS']))
			{
				return $folder;
			}
		}
		return '';
	}

	private function getFilterForMessagesQuery($mailbox)
	{
		$filterOption = new \Bitrix\Main\UI\Filter\Options($this->arResult['FILTER_ID'], $this->arResult['FILTER_PRESETS']);
		$filterData = $filterOption->getFilter($this->arResult['FILTER']);
		$filter = array(
			'=MAILBOX_ID' => $mailbox['ID'],
		);

		if (!empty($filterData['FILTER_APPLIED']))
		{
			if (isset($filterData['BIND']))
			{
				if ($filterData['BIND'] === MessageAccessTable::ENTITY_TYPE_NO_BIND)
				{
					$filter['BIND'] = false;
				}
				else
				{
					// todo do a speed test for big data
					// $filter['=%BIND'] = $filterData['BIND'];
					$filter['=MESSAGE_ACCESS.ENTITY_TYPE'] = $filterData['BIND'];
				}
			}

			if (isset($filterData['IS_SEEN']))
			{
				if ($filterData['IS_SEEN'] == 'Y')
				{
					$filter['@IS_SEEN'] = array('Y', 'S');
				}
				else if ($filterData['IS_SEEN'] == 'N')
				{
					$filter['!@IS_SEEN'] = array('Y', 'S');
				}
			}

			if (isset($filterData['DIR']) && is_scalar($filterData['DIR']))
			{
				if ($filterData['DIR'] != '')
				{
					$filter['=MESSAGE_UID.DIR_MD5'] = md5($filterData['DIR']);
				}
			}

			try
			{
				if (!empty($filterData['DATE_from']))
				{
					$filter['>=FIELD_DATE'] = new \Bitrix\Main\Type\DateTime($filterData['DATE_from'], $format);
				}

				if (!empty($filterData['DATE_to']))
				{
					$filter['<=FIELD_DATE'] = new \Bitrix\Main\Type\DateTime($filterData['DATE_to'], $format);
				}
			}
			catch (\Exception $e)
			{
			}

			if (!empty($filterData['FIND']))
			{
				$filterKey = sprintf(
					'%sSEARCH_CONTENT',
					\Bitrix\Mail\MailMessageTable::getEntity()->fullTextIndexEnabled('SEARCH_CONTENT') ? '*' : '*%'
				);
				$filter[$filterKey] = \Bitrix\Mail\Helper\Message::prepareSearchString($filterData['FIND']);
			}
		}

		if (empty($filter['=MESSAGE_UID.DIR_MD5']))
		{
			$filter['=MESSAGE_UID.DIR_MD5'] = md5($this->getDefaultFolderName($mailbox));
		}

		return $filter;
	}

	private function prepareFoldersHierarchyForGrid($mailboxOptions, $item)
	{
		if (is_null($this->arResult['foldersItems']))
		{
			$dirs = $mailboxOptions['imap']['dirs'] ?: [];
			$disabled = $mailboxOptions['imap']['disabled'] ?: [];

			$this->arResult['foldersItems'] = $folderByPath = [];

			foreach ($dirs as $id => $path)
			{
				if (count($path) > 1)
				{
					$parentPath = join('/', array_slice($path, 0, -1));
				}

				$folderPath = join('/', $path);

				$isDisabled = in_array($id, $disabled, true);
				$folderByPath[$folderPath] = [
					'id' => $id,
					'text' => MessageFolder::getFormattedName($path, $mailboxOptions, false),
					'dataset' => ['id' => $item['ID'], 'folderPath' => $id, 'isDisabled' => $isDisabled,],
					'onclick' => "BX.Mail.Client.Message.List['" . CUtil::JSEscape($this->getComponentId()) . "'].onMoveToFolderClick(event)",
				];

				if (1 == count($path) || !array_key_exists($parentPath, $folderByPath))
				{
					$this->arResult['foldersItems'][] = &$folderByPath[$folderPath];
				}
				else
				{
					$folderByPath[$parentPath]['items'][] = &$folderByPath[$folderPath];
				}

				unset($dirs[$id]);
			}
		}

		return $this->arResult['foldersItems'];
	}

	private function arrayDiffRecursive($arr1, $arr2)
	{
		$modified = array();
		foreach ($arr1 as $key => $value)
		{
			if (array_key_exists($key, $arr2))
			{
				if (is_array($value) && is_array($arr2[$key]))
				{
					$arDiff = $this->arrayDiffRecursive($value, $arr2[$key]);
					if (!empty($arDiff))
					{
						$modified[$key] = $arDiff;
					}
				}
				elseif ($value != $arr2[$key])
				{
					$modified[$key] = $value;
				}
			}
			else
			{
				$modified[$key] = $value;
			}
		}
		return $modified;
	}

	private function rememberCurrentMailboxId($mailboxId)
	{
		$previousSeenMailboxId = CUserOptions::GetOption('mail', 'previous_seen_mailbox_id', null);

		if ((int)$previousSeenMailboxId !== (int)$mailboxId)
		{
			CUserOptions::SetOption('mail', 'previous_seen_mailbox_id', $mailboxId);
		}
	}
}
