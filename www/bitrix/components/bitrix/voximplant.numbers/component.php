<?if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();
/**
 * @var $arParams array
 * @var $arResult array
 * @var $this CBitrixComponent
 * @var $APPLICATION CMain
 * @var $USER CUser
 */

if (!CModule::IncludeModule('voximplant'))
	return;

$permissions = \Bitrix\Voximplant\Security\Permissions::createWithCurrentUser();
if(!$permissions->canPerform(\Bitrix\Voximplant\Security\Permissions::ENTITY_USER, \Bitrix\Voximplant\Security\Permissions::ACTION_MODIFY))
{
	ShowError(GetMessage("COMP_VI_ACCESS_DENIED"));
	return;
}

$allowedUserIds = \Bitrix\Voximplant\Security\Helper::getAllowedUserIds(
	\Bitrix\Voximplant\Security\Helper::getCurrentUserId(),
	$permissions->getPermission(\Bitrix\Voximplant\Security\Permissions::ENTITY_USER, \Bitrix\Voximplant\Security\Permissions::ACTION_MODIFY)
);

$arResult = Array(
	"GRID_ID" => $this->__name,
	"USERS" => array(),
	"SHOW_SETTINGS" => $permissions->canPerform(\Bitrix\Voximplant\Security\Permissions::ENTITY_SETTINGS, \Bitrix\Voximplant\Security\Permissions::ACTION_MODIFY)
);

$gridOptions = new CGridOptions($arResult['GRID_ID']);
$sorting = $gridOptions->GetSorting(array("sort" => array("ID" => "DESC")));
$navParams = $gridOptions->GetNavParams();
$pageSize = $navParams['nPageSize'];

$nav = new \Bitrix\Main\UI\PageNavigation("page");
$nav->allowAllRecords(false)
	->setPageSize($pageSize)
	->initFromUri();

$arFilter = array('ACTIVE' => 'Y', '!=UF_DEPARTMENT' => false, '!=EXTERNAL_AUTH_ID' => array('replica', 'email', 'bot', 'imconnector'));
if(is_array($allowedUserIds))
{
	$arFilter['ID'] = $allowedUserIds;
}
$arParams = array(
	'FIELDS' => array('ID', 'LOGIN', 'NAME', 'SECOND_NAME', 'LAST_NAME', 'PERSONAL_PHOTO', 'WORK_POSITION'),
	'SELECT' => array("UF_PHONE_INNER", "UF_VI_BACKPHONE", "UF_VI_PHONE"),
);

$searchString = (string)$_REQUEST['FILTER'];
if($_REQUEST['act'] == 'search' && $searchString != '')
{
	$arResult['FILTER'] = $_REQUEST['FILTER'];
	$searchTokens = explode(' ', (string)$_REQUEST['FILTER']);
	foreach ($searchTokens as $searchToken)
	{
		$preparedToken = '%' . trim($searchToken) . '%';
		$arFilter[] = array(
			'LOGIC' => 'OR',
			'%=NAME' => $preparedToken,
			'%=LAST_NAME' => $preparedToken,
			'=UF_PHONE_INNER' => $searchToken
		);
	}
}

$cursor = \Bitrix\Main\UserTable::getList(array(
	'select' => array(
		'ID',
		'LOGIN',
		'NAME',
		'SECOND_NAME',
		'LAST_NAME',
		'PERSONAL_PHOTO',
		'WORK_POSITION',
		'UF_PHONE_INNER',
		'UF_VI_BACKPHONE',
		'UF_VI_PHONE'
	),
	'filter' => $arFilter,
	'order' => array('ID' => 'asc'),
	'limit' => $nav->getLimit(),
	'offset' => $nav->getOffset(),
	'count_total' => true,
));

while ($user = $cursor->fetch())
{
	$arResult['USERS'][$user['ID']] = prepareUserData($user);
}

function prepareUserData($user)
{
	$user['DETAIL_URL'] = COption::getOptionString('intranet', 'search_user_url', '/user/#ID#/');
	$user['DETAIL_URL'] = str_replace(array('#ID#', '#USER_ID#'), array($user['ID'], $user['ID']), $user['DETAIL_URL']);

	$user['PHOTO_THUMB'] = '<img src="/bitrix/components/bitrix/main.user.link/templates/.default/images/nopic_30x30.gif" border="0" alt="" width="32" height="32">';
	if (intval($user['PERSONAL_PHOTO']) > 0)
	{
		$imageFile = CFile::getFileArray($user['PERSONAL_PHOTO']);
		if ($imageFile !== false)
		{
			$arFileTmp = CFile::resizeImageGet(
				$imageFile, array('width' => 42, 'height' => 42),
				BX_RESIZE_IMAGE_EXACT, false
			);
			$user['PHOTO_THUMB'] = CFile::showImage($arFileTmp['src'], 32, 32);
		}
	}
	return $user;
}

$nav->setRecordCount($cursor->getCount());
$arResult["ROWS_COUNT"] = $cursor->getCount();
$arResult['NAV_OBJECT'] = $nav;
$arResult["SORT"] = $sorting["sort"];

$viAccount = new CVoxImplantAccount();
$arResult["VI_BETA_ACCESS"] = $viAccount->GetAccountBetaAccess() ? "Y" : "N";

$arResult['IFRAME'] = $_REQUEST['IFRAME'] === 'Y';

if (!(isset($arParams['TEMPLATE_HIDE']) && $arParams['TEMPLATE_HIDE'] == 'Y'))
	$this->IncludeComponentTemplate();

return $arResult;
