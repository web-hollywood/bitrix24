<?if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) die();

$this->setFrameMode(true);

//additional style array for composite case
$arResult["ADDITIONAL_STYLES"] = array();

foreach ($arResult["ITEMS"] as $code => &$module)
{
	switch($code)
	{
		case "mail":
			{
				foreach ($module as &$item)
				{
					$item["LOGO_CLASS"] = "intranet-contact-logo-mail";
					$item["COLOR_CLASS"] = "intranet-contact-item-green";
				}
			}

			break;

		case "voximplant" :
			{
				foreach ($module as &$item)
				{
					$item["LOGO_CLASS"] = "intranet-contact-logo-tel";
					$item["COLOR_CLASS"] = "intranet-contact-item-azure";
				}
			}
			break;

		case "crm" :
			{
				$crmProviders = array(
					"widget" => array(
						"LOGO_CLASS" => "intranet-contact-logo-widget",
						"COLOR_CLASS" => "intranet-contact-item-orange",
					),
					"form" => array(
						"LOGO_CLASS" => "intranet-contact-logo-form",
						"COLOR_CLASS" => "intranet-contact-item-darkgreen",
					),
					"call" => array(
						"LOGO_CLASS" => "intranet-contact-logo-call",
						"COLOR_CLASS" => "intranet-contact-item-red",
					),
				);

				if (\Bitrix\Crm\Ads\AdsForm::canUse())
				{
					$codeMap = \Bitrix\Crm\Ads\AdsForm::getAdsIconMap();
					$arResult["ADDITIONAL_STYLES"][] = \Bitrix\Crm\Ads\AdsForm::getServicesBackgroundColorCss();
				}

				foreach ($module as $itemCode => &$item)
				{
					//case for "ads"-providers
					if (empty($crmProviders[$itemCode]) && \Bitrix\Crm\Ads\AdsForm::canUse())
					{
						$itemCodeOriginal = substr($itemCode, 0, -3);
						$crmProviders[$itemCode] = array(
							"LOGO_CLASS" => "ui-icon ui-icon-service-" . $codeMap[$itemCodeOriginal],
							"COLOR_CLASS" => "intranet-" . $itemCodeOriginal . "-background-color"
						);
					}

					unset($options);
					$item = array_merge($item, $crmProviders[$itemCode]);
				}
			}
			break;

		case "imopenlines" :
			{
				if(\Bitrix\Main\Composite\Helper::isCompositeEnabled())
				{
					\Bitrix\Main\UI\Extension::load("ui.icons");
					if (method_exists("\Bitrix\ImConnector\Connector", "getAdditionalStyles"))
					{
						$iconStyle = \Bitrix\ImConnector\Connector::getAdditionalStyles();
						$arResult["ADDITIONAL_STYLES"][] = $iconStyle;
					}
				}
				else
				{
					\Bitrix\ImConnector\Connector::initIconCss();
				}

				$codeMap = \Bitrix\ImConnector\Connector::getIconClassMap();

				foreach ($module as $itemCode => &$item)
				{
					$item["LOGO_CLASS"] = "ui-icon ui-icon-service-" . $codeMap[$itemCode];
					$item["COLOR_CLASS"] = "intranet-" . $itemCode . "-background-color";
				}
			}
			break;

		case "rest" :
			{
				$colorList = array(
					"green",
					"cyan",
					"red",
					"azure",
					"vkblue",
					"orange",
					"blue",
					"darkblue",
					"lightblue",
					"darkgreen",
					"purple"
				);
				$colorListCount = count($colorList);
				$colorIterator = 0;

				foreach ($module as &$item)
				{
					$item["LOGO_CLASS"] = ($item["SELECTED"] ? "intranet-contact-logo-common" : "intranet-contact-logo-common-inactive");
					$item["COLOR_CLASS"] = "intranet-contact-item-" . $colorList[$colorIterator];

					$colorIterator = ($colorIterator < $colorListCount - 1) ? $colorIterator + 1 : 0;
				}
			}
			break;

		default:
			break;
	}
}