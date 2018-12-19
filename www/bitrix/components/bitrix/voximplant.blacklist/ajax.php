<?
define("PUBLIC_AJAX_MODE", true);
define("NO_KEEP_STATISTIC", "Y");
define("NO_AGENT_STATISTIC","Y");
define("NOT_CHECK_PERMISSIONS", true);

require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");

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
if(!$permissions->canPerform(\Bitrix\Voximplant\Security\Permissions::ENTITY_SETTINGS,\Bitrix\Voximplant\Security\Permissions::ACTION_MODIFY))
{
	echo CUtil::PhpToJsObject(Array('ERROR' => 'AUTHORIZE_ERROR'));
	CMain::FinalActions();
	die();
}

if ($_POST['ACTION'] == 'saveSettings')
{
	Bitrix\Main\Config\Option::set("voximplant", "blacklist_auto", (isset($_POST["BLACKLIST_AUTO"]) ? "Y" : "N"));

	$arBlacklistTime = (isset($_POST["BLACKLIST_TIME"]) && intval($_POST["BLACKLIST_TIME"]) && $_POST["BLACKLIST_TIME"] > 0) ? intval($_POST["BLACKLIST_TIME"]) : 5;
	Bitrix\Main\Config\Option::set("voximplant", "blacklist_time", $arBlacklistTime);

	$arBlacklistCount = (isset($_POST["BLACKLIST_COUNT"]) && intval($_POST["BLACKLIST_COUNT"]) && $_POST["BLACKLIST_COUNT"] > 0) ? intval($_POST["BLACKLIST_COUNT"]) : 5;
	Bitrix\Main\Config\Option::set("voximplant", "blacklist_count", $arBlacklistCount);
	Bitrix\Main\Config\Option::set("voximplant", "blacklist_user_id", $USER->GetID());

	echo \Bitrix\Main\Web\Json::encode(array("success" => "Y"));
}
else if($_POST['ACTION'] == 'addNumber')
{
	$newNumber = substr($_POST["NUMBER"], 0, 20);
	$newNumber = CVoxImplantPhone::Normalize($newNumber);
	if ($newNumber)
	{
		$dbBlacklist = Bitrix\Voximplant\BlacklistTable::getList(array(
			"filter" => array("=PHONE_NUMBER" => $newNumber)
		));
		if (!$dbBlacklist->Fetch())
		{
			$insertResult = Bitrix\Voximplant\BlacklistTable::add(array(
				"PHONE_NUMBER" => $newNumber
			));

			echo \Bitrix\Main\Web\Json::encode(array(
				"success" => "Y",
				"number" => array(
					'ID' => $insertResult->getId(),
					'PHONE_NUMBER' => $newNumber
				)
			));
		}
		else
		{
			echo \Bitrix\Main\Web\Json::encode(array('ERROR' => 'NUMBER_ALREADY_EXISTS'));
		}
	}
	else
	{
		echo \Bitrix\Main\Web\Json::encode(array('ERROR' => 'WRONG_NUMBER'));
	}
}
else if($_POST['ACTION'] == 'deleteNumber')
{
	$dbBlacklist = Bitrix\Voximplant\BlacklistTable::getList(array(
		"filter" => array("PHONE_NUMBER" => $_POST["NUMBER"])
	));
	if ($arBlacklist = $dbBlacklist->Fetch())
	{
		Bitrix\Voximplant\BlacklistTable::delete($arBlacklist["ID"]);
	}
	echo \Bitrix\Main\Web\Json::encode(array("success" => "Y"));
}
else
{
	echo CUtil::PhpToJsObject(Array('ERROR' => 'UNKNOWN_ERROR'));
}

CMain::FinalActions();
die();