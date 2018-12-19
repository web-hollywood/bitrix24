<?php

namespace Bitrix\Crm\Volume;

use Bitrix\Crm;
use Bitrix\Main;
use Bitrix\Main\Entity;
use Bitrix\Main\Localization\Loc;

Loc::loadMessages(__FILE__);

class Deal extends Crm\Volume\Base implements Crm\Volume\IVolumeClear, Crm\Volume\IVolumeClearActivity, Crm\Volume\IVolumeClearEvent, Crm\Volume\IVolumeUrl
{
	/** @var array */
	protected static $entityList = array(
		Crm\DealTable::class,
		Crm\DealRecurTable::class,
		Crm\Category\Entity\DealCategoryTable::class,
		Crm\Binding\DealContactTable::class,
		Crm\History\Entity\DealStageHistoryTable::class,
		Crm\Statistics\Entity\DealActivityStatisticsTable::class,
		Crm\Statistics\Entity\DealChannelStatisticsTable::class,
		Crm\Statistics\Entity\DealInvoiceStatisticsTable::class,
		Crm\Statistics\Entity\DealSumStatisticsTable::class,
	);

	/** @var array */
	protected static $filterFieldAlias = array(
		//'STAGE_SEMANTIC_ID' => 'STAGE_SEMANTIC_ID',
		'DEAL_STAGE_SEMANTIC_ID' => 'STAGE_SEMANTIC_ID',
		'DEAL_DATE_CREATE' => 'DATE_CREATE',
		'DATE_CREATE' => 'DATE_CREATE',
		'DEAL_DATE_CLOSE' => 'CLOSEDATE',
		//'LEAD_STAGE_SEMANTIC_ID' => 'LEAD_BY.STATUS_SEMANTIC_ID',
		//'LEAD_DATE_CREATE' => 'LEAD_BY.DATE_CREATE',
		//'LEAD_DATE_CLOSE' => 'LEAD_BY.DATE_CLOSED',
	);

	/**
	 * Returns title of the indicator.
	 * @return string
	 */
	public function getTitle()
	{
		return Loc::getMessage('CRM_VOLUME_DEAL_TITLE');
	}

	/**
	 * Returns entity list attached to disk object.
	 * @param string $entityClass Class name of entity.
	 * @return string|null
	 */
	public static function getDiskConnector($entityClass)
	{
		$attachedEntityList = array();
		if (parent::isModuleAvailable('disk'))
		{
			$attachedEntityList[Crm\DealTable::class] = \Bitrix\Disk\Uf\CrmDealConnector::class;
		}

		return $attachedEntityList[$entityClass] ? : null;
	}

	/**
	 * Returns Socialnetwork log entity list attached to disk object.
	 * @param string $entityClass Class name of entity.
	 * @return string|null
	 */
	public static function getLiveFeedConnector($entityClass)
	{
		$attachedEntityList = array();
		if (parent::isModuleAvailable('socialnetwork') && parent::isModuleAvailable('disk'))
		{
			$attachedEntityList[Crm\DealTable::class] = \CCrmLiveFeedEntity::Deal;
		}

		return $attachedEntityList[$entityClass] ? : null;
	}

	/**
	 * Returns availability to drop entity.
	 *
	 * @return boolean
	 */
	public function canClearEntity()
	{
		$userPermissions = \CCrmPerms::GetUserPermissions($this->getOwner());
		if (!\CCrmDeal::CheckReadPermission(0, $userPermissions))
		{
			$this->collectError(new Main\Error('', self::ERROR_PERMISSION_DENIED));

			return false;
		}
		if (!\CCrmDeal::CheckDeletePermission(0, $userPermissions))
		{
			$this->collectError(new Main\Error('', self::ERROR_PERMISSION_DENIED));

			return false;
		}

		return true;
	}

	/**
	 * Returns availability to drop entity activities.
	 *
	 * @return boolean
	 */
	public function canClearActivity()
	{
		$activityVolume = new Crm\Volume\Activity();
		return $activityVolume->canClearEntity();
	}

	/**
	 * Returns availability to drop entity event.
	 *
	 * @return boolean
	 */
	public function canClearEvent()
	{
		$eventVolume = new Crm\Volume\Event();
		return $eventVolume->canClearEntity();
	}

	/**
	 * Can filter applied to the indicator.
	 * @return boolean
	 */
	public function canBeFiltered()
	{
		return true;
	}

	/**
	 * Get entity list path.
	 * @return string
	 */
	public function getUrl()
	{
		static $entityListPath;
		if($entityListPath === null)
		{
			$entityListPath = \CComponentEngine::MakePathFromTemplate(
				\Bitrix\Main\Config\Option::get('crm', 'path_to_deal_list', '/crm/deal/list/')
			);
		}

		return $entityListPath;
	}

	/**
	 * Get filter reset parems for entity grid.
	 * @return array
	 */
	public function getGridFilterResetParam()
	{
		$entityListReset = array(
			'FILTER_ID' => 'CRM_DEAL_LIST_V12',
			'GRID_ID' => 'CRM_DEAL_LIST_V12',
			'FILTER_FIELDS' => 'STAGE_SEMANTIC_ID,DATE_CREATE',
		);

		return $entityListReset;
	}

	/**
	 * Get filter alias for url to entity list path.
	 * @return array
	 */
	public function getFilterAlias()
	{
		return array(
			'STAGE_SEMANTIC_ID' => 'STAGE_SEMANTIC_ID',
			'DATE_CREATE' => 'DATE_CREATE',
		);
	}

	/**
	 * Component action list for measure process.
	 * @param array $componentCommandAlias Command alias.
	 * @return array
	 */
	public function getActionList($componentCommandAlias)
	{
		$indicatorId = static::getIndicatorId();


		$query = Crm\DealTable::query();

		$dateMin = new Entity\ExpressionField('DATE_MIN', "DATE_FORMAT(MIN(%s), '%%Y-%%m-%%d')", 'DATE_CREATE');
		$query->registerRuntimeField('', $dateMin)->addSelect('DATE_MIN');

		$monthCount = new Entity\ExpressionField('MONTHS', 'TIMESTAMPDIFF(MONTH, MIN(%s), MAX(%s))', array('DATE_CREATE', 'DATE_CREATE'));
		$query->registerRuntimeField('', $monthCount)->addSelect('MONTHS');

		$res = $query->exec();
		if ($row = $res->fetch())
		{
			list($dateSplitPeriod, $dateSplitPeriodUnits) = $this->getDateSplitPeriod();

			$dateMin =  new \Bitrix\Main\Type\DateTime($row['DATE_MIN'], 'Y-m-d');
			$months =  $row['MONTHS'];

			while ($months >= 0)
			{
				$period = $dateMin->format('Y.m');
				$dateMin->add("$dateSplitPeriod $dateSplitPeriodUnits");
				$period .= '-';
				$period .= $dateMin->format('Y.m');
				$months -= $dateSplitPeriod;

				$queueList[] = array(
					'indicatorId' => $indicatorId,
					'action' => $componentCommandAlias['MEASURE_ENTITY'],
					'period' => $period,
				);
				$queueList[] = array(
					'indicatorId' => $indicatorId,
					'action' => $componentCommandAlias['MEASURE_FILE'],
					'period' => $period,
				);
			}
		}


		$query = Crm\ActivityTable::query();

		$dateMin = new Entity\ExpressionField('DATE_MIN', "DATE_FORMAT(MIN(%s), '%%Y-%%m-%%d')", 'CREATED');
		$query->registerRuntimeField('', $dateMin)->addSelect('DATE_MIN');

		$monthCount = new Entity\ExpressionField('MONTHS', 'TIMESTAMPDIFF(MONTH, MIN(%s), MAX(%s))', array('CREATED', 'CREATED'));
		$query->registerRuntimeField('', $monthCount)->addSelect('MONTHS');

		$res = $query->exec();
		if ($row = $res->fetch())
		{
			list($dateSplitPeriod, $dateSplitPeriodUnits) = $this->getDateSplitPeriod();

			$dateMin =  new \Bitrix\Main\Type\DateTime($row['DATE_MIN'], 'Y-m-d');
			$months =  $row['MONTHS'];

			while ($months >= 0)
			{
				$period = $dateMin->format('Y.m');
				$dateMin->add("$dateSplitPeriod $dateSplitPeriodUnits");
				$period .= '-';
				$period .= $dateMin->format('Y.m');
				$months -= $dateSplitPeriod;

				$queueList[] = array(
					'indicatorId' => $indicatorId,
					'action' => $componentCommandAlias['MEASURE_ACTIVITY'],
					'period' => $period,
				);
				$queueList[] = array(
					'indicatorId' => $indicatorId,
					'action' => $componentCommandAlias['MEASURE_EVENT'],
					'period' => $period,
				);
			}
		}

		return $queueList;
	}


	/**
	 * Returns query.
	 * @return Entity\Query
	 */
	public function prepareQuery()
	{
		return Crm\DealTable::query();
	}

	/**
	 * Runs measure test for tables.
	 * @return self
	 */
	public function measureEntity()
	{
		self::loadTablesInformation();

		$query = $this->prepareQuery();

		if ($this->prepareFilter($query))
		{
			$avgDealTableRowLength = (double)self::$tablesInformation[Crm\DealTable::getTableName()]['AVG_SIZE'];

			$connection = \Bitrix\Main\Application::getConnection();

			$this->checkTemporally();

			$data = array(
				'INDICATOR_TYPE' => '',
				'OWNER_ID' => '',
				'DATE_CREATE' => new \Bitrix\Main\Type\Date(),
				'STAGE_SEMANTIC_ID' => '',
				'ENTITY_COUNT' => '',
				'ENTITY_SIZE' => '',
			);

			$insert = $connection->getSqlHelper()->prepareInsert(Crm\VolumeTmpTable::getTableName(), $data);

			$sqlIns = 'INSERT INTO '.$connection->getSqlHelper()->quote(Crm\VolumeTmpTable::getTableName()). '('. $insert[0]. ') ';

			$query
				->registerRuntimeField('', new Entity\ExpressionField('INDICATOR_TYPE', '\''.static::getIndicatorId().'\''))
				->addSelect('INDICATOR_TYPE')

				->registerRuntimeField('', new Entity\ExpressionField('OWNER_ID', '\''.$this->getOwner().'\''))
				->addSelect('OWNER_ID')

				//date
				->addSelect('DATE_CREATE_SHORT')
				->addGroup('DATE_CREATE_SHORT')

				// STAGE_SEMANTIC_ID
				->addSelect('STAGE_SEMANTIC_ID')
				->addGroup('STAGE_SEMANTIC_ID')

				->registerRuntimeField('', new Entity\ExpressionField('ENTITY_COUNT', 'COUNT(%s)', 'ID'))
				->addSelect('ENTITY_COUNT')

				->registerRuntimeField('', new Entity\ExpressionField('ENTITY_SIZE', 'COUNT(%s) * '.$avgDealTableRowLength, 'ID'))
				->addSelect('ENTITY_SIZE');

			$connection->queryExecute($sqlIns. $query->getQuery());

			$entityList = self::getEntityList();
			foreach ($entityList as $entityClass)
			{
				if ($entityClass == Crm\DealTable::class)
				{
					continue;
				}
				/**
				 * @var \Bitrix\Main\Entity\DataManager $entityClass
				 */
				$entityEntity = $entityClass::getEntity();

				$fieldName = '';
				if ($entityEntity->hasField('DEAL_ID'))
				{
					$fieldName = 'DEAL_ID';
				}
				elseif ($entityEntity->hasField('OWNER_ID'))
				{
					$fieldName = 'OWNER_ID';
				}
				if ($fieldName !== '')
				{
					$query = $this->prepareQuery();

					if ($this->prepareFilter($query))
					{
						$reference = new Entity\ReferenceField(
							'RefEntity',
							$entityClass,
							array('this.ID' => 'ref.'.$fieldName),
							array('join_type' => 'INNER')
						);
						$query->registerRuntimeField('', $reference);

						$primary = $entityEntity->getPrimary();
						if (is_array($primary) && !empty($primary))
						{
							array_walk($primary, function (&$item)
							{
								$item = 'RefEntity.'.$item;
							});
						}
						elseif (!empty($primary))
						{
							$primary = array('RefEntity.'.$primary);
						}

						$query
							//primary
							//->setSelect($primary)
							->registerRuntimeField('', new Entity\ExpressionField('COUNT_REF', 'COUNT(*)'))
							->addSelect('COUNT_REF')
							->setGroup($primary)

							//date
							->addSelect('DATE_CREATE_SHORT')
							->addGroup('DATE_CREATE_SHORT')

							// STAGE_SEMANTIC_ID
							->addSelect('STAGE_SEMANTIC_ID')
							->addGroup('STAGE_SEMANTIC_ID');

						$avgTableRowLength = (double)self::$tablesInformation[$entityClass::getTableName()]['AVG_SIZE'];

						$query1 = new Entity\Query($query);
						$query1
							->registerRuntimeField('', new Entity\ExpressionField('INDICATOR_TYPE', '\''.static::getIndicatorId().'\''))
							->addSelect('INDICATOR_TYPE')

							->registerRuntimeField('', new Entity\ExpressionField('OWNER_ID', '\''.$this->getOwner().'\''))
							->addSelect('OWNER_ID')

							//date
							->addSelect('DATE_CREATE_SHORT')
							->addGroup('DATE_CREATE_SHORT')

							// STAGE_SEMANTIC_ID
							->addSelect('STAGE_SEMANTIC_ID')
							->addGroup('STAGE_SEMANTIC_ID')

							->registerRuntimeField('', new Entity\ExpressionField('REF_SIZE', 'SUM(COUNT_REF) * '. $avgTableRowLength))
							->addSelect('REF_SIZE');

						Crm\VolumeTmpTable::updateFromSelect(
							$query1,
							array('ENTITY_SIZE' => 'destination.ENTITY_SIZE + source.REF_SIZE'),
							array(
								'INDICATOR_TYPE' => 'INDICATOR_TYPE',
								'OWNER_ID' => 'OWNER_ID',
								'DATE_CREATE' => 'DATE_CREATE_SHORT',
								'STAGE_SEMANTIC_ID' => 'STAGE_SEMANTIC_ID',
							)
						);
					}
				}
			}

			$this->copyTemporallyData();
		}

		return $this;
	}

	/**
	 * Runs measure test for tables.
	 * @return self
	 */
	public function measureFiles()
	{
		self::loadTablesInformation();

		$query = $this->prepareQuery();

		if ($this->prepareFilter($query))
		{
			$source = array();

			$groupByFields = array(
				'DATE_CREATE_SHORT' => 'DATE_CREATE_SHORT',
				'STAGE_SEMANTIC_ID' => 'STAGE_SEMANTIC_ID',
			);

			$entityUserFieldList = $this->getUserTypeFieldList(Crm\DealTable::class);
			/** @var array $userField */
			foreach ($entityUserFieldList as $userField)
			{
				$sql = $this->prepareUserFieldQuery(Crm\DealTable::class, $userField, $groupByFields);

				if ($sql !== '')
				{
					$source[] = $sql;
				}
			}

			$diskConnector = static::getDiskConnector(Crm\DealTable::class);
			if ($diskConnector !== null)
			{
				$sql = $this->prepareDiskAttachedQuery(Crm\DealTable::class, $diskConnector, $groupByFields);
				if ($sql !== '')
				{
					$source[] = $sql;
				}
			}

			$liveFeedConnector = static::getLiveFeedConnector(Crm\DealTable::class);
			if ($liveFeedConnector !== null)
			{
				$sql = $this->prepareLiveFeedQuery(Crm\DealTable::class, $liveFeedConnector, $groupByFields);
				if ($sql !== '')
				{
					$source[] = $sql;
				}
			}

			if (count($source) > 0)
			{
				$querySql = "
					SELECT 
						'".static::getIndicatorId()."' as INDICATOR_TYPE,
						'".$this->getOwner()."' as OWNER_ID,
						DATE_CREATE_SHORT as DATE_CREATE,
						STAGE_SEMANTIC_ID, 
						SUM(FILE_SIZE) as FILE_SIZE,
						SUM(FILE_COUNT) as FILE_COUNT,
						SUM(DISK_SIZE) as DISK_SIZE,
						SUM(DISK_COUNT) as DISK_COUNT
					FROM 
					(
						(".implode(' ) UNION ( ', $source).")
					) src
					GROUP BY 
						STAGE_SEMANTIC_ID, 
						DATE_CREATE
				";

				Crm\VolumeTable::updateFromSelect(
					$querySql,
					array(
						'FILE_SIZE' => 'destination.FILE_SIZE + source.FILE_SIZE',
						'FILE_COUNT' => 'destination.FILE_COUNT + source.FILE_COUNT',
						'DISK_SIZE' => 'destination.DISK_SIZE + source.DISK_SIZE',
						'DISK_COUNT' => 'destination.DISK_COUNT + source.DISK_COUNT',
					),
					array(
						'INDICATOR_TYPE',
						'OWNER_ID',
						'DATE_CREATE',
						'STAGE_SEMANTIC_ID',
					)
				);
			}
		}

		return $this;
	}

	/**
	 * Runs measure test for activities.
	 * @param array $additionActivityFilter Filter for activity list.
	 * @return self
	 */
	public function measureActivity($additionActivityFilter = array())
	{
		self::loadTablesInformation();

		$querySql = $this->prepareActivityQuery(array(
			'DATE_CREATE' => 'DEAL.DATE_CREATE_SHORT',
			'DEAL_STAGE_SEMANTIC_ID' => 'DEAL.STAGE_SEMANTIC_ID',
		));

		if ($querySql != '')
		{
			$avgActivityTableRowLength = (double)self::$tablesInformation[Crm\ActivityTable::getTableName()]['AVG_SIZE'];
			$avgBindingTableRowLength = (double)self::$tablesInformation[Crm\ActivityBindingTable::getTableName()]['AVG_SIZE'];

			$querySql = "
				SELECT 
					'".static::getIndicatorId()."' as INDICATOR_TYPE,
					'".$this->getOwner()."' as OWNER_ID,
					DATE_CREATE,
					DEAL_STAGE_SEMANTIC_ID, 
					(	FILE_SIZE +
						ACTIVITY_COUNT * {$avgActivityTableRowLength} + 
						BINDINGS_COUNT * {$avgBindingTableRowLength} ) as ACTIVITY_SIZE,
					ACTIVITY_COUNT
				FROM 
				(
					{$querySql}
				) src
			";

			Crm\VolumeTable::updateFromSelect(
				$querySql,
				array(
					'ACTIVITY_SIZE' => 'destination.ACTIVITY_SIZE + source.ACTIVITY_SIZE',
					'ACTIVITY_COUNT' => 'destination.ACTIVITY_COUNT + source.ACTIVITY_COUNT',
				),
				array(
					'INDICATOR_TYPE' => 'INDICATOR_TYPE',
					'OWNER_ID' => 'OWNER_ID',
					'DATE_CREATE' => 'DATE_CREATE',
					'STAGE_SEMANTIC_ID' => 'DEAL_STAGE_SEMANTIC_ID',
				)
			);
		}

		return $this;
	}

	/**
	 * Runs measure test for events.
	 * @param array $additionEventFilter Filter for event list.
	 * @return self
	 */
	public function measureEvent($additionEventFilter = array())
	{
		self::loadTablesInformation();

		$querySql = $this->prepareEventQuery(array(
			'DATE_CREATE' => 'DEAL.DATE_CREATE_SHORT',
			'DEAL_STAGE_SEMANTIC_ID' => 'DEAL.STAGE_SEMANTIC_ID',
		));

		if ($querySql != '')
		{
			$avgEventTableRowLength = (double)self::$tablesInformation[Crm\EventTable::getTableName()]['AVG_SIZE'];

			$querySql = "
				SELECT 
					'".static::getIndicatorId()."' as INDICATOR_TYPE,
					'".$this->getOwner()."' as OWNER_ID,
					DATE_CREATE,
					DEAL_STAGE_SEMANTIC_ID, 
					(	FILE_SIZE +
						EVENT_COUNT * {$avgEventTableRowLength} ) as EVENT_SIZE,
					EVENT_COUNT
				FROM 
				(
					{$querySql}
				) src
			";

			Crm\VolumeTable::updateFromSelect(
				$querySql,
				array(
					'EVENT_SIZE' => 'destination.EVENT_SIZE + source.EVENT_SIZE',
					'EVENT_COUNT' => 'destination.EVENT_COUNT + source.EVENT_COUNT',
				),
				array(
					'INDICATOR_TYPE' => 'INDICATOR_TYPE',
					'OWNER_ID' => 'OWNER_ID',
					'DATE_CREATE' => 'DATE_CREATE',
					'STAGE_SEMANTIC_ID' => 'DEAL_STAGE_SEMANTIC_ID',
				)
			);
		}

		return $this;
	}


	/**
	 * Returns count of entities.
	 *
	 * @return int
	 */
	public function countEntity()
	{
		$count = -1;

		$query = $this->prepareQuery();

		if ($this->prepareFilter($query))
		{
			$count = 0;

			$query
				->registerRuntimeField('', new Entity\ExpressionField('CNT', 'COUNT(%s)', 'ID'))
				->addSelect('CNT')
			;

			$res = $query->exec();
			if ($row = $res->fetch())
			{
				$count = $row['CNT'];
			}
		}

		return $count;

	}

	/**
	 * Performs dropping entity.
	 *
	 * @return boolean
	 */
	public function clearEntity()
	{
		if (!$this->canClearEntity())
		{
			return false;
		}

		$query = $this->prepareQuery();

		if ($this->prepareFilter($query))
		{

			$query
				->addSelect('ID', 'DEAL_ID')
				->setLimit(self::MAX_ENTITY_PER_INTERACTION)
				->setOrder(array('ID' => 'ASC'))
			;

			if ($this->getProcessOffset() > 0)
			{
				$query->where('ID', '>', $this->getProcessOffset());
			}

			$res = $query->exec();

			$success = true;

			$userPermissions = \CCrmPerms::GetUserPermissions($this->getOwner());

			$connection = \Bitrix\Main\Application::getConnection();

			$crmDeal = new \CCrmDeal(false);

			while ($deal = $res->fetch())
			{
				$this->setProcessOffset($deal['DEAL_ID']);

				if(\CCrmDeal::CheckDeletePermission($deal['DEAL_ID'], $userPermissions))
				{
					$connection->startTransaction();

					if($crmDeal->Delete($deal['DEAL_ID'], array('CURRENT_USER' => $this->getOwner())))
					{
						$connection->commitTransaction();
					}
					else
					{
						$connection->rollbackTransaction();

						$err = '';
						global $APPLICATION;
						if ($APPLICATION instanceof \CMain)
						{
							$err = $APPLICATION->GetException();
						}
						if ($err == '')
						{
							$err = 'Deletion failed with deal #'.$deal['DEAL_ID'];
						}
						$this->collectError(new Main\Error($err, self::ERROR_DELETION_FAILED));

						$this->incrementFailCount();
					}

					$this->incrementDroppedEntityCount();
				}
				else
				{
					$this->collectError(new Main\Error('Access denied to drop deal #'.$deal['DEAL_ID'], self::ERROR_PERMISSION_DENIED));
					$this->incrementFailCount();
				}

				if ($this->hasTimeLimitReached())
				{
					$success = false;
					break;
				}
			}
		}

		return $success;
	}



	/**
	 * Returns count of activities.
	 * @param array $additionActivityFilter Filter for activity list.
	 * @return int
	 */
	public function countActivity($additionActivityFilter = array())
	{
		$additionActivityFilter['=BINDINGS.OWNER_TYPE_ID'] = \CCrmOwnerType::Deal;
		return parent::countActivity($additionActivityFilter);
	}

	/**
	 * Performs dropping associated entity activities.
	 *
	 * @return boolean
	 */
	public function clearActivity()
	{
		if (!$this->canClearActivity())
		{
			return false;
		}

		$userPermissions = \CCrmPerms::GetUserPermissions($this->getOwner());

		$activityVolume = new Crm\Volume\Activity();
		$activityVolume->setFilter($this->getFilter());

		$query = $activityVolume->prepareQuery();

		$success = true;

		if ($activityVolume->prepareFilter($query))
		{
			$query
				->setSelect(array(
					'ID' => 'ID',
					'DEAL_ID' => 'BINDINGS.OWNER_ID',
				))
				->where('BINDINGS.OWNER_TYPE_ID', '=', \CCrmOwnerType::Deal)
				->setLimit(self::MAX_ENTITY_PER_INTERACTION)
				->setOrder(array('ID' => 'ASC'));

			if ($this->getProcessOffset() > 0)
			{
				$query->where('ID', '>', $this->getProcessOffset());
			}

			$res = $query->exec();

			while ($activity = $res->fetch())
			{
				$this->setProcessOffset($activity['ID']);

				$activity['OWNER_TYPE_ID'] = \CCrmOwnerType::Deal;
				$activity['OWNER_ID'] = $activity['DEAL_ID'];

				if (\CCrmActivity::CheckItemDeletePermission($activity, $userPermissions))
				{
					\CCrmActivity::DeleteByOwner(\CCrmOwnerType::Deal, $activity['DEAL_ID']);

					//todo: fail count here

					$this->incrementDroppedActivityCount();
				}
				else
				{
					$this->collectError(new Main\Error('Access denied to activity #'.$activity['ID'], self::ERROR_PERMISSION_DENIED));
					$this->incrementFailCount();
				}

				if ($this->hasTimeLimitReached())
				{
					$success = false;
					break;
				}
			}
		}

		return $success;
	}


	/**
	 * Returns count of events.
	 * @param array $additionEventFilter Filter for events list.
	 * @return int
	 */
	public function countEvent($additionEventFilter = array())
	{
		$additionEventFilter['=ENTITY_TYPE'] = \CCrmOwnerType::DealName;
		return parent::countEvent($additionEventFilter);
	}

	/**
	 * Performs dropping associated entity events.
	 *
	 * @return boolean
	 */
	public function clearEvent()
	{
		if (!$this->canClearEvent())
		{
			return false;
		}

		$eventVolume = new Crm\Volume\Event();
		$eventVolume->setFilter($this->getFilter());

		$query = $eventVolume->prepareQuery();

		$success = true;

		if ($eventVolume->prepareFilter($query))
		{
			$query
				->addSelect('ID', 'RELATION_ID')
				->where('ENTITY_TYPE', '=', \CCrmOwnerType::DealName)
				->setLimit(self::MAX_ENTITY_PER_INTERACTION)
				->setOrder(array('RELATION_ID' => 'ASC'));

			if ($this->getProcessOffset() > 0)
			{
				$query->where('RELATION_ID', '>', $this->getProcessOffset());
			}

			$res = $query->exec();

			$entity = new \CCrmEvent();
			while ($event = $res->fetch())
			{
				$this->setProcessOffset($event['RELATION_ID']);

				if ($entity->Delete($event['RELATION_ID'], array('CURRENT_USER' => $this->getOwner())) !== false)
				{
					$this->incrementDroppedEventCount();
				}
				else
				{
					$this->collectError(new Main\Error('Deletion failed with event #'.$event['RELATION_ID'], self::ERROR_DELETION_FAILED));
					$this->incrementFailCount();
				}

				if ($this->hasTimeLimitReached())
				{
					$success = false;
					break;
				}
			}
		}

		return $success;
	}
}
