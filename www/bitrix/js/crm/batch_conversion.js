BX.namespace("BX.Crm");

if(typeof(BX.Crm.BatchConversionManager) === "undefined")
{
	BX.Crm.BatchConversionManager = function()
	{
		this._id = "";
		this._settings = {};

		this._gridId = "";
		this._config = null;
		this._entityIds = null;
		this._serviceUrl = "";
		this._containerId = "";
		this._errors = null;

		this._progress = null;
		this._hasLayout = false;

		this._succeededItemCount = 0;
		this._failedItemCount = 0;
		this._isRunning = false;

		this._progressChangeHandler = BX.delegate(this.onProgress, this);
		this._documentUnloadHandler = BX.delegate(this.onDocumentUnload, this);
	};
	BX.Crm.BatchConversionManager.prototype =
	{
		initialize: function(id, settings)
		{
			this._id = BX.type.isNotEmptyString(id) ? id : "crm_batch_conversion_mgr_" + Math.random().toString().substring(2);
			this._settings = settings ? settings : {};

			this._gridId = BX.prop.getString(this._settings, "gridId", this._id);
			this._config = BX.prop.getObject(this._settings, "config", {});
			this._entityIds = BX.prop.getArray(this._settings, "entityIds", []);

			this._serviceUrl = BX.prop.getString(this._settings, "serviceUrl", "");
			if(this._serviceUrl === "")
			{
				throw "BX.Crm.BatchConversionManager. Could not find 'serviceUrl' parameter in settings.";
			}

			this._containerId = BX.prop.getString(this._settings, "container", "");
			if(this._containerId === "")
			{
				throw "BX.Crm.BatchConversionManager: Could not find container.";
			}

			//region progress
			this._progress = BX.AutorunProcessManager.create(
				this._id,
				{
					serviceUrl: this._serviceUrl,
					actionName: "PROCESS_BATCH_CONVERSION",
					container: this._containerId,
					enableCancellation: true,
					title: BX.prop.getString(this._settings, "title", this.getMessage("title")),
					stateTemplate: BX.prop.getString(this._settings, "stateTemplate", this.getMessage("stateTemplate")),
					enableLayout: false
				}
			);
			//region
			this._errors = [];
		},
		getId: function()
		{
			return this._id;
		},
		getConfig: function()
		{
			return this._config;
		},
		setConfig: function(config)
		{
			this._config = BX.type.isPlainObject(config) ? config : {};
		},
		getEntityIds: function()
		{
			return this._entityIds;
		},
		setEntityIds: function(entityIds)
		{
			this._entityIds = BX.type.isArray(entityIds) ? entityIds : [];
		},
		getMessage: function(name)
		{
			var m = BX.Crm.BatchConversionManager.messages;
			return m.hasOwnProperty(name) ? m[name] : name;
		},
		layout: function()
		{
			if(this._hasLayout)
			{
				return;
			}

			this._progress.layout();
			this._hasLayout = true;
		},
		clearLayout: function()
		{
			if(!this._hasLayout)
			{
				return;
			}

			this._progress.clearLayout();
			this._hasLayout = false;
		},
		getState: function()
		{
			return this._progress.getState();
		},
		getProcessedItemCount: function()
		{
			return this._progress.getProcessedItemCount();
		},
		getTotalItemCount: function()
		{
			return this._progress.getTotalItemCount();
		},
		execute: function()
		{
			var data =
				{
					ACTION: "PREPARE_BATCH_CONVERSION",
					PARAMS:
						{
							GRID_ID: this._gridId,
							CONFIG: this._config,
							IDS: this._entityIds
						}
				};

			BX.ajax(
				{
					url: this._serviceUrl,
					method: "POST",
					dataType: "json",
					data: data,
					onsuccess: BX.delegate(this.onPrepare, this)
				}
			);
		},
		onPrepare: function(result)
		{
			var data = result["DATA"];

			var status = BX.prop.getString(data, "STATUS", '');
			this._config = BX.prop.getObject(data, "CONFIG", {});

			if(status === "ERROR")
			{
				var errors = BX.prop.getArray(data, "ERRORS", []);
				var dlg = BX.Crm.NotificationDialog.create(
					"batch_conversion_error",
					{
						title: this.getMessage("title"),
						content: errors.join("<br/>")
					}
				);
				dlg.open();

				return;
			}
			if(status === "REQUIRES_SYNCHRONIZATION")
			{
				var syncEditor = BX.CrmLeadConverter.getCurrent().createSynchronizationEditor(
					this._id,
					this._config,
					BX.prop.getArray(data, "FIELD_NAMES", [])
				);
				syncEditor.addClosingListener(BX.delegate(this.onSynchronizationEditorClose, this));
				syncEditor.show();

				return;
			}

			this.layout();
			this.run();
		},
		run: function()
		{
			if(this._isRunning)
			{
				return;
			}
			this._isRunning = true;

			this._progress.setParams({ "GRID_ID": this._gridId, "CONFIG": this._config });
			this._progress.run();

			BX.addCustomEvent(this._progress, "ON_AUTORUN_PROCESS_STATE_CHANGE", this._progressChangeHandler);
			BX.bind(window, "beforeunload", this._documentUnloadHandler);
		},
		stop: function()
		{
			if(!this._isRunning)
			{
				return;
			}
			this._isRunning = false;

			BX.ajax(
				{
					url: this._serviceUrl,
					method: "POST",
					dataType: "json",
					data: { ACTION: "STOP_BATCH_CONVERSION", PARAMS: { GRID_ID: this._gridId } },
					onsuccess: function(result){ this.reset(); }.bind(this)
				}
			);
		},
		reset: function()
		{
			this._progress.reset();

			BX.removeCustomEvent(this._progress, "ON_AUTORUN_PROCESS_STATE_CHANGE", this._progressChangeHandler);
			BX.unbind(window, "beforeunload", this._documentUnloadHandler);

			if(this._succeededItemCount > 0 || this._failedItemCount > 0)
			{
				BX.Main.gridManager.reload(this._gridId);
			}

			this._succeededItemCount = this._failedItemCount = 0;
			this._isRunning = false;

			if(this._hasLayout)
			{
				window.setTimeout(BX.delegate(this.clearLayout, this), 0);
			}

			this._errors = [];
		},
		getSucceededItemCount: function()
		{
			return this._succeededItemCount;
		},
		getFailedItemCount: function()
		{
			return this._failedItemCount;
		},
		getErrors: function()
		{
			return this._errors;
		},
		onDocumentUnload: function(e)
		{
			return(e.returnValue = this.getMessage("windowCloseConfirm"));
		},
		onSynchronizationEditorClose: function(sender, args)
		{
			if(BX.prop.getBoolean(args, "isCanceled", false))
			{
				this.clearLayout();
				return;
			}

			this._config = sender.getConfig();
			this.run();

		},
		onProgress: function(sender)
		{
			var state = this._progress.getState();
			if(state === BX.AutoRunProcessState.stopped)
			{
				this.stop();
				return;
			}

			var error = this._progress.getError();
			if(error === "")
			{
				this._succeededItemCount++;
			}
			else
			{
				var errorData = { message: error };
				var errorExtras = this._progress.getErrorExtras();
				if(errorExtras)
				{
					errorData["info"] = BX.prop.getObject(errorExtras, "INFO", null);
				}
				this._errors.push(errorData);
				this._failedItemCount++;
			}

			if(state === BX.AutoRunProcessState.completed)
			{
				BX.Crm.BatchConversionPanel.create(this._id, { container: this._containerId, manager: this }).layout();
				this.reset();
			}
		}

	};
	if(typeof(BX.Crm.BatchConversionManager.messages) === "undefined")
	{
		BX.Crm.BatchConversionManager.messages = {};
	}

	BX.Crm.BatchConversionManager.items = {};
	BX.Crm.BatchConversionManager.getItem = function(id)
	{
		return BX.prop.get(this.items, id, null);
	};
	BX.Crm.BatchConversionManager.create = function(id, settings)
	{
		var self = new BX.Crm.BatchConversionManager();
		self.initialize(id, settings);
		this.items[self.getId()] = self;
		return self;
	};
}

if(typeof(BX.Crm.BatchConversionPanel) === "undefined")
{
	BX.Crm.BatchConversionPanel = function()
	{
		this._id = "";
		this._settings = {};

		this._manager = null;
		this._container = null;
		this._wrapper = null;
	};

	BX.Crm.BatchConversionPanel.prototype =
	{
		initialize: function(id, settings)
		{
			this._id = id;
			this._settings = settings ? settings : {};

			this._container = BX(BX.prop.getString(this._settings, "container"));
			if(!BX.type.isElementNode(this._container))
			{
				throw "BatchConversionPanel: Could not find container.";
			}

			this._manager = BX.prop.get(this._settings, "manager");
		},
		getId: function()
		{
			return this._id;
		},
		getMessage: function(name)
		{
			return BX.prop.getString(BX.Crm.BatchConversionPanel.messages, name, name);
		},
		layout: function()
		{
			if(this._hasLayout)
			{
				return;
			}

			this._wrapper = BX.create("DIV", { attrs: { className: "crm-view-progress" } });
			BX.addClass(this._wrapper, this._isHidden ? "crm-view-progress-hide" : "crm-view-progress-show");
			BX.addClass(this._wrapper, "crm-view-progress-row-hidden");

			this._container.appendChild(this._wrapper);

			var summaryElements = [ BX.create("span", { text: this.getMessage("summaryCaption") }) ];

			var succeeded = this._manager.getSucceededItemCount();
			if(succeeded > 0)
			{
				summaryElements.push(
					BX.create("span",
						{
							attrs: { className: "crm-view-progress-text" },
							text: this.getMessage("summarySucceeded").replace(/#number_leads#/ig, succeeded)
						}
					)
				);
			}

			var failed = this._manager.getFailedItemCount();
			if(failed > 0)
			{
				summaryElements.push(
					BX.create("span",
						{
							attrs: { className: "crm-view-progress-link crm-view-progress-text-button" },
							text: this.getMessage("summaryFailed").replace(/#number_leads#/ig, failed),
							events: { click: BX.delegate(this.onToggleErrorButtonClick, this)  }
						}
					)
				);
			}

			var elements = [];
			elements.push(
				BX.create("DIV",
					{
						attrs: { className: "crm-view-progress-info" },
						children: summaryElements
					}
				)
			);

			elements.push(
				BX.create("a",
					{
						attrs: { className: "crm-view-progress-link", href: "#" },
						text: BX.message("JS_CORE_WINDOW_CLOSE"),
						events: { click: BX.delegate(this.onCloseButtonClick, this) }
					}
				)
			);

			this._wrapper.appendChild(
				BX.create("DIV", {
					attrs: { className: "crm-view-progress-row" },
					children: elements
				})
			);

			var errors = this._manager.getErrors();
			for(var i = 0, length = errors.length; i < length; i++)
			{
				var error = errors[i];
				var errorElements = [];

				var info = BX.prop.getObject(error, "info", null);
				if(info)
				{
					var title = BX.prop.getString(info, "TITLE", "");
					var showUrl = BX.prop.getString(info, "SHOW_URL", "");

					if(title !== "" && showUrl !== "")
					{
						errorElements.push(
							BX.create(
								"a",
								{
									props: { className: "crm-view-progress-link", href: showUrl, target: "_blank" },
									text: title + ":"
								}
							)
						);
					}
				}

				errorElements.push(
					BX.create("span",
						{
							attrs: { className: "crm-view-progress-text" },
							text: error["message"]
						}
					)
				);

				this._wrapper.appendChild(
					BX.create("DIV",
						{
							attrs: { className: "crm-view-progress-row" },
							children:
								[
									BX.create("DIV",
										{
											attrs: { className: "crm-view-progress-info" },
											children: errorElements
										}
									)
								]
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
			this._wrapper = null;

			this._hasLayout = false;
		},
		onCloseButtonClick: function(e)
		{
			this.clearLayout();
			return BX.eventReturnFalse(e);
		},
		onToggleErrorButtonClick: function ()
		{
			BX.toggleClass(this._wrapper, "crm-view-progress-row-hidden");
		}
	};

	if(typeof(BX.Crm.BatchConversionPanel.messages) === "undefined")
	{
		BX.Crm.BatchConversionPanel.messages = {};
	}

	BX.Crm.BatchConversionPanel.create = function(id, settings)
	{
		var self = new BX.Crm.BatchConversionPanel();
		self.initialize(id, settings);
		return self;
	}
}