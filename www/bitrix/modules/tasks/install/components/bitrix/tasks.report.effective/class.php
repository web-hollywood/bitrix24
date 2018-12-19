<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

use Bitrix\Main\Config;
use Bitrix\Main\Localization\Loc;
use Bitrix\Main\UI\Filter;
use Bitrix\Tasks\Internals\Counter\EffectiveTable;
use Bitrix\Tasks\Internals\Effective;
use Bitrix\Tasks\Util\Type\DateTime;
use Bitrix\Tasks\Util\User;

Loc::loadMessages(__FILE__);

CBitrixComponent::includeComponentClass("bitrix:tasks.base");

class TasksReportEffectiveComponent extends TasksBaseComponent
{
	protected $userId;
	protected $groupId;

	protected static function checkPermissions(array &$arParams, array &$arResult,
											   \Bitrix\Tasks\Util\Error\Collection $errors, array $auxParams = array())
	{

		$currentUser = User::getId();
		$viewedUser = $arParams['USER_ID'];

		if(!$viewedUser)
		{
			$viewedUser = $_REQUEST['ACTION'][0]['ARGUMENTS']['userId']; //TODO 18.0.0 IN NEW REST
		}

		$isAccessible =
			$currentUser == $viewedUser ||
			User::isSuper($currentUser) ||
			User::isBossRecursively($currentUser, $viewedUser);

		if (!$isAccessible)
		{
			$errors->add('TASKS_MODULE_ACCESS_DENIED', Loc::getMessage("TASKS_COMMON_ACCESS_DENIED"));
		}

		return $errors->checkNoFatals();
	}

	public static function getAllowedMethods()
	{
		return array(
			'getStat'
		);
	}

	protected function checkParameters()
	{
		// todo
		$arParams = &$this->arParams;
		static::tryParseStringParameter($arParams['FILTER_ID'], 'GRID_EFFECTIVE');

		static::tryParseStringParameter($arParams['PATH_TO_USER_PROFILE'], '/company/personal/user/#user_id#/');

		static::tryParseStringParameter(
			$arParams['PATH_TO_EFFECTIVE_DETAIL'],
			'/company/personal/user/#user_id#/tasks/effective/show/'
		);

		static::tryParseStringParameter(
			$arParams['PATH_TO_TASK_ADD'],
			'/company/personal/user/'.User::getId().'/tasks/task/edit/0/'
		);

		static::tryParseStringParameter($arParams['USE_PAGINATION'], true);
		static::tryParseStringParameter($arParams['DEFAULT_PAGE_SIZE'], $this->defaultPageSize);
		static::tryParseArrayParameter($arParams['PAGE_SIZES'], $this->pageSizes);

		$this->userId = $this->arParams['USER_ID'] ? $this->arParams['USER_ID'] : User::getId();
		$this->groupId = $this->arParams['GROUP_ID'] ? $this->arParams['GROUP_ID'] : 0;

		return $this->errors->checkNoFatals();
	}

	protected function getData()
	{
		$this->arResult['FILTERS'] = self::getFilterList();
		$this->arResult['PRESETS'] = self::getPresetList();

		$this->arResult['EFFECTIVE_DATE_START'] = $this->getEffectiveDate();

		$this->arResult['JS_DATA']['userId'] = $this->arParams['USER_ID'];
		$this->arResult['JS_DATA']['stat'] = self::getStat($this->arParams['USER_ID']);
	}

	private function getEffectiveDate()
	{
		$defaultDate = new Datetime();
		$format='Y-m-d H:i:s';
		$dateFromDb = Config\Option::get('tasks', 'effective_date_start', $defaultDate->format($format));
		$date = new DateTime($dateFromDb, $format);

		$dateFormatted = GetMessage('TASKS_EFFECTIVE_DATE_FORMAT', array(
			'#DAY#'          =>$date->format('d'),
			'#MONTH_NAME#'   => GetMessage('TASKS_MONTH_'.(int)$date->format('m')),
			'#YEAR_IF_DIFF#' =>$date->format('Y') != date('Y') ? $date->format('Y') : ''
		));

		return $dateFormatted;
	}

	public static function getFilterList()
	{
		return array(
			'GROUP_ID' => array(
				'id' => 'GROUP_ID',
				'name' => Loc::getMessage('TASKS_FILTER_COLUMN_GROUP_ID'),
				//				'params' => array('multiple' => 'Y'),
				'type' => 'custom_entity',
				'default' => true,
				'selector' => array(
					'TYPE' => 'group',
					'DATA' => array(
						'ID' => 'group',
						'FIELD_ID' => 'GROUP_ID'
					)
				)
			),
			'DATETIME' => array(
				'id' => 'DATETIME',
				'name' => Loc::getMessage('TASKS_FILTER_COLUMN_DATE'),
				'type' => 'date',
				"exclude" => array(
					\Bitrix\Main\UI\Filter\DateType::TOMORROW,
					\Bitrix\Main\UI\Filter\DateType::PREV_DAYS,
					\Bitrix\Main\UI\Filter\DateType::NEXT_DAYS,
					\Bitrix\Main\UI\Filter\DateType::NEXT_WEEK,
					\Bitrix\Main\UI\Filter\DateType::NEXT_MONTH
				),
				'default' => true,
			),
		);
	}

	public static function getPresetList()
	{
		return \Bitrix\Tasks\Internals\Effective::getPresetList();
	}

	public static function getStat($userId)
	{
		$filter = self::processFilter();

		$groupByHour = false;
		if (isset($filter['::']) && $filter['::'] == 'BY_DAY')
		{
			unset($filter['::']);
			$groupByHour = true;
		}
		$groupId = array_key_exists('GROUP_ID', $filter) ? $filter['GROUP_ID'] : 0;

		$dt = array_key_exists('>=DATETIME', $filter) ? $filter['>=DATETIME'] : null;
		$dateFrom = $dt ? new DateTime($dt) : null;

		$dt = array_key_exists('<=DATETIME', $filter) ? $filter['<=DATETIME'] : null;
		$dateTo = $dt ? new DateTime($dt) : null;

		$counters = self::getCountersByRange(new Datetime($dateFrom), new DateTime($dateTo), $userId, $groupId);

		$myRatioNew = 0;
		if ($counters['OPENED'] > 0)
		{
			$myRatioNew = round(100 - ($counters['VIOLATIONS'] / ($counters['OPENED'])) * 100);
		}

		if ($myRatioNew < 0)
		{
			$myRatioNew = 0;
		}

		$graphDataRes = Effective::getStatByRange(
			new Datetime($dateFrom),
			new DateTime($dateTo),
			$userId,
			$groupId,
			$groupByHour ? 'HOUR' : ''
		);

		$graphData = array();
		foreach ($graphDataRes as $row)
		{
			if ($groupByHour)
			{
				$row['DATE'] = $row['HOUR'];
			}
			else
			{
				$row['DATE'] = $row['DATE']->format('Y-m-d');
			}

			$row['EFFECTIVE'] = round($row['EFFECTIVE']);

			$graphData[] = $row;
		}

		return array(
			'MY_RATIO'         => (int)$myRatioNew,
			'CLOSED'           => (int)$counters['CLOSED'],
			'VIOLATION'        => (int)$counters['VIOLATIONS'],
			'IN_PROGRESS'      => (int)$counters['OPENED'],
			'GRAPH_DATA'       => $graphData,
			'GRAPH_MIN_PERIOD' => $groupByHour ? 'hh' : 'DD'
		);
	}

	private static function getCountersByRange(Datetime $dateFrom, Datetime $dateTo, $userId, $groupId = 0)
	{
		$out = array();

		$userId = intval($userId);
		$groupId = intval($groupId);

		$sql = '
			SELECT
				COUNT(TASK_ID) as count
			FROM 
				b_tasks_effective as te
				JOIN b_tasks as t ON te.TASK_ID = t.ID
			WHERE
				te.USER_ID = '.intval($userId).'
				AND IS_VIOLATION = \'Y\'
				AND t.RESPONSIBLE_ID > 0
				AND (
					(DATETIME >= \''.$dateFrom->format('Y-m-d H:i:s').'\' AND DATETIME <= \''.$dateTo->format('Y-m-d H:i:s').'\')
					OR (DATETIME <= \''.$dateTo->format('Y-m-d H:i:s').'\' AND DATETIME_REPAIR IS NULL)
					OR (DATETIME <= \''.$dateTo->format('Y-m-d H:i:s').'\' AND DATETIME_REPAIR >= \''.$dateFrom->format('Y-m-d H:i:s').'\')
 				)
 				'.($groupId > 0 ? 'AND te.GROUP_ID = '.$groupId : '');

		$out['VIOLATIONS'] = (int)\Bitrix\Main\Application::getConnection()->queryScalar($sql);

		$sql = "
			SELECT 
				COUNT(t.ID) as COUNT
			FROM 
				b_tasks as t
				JOIN b_tasks_member as tm ON tm.TASK_ID = t.ID AND tm.TYPE IN ('R', 'A')
			WHERE
				(
					(tm.USER_ID = {$userId} AND tm.TYPE='R' AND t.CREATED_BY != t.RESPONSIBLE_ID)
					OR 
					(tm.USER_ID = {$userId} AND tm.TYPE='A' AND (t.CREATED_BY != {$userId} AND t.RESPONSIBLE_ID != {$userId}))
				)
				
				". ($groupId>0 ? "AND t.GROUP_ID = {$groupId}" : '')."
				
				AND 
					t.CLOSED_DATE >= '".$dateFrom->format('Y-m-d H:i:s')."'
					AND t.CLOSED_DATE <= '".$dateTo->format('Y-m-d H:i:s')."'
			";
		$out['CLOSED'] = (int)\Bitrix\Main\Application::getConnection()->queryScalar($sql);

		$sql = "
            SELECT 
                COUNT(t.ID) as COUNT
            FROM 
                b_tasks as t
                JOIN b_tasks_member as tm ON tm.TASK_ID = t.ID  AND tm.TYPE IN ('R', 'A')
            WHERE
                (
                    (tm.USER_ID = {$userId} AND tm.TYPE='R' AND t.CREATED_BY != t.RESPONSIBLE_ID)
                    OR 
                    (tm.USER_ID = {$userId} AND tm.TYPE='A' AND (t.CREATED_BY != {$userId} AND t.RESPONSIBLE_ID != {$userId}))
                )
                
                ".($groupId > 0 ? "AND t.GROUP_ID = {$groupId}" : '')."
                
                AND t.CREATED_DATE <= '".$dateTo->format('Y-m-d H:i:s')."'
				AND 
				(
					t.CLOSED_DATE >= '".$dateFrom->format('Y-m-d H:i:s')."'
					OR
					CLOSED_DATE is null
				)
				
                AND t.ZOMBIE = 'N'
                AND t.STATUS != 6
            ";
			$out['OPENED'] = (int)\Bitrix\Main\Application::getConnection()->queryScalar($sql);

		return $out;
	}

	private static function processFilter()
	{
		static $arrFilter = array();

		if(!$arrFilter)
		{
			$rawFilter = self::getFilterOptions()->getFilter(self::getFilterList());

			if (!array_key_exists('FILTER_APPLIED', $rawFilter) || $rawFilter['FILTER_APPLIED'] != true)
			{
				return array();
			}

			foreach (self::getFilterList() as $item)
			{
				switch ($item['type'])
				{
					case 'custom_entity':
						if($rawFilter[$item['id']])
						{
							$arrFilter[$item['id']] = $rawFilter[$item['id']];
						}
						break;
					case 'date':
						if (array_key_exists($item['id'].'_from', $rawFilter) &&
							!empty($rawFilter[$item['id'].'_from']))
						{
							$arrFilter['>='.$item['id']] = $rawFilter[$item['id'].'_from'];
						}
						if (array_key_exists($item['id'].'_to', $rawFilter) && !empty($rawFilter[$item['id'].'_to']))
						{
							$arrFilter['<='.$item['id']] = $rawFilter[$item['id'].'_to'];
						}

						if ($rawFilter[$item['id'].'_datesel'] == \Bitrix\Main\UI\Filter\DateType::CURRENT_DAY)
						{
							$arrFilter['::'] = 'BY_DAY';
						}
						break;
				}
			}
		}



		return $arrFilter;
	}

	public static function getFilterId()
	{
		return \Bitrix\Tasks\Internals\Effective::getFilterId();
	}

	private static function getFilterOptions()
	{
		static $instance = null;

		if (!$instance)
		{
			$instance = new Filter\Options(self::getFilterId(), self::getPresetList());
		}

		return $instance;
	}
}
