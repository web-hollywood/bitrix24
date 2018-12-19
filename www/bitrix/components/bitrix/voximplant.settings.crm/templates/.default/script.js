BX.namespace("BX.Voximplant");

BX.Voximplant.CRM = {
	init: function(ajaxUrl)
	{
		var button = BX('interface_crm_option_btn');
		BX.bind(button, 'click', function() {
			var node = BX.create('SPAN', {props : {className : "wait"}});
			BX.addClass(button, "webform-small-button-wait webform-small-button-active");
			this.appendChild(node);
			var workflowExecution = BX('interface_crm_option_form').elements.leadWorkflowAction.value;
			BX.ajax({
				method: 'POST',
				url: ajaxUrl + "?action=setCrmIntegrationParameters&workflowExecution=" + workflowExecution,
				data: {
					'VI_SET_WORKFLOW_EXECUTION': 'Y',
					EXECUTION_PARAMETER: workflowExecution,
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
	}
};