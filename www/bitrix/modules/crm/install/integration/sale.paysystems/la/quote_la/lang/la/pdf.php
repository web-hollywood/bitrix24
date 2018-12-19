<?
use Bitrix\Main\IO\Path;
use Bitrix\Main\IO\File;

$filePath = Path::getDirectory(Path::normalize(__FILE__)).Path::DIRECTORY_SEPARATOR.'html.php';
if (File::isFileExists($filePath))
	include($filePath);
