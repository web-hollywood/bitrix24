<?
define("PUBLIC_AJAX_MODE", true);
define("NO_KEEP_STATISTIC", "Y");
define("NO_AGENT_STATISTIC","Y");
define("NOT_CHECK_PERMISSIONS", true);
define("DisableEventsCheck", true);
define("NO_AGENT_CHECK", true);

require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");

header('Content-Type: application/x-javascript; charset='.LANG_CHARSET);

if (!CModule::IncludeModule("voximplant"))
{
	echo CUtil::PhpToJsObject(Array('ERROR' => 'VI_MODULE_NOT_INSTALLED'));
	CMain::FinalActions();
	die();
}

if (!check_bitrix_sessid())
{
	echo CUtil::PhpToJsObject(Array('ERROR' => 'SESSION_ERROR'));
	CMain::FinalActions();
	die();
}

$permissions = \Bitrix\Voximplant\Security\Permissions::createWithCurrentUser();
if(!$permissions->canPerform(\Bitrix\Voximplant\Security\Permissions::ENTITY_LINE,\Bitrix\Voximplant\Security\Permissions::ACTION_MODIFY))
{
	echo CUtil::PhpToJsObject(Array('ERROR' => 'AUTHORIZE_ERROR'));
	CMain::FinalActions();
	die();
}

if ($_POST['VI_SIP_CHECK'])
{
	$arSend['ERROR'] = '';

	$viSip = new CVoxImplantSip();
	$result = $viSip->GetSipRegistrations($_POST['REG_ID']);
	if ($result)
	{
		$arSend = Array(
			'REG_ID' => $result->reg_id,
			'REG_LAST_UPDATED' => $result->last_updated,
			'REG_ERROR_MESSAGE' => $result->error_message,
			'REG_CODE' => $result->status_code,
			'REG_STATUS' => $result->status_result,
			'ERROR' => '',
		);
	}
	else
	{
		$arSend['ERROR'] = $viSip->GetError()->msg;
	}
	echo CUtil::PhpToJsObject($arSend);
}
else if ($_POST['VI_CONNECT'] == 'Y')
{
	$ViAccount = new CVoxImplantAccount();
	$accountBalance = $ViAccount->GetAccountBalance(true);
	if ($accountBalance > 0)
	{
		$arSend['ERROR'] = '';
		$result = CVoxImplantPhone::AddCallerID($_POST['NUMBER']);
		if ($result)
		{
			$arSend['NUMBER'] = $result['NUMBER'];
			$arSend['VERIFIED'] = $result['VERIFIED'];
			$arSend['VERIFIED_UNTIL'] = ConvertTimeStamp(MakeTimeStamp($result['VERIFIED_UNTIL'])+CTimeZone::GetOffset()+date("Z"), 'FULL');
		}
		else
		{
			$arSend['ERROR'] = 'CONNECT_ERROR';
		}
	}
	else
	{
		$arSend['ERROR'] = 'MONEY_LOW';
	}

	echo CUtil::PhpToJsObject($arSend);
}
else if ($_POST['VI_VERIFY'] == 'Y')
{
	$result = CVoxImplantPhone::VerifyCallerID(CVoxImplantPhone::GetLinkNumber());
	if (!$result)
	{
		$arSend['ERROR'] = 'CONNECT_ERROR';
	}
	else if ($result == 200)
	{
		$arSend['ERROR'] = '';
	}
	else
	{
		$arSend['ERROR'] = $result;
	}
	echo CUtil::PhpToJsObject($arSend);
}
else if ($_POST['VI_ACTIVATE'] == 'Y')
{
	$arSend['ERROR'] = '';
	$result = CVoxImplantPhone::ActivateCallerID(CVoxImplantPhone::GetLinkNumber(), $_POST['CODE']);
	if ($result)
	{
		$arSend['NUMBER'] = $result['NUMBER'];
		$arSend['NUMBER_FORMATTED'] = \Bitrix\Main\PhoneNumber\Parser::getInstance()->parse($result['NUMBER'])->format();
		$arSend['VERIFIED'] = $result['VERIFIED'];
		$arSend['VERIFIED_UNTIL'] = ConvertTimeStamp(MakeTimeStamp($result['VERIFIED_UNTIL'])+CTimeZone::GetOffset()+date("Z"), 'FULL');
	}
	else
	{
		$arSend['ERROR'] = 'CONNECT_ERROR';
	}
	echo CUtil::PhpToJsObject($arSend);
}
else if ($_POST['VI_REMOVE'] == 'Y')
{
	$result = CVoxImplantPhone::DelCallerID(CVoxImplantPhone::GetLinkNumber());
	$arSend['ERROR'] = $result? '': 'CONNECT_ERROR';
	echo CUtil::PhpToJsObject($arSend);
}
else if($_POST['GROUP_SETTINGS'] == 'Y')
{
	$APPLICATION->ShowAjaxHead();
	$APPLICATION->IncludeComponent(
		'bitrix:voximplant.queue.edit',
		'',
		array(
			'ID' => (int)$_REQUEST['ID'],
			'INLINE_MODE' => true
		)
	);
}
else
{
	echo CUtil::PhpToJsObject(Array('ERROR' => 'UNKNOWN_ERROR'));
}

CMain::FinalActions();
die();