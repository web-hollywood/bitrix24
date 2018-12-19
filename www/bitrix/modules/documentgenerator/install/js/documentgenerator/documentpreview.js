;(function(){
	"use strict";

	BX.namespace('BX.DocumentGenerator');

	if (typeof BX.DocumentGenerator.DocumentPreview !== "undefined")
	{
		return;
	}

	var isPushEventInited = false;

	BX.DocumentGenerator.DocumentPreview = function(options)
	{
		this.loader = null;
		this.documentId = null;
		this.pullTag = null;
		this.startImageUrl = null;
		this.imageUrl = null;
		this.imageContainer = null;
		this.imageNode = null;
		this.printUrl = null;
		this.pdfUrl = null;
		this.isTransformationError = false;
		this.transformationErrorNode = null;
		this.previewNode = null;
		this.onReady = BX.DoNothing;
		this.applyOptions(options);
		this.initPushEvent();
		this.start();
	};

	BX.DocumentGenerator.DocumentPreview.prototype = {};

	BX.DocumentGenerator.DocumentPreview.prototype.isPullConnected = function()
	{
		if(top.BX.PULL)
		{
			// pull_v2
			if(BX.type.isFunction(top.BX.PULL.isConnected))
			{
				return top.BX.PULL.isConnected();
			}
			else
			{
				var debugInfo = top.BX.PULL.getDebugInfoArray();
				return debugInfo.connected;
			}
		}

		return false;
	};

	BX.DocumentGenerator.DocumentPreview.prototype.initPushEvent = function()
	{
		if(!isPushEventInited)
		{
			if(this.isPullConnected())
			{
				isPushEventInited = true;
				top.BX.addCustomEvent("onPullEvent-documentgenerator", BX.proxy(this.showImage, this));
			}
			else if(this.documentId > 0 && !this.imageUrl)
			{
				isPushEventInited = true;
				setTimeout(BX.proxy(function(){
					BX.ajax.runAction('documentgenerator.api.document.get', {
						data: {
							documentId: this.documentId
						}
					}).then(BX.proxy(function(response){
						isPushEventInited = false;
						if(response.data.document.imageUrl)
						{
							this.showImage('showImage', response.data.document);
						}
						else
						{
							this.initPushEvent();
						}
					}, this), function()
					{
						isPushEventInited = false;
					});
				}, this), 5000);
			}
		}
	};

	BX.DocumentGenerator.DocumentPreview.prototype.applyOptions = function(options)
	{
		if(options.id)
		{
			this.documentId = options.id;
		}
		if(options.pullTag)
		{
			this.pullTag = options.pullTag;
		}
		if(options.imageUrl)
		{
			this.imageUrl = options.imageUrl;
		}
		if(options.startImageUrl)
		{
			this.startImageUrl = options.startImageUrl;
		}
		if(options.printUrl)
		{
			this.printUrl = options.printUrl;
		}
		if(options.pdfUrl)
		{
			this.pdfUrl = options.pdfUrl;
		}
		if(options.emailDiskFile)
		{
			this.emailDiskFile = options.emailDiskFile;
		}
		if(BX.type.isDomNode(options.imageContainer))
		{
			this.imageContainer = options.imageContainer;
		}
		if(BX.type.isDomNode(options.previewNode))
		{
			this.previewNode = options.previewNode;
		}
		if(BX.type.isDomNode(options.transformationErrorNode))
		{
			this.transformationErrorNode = options.transformationErrorNode;
		}
		if(BX.type.isBoolean(options.isTransformationError))
		{
			this.isTransformationError = options.isTransformationError;
		}
		if(BX.type.isFunction(options.onReady))
		{
			this.onReady = options.onReady;
		}
		this.initPushEvent();
	};

	BX.DocumentGenerator.DocumentPreview.prototype.getLoader = function()
	{
		if(!this.loader)
		{
			this.loader = new BX.Loader({size: 100, offset: {left: "-8%", top: "6%"}});
		}

		return this.loader;
	};

	BX.DocumentGenerator.DocumentPreview.prototype.showLoader = function()
	{
		if(this.imageContainer)
		{
			if(!this.getLoader().isShown())
			{
				this.getLoader().show(this.imageContainer);
			}
		}
		if(BX.type.isDomNode(this.imageNode))
		{
			this.imageNode.style.opacity = 0.5;
		}
	};

	BX.DocumentGenerator.DocumentPreview.prototype.hideLoader = function()
	{
		if(this.getLoader().isShown())
		{
			this.getLoader().hide();
		}
		if(BX.type.isDomNode(this.imageNode))
		{
			this.imageNode.style.opacity = 1;
		}
	};

	BX.DocumentGenerator.DocumentPreview.prototype.isValidPullTag = function(command, params)
	{
		return(command === 'showImage' && params['pullTag'] === this.pullTag)
	};

	BX.DocumentGenerator.DocumentPreview.prototype.showImage = function(command, params)
	{
		if(this.isValidPullTag(command, params))
		{
			this.applyOptions(params);
			if(BX.type.isDomNode(this.previewNode))
			{
				BX.hide(this.previewNode);
			}
			if(BX.type.isDomNode(this.transformationErrorNode))
			{
				if(this.isTransformationError)
				{
					BX.show(this.transformationErrorNode);
				}
				else
				{
					BX.hide(this.transformationErrorNode);
				}
			}
			this.showImageNode();
			this.onReady(params);
			this.hideLoader();
		}
	};

	BX.DocumentGenerator.DocumentPreview.prototype.start = function()
	{
		if(this.imageUrl)
		{
			this.showImageNode();
		}
		else if(this.startImageUrl)
		{
			this.imageUrl = this.startImageUrl;
			this.startImageUrl = null;
			this.showImageNode();
			if(BX.type.isDomNode(this.imageNode))
			{
				this.imageNode.style.opacity = 0.2;
			}
			if(this.pullTag)
			{
				this.showLoader();
			}
		}
		else if(!this.isTransformationError && !this.previewNode)
		{
			this.showLoader();
		}
	};

	BX.DocumentGenerator.DocumentPreview.prototype.showImageNode = function()
	{
		if(!BX.type.isDomNode(this.imageContainer))
		{
			return;
		}
		if(!BX.type.isDomNode(this.imageNode))
		{
			this.imageNode = BX.create('img', {
				style: {
					opacity: 0.1,
					display: 'none'
				}
			});
			BX.append(this.imageNode, this.imageContainer);
		}
		if(this.imageUrl)
		{
			this.imageNode.src = this.imageUrl;
			BX.show(this.imageNode);
			this.imageNode.style.opacity = 1;
		}
	};

	BX.DocumentGenerator.Document = {
		isProcessing: false
	};

	BX.DocumentGenerator.Document.onBeforeCreate = function(viewUrl, params, loaderPath)
	{
		// todo delete it later - for back compatibility
		if(BX.type.isNotEmptyObject(params) && params.hasOwnProperty('checkNumber') && params.checkNumber)
		{
			var urlParams = BX.DocumentGenerator.parseUrl(viewUrl, 'params');
			if(!urlParams.hasOwnProperty('documentId'))
			{
				if(BX.DocumentGenerator.Document.isProcessing === true)
				{
					return;
				}
				BX.DocumentGenerator.Document.isProcessing = true;
				var provider = decodeURIComponent(urlParams.providerClassName).toLowerCase().replace(/\\/g, '\\\\');
				BX.ajax.runAction('documentgenerator.api.document.list', {
					data: {
						select: ['id', 'number'],
						filter: {
							provider: provider,
							templateId: urlParams.templateId,
							value: urlParams.value
						},
						order: {id: 'desc'}
					},
					navigation: {
						size: 1
					}
				}).then(function(response)
				{
					BX.DocumentGenerator.Document.isProcessing = false;
					if(response.data.documents.length > 0)
					{
						var previousNumber = response.data.documents[0].number;
						BX.DocumentGenerator.showMessage(BX.message('DOCGEN_POPUP_USE_OLD_NUMBER'), [
							new BX.PopupWindowButton({
								text : BX.message('DOCGEN_POPUP_NEW_BUTTON'),
								className : "ui-btn ui-btn-md ui-btn-primary",
								events : { click : function()
									{
										BX.DocumentGenerator.openUrl(viewUrl, loaderPath);
										this.popupWindow.close();
									}}
							}),
							new BX.PopupWindowButton({
								text : BX.message('DOCGEN_POPUP_OLD_BUTTON'),
								className : "ui-btn ui-btn-md ui-btn-primary",
								events : { click : function()
									{
										viewUrl = BX.util.add_url_param(viewUrl, {number: previousNumber});
										BX.DocumentGenerator.openUrl(viewUrl, loaderPath);
										this.popupWindow.close();
									}}
							})
						], BX.message('DOCGEN_POPUP_NUMBER_TITLE'));
					}
					else
					{
						BX.DocumentGenerator.openUrl(viewUrl, loaderPath);
					}

				}).then(function()
				{
					BX.DocumentGenerator.Document.isProcessing = false;
					BX.DocumentGenerator.openUrl(viewUrl, loaderPath);
				});
			}
		}
		else
		{
			BX.DocumentGenerator.openUrl(viewUrl, loaderPath);
		}
	};

	BX.DocumentGenerator.Feedback =
	{
		open: function(provider, templateName, templateCode)
		{
			var url = '/bitrix/components/bitrix/documentgenerator.feedback/slider.php';
			url = BX.util.add_url_param(url, {
				provider: provider || '',
				templateName: templateName || '',
				templateCode: templateCode || ''
			});
			if(BX.SidePanel)
			{
				BX.SidePanel.Instance.open(url, {width: 735});
			}
			else
			{
				location.href = url;
			}
		}
	};

	BX.DocumentGenerator.parseUrl = function(url, key)
	{
		var parser = document.createElement('a'),
			params = {},
			queries, split, i;
		parser.href = url;
		queries = parser.search.replace(/^\?/, '').split('&');
		for( i = 0; i < queries.length; i++ ) {
			split = queries[i].split('=');
			params[split[0]] = split[1];
		}
		var result = {
			protocol: parser.protocol,
			host: parser.host,
			hostname: parser.hostname,
			port: parser.port,
			pathname: parser.pathname,
			search: parser.search,
			params: params,
			hash: parser.hash
		};

		if(key && result.hasOwnProperty(key))
		{
			return result[key];
		}

		return result;
	};

	BX.DocumentGenerator.openUrl = function(viewUrl, loaderPath, width)
	{
		if(BX.SidePanel)
		{
			if(!BX.type.isNumber(width))
			{
				width = 980;
			}
			BX.SidePanel.Instance.open(viewUrl, {width: width, cacheable: false, loader: loaderPath});
			var menu = BX.PopupMenu.getCurrentMenu();
			if(menu && menu.popupWindow)
			{
				menu.popupWindow.close();
			}
		}
		else
		{
			location.href = viewUrl;
		}
	};

	BX.DocumentGenerator.showMessage = function(content, buttons, title)
	{
		title = title || '';
		if (typeof(buttons) === "undefined" || typeof(buttons) === "object" && buttons.length <= 0)
		{
			buttons = [new BX.PopupWindowButton({
				text : BX.message('DOCGEN_POPUP_CLOSE_BUTTON'),
				className : "ui-btn ui-btn-md ui-btn-default",
				events : { click : function(e) { this.popupWindow.close(); BX.PreventDefault(e) } }
			})];
		}
		if(this.popupConfirm != null)
		{
			this.popupConfirm.destroy();
		}
		this.popupConfirm = new BX.PopupWindow('bx-popup-documentgenerator-popup', null, {
			zIndex: 200,
			autoHide: true,
			closeByEsc: true,
			buttons: buttons,
			closeIcon: true,
			overlay : true,
			events : { onPopupClose : function() { this.destroy() }, onPopupDestroy : BX.delegate(function() { this.popupConfirm = null }, this)},
			content : BX.create('span',{
				attrs:{className:'bx-popup-documentgenerator-popup-content-text'},
				children : content
			}),
			titleBar: title,
			contentColor: 'white',
			className : 'bx-popup-documentgenerator-popup',
			maxWidth: 470
		});
		this.popupConfirm.show();


	}

})(window);