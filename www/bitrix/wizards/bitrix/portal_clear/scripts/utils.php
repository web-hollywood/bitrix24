<?
class WizardServices
{
	function GetCurrentSiteID($selectedSiteID = null)
	{
		if (strlen($selectedSiteID) > 0)
		{
			$obSite = CSite::GetList($by = "def", $order = "desc", Array("LID" => $selectedSiteID));
			if (!$arSite = $obSite->Fetch())
				$selectedSiteID = null;
		}

		$currentSiteID = $selectedSiteID;
		if ($currentSiteID == null)
		{
			$currentSiteID = SITE_ID;
			if (defined("ADMIN_SECTION"))
			{
				$obSite = CSite::GetList($by = "def", $order = "desc", Array("ACTIVE" => "Y"));
				if ($arSite = $obSite->Fetch())
					$currentSiteID = $arSite["LID"];
			}
		}
		return $currentSiteID;
	}
}
?>