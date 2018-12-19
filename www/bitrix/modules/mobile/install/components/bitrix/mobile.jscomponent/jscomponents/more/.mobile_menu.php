<?php

use Bitrix\Main\Localization\Loc;
use Bitrix\Main;

if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

global $USER;

/**
 * @var CUser $USER
 * @var MobileJSComponent $this
 */

$allowedFeatures = [];
$hereDocGetMessage = function ($code) {
	return Loc::getMessage($code);
};
if (CModule::IncludeModule("socialnetwork"))
{
	$arUserActiveFeatures = CSocNetFeatures::getActiveFeatures(SONET_ENTITY_USER, $USER->getId());
	$arSocNetFeaturesSettings = CSocNetAllowed::getAllowedFeatures();
	$allowedFeatures = [];
	foreach (["tasks", "files", "calendar"] as $feature)
	{
		if (in_array($feature, ['calendar']))
		{
			$allowedFeatures[$feature] =
				array_key_exists($feature, $arSocNetFeaturesSettings) &&
				array_key_exists("allowed", $arSocNetFeaturesSettings[$feature]) &&
				(
					(
						in_array(SONET_ENTITY_USER, $arSocNetFeaturesSettings[$feature]["allowed"]) &&
						is_array($arUserActiveFeatures) &&
						in_array($feature, $arUserActiveFeatures)
					)
					|| in_array(SONET_ENTITY_GROUP, $arSocNetFeaturesSettings[$feature]["allowed"])
				);
		}
		else
		{
			$allowedFeatures[$feature] =
				array_key_exists($feature, $arSocNetFeaturesSettings) &&
				array_key_exists("allowed", $arSocNetFeaturesSettings[$feature]) &&
				in_array(SONET_ENTITY_USER, $arSocNetFeaturesSettings[$feature]["allowed"]) &&
				is_array($arUserActiveFeatures) &&
				in_array($feature, $arUserActiveFeatures);
		}
	}
}

$isExtranetUser = (CModule::IncludeModule("extranet") && CExtranet::IsExtranetSite());
$diskEnabled = \Bitrix\Main\Config\Option::get('disk', 'successfully_converted', false) && CModule::includeModule('disk');
$userId = $USER->getId();
$siteDir = SITE_DIR;
$imageDir = $this->jsComponentPath . "/images/";
$canInviteUsers = (IsModuleInstalled("bitrix24") && $USER->CanDoOperation('bitrix24_invite')) ? "1" : "0";
$userComponentPath = \Bitrix\Mobile\ComponentManager::getComponentPath("users");

$menuStructure = [
	[
		"title" => Loc::getMessage("MB_SEC_FAVORITE"),
		"hidden" => false,
		"sort" => 100,
		"items" => [
			[
				"title" => Loc::getMessage("MB_TASKS_MAIN_MENU_ITEM"),
				"imageUrl" => $imageDir . "favorite/icon-tasks.png",
				"color" => "#fabb3f",
				"actions" => [
					[
						"title" => Loc::getMessage("MORE_ADD"),
						"identifier" => "add",
						"color" => "#7CB316"
					]
				],
				"attrs" => [
					"actionOnclick" => <<<JS
						PageManager.openPage({url:"/mobile/tasks/snmrouter/?routePage=edit&USER_ID="+$userId+"&TASK_ID=0", cache:false, modal:true, data:{ modal:"Y"}});
JS
					, "url" => SITE_DIR . "mobile/tasks/snmrouter/?routePage=roles",

					"id" => "tasks_list",
					"counter" => "tasks_total",
				],
				"counter" => [
					"id" => "menu-counter-tasks_total",
				],
				"hidden" => !(\Bitrix\Main\ModuleManager::isModuleInstalled('tasks') && $allowedFeatures["tasks"]),

			],
			[
				"title" => Loc::getMessage("MB_BP_MAIN_MENU_ITEM"),
				"imageUrl" => $imageDir . "favorite/icon-bp.png",
				"color" => "#33c3bd",
				"attrs" => [
					"url" => SITE_DIR . "mobile/bp/?USER_STATUS=0",
					"id" => "bp_list",
					"counter" => "bp_tasks",
				],
				"hidden" => ($isExtranetUser || !\Bitrix\Main\ModuleManager::isModuleInstalled("bizproc")),

			],
			[
				"title" => Loc::getMessage("MB_CALENDAR_LIST"),
				"imageUrl" => $imageDir . "favorite/icon-calendar.png",
				"color" => "#fe94af",
				"actions" => [
					[
						"title" => Loc::getMessage("MORE_ADD"),
						"identifier" => "add",
						"color" => "#7CB316"
					]
				],
				"attrs" => [
					"actionOnclick" => <<<JS
						PageManager.openPage({url:"/mobile/calendar/edit_event.php", modal:true, data:{ modal:"Y"}});
JS

					, "onclick" => <<<JS
						PageManager.openList(
						{
							url:"/mobile/?mobile_action=calendar&user_id="+$userId,
							table_id:"calendar_list",
							table_settings: 
							{
								showTitle:"YES",
								name:"{$hereDocGetMessage("MB_CALENDAR_LIST")}",
								useTagsInSearch:"NO",
								button:{
									type: 'plus',
									eventName:"onCalendarEventAddButtonPushed"
								}
							}
						});

						if(typeof calendarEventAttached == "undefined")
						{
							calendarEventAttached = true;
							BX.addCustomEvent("onCalendarEventAddButtonPushed", ()=>{
								PageManager.openPage({url:"/mobile/calendar/edit_event.php", modal:true, data:{ modal:"Y"}});
							});
						}
						

JS
				],

				"hidden" => !(\Bitrix\Main\ModuleManager::isModuleInstalled('calendar') && $allowedFeatures["calendar"]),
			],
			[
				"title" => Loc::getMessage("MB_CURRENT_USER_FILES_MAIN_MENU_ITEM_NEW"),
				"imageUrl" => $imageDir . "favorite/icon-mydisk.png",
				"color" => "#5db2d9",
				"attrs" => [
					"onclick" => <<<JS
					
						PageManager.openList(
						{
							url:"/mobile/?mobile_action=disk_folder_list&type=user&path=/&entityId="+$userId,
							
							table_settings: 
							{
								showTitle:"YES",
								name: "{$hereDocGetMessage("MB_CURRENT_USER_FILES_MAIN_MENU_ITEM_NEW")}",
								useTagsInSearch:"NO",
								type:"files",
							}
						});
JS
					, "id" => "doc_user"
				],
				"hidden" => !$diskEnabled || !$allowedFeatures["files"],
				"id" => "doc_user",

			],
			[
				"title" => Loc::getMessage("MB_CURRENT_USER_FILES_MAIN_MENU_ITEM_NEW"),
				"imageUrl" => $imageDir . "favorite/icon-mydisk.png",
				"color" => "#5db2d9",
				"attrs" => [
					"url" => '/mobile/?mobile_action=disk_folder_list&type=user&path=/&entityId=' . $USER->GetID(),
					"table_settings" => [
						"useTagsInSearch" => "NO",
						"type" => "files"
					],
					"_type" => "list",
					"id" => "doc_user",
				],
				"hidden" => $diskEnabled || !$allowedFeatures["files"],
			],
			[
				"imageUrl" => $imageDir . "favorite/icon-users.png",
				"color" => "#bfa86a",
				"title" => Loc::getMessage($isExtranetUser ? "MB_CONTACTS" : "MB_COMPANY"),
				"attrs" => [
					"onclick" => <<<JS
						if(Application.getApiVersion() >= 22)
						{
							PageManager.openComponent(
							"JSComponentList", 
							{
								title:"{$hereDocGetMessage($isExtranetUser ? "MB_CONTACTS" : "MB_COMPANY")}", 
								settings:{useSearch:true}, 
								scriptPath:"$userComponentPath",
								params:{
									canInvite: {$canInviteUsers},
									userId:{$userId}
								}
							});
						}
						else
						{
							PageManager.openList({
								url:"/mobile/?mobile_action=get_user_list&tags=Y&detail_url=/mobile/users/?user_id=",
								table_settings: {
									showTitle:"YES",
									name:"{$hereDocGetMessage($isExtranetUser ? "MB_CONTACTS" : "MB_COMPANY")}",
									type:"users",
									alphabet_index: "YES",
									outsection: "NO"
								}
							});
						}

						
JS
				],

			],
			[
				"imageUrl" => $imageDir . "favorite/icon-disk.png",
				"color" => "#b9bdc3",
				"title" => Loc::getMessage("MB_SHARED_FILES_MAIN_MENU_ITEM_NEW"),
				"attrs" => [
					"onclick" => <<<JS
					
						PageManager.openList(
						{
							url:"/mobile/?mobile_action=disk_folder_list&type=common&path=/&entityId=shared_files_s1",
							table_settings: 
							{
								name:"{$hereDocGetMessage("MB_SHARED_FILES_MAIN_MENU_ITEM_NEW")}",
								showTitle:"YES",
								useTagsInSearch:"NO",
								type:"files",
							}
						});
JS
					, "id" => "doc_shared"
				],
				"hidden" => !$diskEnabled || $isExtranetUser || !$allowedFeatures["files"],


			],
			[
				"title" => Loc::getMessage("MB_SHARED_FILES_MAIN_MENU_ITEM_NEW"),
				"imageUrl" => $imageDir . "favorite/icon-disk.png",
				"color" => "#b9bdc3",
				"attrs" => [
					"onclick" => <<<JS
					
						PageManager.openList(
						{
							url:"/mobile/?mobile_action=disk_folder_list&type=common&path=/&entityId=shared_files_s1",
							table_settings: 
							{
								useTagsInSearch:"NO",
								type:"files",
							}
						});
JS
					, "id" => "doc_shared"
				],
				"hidden" => $diskEnabled || $isExtranetUser || !$allowedFeatures["files"],


			],
		]
	]
];

/**
 * Marketplace apps
 */

if (CModule::IncludeModule("rest"))
{
	$arMenuApps = [];
	$arUserGroupCode = $USER->GetAccessCodes();
	$numLocalApps = 0;

	$dbApps = \Bitrix\Rest\AppTable::getList([
		'order' => ["ID" => "ASC"],
		'filter' => [
			"=ACTIVE" => \Bitrix\Rest\AppTable::ACTIVE,
			"=MOBILE" => \Bitrix\Rest\AppTable::ACTIVE
		],
		'select' => [
			'ID', 'STATUS', 'ACCESS', 'MENU_NAME' => 'LANG.MENU_NAME', 'MENU_NAME_DEFAULT' => 'LANG_DEFAULT.MENU_NAME', 'MENU_NAME_LICENSE' => 'LANG_LICENSE.MENU_NAME'
		]
	]);

	while ($arApp = $dbApps->fetch())
	{
		if ($arApp["STATUS"] == \Bitrix\Rest\AppTable::STATUS_LOCAL)
		{
			$numLocalApps++;
		}

		$lang = in_array(LANGUAGE_ID, ["ru", "en", "de"]) ? LANGUAGE_ID : LangSubst(LANGUAGE_ID);
		if (strlen($arApp["MENU_NAME"]) > 0 || strlen($arApp['MENU_NAME_DEFAULT']) > 0 || strlen($arApp['MENU_NAME_LICENSE']) > 0)
		{
			$appRightAvailable = false;
			if (\CRestUtil::isAdmin())
			{
				$appRightAvailable = true;
			}
			elseif (!empty($arApp["ACCESS"]))
			{
				$rights = explode(",", $arApp["ACCESS"]);
				foreach ($rights as $rightID)
				{
					if (in_array($rightID, $arUserGroupCode))
					{
						$appRightAvailable = true;
						break;
					}
				}
			}
			else
			{
				$appRightAvailable = true;
			}

			if ($appRightAvailable)
			{
				$appName = $arApp["MENU_NAME"];

				if (strlen($appName) <= 0)
				{
					$appName = $arApp['MENU_NAME_DEFAULT'];
				}
				if (strlen($appName) <= 0)
				{
					$appName = $arApp['MENU_NAME_LICENSE'];
				}

				$arMenuApps[] = [
					"title" => $appName,
					"attrs" => [
						"id" => $arApp["ID"],
						"data-mp-app-id" => $arApp["ID"],
						"data-mp-app" => "Y",
						"data-mp-app-name" => $appName,
						"url" => "/mobile/marketplace/?id=" . $arApp["ID"],
					]
				];
			}
		}
	}

	if (count($arMenuApps) > 0)
	{
		$menuStructure[] = [
			"title" => Loc::getMessage("MB_MARKETPLACE_GROUP_TITLE"),
			"sort" => 110,
			"hidden" => CMobile::getInstance()->getApiVersion() <= 15,
			"items" => $arMenuApps
		];
	}
}

/**
 * CRM menu
 */

if (
	!$bExtranet
	&& IsModuleInstalled('crm')
	&& CModule::IncludeModule('crm')
	&& CCrmPerms::IsAccessEnabled()
)
{
	$userPerms = CCrmPerms::GetCurrentUserPermissions();
	$crmImageBackgroundColor = "#8590a2";
	$menuStructure[] = [
		"title" => "CRM",
		"sort" => 120,
		"hidden" => false,
		"items" => [
			[
				"title" => Loc::getMessage("MB_CRM_ACTIVITY"),
				"imageUrl" => $imageDir . "crm/icon-crm-mydeals.png",
				"color" => $crmImageBackgroundColor,
				"hidden" => false,
				"attrs" => [
					"url" => "/mobile/crm/activity/list.php",
					"id" => "crm_activity_list",
				],
			],
			[
				"title" => Loc::getMessage("MB_CRM_CONTACT"),
				"imageUrl" => $imageDir . "crm/icon-crm-contact.png",
				"color" => $crmImageBackgroundColor,
				"hidden" => $userPerms->HavePerm('CONTACT', BX_CRM_PERM_NONE, 'READ'),
				"attrs" => [
					"url" => "/mobile/crm/contact/",
					"id" => "crm_contact_list",
				],

			],
			[
				"title" => Loc::getMessage("MB_CRM_COMPANY"),
				"imageUrl" => $imageDir . "crm/icon-crm-company.png",
				"color" => $crmImageBackgroundColor,
				"hidden" => $userPerms->HavePerm('COMPANY', BX_CRM_PERM_NONE, 'READ'),
				"attrs" => [
					"url" => "/mobile/crm/company/",
					"id" => "crm_company_list",
				],

			],
			[
				"title" => Loc::getMessage("MB_CRM_DEAL"),
				"imageUrl" => $imageDir . "crm/icon-crm-deal.png",
				"color" => $crmImageBackgroundColor,
				"hidden" =>  !\CAllCrmDeal::IsAccessEnabled(),
				"attrs" => [
					"url" => "/mobile/crm/deal/",
					"id" => "crm_deal_list",
				],

			],
			[
				"title" => Loc::getMessage("MB_CRM_INVOICE"),
				"imageUrl" => $imageDir . "crm/icon-crm-invoice.png",
				"color" => $crmImageBackgroundColor,
				"hidden" => $userPerms->HavePerm('INVOICE', BX_CRM_PERM_NONE, 'READ'),
				"attrs" => [
					"url" => "/mobile/crm/invoice/",
					"id" => "crm_invoice_list",
				],

			],
			[
				"title" => Loc::getMessage("MB_CRM_QUOTE"),
				"imageUrl" => $imageDir . "crm/icon-crm-quote.png",
				"color" => $crmImageBackgroundColor,
				"hidden" => $userPerms->HavePerm('QUOTE', BX_CRM_PERM_NONE, 'READ'),
				"attrs" => [
					"url" => "/mobile/crm/quote/",
					"id" => "crm_quote_list",
				],

			],
			[
				"title" => Loc::getMessage("MB_CRM_LEAD"),
				"imageUrl" => $imageDir . "crm/icon-crm-lead.png",
				"color" => $crmImageBackgroundColor,
				"hidden" => $userPerms->HavePerm('LEAD', BX_CRM_PERM_NONE, 'READ'),
				"attrs" => [
					"url" => "/mobile/crm/lead/",
					"id" => "crm_lead_list",
				],

			],
			[
				"title" => Loc::getMessage("MB_CRM_PRODUCT"),
				"imageUrl" => $imageDir . "crm/icon-crm-catalog.png",
				"color" => $crmImageBackgroundColor,
				"hidden" => !$userPerms->HavePerm('CONFIG', BX_CRM_PERM_CONFIG, 'READ'),
				"attrs" => [
					"url" => "/mobile/crm/product/",
					"id" => "crm_product_list",
				],

			],
		]
	];
}


/**
 * Groups
 */

$groups = [];
$extranetGroups = [];
if (CModule::IncludeModule("socialnetwork"))
{
	$strGroupSubjectLinkTemplate = SITE_DIR . "mobile/log/?group_id=#group_id#";
	$extGroupID = [];
	$arGroupFilterMy = [
		"USER_ID" => $USER->GetID(),
		"<=ROLE" => SONET_ROLES_USER,
		"GROUP_ACTIVE" => "Y",
		"!GROUP_CLOSED" => "Y",
	];

	// Extranet group
	if (CModule::IncludeModule("extranet") && !CExtranet::IsExtranetSite())
	{
		$arGroupFilterMy["GROUP_SITE_ID"] = CExtranet::GetExtranetSiteID();
		$dbGroups = CSocNetUserToGroup::GetList(
			["GROUP_NAME" => "ASC"],
			$arGroupFilterMy,
			false,
			false,
			['ID', 'GROUP_ID', 'GROUP_NAME', 'GROUP_SITE_ID', 'GROUP_IMAGE_ID']
		);
		$arExtSGGroupTmp = [];
		while ($arGroups = $dbGroups->GetNext())
		{

			if ($arGroups["GROUP_IMAGE_ID"])
			{
				$imageFile = CFile::GetFileArray($arGroups["GROUP_IMAGE_ID"]);
				if ($imageFile !== false)
				{
					$arFileTmp = CFile::ResizeImageGet(
						$imageFile,
						[
							"width" => 64,
							"height" => 64
						],
						BX_RESIZE_IMAGE_PROPORTIONAL,
						false
					);
					$arGroups["IMAGE"] = $arFileTmp["src"];
				}
			}

			$arExtSGGroupTmp[$arGroups["GROUP_ID"]] = [
				"title" => $arGroups["GROUP_NAME"],
				"imageUrl" => $arGroups["IMAGE"],
				"useLetterImage" => true,
				"color"=>"#40465A",
				"params" => [

					"url" => str_replace("#group_id#", $arGroups["GROUP_ID"], $strGroupSubjectLinkTemplate),
					"data-modern-style" => "Y"
				],
				"counter" => [
					"id" => "SG" . $arGroups["GROUP_ID"]
				]
			];

			$extGroupID[] = $arGroups["GROUP_ID"];
		}
	}

	$arGroupIDCurrentSite = [];

	// Socialnetwork
	$arGroupFilterMy["GROUP_SITE_ID"] = SITE_ID;
	$dbGroups = CSocNetUserToGroup::GetList(
		["GROUP_NAME" => "ASC"],
		$arGroupFilterMy,
		false,
		false,
		['ID', 'GROUP_ID', 'GROUP_NAME', 'GROUP_SITE_ID', 'GROUP_IMAGE_ID']
	);

	while ($arGroups = $dbGroups->GetNext())
	{
		$arGroupIDCurrentSite[] = $arGroups['GROUP_ID'];

		if (in_array($arGroups['GROUP_ID'], $extGroupID))
		{
			continue;
		}

		if ($arGroups["GROUP_IMAGE_ID"])
		{
			$imageFile = CFile::GetFileArray($arGroups["GROUP_IMAGE_ID"]);
			if ($imageFile !== false)
			{
				$arFileTmp = CFile::ResizeImageGet(
					$imageFile,
					["width" => 64, "height" => 64],
					BX_RESIZE_IMAGE_PROPORTIONAL,
					false
				);
				$arGroups["IMAGE"] = $arFileTmp["src"];
			}
		}

		$groups[] = [
			"title" => $arGroups["GROUP_NAME"],
			"imageUrl" => $arGroups["IMAGE"],
			"useLetterImage" => true,
			"color"=>"#40465A",
			"params" => [

				"url" => str_replace("#group_id#", $arGroups["GROUP_ID"], $strGroupSubjectLinkTemplate),
				"data-modern-style" => "Y"
			],
			"counter" => [
				"id" => "SG" . $arGroups["GROUP_ID"]
			]
		];
	}

	foreach ($arExtSGGroupTmp as $groupID => $arGroupItem)
	{
		if (in_array($groupID, $arGroupIDCurrentSite))
		{
			$extranetGroups[] = $arGroupItem;
		}
	}
}


if (!empty($groups) || !empty($extranetGroups))
{
	$groupSection = [
		"title" => Loc::getMessage("MB_SEC_GROUPS"),
		"sort" => 130,
		"hidden" => false,
		"items" => [],
	];

	if (!empty($groups))
	{
		$groupSection["items"][] = [
			"title" => Loc::getMessage("MENU_INTRANET"),
			"type" => "group",
			"params" => ["items" => $groups]

		];
	}
	if (!empty($extranetGroups))
	{
		$groupSection["items"][] = [
			"title" => Loc::getMessage("MENU_EXTRANET"),
			"type" => "group",
			"params" => ["items" => $extranetGroups]
		];
	}

	$menuStructure[] = $groupSection;


}

$menuStructure[] = [
	"title" => GetMessage("MENU_WORK_DAY"),
	"sort" => 2,
	"hidden" => ($bExtranet || !IsModuleInstalled("timeman")),
	"items" => [
		[
			"title" => Loc::getMessage("MENU_WORK_DAY_MANAGE"),
			"imageUrl" => $imageDir . "favorite/icon-timeman.png",
			"color" => "#67dec5",
			"params" => [
				"url" => SITE_DIR . "mobile/timeman/"
			],
		]
	]
];

$voximplantInstalled = false;
if ($voximplantInstalled = Main\Loader::includeModule('voximplant'))
{
	$menuStructure[] = [
		"title" => GetMessage("MENU_TELEPHONY"),
		"min_api_version" => 22,
		"hidden" => !\Bitrix\Voximplant\Security\Helper::canCurrentUserPerformCalls(),
		"sort" => 3,
		"items" => [
			[
				"title" => Loc::getMessage("MENU_TELEPHONY_CALL"),
				"color" => "#8bd100",
				"unselectable" => true,
				"imageUrl" => $imageDir . "telephony/icon-call.png",
				"params" => [
					"onclick" => <<<JS
						BX.postComponentEvent("onNumpadRequestShow");
JS

				],
			]
		]
	];
}

$menuStructure[] = [
	"title" => "",
	"sort" => 150,
	"items" => [
		[
			"title" => Loc::getMessage("MENU_CHANGE_ACCOUNT"),
			"type" => "button",
			"styles" => [
				"title" => ["color" => "#999999"]
			],
			"attrs" => [
				"action" => "exit"
			]
		]
	]
];

$settingsComponentPath = \Bitrix\Mobile\ComponentManager::getComponentPath("settings");
$settingsUserId = $USER->GetID();
$settingsSiteId = SITE_ID;
$settingsLanguageId = LANGUAGE_ID;

$menuStructure[] = [
	"title" => "",
	"min_api_version" => 25,
	"sort" => 1,
	"items" => [
		[
			"title" => Loc::getMessage("MENU_SETTINGS"),
			"useLetterImage" => false,
			"color"=>"#40465A",
			"imageUrl"=> $imageDir . "settings/settings.png?2",
			"attrs" => [
				"onclick" => <<<JS
						PageManager.openComponent("JSStackComponent", 
						{
							scriptPath:"$settingsComponentPath",
							componentCode: "settings.config",
							params: {
								"USER_ID": $settingsUserId,
								"SITE_ID": "$settingsSiteId",
								"LANGUAGE_ID": "$settingsLanguageId",
							},
							rootWidget:{
								name:"settings",
								settings:{
									objectName: "settings",
									title: this.title
								}
							}
						});
JS

			]
		]
	]
];


return $menuStructure;