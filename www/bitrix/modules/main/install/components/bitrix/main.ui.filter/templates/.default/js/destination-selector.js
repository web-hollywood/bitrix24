;(function() {
	'use strict';

	BX.namespace('BX.Filter');

	BX.Filter.DestinationSelectorManager = {
		fields: [],
		controls: {},

		onSelect: function(params)
		{
			if (
				typeof params == 'undefined'
				|| !BX.type.isNotEmptyString(params.name)
				|| typeof params.item == 'undefined'
				|| !BX.type.isNotEmptyString(params.type)
			)
			{
				return;
			}

			var
				name = params.name,
				type = params.type,
				item = params.item;

			BX.SocNetLogDestination.obItemsSelected[name] = {};
			BX.SocNetLogDestination.obItemsSelected[name][item.id] = type;

			var control = BX.Filter.DestinationSelectorManager.controls[name];
			if (control)
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
		},

		onDialogOpen: function(params)
		{
			if (
				typeof params == 'undefined'
				|| !BX.type.isNotEmptyString(params.name)
			)
			{
				return;
			}

			var name = params.name;

			var item = BX.Filter.DestinationSelector.items[name];
			if(item)
			{
				item.onDialogOpen();
			}
		},

		onDialogClose: function(params)
		{
			if (
				typeof params == 'undefined'
				|| !BX.type.isNotEmptyString(params.name)
			)
			{
				return;
			}

			var name = params.name;

			var item = BX.Filter.DestinationSelector.items[name];
			if(item)
			{
				item.onDialogClose();
			}
		}
	};

	BX.Filter.DestinationSelector = function ()
	{
		this.id = "";
		this.filterId = "";
		this.settings = {};
		this.fieldId = "";
		this.control = null;
		this.inited = null;
	};

	BX.Filter.DestinationSelector.items = {};

	BX.Filter.DestinationSelector.create = function(id, settings)
	{
		if (typeof this.items[id] != 'undefined')
		{
			return this.items[id];
		}

		var self = new BX.Filter.DestinationSelector(id, settings);
		self.initialize(id, settings);
		this.items[id] = self;
		BX.onCustomEvent(window, 'BX.Filter.DestinationSelector:create', [ id ]);
		return self;
	};

	BX.Filter.DestinationSelector.prototype.getSetting = function(name, defaultval)
	{
		return this.settings.hasOwnProperty(name) ? this.settings[name] : defaultval;
	};

	BX.Filter.DestinationSelector.prototype.getSearchInput = function()
	{
		return this.control ? this.control.getLabelNode() : null;
	};

	BX.Filter.DestinationSelector.prototype.initialize = function(id, settings)
	{
		this.id = id;
		this.settings = settings ? settings : {};
		this.fieldId = this.getSetting("fieldId", "");
		this.filterId = this.getSetting("filterId", "");
		this.inited = false;
		this.opened = null;

		var initialValue = this.getSetting("initialValue", false);
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

	BX.Filter.DestinationSelector.prototype.open = function()
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
			}, this));

			BX.onCustomEvent(window, 'BX.Filter.DestinationSelector:openInit', [ {
				id: this.id,
				inputId: input.id,
				containerId: input.id
			} ]);
		}
		else
		{
			var currentValue = {};
			currentValue[this.currentUser.entityId] = "users";

			BX.onCustomEvent(window, 'BX.Filter.DestinationSelector:open', [ {
				id: this.id,
				bindNode: this.control.getField(),
				value: currentValue
			} ]);

			this.opened = true;
		}
	};

	BX.Filter.DestinationSelector.prototype.close = function()
	{
		if(typeof(BX.Main.selectorManager.controls[this.id]) !== "undefined")
		{
			BX.Main.selectorManager.controls[this.id].closeDialog();
		}
	};

	BX.Filter.DestinationSelector.prototype.onCustomEntitySelectorOpen = function(control)
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
				this.currentUser = {
					entityId: current["value"]
				};
			}

			BX.Filter.DestinationSelectorManager.controls[this.id] = this.control;

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

	BX.Filter.DestinationSelector.prototype.onCustomEntitySelectorClose = function(control)
	{
		if(
			this.fieldId === control.getId()
			&& this.inited === true
			&& this.opened === true
		)
		{
			this.control = null;
			window.setTimeout(BX.delegate(this.close, this), 0);
		}
	};

	BX.Filter.DestinationSelector.prototype.onGetStopBlur = function(event, result)
	{
		if (BX.findParent(event.target, { className: 'bx-lm-box'}))
		{
			result.stopBlur = true;
		}
	};

	BX.Filter.DestinationSelector.prototype.onCustomEntityRemove = function(control)
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

	BX.Filter.DestinationSelector.prototype.onBeforeSwitchTabFocus = function(ob)
	{
		if(this.id === ob.id)
		{
			ob.blockFocus = true;
		}
	};

	BX.Filter.DestinationSelector.prototype.onBeforeSelectItemFocus = function(ob)
	{
		if(this.id === ob.id)
		{
			ob.blockFocus = true;
		}
	};

	BX.Filter.DestinationSelector.prototype.onBeforeInitDialog = function(params)
	{
		if (
			typeof params.id == 'undefined'
			|| params.id != this.id
		)
		{
			return;
		}

		this.inited = true;

		if (!this.control)
		{
			params.blockInit = true;
		}
	};

	BX.Filter.DestinationSelector.prototype.onDialogOpen = function()
	{
		this.opened = true;
	};

	BX.Filter.DestinationSelector.prototype.onDialogClose = function()
	{
		this.opened = false;
	};

})();