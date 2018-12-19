<?

use Bitrix\Main\Application;

if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

global $USER, $CACHE_MANAGER;

CModule::IncludeModule("mobile");
CModule::IncludeModule("mobileapp");

function sortMenu($item, $anotherItem)
{
	$itemSort = (array_key_exists("sort", $item) ? $item["sort"] : 100);
	$anotherSort = (array_key_exists("sort", $anotherItem) ? $anotherItem["sort"] : 100);
	if ($itemSort > $anotherSort)
	{
		return 1;
	}

	if ($itemSort == $anotherSort)
	{
		return 0;
	}

	return -1;
}

$USER_ID = $USER->GetID();
$arResult = [];
$ttl = (defined("BX_COMP_MANAGED_CACHE") ? 2592000 : 600);
$extEnabled = IsModuleInstalled('extranet');
$menuSavedModificationTime= \Bitrix\Main\Config\Option::get("mobile","jscomponent.menu.date.modified", 0);
$menuFile = new \Bitrix\Main\IO\File(Application::getDocumentRoot().$this->jsComponentPath."/.mobile_menu.php");
$menuModificationTime = $menuFile->getModificationTime();
$cacheIsActual = ($menuModificationTime == $menuSavedModificationTime);
if(!$cacheIsActual)
{
	$CACHE_MANAGER->ClearByTag('mobile_custom_menu');
	\Bitrix\Main\Config\Option::set("mobile","jscomponent.menu.date.modified", $menuModificationTime);
}

$cache_id = 'user_mobile_menu__' . $USER_ID . '_' . $extEnabled . '_' . LANGUAGE_ID . '_' . CSite::GetNameFormat(false);
$cache_dir = '/bx/mobile_menu_js/user_' . $USER_ID;
$obCache = new CPHPCache;
$userId = $USER->getId();
if ($obCache->InitCache($ttl, $cache_id, $cache_dir))
{
	$arResult = $obCache->GetVars();
}
else
{
	$CACHE_MANAGER->StartTagCache($cache_dir);
	$arResult["menu"] = include(".mobile_menu.php");
	$host = Bitrix\Main\Context::getCurrent()->getServer()->getHttpHost();
	$host = preg_replace("/:(80|443)$/", "", $host);
	$arResult["host"] = htmlspecialcharsbx($host);
	$user = $USER->GetByID($USER_ID)->Fetch();
	$arResult["user"] = $user;
	$arResult["user"]["fullName"] = CUser::FormatName(CSite::GetNameFormat(false), $user);
	$arResult["user"]["avatar"] = "";

	if ($user["PERSONAL_PHOTO"])
	{
		$imageFile = CFile::GetFileArray($user["PERSONAL_PHOTO"]);
		if ($imageFile !== false)
		{
			$avatar = CFile::ResizeImageGet($imageFile, ["width" => 150, "height" => 150], BX_RESIZE_IMAGE_EXACT, false, false, false, 50);
			$arResult["user"]["avatar"] = $avatar["src"];
		}
	}

	$CACHE_MANAGER->RegisterTag('sonet_group');
	$CACHE_MANAGER->RegisterTag('USER_CARD_' . intval($USER_ID / TAGGED_user_card_size));
	$CACHE_MANAGER->RegisterTag('sonet_user2group_U' . $USER_ID);
	$CACHE_MANAGER->RegisterTag('mobile_custom_menu');
	$CACHE_MANAGER->RegisterTag('crm_change_role');
	$CACHE_MANAGER->EndTagCache();

	if ($obCache->StartDataCache())
	{
		$obCache->EndDataCache($arResult);
	}
}

$events = \Bitrix\Main\EventManager::getInstance()->findEventHandlers("mobile", "onMobileMenuStructureBuilt");
if (count($events) > 0)
{
	$menu = ExecuteModuleEventEx($events[0], [$arResult["menu"]]);
	$arResult["menu"] = $menu;
}

$editProfilePath = \Bitrix\Mobile\ComponentManager::getComponentPath("user.profile");
$workPosition = $arResult["user"]["WORK_POSITION"];
$apiVersion = Bitrix\MobileApp\Mobile::getApiVersion();
$arResult["menu"][] = [
	"title" => "",
	"sort" => 0,
	"items" => [
		[
			"title" => $arResult["user"]["fullName"],
			"imageUrl" => $arResult["user"]["avatar"],
			"type"=>"userinfo",
			"color"=>'#404f5d',
			"styles"=>[
				"subtitle"=>[
					"image"=>[
						"useTemplateRender"=>true
					],
					"additionalImage"=>[
						"name"=>"pencil",
						"useTemplateRender"=>true
					]
				]
			],
			"useLetterImage"=>true,
			"subtitle" => $apiVersion < 27?GetMessage("MENU_VIEW_PROFILE"):GetMessage("MENU_EDIT_PROFILE"),
			"params" => [
				"url" => SITE_DIR . "mobile/users/?ID=".$userId,
				"onclick" => <<<JS
						if(Application.getApiVersion() < 27)
						{
							PageManager.openPage({url:this.params.url});
						}
						else
						{
							let imageUrl =  this.imageUrl? this.imageUrl: "";
							let top = {
										imageUrl: imageUrl,
										value: imageUrl,
										title: this.title,
										subtitle: "$workPosition",
										sectionCode: "top",
										height: 160,
										type:"userpic",
										useLetterImage:true,
										color:"#2e455a"
							};
							
							PageManager.openComponent("JSStackComponent", 
							{
								scriptPath:"$editProfilePath",
								componentCode: "profile.view",
								params: {
									"userId": $userId,
									mode:"edit",
									items:[
											top,
											{ type:"loading", sectionCode:"1", title:""}
										],
										sections:[
											{id: "top", backgroundColor:"#f0f0f0"},
											{id: "1", backgroundColor:"#f0f0f0"},
										]
								},
								rootWidget:{
									name:"form",
									settings:{
										objectName:"form",
										items:[
											{"id":"PERSONAL_PHOTO", useLetterImage:true, color:"#ffc11e", imageUrl: this.imageUrl, type:"userpic", title:"test", sectionCode:"0"},
											{ type:"loading", sectionCode:"1", title:""}
										],
										sections:[
											{id: "0", backgroundColor:"#f0f0f0"},
											{id: "1", backgroundColor:"#f0f0f0"},
										],
										groupStyle: true,
										title: this.title
									}
								}
							});
						}
						
JS

			]
		]
	]
];

$counterList = [];

usort($arResult["menu"], 'sortMenu');

array_walk($arResult["menu"], function (&$section) use (&$counterList)
{
	array_walk($section["items"], function(&$item) use (&$counterList, $section)
	{
		$item["sectionCode"] = "section_".$section["sort"];
		if ($item["attrs"])
		{
			$item["params"] = $item["attrs"];
			unset($item["attrs"]);
		}
		else if(!$item["params"])
		{
			$item["params"] = [];
		}

		unset($item["attrs"]);

		if($item["params"]["counter"] && !in_array($item["params"]["counter"],$counterList))
			$counterList[] = $item["params"]["counter"];

		if ($item["type"] != "destruct" && $item["type"] != "button")
		{
			if(!$item["styles"])
			{
				$item["styles"] = [];
			}

			$item["styles"]["title"] = ["color" => "#FF4E5665"];

			if ($item["type"] != "userinfo")
			{
				$item["height"] = 60;
			}
		}

	});
});



$arResult["counterList"] = $counterList;



unset($obCache);

return $arResult;