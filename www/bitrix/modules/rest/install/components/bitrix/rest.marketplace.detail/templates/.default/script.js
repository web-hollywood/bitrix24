BX.namespace("BX.Rest.Marketplace");

BX.Rest.Marketplace.Detail = (function()
{
	var Detail = function(params)
	{
		params = typeof params === "object" ? params : {};

		this.ajaxPath = params.ajaxPath || null;
		this.siteId = params.siteId || null;
		this.appName = params.appName || "";
		this.appCode = params.appCode || "";

		if (BX.type.isDomNode(BX("detail_cont")))
		{
			var employeeInstButton = BX("detail_cont").getElementsByClassName("js-employee-install-button");

			if (BX.type.isDomNode(employeeInstButton[0]))
			{
				BX.bind(employeeInstButton[0], "click", BX.delegate(function(){
					this.confirmInstallRequest(BX.proxy_context);
				},this));
			}
		}
	};

	Detail.prototype.confirmInstallRequest = function(element)
	{
		var popup = BX.PopupWindowManager.create('mp_install_confirm_popup', null, {
			content: '<div class="mp_install_confirm"><div class="mp_install_confirm_text">' + BX.message('REST_MP_INSTALL_REQUEST_CONFIRM') + '</div></div>',
			closeByEsc: true,
			closeIcon: {top: '1px', right: '10px'},
			buttons: [
				new BX.PopupWindowButton({
					text: BX.message("REST_MP_APP_INSTALL_REQUEST"),
					className: "popup-window-button-accept",
					events: {
						click: BX.delegate(function()
						{
							popup.close();
							this.sendInstallRequest(element);
						}, this)
					}
				}),
				new BX.PopupWindowButtonLink({
					text: BX.message('JS_CORE_WINDOW_CANCEL'),
					className: "popup-window-button-link-cancel",
					events: {
						click: function()
						{
							this.popupWindow.close()
						}
					}
				})
			]
		});

		popup.show();
	};

	Detail.prototype.sendInstallRequest = function(element)
	{
		BX.PopupWindowManager.create("mp-detail-block", element, {
			content: BX.message("MARKETPLACE_APP_INSTALL_REQUEST"),
			angle: {offset : 35 },
			offsetTop:8,
			autoHide:true
		}).show();

		BX.ajax({
			method: "POST",
			dataType: "json",
			url: this.ajaxPath,
			data: {
				sessid : BX.bitrix_sessid(),
				site_id : this.siteId,
				action: "sendInstallRequest",
				appName: this.appName,
				appCode: this.appCode
			},
			onsuccess: function()
			{

			},
			onfailure: function()
			{
			}
		});
	};

	return Detail;
})();





