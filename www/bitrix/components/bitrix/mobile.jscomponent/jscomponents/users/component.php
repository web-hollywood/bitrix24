<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
{
	die();
}

$result = array(
	"settings"=> array(
		"nameFormat"=>CSite::GetNameFormat(),
		"profilePath"=>\Bitrix\Mobile\ComponentManager::getComponentPath("user.profile")
	)
);

return $result;
