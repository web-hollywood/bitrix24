<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetPageProperty("NOT_SHOW_NAV_CHAIN", "Y");
$APPLICATION->SetPageProperty("title", htmlspecialcharsbx(COption::GetOptionString("main", "site_name", "Bitrix24")));
?>
<?
if (SITE_TEMPLATE_ID !== "bitrix24")
	return;
?>
<?
$APPLICATION->IncludeComponent(
	"bitrix:socialnetwork.log.ex", 
	"", 
	Array(
		"PATH_TO_SEARCH_TAG" => SITE_DIR."search/?tags=#tag#",
		"SET_NAV_CHAIN" => "Y",
		"SET_TITLE" => "Y",
		"ITEMS_COUNT" => "32",
		"NAME_TEMPLATE" => CSite::GetNameFormat(),
		"SHOW_LOGIN" => "Y",
		"DATE_TIME_FORMAT" => "#DATE_TIME_FORMAT#",
		"SHOW_YEAR" => "M",
		"CACHE_TYPE" => "A",
		"CACHE_TIME" => "3600",
		"PATH_TO_CONPANY_DEPARTMENT" => SITE_DIR."company/structure.php?set_filter_structure=Y&structure_UF_DEPARTMENT=#ID#",
		"SHOW_EVENT_ID_FILTER" => "Y",
		"SHOW_SETTINGS_LINK" => "Y",
		"SET_LOG_CACHE" => "Y",
		"USE_COMMENTS" => "Y",
		"BLOG_ALLOW_POST_CODE" => "Y",
		"BLOG_GROUP_ID" => "#BLOG_GROUP_ID#",
		"PHOTO_USER_IBLOCK_TYPE" => "photos",
		"PHOTO_USER_IBLOCK_ID" => "#PHOTO_USER_IBLOCK_ID#",
		"PHOTO_USE_COMMENTS" => "Y",
		"PHOTO_COMMENTS_TYPE" => "FORUM",
		"PHOTO_FORUM_ID" => "#PHOTO_FORUM_ID#",
		"PHOTO_USE_CAPTCHA" => "N",
		"FORUM_ID" => "#FORUM_ID#",
		"PAGER_DESC_NUMBERING" => "N",
		"AJAX_MODE" => "N",
		"AJAX_OPTION_SHADOW" => "N",
		"AJAX_OPTION_HISTORY" => "N",
		"AJAX_OPTION_JUMP" => "N",
		"AJAX_OPTION_STYLE" => "Y",
		"CONTAINER_ID" => "log_external_container",
		"SHOW_RATING" => "",
		"RATING_TYPE" => "",
		"NEW_TEMPLATE" => "Y",
		"AVATAR_SIZE" => 100,
		"AVATAR_SIZE_COMMENT" => 100,
		"AUTH" => "Y",
	)
);
?>

<?$APPLICATION->IncludeComponent(
	"bitrix:intranet.bitrix24.banner",
	"",
	array(),
	null,
	array("HIDE_ICONS" => "N")
);?>

<?
if(CModule::IncludeModule('intranet')):
	$APPLICATION->IncludeComponent("bitrix:intranet.ustat.status", "", array(),	false);
endif;?>

<?
if(CModule::IncludeModule('calendar')):
	$APPLICATION->IncludeComponent("bitrix:calendar.events.list", "widget", array(
		"CALENDAR_TYPE" => "user",
		"B_CUR_USER_LIST" => "Y",
		"INIT_DATE" => "",
		"FUTURE_MONTH_COUNT" => "1",
		"DETAIL_URL" => "#SITE_DIR#company/personal/user/#user_id#/calendar/",
		"EVENTS_COUNT" => "5",
		"CACHE_TYPE" => "N",
		"CACHE_TIME" => "3600"
		),
		false
	);
endif;?>


<?
if(CModule::IncludeModule('tasks')):
	$APPLICATION->IncludeComponent(
		"bitrix:tasks.filter.v2",
		"widget",
		array(
			"VIEW_TYPE" => 0,
			"COMMON_FILTER" => array("ONLY_ROOT_TASKS" => "Y"),
			"USER_ID" => $USER->GetID(),
			"ROLE_FILTER_SUFFIX" => "",
			"PATH_TO_TASKS" => "#SITE_DIR#company/personal/user/".$USER->GetID()."/tasks/",
			"CHECK_TASK_IN" => "R"
		),
		null,
		array("HIDE_ICONS" => "N")
	);
endif;?>

<?if ($GLOBALS["USER"]->IsAuthorized())
{
	$APPLICATION->IncludeComponent("bitrix:socialnetwork.blog.blog", "important",
		Array(
			"BLOG_URL" => "",
			"FILTER" => array(">UF_BLOG_POST_IMPRTNT" => 0, "!POST_PARAM_BLOG_POST_IMPRTNT" => array("USER_ID" => $GLOBALS["USER"]->GetId(), "VALUE" => "Y")),
			"FILTER_NAME" => "",
			"YEAR" => "",
			"MONTH" => "",
			"DAY" => "",
			"CATEGORY_ID" => "",
			"GROUP_ID" => array(),
			"USER_ID" => $GLOBALS["USER"]->GetId(),
			"SOCNET_GROUP_ID" => 0,
			"SORT" => array(),
			"SORT_BY1" => "",
			"SORT_ORDER1" => "",
			"SORT_BY2" => "",
			"SORT_ORDER2" => "",
			//************** Page settings **************************************
			"MESSAGE_COUNT" => 0,
			"NAV_TEMPLATE" => "",
			"PAGE_SETTINGS" => array("bDescPageNumbering" => false, "nPageSize" => 10),
			//************** URL ************************************************
			"BLOG_VAR" => "",
			"POST_VAR" => "",
			"USER_VAR" => "",
			"PAGE_VAR" => "",
			"PATH_TO_BLOG" => "#SITE_DIR#company/personal/user/#user_id#/blog/",
			"PATH_TO_BLOG_CATEGORY" => "",
			"PATH_TO_BLOG_POSTS" => "#SITE_DIR#company/personal/user/#user_id#/blog/important/",
			"PATH_TO_POST" => "#SITE_DIR#company/personal/user/#user_id#/blog/#post_id#/",
			"PATH_TO_POST_EDIT" => "#SITE_DIR#company/personal/user/#user_id#/blog/edit/#post_id#/",
			"PATH_TO_USER" => "#SITE_DIR#company/personal/user/#user_id#/",
			"PATH_TO_SMILE" => "/bitrix/images/socialnetwork/smile/",
			//************** ADDITIONAL *****************************************
			"DATE_TIME_FORMAT" => (LANGUAGE_ID == "en") ? "F j, Y h:i a" : ((LANGUAGE_ID == "de") ? "j. F Y H:i:s" : "d.m.Y H:i:s"),
			"NAME_TEMPLATE" => "",
			"SHOW_LOGIN" => "Y",
			"AVATAR_SIZE" => 100,
			"SET_TITLE" => "N",
			"SHOW_RATING" => "N",
			"RATING_TYPE" => "",
			"MESSAGE_LENGTH" => 56,
			//************** CACHE **********************************************
			"CACHE_TYPE" => "A",
			"CACHE_TIME" => 3600,
			"CACHE_TAGS" => array("IMPORTANT", "IMPORTANT".$GLOBALS["USER"]->GetId()),
			//************** Template Settings **********************************
			"OPTIONS" => array(array("name" => "BLOG_POST_IMPRTNT", "value" => "Y")),
		),
		null
	);
}
?>

<?$APPLICATION->IncludeComponent("bitrix:blog.popular_posts", "widget", array(
	"GROUP_ID" => 1,
	"SORT_BY1" => "RATING_TOTAL_VALUE",
	"MESSAGE_COUNT" => "5",
	"PERIOD_DAYS" => "8",
	"MESSAGE_LENGTH" => "100",
	"DATE_TIME_FORMAT" => (LANGUAGE_ID == "en") ? "F j, Y h:i a" : ((LANGUAGE_ID == "de") ? "j. F Y H:i:s" : "d.m.Y H:i:s"),
	"PATH_TO_BLOG" => "#SITE_DIR#company/personal/user/#user_id#/blog/",
	"PATH_TO_GROUP_BLOG_POST" => "#SITE_DIR#workgroups/group/#group_id#/blog/#post_id#/",
	"PATH_TO_POST" => "#SITE_DIR#company/personal/user/#user_id#/blog/#post_id#/",
	"PATH_TO_USER" => "#SITE_DIR#company/personal/user/#user_id#/",
	"CACHE_TYPE" => "A",
	"CACHE_TIME" => "3600",
	"SEO_USER" => "Y",
	"USE_SOCNET" => "Y",
	"WIDGET_MODE" => "Y",
	),
	false
);?>

<?$APPLICATION->IncludeComponent(
	"bitrix:intranet.structure.birthday.nearest",
	"widget",
	Array(
		"NUM_USERS" => "4",
		"NAME_TEMPLATE" => "",
		"SHOW_LOGIN" => "Y",
		"CACHE_TYPE" => "A",
		"CACHE_TIME" => "3600",
		"DATE_FORMAT" => "j F",
		"DATE_FORMAT_NO_YEAR" => (LANGUAGE_ID == "en") ? "F j" : ((LANGUAGE_ID == "de") ? "j. F" : "j F"),
		"SHOW_YEAR" => "N",
		"DETAIL_URL" => "#SITE_DIR#company/personal/user/#USER_ID#/",
		"DEPARTMENT" => "0",
		"AJAX_OPTION_ADDITIONAL" => ""
	)
);?>

<?if(CModule::IncludeModule('bizproc')):
	$APPLICATION->IncludeComponent(
		'bitrix:bizproc.task.list',
		'widget',
		array(
			'COUNTERS_ONLY' => 'Y',
			'USER_ID' => $USER->GetID(),
			'PATH_TO_BP_TASKS' => '#SITE_DIR#company/personal/bizproc/',
			'PATH_TO_MY_PROCESSES' => '#SITE_DIR#company/personal/processes/',
		),
		null,
		array('HIDE_ICONS' => 'N')
	);
endif;?>

<?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>