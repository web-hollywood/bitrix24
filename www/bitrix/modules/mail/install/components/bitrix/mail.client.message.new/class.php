<?php

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

use Bitrix\Main;
use Bitrix\Main\Localization\Loc;
use Bitrix\Mail;

Loc::loadMessages(__DIR__ . '/../mail.client/class.php');

Main\Loader::includeModule('mail');

class CMailClientMessageNewComponent extends CBitrixComponent
{
	/** @var bool */
	private $isCrmEnable = false;

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

		$messageId = 0;
		if (!empty($_REQUEST['forward']) && $_REQUEST['forward'] > 0)
		{
			$messageType = 'forward';
			$messageId = (int) $_REQUEST['forward'];
			$subjectPrefix = 'Fwd';
		}
		else if (!empty($_REQUEST['reply']) && $_REQUEST['reply'] > 0)
		{
			$messageType = 'reply';
			$messageId = (int) $_REQUEST['reply'];
			$subjectPrefix = 'Re';
		}

		$message = array();

		if (!empty($_REQUEST['id']) && $_REQUEST['id'] > 0)
		{
			if ($mailbox = Mail\MailboxTable::getUserMailbox($_REQUEST['id']))
			{
				$message = array(
					'MAILBOX_ID' => $mailbox['ID'],
					'MAILBOX_EMAIL' => $mailbox['EMAIL'],
				);
			}
		}

		if ($messageId > 0)
		{
			$message = Mail\MailMessageTable::getList(array(
				'select' => array(
					'*',
					'MAILBOX_EMAIL' => 'MAILBOX.EMAIL',
					'MAILBOX_NAME' => 'MAILBOX.NAME',
					'MAILBOX_LOGIN' => 'MAILBOX.LOGIN',
				),
				'filter' => array(
					'=ID' => $messageId,
				),
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

			if (!empty($subjectPrefix))
			{
				$message['SUBJECT'] = preg_replace(
					sprintf('/^(%s:\s*)?/i', preg_quote($subjectPrefix)),
					sprintf('%s: ', $subjectPrefix),
					$message['SUBJECT']
				);
			}

			$message['__files'] = Mail\Internals\MailMessageAttachmentTable::getList(array(
				'select' => array(
					'ID', 'FILE_ID', 'FILE_NAME', 'FILE_SIZE', 'CONTENT_TYPE',
				),
				'filter' => array(
					'=MESSAGE_ID' => $message['ID'],
				),
			))->fetchAll();

			$message['ID'] = 0;

			$message['__type'] = $messageType;
			$message['__parent'] = $messageId;

			Mail\Helper\Message::prepare($message);
		}

		$this->arResult['MESSAGE'] = $message;
		$this->arResult['LAST_RCPT'] = $this->loadLastRcpt($this->request->getPost('email'));
		$this->arResult['SELECTED_EMAIL_CODE'] = ($emailTo = $this->request->getPost('email')) ? $this->buildUniqueEmailCode($emailTo) : null;

		$this->arResult['EMAILS'] = $this->loadMailContacts();
		$this->arResult['CRM_EMAILS'] = $this->loadCrmMailContacts();

		$this->includeComponentTemplate();
	}

	/**
	 * Load last used Rcpt
	 *
	 * @param string $emailTo
	 * @return array
	 *
	 * @throws Main\ArgumentException
	 * @throws Main\ObjectPropertyException
	 * @throws Main\SystemException
	 */
	private function loadLastRcpt($emailTo = null)
	{
		global $APPLICATION;

		$result = array();

		$currentUser = \Bitrix\Main\Engine\CurrentUser::get();

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
		$filter = [];

		if ($emailTo)
		{
			$filter = array_merge($filter, [
				'=EMAIL' => $emailTo
			]);
		}
		if (count($emailUsersIds) > 0)
		{
			$filter = array_merge($filter, [
				'@ID' => $emailUsersIds
			]);
		}
		if (!empty($filter))
		{
			$mailContacts = \Bitrix\Mail\Internals\MailContactTable::getList([
				'filter' => array_merge(
					[
						'LOGIC' => 'AND',
					],
					[
						[
							'=USER_ID' => $currentUser->getId(),
						],
						array_merge($filter, [
							'LOGIC' => 'OR',
						]),
					]
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
}