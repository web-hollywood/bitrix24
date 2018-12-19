function BXOneCStart()
{
    var app_url = '/marketplace/detail/bitrix.1c/';

    BX.ready(function () {
        BX.bind(BX('b24-integration-active-button'), 'click', function () {
            _BXOneCStart();
        });
    });

    function _BXOneCStart()
    {
        if(window.ONEC_APP_INACTIVE)
        {
            document.location.href = app_url;
        }
        else if(typeof window.LICENCE_RESTRICTED !== 'undefined' && window.LICENCE_RESTRICTED)
        {
            B24.licenseInfoPopup.show('onec-face-card-block', BX.message('CRM_1C_START_FACE_CARD_B24_BLOCK_TITLE'), BX.message('CRM_1C_START_FACE_CARD_B24_BLOCK_TEXT'));
        }
        else if(typeof window.LICENCE_ACCEPTED !== 'undefined' && window.LICENCE_ACCEPTED === false)
        {
            var licensePopup = new BX.PopupWindow('1c_license_popup' + (new Date()).getTime(), null, {
                autoHide: false,
                closeIcon: true,
                closeByEsc: true,
                titleBar: BX.message('CRM_1C_START_FACE_CARD_CONSENT_TITLE'),
                content: BX.create('div', {style: {'max-width': '595px'}, html: BX.message('CRM_1C_START_FACE_CARD_CONSENT_AGREEMENT')}),
                overlay: {
                    opacity: 50
                },
                buttons:[
                    new BX.PopupWindowButton({
                        text: BX.message('CRM_1C_START_FACE_CARD_CONSENT_AGREED'),
                        className: 'popup-window-button-accept',
                        events: {
                            click: function()
                            {
                                this.popupWindow.close();
                                BX.ajax({
                                    url: window.ONEC_AJAX_URL,
                                    method: 'POST',
                                    dataType: 'json',
                                    data: {
                                        action: 'acceptAgreement',
                                        sessid: BX.bitrix_sessid()
                                    },
                                    onsuccess: function(){
                                       appLayoutShow();
                                    }
                                });

                            }
                        }
                    })
                ]
            });

            licensePopup.show();
        }
        else
        {
            appLayoutShow();
        }
    }

    function appLayoutShow() {
        BX.toggleClass(BX('b24-integration-active'), 'b24-integration-wrap-animate');
        BX.rest.AppLayout.initialize('DEFAULT', window.ONEC_APP_SID);
    }
}