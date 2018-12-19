<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();
/**
 * Bitrix Framework
 * @package bitrix
 * @subpackage sale
 * @copyright 2001-2015 Bitrix
 */

/** !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
/** This is alfa version of component! Don't use it! */
/** !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */


use \Bitrix\Main\Localization\Loc;
use Bitrix\Tasks\Helper\Grid;
use Bitrix\Tasks\Helper\Filter;

Loc::loadMessages(__FILE__);

CBitrixComponent::includeComponentClass("bitrix:tasks.task.list");

class TasksTaskGanttComponent extends TasksTaskListComponent
{
	protected function doPreAction()
	{
		$this->grid = Grid::getInstance($this->arParams["USER_ID"], $this->arParams["GROUP_ID"]);
		$this->filter = Filter::getInstance($this->arParams["USER_ID"], $this->arParams["GROUP_ID"]);

		static::tryParseStringParameter(
			$this->arParams['NEED_GROUP_BY_GROUPS'],
			$this->needGroupByGroups() ? 'Y' : 'N'
		);
		static::tryParseStringParameter(
			$this->arParams['NEED_GROUP_BY_SUBTASKS'],
			$this->needGroupBySubTasks() ? 'Y' : 'N'
		);

		$this->arParams['DEFAULT_ROLEID'] = $this->filter->getDefaultRoleId();
		parent::doPreAction();

		return true;
	}

	protected function getPageSize()
	{
		return 50;
	}
	protected function getData()
	{
		parent::getData();

		// TODO вынести надо бы
		$taskIds = array();
		foreach ($this->arResult[ 'LIST' ] as $item)
		{
			$taskIds[] = $item[ 'ID' ];
		}

		$this->arResult[ "TASKS_LINKS" ] = array();
		$res = \Bitrix\Tasks\Internals\Task\ProjectDependenceTable::getListByLegacyTaskFilter(
			$this->listParameters['filter']
		);
		while($item = $res->fetch())
		{
			if(in_array($item['TASK_ID'], $taskIds))
			{
				$this->arResult['TASKS_LINKS'][$item['TASK_ID']][] = $item;
			}
		}

		//region GANTT
		$componentObject = null;
		$this->arResult[ "NAV_STRING" ] = $this->arResult[ "NAV_OBJECT" ]->getPageNavStringEx(
			$componentObject,
			"",
			"arrows",
			false,
			null,
			$this->grid->getOptions()->GetNavParams()
		);
		//endregion
	}

	protected function getSelect()
	{
		if($this->exportAs != null)
		{
			$columns = array(
				"ID",
				"TITLE",
				"RESPONSIBLE_ID",
				"CREATED_BY",
				"CREATED_DATE",
				"REAL_STATUS",
				"PRIORITY",
				"START_DATE_PLAN",
				"END_DATE_PLAN",
				"DEADLINE",
				"TIME_ESTIMATE",
				"TIME_SPENT_IN_LOGS",
				"CLOSED_DATE",
				"MARK",
				"ADD_IN_REPORT",
				"GROUP_ID"
			);
			return $columns;
		}
		else
		{
			return array('*');
		}
	}
}