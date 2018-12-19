<?php

namespace Bitrix\Mail\Helper;

use Bitrix\Main;
use Bitrix\Main\Security;
use Bitrix\Mail;

class Message
{

	public static function prepare(&$message)
	{
		$message['__email'] = null;
		foreach (array($message['MAILBOX_EMAIL'], $message['MAILBOX_NAME'], $message['MAILBOX_LOGIN']) as $item)
		{
			$address = new Main\Mail\Address($item);
			if ($address->validate())
			{
				$message['__email'] = $address->getEmail();
				break;
			}
		}

		$fieldsMap = array(
			'__from' => 'FIELD_FROM',
			'__reply_to' => 'FIELD_REPLY_TO',
			'__to' => 'FIELD_TO',
			'__cc' => 'FIELD_CC',
			'__bcc' => 'FIELD_BCC',
		);
		foreach ($fieldsMap as $__field => $field)
		{
			$isFromField = in_array($__field, array('__from', '__reply_to'));

			$message[$__field] = array();
			foreach (explode(',', $message[$field]) as $item)
			{
				if (trim($item))
				{
					$address = new Main\Mail\Address($item);
					if ($address->validate())
					{
						if ($isFromField && $address->getEmail() == $message['__email'])
						{
							$message['__is_outcome'] = true;
						}

						$message[$__field][] = array(
							'name'  => $address->getName(),
							'email' => $address->getEmail(),
						);
					}
					else
					{
						$message[$__field][] = array(
							'name'  => $item,
						);
					}
				}
			}
		}

		if (empty($message['__reply_to']))
		{
			$message['__reply_to'] = $message['__from'];
		}

		// @TODO: path
		$message['__href'] = sprintf('/mail/message/%u', $message['ID']);

		$urlManager = Attachment\Storage::getUrlManager();

		if (!empty($message['__files']) && is_array($message['__files']))
		{
			$urlParams = array();

			if (isset($_REQUEST['mail_uf_message_token']) && is_string($_REQUEST['mail_uf_message_token']))
			{
				$urlParams['mail_uf_message_token'] = $_REQUEST['mail_uf_message_token'];
			}

			foreach ($message['__files'] as $k => $item)
			{
				if ($diskFile = Attachment\Storage::getObjectByAttachment($item, true))
				{
					$message['__files'][$k] = array(
						'id'      => sprintf('n%u', $diskFile->getId()),
						'name'    => $item['FILE_NAME'],
						'url'     => $urlManager->getUrlForShowFile($diskFile, $urlParams),
						'size'    => \CFile::formatSize($diskFile->getSize()),
					);

					if (\Bitrix\Disk\TypeFile::isImage($diskFile))
					{
						$message['__files'][$k]['preview'] = $urlManager->getUrlForShowFile(
							$diskFile,
							array_merge(
								array('width' => 80, 'height' => 80),
								$urlParams
							)
						);
					}

					$message['BODY_HTML'] = preg_replace(
						sprintf('/("|\')\s*aid:%u\s*\1/i', $item['ID']),
						sprintf('\1%s\1', $urlManager->getUrlForShowFile($diskFile, array('__bxacid' => sprintf('n%u', $diskFile->getId())))),
						$message['BODY_HTML']
					);
				}
				else
				{
					$file = \CFile::getFileArray($item['FILE_ID']);
					if (!empty($file) && is_array($file))
					{
						$preview = \CFile::resizeImageGet(
							$file, array('width' => 80, 'height' => 80),
							BX_RESIZE_IMAGE_EXACT, false
						);

						$message['__files'][$k] = array(
							'id'      => $file['ID'],
							'name'    => $item['FILE_NAME'],
							'url'     => $file['SRC'],
							'preview' => !empty($preview['src']) ? $preview['src'] : null,
							'size'    => \CFile::formatSize($file['FILE_SIZE']),
						);

						$message['BODY_HTML'] = preg_replace(
							sprintf('/("|\')\s*aid:%u\s*\1/i', $item['ID']),
							sprintf('\1%s\1', $file['SRC']),
							$message['BODY_HTML']
						);
					}
					else
					{
						unset($message['__files'][$k]);
					}
				}
			}
		}

		return $message;
	}

	public static function hasAccess(&$message, $userId = null)
	{
		global $USER;

		if (!($userId > 0 || is_object($USER) && $USER->isAuthorized()))
		{
			return false;
		}

		if (!($userId > 0))
		{
			$userId = $USER->getId();
		}

		$access = (bool) Mail\MailboxTable::getUserMailbox($message['MAILBOX_ID'], $userId);

		$message['__access_level'] = $access ? 'full' : false;

		if (!$access && isset($_REQUEST['mail_uf_message_token']))
		{
			$token = $signature = '';
			if (is_string($_REQUEST['mail_uf_message_token']) && strpos($_REQUEST['mail_uf_message_token'], ':') > 0)
			{
				list($token, $signature) = explode(':', $_REQUEST['mail_uf_message_token'], 2);
			}

			if (strlen($token) > 0 && strlen($signature) > 0)
			{
				$excerpt = Mail\Internals\MessageAccessTable::getList(array(
					'select' => array('SECRET', 'MESSAGE_ID'),
					'filter' => array(
						'=TOKEN' => $token,
						'=MAILBOX_ID' => $message['MAILBOX_ID'],
						//'=MESSAGE_ID' => $message['ID'],
					),
					'limit' => 1,
				))->fetch();

				if (!empty($excerpt['SECRET']))
				{
					$signer = new Security\Sign\Signer(new Security\Sign\HmacAlgorithm('md5'));

					if ($signer->validate($excerpt['SECRET'], $signature, sprintf('user%u', $userId)))
					{
						$access = $message['ID'] == $excerpt['MESSAGE_ID'];

						if (!$access) // check parent access
						{
							$access = (bool) Mail\MailMessageTable::getList(array(
								'select' => array('ID'),
								'filter' => array(
									'=MAILBOX_ID' => $message['MAILBOX_ID'],
									'=ID' => $excerpt['MESSAGE_ID'],
									'<LEFT_MARGIN' => $message['LEFT_MARGIN'],
									'>RIGHT_MARGIN' => $message['RIGHT_MARGIN'],
								),
							))->fetch();
						}
					}
				}
			}
		}

		if (false === $message['__access_level'])
		{
			$message['__access_level'] = $access ? 'read' : false;
		}

		return $access;
	}

	public static function prepareSearchContent(&$fields)
	{
		// @TODO: filter short words, filter duplicates, str_rot13?
		return str_rot13(join(
			' ',
			array(
				$fields['FIELD_FROM'],
				$fields['FIELD_REPLY_TO'],
				$fields['FIELD_TO'],
				$fields['FIELD_CC'],
				$fields['FIELD_BCC'],
				$fields['SUBJECT'],
				$fields['BODY'],
			)
		));
	}

	public static function prepareSearchString($string)
	{
		return str_rot13($string);
	}

	public static function getTotalUnseenCount($userId)
	{
		$unseenTotal = static::getTotalUnseenForMailboxes($userId);
		$unseen = 0;
		foreach ($unseenTotal as $index => $item)
		{
			$unseen += (int)$item['UNSEEN'];
		}
		return $unseen;
	}

	public static function getTotalUnseenForMailboxes($userId)
	{
		$mailboxes = Mail\MailboxTable::getUserMailboxes($userId);
		$mailboxes = array_combine(
			array_column($mailboxes, 'ID'),
			$mailboxes
		);

		$mailboxFilter = array(
			'LOGIC' => 'OR',
		);
		foreach ($mailboxes as $item)
		{
			$mailboxFilter[] = array(
				'=MAILBOX_ID' => $item['ID'],
				'!@DIR_MD5' => array_map(
					'md5',
					array_merge(
						(array) $item['OPTIONS']['imap'][MessageFolder::TRASH],
						(array) $item['OPTIONS']['imap'][MessageFolder::SPAM]
					)
				),
			);
		}
		$totalUnseen = Mail\MailMessageUidTable::getList(array(
			'runtime' => array(
				new \Bitrix\Main\Entity\ReferenceField(
					'MESSAGE',
					'Bitrix\Mail\MailMessageTable',
					array(
						'=this.MAILBOX_ID' => 'ref.MAILBOX_ID',
						'=this.MESSAGE_ID' => 'ref.ID',
					),
					array(
						'join_type' => 'INNER',
					)
				),
			),
			'select' => array(
				'MAILBOX_ID',
				new \Bitrix\Main\Entity\ExpressionField(
					'TOTAL',
					'COUNT(DISTINCT %s)',
					'MESSAGE_ID'
				),
				new \Bitrix\Main\Entity\ExpressionField(
					'UNSEEN',
					"COUNT(DISTINCT IF(%s IN('N','U'), %s, NULL))",
					array('IS_SEEN', 'MESSAGE_ID')
				),
			),
			'filter' => array(
				$mailboxFilter,
				'>MESSAGE_ID' => 0,
			),
			'group' => array(
				'MAILBOX_ID',
			),
		))->fetchAll();
		$result = [];
		foreach ($totalUnseen as $index => $item)
		{
			$result[$item['MAILBOX_ID']] = [
				'TOTAL' => $item['TOTAL'],
				'UNSEEN' => $item['UNSEEN'],
			];
		}
		return $result;
	}
}