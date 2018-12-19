<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED!==true)die();

define('NO_KEEP_STATISTIC', 'Y');
define('NO_AGENT_STATISTIC','Y');
define('NO_AGENT_CHECK', true);
define('DisableEventsCheck', true);

if (!is_array($arResult['LEAD']) || !($USERS_CNT = count($arResult['LEAD']))):
	echo(GetMessage('ERROR_LEAD_IS_EMPTY'));
else:
	?><meta http-equiv="Content-type" content="text/html;charset=<?=LANG_CHARSET?>" />
	<table border="1">
	<thead>
		<tr><?
	// Build up associative array of headers
	$arHeaders = array();
	foreach ($arResult['HEADERS'] as $arHead)
		$arHeaders[$arHead['id']] = $arHead;

	$showProductRows = false;
	// Display headers
	foreach($arResult['SELECTED_HEADERS'] as $headerID):
		$arHead = isset($arHeaders[$headerID]) ? $arHeaders[$headerID] : null;
		if(!$arHead)
			continue;

		// Special logic for PRODUCT_ROWS headers: expand product in 3 columns
		if($headerID === 'PRODUCT_ID'):
			$showProductRows = true;
			?><th><?=htmlspecialcharsbx(GetMessage('CRM_COLUMN_PRODUCT_NAME'))?></th><?
			?><th><?=htmlspecialcharsbx(GetMessage('CRM_COLUMN_PRODUCT_PRICE'))?></th><?
			?><th><?=htmlspecialcharsbx(GetMessage('CRM_COLUMN_PRODUCT_QUANTITY'))?></th><?
		else:
			?><th><?=$arHead['name']?></th><?
		endif;
	endforeach;
		?></tr>
	</thead>
	<tbody><?
	foreach ($arResult['LEAD'] as $i => &$arLead):
		// Serialize each product row as deal with single product
		$productRows = $showProductRows && isset($arLead['PRODUCT_ROWS']) ? $arLead['PRODUCT_ROWS'] : array();
		$hasProducts = !empty($productRows);
		if(!$hasProducts)
		{
			// Deal has no product rows (or they are not displayed) - we have to create dummy for next loop by product rows only
			$productRows[] = array();
		}
		$leadData = array();
		foreach($productRows as $productRow):
		?><tr><?
			foreach($arResult['SELECTED_HEADERS'] as $headerID):
				$arHead = isset($arHeaders[$headerID]) ? $arHeaders[$headerID] : null;
				if(!$arHead)
					continue;

				$headerID = $arHead['id'];
				if($headerID === 'PRODUCT_ID'):
					// Special logic for PRODUCT_ROWS: expand product in 3 columns
					?><td><?=isset($productRow['PRODUCT_NAME']) ? htmlspecialcharsbx($productRow['PRODUCT_NAME']) : ''?></td><?
					?><td><?=CCrmProductRow::GetPrice($productRow, '')?></td><?
					?><td><?=CCrmProductRow::GetQuantity($productRow, '')?></td><?
					continue;
				elseif($headerID === 'OPPORTUNITY'):
					// Special logic for OPPORTUNITY: replace it by product row sum if it specified
					if($hasProducts):
						?><td><?=round(CCrmProductRow::GetPrice($productRow) * CCrmProductRow::GetQuantity($productRow), 2)?></td><?
					else:
						?><td><?=isset($arLead['OPPORTUNITY']) ? strval($arLead['OPPORTUNITY']) : ''?></td><?
					endif;
					continue;
				endif;

				if(!isset($leadData[$headerID])):
					switch($arHead['id']):
						case 'HONORIFIC':
							$honorificID = !empty($arLead['HONORIFIC']) ? $arLead['HONORIFIC'] : '';
							$leadData['HONORIFIC'] = isset($arResult['HONORIFIC'][$honorificID]) ? $arResult['HONORIFIC'][$honorificID] : '';
							break;
						case 'STATUS_ID':
							$statusID = !empty($arLead['STATUS_ID']) ? $arLead['STATUS_ID'] : '';
							$leadData['STATUS_ID'] = isset($arResult['STATUS_LIST'][$statusID]) ? $arResult['STATUS_LIST'][$statusID] : $statusID;
							break;
						case 'SOURCE_ID':
							$sourceID = !empty($arLead['SOURCE_ID']) ? $arLead['SOURCE_ID'] : '';
							$leadData['SOURCE_ID'] = isset($arResult['SOURCE_LIST'][$sourceID]) ? $arResult['SOURCE_LIST'][$sourceID] : $sourceID;
							break;
						case 'CURRENCY_ID':
							$leadData['CURRENCY_ID'] = CCrmCurrency::GetCurrencyName($arLead['CURRENCY_ID']);
							break ;
						case 'CREATED_BY':
							$leadData['CREATED_BY'] = isset($arLead['CREATED_BY_FORMATTED_NAME']) ? $arLead['CREATED_BY_FORMATTED_NAME'] : '';
							break;
						case 'MODIFY_BY':
							$leadData['MODIFY_BY'] = isset($arLead['MODIFY_BY_FORMATTED_NAME']) ? $arLead['MODIFY_BY_FORMATTED_NAME'] : '';
							break;
						case 'COMMENTS':
							$leadData['COMMENTS'] = isset($arLead['COMMENTS']) ? htmlspecialcharsback($arLead['COMMENTS']) : '';
							break;
						default:
							if(isset($arResult['LEAD_UF'][$i]) && isset($arResult['LEAD_UF'][$i][$arHead['id']]))
								$leadData[$headerID] = $arResult['LEAD_UF'][$i][$headerID];
							elseif (is_array($leadData[$headerID]))
								$leadData[$headerID] = implode(', ', $arLead[$headerID]);
							else
								$leadData[$headerID] = strval($arLead[$headerID]);
					endswitch;
				endif;
				if(isset($leadData[$headerID])):
					?><td><?=$leadData[$headerID]?></td><?
				endif;
			endforeach;
		?></tr><?
		endforeach;
	endforeach;
	?></tbody>
</table><?
endif;