<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

use Bitrix\Main\Localization\Loc;
use Bitrix\Main\ErrorCollection;

Loc::loadMessages(__FILE__);

/**
 * Class UiTileListComponent
 */
class UiTileListComponent extends CBitrixComponent
{
	/** @var ErrorCollection $errors */
	protected $errors;

	protected function checkRequiredParams()
	{
		return true;
	}

	protected function initParams()
	{
		$this->arParams['ID'] = isset($this->arParams['ID']) ? $this->arParams['ID'] : '';
		$this->arParams['LIST'] = (isset($this->arParams['LIST']) && is_array($this->arParams['LIST']))
			? $this->arParams['LIST']
			: [];
	}

	protected function prepareResult()
	{
		$this->arResult['LIST'] = [];
		$list = $this->arParams['LIST'];
		foreach ($list as $item)
		{
			$id = isset($item['id']) ? $item['id'] : null;
			if (!isset($item['name']) || !$item['name'])
			{
				continue;
			}
			if (!isset($item['data']) || !$item['data'])
			{
				if (!$id)
				{
					continue;
				}
			}

			$this->arResult['LIST'][] = array(
				'name' => $item['name'],
				'data' => $item['data'],
				'id' => $id,
				'bgcolor' => isset($item['bgcolor']) ? $item['bgcolor'] : null,
				'color' => isset($item['color']) ? $item['color'] : null,
			);
		}

		return true;
	}

	protected function printErrors()
	{
		foreach ($this->errors as $error)
		{
			ShowError($error);
		}
	}

	public function executeComponent()
	{
		$this->errors = new \Bitrix\Main\ErrorCollection();
		$this->initParams();
		if (!$this->checkRequiredParams())
		{
			$this->printErrors();
			return;
		}

		if (!$this->prepareResult())
		{
			$this->printErrors();
			return;
		}

		$this->includeComponentTemplate();
	}
}