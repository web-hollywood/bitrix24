<?php

use Bitrix\DocumentGenerator\DataProviderManager;
use Bitrix\DocumentGenerator\Template;
use Bitrix\Main\Loader;
use Bitrix\Main\Localization\Loc;

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

class DocumentsPlaceholderComponent extends CBitrixComponent
{
	/** @var Template */
	protected $template;
	protected $moduleId;
	protected $dataProvider;

	protected $gridId = 'documentgenerator-placeholders-grid';
	protected $filterId = 'documentgenerator-placeholders-filter';
	protected $navParamName = 'page';

	public function onPrepareComponentParams($params)
	{
		$params = parent::onPrepareComponentParams($params);

		return $params;
	}

	/**
	 * @return mixed|void
	 */
	public function executeComponent()
	{
		if(!Loader::includeModule('documentgenerator'))
		{
			$this->showError(Loc::getMessage('DOCGEN_PLACEHOLDERS_MODULE_DOCGEN_ERROR'));
			return;
		}

		$moduleId = $this->arParams['MODULE'];
		$templateId = $this->arParams['TEMPLATE_ID'];
		//$this->dataProvider = $this->arParams['PROVIDER'];

		$filterOptions = new Bitrix\Main\UI\Filter\Options($this->filterId);
		$requestFilter = $filterOptions->getFilter($this->getDefaultFilterFields());
		if(isset($requestFilter['PROVIDER']))
		{
			$this->dataProvider = $requestFilter['PROVIDER'];
		}
		if($templateId > 0)
		{
			$this->template = Template::loadById($templateId);
			if($this->template)
			{
				$moduleId = $this->template->MODULE_ID;
				if($this->dataProvider)
				{
					$this->template->setSourceType($this->dataProvider);
				}
			}
			else
			{
				$this->showError(Loc::getMessage('DOCGEN_PLACEHOLDERS_TEMPLATE_ERROR'));
				return;
			}
		}
		if(!$moduleId)
		{
			$this->showError(Loc::getMessage('DOCGEN_PLACEHOLDERS_MODULE_EMPTY'));
			return;
		}
		elseif(!Loader::includeModule($moduleId))
		{
			$this->showError(Loc::getMessage('DOCGEN_PLACEHOLDERS_MODULE_ERROR', ['#MODULE_ID#' => $moduleId]));
			return;
		}

		$this->arResult = [];

		$request = \Bitrix\Main\Application::getInstance()->getContext()->getRequest();
		if($request->get('IFRAME') === 'Y')
		{
			$this->arResult['IS_SLIDER'] = true;
		}
		else
		{
			$this->arResult['IS_SLIDER'] = false;
			if(SITE_TEMPLATE_ID == "bitrix24")
			{
				$this->arResult['TOP_VIEW_TARGET_ID'] = 'pagetitle';
			}
		}
		$this->arResult['PROVIDERS'] = $this->getProviders();

		$this->arResult['FILTER'] = $this->prepareFilter();
		$this->arResult['GRID'] = $this->prepareGrid($this->getPlaceholders());
		$this->arResult['TITLE'] = Loc::getMessage('DOCGEN_PLACEHOLDERS_TITLE');

		$this->includeComponentTemplate();
	}

	protected function showError($error)
	{
		ShowError($error);
		$this->includeComponentTemplate();
	}

	/**
	 * @param array $placeholders
	 * @return array
	 */
	protected function prepareGrid(array $placeholders)
	{
		$grid = [];
		$grid['GRID_ID'] = $this->gridId;
		$grid['COLUMNS'] = [
			[
				'id' => 'TITLE',
				'name' => Loc::getMessage('DOCGEN_PLACEHOLDERS_TITLE_TITLE'),
				'default' => true,
				'sort' => false,
			],
			[
				'id' => 'PLACEHOLDER',
				'name' => Loc::getMessage('DOCGEN_PLACEHOLDERS_PLACEHOLDER_TITLE'),
				'default' => true,
				'sort' => false,
			],
			[
				'id' => 'COPY',
				'name' => Loc::getMessage('DOCGEN_PLACEHOLDERS_COPY_TITLE'),
				'default' => true,
				'sort' => false,
			],
		];

		$pageNavigation = new \Bitrix\Main\UI\PageNavigation($this->navParamName);
		$pageNavigation->allowAllRecords(false)->setPageSize(100)->initFromUri();
		$fullCount = count($placeholders);

		if(!empty($placeholders))
		{
			$offset = $pageNavigation->getOffset();
			$limit = $pageNavigation->getLimit();

			$number = 0;
			foreach($placeholders as $placeholder => $field)
			{
				$number++;
				if($number <= $offset)
				{
					continue;
				}
				if($number > $limit + $offset)
				{
					break;
				}
				$grid['ROWS'][] = [
					'id' => $placeholder,
					'data' => $field,
					'columns' => [
						'PLACEHOLDER' => '{'.htmlspecialcharsbx($placeholder).'}',
						//'TITLE' => htmlspecialcharsbx($field['TITLE']),
						'COPY' => '<a class="docgen-placeholder-copy" onclick="BX.DocumentGenerator.Placeholders.Copy(this, \''.CUtil::JSEscape($placeholder).'\');">'.Loc::getMessage('DOCGEN_PLACEHOLDERS_COPY_ACTION_TITLE').'</a>',
						'TITLE' => implode(' -> ', $field['GROUP']),
						'VALUE' => htmlspecialcharsbx($field['VALUE']),
					],
				];
			}
		}

		$pageNavigation->setRecordCount($fullCount);
		$grid['TOTAL_ROWS_COUNT'] = $fullCount;
		$grid['NAV_OBJECT'] = $pageNavigation;
		$grid['AJAX_MODE'] = 'Y';
		$grid['ALLOW_ROWS_SORT'] = false;
		$grid['AJAX_OPTION_JUMP'] = "N";
		$grid['AJAX_OPTION_STYLE'] = "N";
		$grid['AJAX_OPTION_HISTORY'] = "N";
		$grid['AJAX_ID'] = \CAjax::GetComponentID("bitrix:main.ui.grid", '', '');
		$grid['SHOW_ROW_CHECKBOXES'] = false;
		$grid['SHOW_CHECK_ALL_CHECKBOXES'] = false;
		$grid['SHOW_ACTION_PANEL'] = false;

		return $grid;
	}

	/**
	 * @return array
	 */
	protected function prepareFilter()
	{
		$filter = [
			'FILTER_ID' => $this->filterId,
			'GRID_ID' => $this->gridId,
			'FILTER' => $this->getDefaultFilterFields(),
			'DISABLE_SEARCH' => false,
			'ENABLE_LABEL' => true,
			'RESET_TO_DEFAULT_MODE' => false,
			'ENABLE_LIVE_SEARCH' => true,
		];

		return $filter;
	}

	/**
	 * @return array
	 */
	protected function getDefaultFilterFields()
	{
		return [
			[
				"id" => "PROVIDER",
				"name" => Loc::getMessage('DOCGEN_PLACEHOLDERS_PROVIDER_TITLE'),
				"type" => "list",
				"items" => $this->getProviders(),
				"default" => true,
			],
			[
				'id' => 'PLACEHOLDER',
				'name' => Loc::getMessage('DOCGEN_PLACEHOLDERS_PLACEHOLDER_TITLE'),
				'default' => true,
			],
			[
				"id" => "TITLE",
				"name" => Loc::getMessage('DOCGEN_PLACEHOLDERS_TITLE_TITLE'),
				"default" => true
			],
		];
	}

	/**
	 * @return array
	 */
	protected function getPlaceholders()
	{
		$placeholders = [];

		if($this->template)
		{
			$placeholders = $this->template->getFields();
		}
		elseif($this->dataProvider)
		{
			$placeholders = \Bitrix\DocumentGenerator\DataProviderManager::getInstance()->getDefaultTemplateFields($this->dataProvider, [], [], false);
		}

		$filterOptions = new Bitrix\Main\UI\Filter\Options($this->filterId);
		$requestFilter = $filterOptions->getFilter($this->getDefaultFilterFields());
		$functionName = 'stripos';
		if(defined('BX_UTF') && BX_UTF && function_exists('mb_stripos'))
		{
			$functionName = 'mb_stripos';
		}
		if(!empty($requestFilter))
		{
			foreach($placeholders as $placeholder => $field)
			{
				if(isset($requestFilter['PLACEHOLDER']) && $functionName($placeholder, $requestFilter['PLACEHOLDER']) === false)
				{
					unset($placeholders[$placeholder]);
					continue;
				}
				if(isset($requestFilter['TITLE']) && isset($field['TITLE']) && $functionName($field['TITLE'], $requestFilter['TITLE']) === false)
				{
					unset($placeholders[$placeholder]);
					continue;
				}
				if(isset($requestFilter['FIND']) && !empty($requestFilter['FIND']) && (
					(isset($field['TITLE']) && $functionName($field['TITLE'], $requestFilter['FIND']) === false || !isset($field['TITLE'])) &&
					$functionName($placeholder, $requestFilter['FIND']) === false
					)
				)
				{
					unset($placeholders[$placeholder]);
					continue;
				}
			}
		}

		return $placeholders;
	}

	/**
	 * @return array|null
	 */
	protected function getProviders()
	{
		static $providers = null;
		if($providers === null)
		{
			$providers = DataProviderManager::getInstance()->getList(['filter' => ['MODULE' => $this->moduleId]]);
		}
		foreach($providers as $key => $provider)
		{
			if(isset($provider['ORIGINAL']))
			{
				unset($providers[$key]);
				$providers[$provider['ORIGINAL']] = [
					'NAME' => $provider['ORIGINAL_NAME'],
					'CLASS' => $provider['ORIGINAL'],
					'MODULE' => $provider['MODULE'],
				];
			}
		}
		foreach($providers as &$provider)
		{
			$selected = false;
			if($this->dataProvider && $this->dataProvider == $provider['CLASS'])
			{
				$selected = true;
			}
			$provider['SELECTED'] = $selected;
		}
		return $providers;
	}
}