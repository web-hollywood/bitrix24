<?php
namespace Bitrix\Crm\Filter;

use Bitrix\Main;
use Bitrix\Main\Localization\Loc;

use Bitrix\Crm;
use Bitrix\Crm\EntityAddress;
use Bitrix\Crm\Category\DealCategory;
use Bitrix\Crm\Counter\EntityCounterType;
use Bitrix\Crm\PhaseSemantics;

Loc::loadMessages(__FILE__);

class DealDataProvider extends EntityDataProvider
{
	/** @var DealSettings|null */
	protected $settings = null;

	function __construct(DealSettings $settings)
	{
		$this->settings = $settings;
	}

	/**
	 * Get Settings
	 * @return DealSettings
	 */
	public function getSettings()
	{
		return $this->settings;
	}

	/**
	 * Get Deal Category ID
	 * @return int
	 */
	public function getCategoryID()
	{
		return $this->settings->getCategoryID();
	}

	/**
	 * Get Deal Category Access Data
	 * @return array
	 */
	public function getCategoryAccessData()
	{
		return $this->settings->getCategoryAccessData();
	}

	/**
	 * Get specified entity field caption.
	 * @param string $fieldID Field ID.
	 * @return string
	 */
	protected function getFieldName($fieldID)
	{
		$name = Loc::getMessage("CRM_DEAL_FILTER_{$fieldID}");
		if($name === null)
		{
			$name = \CCrmDeal::GetFieldCaption($fieldID);
		}

		return $name;
	}

	/**
	 * Prepare field list.
	 * @return Field[]
	 */
	public function prepareFields()
	{
		$result =  array(
			'ID' => $this->createField('ID'),
			'TITLE' => $this->createField('TITLE'),
			'ASSIGNED_BY_ID' => $this->createField(
				'ASSIGNED_BY_ID',
				array('type' => 'custom_entity', 'default' => true, 'partial' => true)
			),
			'OPPORTUNITY' => $this->createField(
				'OPPORTUNITY',
				array('type' => 'number')
			),
			'CURRENCY_ID' => $this->createField(
				'CURRENCY_ID',
				array('type' => 'list', 'partial' => true)
			),
			'PROBABILITY' => $this->createField(
				'PROBABILITY',
				array('type' => 'number')
			),
			'IS_NEW' => $this->createField(
				'IS_NEW',
				array('type' => 'checkbox')
			),
			'IS_RETURN_CUSTOMER' => $this->createField(
				'IS_RETURN_CUSTOMER',
				array('type' => 'checkbox')
			),
			'IS_REPEATED_APPROACH' => $this->createField(
				'IS_REPEATED_APPROACH',
				array('type' => 'checkbox')
			),
			'SOURCE_ID' => $this->createField(
				'SOURCE_ID',
				array('type' => 'list', 'default' => true, 'partial' => true)
			)
		);

		$result['STAGE_SEMANTIC_ID'] = $this->createField(
			'STAGE_SEMANTIC_ID',
			array('type' => 'list', 'default' => true, 'partial' => true)
		);

		if($this->getCategoryID() >= 0)
		{
			$result['STAGE_ID'] = $this->createField(
			'STAGE_ID',
				array('type' => 'list', 'default' => true, 'partial' => true)
			);
		}
		elseif(\Bitrix\Crm\Category\DealCategory::isCustomized())
		{
			$result['CATEGORY_ID'] = $this->createField(
				'CATEGORY_ID',
				array('type' => 'list', 'default' => true, 'partial' => true)
			);
		}
		else
		{
			$result['STAGE_ID'] = $this->createField(
				'STAGE_ID',
				array('type' => 'list', 'default' => true, 'partial' => true)
			);
		}

		$result['BEGINDATE'] = $this->createField(
			'BEGINDATE',
			array('type' => 'date')
		);

		if(!$this->settings->checkFlag(DealSettings::FLAG_RECURRING))
		{
			$result['CLOSEDATE'] = $this->createField(
				'CLOSEDATE',
				array('type' => 'date', 'default' => true)
			);

			$result['CLOSED'] = $this->createField(
				'CLOSED',
				array('type' => 'checkbox')
			);

			$result['ACTIVITY_COUNTER'] = $this->createField(
				'ACTIVITY_COUNTER',
				array('type' => 'list', 'default' => true, 'partial' => true)
			);
		}

		//region OUTDATED EVENT FIELDS
		$result['EVENT_DATE'] = $this->createField(
			'EVENT_DATE',
			array('type' => 'date')
		);

		$result['EVENT_ID'] = $this->createField(
			'EVENT_ID',
			array('type' => 'list', 'partial' => true)
		);
		//endregion

		//endregion

		$result += array(
			'CONTACT_ID' => $this->createField(
				'CONTACT_ID',
				array('type' => 'custom_entity', 'default' => true, 'partial' => true)
			),
			'CONTACT_FULL_NAME' => $this->createField('CONTACT_FULL_NAME'),
			'COMPANY_ID' => $this->createField(
				'COMPANY_ID',
				array('type' => 'custom_entity', 'default' => true, 'partial' => true)
			),
			'COMPANY_TITLE' => $this->createField('COMPANY_TITLE'),
			'COMMENTS' => $this->createField('COMMENTS'),
			'TYPE_ID' => $this->createField(
				'TYPE_ID',
				array('type' => 'list', 'partial' => true)
			),
			'DATE_CREATE' => $this->createField(
				'DATE_CREATE',
				array('type' => 'date')
			),
			'DATE_MODIFY' => $this->createField(
				'DATE_MODIFY',
				array('type' => 'date')
			),
			'CREATED_BY_ID' => $this->createField(
				'CREATED_BY_ID',
				array('type' => 'custom_entity', 'partial' => true)
			),
			'MODIFY_BY_ID' => $this->createField(
				'MODIFY_BY_ID',
				array('type' => 'custom_entity', 'partial' => true)
			)
		);

		if(!$this->settings->checkFlag(DealSettings::FLAG_RECURRING))
		{
			$result['PRODUCT_ROW_PRODUCT_ID'] = $this->createField(
				'PRODUCT_ROW_PRODUCT_ID',
				array('type' => 'custom_entity', 'partial' => true)
			);

			$result['ORIGINATOR_ID'] = $this->createField(
				'ORIGINATOR_ID',
				array('type' => 'list', 'partial' => true)
			);

			$result['WEBFORM_ID'] = $this->createField(
				'WEBFORM_ID',
				array('type' => 'list', 'partial' => true)
			);

			//region UTM
			foreach (Crm\UtmTable::getCodeNames() as $code => $name)
			{
				$result[$code] = $this->createField($code, array('name' => $name));
			}
			//endregion
		}
		else
		{
			$result['CRM_DEAL_RECURRING_ACTIVE'] = $this->createField(
				'CRM_DEAL_RECURRING_ACTIVE',
				array(
					'name' => Loc::getMessage('CRM_DEAL_FILTER_RECURRING_ACTIVE'),
					'default' => true,
					'type' => 'checkbox'
				)
			);
			$result['CRM_DEAL_RECURRING_NEXT_EXECUTION'] = $this->createField(
				'CRM_DEAL_RECURRING_NEXT_EXECUTION',
				array(
					'name' => Loc::getMessage('CRM_DEAL_FILTER_RECURRING_NEXT_EXECUTION'),
					'default' => true,
					'type' => 'date'
				)
			);
			$result['CRM_DEAL_RECURRING_LIMIT_DATE'] = $this->createField(
				'CRM_DEAL_RECURRING_LIMIT_DATE',
				array(
					'name' => Loc::getMessage('CRM_DEAL_FILTER_RECURRING_LIMIT_DATE'),
					'type' => 'date'
				)
			);
			$result['CRM_DEAL_RECURRING_COUNTER_REPEAT'] = $this->createField(
				'CRM_DEAL_RECURRING_COUNTER_REPEAT',
				array(
					'name' => Loc::getMessage('CRM_DEAL_FILTER_RECURRING_COUNTER_REPEAT'),
					'type' => 'number'
				)
			);
		}
		return $result;
	}

	/**
	 * Prepare complete field data for specified field.
	 * @param string $fieldID Field ID.
	 * @return array|null
	 * @throws Main\NotSupportedException
	 */
	public function prepareFieldData($fieldID)
	{

		if($fieldID === 'CURRENCY_ID')
		{
			return array(
				'params' => array('multiple' => 'Y'),
				'items' => \CCrmCurrencyHelper::PrepareListItems()
			);
		}
		elseif($fieldID === 'TYPE_ID')
		{
			return array(
				'params' => array('multiple' => 'Y'),
				'items' => \CCrmStatus::GetStatusList('DEAL_TYPE')
			);
		}
		elseif($fieldID === 'ASSIGNED_BY_ID')
		{
			return array(
				'params' => array('multiple' => 'Y'),
				'selector' => array(
					'TYPE' => 'user',
					'DATA' => array('ID' => 'assigned_by', 'FIELD_ID' => 'ASSIGNED_BY_ID')
				)
			);
		}
		elseif($fieldID === 'STAGE_ID')
		{
			$categoryID = $this->getCategoryID();
			return array(
				'params' => array('multiple' => 'Y'),
				'items' => DealCategory::getStageList(max($categoryID, 0))
			);
		}
		elseif($fieldID === 'STAGE_SEMANTIC_ID')
		{
			return PhaseSemantics::getListFilterInfo(
				\CCrmOwnerType::Deal,
				array('params' => array('multiple' => 'Y'))
			);
		}
		elseif($fieldID === 'CATEGORY_ID')
		{
			$categoryAccess = $this->getCategoryAccessData();
			return array(
				'params' => array('multiple' => 'Y'),
				'items' => isset($categoryAccess['READ'])
					? DealCategory::prepareSelectListItems($categoryAccess['READ']) : array()
			);
		}
		elseif($fieldID === 'ACTIVITY_COUNTER')
		{
			return EntityCounterType::getListFilterInfo(
				array('params' => array('multiple' => 'Y')),
				array('ENTITY_TYPE_ID' => \CCrmOwnerType::Deal)
			);
		}
		elseif($fieldID === 'CONTACT_ID')
		{
			return array(
				//'params' => array('multiple' => 'Y'),
				'selector' => array(
					'TYPE' => 'crm_entity',
					'DATA' => array(
						'ID' => 'contact',
						'FIELD_ID' => 'CONTACT_ID',
						'FIELD_ALIAS' => 'ASSOCIATED_CONTACT_ID',
						'ENTITY_TYPE_NAMES' => array(\CCrmOwnerType::ContactName)
						//'IS_MULTIPLE' => true
					)
				)
			);
		}
		elseif($fieldID === 'COMPANY_ID')
		{
			return array(
				'selector' => array(
					'TYPE' => 'crm_entity',
					'DATA' => array(
						'ID' => 'company',
						'FIELD_ID' => 'COMPANY_ID',
						'ENTITY_TYPE_NAMES' => array(\CCrmOwnerType::CompanyName)
					)
				)
			);
		}
		elseif($fieldID === 'CREATED_BY_ID')
		{
			return array(
				'params' => array('multiple' => 'Y'),
				'selector' => array(
					'TYPE' => 'user',
					'DATA' => array('ID' => 'created_by', 'FIELD_ID' => 'CREATED_BY_ID')
				)
			);
		}
		elseif($fieldID === 'MODIFY_BY_ID')
		{
			return array(
				'params' => array('multiple' => 'Y'),
				'selector' => array(
					'TYPE' => 'user',
					'DATA' => array('ID' => 'modify_by', 'FIELD_ID' => 'MODIFY_BY_ID')
				)
			);
		}
		elseif($fieldID === 'ORIGINATOR_ID')
		{
			return array(
				'items' => array('' => Loc::getMessage('CRM_DEAL_FILTER_ALL'))
					+ \CCrmExternalSaleHelper::PrepareListItems()
			);
		}
		elseif($fieldID === 'EVENT_ID')
		{
			return array('items' => array('' => '') + \CCrmStatus::GetStatusList('EVENT_TYPE'));
		}
		elseif($fieldID === 'PRODUCT_ROW_PRODUCT_ID')
		{
			return array(
				'params' => array('multiple' => 'N'),
				'selector' => array(
					'TYPE' => 'crm_entity',
					'DATA' => array(
						'ID' => 'product',
						'FIELD_ID' => 'PRODUCT_ROW_PRODUCT_ID',
						'ENTITY_TYPE_NAMES' => array('PRODUCT'),
						'IS_MULTIPLE' => false
					)
				)
			);
		}
		elseif($fieldID === 'WEBFORM_ID')
		{
			return array(
				'params' => array('multiple' => 'Y'),
				'items' => Crm\WebForm\Manager::getListNames()
			);
		}
		elseif($fieldID === 'SOURCE_ID')
		{
			return array(
				'params' => array('multiple' => 'Y'),
				'items' => \CCrmStatus::GetStatusList('SOURCE')
			);
		}
		return null;
	}
}