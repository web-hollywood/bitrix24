<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetTitle("Interview");

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
        </div>
    </div>
</div>
<?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>