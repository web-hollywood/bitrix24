<?php

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

use Bitrix\Mail\Helper\MessageFolder;
use Bitrix\Main;
use Bitrix\Main\Localization\Loc;
use Bitrix\Mail;
use Bitrix\Mail\Helper\Mailbox\Imap;
use Bitrix\Mail\Internals\MailContactTable;

Loc::loadMessages(__DIR__ . '/../mail.client/class.php');

Main\Loader::includeModule('mail');

class CMailClientMessageViewComponent extends CBitrixComponent implements \Bitrix\Main\Engine\Contract\Controllerable, Main\Errorable
{
	/** @var Main\ErrorCollection */
	private $errorCollection;

	/** @var bool */
	private $isCrmEnable = false;

	/**
	 * @return array
	 */
	public function configureActions()
	{
		$this->errorCollection = new Main\ErrorCollection();

		return array();
	}

	/**
	 * @return mixed|void
	 * @throws Main\ArgumentException
	 * @throws Main\ObjectPropertyException
	 * @throws Main\SystemException
	 */
	public function executeComponent()
	{
		global $USER, $APPLICATION;

		$APPLICATION->setTitle(Loc::getMessage('MAIL_CLIENT_HOME_TITLE'));

		if (!is_object($USER) || !$USER->isAuthorized())
		{
			$APPLICATION->authForm('');
			return;
		}

		$this->isCrmEnable = Main\Loader::includeModule('crm') && \CCrmPerms::isAccessEnabled();
		$this->arResult['CRM_ENABLE'] = ($this->isCrmEnable ? 'Y' : 'N');

		$pageSize = (int) $this->arParams['PAGE_SIZE'];
		if ($pageSize < 1 || $pageSize > 100)
		{
			$this->arParams['PAGE_SIZE'] = ($pageSize = 5);
		}

		$message = Mail\MailMessageTable::getList(array(
			'runtime' => array(
				new Main\Entity\ReferenceField(
					'MESSAGE_UID',
					'Bitrix\Mail\MailMessageUidTable',
					array(
						'=this.MAILBOX_ID' => 'ref.MAILBOX_ID',
						'=this.ID'         => 'ref.MESSAGE_ID',
					),
					array(
						'join_type' => 'INNER',
					)
				),
				new Main\Entity\ReferenceField(
					'MESSAGE_ACCESS',
					Mail\Internals\MessageAccessTable::class,
					array(
						'=this.MAILBOX_ID' => 'ref.MAILBOX_ID',
						'=this.ID' => 'ref.MESSAGE_ID',
					)
				),
			),
			'select' => array(
				'*',
				'UID' => 'MESSAGE_UID.ID',
				'DIR_MD5' => 'MESSAGE_UID.DIR_MD5',
				'MSG_UID' => 'MESSAGE_UID.MSG_UID',
				'MAILBOX_EMAIL' => 'MAILBOX.EMAIL',
				'MAILBOX_NAME' => 'MAILBOX.NAME',
				'MAILBOX_OPTIONS' => 'MAILBOX.OPTIONS',
				'MAILBOX_LOGIN' => 'MAILBOX.LOGIN',
				'IS_SEEN' => 'MESSAGE_UID.IS_SEEN',
				new \Bitrix\Main\Entity\ExpressionField(
					'BIND',
					'GROUP_CONCAT(DISTINCT %s)',
					'MESSAGE_ACCESS.ENTITY_TYPE'
				),
			),
			'filter' => array(
				'=ID' => $this->arParams['VARIABLES']['id'],
			),
			'group' => array('ID'),
		))->fetch();

		if (empty($message))
		{
			showError(Loc::getMessage('MAIL_CLIENT_ELEMENT_NOT_FOUND'));
			return;
		}

		if (!Mail\Helper\Message::hasAccess($message))
		{
			showError(Loc::getMessage('MAIL_CLIENT_ELEMENT_DENIED'));
			return;
		}

		$message['BIND'] = explode(',', $message['BIND']);

		$message['__files'] = Mail\Internals\MailMessageAttachmentTable::getList(array(
			'select' => array(
				'ID', 'FILE_ID', 'FILE_NAME', 'FILE_SIZE', 'CONTENT_TYPE',
			),
			'filter' => array(
				'=MESSAGE_ID' => $message['ID'],
			),
		))->fetchAll();

		$this->prepareMessage($message);
		$message['SENDER_EMAIL'] = $this->getEmailFromFieldFrom($message['FIELD_FROM']);
		$this->arResult['MESSAGE'] = $message;

		$this->arResult['LAST_RCPT'] = $this->loadLastRcpt();
		$this->arResult['EMAILS'] = $this->loadMailContacts();
		$this->arResult['CRM_EMAILS'] = $this->loadCrmMailContacts();

		$this->arResult['LOG'] = array(
			'A' => array(),
			'B' => array(),
		);

		if ($message['RIGHT_MARGIN'] - $message['LEFT_MARGIN'] > 1)
		{
			$res = \Bitrix\Mail\MailMessageTable::getList(array(
				'select' => array(
					'*', // @TODO
				),
				'filter' => array(
					'=MAILBOX_ID' => $message['MAILBOX_ID'],
					'>LEFT_MARGIN' => $message['LEFT_MARGIN'],
					'<RIGHT_MARGIN' => $message['RIGHT_MARGIN'],
				),
				'order' => array(
					'LEFT_MARGIN' => 'ASC',
				),
				'limit' => $pageSize,
			));

			while ($item = $res->fetch())
			{
				$item['MAILBOX_EMAIL'] = $message['MAILBOX_EMAIL'];
				$item['MAILBOX_NAME'] = $message['MAILBOX_NAME'];
				$item['MAILBOX_LOGIN'] = $message['MAILBOX_LOGIN'];

				$item = $this->prepareMessage($item);
				$item['SENDER_EMAIL'] = $this->getEmailFromFieldFrom($item['FIELD_FROM']);

				$item['__log'] = 'A';

				$this->arResult['LOG']['A'][] = $item;
			}

			$this->arResult['LOG']['A'] = array_reverse($this->arResult['LOG']['A']);
		}

		if ($message['__access_level'] == 'full')
		{
			$res = \Bitrix\Mail\MailMessageTable::getList(array(
				'select' => array(
					'*', // @TODO
				),
				'filter' => array(
					'=MAILBOX_ID' => $message['MAILBOX_ID'],
					'<LEFT_MARGIN' => $message['LEFT_MARGIN'],
					'>RIGHT_MARGIN' => $message['RIGHT_MARGIN'],
				),
				'order' => array(
					'LEFT_MARGIN' => 'DESC',
				),
				'limit' => $pageSize,
			));

			while ($item = $res->fetch())
			{
				$item['MAILBOX_EMAIL'] = $message['MAILBOX_EMAIL'];
				$item['MAILBOX_NAME'] = $message['MAILBOX_NAME'];
				$item['MAILBOX_LOGIN'] = $message['MAILBOX_LOGIN'];

				$item = $this->prepareMessage($item);
				$item['SENDER_EMAIL'] = $this->getEmailFromFieldFrom($item['FIELD_FROM']);

				$item['__log'] = 'B';

				$this->arResult['LOG']['B'][] = $item;
			}
		}

		if ($message['MSG_UID'] && !in_array($message['IS_SEEN'], array('Y', 'S')))
		{
			$mailMarkerManager = new \Bitrix\Mail\ImapCommands\MailsFlagsManager($message['MAILBOX_ID'], $message['UID']);
			$mailMarkerManager->setMessages([$message]);
			$mailMarkerManager->markMailsSeen();
		}

		$this->prepareUser();
		$this->arResult['avatarParams'] = $this->getAvatarParams(array_merge(
			$this->arResult['LOG']['B'],
			$this->arResult['LOG']['A'],
			[$this->arResult['MESSAGE']]
		));
		$APPLICATION->setTitle($message['SUBJECT']);
		$this->arResult['MESSAGE_UID_KEY'] = $message['UID'] . '-' . $message['MAILBOX_ID'];

		$this->includeComponentTemplate();
	}

	/**
	 * @param $id
	 * @param $log
	 * @param $size
	 *
	 * @return array|void
	 *
	 * @throws Main\ArgumentException
	 * @throws Main\ObjectPropertyException
	 * @throws Main\SystemException
	 */
	public function logAction($id, $log, $size)
	{
		if (!$id)
		{
			$this->errorCollection[] = new Main\Error(Loc::getMessage('MAIL_CLIENT_AJAX_ERROR'));
			return;
		}

		if (!empty($log) && preg_match('/([ab])(\d+)/i', $log, $matches))
		{
			$type = strtoupper($matches[1]);
			$offset = (int) $matches[2];
		}
		else
		{
			$this->errorCollection[] = new Main\Error(Loc::getMessage('MAIL_CLIENT_AJAX_ERROR'));
			return;
		}

		$message = Mail\MailMessageTable::getList(array(
			'select' => array(
				'*',
				'MAILBOX_EMAIL' => 'MAILBOX.EMAIL',
				'MAILBOX_NAME' => 'MAILBOX.NAME',
				'MAILBOX_LOGIN' => 'MAILBOX.LOGIN',
			),
			'filter' => array(
				'=ID' => $id,
			),
		))->fetch();

		if (empty($message))
		{
			$this->errorCollection[] = new Main\Error(Loc::getMessage('MAIL_CLIENT_AJAX_ERROR'));
			return;
		}

		if (!Mail\Helper\Message::hasAccess($message))
		{
			$this->errorCollection[] = new Main\Error(Loc::getMessage('MAIL_CLIENT_ELEMENT_DENIED'));
			return;
		}

		if ('A' == $type)
		{
			$filter = array(
				'>LEFT_MARGIN' => $message['LEFT_MARGIN'],
				'<RIGHT_MARGIN' => $message['RIGHT_MARGIN'],
			);
			$order = array(
				'LEFT_MARGIN' => 'ASC',
			);
		}
		else
		{
			if ($message['__access_level'] != 'full')
			{
				$this->errorCollection[] = new Main\Error(Loc::getMessage('MAIL_CLIENT_ELEMENT_DENIED'));
				return;
			}

			$filter = array(
				'<LEFT_MARGIN' => $message['LEFT_MARGIN'],
				'>RIGHT_MARGIN' => $message['RIGHT_MARGIN'],
			);
			$order = array(
				'LEFT_MARGIN' => 'DESC',
			);
		}

		$res = \Bitrix\Mail\MailMessageTable::getList(array(
			'select' => array(
				'*', // @TODO
			),
			'filter' => array(
				'=MAILBOX_ID' => $message['MAILBOX_ID'],
				$filter
			),
			'order' => $order,
			'offset' => $offset,
			'limit' => $size > 0 ? $size : 5,
		));

		$log = array();
		while ($item = $res->fetch())
		{
			$item['MAILBOX_EMAIL'] = $message['MAILBOX_EMAIL'];
			$item['MAILBOX_NAME'] = $message['MAILBOX_NAME'];
			$item['MAILBOX_LOGIN'] = $message['MAILBOX_LOGIN'];

			$item = $this->prepareMessage($item);
			$item['SENDER_EMAIL'] = $this->getEmailFromFieldFrom($item['FIELD_FROM']);

			$item['__log'] = $type;

			$log[] = $item;
		}

		if (!empty($log))
		{
			if ('A' == $type)
			{
				$log = array_reverse($log);
			}

			$this->arResult['LOG'] = $log;
			$this->arResult['avatarParams'] = $this->getAvatarParams($log);
			ob_start();

			$this->includeComponentTemplate('log');

			return array(
				'html' => ob_get_clean(),
				'count' => count($log),
			);
		}

		return array(
			'html' => '',
			'count' => 0,
		);
	}

	/**
	 * @param $messages
	 *
	 * @return array
	 */
	private function getAvatarParams($messages)
	{
		$params = (new Mail\MessageView\AvatarManager(Main\Engine\CurrentUser::get()->getId()))
			->getAvatarParamsFromMessagesHeaders($messages);
		foreach ($params as $email => $data)
		{
			$params[$email]['avatarSize'] = 23;
		}
		return $params;
	}

	/**
	 * @param $id
	 *
	 * @return string|void
	 * @throws Main\ArgumentException
	 * @throws Main\ObjectPropertyException
	 * @throws Main\SystemException
	 */
	public function logitemAction($id)
	{
		$this->isCrmEnable = Main\Loader::includeModule('crm');
		$this->arResult['CRM_ENABLE'] = ($this->isCrmEnable ? 'Y' : 'N');

		$message = Mail\MailMessageTable::getList(array(
			'runtime' => array(
				new Main\Entity\ReferenceField(
					'MESSAGE_ACCESS',
					Mail\Internals\MessageAccessTable::class,
					array(
						'=this.MAILBOX_ID' => 'ref.MAILBOX_ID',
						'=this.ID' => 'ref.MESSAGE_ID',
					)
				),
			),
			'select' => array(
				'*',
				'MAILBOX_EMAIL' => 'MAILBOX.EMAIL',
				'MAILBOX_NAME' => 'MAILBOX.NAME',
				'MAILBOX_LOGIN' => 'MAILBOX.LOGIN',
				new \Bitrix\Main\Entity\ExpressionField(
					'BIND',
					'GROUP_CONCAT(DISTINCT %s)',
					'MESSAGE_ACCESS.ENTITY_TYPE'
				),
			),
			'filter' => array(
				'=ID' => $id,
			),
		))->fetch();

		if (empty($message))
		{
			$this->errorCollection[] = new Main\Error(Loc::getMessage('MAIL_CLIENT_ELEMENT_NOT_FOUND'));
			return;
		}

		if (!Mail\Helper\Message::hasAccess($message))
		{
			$this->errorCollection[] = new Main\Error(Loc::getMessage('MAIL_CLIENT_ELEMENT_DENIED'));
			return;
		}

		$message['BIND'] = explode(',', $message['BIND']);

		$message['__files'] = Mail\Internals\MailMessageAttachmentTable::getList(array(
			'select' => array(
				'ID', 'FILE_ID', 'FILE_NAME', 'FILE_SIZE', 'CONTENT_TYPE',
			),
			'filter' => array(
				'=MESSAGE_ID' => $message['ID'],
			),
		))->fetchAll();

		$this->prepareMessage($message);
		$message['SENDER_EMAIL'] = $this->getEmailFromFieldFrom($message['FIELD_FROM']);
		$this->arResult['MESSAGE'] = $message;
		$this->prepareUser();

		$this->arResult['LAST_RCPT'] = $this->loadLastRcpt();
		$this->arResult['EMAILS'] = $this->loadMailContacts();
		$this->arResult['CRM_EMAILS'] = $this->loadCrmMailContacts();

		$this->arParams['LOADED_FROM_LOG'] = true;
		$this->arResult['avatarParams'] = $this->getAvatarParams([$this->arResult['MESSAGE']]);
		ob_start();

		$this->includeComponentTemplate('logitem');

		return ob_get_clean();
	}

	/**
	 * @return void
	 * @throws Main\ArgumentException
	 * @throws Main\ObjectPropertyException
	 * @throws Main\SystemException
	 */
	protected function prepareUser()
	{
		global $USER, $APPLICATION;

		$userFields = \Bitrix\Main\UserTable::getList(array(
			'select' => array('ID', 'NAME', 'LAST_NAME', 'SECOND_NAME', 'LOGIN', 'PERSONAL_PHOTO'),
			'filter' => array('=ID' => $USER->getId()),
		))->fetch();

		$userImage = \CFile::resizeImageGet(
			$userFields['PERSONAL_PHOTO'], array('width' => 38, 'height' => 38),
			BX_RESIZE_IMAGE_EXACT, false
		);

		$this->arResult['USER_IMAGE'] = !empty($userImage['src']) ? $userImage['src'] : '';
	}

	/**
	 * @param $message
	 *
	 * @return mixed
	 */
	protected function prepareMessage(&$message)
	{
		$message['isSpam'] = MessageFolder::getFolderHashByType(MessageFolder::SPAM, $message['MAILBOX_OPTIONS']) === $message['DIR_MD5'];
		$message['isTrash'] = MessageFolder::getFolderHashByType(MessageFolder::TRASH, $message['MAILBOX_OPTIONS']) === $message['DIR_MD5'];

		if($message['OPTIONS']['trackable'] === true && !$message['READ_CONFIRMED'])
		{
			if(Main\Loader::includeModule('pull'))
			{
				\CPullWatch::Add(Main\Engine\CurrentUser::get()->getId(), Mail\Helper\MessageEventManager::getPullTagName($message['ID']), true);
			}
		}

		return \Bitrix\Mail\Helper\Message::prepare($message);
	}

	/**
	 * @param $messageField
	 *
	 * @return string
	 */
	private function getEmailFromFieldFrom($messageField)
	{
		$address = new Main\Mail\Address($messageField);
		return trim($address->getEmail());
	}


	/**
	 * Load last used Rcpt
	 *
	 * @return array
	 *
	 * @throws Main\ArgumentException
	 * @throws Main\ObjectPropertyException
	 * @throws Main\SystemException
	 */
	private function loadLastRcpt()
	{
		global $APPLICATION;

		$currentUser = \Bitrix\Main\Engine\CurrentUser::get();

		$result = array();

		$lastRcptResult = \Bitrix\Main\FinderDestTable::getList(array(
			'filter' => array(
				'=USER_ID' => $currentUser->getId(),
				'=CONTEXT' => 'MAIL_LAST_RCPT',
			),
			'select' => array('CODE'),
			'order' => array('LAST_USE_DATE' => 'DESC'),
			'limit' => 10,
		));

		$emailUsersIds = array();
		while ($item = $lastRcptResult->fetch())
		{
			$emailUsersIds[] = (int) str_replace('MC', '', $item['CODE']);
		}
		if (count($emailUsersIds) > 0)
		{
			$mailContacts = \Bitrix\Mail\Internals\MailContactTable::getList([
				'filter' => array(
					'@ID' => $emailUsersIds,
					'=USER_ID' => $currentUser->getId(),
				),
				'select' => ['ID', 'NAME', 'EMAIL', 'ICON'],
				'limit' => 10,
			])->fetchAll();

			$contactAvatars = $resultsMailContacts = [];
			foreach ($mailContacts as $mailContact)
			{
				$resultsMailContacts[$mailContact['EMAIL']] = $mailContact;
			}
			foreach ($resultsMailContacts as $mailContact)
			{
				$email = $mailContact['EMAIL'];
				if ($contactAvatars[$email] === null)
				{
					ob_start();
					$APPLICATION->IncludeComponent('bitrix:mail.contact.avatar', '', array(
						'mailContact' => $mailContact,
					));
					$contactAvatars[$email] = ob_get_clean();
				}
				$id = $this->buildUniqueEmailCode($email);
				$result[$id] = [
					'id' => $id,
					'entityType' => 'email',
					'entityId' => $mailContact['ID'],
					'name' => htmlspecialcharsbx($mailContact['NAME']),
					'iconCustom' => $contactAvatars[$email],
					'email' => htmlspecialcharsbx($mailContact['EMAIL']),
					'desc' => htmlspecialcharsbx($mailContact['EMAIL']),
					'isEmail' => 'Y',
				];
			}
		}

		return $result;
	}


	/**
	 * Load mail contacts from the address book.
	 *
	 * @return array
	 *
	 * @throws Main\SystemException
	 */
	private function loadMailContacts()
	{
		global $APPLICATION;

		$result = array();
		return $result;

		$currentUser = \Bitrix\Main\Engine\CurrentUser::get();

		$mailContacts = \Bitrix\Mail\Internals\MailContactTable::getList([
			'order' => [
				'NAME' => 'ASC',
				'EMAIL' => 'ASC',
			],
			'filter' => [
				'=USER_ID', $currentUser->getId()
			],
			'select' => ['ID', 'NAME', 'EMAIL', 'ICON'],
			'limit' => 20,
		])->fetchAll();

		$contactAvatars = $resultsMailContacts = [];
		foreach ($mailContacts as $mailContact)
		{
			$resultsMailContacts[$mailContact['EMAIL']] = $mailContact;
		}
		foreach ($resultsMailContacts as $mailContact)
		{
			$email = $mailContact['EMAIL'];
			if ($contactAvatars[$email] === null)
			{
				ob_start();
				$APPLICATION->IncludeComponent('bitrix:mail.contact.avatar', '',
					[
						'mailContact' => $mailContact,
					]);
				$contactAvatars[$email] = ob_get_clean();
			}
			$id = $this->buildUniqueEmailCode($email);
			$result[$id] = [
				'id' => $id,
				'entityType' => 'mailContacts',
				'entityId' => $mailContact['ID'],
				'name' => htmlspecialcharsbx($mailContact['NAME']),
				'iconCustom' => $contactAvatars[$email],
				'email' => htmlspecialcharsbx($mailContact['EMAIL']),
				'desc' => htmlspecialcharsbx($mailContact['EMAIL']),
				'isEmail' => 'Y',
			];
		}

		return $result;
	}

	/**
	 * Load mail contacts from CRM.
	 *
	 * @return array
	 *
	 * @throws Main\SystemException
	 */
	private function loadCrmMailContacts()
	{
		$result = array();
		return $result;

		if ($this->isCrmEnable)
		{
			$crmCommunications = \CSocNetLogDestination::SearchCrmEntities(array(
				'SEARCH' => '%',
				'ONLY_WITH_EMAIL' => true,
			));
			foreach ($crmCommunications as $communication)
			{
				$email = $communication['email'];
				if (empty($email))
				{
					continue;
				}
				$id = $this->buildUniqueEmailCode($email);
				$communication['id'] = $id;
				$result[$id] = $communication;
			}
		}

		return $result;
	}

	/**
	 * @param $email
	 *
	 * @return string
	 */
	private function buildUniqueEmailCode($email)
	{
		return 'U' . md5($email);
	}
	/**
	 * Getting array of errors.
	 * @return Error[]
	 */
	final public function getErrors()
	{
		return $this->errorCollection->toArray();
	}

	/**
	 * Getting once error with the necessary code.
	 * @param string $code Code of error.
	 * @return Error
	 */
	final public function getErrorByCode($code)
	{
		return $this->errorCollection->getErrorByCode($code);
	}
}
