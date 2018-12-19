(function(window)
{
	BX.namespace('BX.VoxImplant');

	var instance = null;
	var ajaxUrl = "/bitrix/components/bitrix/voximplant.ivr.list/ajax.php";
	var gridId = "voximplant_ivr_list";

	BX.VoxImplant.IvrList = function()
	{
		this.bindEvents();
	};

	BX.VoxImplant.IvrList.getInstance = function()
	{
		return instance;
	};

	BX.VoxImplant.IvrList.prototype.bindEvents = function()
	{
		BX.addCustomEvent("SidePanel.Slider:onMessage", this._onSidePanelMessage.bind(this));
	};

	BX.VoxImplant.IvrList.prototype.edit = function(editUrl)
	{
		BX.SidePanel.Instance.open(editUrl, {cacheable: false});
	};

	BX.VoxImplant.IvrList.prototype.delete = function(ivrId)
	{
		ivrId = parseInt(ivrId);
		var postParams = {
			action: 'delete',
			sessid: BX.bitrix_sessid(),
			id: ivrId
		};
		var wait = BX.showWait();

		BX.ajax({
			url: ajaxUrl,
			method: 'POST',
			data: postParams,
			dataType: 'json',
			onsuccess: function(response)
			{
				BX.closeWait(null, wait);
				if(!response.SUCCESS)
				{
					var error = response.ERROR || 'Unknown error';
					window.alert(error);
				}
				else
				{
					var grid = BX.Main.gridManager.getInstanceById(gridId);
					if(grid)
					{
						grid.reload();
					}
				}
			},
			onfailure: function()
			{
				BX.closeWait(null, wait);
				window.alert("Network error");
			}
		})
	};

	BX.VoxImplant.IvrList.prototype._onSidePanelMessage = function(event)
	{
		if(event.getEventId() === "IvrEditor::onSave")
		{
			var grid = BX.Main.gridManager.getInstanceById(gridId);
			if(grid)
			{
				grid.reload();
			}
		}
	};

	instance = new BX.VoxImplant.IvrList();
})(window);