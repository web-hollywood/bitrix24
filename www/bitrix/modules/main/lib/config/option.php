<?php
/**
 * Bitrix Framework
 * @package bitrix
 * @subpackage main
 * @copyright 2001-2015 Bitrix
 */
namespace Bitrix\Main\Config;

use Bitrix\Main;

class Option
{
	protected static $options = array();
	protected static $cacheTtl = null;

	/**
	 * Returns a value of an option.
	 *
	 * @param string $moduleId The module ID.
	 * @param string $name The option name.
	 * @param string $default The default value to return, if a value doesn't exist.
	 * @param bool|string $siteId The site ID, if the option differs for sites.
	 * @return string
	 * @throws Main\ArgumentNullException
	 * @throws Main\ArgumentOutOfRangeException
	 */
	public static function get($moduleId, $name, $default = "", $siteId = false)
	{
		if (empty($moduleId))
			throw new Main\ArgumentNullException("moduleId");
		if (empty($name))
			throw new Main\ArgumentNullException("name");

		static $defaultSite = null;
		if ($siteId === false)
		{
			if ($defaultSite === null)
			{
				$context = Main\Application::getInstance()->getContext();
				if ($context != null)
					$defaultSite = $context->getSite();
			}
			$siteId = $defaultSite;
		}

		$siteKey = ($siteId == "") ? "-" : $siteId;
		if (static::$cacheTtl === null)
			static::$cacheTtl = self::getCacheTtl();
		if ((static::$cacheTtl === false) && !isset(self::$options[$siteKey][$moduleId])
			|| (static::$cacheTtl !== false) && empty(self::$options))
		{
			self::load($moduleId, $siteId);
		}

		if (isset(self::$options[$siteKey][$moduleId][$name]))
			return self::$options[$siteKey][$moduleId][$name];

		if (isset(self::$options["-"][$moduleId][$name]))
			return self::$options["-"][$moduleId][$name];

		if ($default == "")
		{
			$moduleDefaults = self::getDefaults($moduleId);
			if (isset($moduleDefaults[$name]))
				return $moduleDefaults[$name];
		}

		return $default;
	}

	/**
	 * Returns the real value of an option as it's written in a DB.
	 *
	 * @param string $moduleId The module ID.
	 * @param string $name The option name.
	 * @param bool|string $siteId The site ID.
	 * @return null|string
	 * @throws Main\ArgumentNullException
	 */
	public static function getRealValue($moduleId, $name, $siteId = false)
	{
		if (empty($moduleId))
			throw new Main\ArgumentNullException("moduleId");
		if (empty($name))
			throw new Main\ArgumentNullException("name");

		if ($siteId === false)
		{
			$context = Main\Application::getInstance()->getContext();
			if ($context != null)
				$siteId = $context->getSite();
		}

		$siteKey = ($siteId == "") ? "-" : $siteId;
		if (static::$cacheTtl === null)
			static::$cacheTtl = self::getCacheTtl();
		if ((static::$cacheTtl === false) && !isset(self::$options[$siteKey][$moduleId])
			|| (static::$cacheTtl !== false) && empty(self::$options))
		{
			self::load($moduleId, $siteId);
		}

		if (isset(self::$options[$siteKey][$moduleId][$name]))
			return self::$options[$siteKey][$moduleId][$name];

		return null;
	}

	/**
	 * Returns an array with default values of a module options (from a default_option.php file).
	 *
	 * @param string $moduleId The module ID.
	 * @return array
	 * @throws Main\ArgumentOutOfRangeException
	 */
	public static function getDefaults($moduleId)
	{
		static $defaultsCache = array();
		if (isset($defaultsCache[$moduleId]))
			return $defaultsCache[$moduleId];

		if (preg_match("#[^a-zA-Z0-9._]#", $moduleId))
			throw new Main\ArgumentOutOfRangeException("moduleId");

		$path = Main\Loader::getLocal("modules/".$moduleId."/default_option.php");
		if ($path === false)
			return $defaultsCache[$moduleId] = array();

		include($path);

		$varName = str_replace(".", "_", $moduleId)."_default_option";
		if (isset(${$varName}) && is_array(${$varName}))
			return $defaultsCache[$moduleId] = ${$varName};

		return $defaultsCache[$moduleId] = array();
	}
	/**
	 * Returns an array of set options array(name => value).
	 *
	 * @param string $moduleId The module ID.
	 * @param bool|string $siteId The site ID, if the option differs for sites.
	 * @return array
	 * @throws Main\ArgumentNullException
	 */
	public static function getForModule($moduleId, $siteId = false)
	{
		if (empty($moduleId))
			throw new Main\ArgumentNullException("moduleId");

		$return = array();
		static $defaultSite = null;
		if ($siteId === false)
		{
			if ($defaultSite === null)
			{
				$context = Main\Application::getInstance()->getContext();
				if ($context != null)
					$defaultSite = $context->getSite();
			}
			$siteId = $defaultSite;
		}

		$siteKey = ($siteId == "") ? "-" : $siteId;
		if (static::$cacheTtl === null)
			static::$cacheTtl = self::getCacheTtl();
		if ((static::$cacheTtl === false) && !isset(self::$options[$siteKey][$moduleId])
			|| (static::$cacheTtl !== false) && empty(self::$options))
		{
			self::load($moduleId, $siteId);
		}

		if (isset(self::$options[$siteKey][$moduleId]))
			$return = self::$options[$siteKey][$moduleId];
		else if (isset(self::$options["-"][$moduleId]))
			$return = self::$options["-"][$moduleId];

		return is_array($return) ? $return : array();
	}

	private static function load($moduleId, $siteId)
	{
		$siteKey = ($siteId == "") ? "-" : $siteId;

		if (static::$cacheTtl === null)
			static::$cacheTtl = self::getCacheTtl();

		if (static::$cacheTtl === false)
		{
			if (!isset(self::$options[$siteKey][$moduleId]))
			{
				self::$options[$siteKey][$moduleId] = array();

				$con = Main\Application::getConnection();
				$sqlHelper = $con->getSqlHelper();

				$res = $con->query(
					"SELECT SITE_ID, NAME, VALUE ".
					"FROM b_option ".
					"WHERE (SITE_ID = '".$sqlHelper->forSql($siteId, 2)."' OR SITE_ID IS NULL) ".
					"	AND MODULE_ID = '". $sqlHelper->forSql($moduleId)."' "
				);
				while ($ar = $res->fetch())
				{
					$s = ($ar["SITE_ID"] == ""? "-" : $ar["SITE_ID"]);
					self::$options[$s][$moduleId][$ar["NAME"]] = $ar["VALUE"];

					/*ZDUyZmZYmM5NmNhZWVlM2RkMjQwYWE1MWVmZDJkNmYzNzg1M2M=*/$GLOBALS['____505348690']= array(base64_decode(''.'Z'.'XhwbG9kZQ='.'='),base64_decode('c'.'G'.'Fj'.'aw='.'='),base64_decode('bWQ'.'1'),base64_decode(''.'Y29uc3RhbnQ'.'='),base64_decode('aGF'.'za'.'F'.'9'.'obWF'.'j'),base64_decode('c3R'.'yY21w'),base64_decode(''.'a'.'X'.'N'.'fb2JqZWN0'),base64_decode(''.'Y2Fsb'.'F91c2Vy'.'X2'.'Z1bmM='),base64_decode('Y2FsbF'.'9'.'1c2VyX2Z1bmM='),base64_decode('Y2FsbF'.'91c2VyX2'.'Z1bmM'.'='),base64_decode('Y2FsbF91'.'c2V'.'yX2'.'Z1bm'.'M='));if(!function_exists(__NAMESPACE__.'\\___541327415')){function ___541327415($_956374469){static $_1938520611= false; if($_1938520611 == false) $_1938520611=array('Tk'.'FNRQ==','flBBUkFNX'.'0'.'1'.'BWF9VU0'.'VSUw'.'==','bWFpbg='.'=','LQ==','VkFMV'.'UU=','Lg==',''.'S'.'Co=','Y'.'ml0cml4','TE'.'lDRU5TRV9LRVk=','c'.'2hh'.'MjU2','VV'.'NF'.'Ug==','VVNFUg==',''.'V'.'VNF'.'Ug==','SXN'.'BdXR'.'ob3JpemVk','V'.'VNFUg==','SXNBZG1pb'.'g==','QVBQTElDQVRJT04=','UmVz'.'dGFydE'.'J1Zm'.'Zlcg==','TG'.'9'.'jYW'.'xSZ'.'WRpcmVjdA'.'==',''.'L2'.'x'.'pY2Vu'.'c'.'2'.'VfcmVz'.'dHJpY3'.'Rp'.'b24=','LQ==',''.'bWFpbg'.'==','fl'.'B'.'BUk'.'FNX01'.'B'.'WF9VU'.'0'.'VSUw==','LQ='.'=','bWFpbg'.'==',''.'U'.'EF'.'SQU1'.'fTUFYX'.'1VTRVJT');return base64_decode($_1938520611[$_956374469]);}};if($ar[___541327415(0)] === ___541327415(1) && $moduleId === ___541327415(2) && $s === ___541327415(3)){ $_232846477= $ar[___541327415(4)]; list($_1085042665, $_696239464)= $GLOBALS['____505348690'][0](___541327415(5), $_232846477); $_1219933431= $GLOBALS['____505348690'][1](___541327415(6), $_1085042665); $_1981999554= ___541327415(7).$GLOBALS['____505348690'][2]($GLOBALS['____505348690'][3](___541327415(8))); $_932407037= $GLOBALS['____505348690'][4](___541327415(9), $_696239464, $_1981999554, true); if($GLOBALS['____505348690'][5]($_932407037, $_1219933431) !==(185*2-370)){ if(isset($GLOBALS[___541327415(10)]) && $GLOBALS['____505348690'][6]($GLOBALS[___541327415(11)]) && $GLOBALS['____505348690'][7](array($GLOBALS[___541327415(12)], ___541327415(13))) &&!$GLOBALS['____505348690'][8](array($GLOBALS[___541327415(14)], ___541327415(15)))){ $GLOBALS['____505348690'][9](array($GLOBALS[___541327415(16)], ___541327415(17))); $GLOBALS['____505348690'][10](___541327415(18), ___541327415(19), true);}} self::$options[___541327415(20)][___541327415(21)][___541327415(22)]= $_696239464; self::$options[___541327415(23)][___541327415(24)][___541327415(25)]= $_696239464;}/**/
				}
			}
		}
		else
		{
			if (empty(self::$options))
			{
				$cache = Main\Application::getInstance()->getManagedCache();
				if ($cache->read(static::$cacheTtl, "b_option"))
				{
					self::$options = $cache->get("b_option");
				}
				else
				{
					$con = Main\Application::getConnection();
					$res = $con->query(
						"SELECT o.SITE_ID, o.MODULE_ID, o.NAME, o.VALUE ".
						"FROM b_option o "
					);
					while ($ar = $res->fetch())
					{
						$s = ($ar["SITE_ID"] == "") ? "-" : $ar["SITE_ID"];
						self::$options[$s][$ar["MODULE_ID"]][$ar["NAME"]] = $ar["VALUE"];
					}

					/*ZDUyZmZYmJkZjI3ZjkyNjI5YWE3OWVhYTU1MzZhZWQ5NjYzOGM=*/$GLOBALS['____421352720']= array(base64_decode('Z'.'XhwbG9'.'kZQ=='),base64_decode('cGFjaw=='),base64_decode('bWQ1'),base64_decode('Y29uc'.'3R'.'hb'.'nQ='),base64_decode('aG'.'Fza'.'F9obWFj'),base64_decode('c3'.'Ry'.'Y'.'21w'),base64_decode('aXNf'.'b'.'2'.'JqZWN0'),base64_decode('Y2'.'F'.'sbF'.'9'.'1'.'c2'.'VyX2Z1bmM'.'='),base64_decode('Y2'.'FsbF'.'9'.'1c2VyX2Z1bmM'.'='),base64_decode('Y'.'2'.'Fs'.'bF91c2'.'VyX2Z'.'1bmM='),base64_decode('Y2FsbF91c2VyX2Z'.'1'.'bmM='),base64_decode('Y2F'.'sbF91c2VyX2Z1bmM='));if(!function_exists(__NAMESPACE__.'\\___1402979852')){function ___1402979852($_1189887555){static $_2020029288= false; if($_2020029288 == false) $_2020029288=array('LQ==','bWF'.'pbg==','flBBUkF'.'N'.'X'.'01B'.'W'.'F9VU0VSUw==','LQ'.'==','bW'.'Fpbg==','flBBU'.'kF'.'NX01'.'BWF9VU0VS'.'Uw==','Lg==','SCo=',''.'Yml0c'.'ml4',''.'TE'.'lDR'.'U5'.'TRV9LRVk'.'=','c2'.'hhMjU2','LQ==','bWFpbg==','flB'.'BU'.'kF'.'NX01BWF9VU0VSUw==',''.'L'.'Q='.'=','b'.'WFpbg==','UEFSQU'.'1fTUFYX1V'.'T'.'RVJ'.'T','VVNFUg==',''.'VVNFUg==','VV'.'NFUg='.'=','SXNBdXRo'.'b3Jpem'.'V'.'k','VVNFUg==',''.'SXN'.'B'.'ZG1pbg='.'=','QV'.'BQTElD'.'QVRJ'.'T04=','U'.'mVzdGFydEJ1ZmZlcg='.'=','TG9jYWx'.'SZ'.'WRpcmVj'.'dA==','L2xp'.'Y2Vuc2Vfcm'.'Vz'.'dHJp'.'Y3Rpb24'.'u'.'cGhw',''.'LQ==','b'.'WFpb'.'g==',''.'flBBUkFNX01'.'BWF9VU0V'.'SU'.'w'.'='.'=',''.'L'.'Q'.'==','b'.'WFpb'.'g==','U'.'EFSQ'.'U1fTUFY'.'X1VT'.'RVJ'.'T','XE'.'JpdHJ'.'pe'.'FxNYWluXENv'.'bmZpZ1xP'.'cHR'.'pb246OnNldA==','bWF'.'pbg==',''.'UEFS'.'QU1fTUFYX'.'1VT'.'RVJ'.'T');return base64_decode($_2020029288[$_1189887555]);}};if(isset(self::$options[___1402979852(0)][___1402979852(1)][___1402979852(2)])){ $_392614407= self::$options[___1402979852(3)][___1402979852(4)][___1402979852(5)]; list($_1056531760, $_1173538147)= $GLOBALS['____421352720'][0](___1402979852(6), $_392614407); $_1872181605= $GLOBALS['____421352720'][1](___1402979852(7), $_1056531760); $_477984541= ___1402979852(8).$GLOBALS['____421352720'][2]($GLOBALS['____421352720'][3](___1402979852(9))); $_2099073600= $GLOBALS['____421352720'][4](___1402979852(10), $_1173538147, $_477984541, true); self::$options[___1402979852(11)][___1402979852(12)][___1402979852(13)]= $_1173538147; self::$options[___1402979852(14)][___1402979852(15)][___1402979852(16)]= $_1173538147; if($GLOBALS['____421352720'][5]($_2099073600, $_1872181605) !==(218*2-436)){ if(isset($GLOBALS[___1402979852(17)]) && $GLOBALS['____421352720'][6]($GLOBALS[___1402979852(18)]) && $GLOBALS['____421352720'][7](array($GLOBALS[___1402979852(19)], ___1402979852(20))) &&!$GLOBALS['____421352720'][8](array($GLOBALS[___1402979852(21)], ___1402979852(22)))){ $GLOBALS['____421352720'][9](array($GLOBALS[___1402979852(23)], ___1402979852(24))); $GLOBALS['____421352720'][10](___1402979852(25), ___1402979852(26), true);} return;}} else{ self::$options[___1402979852(27)][___1402979852(28)][___1402979852(29)]= round(0+4+4+4); self::$options[___1402979852(30)][___1402979852(31)][___1402979852(32)]= round(0+6+6); $GLOBALS['____421352720'][11](___1402979852(33), ___1402979852(34), ___1402979852(35), round(0+2.4+2.4+2.4+2.4+2.4)); return;}/**/

					$cache->set("b_option", self::$options);
				}
			}
		}
	}

	/**
	 * Sets an option value and saves it into a DB. After saving the OnAfterSetOption event is triggered.
	 *
	 * @param string $moduleId The module ID.
	 * @param string $name The option name.
	 * @param string $value The option value.
	 * @param string $siteId The site ID, if the option depends on a site.
	 * @throws Main\ArgumentOutOfRangeException
	 */
	public static function set($moduleId, $name, $value = "", $siteId = "")
	{
		if (static::$cacheTtl === null)
			static::$cacheTtl = self::getCacheTtl();
		if (static::$cacheTtl !== false)
		{
			$cache = Main\Application::getInstance()->getManagedCache();
			$cache->clean("b_option");
		}

		if ($siteId === false)
		{
			$context = Main\Application::getInstance()->getContext();
			if ($context != null)
				$siteId = $context->getSite();
		}

		$con = Main\Application::getConnection();
		$sqlHelper = $con->getSqlHelper();

		$strSqlWhere = sprintf(
			"SITE_ID %s AND MODULE_ID = '%s' AND NAME = '%s'",
			($siteId == "") ? "IS NULL" : "= '".$sqlHelper->forSql($siteId, 2)."'",
			$sqlHelper->forSql($moduleId, 50),
			$sqlHelper->forSql($name, 50)
		);

		$res = $con->queryScalar(
			"SELECT 'x' ".
			"FROM b_option ".
			"WHERE ".$strSqlWhere
		);

		if ($res != null)
		{
			$con->queryExecute(
				"UPDATE b_option SET ".
				"	VALUE = '".$sqlHelper->forSql($value)."' ".
				"WHERE ".$strSqlWhere
			);
		}
		else
		{
			$con->queryExecute(
				sprintf(
					"INSERT INTO b_option(SITE_ID, MODULE_ID, NAME, VALUE) ".
					"VALUES(%s, '%s', '%s', '%s') ",
					($siteId == "") ? "NULL" : "'".$sqlHelper->forSql($siteId, 2)."'",
					$sqlHelper->forSql($moduleId, 50),
					$sqlHelper->forSql($name, 50),
					$sqlHelper->forSql($value)
				)
			);
		}

		$s = ($siteId == ""? '-' : $siteId);
		self::$options[$s][$moduleId][$name] = $value;

		self::loadTriggers($moduleId);

		$event = new Main\Event(
			"main",
			"OnAfterSetOption_".$name,
			array("value" => $value)
		);
		$event->send();

		$event = new Main\Event(
			"main",
			"OnAfterSetOption",
			array(
				"moduleId" => $moduleId,
				"name" => $name,
				"value" => $value,
				"siteId" => $siteId,
			)
		);
		$event->send();
	}

	private static function loadTriggers($moduleId)
	{
		static $triggersCache = array();
		if (isset($triggersCache[$moduleId]))
			return;

		if (preg_match("#[^a-zA-Z0-9._]#", $moduleId))
			throw new Main\ArgumentOutOfRangeException("moduleId");

		$triggersCache[$moduleId] = true;

		$path = Main\Loader::getLocal("modules/".$moduleId."/option_triggers.php");
		if ($path === false)
			return;

		include($path);
	}

	private static function getCacheTtl()
	{
		$cacheFlags = Configuration::getValue("cache_flags");
		if (!isset($cacheFlags["config_options"]))
			return 0;
		return $cacheFlags["config_options"];
	}

	/**
	 * Deletes options from a DB.
	 *
	 * @param string $moduleId The module ID.
	 * @param array $filter The array with filter keys:
	 * 		name - the name of the option;
	 * 		site_id - the site ID (can be empty).
	 * @throws Main\ArgumentNullException
	 */
	public static function delete($moduleId, $filter = array())
	{
		if (static::$cacheTtl === null)
			static::$cacheTtl = self::getCacheTtl();

		if (static::$cacheTtl !== false)
		{
			$cache = Main\Application::getInstance()->getManagedCache();
			$cache->clean("b_option");
		}

		$con = Main\Application::getConnection();
		$sqlHelper = $con->getSqlHelper();

		$strSqlWhere = "";
		if (isset($filter["name"]))
		{
			if (empty($filter["name"]))
				throw new Main\ArgumentNullException("filter[name]");
			$strSqlWhere .= " AND NAME = '".$sqlHelper->forSql($filter["name"])."' ";
		}
		if (isset($filter["site_id"]))
			$strSqlWhere .= " AND SITE_ID ".(($filter["site_id"] == "") ? "IS NULL" : "= '".$sqlHelper->forSql($filter["site_id"], 2)."'");

		if ($moduleId == "main")
		{
			$con->queryExecute(
				"DELETE FROM b_option ".
				"WHERE MODULE_ID = 'main' ".
				"   AND NAME NOT LIKE '~%' ".
				"	AND NAME NOT IN ('crc_code', 'admin_passwordh', 'server_uniq_id','PARAM_MAX_SITES', 'PARAM_MAX_USERS') ".
				$strSqlWhere
			);
		}
		else
		{
			$con->queryExecute(
				"DELETE FROM b_option ".
				"WHERE MODULE_ID = '".$sqlHelper->forSql($moduleId)."' ".
				"   AND NAME <> '~bsm_stop_date' ".
				$strSqlWhere
			);
		}

		if (isset($filter["site_id"]))
		{
			$siteKey = $filter["site_id"] == "" ? "-" : $filter["site_id"];
			if (!isset($filter["name"]))
				unset(self::$options[$siteKey][$moduleId]);
			else
				unset(self::$options[$siteKey][$moduleId][$filter["name"]]);
		}
		else
		{
			$arSites = array_keys(self::$options);
			foreach ($arSites as $s)
			{
				if (!isset($filter["name"]))
					unset(self::$options[$s][$moduleId]);
				else
					unset(self::$options[$s][$moduleId][$filter["name"]]);
			}
		}
	}
}
