<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)
	die();
	
if (WIZARD_INSTALL_DEMO_STRUCTURE && CModule::IncludeModule('im'))
{
	$generalChatId = CIMChat::GetGeneralChatId();
	if ($generalChatId > 0)
	{
		CIMChat::UnlinkGeneralChatId();

		global $DB;

		$strSQL = "DELETE FROM b_im_relation WHERE CHAT_ID = ".intval($generalChatId);
		$DB->Query($strSQL, true, "File: ".__FILE__."<br>Line: ".__LINE__);
	}
}
?>