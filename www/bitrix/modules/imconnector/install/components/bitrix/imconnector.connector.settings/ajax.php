<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();

use Bitrix\Main\Loader;

class ConnectorSettingsAjaxController extends \Bitrix\Main\Engine\Controller
{
	/**
	 * Saves user list for current open line by ajax request
	 *
	 * @param int $lineId
	 * @param array $queue
	 * @return bool
	 * @throws \Bitrix\Main\LoaderException
	 */
	public function saveUsersAction($lineId, array $queue)
	{
		$this->includeModules();

		$lineId = intval($lineId);
		$config['QUEUE'] = array();
		$arAccessCodes = array();

		foreach ($queue as $userCode)
		{
			$userId = substr($userCode, 1);
			$userId = intval($userId);

			if (\Bitrix\Im\User::getInstance($userId)->isExtranet())
				continue;

			$config['QUEUE'][] = $userId;
			$arAccessCodes[] = $userCode;
		}

		\Bitrix\Main\FinderDestTable::merge(
			array(
				"CONTEXT" => "IMCONNECTOR",
				"CODE" => \Bitrix\Main\FinderDestTable::convertRights($arAccessCodes, array('U' . $GLOBALS["USER"]->GetId()))
			)
		);

		$configManager = new \Bitrix\ImOpenLines\Config();

		return $configManager->update($lineId, $config);
	}

	/**
	 * @throws \Bitrix\Main\LoaderException
	 */
	private function includeModules()
	{
		$moduleList = array('im', 'imopenlines');

		foreach ($moduleList as $module)
		{
			Loader::includeModule($module);
		}
	}
}