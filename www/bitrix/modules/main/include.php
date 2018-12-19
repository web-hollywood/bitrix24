<?php
/**
 * Bitrix Framework
 * @package bitrix
 * @subpackage main
 * @copyright 2001-2013 Bitrix
 */

require_once(substr(__FILE__, 0, strlen(__FILE__) - strlen("/include.php"))."/bx_root.php");
require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/start.php");

require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/classes/general/virtual_io.php");
require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/classes/general/virtual_file.php");


$application = \Bitrix\Main\Application::getInstance();
$application->initializeExtendedKernel(array(
	"get" => $_GET,
	"post" => $_POST,
	"files" => $_FILES,
	"cookie" => $_COOKIE,
	"server" => $_SERVER,
	"env" => $_ENV
));

//define global application object
$GLOBALS["APPLICATION"] = new CMain;

if(defined("SITE_ID"))
	define("LANG", SITE_ID);

if(defined("LANG"))
{
	if(defined("ADMIN_SECTION") && ADMIN_SECTION===true)
		$db_lang = CLangAdmin::GetByID(LANG);
	else
		$db_lang = CLang::GetByID(LANG);

	$arLang = $db_lang->Fetch();

	if(!$arLang)
	{
		throw new \Bitrix\Main\SystemException("Incorrect site: ".LANG.".");
	}
}
else
{
	$arLang = $GLOBALS["APPLICATION"]->GetLang();
	define("LANG", $arLang["LID"]);
}

$lang = $arLang["LID"];
if (!defined("SITE_ID"))
	define("SITE_ID", $arLang["LID"]);
define("SITE_DIR", $arLang["DIR"]);
define("SITE_SERVER_NAME", $arLang["SERVER_NAME"]);
define("SITE_CHARSET", $arLang["CHARSET"]);
define("FORMAT_DATE", $arLang["FORMAT_DATE"]);
define("FORMAT_DATETIME", $arLang["FORMAT_DATETIME"]);
define("LANG_DIR", $arLang["DIR"]);
define("LANG_CHARSET", $arLang["CHARSET"]);
define("LANG_ADMIN_LID", $arLang["LANGUAGE_ID"]);
define("LANGUAGE_ID", $arLang["LANGUAGE_ID"]);

$context = $application->getContext();
$context->setLanguage(LANGUAGE_ID);
$context->setCulture(new \Bitrix\Main\Context\Culture($arLang));

$request = $context->getRequest();
if (!$request->isAdminSection())
{
	$context->setSite(SITE_ID);
}

$application->start();

$GLOBALS["APPLICATION"]->reinitPath();

if (!defined("POST_FORM_ACTION_URI"))
{
	define("POST_FORM_ACTION_URI", htmlspecialcharsbx(GetRequestUri()));
}

$GLOBALS["MESS"] = array();
$GLOBALS["ALL_LANG_FILES"] = array();
IncludeModuleLangFile($_SERVER["DOCUMENT_ROOT"].BX_ROOT."/modules/main/tools.php");
IncludeModuleLangFile($_SERVER["DOCUMENT_ROOT"].BX_ROOT."/modules/main/classes/general/database.php");
IncludeModuleLangFile($_SERVER["DOCUMENT_ROOT"].BX_ROOT."/modules/main/classes/general/main.php");
IncludeModuleLangFile(__FILE__);

error_reporting(COption::GetOptionInt("main", "error_reporting", E_COMPILE_ERROR|E_ERROR|E_CORE_ERROR|E_PARSE) & ~E_STRICT & ~E_DEPRECATED);

if(!defined("BX_COMP_MANAGED_CACHE") && COption::GetOptionString("main", "component_managed_cache_on", "Y") <> "N")
{
	define("BX_COMP_MANAGED_CACHE", true);
}

require_once($_SERVER["DOCUMENT_ROOT"].BX_ROOT."/modules/main/filter_tools.php");
require_once($_SERVER["DOCUMENT_ROOT"].BX_ROOT."/modules/main/ajax_tools.php");

/*ZDUyZmZNDdjYjMxNmMzNzc1Yjc1ZGYxYjc5MDhlZDNiOTc0ZWM=*/$GLOBALS['_____1513952087']= array(base64_decode('R'.'2V'.'0TW'.'9kdWxlRXZ'.'lbnRz'),base64_decode('RXh'.'l'.'Y3V'.'0ZU1'.'vZHVsZUV2ZW50RXg='));$GLOBALS['____1781544926']= array(base64_decode(''.'Z'.'GVm'.'aW'.'5l'),base64_decode('c3RybGVu'),base64_decode('YmF'.'zZT'.'Y0'.'X2'.'RlY29k'.'ZQ=='),base64_decode('dW'.'5zZX'.'JpY'.'Wxp'.'emU='),base64_decode('aXNfY'.'XJy'.'YX'.'k='),base64_decode('Y29'.'1bnQ='),base64_decode('aW5fYXJyY'.'X'.'k='),base64_decode('c2VyaWF'.'saXpl'),base64_decode('Ym'.'Fz'.'ZTY0X'.'2V'.'uY2'.'9k'.'ZQ'.'=='),base64_decode('c3RybGVu'),base64_decode('YXJyY'.'Xlf'.'a2V5X2V4'.'aXN0c'.'w='.'='),base64_decode('YX'.'Jy'.'YXl'.'fa'.'2V5X2V4a'.'XN0cw=='),base64_decode(''.'bWt0a'.'W'.'1l'),base64_decode('Z'.'GF0ZQ=='),base64_decode('ZG'.'F'.'0Z'.'Q=='),base64_decode('YXJyYXlfa2V5X2V4a'.'X'.'N'.'0cw'.'='.'='),base64_decode('c3Ry'.'b'.'GVu'),base64_decode('YXJyY'.'Xlf'.'a2'.'V5X2V4'.'a'.'XN0cw=='),base64_decode('c3'.'RybGVu'),base64_decode('Y'.'XJyYXl'.'fa'.'2V5'.'X2V'.'4aX'.'N0cw=='),base64_decode('YXJyYXlfa2V5X2V4aXN0cw='.'='),base64_decode('bWt0aW'.'1l'),base64_decode('ZGF0ZQ=='),base64_decode('ZGF0ZQ'.'=='),base64_decode(''.'b'.'WV0a'.'G'.'9kX'.'2V4'.'aXN0cw=='),base64_decode('Y2FsbF91c2Vy'.'X2Z1'.'bmN'.'fY'.'XJyYX'.'k='),base64_decode('c3RybGVu'),base64_decode('YX'.'JyYXlf'.'a'.'2V5X'.'2V4aXN0c'.'w=='),base64_decode('YXJyY'.'Xlfa'.'2V'.'5X2V4'.'aXN0cw=='),base64_decode(''.'c2VyaWFsaXpl'),base64_decode('YmF'.'z'.'ZTY0'.'X2VuY29kZQ=='),base64_decode('c3RybGVu'),base64_decode(''.'YXJyY'.'Xlfa2V'.'5X'.'2V4aX'.'N0'.'cw'.'=='),base64_decode('YX'.'JyYXlfa2V'.'5X2'.'V4aXN0cw='.'='),base64_decode('YXJyYXlfa2V5'.'X'.'2V4aXN0cw=='),base64_decode('aXNfY'.'XJ'.'yYXk'.'='),base64_decode(''.'YXJyYXlfa2V5'.'X'.'2V4a'.'XN0'.'cw='.'='),base64_decode('c2VyaWFsaX'.'pl'),base64_decode('Ym'.'FzZTY'.'0X2'.'Vu'.'Y29k'.'ZQ=='),base64_decode('Y'.'XJyY'.'X'.'l'.'fa'.'2V5X2V4aXN0cw='.'='),base64_decode('Y'.'X'.'JyYXlfa2V5X2V4aXN0cw=='),base64_decode(''.'c'.'2VyaWFs'.'aXpl'),base64_decode('YmFzZT'.'Y0X2VuY29kZQ=='),base64_decode('a'.'X'.'NfYXJy'.'YXk='),base64_decode('aXNf'.'YXJy'.'Y'.'Xk'.'='),base64_decode('a'.'W5'.'fY'.'XJ'.'yY'.'Xk='),base64_decode('YX'.'JyYXl'.'fa2V5'.'X2V4a'.'XN0'.'c'.'w='.'='),base64_decode('a'.'W5f'.'Y'.'X'.'JyYXk'.'='),base64_decode('bWt0aW1l'),base64_decode('ZG'.'F0'.'ZQ=='),base64_decode('ZGF0ZQ=='),base64_decode(''.'ZGF0ZQ=='),base64_decode('b'.'Wt0aW1l'),base64_decode('ZGF'.'0'.'ZQ=='),base64_decode('ZG'.'F0ZQ='.'='),base64_decode('aW'.'5fYXJy'.'YX'.'k'.'='),base64_decode(''.'YXJyYXlfa2V5X2'.'V4a'.'XN0cw='.'='),base64_decode('Y'.'XJyY'.'Xlfa2V5X2V4'.'a'.'XN0cw=='),base64_decode(''.'c2V'.'yaW'.'Fs'.'aXpl'),base64_decode(''.'YmF'.'zZT'.'Y0'.'X2VuY2'.'9kZQ='.'='),base64_decode('YXJyYXlfa2V5X2V4aX'.'N0c'.'w=='),base64_decode('aW50dmFs'),base64_decode('dGlt'.'ZQ=='),base64_decode('YXJ'.'y'.'Y'.'Xlfa2V5X2'.'V'.'4'.'aXN0cw='.'='),base64_decode('Zml'.'sZV9l'.'eG'.'l'.'zdHM='),base64_decode('c3Ry'.'X3Jl'.'cGxhY2U='),base64_decode('Y2xhc3N'.'fZXhpc3R'.'z'),base64_decode('ZGVmaW5l'));if(!function_exists(__NAMESPACE__.'\\___1886700755')){function ___1886700755($_1892699267){static $_875514102= false; if($_875514102 == false) $_875514102=array('SU'.'5'.'UU'.'kFORVR'.'fR'.'U'.'R'.'JV'.'ElPTg==','WQ==','bWFpbg==','fm'.'N'.'wZl9'.'tYXBfdmFsd'.'WU'.'=','','ZQ='.'=','Zg'.'='.'=','ZQ'.'==','Rg='.'=','W'.'A='.'=','Zg==',''.'bW'.'Fpbg='.'=','fmNw'.'Zl9tYXBfd'.'mFsdWU=','UG9ydGFs','Rg'.'==','ZQ==','ZQ'.'==',''.'W'.'A'.'='.'=',''.'Rg==','RA='.'=','RA==',''.'b'.'Q='.'=','ZA==','WQ'.'==','Zg'.'==',''.'Zg==','Zg==','Zg==','UG9'.'yd'.'GFs','Rg==','ZQ==',''.'ZQ==','W'.'A==','Rg==','RA==','R'.'A==',''.'bQ==','Z'.'A==','WQ==','bWFp'.'b'.'g==','T24=','U2V'.'0dGl'.'uZ3'.'ND'.'aGFu'.'Z2U=','Zg==','Zg==','Zg==','Z'.'g='.'=','bWFpbg==','fmNwZl9tYX'.'BfdmFs'.'dWU=',''.'ZQ'.'==',''.'ZQ==',''.'ZQ='.'=',''.'RA==','ZQ==','ZQ'.'==',''.'Zg='.'=',''.'Zg'.'==','Zg==','Z'.'Q='.'=','bWFpb'.'g'.'==','fmNw'.'Z'.'l'.'9t'.'YXBf'.'dm'.'FsdWU'.'=','ZQ'.'==','Zg==','Zg'.'==','Zg'.'==','Zg==','bWFpbg='.'=',''.'f'.'mNwZ'.'l9tYXBfdmFsdWU'.'=',''.'ZQ='.'=','Zg==','UG'.'9ydGFs','UG9y'.'dGFs','ZQ='.'=','ZQ='.'=','UG9ydGFs',''.'Rg==','WA==',''.'Rg'.'==','RA='.'=','ZQ==','ZQ==','RA==',''.'bQ='.'=','ZA'.'==','W'.'Q'.'==','ZQ='.'=',''.'WA==','ZQ='.'=','R'.'g==','Z'.'Q'.'==','RA==','Z'.'g'.'==','ZQ'.'==','RA==','ZQ==','bQ==','Z'.'A==','W'.'Q==','Zg==',''.'Zg==','Zg==','Zg==','Z'.'g==',''.'Zg==','Zg==','Zg==','bWFpbg==','fmNwZl9tYXB'.'f'.'dmFsdWU=','ZQ==','ZQ==','UG9yd'.'GFs','R'.'g==',''.'W'.'A==',''.'V'.'FlQRQ==','REFURQ==','RkV'.'BV'.'FVSRVM=',''.'RVhQSVJFRA==','VFl'.'Q'.'RQ='.'=','RA==',''.'VFJZX0RBW'.'VN'.'f'.'Q'.'0'.'9VTlQ=','R'.'EFURQ==','VF'.'JZX'.'0RBWVNfQ'.'09VTlQ'.'=',''.'RVh'.'QSVJF'.'R'.'A='.'=','RkVBV'.'FVSRV'.'M=','Zg==','Z'.'g='.'=',''.'R'.'E9'.'DV'.'U'.'1FT'.'lRf'.'Uk9P'.'VA==',''.'L'.'2'.'Jpd'.'HJpeC9'.'tb2R1'.'b'.'GV'.'zLw==','L'.'2luc3'.'RhbGwva'.'W5kZXgu'.'cGhw','Lg==','Xw==','c2Vhcm'.'No','Tg'.'==','','','QU'.'NUS'.'VZF','WQ='.'=','c'.'29jaW'.'Fsbm'.'V0'.'d29'.'yaw==','YWxs'.'b'.'3d'.'fZ'.'n'.'JpZWx'.'k'.'cw==',''.'WQ==','SUQ=','c2'.'9jaWFsbm'.'V0d'.'29yaw='.'=','YWxs'.'b3dfZnJp'.'ZW'.'xkcw==','SUQ'.'=',''.'c29'.'jaWF'.'sbmV0'.'d29yaw==',''.'YWx'.'sb3df'.'Z'.'nJp'.'ZW'.'xkcw='.'=','Tg==','','',''.'QUNUS'.'VZF','WQ'.'='.'=','c29'.'j'.'aWFsb'.'mV0d29y'.'aw==','YWxs'.'b3dfbWlj'.'cm9ibG9nX3'.'VzZXI=','WQ'.'==',''.'SU'.'Q=',''.'c'.'29'.'jaWF'.'sbmV'.'0d29yaw==','YWxsb3dfbW'.'l'.'j'.'cm9ibG'.'9nX3'.'V'.'zZXI=','SUQ'.'=','c29'.'jaWFs'.'bmV'.'0d'.'2'.'9yaw'.'==',''.'YW'.'xs'.'b3dfbWl'.'jcm9'.'ibG9nX'.'3VzZ'.'XI=','c'.'2'.'9ja'.'WF'.'sbmV'.'0d'.'29ya'.'w==','YWxsb3dfb'.'Wljcm'.'9ibG9n'.'X2dyb'.'3'.'Vw','WQ==','SUQ=',''.'c29jaW'.'F'.'sbmV0'.'d29ya'.'w'.'='.'=','YWx'.'sb3'.'dfbWl'.'j'.'cm9'.'ibG9nX2dyb3V'.'w','SUQ=','c29jaWF'.'sbm'.'V'.'0d29yaw==','Y'.'Wxsb3dfbWljc'.'m9ibG9nX2dyb'.'3Vw','Tg==','','','Q'.'UNU'.'SV'.'ZF',''.'WQ==','c29'.'jaWFsbmV0'.'d'.'29yaw==',''.'YWx'.'sb3df'.'Zm'.'lsZXNf'.'dXN'.'lcg==','W'.'Q==','SU'.'Q=','c29jaWFsbmV'.'0d'.'29'.'yaw'.'='.'=','YWxs'.'b3'.'df'.'Z'.'ml'.'s'.'ZXNfdX'.'N'.'lc'.'g'.'==','SUQ=',''.'c2'.'9jaWFsbmV0'.'d29ya'.'w==','YWxsb3dfZmlsZ'.'XNfdXN'.'lcg==',''.'Tg==','','','QUNUSVZ'.'F','WQ='.'=','c29jaWFs'.'bmV0d29'.'y'.'aw'.'='.'=',''.'YW'.'xsb3df'.'Ym'.'xvZ19'.'1c'.'2Vy','WQ==','SUQ=','c29jaWF'.'sbmV0'.'d29ya'.'w==',''.'Y'.'Wxs'.'b3dfYmx'.'vZ'.'191c2Vy','SU'.'Q=','c29j'.'a'.'WFsbmV0d'.'29yaw==',''.'YW'.'xsb3df'.'Ym'.'xvZ191c2Vy','T'.'g==','','','QUN'.'USVZF',''.'WQ='.'=','c2'.'9jaWFsbmV0d29yaw'.'='.'=','YWxsb3df'.'c'.'GhvdG'.'9fd'.'XNlcg==','WQ==','SUQ'.'=','c'.'2'.'9j'.'aWFsbmV0d29y'.'aw==','YWxsb3dfcGhvdG9'.'fdXN'.'l'.'cg==','SUQ=','c29'.'jaWF'.'s'.'b'.'m'.'V0d29y'.'aw==','Y'.'Wxsb3dfcGhvdG9fdX'.'Nlcg==',''.'Tg==','','','QUNUSV'.'Z'.'F','W'.'Q='.'=','c2'.'9jaWFsbmV0'.'d'.'29'.'yaw==','YWxsb3dfZm9'.'ydW1'.'fdX'.'Nl'.'cg==','WQ==','S'.'U'.'Q'.'=','c'.'29j'.'aWFsbmV0d2'.'9y'.'aw==','YWxsb3dfZm9'.'ydW1fdX'.'Nlcg='.'=','S'.'U'.'Q=','c2'.'9'.'jaW'.'F'.'sbm'.'V'.'0d29yaw==','YWxsb3dfZm9'.'y'.'dW1fdXN'.'lcg==','Tg==','','','QUN'.'USVZF','WQ'.'==','c'.'29ja'.'WFs'.'bm'.'V0'.'d29'.'yaw'.'==','YW'.'xsb3dfdGF'.'za3NfdXN'.'lcg='.'=','W'.'Q'.'='.'=','S'.'U'.'Q=',''.'c29j'.'aWFsbmV0d29yaw==','YWxs'.'b3dfdG'.'Fza'.'3NfdXN'.'l'.'cg==',''.'S'.'U'.'Q=',''.'c29j'.'a'.'WFsb'.'mV0d29yaw='.'=',''.'YWxsb3dfd'.'G'.'Fza3NfdXN'.'lcg='.'=','c29jaWFsb'.'mV'.'0d29yaw==','YWxs'.'b3dfd'.'G'.'Fza3'.'NfZ3J'.'v'.'dXA=','WQ==','SUQ=','c29ja'.'WFsb'.'m'.'V0'.'d'.'2'.'9'.'yaw='.'=','YWxsb'.'3dfdGFza3NfZ3Jv'.'dXA=','SUQ'.'=',''.'c29jaW'.'FsbmV0'.'d29yaw'.'==',''.'YWxsb3df'.'dGFza3NfZ3J'.'vdXA=','d'.'GF'.'za3'.'M=','Tg='.'=','','','QUN'.'USVZF','WQ==',''.'c29jaW'.'Fsb'.'mV0d29'.'yaw==','YW'.'xs'.'b3d'.'fY2FsZW5k'.'Y'.'XJfdXN'.'lcg==','W'.'Q==','SUQ=','c29j'.'a'.'WFsbmV0d29y'.'a'.'w='.'=','YWxsb3dfY2FsZW5kYX'.'Jf'.'dX'.'Nlc'.'g==','S'.'UQ=','c29'.'ja'.'W'.'FsbmV'.'0d29'.'yaw==','YWx'.'s'.'b3df'.'Y2FsZW5'.'kY'.'X'.'JfdX'.'Nlcg==','c29jaW'.'F'.'sbmV0d'.'29'.'ya'.'w==',''.'Y'.'Wxsb3dfY2'.'F'.'sZW5kYXJfZ3'.'J'.'vdX'.'A=','WQ'.'='.'=','SUQ=','c'.'2'.'9jaWF'.'sbmV'.'0d29yaw==',''.'YWx'.'sb3df'.'Y2'.'FsZW5k'.'YXJfZ3JvdXA=','SUQ=','c'.'2'.'9j'.'aWFsb'.'m'.'V0d'.'29yaw==',''.'YW'.'xsb3dfY'.'2Fs'.'ZW5kYXJfZ3JvdXA=','Q'.'UN'.'US'.'VZF','WQ==','Tg==',''.'Z'.'Xh0cmFuZ'.'XQ=',''.'aWJsb2Nr',''.'T'.'25'.'BZnRlck'.'lCb'.'G9j'.'a'.'0V'.'sZW'.'1lbnRVc'.'GRh'.'d'.'GU'.'=','aW'.'50c'.'mFuZXQ=','Q0lud'.'HJ'.'hbmV0R'.'XZlb'.'nRIY'.'W5kbGVyc'.'w='.'=','U1B'.'SZ'.'W'.'dpc3RlclV'.'wZGF0ZWRJdGVt','Q0l'.'udHJh'.'bmV0'.'U2hhcmVw'.'b'.'2lu'.'d'.'Do6QWdl'.'bnRMaXN0cyg'.'p'.'Ow'.'==',''.'aW50cm'.'FuZX'.'Q=','Tg='.'=','Q0l'.'ud'.'HJhb'.'mV0U'.'2h'.'hcmVwb2l'.'udDo6'.'QWdlbnRRdWV1Z'.'SgpOw==','aW'.'50'.'cm'.'FuZXQ=',''.'Tg==','Q0l'.'udH'.'J'.'h'.'b'.'m'.'V0U2hhcm'.'V'.'wb2lud'.'Do6'.'QWd'.'lbnRVcG'.'RhdGUoKT'.'s=','aW50'.'cmFu'.'ZXQ=','Tg==','aWJ'.'sb2N'.'r','T2'.'5BZnRlcklCbG9'.'ja0VsZW1lb'.'n'.'RBZG'.'Q=','aW50'.'cm'.'FuZXQ=','Q0'.'ludHJ'.'hbmV0RX'.'ZlbnR'.'IYW5kbGV'.'ycw='.'=',''.'U'.'1BSZW'.'dp'.'c'.'3Rlcl'.'V'.'wZGF0ZWRJdGV'.'t','aWJsb2N'.'r','T'.'25'.'BZnRlcklCbG9ja0'.'Vs'.'ZW1lbnRVcGRhdGU=','aW50cmFuZXQ'.'=',''.'Q0ludHJhb'.'mV0R'.'XZ'.'lb'.'n'.'RIYW5k'.'b'.'GV'.'y'.'cw'.'==','U1BSZ'.'W'.'d'.'pc3Rlc'.'lVw'.'ZG'.'F0Z'.'WRJdGV'.'t','Q'.'0l'.'u'.'dH'.'JhbmV0U2hhcm'.'Vwb2lu'.'dDo6Q'.'Wd'.'lbnRM'.'a'.'XN0cygp'.'O'.'w==','aW50cmFuZXQ=','Q'.'0ludHJhbmV0'.'U2h'.'hcmVwb2'.'ludDo6'.'QWdl'.'bnRRdW'.'V1ZSgp'.'Ow==','a'.'W'.'50'.'cm'.'FuZXQ'.'=',''.'Q0lud'.'HJ'.'h'.'bmV0'.'U2hhcmVwb2'.'ludDo6QWd'.'l'.'bnR'.'Vc'.'GR'.'hdGU'.'oKTs=','aW'.'5'.'0'.'c'.'m'.'F'.'uZXQ=','Y3Jt','bWFpbg'.'==',''.'T25'.'CZWZvc'.'mVQcm9sb2c=','bWFp'.'bg'.'='.'=','Q'.'1dpe'.'mFyZF'.'NvbFBhbmVsSW50c'.'mFuZX'.'Q=','U2h'.'vd1BhbmVs','L2'.'1vZ'.'HV'.'s'.'ZXMvaW'.'50cm'.'Fu'.'Z'.'XQvcGFuZWxfY'.'nV0dG9u'.'LnBocA==','RU5'.'DT0RF','WQ==');return base64_decode($_875514102[$_1892699267]);}};$GLOBALS['____1781544926'][0](___1886700755(0), ___1886700755(1));class CBXFeatures{ private static $_1405019392= 30; private static $_1823653997= array( "Portal" => array( "CompanyCalendar", "CompanyPhoto", "CompanyVideo", "CompanyCareer", "StaffChanges", "StaffAbsence", "CommonDocuments", "MeetingRoomBookingSystem", "Wiki", "Learning", "Vote", "WebLink", "Subscribe", "Friends", "PersonalFiles", "PersonalBlog", "PersonalPhoto", "PersonalForum", "Blog", "Forum", "Gallery", "Board", "MicroBlog", "WebMessenger",), "Communications" => array( "Tasks", "Calendar", "Workgroups", "Jabber", "VideoConference", "Extranet", "SMTP", "Requests", "DAV", "intranet_sharepoint", "timeman", "Idea", "Meeting", "EventList", "Salary", "XDImport",), "Enterprise" => array( "BizProc", "Lists", "Support", "Analytics", "crm", "Controller",), "Holding" => array( "Cluster", "MultiSites",),); private static $_1530483803= false; private static $_2041707188= false; private static function __636522364(){ if(self::$_1530483803 == false){ self::$_1530483803= array(); foreach(self::$_1823653997 as $_1203803232 => $_1795676162){ foreach($_1795676162 as $_1659649844) self::$_1530483803[$_1659649844]= $_1203803232;}} if(self::$_2041707188 == false){ self::$_2041707188= array(); $_1533599417= COption::GetOptionString(___1886700755(2), ___1886700755(3), ___1886700755(4)); if($GLOBALS['____1781544926'][1]($_1533599417)>(200*2-400)){ $_1533599417= $GLOBALS['____1781544926'][2]($_1533599417); self::$_2041707188= $GLOBALS['____1781544926'][3]($_1533599417); if(!$GLOBALS['____1781544926'][4](self::$_2041707188)) self::$_2041707188= array();} if($GLOBALS['____1781544926'][5](self::$_2041707188) <=(1108/2-554)) self::$_2041707188= array(___1886700755(5) => array(), ___1886700755(6) => array());}} public static function InitiateEditionsSettings($_10165651){ self::__636522364(); $_827607478= array(); foreach(self::$_1823653997 as $_1203803232 => $_1795676162){ $_1340078488= $GLOBALS['____1781544926'][6]($_1203803232, $_10165651); self::$_2041707188[___1886700755(7)][$_1203803232]=($_1340078488? array(___1886700755(8)): array(___1886700755(9))); foreach($_1795676162 as $_1659649844){ self::$_2041707188[___1886700755(10)][$_1659649844]= $_1340078488; if(!$_1340078488) $_827607478[]= array($_1659649844, false);}} $_103150375= $GLOBALS['____1781544926'][7](self::$_2041707188); $_103150375= $GLOBALS['____1781544926'][8]($_103150375); COption::SetOptionString(___1886700755(11), ___1886700755(12), $_103150375); foreach($_827607478 as $_960964776) self::__111549105($_960964776[min(24,0,8)], $_960964776[round(0+0.2+0.2+0.2+0.2+0.2)]);} public static function IsFeatureEnabled($_1659649844){ if($GLOBALS['____1781544926'][9]($_1659649844) <= 0) return true; self::__636522364(); if(!$GLOBALS['____1781544926'][10]($_1659649844, self::$_1530483803)) return true; if(self::$_1530483803[$_1659649844] == ___1886700755(13)) $_412258249= array(___1886700755(14)); elseif($GLOBALS['____1781544926'][11](self::$_1530483803[$_1659649844], self::$_2041707188[___1886700755(15)])) $_412258249= self::$_2041707188[___1886700755(16)][self::$_1530483803[$_1659649844]]; else $_412258249= array(___1886700755(17)); if($_412258249[(198*2-396)] != ___1886700755(18) && $_412258249[(766-2*383)] != ___1886700755(19)){ return false;} elseif($_412258249[(1224/2-612)] == ___1886700755(20)){ if($_412258249[round(0+0.33333333333333+0.33333333333333+0.33333333333333)]< $GLOBALS['____1781544926'][12](min(218,0,72.666666666667),(169*2-338),(1104/2-552), Date(___1886700755(21)), $GLOBALS['____1781544926'][13](___1886700755(22))- self::$_1405019392, $GLOBALS['____1781544926'][14](___1886700755(23)))){ if(!isset($_412258249[round(0+0.4+0.4+0.4+0.4+0.4)]) ||!$_412258249[round(0+0.66666666666667+0.66666666666667+0.66666666666667)]) self::__1394498523(self::$_1530483803[$_1659649844]); return false;}} return!$GLOBALS['____1781544926'][15]($_1659649844, self::$_2041707188[___1886700755(24)]) || self::$_2041707188[___1886700755(25)][$_1659649844];} public static function IsFeatureInstalled($_1659649844){ if($GLOBALS['____1781544926'][16]($_1659649844) <= 0) return true; self::__636522364(); return($GLOBALS['____1781544926'][17]($_1659649844, self::$_2041707188[___1886700755(26)]) && self::$_2041707188[___1886700755(27)][$_1659649844]);} public static function IsFeatureEditable($_1659649844){ if($GLOBALS['____1781544926'][18]($_1659649844) <= 0) return true; self::__636522364(); if(!$GLOBALS['____1781544926'][19]($_1659649844, self::$_1530483803)) return true; if(self::$_1530483803[$_1659649844] == ___1886700755(28)) $_412258249= array(___1886700755(29)); elseif($GLOBALS['____1781544926'][20](self::$_1530483803[$_1659649844], self::$_2041707188[___1886700755(30)])) $_412258249= self::$_2041707188[___1886700755(31)][self::$_1530483803[$_1659649844]]; else $_412258249= array(___1886700755(32)); if($_412258249[(1168/2-584)] != ___1886700755(33) && $_412258249[(244*2-488)] != ___1886700755(34)){ return false;} elseif($_412258249[(1068/2-534)] == ___1886700755(35)){ if($_412258249[round(0+0.33333333333333+0.33333333333333+0.33333333333333)]< $GLOBALS['____1781544926'][21]((1032/2-516), min(240,0,80),(1076/2-538), Date(___1886700755(36)), $GLOBALS['____1781544926'][22](___1886700755(37))- self::$_1405019392, $GLOBALS['____1781544926'][23](___1886700755(38)))){ if(!isset($_412258249[round(0+0.4+0.4+0.4+0.4+0.4)]) ||!$_412258249[round(0+0.4+0.4+0.4+0.4+0.4)]) self::__1394498523(self::$_1530483803[$_1659649844]); return false;}} return true;} private static function __111549105($_1659649844, $_1667924671){ if($GLOBALS['____1781544926'][24]("CBXFeatures", "On".$_1659649844."SettingsChange")) $GLOBALS['____1781544926'][25](array("CBXFeatures", "On".$_1659649844."SettingsChange"), array($_1659649844, $_1667924671)); $_428939290= $GLOBALS['_____1513952087'][0](___1886700755(39), ___1886700755(40).$_1659649844.___1886700755(41)); while($_389760163= $_428939290->Fetch()) $GLOBALS['_____1513952087'][1]($_389760163, array($_1659649844, $_1667924671));} public static function SetFeatureEnabled($_1659649844, $_1667924671= true, $_190610938= true){ if($GLOBALS['____1781544926'][26]($_1659649844) <= 0) return; if(!self::IsFeatureEditable($_1659649844)) $_1667924671= false; $_1667924671=($_1667924671? true: false); self::__636522364(); $_123116458=(!$GLOBALS['____1781544926'][27]($_1659649844, self::$_2041707188[___1886700755(42)]) && $_1667924671 || $GLOBALS['____1781544926'][28]($_1659649844, self::$_2041707188[___1886700755(43)]) && $_1667924671 != self::$_2041707188[___1886700755(44)][$_1659649844]); self::$_2041707188[___1886700755(45)][$_1659649844]= $_1667924671; $_103150375= $GLOBALS['____1781544926'][29](self::$_2041707188); $_103150375= $GLOBALS['____1781544926'][30]($_103150375); COption::SetOptionString(___1886700755(46), ___1886700755(47), $_103150375); if($_123116458 && $_190610938) self::__111549105($_1659649844, $_1667924671);} private static function __1394498523($_1203803232){ if($GLOBALS['____1781544926'][31]($_1203803232) <= 0 || $_1203803232 == "Portal") return; self::__636522364(); if(!$GLOBALS['____1781544926'][32]($_1203803232, self::$_2041707188[___1886700755(48)]) || $GLOBALS['____1781544926'][33]($_1203803232, self::$_2041707188[___1886700755(49)]) && self::$_2041707188[___1886700755(50)][$_1203803232][min(90,0,30)] != ___1886700755(51)) return; if(isset(self::$_2041707188[___1886700755(52)][$_1203803232][round(0+0.4+0.4+0.4+0.4+0.4)]) && self::$_2041707188[___1886700755(53)][$_1203803232][round(0+2)]) return; $_827607478= array(); if($GLOBALS['____1781544926'][34]($_1203803232, self::$_1823653997) && $GLOBALS['____1781544926'][35](self::$_1823653997[$_1203803232])){ foreach(self::$_1823653997[$_1203803232] as $_1659649844){ if($GLOBALS['____1781544926'][36]($_1659649844, self::$_2041707188[___1886700755(54)]) && self::$_2041707188[___1886700755(55)][$_1659649844]){ self::$_2041707188[___1886700755(56)][$_1659649844]= false; $_827607478[]= array($_1659649844, false);}} self::$_2041707188[___1886700755(57)][$_1203803232][round(0+0.5+0.5+0.5+0.5)]= true;} $_103150375= $GLOBALS['____1781544926'][37](self::$_2041707188); $_103150375= $GLOBALS['____1781544926'][38]($_103150375); COption::SetOptionString(___1886700755(58), ___1886700755(59), $_103150375); foreach($_827607478 as $_960964776) self::__111549105($_960964776[(200*2-400)], $_960964776[round(0+0.5+0.5)]);} public static function ModifyFeaturesSettings($_10165651, $_1795676162){ self::__636522364(); foreach($_10165651 as $_1203803232 => $_280782952) self::$_2041707188[___1886700755(60)][$_1203803232]= $_280782952; $_827607478= array(); foreach($_1795676162 as $_1659649844 => $_1667924671){ if(!$GLOBALS['____1781544926'][39]($_1659649844, self::$_2041707188[___1886700755(61)]) && $_1667924671 || $GLOBALS['____1781544926'][40]($_1659649844, self::$_2041707188[___1886700755(62)]) && $_1667924671 != self::$_2041707188[___1886700755(63)][$_1659649844]) $_827607478[]= array($_1659649844, $_1667924671); self::$_2041707188[___1886700755(64)][$_1659649844]= $_1667924671;} $_103150375= $GLOBALS['____1781544926'][41](self::$_2041707188); $_103150375= $GLOBALS['____1781544926'][42]($_103150375); COption::SetOptionString(___1886700755(65), ___1886700755(66), $_103150375); self::$_2041707188= false; foreach($_827607478 as $_960964776) self::__111549105($_960964776[(205*2-410)], $_960964776[round(0+0.5+0.5)]);} public static function SaveFeaturesSettings($_399517541, $_743702603){ self::__636522364(); $_1677534525= array(___1886700755(67) => array(), ___1886700755(68) => array()); if(!$GLOBALS['____1781544926'][43]($_399517541)) $_399517541= array(); if(!$GLOBALS['____1781544926'][44]($_743702603)) $_743702603= array(); if(!$GLOBALS['____1781544926'][45](___1886700755(69), $_399517541)) $_399517541[]= ___1886700755(70); foreach(self::$_1823653997 as $_1203803232 => $_1795676162){ if($GLOBALS['____1781544926'][46]($_1203803232, self::$_2041707188[___1886700755(71)])) $_480966279= self::$_2041707188[___1886700755(72)][$_1203803232]; else $_480966279=($_1203803232 == ___1886700755(73))? array(___1886700755(74)): array(___1886700755(75)); if($_480966279[(766-2*383)] == ___1886700755(76) || $_480966279[(188*2-376)] == ___1886700755(77)){ $_1677534525[___1886700755(78)][$_1203803232]= $_480966279;} else{ if($GLOBALS['____1781544926'][47]($_1203803232, $_399517541)) $_1677534525[___1886700755(79)][$_1203803232]= array(___1886700755(80), $GLOBALS['____1781544926'][48]((130*2-260),(205*2-410),(1184/2-592), $GLOBALS['____1781544926'][49](___1886700755(81)), $GLOBALS['____1781544926'][50](___1886700755(82)), $GLOBALS['____1781544926'][51](___1886700755(83)))); else $_1677534525[___1886700755(84)][$_1203803232]= array(___1886700755(85));}} $_827607478= array(); foreach(self::$_1530483803 as $_1659649844 => $_1203803232){ if($_1677534525[___1886700755(86)][$_1203803232][(204*2-408)] != ___1886700755(87) && $_1677534525[___1886700755(88)][$_1203803232][(958-2*479)] != ___1886700755(89)){ $_1677534525[___1886700755(90)][$_1659649844]= false;} else{ if($_1677534525[___1886700755(91)][$_1203803232][(986-2*493)] == ___1886700755(92) && $_1677534525[___1886700755(93)][$_1203803232][round(0+0.33333333333333+0.33333333333333+0.33333333333333)]< $GLOBALS['____1781544926'][52]((200*2-400),(1028/2-514),(1044/2-522), Date(___1886700755(94)), $GLOBALS['____1781544926'][53](___1886700755(95))- self::$_1405019392, $GLOBALS['____1781544926'][54](___1886700755(96)))) $_1677534525[___1886700755(97)][$_1659649844]= false; else $_1677534525[___1886700755(98)][$_1659649844]= $GLOBALS['____1781544926'][55]($_1659649844, $_743702603); if(!$GLOBALS['____1781544926'][56]($_1659649844, self::$_2041707188[___1886700755(99)]) && $_1677534525[___1886700755(100)][$_1659649844] || $GLOBALS['____1781544926'][57]($_1659649844, self::$_2041707188[___1886700755(101)]) && $_1677534525[___1886700755(102)][$_1659649844] != self::$_2041707188[___1886700755(103)][$_1659649844]) $_827607478[]= array($_1659649844, $_1677534525[___1886700755(104)][$_1659649844]);}} $_103150375= $GLOBALS['____1781544926'][58]($_1677534525); $_103150375= $GLOBALS['____1781544926'][59]($_103150375); COption::SetOptionString(___1886700755(105), ___1886700755(106), $_103150375); self::$_2041707188= false; foreach($_827607478 as $_960964776) self::__111549105($_960964776[(1104/2-552)], $_960964776[round(0+0.5+0.5)]);} public static function GetFeaturesList(){ self::__636522364(); $_715207159= array(); foreach(self::$_1823653997 as $_1203803232 => $_1795676162){ if($GLOBALS['____1781544926'][60]($_1203803232, self::$_2041707188[___1886700755(107)])) $_480966279= self::$_2041707188[___1886700755(108)][$_1203803232]; else $_480966279=($_1203803232 == ___1886700755(109))? array(___1886700755(110)): array(___1886700755(111)); $_715207159[$_1203803232]= array( ___1886700755(112) => $_480966279[(752-2*376)], ___1886700755(113) => $_480966279[round(0+0.25+0.25+0.25+0.25)], ___1886700755(114) => array(),); $_715207159[$_1203803232][___1886700755(115)]= false; if($_715207159[$_1203803232][___1886700755(116)] == ___1886700755(117)){ $_715207159[$_1203803232][___1886700755(118)]= $GLOBALS['____1781544926'][61](($GLOBALS['____1781544926'][62]()- $_715207159[$_1203803232][___1886700755(119)])/ round(0+28800+28800+28800)); if($_715207159[$_1203803232][___1886700755(120)]> self::$_1405019392) $_715207159[$_1203803232][___1886700755(121)]= true;} foreach($_1795676162 as $_1659649844) $_715207159[$_1203803232][___1886700755(122)][$_1659649844]=(!$GLOBALS['____1781544926'][63]($_1659649844, self::$_2041707188[___1886700755(123)]) || self::$_2041707188[___1886700755(124)][$_1659649844]);} return $_715207159;} private static function __288584800($_1660071725, $_116091351){ if(IsModuleInstalled($_1660071725) == $_116091351) return true; $_2072815126= $_SERVER[___1886700755(125)].___1886700755(126).$_1660071725.___1886700755(127); if(!$GLOBALS['____1781544926'][64]($_2072815126)) return false; include_once($_2072815126); $_664525335= $GLOBALS['____1781544926'][65](___1886700755(128), ___1886700755(129), $_1660071725); if(!$GLOBALS['____1781544926'][66]($_664525335)) return false; $_507178172= new $_664525335; if($_116091351){ if(!$_507178172->InstallDB()) return false; $_507178172->InstallEvents(); if(!$_507178172->InstallFiles()) return false;} else{ if(CModule::IncludeModule(___1886700755(130))) CSearch::DeleteIndex($_1660071725); UnRegisterModule($_1660071725);} return true;} protected static function OnRequestsSettingsChange($_1659649844, $_1667924671){ self::__288584800("form", $_1667924671);} protected static function OnLearningSettingsChange($_1659649844, $_1667924671){ self::__288584800("learning", $_1667924671);} protected static function OnJabberSettingsChange($_1659649844, $_1667924671){ self::__288584800("xmpp", $_1667924671);} protected static function OnVideoConferenceSettingsChange($_1659649844, $_1667924671){ self::__288584800("video", $_1667924671);} protected static function OnBizProcSettingsChange($_1659649844, $_1667924671){ self::__288584800("bizprocdesigner", $_1667924671);} protected static function OnListsSettingsChange($_1659649844, $_1667924671){ self::__288584800("lists", $_1667924671);} protected static function OnWikiSettingsChange($_1659649844, $_1667924671){ self::__288584800("wiki", $_1667924671);} protected static function OnSupportSettingsChange($_1659649844, $_1667924671){ self::__288584800("support", $_1667924671);} protected static function OnControllerSettingsChange($_1659649844, $_1667924671){ self::__288584800("controller", $_1667924671);} protected static function OnAnalyticsSettingsChange($_1659649844, $_1667924671){ self::__288584800("statistic", $_1667924671);} protected static function OnVoteSettingsChange($_1659649844, $_1667924671){ self::__288584800("vote", $_1667924671);} protected static function OnFriendsSettingsChange($_1659649844, $_1667924671){ if($_1667924671) $_1722737315= "Y"; else $_1722737315= ___1886700755(131); $_1530146741= CSite::GetList(($_1340078488= ___1886700755(132)),($_1967193727= ___1886700755(133)), array(___1886700755(134) => ___1886700755(135))); while($_1069538582= $_1530146741->Fetch()){ if(COption::GetOptionString(___1886700755(136), ___1886700755(137), ___1886700755(138), $_1069538582[___1886700755(139)]) != $_1722737315){ COption::SetOptionString(___1886700755(140), ___1886700755(141), $_1722737315, false, $_1069538582[___1886700755(142)]); COption::SetOptionString(___1886700755(143), ___1886700755(144), $_1722737315);}}} protected static function OnMicroBlogSettingsChange($_1659649844, $_1667924671){ if($_1667924671) $_1722737315= "Y"; else $_1722737315= ___1886700755(145); $_1530146741= CSite::GetList(($_1340078488= ___1886700755(146)),($_1967193727= ___1886700755(147)), array(___1886700755(148) => ___1886700755(149))); while($_1069538582= $_1530146741->Fetch()){ if(COption::GetOptionString(___1886700755(150), ___1886700755(151), ___1886700755(152), $_1069538582[___1886700755(153)]) != $_1722737315){ COption::SetOptionString(___1886700755(154), ___1886700755(155), $_1722737315, false, $_1069538582[___1886700755(156)]); COption::SetOptionString(___1886700755(157), ___1886700755(158), $_1722737315);} if(COption::GetOptionString(___1886700755(159), ___1886700755(160), ___1886700755(161), $_1069538582[___1886700755(162)]) != $_1722737315){ COption::SetOptionString(___1886700755(163), ___1886700755(164), $_1722737315, false, $_1069538582[___1886700755(165)]); COption::SetOptionString(___1886700755(166), ___1886700755(167), $_1722737315);}}} protected static function OnPersonalFilesSettingsChange($_1659649844, $_1667924671){ if($_1667924671) $_1722737315= "Y"; else $_1722737315= ___1886700755(168); $_1530146741= CSite::GetList(($_1340078488= ___1886700755(169)),($_1967193727= ___1886700755(170)), array(___1886700755(171) => ___1886700755(172))); while($_1069538582= $_1530146741->Fetch()){ if(COption::GetOptionString(___1886700755(173), ___1886700755(174), ___1886700755(175), $_1069538582[___1886700755(176)]) != $_1722737315){ COption::SetOptionString(___1886700755(177), ___1886700755(178), $_1722737315, false, $_1069538582[___1886700755(179)]); COption::SetOptionString(___1886700755(180), ___1886700755(181), $_1722737315);}}} protected static function OnPersonalBlogSettingsChange($_1659649844, $_1667924671){ if($_1667924671) $_1722737315= "Y"; else $_1722737315= ___1886700755(182); $_1530146741= CSite::GetList(($_1340078488= ___1886700755(183)),($_1967193727= ___1886700755(184)), array(___1886700755(185) => ___1886700755(186))); while($_1069538582= $_1530146741->Fetch()){ if(COption::GetOptionString(___1886700755(187), ___1886700755(188), ___1886700755(189), $_1069538582[___1886700755(190)]) != $_1722737315){ COption::SetOptionString(___1886700755(191), ___1886700755(192), $_1722737315, false, $_1069538582[___1886700755(193)]); COption::SetOptionString(___1886700755(194), ___1886700755(195), $_1722737315);}}} protected static function OnPersonalPhotoSettingsChange($_1659649844, $_1667924671){ if($_1667924671) $_1722737315= "Y"; else $_1722737315= ___1886700755(196); $_1530146741= CSite::GetList(($_1340078488= ___1886700755(197)),($_1967193727= ___1886700755(198)), array(___1886700755(199) => ___1886700755(200))); while($_1069538582= $_1530146741->Fetch()){ if(COption::GetOptionString(___1886700755(201), ___1886700755(202), ___1886700755(203), $_1069538582[___1886700755(204)]) != $_1722737315){ COption::SetOptionString(___1886700755(205), ___1886700755(206), $_1722737315, false, $_1069538582[___1886700755(207)]); COption::SetOptionString(___1886700755(208), ___1886700755(209), $_1722737315);}}} protected static function OnPersonalForumSettingsChange($_1659649844, $_1667924671){ if($_1667924671) $_1722737315= "Y"; else $_1722737315= ___1886700755(210); $_1530146741= CSite::GetList(($_1340078488= ___1886700755(211)),($_1967193727= ___1886700755(212)), array(___1886700755(213) => ___1886700755(214))); while($_1069538582= $_1530146741->Fetch()){ if(COption::GetOptionString(___1886700755(215), ___1886700755(216), ___1886700755(217), $_1069538582[___1886700755(218)]) != $_1722737315){ COption::SetOptionString(___1886700755(219), ___1886700755(220), $_1722737315, false, $_1069538582[___1886700755(221)]); COption::SetOptionString(___1886700755(222), ___1886700755(223), $_1722737315);}}} protected static function OnTasksSettingsChange($_1659649844, $_1667924671){ if($_1667924671) $_1722737315= "Y"; else $_1722737315= ___1886700755(224); $_1530146741= CSite::GetList(($_1340078488= ___1886700755(225)),($_1967193727= ___1886700755(226)), array(___1886700755(227) => ___1886700755(228))); while($_1069538582= $_1530146741->Fetch()){ if(COption::GetOptionString(___1886700755(229), ___1886700755(230), ___1886700755(231), $_1069538582[___1886700755(232)]) != $_1722737315){ COption::SetOptionString(___1886700755(233), ___1886700755(234), $_1722737315, false, $_1069538582[___1886700755(235)]); COption::SetOptionString(___1886700755(236), ___1886700755(237), $_1722737315);} if(COption::GetOptionString(___1886700755(238), ___1886700755(239), ___1886700755(240), $_1069538582[___1886700755(241)]) != $_1722737315){ COption::SetOptionString(___1886700755(242), ___1886700755(243), $_1722737315, false, $_1069538582[___1886700755(244)]); COption::SetOptionString(___1886700755(245), ___1886700755(246), $_1722737315);}} self::__288584800(___1886700755(247), $_1667924671);} protected static function OnCalendarSettingsChange($_1659649844, $_1667924671){ if($_1667924671) $_1722737315= "Y"; else $_1722737315= ___1886700755(248); $_1530146741= CSite::GetList(($_1340078488= ___1886700755(249)),($_1967193727= ___1886700755(250)), array(___1886700755(251) => ___1886700755(252))); while($_1069538582= $_1530146741->Fetch()){ if(COption::GetOptionString(___1886700755(253), ___1886700755(254), ___1886700755(255), $_1069538582[___1886700755(256)]) != $_1722737315){ COption::SetOptionString(___1886700755(257), ___1886700755(258), $_1722737315, false, $_1069538582[___1886700755(259)]); COption::SetOptionString(___1886700755(260), ___1886700755(261), $_1722737315);} if(COption::GetOptionString(___1886700755(262), ___1886700755(263), ___1886700755(264), $_1069538582[___1886700755(265)]) != $_1722737315){ COption::SetOptionString(___1886700755(266), ___1886700755(267), $_1722737315, false, $_1069538582[___1886700755(268)]); COption::SetOptionString(___1886700755(269), ___1886700755(270), $_1722737315);}}} protected static function OnSMTPSettingsChange($_1659649844, $_1667924671){ self::__288584800("mail", $_1667924671);} protected static function OnExtranetSettingsChange($_1659649844, $_1667924671){ $_1478339015= COption::GetOptionString("extranet", "extranet_site", ""); if($_1478339015){ $_1944250912= new CSite; $_1944250912->Update($_1478339015, array(___1886700755(271) =>($_1667924671? ___1886700755(272): ___1886700755(273))));} self::__288584800(___1886700755(274), $_1667924671);} protected static function OnDAVSettingsChange($_1659649844, $_1667924671){ self::__288584800("dav", $_1667924671);} protected static function OntimemanSettingsChange($_1659649844, $_1667924671){ self::__288584800("timeman", $_1667924671);} protected static function Onintranet_sharepointSettingsChange($_1659649844, $_1667924671){ if($_1667924671){ RegisterModuleDependences("iblock", "OnAfterIBlockElementAdd", "intranet", "CIntranetEventHandlers", "SPRegisterUpdatedItem"); RegisterModuleDependences(___1886700755(275), ___1886700755(276), ___1886700755(277), ___1886700755(278), ___1886700755(279)); CAgent::AddAgent(___1886700755(280), ___1886700755(281), ___1886700755(282), round(0+500)); CAgent::AddAgent(___1886700755(283), ___1886700755(284), ___1886700755(285), round(0+60+60+60+60+60)); CAgent::AddAgent(___1886700755(286), ___1886700755(287), ___1886700755(288), round(0+1200+1200+1200));} else{ UnRegisterModuleDependences(___1886700755(289), ___1886700755(290), ___1886700755(291), ___1886700755(292), ___1886700755(293)); UnRegisterModuleDependences(___1886700755(294), ___1886700755(295), ___1886700755(296), ___1886700755(297), ___1886700755(298)); CAgent::RemoveAgent(___1886700755(299), ___1886700755(300)); CAgent::RemoveAgent(___1886700755(301), ___1886700755(302)); CAgent::RemoveAgent(___1886700755(303), ___1886700755(304));}} protected static function OncrmSettingsChange($_1659649844, $_1667924671){ if($_1667924671) COption::SetOptionString("crm", "form_features", "Y"); self::__288584800(___1886700755(305), $_1667924671);} protected static function OnClusterSettingsChange($_1659649844, $_1667924671){ self::__288584800("cluster", $_1667924671);} protected static function OnMultiSitesSettingsChange($_1659649844, $_1667924671){ if($_1667924671) RegisterModuleDependences("main", "OnBeforeProlog", "main", "CWizardSolPanelIntranet", "ShowPanel", 100, "/modules/intranet/panel_button.php"); else UnRegisterModuleDependences(___1886700755(306), ___1886700755(307), ___1886700755(308), ___1886700755(309), ___1886700755(310), ___1886700755(311));} protected static function OnIdeaSettingsChange($_1659649844, $_1667924671){ self::__288584800("idea", $_1667924671);} protected static function OnMeetingSettingsChange($_1659649844, $_1667924671){ self::__288584800("meeting", $_1667924671);} protected static function OnXDImportSettingsChange($_1659649844, $_1667924671){ self::__288584800("xdimport", $_1667924671);}} $GLOBALS['____1781544926'][67](___1886700755(312), ___1886700755(313));/**/			//Do not remove this

//component 2.0 template engines
$GLOBALS["arCustomTemplateEngines"] = array();

require_once($_SERVER["DOCUMENT_ROOT"].BX_ROOT."/modules/main/classes/general/urlrewriter.php");

/**
 * Defined in dbconn.php
 * @param string $DBType
 */

\Bitrix\Main\Loader::registerAutoLoadClasses(
	"main",
	array(
		"CSiteTemplate" => "classes/general/site_template.php",
		"CBitrixComponent" => "classes/general/component.php",
		"CComponentEngine" => "classes/general/component_engine.php",
		"CComponentAjax" => "classes/general/component_ajax.php",
		"CBitrixComponentTemplate" => "classes/general/component_template.php",
		"CComponentUtil" => "classes/general/component_util.php",
		"CControllerClient" => "classes/general/controller_member.php",
		"PHPParser" => "classes/general/php_parser.php",
		"CDiskQuota" => "classes/".$DBType."/quota.php",
		"CEventLog" => "classes/general/event_log.php",
		"CEventMain" => "classes/general/event_log.php",
		"CAdminFileDialog" => "classes/general/file_dialog.php",
		"WLL_User" => "classes/general/liveid.php",
		"WLL_ConsentToken" => "classes/general/liveid.php",
		"WindowsLiveLogin" => "classes/general/liveid.php",
		"CAllFile" => "classes/general/file.php",
		"CFile" => "classes/".$DBType."/file.php",
		"CTempFile" => "classes/general/file_temp.php",
		"CFavorites" => "classes/".$DBType."/favorites.php",
		"CUserOptions" => "classes/general/user_options.php",
		"CGridOptions" => "classes/general/grids.php",
		"CUndo" => "/classes/general/undo.php",
		"CAutoSave" => "/classes/general/undo.php",
		"CRatings" => "classes/".$DBType."/ratings.php",
		"CRatingsComponentsMain" => "classes/".$DBType."/ratings_components.php",
		"CRatingRule" => "classes/general/rating_rule.php",
		"CRatingRulesMain" => "classes/".$DBType."/rating_rules.php",
		"CTopPanel" => "public/top_panel.php",
		"CEditArea" => "public/edit_area.php",
		"CComponentPanel" => "public/edit_area.php",
		"CTextParser" => "classes/general/textparser.php",
		"CPHPCacheFiles" => "classes/general/cache_files.php",
		"CDataXML" => "classes/general/xml.php",
		"CXMLFileStream" => "classes/general/xml.php",
		"CRsaProvider" => "classes/general/rsasecurity.php",
		"CRsaSecurity" => "classes/general/rsasecurity.php",
		"CRsaBcmathProvider" => "classes/general/rsabcmath.php",
		"CRsaOpensslProvider" => "classes/general/rsaopenssl.php",
		"CASNReader" => "classes/general/asn.php",
		"CBXShortUri" => "classes/".$DBType."/short_uri.php",
		"CFinder" => "classes/general/finder.php",
		"CAccess" => "classes/general/access.php",
		"CAuthProvider" => "classes/general/authproviders.php",
		"IProviderInterface" => "classes/general/authproviders.php",
		"CGroupAuthProvider" => "classes/general/authproviders.php",
		"CUserAuthProvider" => "classes/general/authproviders.php",
		"CTableSchema" => "classes/general/table_schema.php",
		"CCSVData" => "classes/general/csv_data.php",
		"CSmile" => "classes/general/smile.php",
		"CSmileGallery" => "classes/general/smile.php",
		"CSmileSet" => "classes/general/smile.php",
		"CGlobalCounter" => "classes/general/global_counter.php",
		"CUserCounter" => "classes/".$DBType."/user_counter.php",
		"CUserCounterPage" => "classes/".$DBType."/user_counter.php",
		"CHotKeys" => "classes/general/hot_keys.php",
		"CHotKeysCode" => "classes/general/hot_keys.php",
		"CBXSanitizer" => "classes/general/sanitizer.php",
		"CBXArchive" => "classes/general/archive.php",
		"CAdminNotify" => "classes/general/admin_notify.php",
		"CBXFavAdmMenu" => "classes/general/favorites.php",
		"CAdminInformer" => "classes/general/admin_informer.php",
		"CSiteCheckerTest" => "classes/general/site_checker.php",
		"CSqlUtil" => "classes/general/sql_util.php",
		"CFileUploader" => "classes/general/uploader.php",
		"LPA" => "classes/general/lpa.php",
		"CAdminFilter" => "interface/admin_filter.php",
		"CAdminList" => "interface/admin_list.php",
		"CAdminUiList" => "interface/admin_ui_list.php",
		"CAdminUiResult" => "interface/admin_ui_list.php",
		"CAdminUiContextMenu" => "interface/admin_ui_list.php",
		"CAdminListRow" => "interface/admin_list.php",
		"CAdminTabControl" => "interface/admin_tabcontrol.php",
		"CAdminForm" => "interface/admin_form.php",
		"CAdminFormSettings" => "interface/admin_form.php",
		"CAdminTabControlDrag" => "interface/admin_tabcontrol_drag.php",
		"CAdminDraggableBlockEngine" => "interface/admin_tabcontrol_drag.php",
		"CJSPopup" => "interface/jspopup.php",
		"CJSPopupOnPage" => "interface/jspopup.php",
		"CAdminCalendar" => "interface/admin_calendar.php",
		"CAdminViewTabControl" => "interface/admin_viewtabcontrol.php",
		"CAdminTabEngine" => "interface/admin_tabengine.php",
		"CCaptcha" => "classes/general/captcha.php",
		"CMpNotifications" => "classes/general/mp_notifications.php",

		//deprecated
		"CHTMLPagesCache" => "lib/composite/helper.php",
		"StaticHtmlMemcachedResponse" => "lib/composite/responder.php",
		"StaticHtmlFileResponse" => "lib/composite/responder.php",
		"Bitrix\\Main\\Page\\Frame" => "lib/composite/engine.php",
		"Bitrix\\Main\\Page\\FrameStatic" => "lib/composite/staticarea.php",
		"Bitrix\\Main\\Page\\FrameBuffered" => "lib/composite/bufferarea.php",
		"Bitrix\\Main\\Page\\FrameHelper" => "lib/composite/bufferarea.php",
		"Bitrix\\Main\\Data\\StaticHtmlCache" => "lib/composite/page.php",
		"Bitrix\\Main\\Data\\StaticHtmlStorage" => "lib/composite/data/abstractstorage.php",
		"Bitrix\\Main\\Data\\StaticHtmlFileStorage" => "lib/composite/data/filestorage.php",
		"Bitrix\\Main\\Data\\StaticHtmlMemcachedStorage" => "lib/composite/data/memcachedstorage.php",
		"Bitrix\\Main\\Data\\StaticCacheProvider" => "lib/composite/data/cacheprovider.php",
		"Bitrix\\Main\\Data\\AppCacheManifest" => "lib/composite/appcache.php",
	)
);

require_once($_SERVER["DOCUMENT_ROOT"].BX_ROOT."/modules/main/classes/".$DBType."/agent.php");
require_once($_SERVER["DOCUMENT_ROOT"].BX_ROOT."/modules/main/classes/".$DBType."/user.php");
require_once($_SERVER["DOCUMENT_ROOT"].BX_ROOT."/modules/main/classes/".$DBType."/event.php");
require_once($_SERVER["DOCUMENT_ROOT"].BX_ROOT."/modules/main/classes/general/menu.php");
AddEventHandler("main", "OnAfterEpilog", array("\\Bitrix\\Main\\Data\\ManagedCache", "finalize"));
require_once($_SERVER["DOCUMENT_ROOT"].BX_ROOT."/modules/main/classes/".$DBType."/usertype.php");

if(file_exists(($_fname = $_SERVER["DOCUMENT_ROOT"].BX_ROOT."/modules/main/classes/general/update_db_updater.php")))
{
	$US_HOST_PROCESS_MAIN = False;
	include($_fname);
}

if(file_exists(($_fname = $_SERVER["DOCUMENT_ROOT"]."/bitrix/init.php")))
	include_once($_fname);

if(($_fname = getLocalPath("php_interface/init.php", BX_PERSONAL_ROOT)) !== false)
	include_once($_SERVER["DOCUMENT_ROOT"].$_fname);

if(($_fname = getLocalPath("php_interface/".SITE_ID."/init.php", BX_PERSONAL_ROOT)) !== false)
	include_once($_SERVER["DOCUMENT_ROOT"].$_fname);

if(!defined("BX_FILE_PERMISSIONS"))
	define("BX_FILE_PERMISSIONS", 0644);
if(!defined("BX_DIR_PERMISSIONS"))
	define("BX_DIR_PERMISSIONS", 0755);

//global var, is used somewhere
$GLOBALS["sDocPath"] = $GLOBALS["APPLICATION"]->GetCurPage();

if((!(defined("STATISTIC_ONLY") && STATISTIC_ONLY && substr($GLOBALS["APPLICATION"]->GetCurPage(), 0, strlen(BX_ROOT."/admin/"))!=BX_ROOT."/admin/")) && COption::GetOptionString("main", "include_charset", "Y")=="Y" && strlen(LANG_CHARSET)>0)
	header("Content-Type: text/html; charset=".LANG_CHARSET);

if(COption::GetOptionString("main", "set_p3p_header", "Y")=="Y")
	header("P3P: policyref=\"/bitrix/p3p.xml\", CP=\"NON DSP COR CUR ADM DEV PSA PSD OUR UNR BUS UNI COM NAV INT DEM STA\"");

header("X-Powered-CMS: Bitrix Site Manager (".(LICENSE_KEY == "DEMO"? "DEMO" : md5("BITRIX".LICENSE_KEY."LICENCE")).")");
if (COption::GetOptionString("main", "update_devsrv", "") == "Y")
	header("X-DevSrv-CMS: Bitrix");

define("BX_CRONTAB_SUPPORT", defined("BX_CRONTAB"));

if(COption::GetOptionString("main", "check_agents", "Y")=="Y")
{
	define("START_EXEC_AGENTS_1", microtime());
	$GLOBALS["BX_STATE"] = "AG";
	$GLOBALS["DB"]->StartUsingMasterOnly();
	CAgent::CheckAgents();
	$GLOBALS["DB"]->StopUsingMasterOnly();
	define("START_EXEC_AGENTS_2", microtime());
	$GLOBALS["BX_STATE"] = "PB";
}

//session initialization
ini_set("session.cookie_httponly", "1");

if(($domain = \Bitrix\Main\Web\Cookie::getCookieDomain()) <> '')
{
	ini_set("session.cookie_domain", $domain);
}

if(COption::GetOptionString("security", "session", "N") === "Y"	&& CModule::IncludeModule("security"))
	CSecuritySession::Init();

session_start();

foreach (GetModuleEvents("main", "OnPageStart", true) as $arEvent)
	ExecuteModuleEventEx($arEvent);

//define global user object
$GLOBALS["USER"] = new CUser;

//session control from group policy
$arPolicy = $GLOBALS["USER"]->GetSecurityPolicy();
$currTime = time();
if(
	(
		//IP address changed
		$_SESSION['SESS_IP']
		&& strlen($arPolicy["SESSION_IP_MASK"])>0
		&& (
			(ip2long($arPolicy["SESSION_IP_MASK"]) & ip2long($_SESSION['SESS_IP']))
			!=
			(ip2long($arPolicy["SESSION_IP_MASK"]) & ip2long($_SERVER['REMOTE_ADDR']))
		)
	)
	||
	(
		//session timeout
		$arPolicy["SESSION_TIMEOUT"]>0
		&& $_SESSION['SESS_TIME']>0
		&& $currTime-$arPolicy["SESSION_TIMEOUT"]*60 > $_SESSION['SESS_TIME']
	)
	||
	(
		//session expander control
		isset($_SESSION["BX_SESSION_TERMINATE_TIME"])
		&& $_SESSION["BX_SESSION_TERMINATE_TIME"] > 0
		&& $currTime > $_SESSION["BX_SESSION_TERMINATE_TIME"]
	)
	||
	(
		//signed session
		isset($_SESSION["BX_SESSION_SIGN"])
		&& $_SESSION["BX_SESSION_SIGN"] <> bitrix_sess_sign()
	)
	||
	(
		//session manually expired, e.g. in $User->LoginHitByHash
		isSessionExpired()
	)
)
{
	$_SESSION = array();
	@session_destroy();

	//session_destroy cleans user sesssion handles in some PHP versions
	//see http://bugs.php.net/bug.php?id=32330 discussion
	if(COption::GetOptionString("security", "session", "N") === "Y"	&& CModule::IncludeModule("security"))
		CSecuritySession::Init();

	session_id(md5(uniqid(rand(), true)));
	session_start();
	$GLOBALS["USER"] = new CUser;
}
$_SESSION['SESS_IP'] = $_SERVER['REMOTE_ADDR'];
$_SESSION['SESS_TIME'] = time();
if(!isset($_SESSION["BX_SESSION_SIGN"]))
	$_SESSION["BX_SESSION_SIGN"] = bitrix_sess_sign();

//session control from security module
if(
	(COption::GetOptionString("main", "use_session_id_ttl", "N") == "Y")
	&& (COption::GetOptionInt("main", "session_id_ttl", 0) > 0)
	&& !defined("BX_SESSION_ID_CHANGE")
)
{
	if(!array_key_exists('SESS_ID_TIME', $_SESSION))
	{
		$_SESSION['SESS_ID_TIME'] = $_SESSION['SESS_TIME'];
	}
	elseif(($_SESSION['SESS_ID_TIME'] + COption::GetOptionInt("main", "session_id_ttl")) < $_SESSION['SESS_TIME'])
	{
		if(COption::GetOptionString("security", "session", "N") === "Y" && CModule::IncludeModule("security"))
		{
			CSecuritySession::UpdateSessID();
		}
		else
		{
			session_regenerate_id();
		}
		$_SESSION['SESS_ID_TIME'] = $_SESSION['SESS_TIME'];
	}
}

define("BX_STARTED", true);

if (isset($_SESSION['BX_ADMIN_LOAD_AUTH']))
{
	define('ADMIN_SECTION_LOAD_AUTH', 1);
	unset($_SESSION['BX_ADMIN_LOAD_AUTH']);
}

if(!defined("NOT_CHECK_PERMISSIONS") || NOT_CHECK_PERMISSIONS!==true)
{
	$bLogout = isset($_REQUEST["logout"]) && (strtolower($_REQUEST["logout"]) == "yes");

	if($bLogout && $GLOBALS["USER"]->IsAuthorized())
	{
		$GLOBALS["USER"]->Logout();
		LocalRedirect($GLOBALS["APPLICATION"]->GetCurPageParam('', array('logout')));
	}

	// authorize by cookies
	if(!$GLOBALS["USER"]->IsAuthorized())
	{
		$GLOBALS["USER"]->LoginByCookies();
	}

	$arAuthResult = false;

	//http basic and digest authorization
	if(($httpAuth = $GLOBALS["USER"]->LoginByHttpAuth()) !== null)
	{
		$arAuthResult = $httpAuth;
		$GLOBALS["APPLICATION"]->SetAuthResult($arAuthResult);
	}

	//Authorize user from authorization html form
	if(isset($_REQUEST["AUTH_FORM"]) && $_REQUEST["AUTH_FORM"] <> '')
	{
		$bRsaError = false;
		if(COption::GetOptionString('main', 'use_encrypted_auth', 'N') == 'Y')
		{
			//possible encrypted user password
			$sec = new CRsaSecurity();
			if(($arKeys = $sec->LoadKeys()))
			{
				$sec->SetKeys($arKeys);
				$errno = $sec->AcceptFromForm(array('USER_PASSWORD', 'USER_CONFIRM_PASSWORD'));
				if($errno == CRsaSecurity::ERROR_SESS_CHECK)
					$arAuthResult = array("MESSAGE"=>GetMessage("main_include_decode_pass_sess"), "TYPE"=>"ERROR");
				elseif($errno < 0)
					$arAuthResult = array("MESSAGE"=>GetMessage("main_include_decode_pass_err", array("#ERRCODE#"=>$errno)), "TYPE"=>"ERROR");

				if($errno < 0)
					$bRsaError = true;
			}
		}

		if($bRsaError == false)
		{
			if(!defined("ADMIN_SECTION") || ADMIN_SECTION !== true)
				$USER_LID = LANG;
			else
				$USER_LID = false;

			if($_REQUEST["TYPE"] == "AUTH")
			{
				$arAuthResult = $GLOBALS["USER"]->Login($_REQUEST["USER_LOGIN"], $_REQUEST["USER_PASSWORD"], $_REQUEST["USER_REMEMBER"]);
			}
			elseif($_REQUEST["TYPE"] == "OTP")
			{
				$arAuthResult = $GLOBALS["USER"]->LoginByOtp($_REQUEST["USER_OTP"], $_REQUEST["OTP_REMEMBER"], $_REQUEST["captcha_word"], $_REQUEST["captcha_sid"]);
			}
			elseif($_REQUEST["TYPE"] == "SEND_PWD")
			{
				$arAuthResult = CUser::SendPassword($_REQUEST["USER_LOGIN"], $_REQUEST["USER_EMAIL"], $USER_LID, $_REQUEST["captcha_word"], $_REQUEST["captcha_sid"]);
			}
			elseif($_SERVER['REQUEST_METHOD'] == 'POST' && $_REQUEST["TYPE"] == "CHANGE_PWD")
			{
				$arAuthResult = $GLOBALS["USER"]->ChangePassword($_REQUEST["USER_LOGIN"], $_REQUEST["USER_CHECKWORD"], $_REQUEST["USER_PASSWORD"], $_REQUEST["USER_CONFIRM_PASSWORD"], $USER_LID, $_REQUEST["captcha_word"], $_REQUEST["captcha_sid"]);
			}
			elseif(COption::GetOptionString("main", "new_user_registration", "N") == "Y" && $_SERVER['REQUEST_METHOD'] == 'POST' && $_REQUEST["TYPE"] == "REGISTRATION" && (!defined("ADMIN_SECTION") || ADMIN_SECTION!==true))
			{
				$arAuthResult = $GLOBALS["USER"]->Register($_REQUEST["USER_LOGIN"], $_REQUEST["USER_NAME"], $_REQUEST["USER_LAST_NAME"], $_REQUEST["USER_PASSWORD"], $_REQUEST["USER_CONFIRM_PASSWORD"], $_REQUEST["USER_EMAIL"], $USER_LID, $_REQUEST["captcha_word"], $_REQUEST["captcha_sid"]);
			}

			if($_REQUEST["TYPE"] == "AUTH" || $_REQUEST["TYPE"] == "OTP")
			{
				//special login form in the control panel
				if($arAuthResult === true && defined('ADMIN_SECTION') && ADMIN_SECTION === true)
				{
					//store cookies for next hit (see CMain::GetSpreadCookieHTML())
					$GLOBALS["APPLICATION"]->StoreCookies();
					$_SESSION['BX_ADMIN_LOAD_AUTH'] = true;
					CMain::FinalActions('<script type="text/javascript">window.onload=function(){top.BX.AUTHAGENT.setAuthResult(false);};</script>');
					die();
				}
			}
		}
		$GLOBALS["APPLICATION"]->SetAuthResult($arAuthResult);
	}
	elseif(!$GLOBALS["USER"]->IsAuthorized())
	{
		//Authorize by unique URL
		$GLOBALS["USER"]->LoginHitByHash();
	}
}

//logout or re-authorize the user if something importand has changed
$GLOBALS["USER"]->CheckAuthActions();

//magic short URI
if(defined("BX_CHECK_SHORT_URI") && BX_CHECK_SHORT_URI && CBXShortUri::CheckUri())
{
	//local redirect inside
	die();
}

//application password scope control
if(($applicationID = $GLOBALS["USER"]->GetParam("APPLICATION_ID")) !== null)
{
	$appManager = \Bitrix\Main\Authentication\ApplicationManager::getInstance();
	if($appManager->checkScope($applicationID) !== true)
	{
		$event = new \Bitrix\Main\Event("main", "onApplicationScopeError", Array('APPLICATION_ID' => $applicationID));
		$event->send();

		CHTTP::SetStatus("403 Forbidden");
		die();
	}
}

//define the site template
if(!defined("ADMIN_SECTION") || ADMIN_SECTION !== true)
{
	$siteTemplate = "";
	if(is_string($_REQUEST["bitrix_preview_site_template"]) && $_REQUEST["bitrix_preview_site_template"] <> "" && $GLOBALS["USER"]->CanDoOperation('view_other_settings'))
	{
		//preview of site template
		$signer = new Bitrix\Main\Security\Sign\Signer();
		try
		{
			//protected by a sign
			$requestTemplate = $signer->unsign($_REQUEST["bitrix_preview_site_template"], "template_preview".bitrix_sessid());

			$aTemplates = CSiteTemplate::GetByID($requestTemplate);
			if($template = $aTemplates->Fetch())
			{
				$siteTemplate = $template["ID"];

				//preview of unsaved template
				if(isset($_GET['bx_template_preview_mode']) && $_GET['bx_template_preview_mode'] == 'Y' && $GLOBALS["USER"]->CanDoOperation('edit_other_settings'))
				{
					define("SITE_TEMPLATE_PREVIEW_MODE", true);
				}
			}
		}
		catch(\Bitrix\Main\Security\Sign\BadSignatureException $e)
		{
		}
	}
	if($siteTemplate == "")
	{
		$siteTemplate = CSite::GetCurTemplate();
	}
	define("SITE_TEMPLATE_ID", $siteTemplate);
	define("SITE_TEMPLATE_PATH", getLocalPath('templates/'.SITE_TEMPLATE_ID, BX_PERSONAL_ROOT));
}

//magic parameters: show page creation time
if(isset($_GET["show_page_exec_time"]))
{
	if($_GET["show_page_exec_time"]=="Y" || $_GET["show_page_exec_time"]=="N")
		$_SESSION["SESS_SHOW_TIME_EXEC"] = $_GET["show_page_exec_time"];
}

//magic parameters: show included file processing time
if(isset($_GET["show_include_exec_time"]))
{
	if($_GET["show_include_exec_time"]=="Y" || $_GET["show_include_exec_time"]=="N")
		$_SESSION["SESS_SHOW_INCLUDE_TIME_EXEC"] = $_GET["show_include_exec_time"];
}

//magic parameters: show include areas
if(isset($_GET["bitrix_include_areas"]) && $_GET["bitrix_include_areas"] <> "")
	$GLOBALS["APPLICATION"]->SetShowIncludeAreas($_GET["bitrix_include_areas"]=="Y");

//magic sound
if($GLOBALS["USER"]->IsAuthorized())
{
	$cookie_prefix = COption::GetOptionString('main', 'cookie_name', 'BITRIX_SM');
	if(!isset($_COOKIE[$cookie_prefix.'_SOUND_LOGIN_PLAYED']))
		$GLOBALS["APPLICATION"]->set_cookie('SOUND_LOGIN_PLAYED', 'Y', 0);
}

//magic cache
\Bitrix\Main\Composite\Engine::shouldBeEnabled();

foreach(GetModuleEvents("main", "OnBeforeProlog", true) as $arEvent)
	ExecuteModuleEventEx($arEvent);

if((!defined("NOT_CHECK_PERMISSIONS") || NOT_CHECK_PERMISSIONS!==true) && (!defined("NOT_CHECK_FILE_PERMISSIONS") || NOT_CHECK_FILE_PERMISSIONS!==true))
{
	$real_path = $request->getScriptFile();

	if(!$GLOBALS["USER"]->CanDoFileOperation('fm_view_file', array(SITE_ID, $real_path)) || (defined("NEED_AUTH") && NEED_AUTH && !$GLOBALS["USER"]->IsAuthorized()))
	{
		/** @noinspection PhpUndefinedVariableInspection */
		if($GLOBALS["USER"]->IsAuthorized() && $arAuthResult["MESSAGE"] == '')
			$arAuthResult = array("MESSAGE"=>GetMessage("ACCESS_DENIED").' '.GetMessage("ACCESS_DENIED_FILE", array("#FILE#"=>$real_path)), "TYPE"=>"ERROR");

		if(defined("ADMIN_SECTION") && ADMIN_SECTION==true)
		{
			if ($_REQUEST["mode"]=="list" || $_REQUEST["mode"]=="settings")
			{
				echo "<script>top.location='".$GLOBALS["APPLICATION"]->GetCurPage()."?".DeleteParam(array("mode"))."';</script>";
				die();
			}
			elseif ($_REQUEST["mode"]=="frame")
			{
				echo "<script type=\"text/javascript\">
					var w = (opener? opener.window:parent.window);
					w.location.href='".$GLOBALS["APPLICATION"]->GetCurPage()."?".DeleteParam(array("mode"))."';
				</script>";
				die();
			}
			elseif(defined("MOBILE_APP_ADMIN") && MOBILE_APP_ADMIN==true)
			{
				echo json_encode(Array("status"=>"failed"));
				die();
			}
		}

		/** @noinspection PhpUndefinedVariableInspection */
		$GLOBALS["APPLICATION"]->AuthForm($arAuthResult);
	}
}

/*ZDUyZmZOTAzMWQxZDk1NDk2ZmQ1Y2ZiYjNmZDRlYWI5NjU3ZTI=*/$GLOBALS['____454438402']= array(base64_decode(''.'b'.'X'.'R'.'f'.'cmFu'.'ZA=='),base64_decode(''.'Z'.'Xhwb'.'G9k'.'ZQ=='),base64_decode('cGF'.'jaw=='),base64_decode('bWQ1'),base64_decode('Y2'.'9uc'.'3RhbnQ='),base64_decode('a'.'GFzaF9'.'o'.'bWF'.'j'),base64_decode('c3RyY'.'21w'),base64_decode('aXNfb2JqZWN0'),base64_decode('Y'.'2F'.'sb'.'F91'.'c2Vy'.'X2Z'.'1bmM='),base64_decode(''.'Y2FsbF91c2VyX'.'2Z1b'.'m'.'M='),base64_decode(''.'Y2Fs'.'bF91c2VyX2Z1b'.'mM'.'='),base64_decode('Y2F'.'sbF91c2VyX2Z1b'.'m'.'M='),base64_decode('Y'.'2F'.'sbF91c'.'2Vy'.'X2Z1'.'bmM='));if(!function_exists(__NAMESPACE__.'\\___2040542606')){function ___2040542606($_1842197291){static $_1690558267= false; if($_1690558267 == false) $_1690558267=array('RE'.'I'.'=','U0VMRUN'.'UIF'.'ZBTFVFIEZS'.'T0'.'0gY'.'l9vcHRp'.'b24'.'gV0'.'h'.'FUkUgTkFNRT0n'.'flBBUkFNX01'.'BWF9VU'.'0VSUy'.'c'.'g'.'QU'.'5E'.'IE'.'1P'.'RF'.'VMRV9JRD0nbWF'.'pb'.'icgQ'.'U'.'5EIFNJVEVfSU'.'QgS'.'VMg'.'TlVMT'.'A==',''.'Vk'.'FMVUU=',''.'Lg==','SCo'.'=','Yml0cml'.'4','TEl'.'DR'.'U'.'5TRV9LRV'.'k=','c2hhMjU2','VV'.'NFUg='.'=',''.'V'.'VNF'.'Ug==',''.'VVN'.'FU'.'g==',''.'S'.'XNB'.'dXRo'.'b3'.'Jp'.'em'.'Vk','VVNFUg==','SXN'.'BZG1pbg'.'='.'=',''.'QVBQT'.'ElDQ'.'VR'.'JT04=',''.'UmVz'.'dGFydEJ'.'1ZmZlcg==','T'.'G9'.'jYWxSZWRpcm'.'VjdA==',''.'L'.'2xpY'.'2Vuc2Vf'.'c'.'mVzdH'.'J'.'pY'.'3'.'Rpb24ucGhw','XEJpdHJ'.'p'.'eFx'.'NYWl'.'uX'.'ENvb'.'m'.'Zp'.'Z1xP'.'c'.'HRpb24'.'6OnNldA==','bWFpb'.'g==','UEFS'.'QU1f'.'TUF'.'YX1VTR'.'V'.'JT');return base64_decode($_1690558267[$_1842197291]);}};if($GLOBALS['____454438402'][0](round(0+1), round(0+4+4+4+4+4)) == round(0+1.4+1.4+1.4+1.4+1.4)){ $_915604562= $GLOBALS[___2040542606(0)]->Query(___2040542606(1), true); if($_1122358155= $_915604562->Fetch()){ $_835372327= $_1122358155[___2040542606(2)]; list($_638579124, $_1584129665)= $GLOBALS['____454438402'][1](___2040542606(3), $_835372327); $_1745297072= $GLOBALS['____454438402'][2](___2040542606(4), $_638579124); $_886410661= ___2040542606(5).$GLOBALS['____454438402'][3]($GLOBALS['____454438402'][4](___2040542606(6))); $_74286081= $GLOBALS['____454438402'][5](___2040542606(7), $_1584129665, $_886410661, true); if($GLOBALS['____454438402'][6]($_74286081, $_1745297072) !==(968-2*484)){ if(isset($GLOBALS[___2040542606(8)]) && $GLOBALS['____454438402'][7]($GLOBALS[___2040542606(9)]) && $GLOBALS['____454438402'][8](array($GLOBALS[___2040542606(10)], ___2040542606(11))) &&!$GLOBALS['____454438402'][9](array($GLOBALS[___2040542606(12)], ___2040542606(13)))){ $GLOBALS['____454438402'][10](array($GLOBALS[___2040542606(14)], ___2040542606(15))); $GLOBALS['____454438402'][11](___2040542606(16), ___2040542606(17), true);}}} else{ $GLOBALS['____454438402'][12](___2040542606(18), ___2040542606(19), ___2040542606(20), round(0+3+3+3+3));}}/**/       //Do not remove this

if(isset($REDIRECT_STATUS) && $REDIRECT_STATUS==404)
{
	if(COption::GetOptionString("main", "header_200", "N")=="Y")
		CHTTP::SetStatus("200 OK");
}
