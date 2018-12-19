(function() {

"use strict";

BX.namespace("BX.Bitrix24");

BX.Bitrix24.SonetGroupFilter = function()
{
	this.actualSearchString = '';
	this.minSearchStringLength = 2;
};

BX.Bitrix24.SonetGroupFilter.prototype.init = function (params) {

	var filterId = (
		typeof params != 'undefined'
		&& typeof params.filterId != 'undefined'
			? params.filterId
			: 'SONET_GROUP_LIST'
	);

	if (
		typeof params != 'undefined'
		&& typeof params.minSearchStringLength != 'undefined'
		&& parseInt(params.minSearchStringLength) > 0
	)
	{
		this.minSearchStringLength = parseInt(params.minSearchStringLength);
	}

	BX.addCustomEvent("BX.SonetGroupList:refresh", BX.delegate(function() {
		BX.Main.filterManager.getById(filterId).getPreset().resetPreset(true);
		BX.Main.filterManager.getById(filterId).getSearch().clearForm();
	}, this));

	BX.addCustomEvent("BX.Main.Filter:beforeApply", BX.delegate(function(eventFilterId, values, ob, filterPromise) {
		if (
			eventFilterId != filterId
			|| (
				this.actualSearchString.length > 0
				&& this.actualSearchString.length < this.minSearchStringLength
			)
		)
		{
			return;
		}

		BX.onCustomEvent(window, 'BX.SonetGroupList.Filter:beforeApply', [values, filterPromise]);
	}, this));

	BX.addCustomEvent("BX.Main.Filter:apply", BX.delegate(function(eventFilterId, values, ob, filterPromise, filterParams) {
		if (
			eventFilterId != filterId
			|| (
				this.actualSearchString.length > 0
				&& this.actualSearchString.length < this.minSearchStringLength
			)
		)
		{
			return;
		}

		BX.onCustomEvent(window, 'BX.SonetGroupList.Filter:apply', [values, filterPromise, filterParams]);
	}, this));

	BX.addCustomEvent('BX.Filter.Search:input', BX.delegate(function(eventFilterId, searchString) {
		if (eventFilterId == filterId)
		{

			this.actualSearchString = (typeof searchString != 'undefined' ? BX.util.trim(searchString) : '');

			if (
				this.actualSearchString.length > 0
				&& this.actualSearchString.length >= this.minSearchStringLength
			)
			{
				BX.onCustomEvent(window, 'BX.SonetGroupList.Filter:searchInput', [ searchString ]);
			}
		}
	}, this));

	BX.addCustomEvent('BX.Main.Filter:blur', BX.delegate(function(filterObject) {
		if (
			filterObject.getParam('FILTER_ID') == filterId
			&& filterObject.getSearch().getSquares().length <= 0
			&& filterObject.getSearch().getSearchString().length <= 0
		)
		{
			var pagetitleContainer = BX.findParent(BX(filterId + '_filter_container'), { className: 'pagetitle-wrap'});
			if (pagetitleContainer)
			{
				BX.removeClass(pagetitleContainer, "pagetitle-wrap-filter-opened");
			}
		}
	}, this));
};

}());


(function(){
BitrixSGFilterDestinationSelectorManager = {
	controls: {},

	onSelect: function(item, type, search, bUndeleted, name, state)
	{
		BX.SocNetLogDestination.obItemsSelected[name] = {};
		BX.SocNetLogDestination.obItemsSelected[name][item.id] = type;

		var control = BitrixSGFilterDestinationSelectorManager.controls[name];
		if(control)
		{
			control.setData(BX.util.htmlspecialcharsback(item.name), item.id);
			control.getLabelNode().value = '';
			control.getLabelNode().blur();

			if (BX.SocNetLogDestination.popupWindow != null)
			{
				BX.SocNetLogDestination.popupWindow.close();
			}
			if (BX.SocNetLogDestination.popupSearchWindow != null)
			{
				BX.SocNetLogDestination.popupSearchWindow.close();
			}
		}
	}
};

BitrixSGFilterDestinationSelector = function ()
{
	this.id = "";
	this.filterId = "";
	this.settings = {};
	this.fieldId = "";
	this.control = null;
	this.inited = null;
};

	BitrixSGFilterDestinationSelector.create = function(id, settings)
	{
		var self = new BitrixSGFilterDestinationSelector(id, settings);
		self.initialize(id, settings);
		BX.onCustomEvent(window, 'BX.SonetGroupList.Filter:create', [ id ]);
		return self;
	};

	BitrixSGFilterDestinationSelector.prototype.getSetting = function(name, defaultval)
	{
		return this.settings.hasOwnProperty(name) ? this.settings[name] : defaultval;
	};

	BitrixSGFilterDestinationSelector.prototype.getSearchInput = function()
	{
		return this.control ? this.control.getLabelNode() : null;
	};

	BitrixSGFilterDestinationSelector.prototype.initialize = function(id, settings)
	{
		this.id = id;
		this.settings = settings ? settings : {};
		this.fieldId = this.getSetting("fieldId", "");
		this.filterId = this.getSetting("filterId", "");
		this.inited = false;
		this.opened = null;
		this.closed = null;

		var initialValue = this.getSetting("initialValue",false);
		if (!!initialValue)
		{
			var initialSettings = {};
			initialSettings[this.fieldId] = initialValue.itemId;
			initialSettings[this.fieldId + '_label'] = initialValue.itemName;

			BX.Main.filterManager.getById(this.filterId).getApi().setFields(initialSettings);
		}
		BX.addCustomEvent(window, "BX.Main.Filter:customEntityFocus", BX.delegate(this.onCustomEntitySelectorOpen, this));
		BX.addCustomEvent(window, "BX.Main.Filter:customEntityBlur", BX.delegate(this.onCustomEntitySelectorClose, this));
		BX.addCustomEvent(window, "BX.Main.Filter:onGetStopBlur", BX.delegate(this.onGetStopBlur, this));
		BX.addCustomEvent(window, "BX.Main.Selector:beforeInitDialog", BX.delegate(this.onBeforeInitDialog, this));
		BX.addCustomEvent(window, "BX.SocNetLogDestination:onBeforeSwitchTabFocus", BX.delegate(this.onBeforeSwitchTabFocus, this));
		BX.addCustomEvent(window, "BX.SocNetLogDestination:onBeforeSelectItemFocus", BX.delegate(this.onBeforeSelectItemFocus, this));
		BX.addCustomEvent(window, "BX.Main.Filter:customEntityRemove", BX.delegate(this.onCustomEntityRemove, this));
	};

	BitrixSGFilterDestinationSelector.prototype.open = function()
	{
		var name = this.id;

		if (!this.inited)
		{
			var input = this.getSearchInput();
			input.id = input.name;

			BX.addCustomEvent(window, "BX.Main.Selector:afterInitDialog", BX.delegate(function(params) {
				if (
					typeof params.id != 'undefined'
					|| params.id != this.id
				)
				{
					return;
				}

				this.opened = true;
				this.closed = false;
			}, this));

			BX.onCustomEvent(window, 'BX.SonetGroupList.Filter:openInit', [ {
				id: this.id,
				inputId: input.id,
				containerId: input.id
			} ]);

			this.inited = true;
		}
		else
		{
			BX.onCustomEvent(window, 'BX.SonetGroupList.Filter:open', [ {
				id: this.id,
				bindNode: this.control.getField()
			} ]);

			this.opened = true;
			this.closed = false;
		}
	};

	BitrixSGFilterDestinationSelector.prototype.close = function()
	{
		BX.SocNetLogDestination.closeDialog();
		this.opened = false;
		this.closed = true;
	};

	BitrixSGFilterDestinationSelector.prototype.onCustomEntitySelectorOpen = function(control)
	{
		var fieldId = control.getId();

		if(this.fieldId !== fieldId)
		{
			this.control = null;
		}
		else
		{
			this.control = control;

			if(this.control)
			{
				var current = this.control.getCurrentValues();
				this.currentUser = { "entityId": current["value"] };
			}

			BitrixSGFilterDestinationSelectorManager.controls[this.id] = this.control;

			if (!this.opened)
			{
				this.open();
			}
			else
			{
				this.close();
			}
		}
	};

	BitrixSGFilterDestinationSelector.prototype.onCustomEntitySelectorClose = function(control)
	{
		if(
			this.fieldId === control.getId()
			&& this.inited === true
		)
		{
			this.control = null;
			this.close();
		}
	};

	BitrixSGFilterDestinationSelector.prototype.onGetStopBlur = function(event, result)
	{
		if (BX.findParent(event.target, { className: 'bx-lm-box'}))
		{
			result.stopBlur = true;
		}
	};

	BitrixSGFilterDestinationSelector.prototype.onCustomEntityRemove = function(control)
	{
		if(this.fieldId === control.getId())
		{
			if (
				typeof control.hiddenInput != 'undefined'
				&& typeof control.hiddenInput.value != 'undefined'
				&& typeof BX.SocNetLogDestination.obItemsSelected[this.id] != 'undefined'
				&& typeof BX.SocNetLogDestination.obItemsSelected[this.id][control.hiddenInput.value] != 'undefined'
			)
			{
				delete BX.SocNetLogDestination.obItemsSelected[this.id][control.hiddenInput.value];
			}
		}
	};

	BitrixSGFilterDestinationSelector.prototype.onBeforeSwitchTabFocus = function(ob)
	{
		if(this.id === ob.id)
		{
			ob.blockFocus = true;
		}
	};

	BitrixSGFilterDestinationSelector.prototype.onBeforeSelectItemFocus = function(ob)
	{
		if(this.id === ob.id)
		{
			ob.blockFocus = true;
		}
	};

	BitrixSGFilterDestinationSelector.prototype.onBeforeInitDialog = function(params)
	{
		if (
			typeof params.id == 'undefined'
			|| params.id != this.id
		)
		{
			return;
		}

		if (this.closed)
		{
			params.blockInit = true;
		}
	};

}());