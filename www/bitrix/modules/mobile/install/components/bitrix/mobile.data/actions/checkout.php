<? if (!Defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

/**
 *
 * @var $APPLICATION CAllMain
 * @var $USER CAllUser
 * @var $params array
 */
global $APPLICATION, $USER;
use Bitrix\Main;
use Bitrix\Main\Authentication\ApplicationPasswordTable;


if ($_SERVER["REQUEST_METHOD"] == "OPTIONS")
{
	header('Access-Control-Allow-Methods: POST, OPTIONS');
	header('Access-Control-Max-Age: 60');
	header('Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept');
	die('');
}

if (!IsModuleInstalled('bitrix24'))
{
	header('Access-Control-Allow-Origin: *');
}

$data = array(
	"status" => "failed",
	"bitrix_sessid" => bitrix_sessid(),
);

$userData = CHTTP::ParseAuthRequest();
$APPLICATION->RestartBuffer();

$login = $userData["basic"]["username"];
$isAlreadyAuthorized = $USER->IsAuthorized();

if (!$isAlreadyAuthorized)
{
	if (IsModuleInstalled('bitrix24'))
	{
		header('Access-Control-Allow-Origin: *');
	}

	if ($login)
	{
		if (\Bitrix\Main\Loader::includeModule('bitrix24') && ($captchaInfo = CBitrix24::getStoredCaptcha()))
		{
			$data["captchaCode"] = $captchaInfo["captchaCode"];
			$data["captchaURL"] = $captchaInfo["captchaURL"];
		}
		elseif ($APPLICATION->NeedCAPTHAForLogin($login))
		{
			$data["captchaCode"] = $APPLICATION->CaptchaGetCode();
		}

		if (\Bitrix\Main\Loader::includeModule("security") && \Bitrix\Security\Mfa\Otp::isOtpRequired())
		{
			$data["needOtp"] = true;
		}
	}

	if (Main\Loader::includeModule('socialservices'))
	{
		$lastUserStatus = \Bitrix\Socialservices\Network::getLastUserStatus();
		if ($lastUserStatus)
		{
			if (is_array($lastUserStatus))
			{
				$data["error"] = $lastUserStatus["error"];
				$data["error_message"] = $lastUserStatus["error_message"];
			}
			else
			{
				$data["error"] = $lastUserStatus;
			}
		}
	}

	CHTTP::SetStatus("401 Unauthorized");
}
else
{
	$isExtranetModuleInstalled = (
		\Bitrix\Main\Loader::includeModule("extranet")
		&& CExtranet::GetExtranetSiteID()
	);

	$selectFields = [
		"FIELDS" => ["PERSONAL_PHOTO"]
	];

	if ($isExtranetModuleInstalled)
	{
		$selectFields["SELECT"] = ["UF_DEPARTMENT"];
	}

	$dbUser = CUser::GetList(
		($by = ["last_name" => "asc", "name" => "asc"]),
		($order = false),
		["ID" => $USER->GetID()],
		$selectFields
	);
	$curUser = $dbUser->Fetch();
	$avatarSource = "";

	if (intval($curUser["PERSONAL_PHOTO"]) > 0)
	{
		$avatar = CFile::ResizeImageGet(
			$curUser["PERSONAL_PHOTO"],
			array("width" => 64, "height" => 64),
			BX_RESIZE_IMAGE_EXACT,
			false
		);

		if ($avatar && strlen($avatar["src"]) > 0)
		{
			$avatarSource = $avatar["src"];
		}
	}

	$bExtranetUser = ($isExtranetModuleInstalled && intval($curUser["UF_DEPARTMENT"][0]) <= 0);
	\Bitrix\Main\Loader::includeModule("pull");
	if (!$bExtranetUser)
	{
		$isOpenlinesOperator = \Bitrix\Main\Loader::includeModule('im') && \Bitrix\Im\Integration\Imopenlines\User::isOperator();

		$menuTabs = [];
		$menuTabs[] = [
			"sort" => count($menuTabs)+1,
			"imageName" => "chat",
			"badgeCode" => "messages",
			"component" => [
				"name" => "JSComponentChatRecent",
				"title" => GetMessage("MD_COMPONENT_IM_RECENT"),
				"componentCode" => "im.recent",
				"scriptPath" => \Bitrix\Mobile\ComponentManager::getComponentPath("im.recent"),
				"params" => [
					"COMPONENT_CODE" => "im.recent",
					"USER_ID" => $USER->GetId(),
					"OPENLINES_USER_IS_OPERATOR" => $isOpenlinesOperator,
					"SITE_ID" => SITE_ID,
					"LANGUAGE_ID" => LANGUAGE_ID,
					"SITE_DIR" => SITE_DIR,
					"LIMIT_ONLINE" => CUser::GetSecondsForLimitOnline(),
					"IM_GENERAL_CHAT_ID" => CIMChat::GetGeneralChatId(),
					"SEARCH_MIN_SIZE" => CSQLWhere::GetMinTokenSize(),

					"WIDGET_CHAT_CREATE_VERSION" => \Bitrix\Mobile\ComponentManager::getComponentVersion('im.chat.create'),
					"WIDGET_CHAT_USERS_VERSION" => \Bitrix\Mobile\ComponentManager::getComponentVersion('im.chat.user.list'),
					"WIDGET_CHAT_RECIPIENTS_VERSION" => \Bitrix\Mobile\ComponentManager::getComponentVersion('im.chat.user.selector'),
					"WIDGET_CHAT_TRANSFER_VERSION" => \Bitrix\Mobile\ComponentManager::getComponentVersion('im.chat.transfer.selector'),
					"COMPONENT_CHAT_DIALOG_VERSION" => \Bitrix\Mobile\ComponentManager::getWebComponentVersion('im.dialog'),

					"MESSAGES" => [
						"COMPONENT_TITLE" => GetMessage("MD_COMPONENT_IM_RECENT"),
						"IMOL_CHAT_ANSWER_M" => \Bitrix\Im\Integration\Imopenlines\Localize::get(\Bitrix\Im\Integration\Imopenlines\Localize::FILE_LIB_CHAT, "IMOL_CHAT_ANSWER_M"),
						"IMOL_CHAT_ANSWER_F" => \Bitrix\Im\Integration\Imopenlines\Localize::get(\Bitrix\Im\Integration\Imopenlines\Localize::FILE_LIB_CHAT, "IMOL_CHAT_ANSWER_F")
					]
				],
				"settings" => ["useSearch" => true, "preload" => true],
			],
		];
		if ($isOpenlinesOperator)
		{
			$menuTabs[] = [
				"sort" => count($menuTabs)+1,
				"imageName" => "openlines",
				"badgeCode" => "openlines",
				"component" => [
					"name" => "JSComponentChatRecent",
					"title" => GetMessage("MD_COMPONENT_IM_OPENLINES"),
					"componentCode" => "im.openlines.recent",
					"scriptPath" => \Bitrix\Mobile\ComponentManager::getComponentPath("im.recent"), // TODO change
					"params" => [
						"COMPONENT_CODE" => "im.openlines.recent",
						"USER_ID" => $USER->GetId(),
						"OPENLINES_USER_IS_OPERATOR" => $isOpenlinesOperator,
						"SITE_ID" => SITE_ID,
						"SITE_DIR" => SITE_DIR,
						"LANGUAGE_ID" => LANGUAGE_ID,
						"LIMIT_ONLINE" => CUser::GetSecondsForLimitOnline(),
						"IM_GENERAL_CHAT_ID" => CIMChat::GetGeneralChatId(),
						"SEARCH_MIN_SIZE" => CSQLWhere::GetMinTokenSize(),

						"WIDGET_CHAT_USERS_VERSION" => \Bitrix\Mobile\ComponentManager::getComponentVersion('im.chat.user.list'),
						"WIDGET_CHAT_RECIPIENTS_VERSION" => \Bitrix\Mobile\ComponentManager::getComponentVersion('im.chat.user.selector'),
						"WIDGET_CHAT_TRANSFER_VERSION" => \Bitrix\Mobile\ComponentManager::getComponentVersion('im.chat.transfer.selector'),
						"COMPONENT_CHAT_DIALOG_VERSION" => \Bitrix\Mobile\ComponentManager::getWebComponentVersion('im.dialog'),

						"MESSAGES" => [
							"COMPONENT_TITLE" => GetMessage("MD_COMPONENT_IM_OPENLINES"),
							"IMOL_CHAT_ANSWER_M" => \Bitrix\Im\Integration\Imopenlines\Localize::get(\Bitrix\Im\Integration\Imopenlines\Localize::FILE_LIB_CHAT, "IMOL_CHAT_ANSWER_M"),
							"IMOL_CHAT_ANSWER_F" => \Bitrix\Im\Integration\Imopenlines\Localize::get(\Bitrix\Im\Integration\Imopenlines\Localize::FILE_LIB_CHAT, "IMOL_CHAT_ANSWER_F")
						]
					],
					"settings" => ["useSearch" => false, "preload" => true],
				]
			];
		}

		$menuTabs[] = [
			"sort" => count($menuTabs)+1,
			"imageName" => "stream",
			"badgeCode" => "stream",
			"page" => ["useSlidingNavBar" => false, "url" => $params["START_PAGE"] ? $params["START_PAGE"] : ""],
		];

		$menuTabs[] = [
			"sort" => count($menuTabs)+1,
			"imageName" => "bell",
			"badgeCode" => "notifications",
			"page" => ["page_id" => "notifications", "url" => "/mobile/im/notify.php"]
		];

		if (!$isOpenlinesOperator)
		{
			$menuTabs[] = [
				"sort" => count($menuTabs)+1,
				"imageName" => "task",
				"page" => ["url" => "/mobile/tasks/snmrouter/?routePage=roles"],
			];
		}
		$menuTabs[] = [
			"sort" => count($menuTabs)+1,
			"imageName" => "menu_2",
			"badgeCode" => "more",
			"component" => [
				"settings" => ["useSearch" => true],
				"name" => "JSMenuComponent",
				"title" => GetMessage("MD_COMPONENT_MORE"),
				"componentCode" => "settings",
				"scriptPath" => \Bitrix\Mobile\ComponentManager::getComponentPath("more"),
				"params" => [
					"userId" => $USER->getId(),
					"SITE_ID" => SITE_ID,
				]
			]
		];

		$voximplantServer = '';
		$voximplantLogin = '';
		$voximplantLines = [];
		$voximplantDefaultLineId = '';
		if($voximplantInstalled = Main\Loader::includeModule('voximplant'))
		{
			$viUser = new CVoxImplantUser();
			$voximplantAuthorization = $viUser->getAuthorizationInfo($USER->getId());
			if($voximplantAuthorization->isSuccess())
			{
				$voximplantAuthorizationData = $voximplantAuthorization->getData();
				$voximplantServer = $voximplantAuthorizationData['server'];
				$voximplantLogin = $voximplantAuthorizationData['login'];
			}
			$voximplantLines = CVoxImplantConfig::GetLines(true, true);
			$voximplantDefaultLineId = CVoxImplantUser::getUserOutgoingLine($USER->getId());
		}

		$events = \Bitrix\Main\EventManager::getInstance()->findEventHandlers("mobile", "onMobileTabListBuilt");
		if (count($events) > 0)
		{
			$modifiedMenuTabs = ExecuteModuleEventEx($events[0], [$menuTabs]);
			$menuTabs = $modifiedMenuTabs;
		}

		$data = [
			"status" => "success",
			"id" => $USER->GetID(),
			"name" => \CUser::FormatName(CSite::GetNameFormat(false), [
				"NAME" => $USER->GetFirstName(),
				"LAST_NAME" => $USER->GetLastName(),
				"SECOND_NAME" => $USER->GetSecondName(),
				"LOGIN" => $USER->GetLogin()
			]),
			"sessid_md5" => bitrix_sessid(),
			"target" => md5($USER->GetID() . CMain::GetServerUniqID()),
			"photoUrl" => $avatarSource,
			"wkWebViewSupported" => true,
			"tabInterfaceSupported" => true,
			"tabs" => $menuTabs,
			"services" => [
				[
					"scriptPath" => \Bitrix\Mobile\ComponentManager::getComponentPath("calls"),
					"name" => "JSComponent",
					"componentCode" => "calls",
					"params" => [
						"userId" => $USER->getId(),
						"isAdmin" => $USER->isAdmin(),
						"siteDir" => SITE_DIR,
						"voximplantInstalled" => $voximplantInstalled,
						"voximplantServer" => $voximplantServer,
						"voximplantLogin" => $voximplantLogin,
						"canPerformCalls" => $voximplantInstalled && \Bitrix\Voximplant\Security\Helper::canCurrentUserPerformCalls(),
						"lines" => $voximplantLines,
						"defaultLineId" => $voximplantDefaultLineId
					]
				],
				[
					"scriptPath" => \Bitrix\Mobile\ComponentManager::getComponentPath("communication"),
					"params" => [
						"USER_ID" => $USER->getId(),
						"SITE_ID" => SITE_ID,
						"LANGUAGE_ID" => LANGUAGE_ID,
						"PULL_CONFIG" => \Bitrix\Pull\Config::get(['JSON' => true])
					],
					"name" => "JSComponent",
					"componentCode" => "communication"
				],
				[
					"scriptPath" => \Bitrix\Mobile\ComponentManager::getComponentPath("uploader"),
					"params" => [
						"USER_ID" => $USER->getId(),
						"SITE_ID" => SITE_ID,
						"LANGUAGE_ID" => LANGUAGE_ID,
					],
					"name" => "JSComponent",
					"componentCode" => "uploader"
				]
			],
			"useModernStyle" => true,
			"appmap" => [
				"main" => ["url" => $params["START_PAGE"] ? $params["START_PAGE"] : "", "bx24ModernStyle" => true],
				"menu" => ["url" => $params["MENU_PAGE"] ? $params["MENU_PAGE"] : ""],
				"right" => ["url" => $params["CHAT_PAGE"]],
				"notification" => ["url" => "/mobile/im/notify.php"]
			]
		];
	}
	else
	{
		$rsSites = CSite::GetByID(CExtranet::GetExtranetSiteID());
		if (
			($arExtranetSite = $rsSites->Fetch())
			&& ($arExtranetSite["ACTIVE"] != "N")
		)
		{
			$data["status"] = "success";
			$data["id"] = $USER->GetID();
			$data["name"] = CUser::FormatName(CSite::GetNameFormat(false), array(
				"NAME" => $USER->GetFirstName(),
				"LAST_NAME" => $USER->GetLastName(),
				"SECOND_NAME" => $USER->GetSecondName(),
				"LOGIN" => $USER->GetLogin()
			));
			$data["sessid_md5"] = bitrix_sessid();
			$data["target"] = md5($USER->GetID() . CMain::GetServerUniqID());
			$data["photoUrl"] = $avatarSource;
			$data["wkWebViewSupported"] = true;
			$data["tabInterfaceSupported"] = false;
			$data["useModernStyle"] = true;
			$data["whiteList"] = [$arExtranetSite["DIR"] . "mobile/"];
			$data["appmap"] = [
				"main" => ["url" => $arExtranetSite["DIR"] . "mobile/index.php", "bx24ModernStyle" => true],
				"menu" => ["url" => $arExtranetSite["DIR"] . "mobile/left.php"],
				"right" => ["url" => $arExtranetSite["DIR"] . "mobile/im/right.php"]
			];
		}
	}
	$needAppPass = \Bitrix\Main\Context::getCurrent()->getServer()->get("HTTP_BX_APP_PASS");
	$appUUID = \Bitrix\Main\Context::getCurrent()->getServer()->get("HTTP_BX_APP_UUID");
	$deviceName = \Bitrix\Main\Context::getCurrent()->getServer()->get("HTTP_BX_DEVICE_NAME");

	if ($needAppPass == 'mobile' && $USER->GetParam("APPLICATION_ID") === null)
	{
		if (strlen($appUUID) > 0)
		{
			$result = ApplicationPasswordTable::getList(Array(
				'select' => Array('ID'),
				'filter' => Array(
					'USER_ID' => $USER->GetID(),
					'CODE' => $appUUID
				)
			));
			if ($row = $result->fetch())
			{
				ApplicationPasswordTable::delete($row['ID']);
			}
		}

		$password = ApplicationPasswordTable::generatePassword();

		$res = ApplicationPasswordTable::add(array(
			'USER_ID' => $USER->GetID(),
			'APPLICATION_ID' => 'mobile',
			'PASSWORD' => $password,
			'CODE' => $appUUID,
			'DATE_CREATE' => new Main\Type\DateTime(),
			'COMMENT' => GetMessage("MD_GENERATE_BY_MOBILE") . (strlen($deviceName) > 0 ? " (" . $deviceName . ")" : ""),
			'SYSCOMMENT' => GetMessage("MD_MOBILE_APPLICATION")
		));

		if ($res->isSuccess())
		{
			$data["appPassword"] = $password;
		}
	}
}

return Main\Text\Encoding::convertEncoding($data, LANG_CHARSET, 'UTF-8');
