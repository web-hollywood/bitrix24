<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

use Bitrix\Main\Localization\Loc;

Loc::loadMessages(__FILE__);

/**
 * Class UiButtonPanel
 */
class UiButtonPanel extends CBitrixComponent
{
	const TYPE_SAVE = 'save';
	const TYPE_APPLY = 'apply';
	const TYPE_CANCEL = 'cancel';
	const TYPE_CLOSE = 'close';
	const TYPE_BUTTON = 'button';
	const TYPE_CHECKBOX = 'checkbox';
	const TYPE_CUSTOM = 'custom';

	/**
	 * Is page slider context.
	 *
	 * @return bool
	 */
	protected function isPageSliderContext()
	{
		return $this->request->get('IFRAME') === 'Y'/* && $this->request->get('IFRAME_TYPE') === 'SIDE_SLIDER'*/;
	}

	protected function prepareResultItem(array $item)
	{
		if (empty($item['ID']))
		{
			$item['ID'] = "ui-button-panel-" . $item['TYPE'];
		}

		if (empty($item['NAME']))
		{
			$item['NAME'] = $item['TYPE'];
		}

		$commonTypes = [self::TYPE_SAVE, self::TYPE_APPLY, self::TYPE_CANCEL, self::TYPE_CLOSE];
		if (in_array($item['TYPE'], $commonTypes))
		{
			if (empty($item['ONCLICK']))
			{
				$item['ONCLICK'] = '';
			}
			if (empty($item['CAPTION']))
			{
				$item['CAPTION'] = Loc::getMessage('UI_BUTTON_PANEL_' . strtoupper($item['TYPE']));
			}
			$item['WAIT'] = true;
		}

		switch ($item['TYPE'])
		{
			case self::TYPE_SAVE:
			case self::TYPE_APPLY:
				if (empty($item['VALUE']))
				{
					$item['VALUE'] = 'Y';
				}
				break;

			case self::TYPE_BUTTON:
			case self::TYPE_CANCEL:
			case self::TYPE_CLOSE:
				if (empty($item['ONCLICK']))
				{
					$item['ONCLICK'] = '';
				}
				if (empty($item['VALUE']))
				{
					$item['VALUE'] = 'Y';
				}
				$item['CAPTION'] = empty($item['CAPTION']) ? '' : $item['CAPTION'];
				$item['WAIT'] = empty($item['WAIT']) ? false : (bool) $item['WAIT'];
				$item['LINK'] = empty($item['LINK']) ? '' : $item['LINK'];
				break;

			case self::TYPE_CUSTOM:
				if (empty($item['LAYOUT']))
				{
					return null;
				}
				break;
		}

		if ($item['TYPE'] === self::TYPE_CHECKBOX)
		{
			$item['HINT'] = empty($item['HINT']) ? '' : $item['HINT'];
			$item['CHECKED'] = empty($item['CHECKED']) ? false : (bool) $item['HINT'];
		}

		if ($item['TYPE'] === self::TYPE_CANCEL)
		{
			$item['WAIT'] = false;
		}

		if (in_array($item['TYPE'], [self::TYPE_CANCEL, self::TYPE_CLOSE]))
		{
			$item['LINK'] = empty($item['LINK']) ? '' : $item['LINK'];
		}

		if (!empty($item['HINT']))
		{
			$this->arResult['HAS_HINTS'] = true;
		}

		return $item;
	}

	protected function prepareResult()
	{
		$this->arResult['HAS_HINTS'] = false;
		$this->arResult['LIST'] = [];
		if (!isset($this->arParams['~BUTTONS']) || !is_array($this->arParams['~BUTTONS']))
		{
			$this->arParams['~BUTTONS'] = [];
		}

		foreach ($this->arParams['~BUTTONS'] as $key => $item)
		{
			if (!is_array($item))
			{
				if (is_numeric($key))
				{
					$item = ['TYPE' => $item];
				}
				elseif ($key === self::TYPE_CUSTOM)
				{
					$item = ['TYPE' => $key, 'LAYOUT' => $item];
				}
				elseif (in_array($key, [self::TYPE_CLOSE, self::TYPE_CANCEL]))
				{
					$item = ['TYPE' => $key, 'LINK' => $item];
				}
				else
				{
					$item = null;
				}
			}

			if (!$item)
			{
				continue;
			}

			$item = array_change_key_case($item, CASE_UPPER);
			$item = $this->prepareResultItem($item);
			if ($item)
			{
				$this->arResult['LIST'][] = $item;
			}
		}
	}

	/**
	 * Execute component.
	 *
	 * @return void
	 */
	public function executeComponent()
	{
		$this->arParams['FRAME'] = isset($this->arParams['FRAME'])
			?
			(bool) $this->arParams['FRAME']
			:
			$this->isPageSliderContext();


		$this->prepareResult();
		$this->includeComponentTemplate();
	}
}