<?
use Bitrix\Main,
	Bitrix\Main\Localization\LanguageTable;

IncludeModuleLangFile(__FILE__);

define('TRANSLATE_DEFAULT_PATH', '/bitrix/');

$arrTransEncoding = array(
	'windows-1250' => 'windows-1250 (ISO 8859-2)',
	'windows-1251' => 'windows-1251',
	'windows-1252' => 'windows-1252 (ISO 8859-1)',
	'windows-1253' => 'windows-1253',
	'windows-1254' => 'windows-1254',
	'windows-1255' => 'windows-1255',
	'windows-1256' => 'windows-1256',
	'windows-1257' => 'windows-1257',
	'windows-1258' => 'windows-1258'
);

class CTranslateEventHandlers
{
	function TranslatOnPanelCreate()
	{
		global $APPLICATION, $USER;

		if ($APPLICATION->GetGroupRight("translate") <= "D")
			return;

		if (!$USER->IsAuthorized())
			return;

		$show_button = (string)Main\Config\Option::get('translate', 'BUTTON_LANG_FILES');

		if ($show_button == 'Y')
		{
			$cmd = 'Y';
			$checked = 'N';
			if (isset($_SESSION['SHOW_LANG_FILES']))
			{
				$cmd = $_SESSION['SHOW_LANG_FILES'] == 'Y' ? 'N' : 'Y';
				$checked = $_SESSION['SHOW_LANG_FILES'] == 'Y' ? 'Y' : 'N';
			}

			$url = $APPLICATION->GetCurPageParam("show_lang_files=".$cmd, array('show_lang_files'));
			$arMenu = array(
				array(
					"TEXT"=> GetMessage("TRANSLATE_SHOW_LANG_FILES_TEXT"),
					"TITLE"=> GetMessage("TRANSLATE_SHOW_LANG_FILES_TITLE"),
					"CHECKED"=>($checked == "Y"),
					"LINK"=>$url,
					"DEFAULT"=>false,
				));

			$APPLICATION->AddPanelButton(array(
				"HREF"=> '',
				"ID"=>"translate",
				"ICON" => "bx-panel-translate-icon",
				"ALT"=> GetMessage('TRANSLATE_ICON_ALT'),
				"TEXT"=> GetMessage('TRANSLATE_ICON_TEXT'),
				"MAIN_SORT"=>"1000",
				"SORT"=> 50,
				"MODE"=>array("configure"),
				"MENU" => $arMenu,
				"HINT" => array(
					'TITLE' => GetMessage('TRANSLATE_ICON_TEXT'),
					'TEXT' => GetMessage('TRANSLATE_ICON_HINT')
				)
			));
		}
	}
}

class CTranslateUtils
{
	const LANGUAGES_DEFAULT = 0;
	const LANGUAGES_EXIST = 1;
	const LANGUAGES_ACTIVE = 2;
	const LANGUAGES_CUSTOM = 3;

	protected static $languageList = array("ru", "en", "de", "ua");

	public static function setLanguageList($languages = self::LANGUAGES_DEFAULT, $customList = array())
	{
		if ($languages == self::LANGUAGES_ACTIVE || $languages == self::LANGUAGES_EXIST)
		{
			self::$languageList = array();
			if ($languages == self::LANGUAGES_ACTIVE)
			{
				$languageIterator = LanguageTable::getList(array(
					'select' => array('ID'),
					'filter' => array('ACTIVE' => 'Y')
				));
			}
			else
			{
				$languageIterator = LanguageTable::getList(array(
					'select' => array('ID')
				));
			}
			while ($lang = $languageIterator->fetch())
			{
				self::$languageList[] = $lang['ID'];
			}
			unset($lang, $languageIterator);
		}
		elseif ($languages == self::LANGUAGES_CUSTOM)
		{
			if (!is_array($customList))
				$customList = array($customList);
			self::$languageList = $customList;
		}
		else
		{
			self::$languageList = array("ru", "en", "de", "ua");
		}

	}

	public static function CopyMessage($code, $fileFrom, $fileTo, $newCode = '')
	{
		$newCode = (string)$newCode;
		if ($newCode === '')
			$newCode = $code;
		$langDir = $fileName = "";
		$filePath = $fileFrom;
		while(($slashPos = strrpos($filePath, "/")) !== false)
		{
			$filePath = substr($filePath, 0, $slashPos);
			if(is_dir($filePath."/lang"))
			{
				$langDir = $filePath."/lang";
				$fileName = substr($fileFrom, $slashPos);
				break;
			}
		}
		if($langDir <> '')
		{
			$langDirTo = $fileNameTo = "";
			$filePath = $fileTo;
			while(($slashPos = strrpos($filePath, "/")) !== false)
			{
				$filePath = substr($filePath, 0, $slashPos);
				if(is_dir($filePath."/lang"))
				{
					$langDirTo = $filePath."/lang";
					$fileNameTo = substr($fileTo, $slashPos);
					break;
				}
			}

			if($langDirTo <> '')
			{
				$langs = self::$languageList;
				foreach($langs as $lang)
				{
					$MESS = array();
					if (file_exists($langDir."/".$lang.$fileName))
					{
						include($langDir."/".$lang.$fileName);
						if(isset($MESS[$code]))
						{
							$message = $MESS[$code];
							$MESS = array();
							if (file_exists($langDirTo."/".$lang.$fileNameTo))
							{
								include($langDirTo."/".$lang.$fileNameTo);
							}
							else
							{
								@mkdir(dirname($langDirTo."/".$lang.$fileNameTo), 0777, true);
							}
							$MESS[$newCode] = $message;
							$s = "<?\n";
							foreach($MESS as $c => $m)
							{
								$s .= "\$MESS[\"".EscapePHPString($c)."\"] = \"".EscapePHPString($m)."\";\n";
							}
							$s .= "?>";
							file_put_contents($langDirTo."/".$lang.$fileNameTo, $s);
						}
					}
				}
			}
		}
	}

	public static function FindAndCopy($sourceDir, $lang, $pattern, $destinationFile)
	{
		$insideLangDir = (strpos($sourceDir."/", "/lang/".$lang."/") !== false);

		foreach(scandir($sourceDir) as $file)
		{
			if($file == "." || $file == "..")
			{
				continue;
			}

			if($file == ".description.php" || $file == ".parameters.php")
			{
				continue;
			}

			if($sourceDir."/".$file == $destinationFile)
			{
				continue;
			}

			if(is_dir($sourceDir."/".$file))
			{
				self::FindAndCopy($sourceDir."/".$file, $lang, $pattern, $destinationFile);
			}
			elseif($insideLangDir)
			{
				$MESS = array();
				include($sourceDir."/".$file);

				$copyMess = array();
				foreach($MESS as $code => $val)
				{
					if(preg_match($pattern, $val))
					{
						$copyMess[$code] = $val;
					}
				}

				if(!empty($copyMess))
				{
					foreach(self::$languageList as $destLang)
					{
						if($destLang <> $lang)
						{
							$MESS = array();
							$sourceFile = str_replace("/lang/".$lang."/", "/lang/".$destLang."/", $sourceDir."/".$file);
							if(file_exists($sourceFile))
							{
								include($sourceFile);
							}

							$destMess = array();
							foreach($MESS as $code => $val)
							{
								if(isset($copyMess[$code]))
								{
									$destMess[$code] = $val;
								}
							}
							$destFile = str_replace("/lang/".$lang."/", "/lang/".$destLang."/", $destinationFile);
						}
						else
						{
							$destMess = $copyMess;
							$destFile = $destinationFile;
						}

						$MESS = array();
						if(file_exists($destFile))
						{
							include($destFile);
						}
						else
						{
							@mkdir(dirname($destFile), 0777, true);
						}

						foreach($destMess as $code => $val)
						{
							if(isset($MESS[$code]) && $MESS[$code] <> $val)
							{
								echo $sourceDir."/".$file.": ".$code." already exists in the destination file.\n";
							}
							else
							{
								$MESS[$code] = $val;
							}
						}

						$s = "<?\n";
						foreach($MESS as $c => $m)
						{
							$s .= "\$MESS[\"".EscapePHPString($c)."\"] = \"".EscapePHPString($m)."\";\n";
						}
						$s .= "?>";
						file_put_contents($destFile, $s);
					}
				}
			}
		}
	}
}

function isAllowPath($path)
{
	static $initFolders = null;
	if ($initFolders === null)
	{
		$initFolders = trim((string)Main\Config\Option::get('translate', 'INIT_FOLDERS'));
		if ($initFolders == '')
			$initFolders = '/bitrix/';
		$initFolders = explode(',', $initFolders);
		foreach ($initFolders as &$oneFolder)
			$oneFolder = trim($oneFolder);
		unset($oneFolder);
	}
	$path = (string)$path;
	$allowPath = false;
	foreach ($initFolders as &$oneFolder)
	{
		if (strpos($path, $oneFolder) === 0)
		{
			$allowPath = true;
			break;
		}
	}
	unset($oneFolder);
	return $allowPath;
}