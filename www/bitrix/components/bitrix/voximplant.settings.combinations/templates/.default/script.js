BX.namespace("BX.Voximplant");

BX.Voximplant.Combinations = {
	init: function(ajaxUrl)
	{
		var button = BX('interface_combinations_btn');
		BX.bind(button, 'click', function() {
			var node = BX.create('SPAN', {props : {className : "wait"}});
			BX.addClass(button, "webform-small-button-wait webform-small-button-active");
			this.appendChild(node);
			BX.ajax({
				method: 'POST',
				url: ajaxUrl + "?action=saveCombinations",
				data: {
					'VI_SET_COMBINATIONS': 'Y',
					COMBINATION_INTERCEPT_GROUP : BX('combinationInterceptGroup').value,
					sessid : BX.bitrix_sessid()
				},
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

		BX.bind(BX('combinationInterceptGroup'), 'input', function(e)
		{
			var node = e.target;
			node.value = node.value.replace(/[^\d#*]/g,'');
			e.preventDefault();
		});
	}
};