<?if(!defined("B_PROLOG_INCLUDED")||B_PROLOG_INCLUDED!==true)die();


if(!CModule::IncludeModule('calendar') || (!(isset($GLOBALS['USER']) && is_object($GLOBALS['USER']) && $GLOBALS['USER']->IsAuthorized())))
	return;

$event = false;
$userId = $GLOBALS['USER']->GetID();
if (isset($_REQUEST['app_calendar_action']) && check_bitrix_sessid())
{
	$APPLICATION->RestartBuffer();
	if ($_REQUEST['app_calendar_action'] == 'change_meeting_status' && $userId == $_REQUEST['user_id'])
	{
		CCalendarEvent::SetMeetingStatus(array(
			'userId' => $userId,
			'eventId' => intVal($_REQUEST['event_id']),
			'status' => $_REQUEST['status'] == 'Y' ? 'Y' : 'N'
		));
	}
	die();
}

$eventId = intVal($arParams['EVENT_ID']);
if (isset($_REQUEST['date_from']))
{
	$fromTs = CCalendar::Timestamp($_REQUEST['date_from']);
	$event = CCalendarEvent::GetList(
		array(
			'arFilter' => array(
				"PARENT_ID" => $eventId,
				"OWNER_ID" => $userId,
				"IS_MEETING" => 1,
				"DELETED" => "N",
				"FROM_LIMIT" => CCalendar::Date($fromTs - 3600),
				"TO_LIMIT" => CCalendar::Date($fromTs + CCalendar::GetDayLen(), false, false)
			),
			'parseRecursion' => true,
			'maxInstanceCount' => 1,
			'checkPermissions' => true,
			'setDefaultLimit' => false
		)
	);

	if (!$event || !is_array($event[0]))
	{
		$event = CCalendarEvent::GetList(
			array(
				'arFilter' => array(
					"ID" => $eventId,
					"DELETED" => "N",
					"FROM_LIMIT" => CCalendar::Date($fromTs - 3600),
					"TO_LIMIT" => CCalendar::Date($fromTs + CCalendar::GetDayLen(), false, false)
				),
				'parseRecursion' => true,
				'maxInstanceCount' => 1,
				'checkPermissions' => true,
				'setDefaultLimit' => false
			)
		);
	}
}

if (!$event || !is_array($event[0]))
{
	$event = CCalendarEvent::GetList(
		array(
			'arFilter' => array(
				"PARENT_ID" => $eventId,
				"OWNER_ID" => $userId,
				"IS_MEETING" => 1,
				"DELETED" => "N"
			),
			'parseRecursion' => false,
			'checkPermissions' => true,
			'setDefaultLimit' => false
		)
	);
}

if (!$event || !is_array($event[0]))
{
	$event = CCalendarEvent::GetList(
		array(
			'arFilter' => array(
				"ID" => $eventId,
				"OWNER_ID" => $userId,
				"DELETED" => "N"
			),
			'parseRecursion' => false,
			'checkPermissions' => true,
			'setDefaultLimit' => false
		)
	);
}

if ($event && is_array($event[0]))
{
	$event = $event[0];
	$event['DT_FROM_TS'] = CCalendar::Timestamp($event['DATE_FROM']);
	$event['DT_TO_TS'] = CCalendar::Timestamp($event['DATE_TO']);
	if ($event['DT_SKIP_TIME'] !== "Y")
	{
		$event['DT_FROM_TS'] -= $event['~USER_OFFSET_FROM'];
		$event['DT_TO_TS'] -= $event['~USER_OFFSET_TO'];

		$event['DATE_FROM'] = CCalendar::Date($event['DT_FROM_TS']);
		$event['DATE_TO'] = CCalendar::Date($event['DT_TO_TS']);
	}

	if ($event['IS_MEETING'])
	{
		$arAttendees = array(
			'count' => 0,
			'Y' => array(), // Accepted
			'N' => array(), // Declined
			'Q' => array() // ?
		);

		if ((!is_array($event['~ATTENDEES']) || empty($event['~ATTENDEES'])) && $event['PARENT_ID'])
		{
			$attRes = CCalendarEvent::GetAttendees(array($event['PARENT_ID']));
			if ($attRes && isset($attRes[$event['PARENT_ID']]))
				$event['~ATTENDEES'] = $attRes[$event['PARENT_ID']];
		}

		if (!is_array($event['~ATTENDEES']) || empty($event['~ATTENDEES']))
			$event['IS_MEETING'] = false;

		if ($event['IS_MEETING'])
		{
			foreach($event['~ATTENDEES'] as $attendee)
			{
				$arAttendees[$attendee['STATUS']][] = $attendee;
			}
			$arAttendees['count'] = count($event['~ATTENDEES']);
			unset($event['~ATTENDEES']);
			$arResult['ATTENDEES'] = $arAttendees;
		}
	}

	if ($event['LOCATION'] !== '')
		$event['LOCATION'] = CCalendar::GetTextLocation($event["LOCATION"]);

	if ($event['RRULE'] !== '')
	{
		$event['RRULE'] = CCalendarEvent::ParseRRULE($event['RRULE']);
	}
}
else
{
	$event = array(); // Event is not found
	$arResult['DELETED'] = "Y";
}

$arResult['EVENT'] = $event;
$arResult['USER_ID'] = $userId;

$event = new \Bitrix\Main\Event(
	'calendar',
	'onViewEvent',
	array(
		'eventId' => $arResult['EVENT']['ID'],
	)
);
$event->send();

$this->IncludeComponentTemplate();
?>