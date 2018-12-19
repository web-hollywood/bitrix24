
if(typeof(BX.AutoRunProcessState) === "undefined")
{
	BX.AutoRunProcessState =
	{
		intermediate: 0,
		running: 1,
		completed: 2,
		stopped: 3,
		error: 4
	};
}

if(typeof(BX.AutorunProcessManager) === "undefined")
{
	BX.AutorunProcessManager = function()
	{
		this._id = "";
		this._settings = {};
		this._serviceUrl = "";
		this._actionName = "";
		this._params = null;

		this._container = null;
		this._panel = null;
		this._runHandle = 0;

		this._hasLayout = false;

		this._state = BX.AutoRunProcessState.intermediate;
		this._processedItemCount = 0;
		this._totalItemCount = 0;
		this._error = "";
		this._errorExtras = null;
	};
	BX.AutorunProcessManager.prototype =
	{
		initialize: function(id, settings)
		{
			this._id = BX.type.isNotEmptyString(id) ? id : "crm_lrp_mgr_" + Math.random().toString().substring(2);
			this._settings = settings ? settings : {};

			this._serviceUrl = this.getSetting("serviceUrl", "");
			if(!BX.type.isNotEmptyString(this._serviceUrl))
			{
				throw "AutorunProcessManager. Could not find 'serviceUrl' parameter in settings.";
			}

			this._actionName = this.getSetting("actionName", "");
			if(!BX.type.isString(this._actionName))
			{
				this._actionName = "";
			}

			this._container = BX(this.getSetting("container"));
			if(!BX.type.isElementNode(this._container))
			{
				throw "AutorunProcessManager: Could not find container.";
			}

			this._params = BX.prop.getObject(this._settings, "params", null);
			if(BX.prop.getBoolean(this._settings, "enableLayout", false))
			{
				this.layout();
			}
		},
		getId: function()
		{
			return this._id;
		},
		getSetting: function (name, defaultval)
		{
			return this._settings.hasOwnProperty(name) ? this._settings[name] : defaultval;
		},
		getMessage: function(name)
		{
			var m = BX.AutorunProcessManager.messages;
			return m.hasOwnProperty(name) ? m[name] : name;
		},
		getParams: function()
		{
			return this._params;
		},
		setParams: function(params)
		{
			this._params = params;
		},
		isHidden: function()
		{
			return !this._hasLayout || this._panel.isHidden();
		},
		show: function()
		{
			if(this._hasLayout)
			{
				this._panel.show();
			}
		},
		hide: function()
		{
			if(this._hasLayout)
			{
				this._panel.hide();
			}
		},
		layout: function()
		{
			if(this._hasLayout)
			{
				return;
			}

			if(!this._panel)
			{
				var title = BX.prop.getString(this._settings, "title", "");
				if(title === "")
				{
					title = this.getMessage("title");
				}

				var stateTemplate = BX.prop.getString(this._settings, "stateTemplate", "");
				if(stateTemplate === "")
				{
					stateTemplate = this.getMessage("stateTemplate");
				}

				this._panel = BX.AutorunProcessPanel.create(
					this._id,
					{
						manager: this,
						container: this._container,
						enableCancellation: BX.prop.getBoolean(this._settings, "enableCancellation", false),
						title: title,
						stateTemplate: stateTemplate
					}
				);
			}
			this._panel.layout();
			this._hasLayout = true;
		},
		clearLayout: function()
		{
			if(!this._hasLayout)
			{
				return;
			}

			this._panel.clearLayout();
			this._hasLayout = false;
		},
		getPanel: function()
		{
			return this._panel;
		},
		setPanel: function(panel)
		{
			this._panel = panel;

			if(this._panel)
			{
				this._panel.setManager(this);
				this._hasLayout =  this._panel.hasLayout();
			}
			else
			{
				this._hasLayout = false;
			}
		},
		refresh: function()
		{
			if(!this._hasLayout)
			{
				this.layout();
			}

			if(this._panel.isHidden())
			{
				this._panel.show();
			}
			this._panel.onManagerStateChange();
		},
		getState: function()
		{
			return this._state;
		},
		getProcessedItemCount: function()
		{
			return this._processedItemCount;
		},
		getTotalItemCount: function()
		{
			return this._totalItemCount;
		},
		getError: function()
		{
			return this._error;
		},
		getErrorExtras: function()
		{
			return this._errorExtras;
		},
		run: function()
		{
			if(this._state === BX.AutoRunProcessState.stopped)
			{
				this._state = BX.AutoRunProcessState.intermediate;
			}
			this.startRequest();
		},
		runAfter: function(timeout)
		{
			this._runHandle = window.setTimeout(BX.delegate(this.run, this), timeout);
		},
		stop: function()
		{
			this._state = BX.AutoRunProcessState.stopped;
			BX.onCustomEvent(this, 'ON_AUTORUN_PROCESS_STATE_CHANGE', [this]);
		},
		reset: function()
		{
			if(this._runHandle > 0)
			{
				window.clearTimeout(this._runHandle);
				this._runHandle = 0;
			}

			if(this._panel && this._panel.isHidden())
			{
				this._panel.show();
			}

			this._processedItemCount = this._totalItemCount = 0;
			this._error = "";
			this._errorExtras = null;
		},
		startRequest: function()
		{
			if(this._state === BX.AutoRunProcessState.stopped)
			{
				return;
			}

			if(this._requestIsRunning)
			{
				return;
			}
			this._requestIsRunning = true;

			this._state = BX.AutoRunProcessState.running;

			var data = {};
			if(this._actionName !== "")
			{
				data["ACTION"] = this._actionName;
			}

			if(this._params)
			{
				data["PARAMS"] = this._params;
			}

			BX.ajax(
			{
				url: this._serviceUrl,
				method: "POST",
				dataType: "json",
				data: data,
				onsuccess: BX.delegate(this.onRequestSuccess, this),
				onfailure: BX.delegate(this.onRequestFailure, this)
			}
		   );
	   },
		onRequestSuccess: function(result)
		{
			this._requestIsRunning = false;
			if(this._state === BX.AutoRunProcessState.stopped)
			{
				return;
			}

			var status = BX.type.isNotEmptyString(result["STATUS"]) ? result["STATUS"] : "";
			if(status === "ERROR")
			{
				this._state = BX.AutoRunProcessState.error;
			}
			else if(status === "COMPLETED")
			{
				this._state = BX.AutoRunProcessState.completed;
			}

			if(this._state === BX.AutoRunProcessState.error)
			{
				this._error = BX.prop.getString(result, "ERROR", this.getMessage("requestError"));
				this._errorExtras = BX.prop.getObject(result, "ERROR_EXTRAS", null);
			}
			else
			{
				this._processedItemCount = BX.type.isNotEmptyString(result["PROCESSED_ITEMS"]) ? parseInt(result["PROCESSED_ITEMS"]) : 0;
				this._totalItemCount = BX.type.isNotEmptyString(result["TOTAL_ITEMS"]) ? parseInt(result["TOTAL_ITEMS"]) : 0;
				this._error = BX.prop.getString(result, "ERROR", "");
				this._errorExtras = BX.prop.getObject(result, "ERROR_EXTRAS", null);
			}

			this.refresh();
			if(this._state === BX.AutoRunProcessState.running)
			{
				window.setTimeout(BX.delegate(this.startRequest, this), 2000);
			}
			else if(this._state === BX.AutoRunProcessState.completed
				&& BX.prop.getBoolean(this._settings, "hideAfterComplete", true)
			)
			{
				this.hide();
			}

			BX.onCustomEvent(this, 'ON_AUTORUN_PROCESS_STATE_CHANGE', [this]);
		},
		onRequestFailure: function(result)
		{
			this._requestIsRunning = false;

			this._state = BX.AutoRunProcessState.error;
			this._error = this.getMessage("requestError");

			this.refresh();
			BX.onCustomEvent(this, 'ON_AUTORUN_PROCESS_STATE_CHANGE', [this]);
		}
	};
	if(typeof(BX.AutorunProcessManager.messages) === "undefined")
	{
		BX.AutorunProcessManager.messages = {};
	}
	BX.AutorunProcessManager.items = {};
	BX.AutorunProcessManager.create = function(id, settings)
	{
		var self = new BX.AutorunProcessManager();
		self.initialize(id, settings);
		this.items[self.getId()] = self;
		return self;
	};
}

if(typeof(BX.AutorunProcessPanel) === "undefined")
{
	BX.AutorunProcessPanel = function()
	{
		this._id = "";
		this._settings = {};

		this._manager = null;
		this._container = null;
		this._wrapper = null;
		this._stateNode = null;
		this._progressNode = null;
		this._hasLayout = false;
		this._isHidden = false;
	};
	BX.AutorunProcessPanel.prototype =
	{
		initialize: function(id, settings)
		{
			this._id = id;
			this._settings = settings ? settings : {};

			this._container = BX(this.getSetting("container"));
			if(!BX.type.isElementNode(this._container))
			{
				throw "AutorunProcessPanel: Could not find container.";
			}

			this._manager = this.getSetting("manager");
			this._isHidden = this.getSetting("isHidden", false);
		},
		getId: function()
		{
			return this._id;
		},
		getSetting: function (name, defaultval)
		{
			return this._settings.hasOwnProperty(name) ? this._settings[name] : defaultval;
		},
		layout: function()
		{
			if(this._hasLayout)
			{
				return;
			}

			this._wrapper = BX.create("DIV", { attrs: { className: "crm-view-progress" } });
			BX.addClass(this._wrapper, this._isHidden ? "crm-view-progress-hide" : "crm-view-progress-show crm-view-progress-bar-active");

			this._container.appendChild(this._wrapper);

			this._wrapper.appendChild(
				BX.create("DIV",
					{
						attrs: { className: "crm-view-progress-info" },
						text: this.getSetting("title", "Please wait...")
					}
				)
			);

			this._progressNode = BX.create("DIV", { attrs: { className: "crm-view-progress-bar-line" } });
			this._stateNode = BX.create("DIV", { attrs: { className: "crm-view-progress-steps" } });
			this._wrapper.appendChild(
				BX.create("DIV",
					{
						attrs: { className: "crm-view-progress-inner" },
						children:
						[
							BX.create("DIV",
								{
									attrs: { className: "crm-view-progress-bar" },
									children: [ this._progressNode ]
								}
							),
							this._stateNode
						]
					}
				)
			);

			if(BX.prop.getBoolean(this._settings, "enableCancellation", false))
			{
				this._wrapper.appendChild(
					BX.create("a",
						{
							attrs: { className: "crm-view-progress-link", href: "#" },
							text: BX.message("JS_CORE_WINDOW_CANCEL"),
							events: { click: BX.delegate(this.onCancelButtonClick, this) }
						}
					)
				);
			}

			this._hasLayout = true;
		},
		hasLayout: function()
		{
			return this._hasLayout;
		},
		isHidden: function()
		{
			return this._isHidden;
		},
		show: function()
		{
			if(!this._isHidden)
			{
				return;
			}

			if(!this._hasLayout)
			{
				return;
			}

			BX.removeClass(this._wrapper, "crm-view-progress-hide");
			BX.addClass(this._wrapper, "crm-view-progress-show");

			this._isHidden = false;
		},
		hide: function()
		{
			if(this._isHidden)
			{
				return;
			}

			if(!this._hasLayout)
			{
				return;
			}

			BX.removeClass(this._wrapper, "crm-view-progress-show");
			BX.addClass(this._wrapper, "crm-view-progress-hide");

			this._isHidden = true;
		},
		clearLayout: function()
		{
			if(!this._hasLayout)
			{
				return;
			}

			BX.remove(this._wrapper);
			this._wrapper = this._stateNode = null;

			this._hasLayout = false;
		},
		getManager: function()
		{
			return this._manager;
		},
		setManager: function(manager)
		{
			this._manager = manager;
		},
		onManagerStateChange: function()
		{
			if(!(this._hasLayout && this._manager))
			{
				return;
			}

			var state = this._manager.getState();
			if(state !== BX.AutoRunProcessState.error)
			{
				var processed = this._manager.getProcessedItemCount();
				var total = this._manager.getTotalItemCount();

				var progress = 0;
				if(total !== 0)
				{
					progress = Math.floor((processed / total) * 100);
					var offset = progress % 5;
					if(offset !== 0)
					{
						progress -= offset;
					}
				}

				this._stateNode.innerHTML = (processed > 0 && total > 0)
					? this.getSetting("stateTemplate", "#processed# from #total#").replace('#processed#', processed).replace('#total#', total)
					: "";

				this._progressNode.className = "crm-view-progress-bar-line";
				if(progress > 0)
				{
					this._progressNode.className += " crm-view-progress-line-" + progress.toString();
				}
			}
		},
		onCancelButtonClick: function(e)
		{
			this._manager.stop();
			return BX.eventReturnFalse(e);
		}
	};
	BX.AutorunProcessPanel.items = {};
	BX.AutorunProcessPanel.isExists = function(id)
	{
		return this.items.hasOwnProperty(id);
	};

	BX.AutorunProcessPanel.create = function(id, settings)
	{
		var self = new BX.AutorunProcessPanel();
		self.initialize(id, settings);
		this.items[self.getId()] = self;
		return self;
	}
}
