<?php
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)
	die();

if (!defined("WIZARD_SITE_ID"))
	return;

if (WIZARD_FIRST_INSTAL !== "Y" && WIZARD_SITE_ID != 's1')
{
	$arEventType = array("INTRANET_USER_INVITATION", "INTRANET_USER_ADD");

	foreach ($arEventType as $eventType)
	{
		$dbEventMessage = CEventMessage::GetList($b="ID", $order="ASC", Array("EVENT_NAME" => $eventType));
		while($arEventMessage = $dbEventMessage->Fetch())
		{
			$arSiteId = array();
			$dbEventMessageSite = CEventMessage::GetSite($arEventMessage["ID"]);
			while($arEventMessageSite = $dbEventMessageSite->Fetch())
			{
				$arSiteId[] = $arEventMessageSite["LID"];
			}

			if (!in_array(WIZARD_SITE_ID, $arSiteId))
			{
				$arSiteId[] = WIZARD_SITE_ID;
				if (null == $em) $em = new CEventMessage();
				$em->Update($arEventMessage["ID"], array('LID' => $arSiteId));
			}
		}
	}
}