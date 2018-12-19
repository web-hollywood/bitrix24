BX.namespace("BX.Voximplant.Numbers");

BX.Voximplant.Autopay = {
	init: function(ajaxUrl)
	{
		var button = BX('allowAutoPayButton');
		BX.ready(function(){
			BX.bind(button, 'click', function() {
				var node = BX.create('SPAN', {props : {className : "wait"}});
				var allowAutoPayCheckbox = BX('allowAutoPay');

				if(!allowAutoPayCheckbox)
					return;

				var allowAutoPay = allowAutoPayCheckbox.checked;

				BX.addClass(button, "webform-small-button-wait webform-small-button-active");
				this.appendChild(node);
				BX.ajax({
					method: 'POST',
					url: ajaxUrl,
					data: {'VI_SET_AUTOPAY': 'Y', 'ALLOW_AUTOPAY': (allowAutoPay ? 'Y' : 'N'), sessid : BX.bitrix_sessid()},
					dataType: 'json',
					onsuccess: function()
					{
						BX.removeClass(button, "webform-small-button-wait webform-small-button-active");
						BX.remove(node);
					},
					onfailure: function()
					{
						BX.removeClass(button, "webform-small-button-wait webform-small-button-active");
						BX.remove(node);
					}
				});
				return false;
			});
		});
	}
};