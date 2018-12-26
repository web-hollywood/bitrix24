<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetTitle("Candidates");

$arResult['BUTTONS'] = array();

$arResult['BUTTONS'][] = array(
    'TEXT' => 'ADD',
    'TITLE' => 'ADD',
    'LINK' => $link,
    'HIGHLIGHT' => true
);
$template = 'title';
$APPLICATION->IncludeComponent(
    'bitrix:crm.interface.toolbar',
    $template,
    array(
        'TOOLBAR_ID' => $arResult['TOOLBAR_ID'],
        'BUTTONS' => $arResult['BUTTONS']
    ),
    $component,
    array('HIDE_ICONS' => 'Y')
);

$APPLICATION->IncludeComponent(
	"bitrix:crm.recruitment",
    "",
    Array(
    ),
    false
);
?>

<link rel="stylesheet" href="./css/recruitment.css?reload=<? echo date("h:i:sa"); ?>" />

<div class="recruitment__layout">
    <div class="recruitment__header">
    </div>
    <div class="recruitment__content">
        <div class="recruitment-content__table">
            <div class="recruitment-content__table-header">
                <div class="recruitment-table-col recruitment-table-col--p-5">
                    No
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-13">
                    First Name
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-13">
                    Last Name
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-13">
                    Email
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-13">
                    Phone
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-15">
                    Notes
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-13">
                    Sent At
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-15">
                    Source
                </div>
            </div>
            <div class="recruitment-table-row">
                <div class="recruitment-table-col recruitment-table-col--p-5">
                    1
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-13">
                    James
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-13">
                    Oswaldo
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-13">
                    test@test1.com
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-13">
                    15752520571
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-15">
                    
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-13">
                    2018/12/25
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-15">
                    Facebook
                </div>
            </div>
            <div class="recruitment-table-row">
                <div class="recruitment-table-col recruitment-table-col--p-5">
                    2
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-13">
                    Jack
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-13">
                    Steven
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-13">
                    test2@test2.com
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-13">
                    18832520571
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-15">
                    
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-13">
                    2018/12/25
                </div>
                <div class="recruitment-table-col recruitment-table-col--p-15">
                    LinkedIn
                </div>
            </div>
        </div>
    </div>
</div>
<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");
?>