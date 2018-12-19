
; /* Start:"a:4:{s:4:"full";s:94:"/bitrix/components/bitrix/voximplant.sip_payments/templates/.default/template.js?1544131466723";s:6:"source";s:80:"/bitrix/components/bitrix/voximplant.sip_payments/templates/.default/template.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
if (!BX.VoxImplant)
	BX.VoxImplant = function() {};

if (!BX.VoxImplant.sipPayments)
	BX.VoxImplant.sipPayments = function() {};

BX.VoxImplant.sipPayments.init = function()
{
	BX.VoxImplant.sipPayments.notifyButton = BX('vi_sip_notify_button');
	BX.VoxImplant.sipPayments.notifyBlock = BX('vi_sip_notify_block');

	BX.bind(BX.VoxImplant.sipPayments.notifyButton, 'click', BX.VoxImplant.sipPayments.hideNotify);
};

BX.VoxImplant.sipPayments.hideNotify = function()
{
	BX.remove(BX.VoxImplant.sipPayments.notifyBlock);

	BX.ajax({
		url: '/bitrix/components/bitrix/voximplant.sip_payments/ajax.php',
		method: 'POST',
		dataType: 'json',
		timeout: 60,
		data: {'VI_NOTICE_HIDE': 'Y', 'sessid': BX.bitrix_sessid()}
	});
};

/* End */
;; /* /bitrix/components/bitrix/voximplant.sip_payments/templates/.default/template.js?1544131466723*/
