;(function () {

	'use strict';

	BX.namespace('BX.UI.Viewer');

	BX.UI.Viewer.Controller = function(options)
	{
		/**
		 * @type {BX.UI.Viewer.Item[]}
		 */
		this.items = null;
		this.currentIndex = null;
		this.handlers = {};

		this.setItems(options.items || []);
		/**
		 * @type {BX.UI.ActionPanel}
		 */
		this.actionPanel = new BX.UI.ActionPanel({
			darkMode: true,
			autoHide: false,
			showTotalSelectedBlock: false,
			showResetAllBlock: false,
			alignItems: 'center',
			renderTo: function() {
				return this.getPanelWrapper();
			}.bind(this)
		});

		this.init();

		this.zIndex = options.zIndex || 999999;
		this.layout = {
			container: null,
			content: null,
			inner: null,
			items: null,
			next: null,
			prev: null,
			close: null,
			error: null,
			loader: null,
			loaderContainer: null,
			panel: null
		}
	};

	BX.UI.Viewer.Controller.prototype = {
		handleDocumentClick: function (event)
		{
			var target = BX.getEventTarget(event);
			if (!target.dataset.hasOwnProperty('viewer'))
			{
				return;
			}

			var indexToShow = 0;
			var viewer = BX.UI.Viewer.Instance;
			if (!target.dataset.viewerGroupBy)
			{
				viewer.setItems([
					BX.UI.Viewer.buildItemByNode(target)
				]);
			}
			else
			{
				var nodes = [].slice.call(target.ownerDocument.querySelectorAll("[data-viewer][data-viewer-group-by='" + target.dataset.viewerGroupBy + "']"));
				var items = nodes.map(function(node, index) {
					if (node === target)
					{
						indexToShow = index;
					}
					return BX.UI.Viewer.buildItemByNode(node);
				});

				viewer.setItems(items);
			}
			viewer.open(indexToShow);

			event.preventDefault();
		},

		bindEvents: function ()
		{
			this.handlers.keyPress = this.handleKeyPress.bind(this);
			this.handlers.touchStart = this.handleTouchStart.bind(this);
			this.handlers.touchEnd = this.handleTouchEnd.bind(this);
			this.handlers.resize = this.adjustViewerHeight.bind(this);

			BX.bind(document, 'keydown', this.handlers.keyPress);
			BX.bind(window, 'resize', this.handlers.resize);
			BX.bind(this.getItemListNode(), 'touchstart', this.handlers.touchStart);
			BX.bind(this.getItemListNode(), 'touchend', this.handlers.touchEnd);

			BX.bind(this.getNextButton(), 'click', this.showNext.bind(this));
			BX.bind(this.getPrevButton(), 'click', this.showPrev.bind(this));
			BX.bind(this.getCloseButton(), 'click', this.close.bind(this));

			BX.addCustomEvent('SidePanel.Slider:onOpen', function(event) {
				if (!this.originalZIndex)
				{
					this.originalZIndex = this.getZindex();
				}

				this.setZindex(event.getSlider().getZindex() - 1);
			}.bind(this));
			BX.addCustomEvent('SidePanel.Slider:onCloseComplete', function(event) {
				var slider = BX.SidePanel.Instance.getTopSlider();
				if (slider)
				{
					this.setZindex(slider.getZindex() - 1);
				}
				else
				{
					this.setZindex(this.originalZIndex);
					this.originalZIndex = null;
				}
			}.bind(this));
		},

		unbindEvents: function()
		{
			BX.unbind(document, 'keydown', this.handlers.keyPress);
			BX.unbind(window, 'resize', this.handlers.resize);
			BX.unbind(this.getItemListNode(), 'touchstart', this.handlers.touchStart);
			BX.unbind(this.getItemListNode(), 'touchend', this.handlers.touchEnd);
		},

		init: function ()
		{},

		getZindex: function ()
		{
			return this.zIndex;
		},

		setZindex: function (zIndex)
		{
			this.zIndex = zIndex;
			this.getViewerContainer().style.zIndex = zIndex;
		},

		setItems: function (items)
		{
			if (!BX.type.isArray(items))
			{
				throw new Error("BX.UI.Viewer.Controller.setItems: 'items' has to be Array.");
			}

			BX.onCustomEvent('BX.UI.Viewer.Controller:onSetItems', [this, items]);

			this.items = items;
			this.items.forEach(function (item) {
				item.setController(this);
			}, this);
		},

		appendItem: function (item)
		{
			if (!(item instanceof BX.UI.Viewer.Item))
			{
				throw new Error("BX.UI.Viewer.Controller.appendItem: 'item' has to be instance of BX.UI.Viewer.Item.");
			}

			item.setController(this);
			this.items.push(item);
		},

		show: function (index, forceReload)
		{
			if (typeof index === 'undefined')
			{
				index = 0;
			}

			BX.onCustomEvent('BX.UI.Viewer.Controller:onBeforeShow', [this, index]);

			var item = this.getItemByIndex(index);
			if (!item)
			{
				return;
			}

			var prevItem = this.getCurrentItem();
			this.currentIndex = index;

			this.hideErrorBlock();

			if (prevItem)
			{
				this.hideCurrentItem();
			}
			this.actionPanel.removeItems();
			this.actionPanel.addItems(
				this.refineActions(this.getCurrentItem().getActions(), this.getCurrentItem())
			);

			this.showLoading();

			var promise;
			if (forceReload)
			{
				promise = item.reload();
			}
			else
			{
				promise = item.load();
			}
				promise.then(function (item) {
					if (this.getCurrentItem() === item)
					{
						this.processShowItem.call(this, item);
					}
				}.bind(this))
				.catch(function (reason) {
					this.processError.call(this, reason, item);
				}.bind(this))
			;

			this.updateControls();

			this.lockScroll();
			this.adjustViewerHeight();
		},

		reload: function (item)
		{
			var isCurrentVisibleItem = this.getCurrentItem() === item;
			if (isCurrentVisibleItem)
			{
				this.show(this.currentIndex, true);
			}
		},

		reloadCurrentItem: function ()
		{
			return this.reload(this.getCurrentItem());
		},

		processShowItem: function(item)
		{
			BX.cleanNode(this.layout.items);
			// this.actionPanel.addItems(this.getCurrentItem().getActions());

			this.hideLoading();

			var contentWrapper = BX.create('div', {
				props: {
					className: 'ui-viewer-inner-content-wrapper'
				}
			});

			var fragment = document.createDocumentFragment();
			fragment.appendChild(item.render());

			var title = item.getTitle();
			if (title)
			{
				fragment.appendChild(BX.create('div', {
					props: {
						className: 'viewer-inner-caption'
					},
					text: title
				}));
			}

			contentWrapper.appendChild(fragment);
			this.layout.items.appendChild(contentWrapper);

			item.afterRender();
		},

		processError: function(reason, item)
		{
			this.hideCurrentItem();
			this.hideLoading();
			this.layout.container.appendChild(this.getErrorBlock());
		},

		hideErrorBlock: function()
		{
			if (this.layout.error)
			{
				BX.remove(this.layout.error);
			}
		},

		getErrorBlock: function(options)
		{
			options = options || {};

			var title = options.title || BX.message('JS_UI_VIEWER_DEFAULT_ERROR_TITLE');
			var description = options.description;

			this.layout.error =  BX.create('div', {
				props: {
					className: 'ui-viewer-error'
				},
				children: [
					BX.create('div', {
						props: {
							className: 'ui-viewer-error-title'
						},
						text: title
					}),
					BX.create('div', {
						props: {
							className: 'ui-viewer-error-text'
						},
						text: description
					})
				]
			});

			return this.layout.error;
		},

		refineActions: function (actions, item)
		{
			var defaultActions = {
				download: {
					id: 'download',
					type: 'download',
					text: BX.message('JS_UI_VIEWER_ITEM_ACTION_DOWNLOAD'),
					href: item.src,
					buttonIconClass: 'ui-btn-icon-download'
				},
				edit: {
					id: 'edit',
					type: 'edit',
					text: BX.message('JS_UI_VIEWER_ITEM_ACTION_EDIT'),
					buttonIconClass: 'ui-btn-icon-edit'
				},
				share: {
					id: 'share',
					type: 'share',
					text: BX.message('JS_UI_VIEWER_ITEM_ACTION_SHARE'),
					buttonIconClass: 'ui-btn-icon-share'
				},
				info: {
					id: 'info',
					type: 'info',
					text: '',
					buttonIconClass: 'ui-btn-icon-info ui-action-panel-item-last'
				},
				delete: {
					id: 'delete',
					type: 'delete',
					text: BX.message('JS_UI_VIEWER_ITEM_ACTION_DELETE'),
					buttonIconClass: 'ui-btn-icon-remove'
				}
			};

			return actions.map(function(action) {
				if (defaultActions[action.type])
				{
					action = BX.mergeEx(defaultActions[action.type], action)
				}

				if (BX.type.isString(action.action) && (typeof eval(action.action) === 'function'))
				{
					var fn = eval(action.action);
					action.onclick = function(event, panelItem) {
						fn.call(this, item, panelItem);
					};
				}

				return action;
			}, this);
		},

		getLoader: function(options)
		{
			if (!this.layout.loader)
			{
				this.layout.loader = BX.create('div', {
					props: {
						className: 'ui-viewer-loader'
					},
					children: [
						this.layout.loaderContainer = BX.create('div', {
							props: {
								className: 'ui-viewer-loader-container'
							}
						}),
						BX.create('div', {
							props: {
								className: 'ui-viewer-loader-text'
							},
							text: ''
						})
					]
				});

				var loader = new BX.Loader({size: 130});
				loader.show(this.layout.loaderContainer);
			}

			return this.layout.loader;
		},

		getPrevButton: function()
		{
			if (!this.layout.prev)
			{
				this.layout.prev = BX.create('div', {
					props: {
						className: 'ui-viewer-prev'
					}
				})
			}

			return this.layout.prev;
		},

		getNextButton: function()
		{
			if (!this.layout.next)
			{
				this.layout.next = BX.create('div', {
					props: {
						className: 'ui-viewer-next'
					}
				});
			}

			return this.layout.next;
		},
		
		getCloseButton: function()
		{
			if (!this.layout.close)
			{
				this.layout.close = BX.create('div', {
					props: {
						className: 'ui-viewer-close'
					},
					html: '<div class="ui-viewer-close-icon"></div>'
				});
			}

			return this.layout.close;
		},

		isOpen: function ()
		{
			return this._isOpen;
		},

		open: function(index)
		{
			document.body.appendChild(this.getViewerContainer());
			this.show(index);
			this.showPanel();

			this.bindEvents();

			this._isOpen = true;
		},

		getPanelWrapper: function()
		{
			if (!this.layout.panel)
			{
				this.layout.panel = BX.create('div', {
					props: {
						className: 'ui-viewer-panel'
					}
				});
			}

			return this.layout.panel;
		},

		showPanel: function()
		{
			this.actionPanel.layout.container.style.zIndex = '9999999';
			this.actionPanel.layout.container.style.background = 'none';
			this.actionPanel.layout.container.style.maxWidth = this.layout.inner.offsetWidth + 'px';

			this.actionPanel.draw();
			this.actionPanel.showPanel();
		},

		hideCurrentItem: function()
		{
			BX.cleanNode(this.layout.items);
		},

		updateControls: function()
		{
			if (this.currentIndex + 1 >= this.items.length)
			{
				BX.addClass(this.getNextButton(), 'ui-viewer-navigation-hide');
			}
			else
			{
				BX.removeClass(this.getNextButton(), 'ui-viewer-navigation-hide');
			}

			if (this.currentIndex === 0)
			{
				BX.addClass(this.getPrevButton(), 'ui-viewer-navigation-hide');
			}
			else
			{
				BX.removeClass(this.getPrevButton(), 'ui-viewer-navigation-hide');
			}
		},

		/**
		 * @return {BX.UI.Viewer.Item}
		 */
		getCurrentItem: function ()
		{
			return this.getItemByIndex(this.currentIndex);
		},

		/**
		 *
		 * @param index
		 * @returns BX.UI.Viewer.Item
		 */
		getItemByIndex: function (index)
		{
			index = parseInt(index, 10);

			BX.onCustomEvent('BX.UI.Viewer.Controller:onGetItemByIndex', [this, index]);

			if (index < 0 || (index - 1) > this.items.length)
			{
				return null;
			}

			return this.items[index];
		},

		showNext: function ()
		{
			this.show(this.currentIndex + 1);
		},

		showPrev: function ()
		{
			this.show(this.currentIndex - 1);
		},

		close: function ()
		{
			this._isOpen = false;

			BX.onCustomEvent('BX.UI.Viewer.Controller:onClose', [this]);

			this.layout.container.parentNode.removeChild(this.layout.container);
			this.actionPanel.hidePanel();
			this.unLockScroll();
			this.unbindEvents();

			// this.items = null;
			// this.currentIndex = null;
			// this.layout.container = null;
			// this.layout.close = null;
		},

		showLoading: function ()
		{
			this.layout.inner.appendChild(this.getLoader());
		},

		hideLoading: function ()
		{
			BX.remove(this.layout.loader);
		},

		lockScroll: function()
		{
			document.body.style.overflow = 'hidden';
		},

		unLockScroll: function()
		{
			document.body.style.overflow = null;
		},

		adjustViewerHeight: function()
		{
			if(!this.layout.container)
				return;

			this.layout.container.style.height = document.documentElement.clientHeight + 'px';
		},

		getViewerContainer: function()
		{
			if (!this.layout.container)
			{
				this.layout.container = BX.create('div', {
					props: {
						className: 'ui-viewer'
					},
					style: {
						zIndex: this.zIndex,
						height: window.clientHeight + 'px'
					},
					children: [
						this.layout.inner = BX.create('div', {
							props: {
								className: 'ui-viewer-inner'
							},
							children: [
								this.getItemListNode()
							]
						}),
						this.getCloseButton(),
						this.getPrevButton(),
						this.getNextButton(),
						this.getPanelWrapper()
					]
				});
			}

			return this.layout.container;
		},

		getItemListNode: function()
		{
			if (!this.layout.items)
			{
				this.layout.items = BX.create('div', {
					props: {
						className: 'ui-viewer-inner-content'
					}
				});
			}

			return this.layout.items
		},

		handleTouchStart: function(event)
		{
			var touchObject = event.changedTouches[0];
			this.swipeDirection = null;
			this.startX = touchObject.pageX;
			this.startY = touchObject.pageY;
			this.startTime = (new Date()).getTime();
			event.preventDefault();

		},

		handleTouchEnd: function(event)
		{
			var touchObject = event.changedTouches[0];
			var allowedTime = 300;
			var threshold = 80;
			var restraint = 100;
			var distanceX = touchObject.pageX - this.startX;
			var distanceY = touchObject.pageY - this.startY;
			var elapsedTime = (new Date()).getTime() - this.startTime;

			if (elapsedTime <= allowedTime)
			{
				if (Math.abs(distanceX) >= threshold && Math.abs(distanceY) <= restraint)
				{
					this.swipeDirection = (distanceX < 0) ? 'left' : 'right';
				}
				else if (Math.abs(distanceY) >= threshold && Math.abs(distanceX) <= restraint)
				{
					this.swipeDirection = (distanceY < 0) ? 'up' : 'down';
				}
			}

			switch (this.swipeDirection)
			{
				case 'up':
				case 'left':
					this.showPrev();
					break;
				case 'down':
				case 'right':
					this.showNext();
					break;
			}

			event.preventDefault();
		},

		handleKeyPress: function (event)
		{
			switch (event.code)
			{
				case 'Space':
				case 'ArrowRight':
				case 'PageDown':
				case 'ArrowDown':
					this.showNext();
					event.preventDefault();

					break;
				case 'ArrowLeft':
				case 'PageUp':
				case 'ArrowUp':
					this.showPrev();
					event.preventDefault();

					break;
				case 'Escape':
					this.close();
					event.preventDefault();

					break;
			}
		}
	};

	/**
	 * @param type
	 * @param {HTMLElement} node
	 * @return {BX.UI.Viewer.Item}
	 */
	BX.UI.Viewer.buildItemByTypeAndNode = function (type, node)
	{
		var item = new type();
		item.setPropertiesByNode(node);
		item.bindSourceNode(node);

		return item;
	};

	/**
	 * @param {HTMLElement} node
	 * @returns {BX.UI.Viewer.Item}
	 */
	BX.UI.Viewer.buildItemByNode = function (node)
	{
		if (!BX.type.isDomNode(node))
		{
			throw new Error("BX.UI.Viewer.buildItemByNode: 'node' has to be DomNode.");
		}

		var typeCode = node.dataset.viewerType;
		if (!typeCode)
		{
			if (node.tagName.toLowerCase() === 'img')
			{
				typeCode = 'image';
			}
		}

		switch (typeCode)
		{
			case 'image':
				return BX.UI.Viewer.buildItemByTypeAndNode(BX.UI.Viewer.Image, node);
			case 'plainText':
				return BX.UI.Viewer.buildItemByTypeAndNode(BX.UI.Viewer.PlainText, node);
			case 'unknown':
				return BX.UI.Viewer.buildItemByTypeAndNode(BX.UI.Viewer.Unknown, node);
			case 'video':
				return BX.UI.Viewer.buildItemByTypeAndNode(BX.UI.Viewer.Video, node);
			case 'document':
				return BX.UI.Viewer.buildItemByTypeAndNode(BX.UI.Viewer.Document, node);
		}
	};

	/**
	 * @param {HTMLElement} container
	 * @param filter
	 * @returns {BX.Promise}
	 */
	BX.UI.Viewer.bind = function (container, filter)
	{
		if (!BX.type.isDomNode(container))
		{
			throw new Error("BX.UI.Viewer.bind: 'container' has to be DomNode.");
		}
		if (!BX.type.isPlainObject(filter) && !BX.type.isFunction(filter))
		{
			filter = function(node) {
				return BX.type.isElementNode(node) && node.dataset.hasOwnProperty('viewer');
			};
		}

		BX.bindDelegate(container, 'click', filter, function(event) {
			var viewer = new BX.UI.Viewer.Controller({});
			var nodes = BX.findChildren(container, filter, true);
			var indexToShow = 0;
			var targetNode = BX.getEventTarget(event);

			var items = nodes.map(function(node, index) {
				if (node === targetNode)
				{
					indexToShow = index;
				}
				return BX.UI.Viewer.buildItemByNode(node);
			});

			viewer.setItems(items);
			viewer.open(indexToShow);

			event.preventDefault();
		});
	};


	var instance = null;
	/**
	 * @memberOf BX.UI.Viewer
	 * @name BX.UI.Viewer#Instance
	 * @type BX.UI.Viewer.Controller
	 * @static
	 * @readonly
	 */
	Object.defineProperty(BX.UI.Viewer, 'Instance', {
		enumerable: false,
		get: function()
		{
			if (window.top !== window && BX.getClass('window.top.BX.UI.Viewer.Instance'))
			{
				return window.top.BX.UI.Viewer.Instance;
			}

			if (instance === null)
			{
				instance = new BX.UI.Viewer.Controller({});
			}

			return instance;
		}
	});

	window.document.addEventListener('click', function(event){
		if (window.top !== window && !BX.getClass('window.top.BX.UI.Viewer.Instance'))
		{
			window.top.BX.loadExt('ui.viewer').then(function () {
				top.BX.UI.Viewer.Instance.handleDocumentClick(event);
			});
		}
		else
		{
			top.BX.UI.Viewer.Instance.handleDocumentClick(event);
		}
	}, true);

	//try to load ui.viewer to the top window if there is no viewer.
	if (window.top !== window && !BX.getClass('window.top.BX.UI.Viewer.Instance'))
	{
		window.top.BX.loadExt('ui.viewer');
	}
})();