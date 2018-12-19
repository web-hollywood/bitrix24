<?if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();

if (!empty($arParams['TOP_RATING_DATA']))
{
	$arResult['TOP_RATING_DATA'] = $arParams['TOP_RATING_DATA'];
}
elseif (!empty($arResult["Event"]["EVENT"]["ID"]))
{
	$ratingData = \Bitrix\Socialnetwork\ComponentHelper::getLivefeedRatingData(array(
		'logId' => array($arResult["Event"]["EVENT"]["ID"]),
	));

	if (
		!empty($ratingData)
		&& !empty($ratingData[$arResult["Event"]["EVENT"]["ID"]])
	)
	{
		$arResult['TOP_RATING_DATA'] = $ratingData[$arResult["Event"]["EVENT"]["ID"]];
	}
}