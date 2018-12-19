<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true)
{
	die();
}

use \Bitrix\Main\Loader;
use \Bitrix\Main\Web\Uri;
use \Bitrix\Main\Localization\Loc;
use \Bitrix\Main\Engine\Contract\Controllerable;

class CIntranetContactCenterListComponent extends \CBitrixComponent implements Controllerable
{
	private $moduleList = array('mail',
								'voximplant',
								'crm',
								'imopenlines',
								/*'rest'*/); //commented for better days

	private $jsParams;

	public function onPrepareComponentParams($arParams)
	{
		if (intval($arParams['CACHE_TIME']) < 0)
		{
			$arParams['CACHE_TIME'] = 86400;
		}

		return parent::onPrepareComponentParams($arParams);
	}

	/**
	 * @param bool $additionalCacheId
	 * @return string
	 * @throws \Bitrix\Main\LoaderException
	 */
	public function getCacheID($additionalCacheId = false)
	{
		$additionalCacheId = !empty($additionalCacheId) && is_array($additionalCacheId) ? $additionalCacheId : array();

		$additionalCacheId[] = CIntranetUtils::IsExternalMailAvailable();

		if (Loader::includeModule("voximplant"))
		{
			$additionalCacheId[] = \Bitrix\Voximplant\Security\Helper::isMainMenuEnabled();
		}
		if (Loader::includeModule("crm"))
		{
			$additionalCacheId[] = CCrmPerms::IsAccessEnabled();
		}
		if (Loader::includeModule("imopenlines") && Loader::includeModule("imconnector"))
		{
			$additionalCacheId[] = \Bitrix\ImOpenlines\Security\Helper::isMainMenuEnabled();
		}

		$additionalCacheId = array_merge($additionalCacheId, $this->arParams);

		return parent::getCacheID($additionalCacheId);
	}

	//methods called in getItems for getting connectors from current modules from $moduleList

	/**
	 * @return array
	 * @throws \Bitrix\Main\ObjectPropertyException
	 * @throws \Bitrix\Main\SystemException
	 */
	private function mailGetItems()
	{
		$itemsList = array();

		if (CIntranetUtils::IsExternalMailAvailable())
		{
			$count = count(\Bitrix\Mail\MailboxTable::getUserMailboxes());
			$selected = $count > 0;
			$itemsList["mail"] = array(
				"NAME" => Loc::getMessage("CONTACT_CENTER_MAIL"),
				"SELECTED" => $selected,
			);

			//Temporary condition
			$itemsList["mail"]["LINK"] = ($selected ? \CUtil::jsEscape(\Bitrix\Main\Config\Option::get('intranet', 'path_mail_client', SITE_DIR . 'mail/')) : '/mail/config/');
			$itemsList["mail"]["ONCLICK"] = $selected ? "window.open('" . $itemsList["mail"]["LINK"] . "','_blank');" : $this->getOnclickScript($itemsList["mail"]["LINK"]);
			$this->addSliderUrlMask($itemsList["mail"]["LINK"]);
			$this->jsParams["handleMailLinks"] = true;
		}

		return $itemsList;
	}

	/**
	 * @return array
	 * @throws \Bitrix\Main\LoaderException
	 */
	private function voximplantGetItems()
	{
		$itemsList = array();
		$licensePrefix = "";
		if (Loader::includeModule("bitrix24"))
		{
			$licensePrefix = CBitrix24::getLicensePrefix();
		}

		//The same conditions as in superleft_ext menu
		if ($licensePrefix !== "by" && \Bitrix\Voximplant\Security\Helper::isMainMenuEnabled())
		{
			$lines = CVoxImplantConfig::GetLines(true, true);
			$selected = count($lines) > 0;
			$itemsList["voximplant"] = array(
				"NAME" => Loc::getMessage("CONTACT_CENTER_TELEPHONY"),
				"LINK" => CUtil::JSEscape(SITE_DIR . "telephony/lines.php"),
				"SELECTED" => $selected,
			);
			$itemsList["voximplant"]["ONCLICK"] = $this->getOnclickScript($itemsList["voximplant"]["LINK"]);
			$this->addSliderUrlMask("/telephony/");
		}

		return $itemsList;
	}

	/**
	 * @return array
	 * @throws \Bitrix\Main\ArgumentException
	 * @throws \Bitrix\Main\ArgumentNullException
	 * @throws \Bitrix\Main\ArgumentOutOfRangeException
	 * @throws \Bitrix\Main\LoaderException
	 * @throws \Bitrix\Main\ObjectPropertyException
	 * @throws \Bitrix\Main\SystemException
	 */
	private function crmGetItems()
	{
		$itemsList = array();

		if (CCrmPerms::IsAccessEnabled())
		{
			//setting preset forms and widgets if not installed yet
			if (\Bitrix\Crm\SiteButton\Preset::checkVersion())
			{
				$preset = new \Bitrix\Crm\SiteButton\Preset();
				$preset->install();
			}

			$itemsList["widget"] = $this->getButtonListItem();
			$itemsList["form"] = $this->getFormListItem();
			$this->addSliderUrlMask($this->getSiteButtonUrlMask());
			$this->addSliderUrlMask($this->getFormUrlMask());

			if (Loader::includeModule('voximplant') && !empty(\Bitrix\Crm\WebForm\Callback::getPhoneNumbers()))
			{
				$itemsList["call"] = $this->getCallFormListItem();
			}

			if (\Bitrix\Crm\Ads\AdsForm::canUse())
			{
				$itemsList = array_merge($itemsList, $this->getAdsFormListItems());
				$this->addSliderUrlMask($this->getAdsUrlMask());
			}

			foreach ($itemsList as $itemCode => &$crmItem)
			{
				if (!empty($crmItem["LIST"]))
				{
					$crmItem["LIST"] = $this->setMenuItemsClickAction($crmItem["LIST"]);

					$this->jsParams["menu"][] = array(
						"element" => "menu" . $itemCode,
						"bindElement" => "feed-add-post-form-link-text-" . $itemCode,
						"items" => $crmItem["LIST"]
					);
				}
			}
		}

		return $itemsList;
	}

	/**
	 * Set onclick-action field for menu list items
	 *
	 * @param $itemsList
	 *
	 * @return mixed
	 */
	private function setMenuItemsClickAction($itemsList)
	{
		foreach ($itemsList as &$menuItem)
		{
			if (!empty($menuItem["LIST"]))
			{
				$menuItem["LIST"] = $this->setMenuItemsClickAction($menuItem["LIST"]);
			}
			else
			{
				$menuItem["ONCLICK"] = $this->getOnclickScript($menuItem["LINK"]);
			}
		}

		return $itemsList;
	}

	/**
	 * Return widget button item with widget list
	 *
	 * @return array
	 * @throws \Bitrix\Main\ArgumentNullException
	 * @throws \Bitrix\Main\ArgumentOutOfRangeException
	 */
	private function getButtonListItem()
	{
		$list = \Bitrix\Crm\SiteButton\Manager::getList();

		if (count($list) > 0)
		{
			$newItem = array("NAME" => Loc::getMessage("CONTACT_CENTER_WIDGET_ADD"),
							 "FIXED" => true,
							 "ID" => 0
			);
			array_unshift($list, $newItem);

			foreach ($list as &$listItem)
			{
				$listItem["NAME"] = htmlspecialcharsbx($listItem["NAME"]);
				$listItem["LINK"] = $this->getSiteButtonUrl($listItem["ID"]);
			}
		}

		$selected = \Bitrix\Crm\SiteButton\Manager::isInUse();
		$result = array(
			"NAME" => Loc::getMessage("CONTACT_CENTER_WIDGET"),
			"SELECTED" => $selected,
			"LIST" => $list
		);

		if (!$selected)
		{
			$result["LINK"] = $this->getSiteButtonUrl(0);
			$result["ONCLICK"] = $this->getOnclickScript($result["LINK"]);
		}

		return $result;
	}

	/**
	 * Return form button item with form list
	 *
	 * @return array
	 * @throws \Bitrix\Main\ArgumentException
	 * @throws \Bitrix\Main\ObjectPropertyException
	 * @throws \Bitrix\Main\SystemException
	 */
	private function getFormListItem()
	{
		$formParams = array("order" => array("ID" => "DESC"));
		$formCollection = \Bitrix\Crm\WebForm\Internals\FormTable::getList($formParams);
		$list = array();

		while ($form = $formCollection->fetch())
		{
			$list[] = $form;
		}

		if (count($list) > 0)
		{
			$newItem = array("NAME" => Loc::getMessage("CONTACT_CENTER_FORM_ADD"),
							 "FIXED" => true,
							 "ID" => 0
			);
			array_unshift($list, $newItem);

			foreach ($list as &$listItem)
			{
				$listItem["NAME"] = htmlspecialcharsbx($listItem["NAME"]);
				$listItem["LINK"] = $this->getFormUrl($listItem["ID"]);
			}
		}

		$selected = count($list) > 0;
		$result = array(
			"NAME" => Loc::getMessage("CONTACT_CENTER_FORM"),
			"SELECTED" => $selected,
			"LIST" => $list
		);

		if (!$selected)
		{
			$result["LINK"] = $this->getFormUrl(0);
			$result["ONCLICK"] = $this->getOnclickScript($result["LINK"]);
		}

		return $result;
	}

	/**
	 * Return callback-form button item with callback-form list
	 *
	 * @return array
	 * @throws \Bitrix\Main\ArgumentException
	 * @throws \Bitrix\Main\ObjectPropertyException
	 * @throws \Bitrix\Main\SystemException
	 */
	private function getCallFormListItem()
	{
		$listCall = array();
		$options = array("IS_CALLBACK_FORM" => "Y");
		$callbackFormParams = array("order" => array("ID" => "DESC"), "filter" => $options);
		$callbackFormCollection = \Bitrix\Crm\WebForm\Internals\FormTable::getList($callbackFormParams);

		while ($form = $callbackFormCollection->fetch())
		{
			$listCall[] = $form;
		}

		if (count($listCall) > 0)
		{
			$newItem = array("NAME" => Loc::getMessage("CONTACT_CENTER_FORM_ADD"),
							 "FIXED" => true,
							 "ID" => 0
			);
			array_unshift($listCall, $newItem);

			foreach ($listCall as &$listItem)
			{
				$listItem["NAME"] = htmlspecialcharsbx($listItem["NAME"]);
				$listItem["LINK"] = $this->getFormUrl($listItem["ID"], $options);
			}
		}

		$selected = count($listCall) > 0;
		$result = array(
			"NAME" => Loc::getMessage("CONTACT_CENTER_CALL"),
			"SELECTED" => $selected,
			"LIST" => $listCall
		);

		if (!$selected)
		{
			$result["LINK"] = $this->getFormUrl(0, $options);
			$result["ONCLICK"] = $this->getOnclickScript($result["LINK"]);
		}

		return $result;
	}

	/**
	 * Return ads-form buttons items with form list
	 *
	 * @return array
	 * @throws \Bitrix\Main\ArgumentException
	 * @throws \Bitrix\Main\ArgumentNullException
	 * @throws \Bitrix\Main\ArgumentOutOfRangeException
	 * @throws \Bitrix\Main\LoaderException
	 * @throws \Bitrix\Main\ObjectPropertyException
	 * @throws \Bitrix\Main\SystemException
	 */
	private function getAdsFormListItems()
	{
		$formParams = array("order" => array("ID" => "DESC"), "select" => array("ID", "NAME"));
		$formCollection = \Bitrix\Crm\WebForm\Internals\FormTable::getList($formParams);
		$itemsList = array();
		$list = array();

		while ($form = $formCollection->fetch())
		{
			$list[$form["ID"]] = $form;
		}

		if (!empty($list))
		{
			$serviceTypes = \Bitrix\Crm\Ads\AdsForm::getServiceTypes();
			$cisOnlyServices = array(\Bitrix\Seo\LeadAds\Service::TYPE_VKONTAKTE);

			foreach ($serviceTypes as $type)
			{
				if ($this->cisCheck() &&
					in_array($type, $cisOnlyServices))
				{
					continue;
				}

				$linkedFormsIds = \Bitrix\Crm\Ads\AdsForm::getLinkedForms($type);
				$linkedItems = array();
				$name = (Loc::getMessage("CONTACT_CENTER_ADS_FORM_" . strtoupper($type)) ? : \Bitrix\Crm\Ads\AdsForm::getServiceTypeName($type));
				$shortName = (Loc::getMessage("CONTACT_CENTER_ADS_FORM_SHORTNAME_" . strtoupper($type)) ? : \Bitrix\Crm\Ads\AdsForm::getServiceTypeName($type));
				$notLinkedItems = $list;

				foreach ($linkedFormsIds as $id)
				{
					$item = $notLinkedItems[$id];
					$item["NAME"] = htmlspecialcharsbx($item["NAME"]);
					$item["LIST"] = array(
						0 => array(
							"LINK" => $this->getFormUrl($item["ID"]),
							"NAME" => Loc::getMessage("CONTACT_CENTER_ADS_FORM_SETTINGS_FORM")
						),
						1 => array(
							"LINK" => $this->getAdsUrl($item["ID"], $type),
							"NAME" => Loc::getMessage("CONTACT_CENTER_ADS_FORM_SETTINGS_LINK", array('#NAME#' => $shortName))
						)
					);
					$linkedItems[] = $item;
					unset($notLinkedItems[$id]);
				}

				foreach ($notLinkedItems as &$item)
				{
					$item["NAME"] = htmlspecialcharsbx($item["NAME"]);
					$item["LINK"] = $this->getAdsUrl($item["ID"], $type);
				}
				unset($item);

				$notLinkedItems = array_values($notLinkedItems);
				$selected = !empty($linkedItems);
				$newItem = array(
					"ID" => 0,
					"NAME" => Loc::getMessage("CONTACT_CENTER_FORM_CREATE"),
					"LINK" => $this->getFormUrl(0),
					"FIXED" => true,
				);

				if ($selected)
				{
					$items = $linkedItems;
					if (!empty($notLinkedItems))
					{
						array_unshift($notLinkedItems, $newItem);
						$items[] = array(
							"ID" => 0,
							"DELIMITER_BEFORE" => true,
							"NAME" => Loc::getMessage("CONTACT_CENTER_FORM_LINK", array('#NAME#' => $shortName)),
							"LIST" => $notLinkedItems
						);
					}
				}
				else
				{
					array_unshift($notLinkedItems, $newItem);
					$items = $notLinkedItems;
				}

				$itemsList[$type . "ads"] = array(
					"NAME" => $name,
					"SELECTED" => $selected,
					"LIST" => $items
				);
			}
		}

		return $itemsList;
	}

	/**
	 * Return formatted form item url with params
	 *
	 * @param $formId
	 * @param array $options
	 *
	 * @return mixed
	 */
	private function getFormUrl($formId, $options = array())
	{
		$link = $this->getFormUrlTemplate($formId);
		$options["ACTIVE"] = $formId === 0 ? "Y" : "N";
		$uri = new Uri($link);
		$uri->addParams($options);
		$result = CUtil::JSEscape($uri->getUri());
		unset($uri);

		return $result;
	}

	/**
	 * @param int $formId
	 *
	 * @return string
	 */
	private function getFormUrlTemplate($formId = 0)
	{
		return \Bitrix\Crm\WebForm\Manager::getEditUrl($formId);
	}

	/**
	 * @return mixed|string
	 */
	private function getFormUrlMask()
	{
		$result = $this->getFormUrlTemplate();
		$result = str_replace('0/', '', $result);

		return $result;
	}

	/**
	 * Return formatted sitebutton item url with params
	 *
	 * @param $buttonId
	 * @param array $options
	 *
	 * @return mixed
	 * @throws \Bitrix\Main\ArgumentNullException
	 * @throws \Bitrix\Main\ArgumentOutOfRangeException
	 */
	private function getSiteButtonUrl($buttonId, $options = array())
	{
		$buttonLinkTemplate = $this->getSiteButtonUrlTemplate();
		$link = str_replace("#id#", $buttonId, $buttonLinkTemplate);
		$options["ACTIVE"] = $buttonId === 0 ? "Y" : "N";
		$uri = new Uri($link);
		$uri->addParams($options);
		$result = CUtil::JSEscape($uri->getUri());
		unset($uri);

		return $result;
	}

	/**
	 * @return string
	 * @throws \Bitrix\Main\ArgumentNullException
	 * @throws \Bitrix\Main\ArgumentOutOfRangeException
	 */
	private function getSiteButtonUrlTemplate()
	{
		return \Bitrix\Main\Config\Option::get("crm", "path_to_button_edit", "/crm/button/edit/#id#/");
	}

	/**
	 * @return mixed|string
	 * @throws \Bitrix\Main\ArgumentNullException
	 * @throws \Bitrix\Main\ArgumentOutOfRangeException
	 */
	private function getSiteButtonUrlMask()
	{
		$result = $this->getSiteButtonUrlTemplate();
		$result = str_replace('#id#/', '', $result);

		return $result;
	}

	/**
	 * Return formatted adsform item url with params
	 *
	 * @param $formId
	 * @param $adsType
	 * @param array $options
	 *
	 * @return mixed
	 * @throws \Bitrix\Main\ArgumentNullException
	 * @throws \Bitrix\Main\ArgumentOutOfRangeException
	 */
	private function getAdsUrl($formId, $adsType, $options = array())
	{
		$adsLinkTemplate = $this->getAdsUrlTemplate();
		$link = CComponentEngine::makePathFromTemplate(
			$adsLinkTemplate,
			array(
				"ads_type" => $adsType,
				"id" => $formId
			)
		);
		$uri = new Uri($link);
		$uri->addParams($options);
		$result = CUtil::JSEscape($uri->getUri());
		unset($uri);

		return $result;
	}

	/**
	 * @return string
	 * @throws \Bitrix\Main\ArgumentNullException
	 * @throws \Bitrix\Main\ArgumentOutOfRangeException
	 */
	private function getAdsUrlTemplate()
	{
		return  \Bitrix\Main\Config\Option::get("crm", "path_to_ads", "/crm/webform/ads/#id#/?type=#ads_type#");
	}

	/**
	 * @return mixed|string
	 * @throws \Bitrix\Main\ArgumentNullException
	 * @throws \Bitrix\Main\ArgumentOutOfRangeException
	 */
	private function getAdsUrlMask()
	{
		$result = $this->getAdsUrlTemplate();
		$result = str_replace('#id#/?type=#ads_type#', '', $result);

		return $result;
	}

	/**
	 * @return array
	 * @throws \Bitrix\Main\LoaderException
	 */
	private function imopenlinesGetItems()
	{
		$itemsList = array();

		if (\Bitrix\ImOpenlines\Security\Helper::isMainMenuEnabled())
		{
			//For whole list of botframework instances use getListConnector()
			$connectors = \Bitrix\ImConnector\Connector::getListConnectorMenu(true);
			$statusList = \Bitrix\ImConnector\Status::getInstanceAll();
			$linkTemplate = \Bitrix\ImOpenLines\Common::getPublicFolder() . "connector/";
			$this->addSliderUrlMask($linkTemplate);

			foreach ($connectors as $code => $connector)
			{
				$selected = false;

				$cisOnlyConnectors = array('vkgroup', 'yandex');

				//Condition only for contact-center - except ua domain all this connectors should be in openlines section
				if ($this->cisCheck() &&
					in_array($code, $cisOnlyConnectors))
				{
					continue;
				}

				if (!empty($statusList[$code]))
				{
					foreach ($statusList[$code] as $status)
					{
						if (($status instanceof \Bitrix\ImConnector\Status) && $status->isStatus())
						{
							$selected = true;
							break;
						}
					}
				}

				$itemsList[$code] = array(
					"NAME" => $connector['name'],
					"LINK" => CUtil::JSEscape( $linkTemplate . "?ID=" . $code),
					"SELECTED" => $selected
				);
				$itemsList[$code]["ONCLICK"] = $this->getOnclickScript($itemsList[$code]["LINK"], 700);
			}
		}

		return $itemsList;
	}

	/**
	 * @return array
	 * @throws \Bitrix\Main\ArgumentException
	 * @throws \Bitrix\Main\ObjectPropertyException
	 * @throws \Bitrix\Main\SystemException
	 */
	private function restGetItems()
	{
		$itemsList = array();
		$parameters = array('filter' => array('=INSTALLED' => \Bitrix\Rest\AppTable::INSTALLED));
		$appsCollection = \Bitrix\Rest\AppTable::getList($parameters);

		while ($app = $appsCollection->fetch())
		{
			$selected = ($app['ACTIVE'] == \Bitrix\Rest\AppTable::ACTIVE);
			$itemsList[$app['CODE']] = array(
				"NAME" => $app["APP_NAME"],
				"LINK" =>  CUtil::JSEscape(SITE_DIR . "marketplace/app/" . $app['ID'] . '/'),
				"SELECTED" => $selected,
			);
			$itemsList[$app['CODE']]["ONCLICK"] = $this->getOnclickScript($itemsList[$app['CODE']]["LINK"]);
		}

		return $itemsList;
	}

	/**
	 * Make cis-region check for bx24 only. For not bx24 always return false
	 *
	 * @return bool
	 * @throws \Bitrix\Main\LoaderException
	 */
	private function cisCheck()
	{
		$result = false;
		$cisDomainList = array('ru', 'kz', 'by'); //except ua domain case services rules

		if (Loader::includeModule('bitrix24'))
		{
			$result = !in_array(\CBitrix24::getPortalZone(), $cisDomainList);
		}

		return $result;
	}

	/**
	 * Get list of params for ajax component reload
	 *
	 * @return array
	 */
	protected function listKeysSignedParameters()
	{
		//We list the names of the parameters to be used in Ajax actions
		$result = array();

		if (!empty($arParams['SIGNED_PARAMETERS']))
		{
			$result = $arParams['SIGNED_PARAMETERS'];
		}

		return $result;
	}

	/**
	 * @return array
	 */
	public function configureActions()
	{
		return array();
	}

	/**
	 * Reload blocks using ajax-request
	 *
	 * @return array
	 * @throws \Bitrix\Main\LoaderException
	 */
	public function reloadAction()
	{
		ob_start();
		$this->executeComponent();
		$html = ob_get_clean();
		return array(
			'html' => $html,
			'js_data' => $this->getJsParams()
		);
	}

	/**
	 * @return array
	 * @throws \Bitrix\Main\LoaderException
	 */
	private function getItems()
	{
		$itemsList = array();

		foreach($this->moduleList as $module)
		{
			$methodName = $module . 'GetItems';
			if (method_exists($this, $methodName) && Loader::includeModule($module))
			{
				$itemsList[$module] = call_user_func(array($this, $methodName));
			}
		}

		return $itemsList;
	}

	/**
	 * Return JS-params for initialization contact-center view
	 *
	 * @return mixed
	 */
	private function getJsParams()
	{
		$this->jsParams["signedParameters"] = $this->getSignedParameters();
		$this->jsParams["componentName"] = $this->getName();

		return $this->jsParams;
	}

	/**
	 * Add url to list of contact-center slider urls for correct slider close event handling
	 *
	 * @param $url
	 */
	private function addSliderUrlMask($url)
	{
		$this->jsParams["sliderUrls"][] = htmlspecialcharsbx('^' . preg_quote($url) . '([0-9a-zA-Z_\\-/&\\?\\=]*)');
	}

	/**
	 * Return script for onclick action
	 *
	 * @param $link
	 * @param bool $width
	 *
	 * @return string
	 */
	public function getOnclickScript($link, $width = false)
	{
		$params = array();
		if (intval($width) > 0)
		{
			$params[] = "width: " . intval($width);
		}

		$params[] = "events: {onClose: function(e){BX.SidePanel.Instance.postMessage(e.getSlider(), 'ContactCenter:reload', {})}}";

		$result = "BX.SidePanel.Instance.open('".$link."'";
		if (!empty($params))
		{
			$result .= ", {" . implode(", ", $params) . "}";
		}
		$result .= ");";

		return $result;
	}


	/**
	 * @return mixed|void
	 * @throws \Bitrix\Main\LoaderException
	 */
	public function executeComponent()
	{
		\CJSCore::init("sidepanel");

		if ($this->startResultCache())
		{
			$this->arResult["ITEMS"] = $this->getItems();
			$this->arResult["JS_PARAMS"] = $this->getJsParams();

			$this->includeComponentTemplate();
		}
	}
}