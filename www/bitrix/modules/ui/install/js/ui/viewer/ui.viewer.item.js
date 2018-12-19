;(function () {

	'use strict';

	BX.namespace('BX.UI.Viewer');

	BX.UI.Viewer.Item = function(options)
	{
		options = options || {};

		this.controller = null;
		this.title = options.title;
		this.src = options.src;
		this.actions = options.actions;
		this.contentType = options.contentType;
		this.isLoaded = false;
		this.isLoading = false;
		this.sourceNode = null;
		this.layout = {
			container: null
		};

		this.init();
	};

	BX.UI.Viewer.Item.prototype =
	{
		setController: function (controller)
		{
			if (!(controller instanceof BX.UI.Viewer.Controller))
			{
				throw new Error("BX.UI.Viewer.Item: 'controller' has to be instance of BX.UI.Viewer.Controller.");
			}

			this.controller = controller;
		},

		/**
		 * @param {HTMLElement} node
		 */
		setPropertiesByNode: function (node)
		{
			this.title = node.dataset.title || node.title || node.alt;
			this.src = node.dataset.src;
			this.actions = node.dataset.actions? JSON.parse(node.dataset.actions) : undefined;
		},

		/**
		 * @param {HTMLElement} node
		 */
		bindSourceNode: function (node)
		{
			this.sourceNode = node;
		},

		init: function ()
		{},

		reload: function ()
		{
			this.isLoaded = false;
			this.isLoading = false;

			return this.load();
		},

		load: function ()
		{
			var promise = new BX.Promise();

			if (this.isLoaded)
			{
				promise.fulfill(this);

				return promise;
			}
			if (this.isLoading)
			{
				return this._loadPromise;
			}

			this.isLoading = true;
			this._loadPromise = this.loadData().then(function(item){
				this.isLoaded = true;
				this.isLoading = false;

				return item;
			}.bind(this)).catch(function (reason) {
				this.isLoaded = false;
				this.isLoading = false;

				var promise = new BX.Promise();
				promise.reject(reason);

				return promise;
			}.bind(this));

			return this._loadPromise;
		},

		getTitle: function()
		{
			return this.title;
		},

		getActions: function()
		{
			if (typeof this.actions === 'undefined')
			{
				return [{
					type: 'download'
				}];
			}

			return this.actions;
		},

		/**
		 * @returns {BX.Promise}
		 */
		loadData: function ()
		{
			var promise = new BX.Promise();
			promise.setAutoResolve(true);
			promise.fulfill(this);

			return promise;
		},

		render: function ()
		{},

		afterRender: function ()
		{}
	};

	/**
	 * @extends {BX.UI.Viewer.Item}
	 * @param options
	 * @constructor
	 */
	BX.UI.Viewer.Image = function (options)
	{
		options = options || {};

		BX.UI.Viewer.Item.apply(this, arguments);

		this.resizedSrc = options.resizedSrc;
		this.width = options.width;
		this.height = options.height;
		this.imageNode = null;
		this.layout = {
			container: null
		}
	};

	BX.UI.Viewer.Image.prototype =
	{
		__proto__: BX.UI.Viewer.Item.prototype,
		constructor: BX.UI.Viewer.Item,

		/**
		 * @param {HTMLElement} node
		 */
		setPropertiesByNode: function (node)
		{
			BX.UI.Viewer.Item.prototype.setPropertiesByNode.apply(this, arguments);

			this.resizedSrc = node.src;
			this.src = node.dataset.src || node.src;
			this.width = node.dataset.width;
			this.height = node.dataset.height;
		},

		loadData: function ()
		{
			var promise = new BX.Promise();

			if (!this.resizedSrc)
			{
				var xhr = new XMLHttpRequest();
				xhr.responseType = 'blob';
				xhr.onreadystatechange = function () {
					if(xhr.readyState !== XMLHttpRequest.DONE)
					{
						return;
					}
					if ((xhr.status === 200 || xhr.status === 0) && xhr.response)
					{
						this.resizedSrc = URL.createObjectURL(xhr.response);
						this.imageNode = new Image();
						this.imageNode.src = this.resizedSrc;

						promise.fulfill(this);
					}
					else
					{
						promise.reject({
							item: this,
							type: 'error'
						});
					}

				}.bind(this);
				xhr.open('GET', BX.util.add_url_param(this.src, {ts: 'bxviewer'}), true);
				xhr.setRequestHeader('BX-Viewer-image', 'x');
				xhr.send();
			}
			else
			{
				this.imageNode = new Image();
				this.imageNode.onload = function () {
					promise.fulfill(this);
				}.bind(this);
				this.imageNode.onerror = this.imageNode.onabort = function (event) {
					promise.reject({
						item: this,
						type: 'error'
					});
				}.bind(this);

				this.imageNode.src = this.resizedSrc;
			}

			return promise;
		},

		render: function ()
		{
			var item = document.createDocumentFragment();

			item.appendChild(this.imageNode);

			if (this.title)
			{
				item.appendChild(BX.create('div', {
					props: {
						className: 'viewer-inner-fullsize'
					},
					children: [
						BX.create('a', {
							props: {
								href: BX.util.add_url_param(this.src, {ts: 'bxviewer', ibxShowImage: 1}),
								target: '_blank'
							},
							text: BX.message('JS_UI_VIEWER_IMAGE_VIEW_FULL_SIZE')
						})
					]
				}));
			}

			this.imageNode.alt = this.title;

			return item;
		}
	};


	/**
	 * @extends {BX.UI.Viewer.Item}
	 * @param options
	 * @constructor
	 */
	BX.UI.Viewer.PlainText = function (options)
	{
		options = options || {};

		BX.UI.Viewer.Item.apply(this, arguments);

		this.content = options.content;
	};

	BX.UI.Viewer.PlainText.prototype =
	{
		__proto__: BX.UI.Viewer.Item.prototype,
		constructor: BX.UI.Viewer.Item,

		/**
		 * @param {HTMLElement} node
		 */
		setPropertiesByNode: function (node)
		{
			BX.UI.Viewer.Item.prototype.setPropertiesByNode.apply(this, arguments);

			this.content = node.dataset.content;
		},

		render: function ()
		{
			var contentNode = BX.create('span', {
				text: this.content
			});

			contentNode.style.fontSize = '18px';
			contentNode.style.color = 'white';

			return contentNode;
		}
	};

	/**
	 * @extends {BX.UI.Viewer.PlainText}
	 * @param options
	 * @constructor
	 */
	BX.UI.Viewer.Unknown = function (options)
	{
		options = options || {};

		BX.UI.Viewer.Item.apply(this, arguments);
	};

	BX.UI.Viewer.Unknown.prototype =
	{
		__proto__: BX.UI.Viewer.PlainText.prototype,
		constructor: BX.UI.Viewer.PlainText,

		/**
		 * @param {HTMLElement} node
		 */
		setPropertiesByNode: function (node)
		{
			BX.UI.Viewer.Item.prototype.setPropertiesByNode.apply(this, arguments);

			this.content = 'Unknown type';
		}
	};

	/**
	 * @extends {BX.UI.Viewer.Item}
	 * @param options
	 * @constructor
	 */
	BX.UI.Viewer.Video = function (options)
	{
		options = options || {};

		BX.UI.Viewer.Item.apply(this, arguments);

		this.player = null;
		if (this.src)
		{
			this.playerId = 'playerId_' + this.hashCode(this.src) + (Math.floor(Math.random() * Math.floor(10000)));
		}
		this.sources = [];
		this.transFormationPromise = null;
	};

	BX.UI.Viewer.Video.prototype =
	{
		__proto__: BX.UI.Viewer.Item.prototype,
		constructor: BX.UI.Viewer.Item,

		/**
		 * @param {HTMLElement} node
		 */
		setPropertiesByNode: function (node)
		{
			BX.UI.Viewer.Item.prototype.setPropertiesByNode.apply(this, arguments);

			this.playerId = 'playerId_' + this.hashCode(this.src) + (Math.floor(Math.random() * Math.floor(10000)));
		},

		hashCode: function (string)
		{
			var h = 0, l = string.length, i = 0;
			if (l > 0)
			{
				while (i < l)
					h = (h << 5) - h + string.charCodeAt(i++) | 0;
			}
			return h;
		},

		init: function () 
		{
			BX.addCustomEvent('onPullEvent', function (moduleId, command, params) {
				if (moduleId === 'main' && command === 'transformationComplete')
				{
					if (this.transFormationPromise)
					{
						this.loadData().then(function(){
							this.transFormationPromise.fulfill(this);
						}.bind(this));
					}
				}
			}.bind(this));

			BX.addCustomEvent('PlayerManager.Player:onAfterInit', function(player)
			{
				if (player.id !== this.playerId)
				{
					return;
				}

				if (player.vjsPlayer.error())
				{
					console.log('forceTransformation');
					this.forceTransformation = true;
					this.controller.reload(this);
				}

			}.bind(this));
		},

		loadData: function ()
		{
			var promise = new BX.Promise();

			var headers = [
				{
					name: 'BX-Viewer-src',
					value: this.src
				}
			];

			headers.push({
				name: this.forceTransformation? 'BX-Viewer-force-transformation' : 'BX-Viewer',
				value: 'video'
			});

			var ajaxPromise = BX.ajax.promise({
				url: BX.util.add_url_param(this.src, {ts: 'bxviewer'}),
				method: 'GET',
				dataType: 'json',
				headers: headers
			});

			ajaxPromise.then(function (response) {
				if (!response || !response.data)
				{
					promise.reject({
						item: this,
						type: 'error'
					});

					return;
				}

				if(response.data.pullTag)
				{
					BX.PULL.extendWatch(response.data.pullTag);
					this.transFormationPromise = promise;
				}
				else
				{
					if (response.data.data)
					{
						this.width = response.data.data.width;
						this.height = response.data.data.height;
						this.sources = response.data.data.sources;
					}

					if (response.data.html)
					{
						var html = BX.processHTML(response.data.html);

						BX.load(html.STYLE, function(){
							BX.ajax.processScripts(html.SCRIPT, undefined, function(){
								promise.fulfill(this);
							}.bind(this));
						}.bind(this));
					}
				}
			}.bind(this));

			return promise;
		},

		render: function ()
		{
			this.player = new BX.Fileman.Player(this.playerId, {
				width: this.width,
				height: this.height,
				sources: this.sources
			});

			return this.player.createElement();
		},

		afterRender: function()
		{
			this.player.init();
		}
	};

	/**
	 * @extends {BX.UI.Viewer.Item}
	 * @param options
	 * @constructor
	 */
	BX.UI.Viewer.Document = function (options)
	{
		BX.UI.Viewer.Item.apply(this, arguments);
		this.contentNode = null;
		this.previewHtml = null;
		this.previewScriptToProcess = null;
		this.transFormationPromise = null;
	};

	BX.UI.Viewer.Document.prototype =
	{
		__proto__: BX.UI.Viewer.Item.prototype,
		constructor: BX.UI.Viewer.Item,

		/**
		 * @param {HTMLElement} node
		 */
		setPropertiesByNode: function (node)
		{
			BX.UI.Viewer.Item.prototype.setPropertiesByNode.apply(this, arguments);
		},

		init: function()
		{
			BX.addCustomEvent('onPullEvent', function (moduleId, command, params) {
				if (moduleId === 'main' && command === 'transformationComplete')
				{
					if (this.transFormationPromise)
					{
						this.loadData().then(function(){
							this.transFormationPromise.fulfill(this);
						}.bind(this));
					}
				}
			}.bind(this));

		},

		loadData: function ()
		{
			var promise = new BX.Promise();
			if (this.previewHtml)
			{
				this.processPreviewHtml(this.previewHtml);
				promise.fulfill(this);

				return promise;
			}

			var ajaxPromise = BX.ajax.promise({
				url: BX.util.add_url_param(this.src, {ts: 'bxviewer'}),
				method: 'GET',
				dataType: 'json',
				headers: [
					{
						name: 'BX-Viewer-src',
						value: this.src
					},
					{
						name: 'BX-Viewer',
						value: 'document'
					}
				]
			});

			ajaxPromise.then(function (response) {
				if (!response || !response.data)
				{
					promise.reject({
						item: this,
						type: 'error'
					});

					return;
				}

				if(response.data.pullTag)
				{
					BX.PULL.extendWatch(response.data.pullTag);
					this.transFormationPromise = promise;
				}

				if(response.data.html)
				{
					this.previewHtml = response.data.html;
					this.processPreviewHtml(response.data.html);
					promise.fulfill(this);
				}
			}.bind(this));

			return promise;
		},

		processPreviewHtml: function (previewHtml)
		{
			var html = BX.processHTML(previewHtml);

			if (!this.contentNode)
			{
				this.contentNode = BX.create('div', {
					html: html.HTML
				});
			}

			if (!!html.SCRIPT)
			{
				this.previewScriptToProcess = html.SCRIPT;
			}
		},

		render: function ()
		{
			return this.contentNode;
		},

		afterRender: function ()
		{
			if (this.previewScriptToProcess)
			{
				BX.ajax.processScripts(this.previewScriptToProcess);
			}
		}
	};

})();