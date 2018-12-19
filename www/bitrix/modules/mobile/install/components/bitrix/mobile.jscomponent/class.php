<?php

if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

use Bitrix\Main\Application;
use Bitrix\Main\IO\Directory;
use Bitrix\Main\IO\File;
use Bitrix\Main\Localization;
use Bitrix\Main\Web\Json;

/**
 * Class MobileJSComponent
 */
class MobileJSComponent extends \CBitrixComponent
{
	private static $jsComponentsFolder = "/jscomponents/";
	public $jsComponentPath;
	public $jsComponentName;
	protected $availableComponents;
	protected $jsComponentsPath;
	protected $extensionFolderPath;

	public function __construct($component = null)
	{
		parent::__construct($component);
		$componentsPath = Application::getDocumentRoot() . $this->getPath() . self::$jsComponentsFolder;
		$this->extensionFolderPath = Application::getDocumentRoot() . $this->getPath() . "/jsextensions/";
		$this->availableComponents = [];
		$componentDir = new Directory($componentsPath);
		$jsComponentsDirs = $componentDir->getChildren();

		foreach ($jsComponentsDirs as $jsComponentDir)
		{
			if ($jsComponentDir->isDirectory())
			{
				$this->availableComponents[] = $jsComponentDir->getName();
			}
		}
	}

	public function onPrepareComponentParams($arParams)
	{
		if ($arParams["componentName"])
		{
			$this->jsComponentPath =  $this->getPath() . self::$jsComponentsFolder .$arParams["componentName"];
			$this->jsComponentName = $arParams["componentName"];
		}

		return $arParams;
	}


	public function executeComponent()
	{
		if(\Bitrix\Main\Loader::includeModule("mobileapp"))
		{
			\Bitrix\MobileApp\Mobile::Init();
		}

		if (!in_array($this->jsComponentName, $this->availableComponents))
		{
			header('Content-Type: text/javascript');
			header("BX-Component-Not-Found: true");
			echo <<<JS
console.warn("Component not found");
JS;
		}
		else
		{
			$componentPath = Application::getDocumentRoot().$this->jsComponentPath;
			$componentFolder = new Directory($componentPath);
			$jsResult = "{}";

			if ($componentFolder->isExists())
			{
				$jsComponentFile = new File($componentFolder->getPath() . "/component.js");
				$componentFile = new File($componentFolder->getPath() . "/component.php");
				if($jsComponentFile->isExists())
				{
					if ($componentFile->isExists())
					{
						$componentResult = include($componentFile->getPath());
						$jsResult = $this->jsonEncode($componentResult);
					}

					if(array_key_exists("get_result", $_REQUEST))
					{
						$content = $jsResult;
					}
					else
					{

						$extensionContent = $this->getExtensionsContent();
						$langPhrases = Localization\Loc::loadLanguageFile($componentPath . "/component.php");//component.php is not exists, but we use it to get php-langfile
						$jsonLangMessages = $this->jsonEncode($langPhrases);
						$jsComponentObject = $this->jsonEncode([
							'path' => $this->jsComponentPath.'/',
							'folder'=> $this->getPath().'/',
							'version'=>$this->getComponentVersion($this->jsComponentName),
							'publicUrl'=> \Bitrix\Mobile\ComponentManager::getComponentPath($this->jsComponentName),
							'resultUrl'=> \Bitrix\Mobile\ComponentManager::getComponentPath($this->jsComponentName)."&get_result=Y"
						]);

						$inlineContent = <<<JS
								/**
								* ------------------------------------------------  
								* -------- component '$this->jsComponentName' ---------- 
								* ------------------------------------------------ 
								*/
								
								
								BX.message($jsonLangMessages);
								
								var result = $jsResult;
								var component = $jsComponentObject;

JS;
						$content = $extensionContent. $inlineContent . $jsComponentFile->getContents();

					}

					header('Content-Type: text/javascript;charset=UTF-8');
					header("BX-Component-Version: " . self::getComponentVersion($this->jsComponentName));
					header("BX-Component: true");
					echo $content;
				}
				else
				{
					echo "File 'component.js' is not found";
				}
			}
		}
	}

	public function getComponentVersion($componentName)
	{
		$componentFolder = new Directory($this->getPath() . self::$jsComponentsFolder . $componentName);
		$versionFile = new File($componentFolder->getPath() . "/version.php");
		if ($versionFile->isExists())
		{
			$versionDesc = include($versionFile->getPath());
			return $versionDesc["version"];
		}

		return 1;
	}

	public function jsonEncode($string)
	{
		$options = JSON_HEX_TAG | JSON_HEX_AMP | JSON_PRETTY_PRINT | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE;
		return Json::encode($string, $options);
	}

	private function getExtensionsContent()
	{
		$componentPath = Application::getDocumentRoot().$this->jsComponentPath;
		$componentFolder = new Directory($componentPath);
		$file = new File($componentFolder->getPath() . "/deps.php");
		$content = "";
		if($file->isExists())
		{
			$rootDeps = include($file->getPath());
			$deps = [];
			array_walk($rootDeps, function($ext) use (&$deps) {
				$list = $this->getResolvedDependencyList($ext);
				$deps = array_merge($deps, $list);
			});

			$deps = array_unique($deps);



			foreach ($deps as $ext)
			{
				$extensionFile = new File($this->extensionFolderPath.$ext."/extension.js");
				if($extensionFile->isExists() && $extensionContent = $extensionFile->getContents())
				{
					$langPhrases = Localization\Loc::loadLanguageFile($this->extensionFolderPath.$ext . "/extension.php");
					$jsonLangMessages = $this->jsonEncode($langPhrases);
					$localizationPhrases = <<<JS
	BX.message($jsonLangMessages);
	

JS;

					$content .= "/** \n* -------------------------------------- \n";
					$content .= "* -------- extension '".$ext."' ---------- \n";
					$content .= "* -------------------------------------- \n*/\n";
					$content .= count($langPhrases)>0? $localizationPhrases:"";
					$content .= $extensionContent;
					$content .= "\n\n";

				}
			}

		}

		return $content;
	}

	/**
	 * @param $name
	 * @param array $list
	 * @param array $alreadyResolved
	 * @return array
	 */
	private function getResolvedDependencyList($name, &$list = [] , &$alreadyResolved = [])
	{
		$depsList = $this->getExtensionDependencies($name);
		$alreadyResolved[] = $name;
		if(count($depsList) > 0)
		{
			foreach ($depsList as $ext)
			{
				$extDepsList = $this->getExtensionDependencies($ext);
				if(count($extDepsList) == 0)
				{
					array_unshift($list, $ext);
				}
				else if(!in_array($ext, $alreadyResolved))
				{
					$this->getResolvedDependencyList($ext, $list, $alreadyResolved);
				}
			}
		}

		$list[] = $name;

		return array_unique($list);
	}

	private function getExtensionDependencies($dep = null)
	{
		if($dep == null)
			return [];

		$file = new File($this->extensionFolderPath.$dep."/deps.php");
		if($file->isExists())
		{
			$list = include ($file->getPath());
			if(is_array($list))
				return $list;
		}

		return [];
	}


}