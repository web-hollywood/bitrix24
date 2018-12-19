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

if(!check_bitrix_sessid())
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

if ($_POST['ACTION'] === 'createSipConnection')
{
	$arSend['ERROR'] = '';

	CUtil::decodeURIComponent($_POST);

	$viSip = new CVoxImplantSip();
	$sipFields = array(
		'TYPE' => strtolower($_POST['TYPE']),
		'PHONE_NAME' => $_POST['TITLE'],
		'SERVER' => $_POST['SERVER'],
		'LOGIN' => $_POST['LOGIN'],
		'PASSWORD' => $_POST['PASSWORD'],
	);
	if($sipFields['TYPE'] === CVoxImplantSip::TYPE_CLOUD)
	{
		$sipFields['AUTH_USER'] = $_POST['AUTH_USER'];
		$sipFields['OUTBOUND_PROXY'] = $_POST['OUTBOUND_PROXY'];
	}

	$result = $viSip->Add($sipFields);
	if ($result)
	{
		$arSend['RESULT'] = $result;
	}
	else
	{
		$arSend['ERROR'] = $viSip->GetError()->msg;
	}
	echo CUtil::PhpToJsObject($arSend);
}
else if ($_POST['VI_DELETE'] == 'Y')
{
	$arSend['ERROR'] = '';

	$viSip = new CVoxImplantSip();
	$viSip->Delete($_POST['CONFIG_ID']);

	echo CUtil::PhpToJsObject($arSend);
}
else if($_POST['ACTION'] == 'showSipCloudForm')
{
	//statistics only
}
else if($_POST['ACTION'] == 'showSipOfficeForm')
{
	//statistics only
}
else if($_POST['ACTION'] == 'buySipConnector')
{
	//statistics only
}
else
{
	echo CUtil::PhpToJsObject(Array('ERROR' => 'UNKNOWN_ERROR'));
}

CMain::FinalActions();
die();