<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true)
{
	die();
}

\CBitrixComponent::includeComponentClass('bitrix:landing.demo');

class LandingSiteDemoPreviewComponent extends LandingSiteDemoComponent
{
	/**
	 * Base executable method.
	 * @return void
	 */
	public function executeComponent()
	{
		$init = $this->init();

		if ($init)
		{
			$this->checkParam('SITE_ID', 0);
			$this->checkParam('CODE', '');
			$this->checkParam('TYPE', '');
			$this->checkParam('PAGE_URL_BACK', '');
			$this->checkParam('SITE_WORK_MODE', 'N');

			$code = $this->arParams['CODE'];
			$demo = $this->getDemoPage($code);
			if (isset($demo[$code]))
			{
				if ($demo[$code]['REST'] > 0)
				{
					$demo[$code]['DATA'] = $this->getTemplateManifest(
						$demo[$code]['REST']
					);
				}
				$this->arResult['COLORS'] = \Bitrix\Landing\Hook\Page\Theme::getColorCodes();
				$this->arResult['TEMPLATE'] = $demo[$code];
				$this->arResult['TEMPLATE']['URL_PREVIEW'] = $this->getUrlPreview($code);
//				first color by default
				$this->arResult['THEME_CURRENT'] = array_shift(array_keys($this->arResult['COLORS']));

//				new page in EXIST SITE - use site theme always. Find parent site hook
				if ($this->arParams['SITE_ID'])
				{
					$classFull = $this->getValidClass('Site');
					if ($classFull && method_exists($classFull, 'getHooks'))
					{
						\Bitrix\Landing\Hook::setEditMode();
						$hooks = $classFull::getHooks($this->arParams['SITE_ID']);
					}
					
					if (isset($hooks['THEME']) && isset($hooks['THEME']->getPageFields()['THEME_CODE']))
					{
						$this->arResult['THEME_SITE'] = $hooks['THEME']->getPageFields()['THEME_CODE']->getValue();
					}
					else
					{
						$this->arResult['THEME_SITE'] = $this->arResult['THEME_CURRENT'];
					}
					unset($this->arResult['THEME_CURRENT']);

//					add color to PALLETE
					if (isset($this->arResult['COLORS'][$this->arResult['THEME_SITE']]))
					{
						$this->arResult['COLORS'][$this->arResult['THEME_SITE']]['base'] = true;
					}
				}
				
//				NEW SITE - match
				else
				{
					$themeCurr = $this->arResult['THEME_CURRENT'];
//					form SITE
					if (!isset($this->arResult['TEMPLATE']['DATA']['fields']['ADDITIONAL_FIELDS']['THEME_CODE']))
					{
//						find PARENT site for multipages, or site with equal ID
						$siteCode = (isset($demo[$code]['DATA']['parent']) && $demo[$code]['DATA']['parent'])
							? $demo[$code]['DATA']['parent']
							: $demo[$code]['ID'];
						$demoSite = $this->getDemoSite()[$siteCode];
						if ($demoSite['DATA']['fields']['ADDITIONAL_FIELDS']['THEME_CODE'])
						{
							$themeCurr = $demoSite['DATA']['fields']['ADDITIONAL_FIELDS']['THEME_CODE'];
						}
					}
//					if note set site theme - get from parent PAGE
					else
					{
						$themeCurr = $this->arResult['TEMPLATE']['DATA']['fields']['ADDITIONAL_FIELDS']['THEME_CODE'];
					}
					
//					add to PALLETE
					if (isset($this->arResult['COLORS'][$themeCurr]))
					{
						$this->arResult['COLORS'][$themeCurr]['base'] = true;
					}
					
					$this->arResult['THEME_CURRENT'] = $themeCurr;
				}
			}
			else
			{
				$this->arResult['COLORS'] = array();
				$this->arResult['TEMPLATE'] = array();
			}
		}

		parent::executeComponent();
	}
}