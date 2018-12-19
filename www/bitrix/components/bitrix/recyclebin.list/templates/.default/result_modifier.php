<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

$arResult['ROWS'] = [];

use Bitrix\Tasks\Util\User;
use Bitrix\Main\Grid;
use Bitrix\Main\Localization\Loc;
use Bitrix\Bitrix24\Feature;

function prepareTaskRowUserBaloonHtml($arParams)
{
	if ($arParams['USER_ID'] == 0)
	{
		return GetMessageJS('TASKS_TEMPLATES_NO');
	}

	$users = User::getData(array($arParams['USER_ID']));
	$user = $users[$arParams['USER_ID']];

	$user['AVATAR'] = \Bitrix\Tasks\UI::getAvatar($user['PERSONAL_PHOTO'], 100, 100);
	$user['IS_EXTERNAL'] = User::isExternalUser($user['ID']);
	$user['IS_CRM'] = array_key_exists('UF_USER_CRM_ENTITY', $user) && !empty($user['UF_USER_CRM_ENTITY']);

	$arParams['USER_PROFILE_URL'] = /*$user['IS_EXTERNAL'] ? Socialnetwork\Task::addContextToURL(
		$arParams['USER_PROFILE_URL'],
		$arParams['TASK_ID']
	) : */$arParams['USER_PROFILE_URL'];

	$userIcon = '';
	if ($user['IS_EXTERNAL'])
	{
		$userIcon = 'tasks-grid-avatar-extranet';
	}
	if ($user["EXTERNAL_AUTH_ID"] == 'email')
	{
		$userIcon = 'tasks-grid-avatar-mail';
	}
	if ($user["IS_CRM"])
	{
		$userIcon = 'tasks-grid-avatar-crm';
	}

	$userAvatar = 'tasks-grid-avatar-empty';
	if ($user['AVATAR'])
	{
		$userAvatar = '';
	}

	$userName = '<span class="tasks-grid-avatar  '.$userAvatar.' '.$userIcon.'" 
			'.($user['AVATAR'] ? 'style="background-image: url(\''.$user['AVATAR'].'\')"' : '').'></span>';

	$userName .= '<span class="tasks-grid-username-inner '.
				 $userIcon.
				 '">'.
				 htmlspecialcharsbx($arParams['USER_NAME']).
				 '</span>';

	$profilePath = isset($arParams['USER_PROFILE_URL']) ? $arParams['USER_PROFILE_URL'] : '';

	return '<div class="tasks-grid-username-wrapper"><a href="'.
		   htmlspecialcharsbx($profilePath).
		   '" class="tasks-grid-username">'.
		   $userName.
		   '</a></div>';
}

function prepareActionsColumn($row, $arParams)
{
	$list = [];

	if(\CModule::IncludeModule('bitrix24'))
	{
		if (Feature::isFeatureEnabled("recyclebin"))
		{
			$restoreAction = 'BX.Recyclebin.List.restore('.(int)$row['ID'].', "'.$row['ENTITY_TYPE'].'")';
		}
		else
		{
			$restoreAction = 'BX.Bitrix24.LicenseInfoPopup.show("recyclebin", "'.
							 Loc::getMessage('RECYCLEBIN_LICENSE_POPUP_TITLE').
							 '", "'.
							 GetMessageJS('RECYCLEBIN_LICENSE_POPUP_TEXT').
							 '");';
		}
	}
	else
	{
		$restoreAction = 'BX.Recyclebin.List.restore('.(int)$row['ID'].', "'.$row['ENTITY_TYPE'].'")';
	}

	$list[] = [
		"text"    => GetMessageJS('RECYCLEBIN_CONTEXT_MENU_TITLE_RESTORE'),
		'onclick' => $restoreAction,
	];

	$list[] = [
		"text"    => GetMessageJS('RECYCLEBIN_CONTEXT_MENU_TITLE_REMOVE'),
		'onclick' => 'BX.Recyclebin.List.remove('.(int)$row['ID'].', "' .$row['ENTITY_TYPE']. '")',
	];

	return $list;
}


function prepareGroupActions($arResult, $arParams)
{
	if(\CModule::IncludeModule('bitrix24'))
	{
		if (Feature::isFeatureEnabled("recyclebin"))
		{
			$restoreAction = 'BX.Recyclebin.List.restoreBatch();';
		}
		else
		{
			$restoreAction = 'BX.Bitrix24.LicenseInfoPopup.show("recyclebin", "'.
							 Loc::getMessage('RECYCLEBIN_LICENSE_POPUP_TITLE').
							 '", "'.
							 GetMessageJS('RECYCLEBIN_LICENSE_POPUP_TEXT').
							 '");';
		}
	}
	else
	{
		$restoreAction = 'BX.Recyclebin.List.restoreBatch();';
	}

	$groupActions = array(
		'GROUPS' => array(
			array(
				'ITEMS' => array(
					[
						"TYPE" => \Bitrix\Main\Grid\Panel\Types::BUTTON,
						"TEXT" => GetMessage("RECYCLEBIN_GROUP_ACTIONS_RESTORE"),
						"VALUE" => "restore",
						"ONCHANGE" => array(
							array(
								"ACTION" => Bitrix\Main\Grid\Panel\Actions::CALLBACK,
								"DATA" => array(array('JS' => $restoreAction))
							)
						)
					],
					[
						"TYPE" => \Bitrix\Main\Grid\Panel\Types::BUTTON,
						"TEXT" => GetMessage("RECYCLEBIN_GROUP_ACTIONS_DELETE"),
						"VALUE" => "delete",
						"ONCHANGE" => array(
							array(
								"ACTION" => Bitrix\Main\Grid\Panel\Actions::CALLBACK,
								"DATA" => array(array('JS' => "BX.Recyclebin.List.removeBatch();"))
							)
						)
					],
					//\Bitrix\Recyclebin\Internals\User::isSuper() ? $snippet->getForAllCheckbox() : null
				)
			)
		)
	);

	return $groupActions;
}



function getDateTimeFormat()
{
	if(defined('FORMAT_DATETIME'))
	{
		$format = FORMAT_DATETIME;
	}
	else
	{
		$format = \CSite::GetDateFormat("FULL");
	}

	return $GLOBALS['DB']->DateFormatToPHP($format); // have to make php format from site format
}

function formatDateTime($stamp, $format = false)
{
	$simple = false;

	// accept also FORMAT_DATE and FORMAT_DATETIME as ones of the legal formats
	if((defined('FORMAT_DATE') && $format == FORMAT_DATE) || (defined('FORMAT_DATETIME') && $format == FORMAT_DATETIME))
	{
		$format = $GLOBALS['DB']->dateFormatToPHP($format);
		$simple = true;
	}

	$default = getDateTimeFormat();
	if($format === false)
	{
		$format = $default;
		$simple = true;
	}

	if($simple)
	{
		// its a simple format, we can use a simpler function
		return date($format, $stamp);
	}
	else
	{
		return \FormatDate($format, $stamp);
	}
}

function formatDateRecycle($date)
{
	$curTimeFormat = "HH:MI:SS";
	$format = 'j F';
	if (LANGUAGE_ID == "en")
	{
		$format = "F j";
	}
	if (LANGUAGE_ID == "de")
	{
		$format = "j. F";
	}

	if (date('Y') != date('Y', strtotime($date)))
	{
		if (LANGUAGE_ID == "en")
		{
			$format .= ",";
		}

		$format .= ' Y';
	}

	$rsSite = CSite::GetByID(SITE_ID);
	if ($arSite = $rsSite->Fetch())
	{
		$curDateFormat = $arSite["FORMAT_DATE"];
		$curTimeFormat = str_replace($curDateFormat." ", "", $arSite["FORMAT_DATETIME"]);
	}

	if ($curTimeFormat == "HH:MI:SS")
	{
		$currentDateTimeFormat = " G:i";
	}
	else //($curTimeFormat == "H:MI:SS TT")
	{
		$currentDateTimeFormat = " g:i a";
	}

	if (date('Hi', strtotime($date)) > 0)
	{
		$format .= ', '.$currentDateTimeFormat;
	}

	$str = formatDateTime(MakeTimeStamp($date),$format);

	return $str;
}

if (!empty($arResult['GRID']['DATA']))
{
	$users = [];
	foreach ($arResult['GRID']['DATA'] as $row)
	{
		$users[] = $row['USER_ID'];
	}
	$users = \Bitrix\Tasks\Util\User::getUserName(array_unique($users));

	foreach ($arResult['GRID']['DATA'] as $row)
	{
		$userUrl = CComponentEngine::MakePathFromTemplate(
			$arParams['PATH_TO_USER_PROFILE'],
			array("user_id" => $row["USER_ID"])
		);

		$arResult['ROWS'][] = [
			"id"      => $row["ID"],
			'actions' => prepareActionsColumn($row, $arParams),
			'columns' => [
				'ID'          => $row['ID'],
				'ENTITY_ID'   => $row['ENTITY_ID'],
				'ENTITY_TYPE' => $arResult['ENTITY_TYPES'][$row['ENTITY_TYPE']],
				'NAME'        => htmlspecialcharsbx($row['NAME']),
				'MODULE_ID'   => $arResult['MODULES_LIST'][$row['MODULE_ID']],
				'TIMESTAMP'   => formatDateRecycle($row['TIMESTAMP']),
				'USER_ID'     => prepareTaskRowUserBaloonHtml(
					array(
						'PREFIX'           => 'RECYCLEBIN_USER_'.$row['ID'],
						'USER_NAME'        => $users[$row['USER_ID']],
						'USER_PROFILE_URL' => $userUrl,
						'USER_ID'          => $row['USER_ID']
					)
				),
			]
		];
	}
}
$arResult['GROUP_ACTIONS'] = prepareGroupActions($arResult, $arParams);