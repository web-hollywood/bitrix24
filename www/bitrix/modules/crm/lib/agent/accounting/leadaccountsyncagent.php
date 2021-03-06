<?php
namespace Bitrix\Crm\Agent\Accounting;

use Bitrix\Crm\Agent\EntityStepwiseAgent;

class LeadAccountSyncAgent extends EntityStepwiseAgent
{
	const ITERATION_LIMIT = 200;
	/** @var LeadAccountSyncAgent|null */
	private static $instance = null;
	/**
	 * @return LeadAccountSyncAgent|null
	 */
	public static function getInstance()
	{
		if(self::$instance === null)
		{
			self::$instance = new LeadAccountSyncAgent();
		}
		return self::$instance;
	}
	public static function activate()
	{
		\CAgent::AddAgent(
			__CLASS__.'::run();',
			'crm',
			'Y',
			2,
			'',
			'Y',
			ConvertTimeStamp(time() + \CTimeZone::GetOffset(), 'FULL')
		);
	}
	//region EntityTimelineBuildAgent
	public function process(array $itemIDs)
	{
		\CCrmLead::RefreshAccountingData($itemIDs);
	}
	protected function getOptionName()
	{
		return '~CRM_SYNC_LEAD_ACCOUNTING';
	}
	protected function getProgressOptionName()
	{
		return '~CRM_SYNC_LEAD_ACCOUNTING_PROGRESS';
	}
	protected function getTotalEntityCount()
	{
		return \CCrmLead::GetListEx(array(), array('CHECK_PERMISSIONS' => 'N'), array(), false);
	}
	protected function getEnityIDs($offsetID, $limit)
	{
		$filter = array('CHECK_PERMISSIONS' => 'N');
		if($offsetID > 0)
		{
			$filter['>ID'] = $offsetID;
		}

		$dbResult = \CCrmLead::GetListEx(
			array('ID' => 'ASC'),
			$filter,
			false,
			array('nTopCount' => $limit),
			array('ID')
		);

		$results = array();

		if(is_object($dbResult))
		{
			while($fields = $dbResult->Fetch())
			{
				$results[] = (int)$fields['ID'];
			}
		}
		return $results;
	}
	protected function getIterationLimit()
	{
		return self::ITERATION_LIMIT;
	}
	//endregion
}