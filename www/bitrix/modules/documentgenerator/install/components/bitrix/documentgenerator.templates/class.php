<?php

use Bitrix\DocumentGenerator\DataProviderManager;
use Bitrix\Main\Engine\Contract\Controllerable;
use Bitrix\Main\Engine\Response\AjaxJson;
use Bitrix\DocumentGenerator\Model\TemplateTable;
use Bitrix\DocumentGenerator\Model\TemplateProviderTable;
use Bitrix\Main\ErrorCollection;
use Bitrix\Main\Loader;
use Bitrix\Main\Localization\Loc;
use Bitrix\Main\Error;
use Bitrix\Main\ModuleManager;

if(!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

class DocumentsTemplateComponent extends CBitrixComponent implements Controllerable
{
	protected $gridId = 'documentgenerator_templates_grid';
	protected $filterId = 'documentgenerator_templates_filter';
	protected $navParamName = 'page';
	protected $defaultGridSort = [
		'SORT' => 'asc',
	];

	public function onPrepareComponentParams($arParams)
	{
		if(!$arParams['UPLOAD_URI'] && $this->includeModules())
		{
			$arParams['UPLOAD_URI'] = \Bitrix\DocumentGenerator\Template::getUploadUrl();
		}

		return parent::onPrepareComponentParams($arParams);
	}

	/**
	 * @return mixed|void
	 */
	public function executeComponent()
	{
		Loc::loadMessages(__FILE__);
		if(!$this->includeModules())
		{
			echo Loc::getMessage('DOCGEN_TEMPLATE_DOWNLOAD_ADD_TEMPLATE_ERROR_MODULE');
			$this->includeComponentTemplate();
			return;
		}
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
		if($this->getTemplateName() == 'upload')
		{
			$this->arResult['TITLE'] = Loc::getMessage('DOCGEN_TEMPLATE_DOWNLOAD_ADD_TEMPLATE');
			$this->arResult['PROVIDERS'] = $this->getProviders();
			$this->arResult['REGIONS'] = \Bitrix\DocumentGenerator\Driver::getInstance()->getRegionsList();
			if($this->arParams['ID'] > 0)
			{
				$template = \Bitrix\DocumentGenerator\Template::loadById($this->arParams['ID']);
				if($template)
				{
					if($template->CODE)
					{
						$defaultTemplates = \Bitrix\DocumentGenerator\Controller\Template::getDefaultTemplateList(['CODE' => $template->CODE, 'NAME' => $template->NAME]);
						if($defaultTemplates->isSuccess() && isset($defaultTemplates->getData()[$template->CODE]))
						{
							$this->arResult['params']['defaultCode'] = $template->CODE;
						}
					}
					$this->arResult['TITLE'] = Loc::getMessage('DOCGEN_TEMPLATE_DOWNLOAD_EDIT_TEMPLATE').' '.$template->NAME;
					$this->arResult['params']['downloadUrl'] = $template->getDownloadUrl();
					$this->arResult['TEMPLATE']['fileName'] = $template->getFileName();
					$this->arResult['TEMPLATE']['fileSize'] = \Bitrix\DocumentGenerator\Model\FileTable::getSize($template->FILE_ID);
					$this->arResult['TEMPLATE']['ACTIVE'] = $template->ACTIVE;
					$this->arResult['TEMPLATE']['ID'] = $template->ID;
					$this->arResult['TEMPLATE']['REGION'] = $template->REGION;
					$this->arResult['TEMPLATE']['FILE_ID'] = $template->FILE_ID;
					$this->arResult['TEMPLATE']['NAME'] = $template->NAME;
					$this->arResult['TEMPLATE']['NUMERATOR_ID'] = $template->NUMERATOR_ID;
					$this->arResult['TEMPLATE']['WITH_STAMPS'] = $template->WITH_STAMPS;
					$this->arResult['TEMPLATE']['PROVIDERS'] = [];
					foreach($template->getDataProviders() as $provider)
					{
						$this->arResult['TEMPLATE']['PROVIDERS'][] = $this->arResult['PROVIDERS'][$provider];
					}
					$users = $template->getUsers();
					$this->arResult['TEMPLATE']['USERS'] = array_values($users);
				}
				else
				{
					$this->arResult['ERROR'] = Loc::getMessage('DOCGEN_TEMPLATE_DOWNLOAD_TEMPLATE_NOT_FOUND');
				}
			}
			else
			{
				$this->arResult['TEMPLATE']['USERS'] = ['UA'];
			}
			if(!$this->arResult['TEMPLATE']['REGION'])
			{
				$this->arResult['TEMPLATE']['REGION'] = \Bitrix\DocumentGenerator\Driver::getInstance()->getCurrentRegion()['CODE'];
			}
			$this->arResult['params']['uploadUrl'] = Bitrix\Main\Engine\UrlManager::getInstance()->create('documentgenerator.api.file.upload')->getLocator();
			$this->arResult['userSelectorName'] = 'add-template-users';
			$numeratorList = \Bitrix\Main\Numerator\Numerator::getListByType(\Bitrix\DocumentGenerator\Driver::NUMERATOR_TYPE);
			if (empty($numeratorList))
			{
				\Bitrix\DocumentGenerator\Driver::getInstance()->getDefaultNumerator();
				$numeratorList = \Bitrix\Main\Numerator\Numerator::getListByType(\Bitrix\DocumentGenerator\Driver::NUMERATOR_TYPE);
			}
			$this->arResult['numeratorList'] = $numeratorList;
		}
		else
		{
			if($request->getRequestMethod() == 'POST' &&
				!empty($request->getPost('action_button_'.$this->gridId)) && check_bitrix_sessid())
			{
				if($request->getPost('action_button_'.$this->gridId) == 'delete')
				{
					foreach($request->getPost("ID") as $id)
					{
						TemplateTable::delete($id);
					}
				}
			}


			$this->arResult['params'] = [];
			$this->arResult['params']['uploadUri'] = $this->arParams['UPLOAD_URI'];
			$this->arResult['params']['settingsMenu'] = [];
			$uri = new \Bitrix\Main\Web\Uri('/bitrix/components/bitrix/documentgenerator.placeholders/slider.php');
			$uri->addParams(['MODULE' => $this->arParams['MODULE']]);
			if($this->arParams['PROVIDER'])
			{
				$uri->addParams(['PROVIDER' => strtolower($this->arParams['PROVIDER']), 'apply_filter' => 'Y']);
			}
			$this->arResult['params']['settingsMenu'][] = [
				'uri' => $uri->getLocator(),
				'text' => Loc::getMessage('DOCGEN_TEMPLATE_LIST_PLACEHOLDERS'),
			];
			$menuItems = [];
			foreach(\Bitrix\DocumentGenerator\Driver::getInstance()->getRegionsList() as $region)
			{
				$uri = new \Bitrix\Main\Web\Uri('/bitrix/components/bitrix/documentgenerator.templates.default/slider.php');
				$uri->addParams(['REGION[]' => $region['CODE'], 'apply_filter' => 'Y']);
				$menuItems[] = [
					'text' => $region['TITLE'],
					'uri' => $uri->getLocator(),
				];
			}
			$this->arResult['params']['settingsMenu'][] = [
				'text' => Loc::getMessage('DOCGEN_TEMPLATE_LIST_LOAD_DEFAULT_TEMPLATES'),
				'items' => $menuItems,
			];
			$this->arResult['TITLE'] = Loc::getMessage('DOCGEN_TEMPLATE_LIST_TITLE');
			$this->arResult['FILTER'] = $this->prepareFilter();
			$this->arResult['GRID'] = $this->prepareGrid();
		}

		$this->includeComponentTemplate();
	}

	/**
	 * @return array
	 */
	public function configureActions()
	{
		return [];
	}

	/**
	 * @return bool
	 * @throws \Bitrix\Main\LoaderException
	 */
	protected function includeModules()
	{
		if(Loader::includeModule('documentgenerator') && Loader::includeModule('socialnetwork'))
		{
			if(empty($this->arParams['MODULE']) || (ModuleManager::isModuleInstalled($this->arParams['MODULE'])) && Loader::includeModule($this->arParams['MODULE']))
			{
				return true;
			}
		}

		return false;
	}

	/**
	 * @return array
	 */
	protected function prepareGrid()
	{
		$grid = [];
		$grid['GRID_ID'] = $this->gridId;
		$grid['COLUMNS'] = [
			[
				'id' => 'ID',
				'name' => 'ID',
				'default' => false,
				'sort' => 'ID',
			],
			[
				'id' => 'NAME',
				'name' => Loc::getMessage('DOCGEN_TEMPLATE_LIST_NAME'),
				'default' => true,
				'sort' => 'NAME',
			],
			[
				'id' => 'PROVIDERS',
				'name' => Loc::getMessage('DOCGEN_TEMPLATE_LIST_PROVIDERS'),
				'default' => true,
				'sort' => false,
			],
			[
				'id' => 'REGION',
				'name' => Loc::getMessage('DOCGEN_TEMPLATE_LIST_REGION'),
				'default' => false,
				'sort' => false,
			],
			[
				'id' => 'UPDATE_TIME',
				'name' => Loc::getMessage('DOCGEN_TEMPLATE_LIST_UPDATE_TIME'),
				'default' => true,
				'sort' => 'UPDATE_TIME',
			],
			[
				'id' => 'CREATE_TIME',
				'name' => Loc::getMessage('DOCGEN_TEMPLATE_LIST_CREATE_TIME'),
				'default' => false,
				'sort' => 'CREATE_TIME',
			],
			[
				'id' => 'DOWNLOAD',
				'name' => Loc::getMessage('DOCGEN_TEMPLATE_LIST_DOWNLOAD'),
				'default' => true,
				'sort' => false,
			],
			[
				'id' => 'SORT',
				'name' => Loc::getMessage('DOCGEN_TEMPLATE_LIST_SORT'),
				'default' => false,
				'sort' => 'SORT',
			],
			[
				'id' => 'ACTIVE',
				'name' => Loc::getMessage('DOCGEN_TEMPLATE_LIST_ACTIVE'),
				'default' => false,
				'sort' => 'ACTIVE',
			],
		];

		$gridOptions = new Bitrix\Main\Grid\Options($this->gridId);
		$navParams = $gridOptions->getNavParams(['nPageSize' => 10]);
		$pageSize = (int)$navParams['nPageSize'];
		$gridSort = $gridOptions->GetSorting(['sort' => $this->defaultGridSort]);

		$pageNavigation = new \Bitrix\Main\UI\PageNavigation($this->navParamName);
		$pageNavigation->allowAllRecords(false)->setPageSize($pageSize)->initFromUri();

		$this->arResult['GRID']['ROWS'] = $buffer = [];
		$templateList = TemplateTable::getList([
			'order' => $gridSort['sort'],
			'offset' => $pageNavigation->getOffset(),
			'limit' => $pageNavigation->getLimit(),
			'filter' => $this->getListFilter(),
			'count_total' => true,
		]);
		$templates = $templateList->fetchAll();

		if(!empty($templates))
		{
			$providerTypes = $this->getProviders();
			foreach($templates as $template)
			{
				$buffer[$template['ID']] = $template;
			}
			$templates = $buffer;
			unset($buffer);
			$providers = TemplateProviderTable::getList(['filter' => ['TEMPLATE_ID' => array_keys($templates)]]);
			while($provider = $providers->fetch())
			{
				$templates[$provider['TEMPLATE_ID']]['PROVIDERS'][] = $provider['PROVIDER'];
				$templates[$provider['TEMPLATE_ID']]['PROVIDER_NAMES'][] = $providerTypes[$provider['PROVIDER']]['NAME'];
			}
			foreach($templates as $template)
			{
				$templateInstance = \Bitrix\DocumentGenerator\Template::loadFromArray($template);
				$grid['ROWS'][] = [
					'id' => $template['ID'],
					'data' => $template,
					'actions' => [
						[
							'ICONCLASS' => 'edit',
							'TEXT' => Loc::getMessage('DOCGEN_TEMPLATE_LIST_EDIT'),
							'ONCLICK' => 'BX.DocumentGenerator.TemplateList.edit(\''.$template['ID'].'\')',
						],
						[
							'ICONCLASS' => 'delete',
							'TEXT' => Loc::getMessage('DOCGEN_TEMPLATE_LIST_DELETE'),
							'ONCLICK' => 'BX.DocumentGenerator.TemplateList.delete(\''.$template['ID'].'\')',
						],
					],
					'columns' => [
						'ID' => $template['ID'],
						'ACTIVE' => ($template['ACTIVE'] !== 'Y' ? Loc::getMessage('DOCGEN_TEMPLATE_LIST_ACTIVE_NO') : Loc::getMessage('DOCGEN_TEMPLATE_LIST_ACTIVE_YES')),
						'NAME' => htmlspecialcharsbx($template['NAME']),
						'REGION' => $this->getRegions()[$template['REGION']]['NAME'],
						'UPDATE_TIME' => $template['UPDATE_TIME'],
						'PROVIDERS' => implode(', ', $template['PROVIDER_NAMES']),
						'CREATE_TIME' => $template['CREATE_TIME'],
						'SORT' => $template['SORT'],
						'DOWNLOAD' => '<a href="'.$templateInstance->getDownloadUrl()->getLocator().'">'.Loc::getMessage('DOCGEN_TEMPLATE_LIST_DOWNLOAD').'</a>',
					],
				];
			}
		}

		$pageNavigation->setRecordCount($templateList->getCount());
		$grid['NAV_PARAM_NAME'] = $this->navParamName;
		$grid['CURRENT_PAGE'] = $pageNavigation->getCurrentPage();
		$grid['NAV_OBJECT'] = $pageNavigation;
		$grid['TOTAL_ROWS_COUNT'] = $templateList->getCount();
		$grid['AJAX_MODE'] = 'Y';
		if(!empty($templates))
		{
			$grid['ALLOW_ROWS_SORT'] = true;
		}
		$grid['AJAX_OPTION_JUMP'] = "N";
		$grid['AJAX_OPTION_STYLE'] = "N";
		$grid['AJAX_OPTION_HISTORY'] = "N";
		$grid['AJAX_ID'] = \CAjax::GetComponentID("bitrix:main.ui.grid", '', '');
		$grid['SHOW_PAGESIZE'] = true;
		$grid['PAGE_SIZES'] = [['NAME' => 10, 'VALUE' => 10], ['NAME' => 20, 'VALUE' => 20], ['NAME' => 50, 'VALUE' => 50]];
		$grid['ACTIONS'] = [
			'delete' => true,
		];
		$grid['SHOW_ROW_CHECKBOXES'] = true;
		$grid['SHOW_CHECK_ALL_CHECKBOXES'] = true;
		$grid['SHOW_ACTION_PANEL'] = true;
		$snippet = new \Bitrix\Main\Grid\Panel\Snippet();
		$grid['ACTION_PANEL'] = [
			'GROUPS' => [
				[
					'ITEMS' => [
						$snippet->getRemoveButton(),
					],
				],
			]
		];

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
			'DISABLE_SEARCH' => true,
			'ENABLE_LABEL' => true,
			'RESET_TO_DEFAULT_MODE' => false,
		];

		return $filter;
	}

	protected function getDefaultFilterFields()
	{
		return [
			[
				"id" => "NAME",
				"name" => Loc::getMessage('DOCGEN_TEMPLATE_LIST_NAME'),
				"default" => true
			],
			[
				"id" => "PROVIDER",
				"name" => Loc::getMessage('DOCGEN_TEMPLATE_LIST_PROVIDERS'),
				"type" => "list",
				"items" => $this->getProviders(),
				"default" => true,
				"params" => [
					'multiple' => 'Y',
				]
			],
			[
				'id' => 'REGION',
				'name' => Loc::getMessage('DOCGEN_TEMPLATE_LIST_REGION'),
				'type' => 'list',
				'items' => $this->getRegions(),
				'default' => true,
				'params' => ['multiple' => 'Y'],
			],
			[
				"id" => "UPDATE_TIME",
				"name" => Loc::getMessage('DOCGEN_TEMPLATE_LIST_UPDATE_TIME'),
				"type" => "date",
				"default" => true
			],
			[
				"id" => "CREATE_TIME",
				"name" => Loc::getMessage('DOCGEN_TEMPLATE_LIST_CREATE_TIME'),
				"type" => "date",
				"default" => false
			],
			[
				"id" => "ACTIVE",
				"name" => Loc::getMessage('DOCGEN_TEMPLATE_LIST_ACTIVE'),
				"type" => "list",
				"items" => [
					"Y" => Loc::getMessage('DOCGEN_TEMPLATE_LIST_ACTIVE_YES'),
					"N" => Loc::getMessage('DOCGEN_TEMPLATE_LIST_ACTIVE_NO'),
				],
				"default" => false
			],
		];
	}

	/**
	 * @return array|null
	 */
	protected function getProviders()
	{
		static $providers = null;
		if($providers === null)
		{
			$providers = DataProviderManager::getInstance()->getList(['filter' => ['MODULE' => $this->arParams['MODULE']]]);
		}
		return $providers;
	}

	/**
	 * @return array
	 */
	protected function getListFilter()
	{
		$filterOptions = new Bitrix\Main\UI\Filter\Options($this->filterId);
		$requestFilter = $filterOptions->getFilter($this->getDefaultFilterFields());

		$filter = ['IS_DELETED' => 'N'];
		if(isset($requestFilter['UPDATE_TIME_from']) && $requestFilter['UPDATE_TIME_from'])
		{
			$filter['>=UPDATE_TIME'] = $requestFilter['UPDATE_TIME_from'];
		}
		if(isset($requestFilter['UPDATE_TIME_to']) && $requestFilter['UPDATE_TIME_to'])
		{
			$filter['<=UPDATE_TIME'] = $requestFilter['UPDATE_TIME_to'];
		}
		if(isset($requestFilter['CREATE_TIME_from']) && $requestFilter['CREATE_TIME_from'])
		{
			$filter['>=CREATE_TIME'] = $requestFilter['CREATE_TIME_from'];
		}
		if(isset($requestFilter['CREATE_TIME_to']) && $requestFilter['CREATE_TIME_to'])
		{
			$filter['<=CREATE_TIME'] = $requestFilter['CREATE_TIME_to'];
		}
		if(isset($requestFilter['NAME']) && $requestFilter['NAME'])
		{
			$filter['NAME'] = '%' . $requestFilter['NAME'] . '%';
		}
		if(isset($requestFilter['PROVIDER']) && $requestFilter['PROVIDER'])
		{
			$filter['@PROVIDER.PROVIDER'] = $requestFilter['PROVIDER'];
		}
		if(isset($requestFilter['REGION']) && $requestFilter['REGION'])
		{
			$filter['@REGION'] = $requestFilter['REGION'];
		}
		if(isset($requestFilter['ACTIVE']) && $requestFilter['ACTIVE'])
		{
			$filter['ACTIVE'] = $requestFilter['ACTIVE'];
		}

		return $filter;
	}

	/**
	 * @param array $order
	 * @return AjaxJson|static
	 * @throws Exception
	 * @throws \Bitrix\Main\ArgumentException
	 * @throws \Bitrix\Main\LoaderException
	 * @throws \Bitrix\Main\ObjectPropertyException
	 * @throws \Bitrix\Main\SystemException
	 */
	public function resortListAction(array $order)
	{
		if(!$this->includeModules())
		{
			Loc::loadMessages(__FILE__);
			return AjaxJson::createError(new ErrorCollection([new Error(Loc::getMessage('DOCGEN_TEMPLATE_DOWNLOAD_ADD_TEMPLATE_ERROR_MODULE'))]));
		}
		$gridOptions = new Bitrix\Main\Grid\Options($this->gridId);
		$gridSort = $gridOptions->GetSorting(['sort' => $this->defaultGridSort]);
		$updateTemplates = [];
		if($gridSort['sort'] == $this->defaultGridSort)
		{
			$templates = TemplateTable::getList([
				'select' => ['ID', 'SORT'],
				'order' => $gridSort['sort'],
				'filter' => ['=ID' => $order],
			]);
			$temp = [];
			foreach($templates as $template)
			{
				$temp[$template['ID']] = $template;
			}
			$templates = $temp;
			unset($temp);
			$i = 0;
			$startReorder = false;
			$startSort = $endSort = 0;
			foreach($templates as $template)
			{
				if($startReorder && $template['ID'] == $order[$i])
				{
					break;
				}
				if(!$startReorder && $template['ID'] != $order[$i])
				{
					$startReorder = true;
					$startSort = $template['SORT'];
				}
				if($startReorder)
				{
					$updateTemplates[] = $order[$i];
				}
				$endSort = $template['SORT'];
				$i++;
			}
			$prevSort = 0;
			if(!empty($updateTemplates))
			{
				$stepSort = ($endSort - $startSort) / (count($updateTemplates) + 1);
				foreach($updateTemplates as $step => $templateId)
				{
					$sort = ($startSort + $stepSort * ($step + 1));
					while($sort <= $prevSort)
					{
						$sort++;
					}
					TemplateTable::update($templateId, ['SORT' => $sort]);
					$prevSort = $sort;
				}
			}
		}
		return new AjaxJson($updateTemplates);
	}

	/**
	 * @return array
	 */
	protected function getRegions()
	{
		static $result = null;

		if($result === null)
		{
			$result = [];
			$regions = \Bitrix\DocumentGenerator\Driver::getInstance()->getRegionsList();
			foreach($regions as $region)
			{
				$result[$region['CODE']] = ['NAME' => $region['TITLE']];
			}
		}

		return $result;
	}
}