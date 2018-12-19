<?php

namespace Bitrix\Crm\Integration\DocumentGenerator\DataProvider;

use Bitrix\Crm\Integration\DocumentGenerator\Value\Money;
use Bitrix\DocumentGenerator\DataProvider\ArrayDataProvider;
use Bitrix\DocumentGenerator\DataProviderManager;
use Bitrix\Iblock\ElementTable;

abstract class ProductsDataProvider extends CrmEntityDataProvider
{
	/** @var Product[] */
	protected $products;
	/** @var Tax[] */
	protected $taxes;

	abstract protected function getCrmProductOwnerType();

	/**
	 * @return array
	 */
	public function getFields()
	{
		if($this->fields === null)
		{
			parent::getFields();

			$this->fields['PRODUCTS'] = [
				'PROVIDER' => ArrayDataProvider::class,
				'TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_PRODUCTS_TITLE'),
				'OPTIONS' => [
					'ITEM_PROVIDER' => Product::class,
					'ITEM_NAME' => 'PRODUCT',
					'ITEM_TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_PRODUCT_TITLE'),
				],
				'VALUE' => [$this, 'loadProducts'],
			];
			$this->fields['TAXES'] = [
				'PROVIDER' => ArrayDataProvider::class,
				'TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_TAXES_TITLE'),
				'OPTIONS' => [
					'ITEM_PROVIDER' => Tax::class,
					'ITEM_NAME' => 'TAX',
					'ITEM_TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_TAX_TITLE'),
				],
				'VALUE' => [$this, 'loadTaxes'],
			];
			$this->fields['CURRENCY_ID'] = [
				'VALUE' => [$this, 'getCurrencyId'],
			];
			$this->fields['CURRENCY_NAME'] = [
				'TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_CURRENCY_NAME_TITLE'),
				'VALUE' => [$this, 'getCurrencyName'],
			];
			$this->fields = array_merge($this->fields, $this->getTotalFields());
		}

		return $this->fields;
	}

	protected function fetchData()
	{
		parent::fetchData();
		if(!$this->isLightMode())
		{
			$this->loadProducts();
			$this->calculateTotalFields();
		}
	}

	/**
	 * @return Product[]
	 */
	public function loadProducts()
	{
		if($this->products === null)
		{
			$products = [];
			if($this->isLoaded())
			{
				$productsData = $this->loadProductsData();
				$this->loadIblockProductsData($productsData);
				foreach($productsData as $productData)
				{
					$product = new Product($productData);
					$product->setParentProvider($this);
					$products[] = $product;
				}
			}
			$this->products = $products;
		}

		return $this->products;
	}

	/**
	 * @return array
	 */
	protected function loadProductsData()
	{
		$result = [];
		$crmProducts = \CAllCrmProductRow::LoadRows($this->getCrmProductOwnerType(), $this->source);
		foreach($crmProducts as $crmProduct)
		{
			if($crmProduct['TAX_INCLUDED'] !== 'Y')
			{
				$crmProduct['PRICE'] = $crmProduct['PRICE_EXCLUSIVE'];
			}
			$result[] = [
				'NAME' => $crmProduct['PRODUCT_NAME'],
				'PRODUCT_ID' => $crmProduct['PRODUCT_ID'],
				'QUANTITY' => $crmProduct['QUANTITY'],
				'PRICE' => $crmProduct['PRICE'],
				'DISCOUNT_RATE' => $crmProduct['DISCOUNT_RATE'],
				'DISCOUNT_SUM' => $crmProduct['DISCOUNT_SUM'],
				'TAX_RATE' => $crmProduct['TAX_RATE'],
				'TAX_INCLUDED' => $crmProduct['TAX_INCLUDED'],
				'SORT' => $crmProduct['SORT'],
				'MEASURE_CODE' => $crmProduct['MEASURE_CODE'],
				'MEASURE_NAME' => $crmProduct['MEASURE_NAME'],
				'OWNER_ID' => $this->source,
				'OWNER_TYPE' => $this->getCrmProductOwnerType(),
				'CUSTOMIZED' => $crmProduct['CUSTOMIZED'],
				'DISCOUNT_TYPE_ID' => $crmProduct['DISCOUNT_TYPE_ID'],
				'CURRENCY_ID' => $this->getCurrencyId(),
			];
		}

		return $result;
	}

	/**
	 * @param array $products
	 */
	protected function loadIblockProductsData(array &$products)
	{
		$ids = [];
		foreach($products as $key => $product)
		{
			if($product['PRODUCT_ID'] > 0)
			{
				$ids[$product['PRODUCT_ID']][] = $key;
			}
		}
		if(!empty($ids))
		{
			$query = ElementTable::getList(['select' => ['ID', 'DETAIL_TEXT', 'PREVIEW_PICTURE', 'DETAIL_PICTURE', 'IBLOCK_SECTION.NAME'], 'filter' => ['@ID' => array_keys($ids)]]);
			while($data = $query->fetch())
			{
				$dataToMerge = [];
				if(isset($ids[$data['ID']]))
				{
					$dataToMerge['DESCRIPTION'] = $data['DETAIL_TEXT'];
					if($data['PREVIEW_PICTURE'] > 0)
					{
						$dataToMerge['PREVIEW_PICTURE'] = \CFile::GetPath($data['PREVIEW_PICTURE']);
					}
					if($data['DETAIL_PICTURE'] > 0)
					{
						$dataToMerge['DETAIL_PICTURE'] = \CFile::GetPath($data['DETAIL_PICTURE']);
					}
					$dataToMerge['SECTION'] = $data['IBLOCK_ELEMENT_IBLOCK_SECTION_NAME'];
					foreach($ids[$data['ID']] as $key)
					{
						$products[$key] = array_merge($products[$key], $dataToMerge);
					}
				}
			}
		}
	}

	protected function calculateTotalFields()
	{
		$currencyID = $this->getCurrencyId();
		if(empty($this->products))
		{
			$sum = $this->data['OPPORTUNITY'];
			$this->data['TOTAL_RAW'] = $this->data['TOTAL_SUM'] = $sum;
			return;
		}
		$crmProducts = [];
		foreach($this->getTotalFields() as $placeholder => $field)
		{
			if(isset($field['FORMAT']) && (!isset($field['FORMAT']['WORDS']) || $field['FORMAT']['WORDS'] !== true))
			{
				$this->data[$placeholder] = 0;
			}
		}
		foreach($this->products as $product)
		{
			$this->data['TOTAL_DISCOUNT'] += $product->getRawValue('QUANTITY') * $product->getRawValue('DISCOUNT_SUM');
			$this->data['TOTAL_QUANTITY'] += $product->getRawValue('QUANTITY');
			$this->data['TOTAL_RAW'] += $product->getRawValue('PRICE_RAW_SUM');
			$crmProducts[] = DataProviderManager::getInstance()->getArray($product, ['rawValue' => true]);
		}
		$calcOptions = [];
		if(\CCrmTax::isTaxMode())
		{
			$calcOptions = [
				'LOCATION_ID' => $this->getLocationId(),
				'ALLOW_LD_TAX' => 'Y',
			];
		}
		$calculate = \CCrmSaleHelper::Calculate($crmProducts, $currencyID, $this->getPersonTypeID(), false, 's1', $calcOptions);
		if(is_array($calculate['TAX_LIST']) && \CCrmTax::isTaxMode())
		{
			foreach($calculate['TAX_LIST'] as $taxInfo)
			{
				$tax = new Tax([
					'NAME' => $taxInfo['NAME'],
					'VALUE' => new Money($taxInfo['TAX_VAL'], ['CURRENCY_ID' => $currencyID, 'WITH_ZEROS' => true]),
					'NETTO' => 0,
					'BRUTTO' => 0,
					'RATE' => (float)$taxInfo['VALUE'],
					'TAX_INCLUDED' => $taxInfo['IS_IN_PRICE'],
				]);
				$tax->setParentProvider($this);
				$this->taxes[] = $tax;
			}
		}
		$this->data['TOTAL_SUM'] = $calculate['PRICE'];
		$this->data['TOTAL_TAX'] = $calculate['TAX_VALUE'];
		$this->data['TOTAL_BEFORE_TAX'] = $this->data['TOTAL_SUM'] - $this->data['TOTAL_TAX'];
		$this->data['TOTAL_BEFORE_DISCOUNT'] = $this->data['TOTAL_BEFORE_TAX'] + $this->data['TOTAL_DISCOUNT'];
	}

	/**
	 * @return array
	 */
	protected function getTotalFields()
	{
		$currencyID = $this->getCurrencyId();
		$totalFields = [
			'TOTAL_DISCOUNT' => [
				'TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_TOTAL_DISCOUNT_TITLE'),
				'TYPE' => Money::class,
				'FORMAT' => ['CURRENCY_ID' => $currencyID, 'WITH_ZEROS' => true],
			],
			'TOTAL_SUM' => [
				'TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_TOTAL_SUM_TITLE'),
				'TYPE' => Money::class,
				'FORMAT' => ['CURRENCY_ID' => $currencyID, 'WITH_ZEROS' => true],
			],
			'TOTAL_RAW' => [
				'TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_TOTAL_RAW_TITLE'),
				'TYPE' => Money::class,
				'FORMAT' => ['CURRENCY_ID' => $currencyID, 'WITH_ZEROS' => true],
			],
			'TOTAL_TAX' => [
				'TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_TOTAL_TAX_TITLE'),
				'TYPE' => Money::class,
				'FORMAT' => ['CURRENCY_ID' => $currencyID, 'WITH_ZEROS' => true],
			],
			'TOTAL_TAX_WORDS' => [
				'TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_TOTAL_TAX_WORDS_TITLE'),
				'TYPE' => Money::class,
				'VALUE' => [$this, 'getSumWithoutWords'],
				'FORMAT' => ['CURRENCY_ID' => $currencyID, 'WORDS' => true],
			],
			'TOTAL_BEFORE_TAX' => [
				'TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_TOTAL_BEFORE_TAX_TITLE'),
				'TYPE' => Money::class,
				'FORMAT' => ['CURRENCY_ID' => $currencyID, 'WITH_ZEROS' => true],
			],
			'TOTAL_BEFORE_TAX_WORDS' => [
				'TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_TOTAL_BEFORE_TAX_WORDS_TITLE'),
				'TYPE' => Money::class,
				'VALUE' => [$this, 'getSumWithoutWords'],
				'FORMAT' => ['CURRENCY_ID' => $currencyID, 'WORDS' => true],
			],
			'TOTAL_BEFORE_DISCOUNT' => [
				'TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_TOTAL_BEFORE_DISCOUNT_TITLE'),
				'TYPE' => Money::class,
				'FORMAT' => ['CURRENCY_ID' => $currencyID, 'WITH_ZEROS' => true],
			],
			'TOTAL_SUM_WORDS' => [
				'TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_TOTAL_SUM_WORDS_TITLE'),
				'TYPE' => Money::class,
				'VALUE' => [$this, 'getSumWithoutWords'],
				'FORMAT' => ['CURRENCY_ID' => $currencyID, 'WORDS' => true],
			],
			'TOTAL_QUANTITY' => [
				'TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_TOTAL_QUANTITY_TITLE'),
			],
			'TOTAL_QUANTITY_WORDS' => [
				'TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_TOTAL_QUANTITY_WORDS_TITLE'),
				'TYPE' => Money::class,
				'VALUE' => [$this, 'getSumWithoutWords'],
				'FORMAT' => ['CURRENCY_ID' => $currencyID, 'WORDS' => true, 'NO_SIGN' => true],
			],
			'TOTAL_ROWS_WORDS' => [
				'TITLE' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_TOTAL_ROWS_WORDS_TITLE'),
				'TYPE' => Money::class,
				'VALUE' => [$this, 'getTotalRows'],
				'FORMAT' => ['CURRENCY_ID' => $currencyID, 'WORDS' => true, 'NO_SIGN' => true],
			],
		];

		return $totalFields;
	}

	/**
	 * @return int
	 */
	public function getTotalRows()
	{
		return count($this->products);
	}

	/**
	 * @return int
	 */
	protected function getPersonTypeID()
	{
		$personTypes = \CCrmPaySystem::getPersonTypeIDs();
		$personTypeId = $personTypes['CONTACT'];
		if($this->data['COMPANY_ID'] > 0)
		{
			$personTypeId = $personTypes['COMPANY'];
		}

		return $personTypeId;
	}

	/**
	 * @return string
	 */
	public function getCurrencyId()
	{
		if(!$this->data['CURRENCY_ID'])
		{
			$this->data['CURRENCY_ID'] = \CCrmCurrency::GetBaseCurrencyID();
		}
		return $this->data['CURRENCY_ID'];
	}

	/**
	 * @return string
	 */
	public function getCurrencyName()
	{
		return \CCrmCurrency::GetCurrencyName($this->getCurrencyId());
	}

	public function loadTaxes()
	{
		$this->loadProducts();
		if(!empty($this->data))
		{
			if($this->taxes === null)
			{
				$this->taxes = $taxes = [];
				if(\CCrmTax::isTaxMode())
				{
					return $this->taxes;
				}
				foreach($this->products as $product)
				{
					if($product->getRawValue('TAX_RATE') > 0)
					{
						if(!isset($taxes[$product->getRawValue('TAX_RATE')]))
						{
							$taxes[$product->getRawValue('TAX_RATE')] = [
								'NAME' => GetMessage('CRM_DOCGEN_PRODUCTSDATAPROVIDER_TAX_VAT_NAME'),
								'VALUE' => 0,
								'NETTO' => 0,
								'BRUTTO' => 0,
								'RATE' => $product->getRawValue('TAX_RATE'),
								'TAX_INCLUDED' => $product->getRawValue('TAX_INCLUDED'),
							];
						}
						$taxes[$product->getRawValue('TAX_RATE')]['VALUE'] += $product->getRawValue('TAX_VALUE_SUM');
						$taxes[$product->getRawValue('TAX_RATE')]['NETTO'] += $product->getRawValue('PRICE_EXCLUSIVE_SUM');
						$taxes[$product->getRawValue('TAX_RATE')]['BRUTTO'] += $product->getRawValue('PRICE_SUM');
					}
				}
				$currencyID = $this->getCurrencyId();
				foreach($taxes as $tax)
				{
					$tax['VALUE'] = new Money($tax['VALUE'], ['CURRENCY_ID' => $currencyID, 'WITH_ZEROS' => true]);
					$tax['NETTO'] = new Money($tax['NETTO'], ['CURRENCY_ID' => $currencyID, 'WITH_ZEROS' => true]);
					$tax['BRUTTO'] = new Money($tax['BRUTTO'], ['CURRENCY_ID' => $currencyID, 'WITH_ZEROS' => true]);
					$tax = new Tax($tax);
					$tax->setParentProvider($this);
					$this->taxes[] = $tax;
				}
			}
		}

		return $this->taxes;
	}

	/**
	 * @return mixed
	 */
	protected function getLocationId()
	{
		if($this->isLoaded())
		{
			return $this->data['LOCATION_ID'];
		}

		return null;
	}

	protected function getHiddenFields()
	{
		return array_merge(parent::getHiddenFields(), [
			'CURRENCY_ID',
			'LOCATION_ID',
		]);
	}

	/**
	 * @param string $placeholder
	 * @return bool|mixed
	 */
	public function getSumWithoutWords($placeholder)
	{
		if(!is_string($placeholder) || empty($placeholder))
		{
			return false;
		}
		$shortPlaceholder = str_replace('_WORDS', '', $placeholder);
		// prevent recursion
		if($shortPlaceholder != $placeholder)
		{
			return $this->getRawValue($shortPlaceholder);
		}

		return false;
	}
}