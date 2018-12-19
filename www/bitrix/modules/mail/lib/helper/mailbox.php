<?php

namespace Bitrix\Mail\Helper;

use Bitrix\Main;
use Bitrix\Mail;

abstract class Mailbox
{

	const SYNC_TIMEOUT = 300;
	const SYNC_TIME_QUOTA = 280;

	protected $mailbox;
	protected $session;
	protected $startTime, $timeQuotaExceeded;
	protected $errors, $warnings;

	public static function createInstance($id, $throw = true)
	{
		$id = (int) $id;

		try
		{
			$mailbox = Mail\MailboxTable::getList(array(
				'filter' => array('ID' => $id, 'ACTIVE' => 'Y'),
				'select' => array('*', 'LANG_CHARSET' => 'SITE.CULTURE.CHARSET')
			))->fetch();

			if (empty($mailbox))
			{
				throw new Main\ObjectException('no mailbox');
			}

			if (!in_array($mailbox['SERVER_TYPE'], array('imap', 'controller', 'domain', 'crdomain')))
			{
				throw new Main\ObjectException('unsupported mailbox type');
			}

			if (in_array($mailbox['SERVER_TYPE'], array('controller', 'crdomain', 'domain')))
			{
				$result = \CMailDomain2::getImapData(); // @TODO: request controller for 'controller' and 'crdomain'

				$mailbox['SERVER']  = $result['server'];
				$mailbox['PORT']    = $result['port'];
				$mailbox['USE_TLS'] = $result['secure'];
			}

			return new Mailbox\Imap($mailbox); // @TODO: other SERVER_TYPE
		}
		catch (\Exception $e)
		{
			if ($throw)
			{
				throw $e;
			}
			else
			{
				return false;
			}
		}
	}

	protected function __construct($mailbox)
	{
		$this->startTime = time();
		if (defined('START_EXEC_PROLOG_BEFORE_1') && preg_match('/ (\d+)$/', START_EXEC_PROLOG_BEFORE_1, $matches))
		{
			$startTime = $matches[1];
			if ($startTime > 0 && $this->startTime >= $startTime)
			{
				$this->startTime = $startTime;
			}
		}

		$this->mailbox = $mailbox;

		if (empty($this->mailbox['OPTIONS']) || !is_array($this->mailbox['OPTIONS']))
		{
			$this->mailbox['OPTIONS'] = array();
		}

		$this->session = md5(uniqid(''));
		$this->warnings = new Main\ErrorCollection();
	}

	public function getMailbox()
	{
		return $this->mailbox;
	}

	protected function isTimeQuotaExceeded()
	{
		return time() - $this->startTime > static::SYNC_TIME_QUOTA;
	}

	public function sync()
	{
		global $DB;

		if (time() - $this->mailbox['SYNC_LOCK'] < static::SYNC_TIMEOUT)
		{
			return 0;
		}

		$this->mailbox['SYNC_LOCK'] = time();

		if ($this->isTimeQuotaExceeded())
		{
			return 0;
		}

		$this->syncOutgoing();

		$lockSql = sprintf(
			'UPDATE b_mail_mailbox SET SYNC_LOCK = %u WHERE ID = %u AND (SYNC_LOCK IS NULL OR SYNC_LOCK < %u)',
			$this->mailbox['SYNC_LOCK'], $this->mailbox['ID'], $this->mailbox['SYNC_LOCK'] - static::SYNC_TIMEOUT
		);
		if (!$DB->query($lockSql)->affectedRowsCount())
		{
			return 0;
		}
		$mailboxSyncManager = new Mailbox\MailboxSyncManager($this->mailbox['USER_ID']);

		if ($this->mailbox['USER_ID'] > 0)
		{
			$mailboxSyncManager->setSyncStartedData($this->mailbox['ID']);
		}

		$this->session = md5(uniqid(''));

		$count = $this->syncInternal();
		$success = $count !== false && empty($this->errors);

		$syncUnlock = $this->isTimeQuotaExceeded() ? 0 : -1;
		$unlockSql = sprintf(
			'UPDATE b_mail_mailbox SET SYNC_LOCK = %d WHERE ID = %u AND SYNC_LOCK = %u',
			$syncUnlock, $this->mailbox['ID'], $this->mailbox['SYNC_LOCK']
		);
		if ($DB->query($unlockSql)->affectedRowsCount())
		{
			$this->mailbox['SYNC_LOCK'] = $syncUnlock;
		}

		$this->pushSyncStatus(
			array(
				'new' => $count,
				'complete' => $this->mailbox['SYNC_LOCK'] < 0,
			),
			true
		);

		if ($this->mailbox['USER_ID'] > 0)
		{
			$mailboxSyncManager->setSyncStatus($this->mailbox['ID'], $success, time());
		}

		return $count;
	}

	public function getSyncStatus()
	{
		return -1;
	}

	protected function pushSyncStatus($params, $force = false)
	{
		if (Main\Loader::includeModule('pull'))
		{
			$status = $this->getSyncStatus();

			\CPullWatch::addToStack(
				'mail_mailbox_' . $this->mailbox['ID'],
				array(
					'module_id' => 'mail',
					'command' => 'mailbox_sync_status',
					'params' => array_merge(
						array(
							'id' => $this->mailbox['ID'],
							'status' => sprintf('%.3f', $status),
						),
						$params
					),
				)
			);

			if ($force)
			{
				\Bitrix\Pull\Event::send();
			}
		}
	}

	protected function listMessages($params = array(), $fetch = true)
	{
		$filter = array(
			'=MAILBOX_ID' => $this->mailbox['ID'],
		);

		if (!empty($params['filter']))
		{
			$filter = array_merge((array) $params['filter'], $filter);
		}

		$params['filter'] = $filter;

		$result = Mail\MailMessageUidTable::getList($params);

		return $fetch ? $result->fetchAll() : $result;
	}

	protected function registerMessage(&$fields, $id = null)
	{
		$now = new Main\Type\DateTime();

		if (!empty($id))
		{
			$exists = Mail\MailMessageUidTable::getList(array(
				'select' => array(
					'ID',
					'MESSAGE_ID',
				),
				'filter' => array(
					'=ID' => $id,
					'=MAILBOX_ID' => $this->mailbox['ID'],
				),
			))->fetch();
		}

		if (!empty($exists))
		{
			$fields['MESSAGE_ID'] = $exists['MESSAGE_ID'];

			$result = Mail\MailMessageUidTable::update(
				array(
					'ID' => $exists['ID'],
					'MAILBOX_ID' => $this->mailbox['ID'],
				),
				array_merge(
					$fields,
					array(
						'TIMESTAMP_X' => $now,
					)
				)
			);
		}
		else
		{
			$result = Mail\MailMessageUidTable::add(array_merge(
				array(
					'MESSAGE_ID'  => 0,
				),
				$fields,
				array(
					'MAILBOX_ID'  => $this->mailbox['ID'],
					'SESSION_ID'  => $this->session,
					'TIMESTAMP_X' => $now,
					'DATE_INSERT' => $now,
				)
			));
		}

		return $result->isSuccess();
	}

	protected function updateMessagesRegistry(array $filter, array $fields, $mailData = array())
	{
		return Mail\MailMessageUidTable::updateList(
			array_merge(
				$filter,
				array(
					'=MAILBOX_ID' => $this->mailbox['ID'],
				)
			),
			$fields,
			$mailData
		);
	}

	protected function unregisterMessages($filter)
	{
		return Mail\MailMessageUidTable::deleteList(
			array_merge(
				$filter,
				array(
					'=MAILBOX_ID' => $this->mailbox['ID'],
				)
			)
		);
	}

	protected function linkMessage($uid, $id)
	{
		$result = Mail\MailMessageUidTable::update(
			array(
				'ID' => $uid,
				'MAILBOX_ID' => $this->mailbox['ID'],
			),
			array(
				'MESSAGE_ID' => $id,
			)
		);

		return $result->isSuccess();
	}

	protected function cacheMessage(&$body, $params = array())
	{
		return \CMailMessage::addMessage(
			$this->mailbox['ID'],
			$body,
			$this->mailbox['CHARSET'] ?: $this->mailbox['LANG_CHARSET'],
			$params
		);
	}

	public function mail(array $params)
	{
		class_exists('Bitrix\Mail\Helper');

		$message = new Mail\DummyMail($params);

		$messageUid = $this->createMessage($message);

		Mail\Internals\MessageUploadQueueTable::add(array(
			'ID' => $messageUid,
			'MAILBOX_ID' => $this->mailbox['ID'],
		));

		\CAgent::addAgent(
			sprintf(
				'Bitrix\Mail\Helper::syncOutgoingAgent(%u);',
				$this->mailbox['ID']
			),
			'mail', 'N', 60
		);
	}

	protected function createMessage(Main\Mail\Mail $message, array $fields = array())
	{
		$messageUid = sprintf('%x%x', time(), rand(0, 0xffffffff));

		$messageId = $this->cacheMessage(
			sprintf(
				'%1$s%3$s%3$s%2$s',
				$message->getHeaders(),
				$message->getBody(),
				$message->getMailEol()
			),
			array(
				'outcome' => true,
				'seen'    => true,
				'trackable' => true,
			)
		);

		$fields = array_merge(
			$fields,
			array(
				'ID' => $messageUid,
				'INTERNALDATE' => new Main\Type\DateTime,
				'IS_SEEN' => 'Y',
				'MESSAGE_ID' => $messageId,
			)
		);

		$this->registerMessage($fields);

		return $messageUid;
	}

	public function syncOutgoing()
	{
		$res = $this->listMessages(
			array(
				'runtime' => array(
					new \Bitrix\Main\Entity\ReferenceField(
						'UPLOAD_QUEUE',
						'Bitrix\Mail\Internals\MessageUploadQueueTable',
						array(
							'=this.ID' => 'ref.ID',
							'=this.MAILBOX_ID' => 'ref.MAILBOX_ID',
						),
						array(
							'join_type' => 'INNER',
						)
					),
				),
				'select' => array(
					'*',
					'__' => 'MESSAGE.*',
					'UPLOAD_STAGE' => 'UPLOAD_QUEUE.SYNC_STAGE',
				),
				'filter' => array(
					'>=UPLOAD_QUEUE.SYNC_STAGE' => 0,
					'<UPLOAD_QUEUE.SYNC_LOCK' => time() - static::SYNC_TIMEOUT,
				),
			),
			false
		);

		while ($excerpt = $res->fetch())
		{
			$this->syncOutgoingMessage($excerpt);

			if ($this->isTimeQuotaExceeded())
			{
				break;
			}
		}
	}

	protected function syncOutgoingMessage($excerpt)
	{
		global $DB;

		$lockSql = sprintf(
			"UPDATE b_mail_message_upload_queue SET SYNC_LOCK = %u, SYNC_STAGE = %u
				WHERE ID = '%s' AND MAILBOX_ID = %u AND SYNC_LOCK < %u",
			$syncLock = time(),
			max(1, $excerpt['UPLOAD_STAGE']),
			$DB->forSql($excerpt['ID']),
			$excerpt['MAILBOX_ID'],
			$syncLock - static::SYNC_TIMEOUT
		);
		if (!$DB->query($lockSql)->affectedRowsCount())
		{
			return;
		}

		$outgoingBody = $excerpt['__BODY_HTML'];

		$excerpt['__files'] = Mail\Internals\MailMessageAttachmentTable::getList(array(
			'select' => array(
				'ID', 'FILE_ID', 'FILE_NAME',
			),
			'filter' => array(
				'=MESSAGE_ID' => $excerpt['__ID'],
			),
		))->fetchAll();

		$attachments = array();
		if (!empty($excerpt['__files']) && is_array($excerpt['__files']))
		{
			$hostname = \COption::getOptionString('main', 'server_name', 'localhost');
			if (defined('BX24_HOST_NAME') && BX24_HOST_NAME != '')
			{
				$hostname = BX24_HOST_NAME;
			}
			else if (defined('SITE_SERVER_NAME') && SITE_SERVER_NAME != '')
			{
				$hostname = SITE_SERVER_NAME;
			}

			foreach ($excerpt['__files'] as $item)
			{
				$file = \CFile::makeFileArray($item['FILE_ID']);

				$contentId = sprintf(
					'bxacid.%s@%s.mail',
					hash('crc32b', $file['external_id'].$file['size'].$file['name']),
					hash('crc32b', $hostname)
				);

				$attachments[] = array(
					'ID'           => $contentId,
					'NAME'         => $item['FILE_NAME'],
					'PATH'         => $file['tmp_name'],
					'CONTENT_TYPE' => $file['type'],
				);

				$outgoingBody = preg_replace(
					sprintf('/aid:%u/i', $item['ID']),
					sprintf('cid:%s', $contentId),
					$outgoingBody
				);
			}
		}

		foreach (array('FROM', 'REPLY_TO', 'TO', 'CC', 'BCC') as $field)
		{
			$field = sprintf('__FIELD_%s', $field);

			$excerpt[$field] = explode(',', $excerpt[$field]);

			foreach ($excerpt[$field] as $k => $item)
			{
				unset($excerpt[$field][$k]);

				$address = new Main\Mail\Address($item);

				if ($address->validate())
				{
					if ($address->getName())
					{
						$excerpt[$field][] = sprintf(
							'%s <%s>',
							sprintf('=?%s?B?%s?=', SITE_CHARSET, base64_encode($address->getName())),
							$address->getEmail()
						);
					}
					else
					{
						$excerpt[$field][] = $address->getEmail();
					}
				}
			}

			$excerpt[$field] = join(', ', $excerpt[$field]);
		}

		$outgoingParams = array(
			'CHARSET'      => LANG_CHARSET,
			'CONTENT_TYPE' => 'html',
			'ATTACHMENT'   => $attachments,
			'TO'           => $excerpt['__FIELD_TO'],
			'SUBJECT'      => $excerpt['__SUBJECT'],
			'BODY'         => $outgoingBody,
			'HEADER'       => array(
				'From'       => $excerpt['__FIELD_FROM'],
				'Reply-To'   => $excerpt['__FIELD_REPLY_TO'],
				//'To'         => $excerpt['__FIELD_TO'],
				'Cc'         => $excerpt['__FIELD_CC'],
				'Bcc'        => $excerpt['__FIELD_BCC'],
				//'Subject'    => $excerpt['__SUBJECT'],
				'Message-Id' => sprintf('<%s>', $excerpt['__MSG_ID']),
				'In-Reply-To' => sprintf('<%s>', $excerpt['__IN_REPLY_TO']),
				'X-Bitrix-Mail-Message-UID' => $excerpt['ID'],
			),
		);

		$context = new Main\Mail\Context();
		$context->setCategory(Main\Mail\Context::CAT_EXTERNAL);
		$context->setPriority(Main\Mail\Context::PRIORITY_NORMAL);

		if ($excerpt['UPLOAD_STAGE'] < 2)
		{
			$success = Main\Mail\Mail::send(array_merge(
				$outgoingParams,
				array(
					'TRACK_READ' => array(
						'MODULE_ID' => 'mail',
						'FIELDS'    => array('msgid' => $excerpt['__MSG_ID']),
						'URL_PAGE' => '/pub/mail/read.php',
					),
					//'TRACK_CLICK' => array(
					//	'MODULE_ID' => 'mail',
					//	'FIELDS'    => array('msgid' => $excerpt['__MSG_ID']),
					//),
					'CONTEXT' => $context,
				)
			));

			if (!$success)
			{
				// @TODO: to limit attempts

				return false;
			}
		}

		$needUpload = empty($this->mailbox['OPTIONS']['deny_upload_outcome']);

		// @TODO: use option
		if ($context->getSmtp() && strtolower($context->getSmtp()->getHost()) == 'smtp.gmail.com')
		{
			$needUpload = false;
		}

		if ($needUpload)
		{
			Mail\Internals\MessageUploadQueueTable::update(
				array(
					'ID' => $excerpt['ID'],
					'MAILBOX_ID' => $excerpt['MAILBOX_ID'],
				),
				array(
					'SYNC_STAGE' => 2,
				)
			);

			class_exists('Bitrix\Mail\Helper');

			$message = new Mail\DummyMail(array_merge(
				$outgoingParams,
				array(
					'HEADER' => array_merge(
						$outgoingParams['HEADER'],
						array(
							'To'      => $outgoingParams['TO'],
							'Subject' => $outgoingParams['SUBJECT'],
						)
					),
				)
			));

			if ($this->uploadMessage($message, $excerpt))
			{
				Mail\Internals\MessageUploadQueueTable::delete(array(
					'ID' => $excerpt['ID'],
					'MAILBOX_ID' => $excerpt['MAILBOX_ID'],
				));
			}
		}
		else
		{
			Mail\Internals\MessageUploadQueueTable::update(
				array(
					'ID' => $excerpt['ID'],
					'MAILBOX_ID' => $excerpt['MAILBOX_ID'],
				),
				array(
					'SYNC_STAGE' => -1,
					'SYNC_LOCK' => 0,
				)
			);
		}

		return;
	}

	public function resortTree($message = null)
	{
		global $DB;

		$worker = function ($id, $msgId, &$i)
		{
			global $DB;

			$stack = array(
				array(
					array($id, $msgId, false),
				),
			);

			$excerpt = array();

			do
			{
				$level = array_pop($stack);

				while ($level)
				{
					list($id, $msgId, $skip) = array_shift($level);

					if (!$skip)
					{
						$excerpt[] = $id;

						$DB->query(sprintf(
							'UPDATE b_mail_message SET LEFT_MARGIN = %2$u, RIGHT_MARGIN = %3$u WHERE ID = %1$u',
							$id, ++$i, ++$i
						));

						if (!empty($msgId))
						{
							$replies = array();

							$res = Mail\MailMessageTable::getList(array(
								'select' => array(
									'ID',
									'MSG_ID',
								),
								'filter' => array(
									'=MAILBOX_ID' => $this->mailbox['ID'],
									'=IN_REPLY_TO' => $msgId,
								),
								'order' => array(
									'FIELD_DATE' => 'ASC',
								),
							));

							while ($item = $res->fetch())
							{
								if (!in_array($item['ID'], $excerpt))
								{
									$replies[] = array($item['ID'], $item['MSG_ID'], false);
								}
							}

							if ($replies)
							{
								array_unshift($level, array($id, $msgId, true));

								array_push($stack, $level, $replies);
								$i--;

								continue 2;
							}
						}
					}
					else
					{
						$DB->query(sprintf(
							'UPDATE b_mail_message SET RIGHT_MARGIN = %2$u WHERE ID = %1$u',
							$id, ++$i
						));
					}
				}
			}
			while ($stack);
		};

		if (!empty($message))
		{
			if (empty($message['ID']))
			{
				throw new Main\ArgumentException("Argument 'message' is not valid");
			}

			$item = $DB->query(sprintf(
				'SELECT GREATEST(M1, M2) AS I FROM (SELECT
					(SELECT RIGHT_MARGIN FROM b_mail_message WHERE MAILBOX_ID = %1$u AND RIGHT_MARGIN > 0 ORDER BY LEFT_MARGIN ASC LIMIT 1) M1,
					(SELECT RIGHT_MARGIN FROM b_mail_message WHERE MAILBOX_ID = %1$u AND RIGHT_MARGIN > 0 ORDER BY LEFT_MARGIN DESC LIMIT 1) M2
				) M',
				$this->mailbox['ID']
			))->fetch();

			$i = empty($item['I']) ? 0 : $item['I'];

			$worker($message['ID'], $message['MSG_ID'], $i);
		}
		else
		{
			$DB->query(sprintf(
				'UPDATE b_mail_message SET LEFT_MARGIN = 0, RIGHT_MARGIN = 0 WHERE MAILBOX_ID = %u',
				$this->mailbox['ID']
			));

			$i = 0;

			$res = $DB->query(sprintf(
				"SELECT ID, MSG_ID FROM b_mail_message M WHERE MAILBOX_ID = %u AND (
					IN_REPLY_TO IS NULL OR IN_REPLY_TO = '' OR NOT EXISTS (
						SELECT 1 FROM b_mail_message WHERE MSG_ID = M.IN_REPLY_TO
					)
				)",
				$this->mailbox['ID']
			));

			while ($item = $res->fetch())
			{
				$worker($item['ID'], $item['MSG_ID'], $i);
			}

			// crosslinked messages
			$query = sprintf(
				'SELECT ID, MSG_ID FROM b_mail_message
					WHERE MAILBOX_ID = %u AND LEFT_MARGIN = 0 AND RIGHT_MARGIN = 0
					ORDER BY FIELD_DATE ASC',
				$this->mailbox['ID']
			);
			while ($item = $DB->query($query)->fetch())
			{
				$worker($item['ID'], $item['MSG_ID'], $i);
			}
		}
	}

	public function incrementTree($message)
	{
		if (empty($message['ID']))
		{
			throw new Main\ArgumentException("Argument 'message' is not valid");
		}

		if (!empty($message['IN_REPLY_TO']))
		{
			$item = Mail\MailMessageTable::getList(array(
				'select' => array(
					'ID', 'MSG_ID', 'LEFT_MARGIN', 'RIGHT_MARGIN',
				),
				'filter' => array(
					'=MAILBOX_ID' => $this->mailbox['ID'],
					'=MSG_ID' => $message['IN_REPLY_TO'],
				),
				'order' => array(
					'LEFT_MARGIN' => 'ASC',
				),
			))->fetch();

			if (!empty($item))
			{
				$message = $item;

				$item = Mail\MailMessageTable::getList(array(
					'select' => array(
						'ID', 'MSG_ID',
					),
					'filter' => array(
						'=MAILBOX_ID' => $this->mailbox['ID'],
						'<LEFT_MARGIN' => $item['LEFT_MARGIN'],
						'>RIGHT_MARGIN' => $item['RIGHT_MARGIN'],
					),
					'order' => array(
						'LEFT_MARGIN' => 'ASC',
					),
					'limit' => 1,
				))->fetch();

				if (!empty($item))
				{
					$message = $item;
				}
			}
		}

		$this->resortTree($message);
	}

	abstract protected function syncInternal();
	abstract protected function uploadMessage(Main\Mail\Mail $message, array $excerpt);

	public function getErrors()
	{
		return $this->errors;
	}

	public function getWarnings()
	{
		return $this->warnings;
	}

}
