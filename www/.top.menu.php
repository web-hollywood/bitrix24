<?
$aMenuLinks = Array(
	Array(
		"Leads", 
		"/crm/lead/list/", 
		Array(), 
		Array(), 
		"CBXFeatures::IsFeatureEnabled('crm') && CModule::IncludeModule('crm') && CCrmPerms::IsAccessEnabled()" 
	),
	Array(
		"Recruitment", 
		"/recruitment/", 
		Array(), 
		Array(), 
		"" 
	)
);
?>