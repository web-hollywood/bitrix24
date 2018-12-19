(function() {

"use strict";

BX.namespace("BX.Bitrix24");

BX.Bitrix24.Slider = {

	defaultOptions: {
		panelStylezIndex: 3200,
		imBarStylezIndex: 3200,
		headerStylezIndex: 3200,
		typeLoader: "default-loader"
	},

	anchorRules: [],
	openPages: [],
	lastPage: null,

	/**
	 * White list for checking links (for method this.extractLinkFromEvent()). 
	 * Format elements: string or RegExp
	 */
	whiteListLink: [
		/(http|https):\/\/helpdesk\.bitrix24\.([a-zA-Z]{2,3})\/open\/([a-zA-Z0-9_|]+)/ig
	],

	init: function()
	{
		if (this.inited)
		{
			return;
		}

		this.isOpen = false;
		this.hidden = false;
		this.inited = true;
		this.eventsBound = false;
		this.hacksApplied = false;

		BX.addCustomEvent("BX.Bitrix24.PageSlider:close", this.close.bind(this));
		BX.addCustomEvent("Bitrix24.Slider:close", this.close.bind(this));
		BX.addCustomEvent("Bitrix24.Slider:closeAll", this.close.bind(this));
		BX.addCustomEvent("Bitrix24.Slider:postMessage", this.onPostMessage.bind(this));
		BX.addCustomEvent("BX.Bitrix24.Map:onBeforeOpen", this.closeAll.bind(this, true));
	},

	/**
	 *
	 * @param {string} url
	 * @param {object} [options]
	 */
	open: function(url, options)
	{
		if (!BX.type.isNotEmptyString(url))
		{
			return;
		}

		url = BX.util.remove_url_param(url, ["IFRAME", "IFRAME_TYPE"]);

		var currentPage = this.getCurrentPage();
		if (currentPage && currentPage.isVisible() && currentPage.getUrl() === url)
		{
			return;
		}

		options = BX.type.isPlainObject(options) ? options : {};
		this.options = BX.mergeEx({}, this.defaultOptions, options);

		if (this.isHidden())
		{
			this.unhide();
		}

		if (!this.isOpen)
		{
			this.init();
			this.applyHacks();
			this.bindEvents();
		}

		var lastPage = this.getLastOpenPage();
		if (lastPage && lastPage.getUrl() === url)
		{
			if (currentPage)
			{
				currentPage.hideCLoseBtn();
			}

			this.addPage(lastPage);
			lastPage.open();
			this.resetLastOpenPage();
		}
		else
		{
			var page = new BX.Bitrix24.SliderPage(url, options);
			page.setZindex(page.getZindex() + this.getOpenPagesCount() * 3);

			var offset = Math.min(this.getOpenPagesCount(), 3) * 63;
			page.setOffset(offset);

			if (currentPage)
			{
				currentPage.hideCLoseBtn();
			}

			this.addPage(page);
			page.open();

			this.resetLastOpenPage();
		}

		if (BX.type.isDomNode(document.activeElement))
		{
			document.activeElement.blur();
		}

		this.isOpen = true;
	},

	close: function(immediately, callback)
	{
		var currentPage = this.getCurrentPage();
		if (currentPage)
		{
			currentPage.close(immediately, callback);
		}
	},

	closeAll: function(immediately)
	{
		var openPages = this.getOpenPages();
		for (var i = openPages.length - 1; i >= 0; i--)
		{
			var page = openPages[i];
			page.close(immediately);
		}
	},

	hide: function()
	{
		if (this.hidden)
		{
			return false;
		}

		this.getOpenPages().forEach(function(page) {
			page.hide();
		});

		this.hidden = true;

		this.resetHacks();
		this.unbindEvents();

		return true;
	},

	unhide: function()
	{
		if (!this.hidden)
		{
			return false;
		}

		this.getOpenPages().forEach(function(page) {
			page.unhide();
		});

		this.hidden = false;

		setTimeout(function() {
			this.applyHacks();
			this.bindEvents();
		}.bind(this), 0);

		return true;
	},

	destroy: function(url)
	{
		if (!BX.type.isNotEmptyString(url))
		{
			return;
		}

		url = BX.util.remove_url_param(url, ['IFRAME', 'IFRAME_TYPE']);

		var pageIndex = -1;

		for (var i = 0; i < this.openPages.length; i++)
		{
			var page = this.openPages[i];
			if (pageIndex === -1 && page.getUrl() === url)
			{
				pageIndex = i;
			}

			if (pageIndex > -1)
			{
				page.destroy();
			}
		}

		if (pageIndex > -1)
		{
			this.openPages.splice(pageIndex, this.openPages.length - pageIndex);
		}

		if (this.lastOpenPage && (pageIndex > -1 || this.lastOpenPage.getUrl() === url))
		{
			this.lastOpenPage.destroy();
			this.lastOpenPage = null;
		}

		if (!this.getOpenPagesCount())
		{
			this.resetHacks();
			this.unbindEvents();
			this.isOpen = false;
		}
	},

	isHidden: function()
	{
		return this.hidden;
	},

	onPageClose: function()
	{
		var page = this.removeOpenPage();

		var currentPage = this.getCurrentPage();
		if (currentPage)
		{
			currentPage.showCloseBtn();
		}

		if (!this.getOpenPagesCount())
		{
			this.resetHacks();
			this.unbindEvents();
			this.isOpen = false;
		}

		this.setLastOpenPage(page);
	},

	onPostMessage: function(sender, data)
	{
		var url = null;
		if (BX.type.isNotEmptyString(sender))
		{
			url = sender;
		}
		else if (sender && sender.location)
		{
			var location = sender.location;
			url = location.pathname + location.search + location.hash;
			url = BX.util.remove_url_param(url, ["IFRAME", "IFRAME_TYPE"]);
		}

		if (!url)
		{
			return;
		}

		var openPages = this.getOpenPages();
		for (var i = openPages.length - 1; i >= 0; i--)
		{
			var page = openPages[i];
			if (page.getUrl() === url)
			{
				var prevPage = openPages[i - 1];
				(prevPage && prevPage.getWindow() || window).BX.onCustomEvent("Bitrix24.Slider:onMessage", [page, data]);
				break;
			}
		}
	},

	/**
	 *
	 * @returns {BX.Bitrix24.SliderPage}
	 */
	getCurrentPage: function()
	{
		var count = this.openPages.length;
		return this.openPages[count - 1] ? this.openPages[count - 1] : null;
	},

	/**
	 *
	 * @param {BX.Bitrix24.SliderPage} page
	 *
	 */
	setLastOpenPage: function(page)
	{
		if (this.lastOpenPage !== page)
		{
			if (this.lastOpenPage)
			{
				this.lastOpenPage.destroy();
			}

			this.lastOpenPage = page;
		}
	},

	resetLastOpenPage: function()
	{
		if (this.lastOpenPage && this.getCurrentPage() !== this.lastOpenPage)
		{
			this.lastOpenPage.destroy();
		}

		this.lastOpenPage = null;
	},

	getLastOpenPage: function()
	{
		return this.lastOpenPage;
	},

	/**
	 *
	 * @returns {BX.Bitrix24.SliderPage[]}
	 */
	getOpenPages: function()
	{
		return this.openPages;
	},

	/**
	 *
	 * @returns {Number}
	 */
	getOpenPagesCount: function()
	{
		return this.openPages.length;
	},

	/**
	 *
	 * @param {BX.Bitrix24.SliderPage} page
	 */
	addPage: function(page)
	{
		if (!page instanceof BX.Bitrix24.SliderPage)
		{
			throw new Error("Page is not an instance of BX.Bitrix24.SliderPage");
		}

		page.setSlider(this);
		this.openPages.push(page);
	},

	removeOpenPage: function()
	{
		if (this.getOpenPagesCount())
		{
			var pages = this.openPages.splice(this.openPages.length - 1, 1);
			return pages[0];
		}
	},

	getLoaderId: function(url)
	{
		var loader = this.options.typeLoader;
		var rule = this.getUrlRule(url);
		if (rule && BX.type.isNotEmptyString(rule.loader))
		{
			loader = rule.loader;
		}

		return loader;
	},

	getPanel: function()
	{
		return BX("bx-panel", true);
	},

	getHeader: function()
	{
		return BX("header", true);
	},

	getImBar: function()
	{
		return BX("bx-im-bar", true);
	},

	applyHacks: function()
	{
		if (this.hacksApplied)
		{
			return false;
		}

		this.hacksApplied = true;

		if (BX.MessengerWindow)
		{
			BX.MessengerWindow.closePopup();
		}
		else
		{
			BXIM.closeMessenger();
		}

		var scrollWidth = window.innerWidth - document.documentElement.clientWidth;
		document.body.style.paddingRight = scrollWidth + "px";
		document.body.style.overflow = "hidden";

		this.getHeader().style.paddingRight = scrollWidth + "px";
		this.getHeader().style.marginRight = "-" + scrollWidth + "px";
		this.getHeader().style.zIndex = this.options.headerStylezIndex;

		if (this.getImBar())
		{
			this.getImBar().style.zIndex = this.options.imBarStylezIndex;
			this.getImBar().style.width = this.getImBar().offsetWidth + scrollWidth - 1 + "px";

			var pos = BX.pos(this.getImBar());
			this.getImBar().style.position = "absolute";
			this.getImBar().originalTop = this.getImBar().style.top;
			this.getImBar().style.top = pos.top + "px";
			this.getImBar().style.height = pos.height + "px";
		}

		if (this.getPanel())
		{
			this.getPanel().style.zIndex = this.options.panelStylezIndex;
			this.getPanel().style.cssText += "margin-right: -" + scrollWidth + "px !important";

			BX("bx-panel-userinfo").style.cssText += "padding-right:" + scrollWidth + "px !important";
			BX("bx-panel-site-toolbar").style.cssText += "padding-right:" + scrollWidth + "px !important";
		}

		return true;
	},

	resetHacks: function()
	{
		if (!this.hacksApplied)
		{
			return false;
		}

		this.hacksApplied = false;

		document.body.style.cssText = "";

		if (this.getPanel())
		{
			this.getPanel().style.removeProperty("z-index");
			this.getPanel().style.removeProperty("margin-right");

			BX("bx-panel-userinfo").style.removeProperty("padding-right");
			BX("bx-panel-site-toolbar").style.removeProperty("padding-right");
		}

		if (this.getImBar())
		{
			this.getImBar().style.removeProperty("z-index");
			this.getImBar().style.removeProperty("width");
			this.getImBar().style.removeProperty("height");
			this.getImBar().style.removeProperty("position");
			this.getImBar().style.top = this.getImBar().originalTop;
		}

		this.getHeader().style.cssText = "";

		return true;
	},

	/**
	 *
	 * @param {MouseEvent} event
	 * @returns {string} [link.href]
	 * @returns {string} [link.target]
	 * @returns {Node} [link.anchor]
	 * @returns {object|null} link
	 */
	extractLinkFromEvent: function(event)
	{
		event = event || window.event;
		var target = event.target;

		if (event.which !== 1 || !BX.type.isDomNode(target) || event.ctrlKey || event.metaKey)
		{
			return null;
		}

		var a = target;
		if (target.nodeName !== "A")
		{
			a = BX.findParent(target, { tag: "A" }, 1);
		}

		if (!BX.type.isDomNode(a))
		{
			return null;
		}

		// do not use a.href here, the code will fail on links like <a href="#SG13"></a>
		var href = a.getAttribute("href");
		if (href && !BX.data(a, "slider-ignore-autobinding") && (!BX.ajax.isCrossDomain(href) || this.checkLinkOnWhiteList(href)))
		{
			return {
				url: href,
				anchor: a,
				target: a.getAttribute("target")
			};
		}

		return null;
	},

	/**
	 * 
	 * @param {string} link
	 * @returns {boolean}
	 */
	checkLinkOnWhiteList: function(link)
	{
		var result = false;
		var rule = '';
		for (var i = 0; i < this.whiteListLink.length; i++)
		{
			rule = this.whiteListLink[i];
			if (typeof(rule) == 'string')
			{
				if (link.indexOf(rule) > -1)
				{
					result = true;
					break;
				}
			}
			else if (typeof(rule) == 'object')
			{
				if (link.match(rule))
				{
					result = true;
					break;
				}
			}
		}
		
		return result;
	},

	/**
	 *
	 * @param {MouseEvent} event
	 */
	handleClick: function(event)
	{
		var link = this.extractLinkFromEvent(event);
		if (!link)
		{
			return;
		}

		var rule = this.getUrlRule(link.url, link);
		if (!rule)
		{
			return;
		}

		if (rule.mobileFriendly !== true && BX.browser.IsMobile())
		{
			return;
		}

		var isValidLink = BX.type.isFunction(rule.validate) ? rule.validate(link) : this.isValidLink(link);
		if (!isValidLink)
		{
			return;
		}

		if (BX.type.isFunction(rule.handler))
		{
			rule.handler(event, link);
		}
		else
		{
			event.preventDefault();
			this.open(link.url);
		}
	},

	getUrlRule: function(href, link)
	{
		if (!BX.type.isNotEmptyString(href))
		{
			return null;
		}

		var ar = this.anchorRules;
		var rule = null;

		for (var k = 0; k < ar.length; k++)
		{
			rule = ar[k];

			if (!BX.type.isArray(rule.condition))
			{
				continue;
			}

			for (var m = 0; m < rule.condition.length; m++)
			{
				if (BX.type.isString(rule.condition[m]))
				{
					rule.condition[m] = new RegExp(rule.condition[m], "i");
				}

				var matches = href.match(rule.condition[m]);
				if (matches && !this.hasStopParams(href, rule.stopParameters))
				{
					if (link)
					{
						link.matches = matches;
					}

					return rule;
				}
			}
		}

		return null;
	},

	isValidLink: function(link)
	{
		return link.target !== "_blank" && link.target !== "_top";
	},

	hasStopParams: function(url, params)
	{
		if (!params || !BX.type.isArray(params) || !BX.type.isNotEmptyString(url))
		{
			return false;
		}

		var questionPos = url.indexOf("?");
		if (questionPos === -1)
		{
			return false;
		}

		var query = url.substring(questionPos);
		for (var i = 0; i < params.length; i++)
		{
			var param = params[i];
			if (query.match(new RegExp("[?&]" + param + "=", "i")))
			{
				return true;
			}
		}

		return false;
	},

	bindAnchors: function(parameters)
	{
		parameters = parameters || {};

		if (BX.type.isArray(parameters.rules))
		{
			this.anchorRules = this.anchorRules.concat(parameters.rules);
		}

		if (!this.anchorHandler)
		{
			this.anchorHandler = this.handleClick.bind(this);
			window.document.addEventListener("click", this.anchorHandler, true);
		}
	},

	bindEvents: function()
	{
		if (this.eventsBound)
		{
			return false;
		}

		this.eventsBound = true;

		BX.bind(document, "keydown", BX.proxy(this.onDocumentKeyDown, this));
		BX.bind(window, "resize", BX.throttle(this.onWindowResize, 300, this));
		BX.bind(window, "scroll", BX.proxy(this.adjustLayout, this)); //Live Comments can change scrollTop

		if (BX.browser.IsMobile())
		{
			BX.bind(document.body, "touchmove", BX.proxy(this.disableScroll, this));
		}

		BX.addCustomEvent("OnMessengerWindowShowPopup", BX.proxy(this.onMessengerOpen, this));
		this.getHeader().addEventListener("click", BX.proxy(this.onHeaderClick, this), true);
		if (this.getPanel())
		{
			this.getPanel().addEventListener("click", BX.proxy(this.onHeaderClick, this), true);
		}

		return true;
	},

	unbindEvents: function()
	{
		if (!this.eventsBound)
		{
			return false;
		}

		this.eventsBound = false;

		BX.unbind(document, "keydown", BX.proxy(this.onDocumentKeyDown, this));
		BX.unbind(window, "resize", BX.proxy(this.onWindowResize, this));
		BX.unbind(window, "scroll", BX.proxy(this.adjustLayout, this));

		if (BX.browser.IsMobile())
		{
			BX.unbind(document.body, "touchmove", BX.proxy(this.disableScroll, this));
		}

		BX.removeCustomEvent("OnMessengerWindowShowPopup", BX.proxy(this.onMessengerOpen, this));
		this.getHeader().removeEventListener("click", BX.proxy(this.onHeaderClick, this), true);
		if (this.getPanel())
		{
			this.getPanel().removeEventListener("click", BX.proxy(this.onHeaderClick, this), true);
		}

		return true;
	},

	adjustLayout: function()
	{
		this.getOpenPages().forEach(function(/*BX.Bitrix24.SliderPage*/page) {
			page.adjustLayout();
		});
	},

	onDocumentKeyDown: function(event)
	{
		if (event.keyCode === 27)
		{
			event.preventDefault(); //otherwise an iframe loading can be cancelled by a browser

			if (this.isOnTop())
			{
				this.close();
			}
		}
	},

	isOnTop: function()
	{
		var centerX = document.documentElement.clientWidth / 2;
		var centerY = document.documentElement.clientHeight / 2;
		var element = document.elementFromPoint(centerX, centerY);

		return BX.hasClass(element, "slider-panel") || BX.findParent(element, { className: "slider-panel" }) !== null;
	},

	onWindowResize: function()
	{
		this.adjustLayout();
	},

	disableScroll: function(event)
	{
		event.preventDefault();
	},

	onMessengerOpen: function()
	{
		if (this.isOpen)
		{
			this.hide();
			BX.addCustomEvent("OnMessengerWindowClosePopup", BX.proxy(this.onMessengerClose, this));
		}
	},

	onMessengerClose: function()
	{
		this.unhide();
		BX.removeCustomEvent("OnMessengerWindowClosePopup", BX.proxy(this.onMessengerClose, this));
	},

	onHeaderClick: function(event)
	{
		//we are trying to resolve a conflict with the help popup.
		if (this.isOpen && event.target.className.match(/help-/))
		{
			this.closeAll(true);
		}
		else
		{
			this.closeAll();
		}
	}
};


BX.Bitrix24.SliderPage = function(url, options)
{
	this.url = BX.util.remove_url_param(url, ["IFRAME", "IFRAME_TYPE"]);
	this.options = BX.type.isPlainObject(options) ? options : {};
	this.slider = null;

	this.contentCallback = BX.type.isFunction(options.contentCallback) ? options.contentCallback : null;
	this.contentCallbackInvoved = false;

	this.zIndex = 3000;
	this.offset = 0;

	this.iframeSrc = null;
	this.isOpen = false;
	this.hidden = false;

	this.loader = null;
	this.overlay = null;
	this.container = null;
	this.closeBtn = null;
	this.content = null;

	this.animation = null;
	this.animationDuration = 200;
	this.startParams = { translateX: 100, opacity: 0 };
	this.endParams = { translateX: 0, opacity: 100 };
	this.currentParams = null;
};

BX.Bitrix24.SliderPage.prototype = {

	setSlider: function(slider)
	{
		this.slider = slider;
	},

	/**
	 *
	 * @returns {BX.Bitrix24.Slider}
	 */
	getSlider: function()
	{
		return this.slider;
	},

	getUrl: function()
	{
		return this.url;
	},

	isVisible: function()
	{
		return this.isOpen;
	},

	setZindex: function(zIndex)
	{
		if (BX.type.isNumber(zIndex))
		{
			this.zIndex = zIndex;
		}
	},

	getZindex: function()
	{
		return this.zIndex;
	},

	setOffset: function(offset)
	{
		if (BX.type.isNumber(offset))
		{
			this.offset = offset;
		}
	},

	getOffset: function()
	{
		return this.offset;
	},

	isContentPage: function()
	{
		return this.contentCallback !== null;
	},

	getWindow: function()
	{
		return this.iframe ? this.iframe.contentWindow : window;
	},

	open: function()
	{
		this.createLayout();
		this.adjustLayout();

		if (this.isContentPage())
		{
			this.setContent();
		}
		else
		{
			this.setFrameSrc();
		}

		this.animateOpening();

		this.isOpen = true;
	},

	close: function(immediately, callback)
	{
		if (!this.isOpen)
		{
			if (this.animation)
			{
				this.animation.stop(true);
			}

			return;
		}

		this.isOpen = false;

		if (this.animation)
		{
			this.animation.stop();
		}

		var iframeWindow = this.getWindow();
		if (iframeWindow.BX)
		{
			iframeWindow.BX.onCustomEvent("BX.Bitrix24.PageSlider:onClose", [this]);
			iframeWindow.BX.onCustomEvent("Bitrix24.Slider:onClose", [this]);
		}

		if (immediately === true || BX.browser.IsMobile())
		{
			this.currentParams = this.startParams;
			this.completeAnimation(callback);
		}
		else
		{
			this.animation = new BX.easing({
				duration : this.animationDuration,
				start: this.currentParams,
				finish: this.startParams,
				transition : BX.easing.transitions.linear,
				step: BX.delegate(function(state) {
					this.currentParams = state;
					this.animateStep(state);
				}, this),
				complete: BX.delegate(function() {
					this.completeAnimation(callback);
				}, this)
			});

			this.animation.animate();
		}
	},

	hide: function()
	{
		this.hidden = true;
		this.container.style.display = "none";
		this.overlay.style.display = "none";
	},

	unhide: function()
	{
		this.hidden = false;
		this.container.style.removeProperty("display");
		this.overlay.style.removeProperty("display");
	},

	isHidden: function()
	{
		return this.hidden;
	},

	createLayout: function()
	{
		if (this.container)
		{
			return;
		}

		this.overlay = BX.create("div", {
			props: {
				className: "slider-panel slider-panel-overlay"
			},
			events: {
				click: this.onOverlayClick.bind(this)
			},
			style: {
				zIndex: this.getZindex()
			}
		});

		this.container = BX.create("div", {
			props: {
				className: "slider-panel slider-panel-container"
			},
			style: {
				zIndex: this.getZindex() + 1
			}
		});

		this.closeBtn = BX.create("span", {
			props: {
				className: "slider-panel-close"
			},
			children : [
				BX.create("span", {
					props: {
						className: "slider-panel-close-inner"
					}
				})
			],
			events: {
				click: this.onCloseBtnClick.bind(this)
			}
		});

		this.content = BX.create("div", {
			props: {
				className: "slider-panel-content-container"
			}
		});

		if (this.isContentPage())
		{
			this.content.style.overflow = "auto";
		}
		else
		{
			this.iframe = BX.create("iframe", {
				attrs: {
					"src": "about:blank",
					"frameborder": "0"
				},
				props: {
					className: "slider-panel-iframe"
				},
				events: {
					load: this.onIframeLoad.bind(this)
				}
			});

			this.content.appendChild(this.iframe);
		}

		this.container.appendChild(this.content);
		this.container.appendChild(this.closeBtn);
		document.body.appendChild(this.overlay);
		document.body.appendChild(this.container);
	},

	destroy: function()
	{
		this.getWindow().BX.onCustomEvent("Bitrix24.Slider:onDestroy", [this]);

		BX.remove(this.overlay);
		BX.remove(this.container);

		this.container = null;
		this.overlay = null;
		this.content = null;
		this.iframe = null;
		this.closeBtn = null;
	},

	animateOpening: function()
	{
		if (this.isOpen)
		{
			return;
		}

		BX.addClass(this.overlay, "slider-panel-overlay-open");
		BX.addClass(this.container, "slider-panel-container-open");

		if (this.animation)
		{
			this.animation.stop();
		}

		if (BX.browser.IsMobile())
		{
			this.currentParams = this.endParams;
			this.animateStep(this.currentParams);
			return;
		}

		this.animation = new BX.easing({
			duration : this.animationDuration,
			start: this.currentParams ? this.currentParams : this.startParams,
			finish: this.endParams,
			transition : BX.easing.transitions.linear,
			step: BX.delegate(function(state) {
				this.currentParams = state;
				this.animateStep(state);
			}, this),
			complete: BX.delegate(function() {
				this.completeAnimation();
			}, this)
		});

		this.animation.animate();
	},

	animateStep: function(state)
	{
		this.container.style.transform = "translateX(" + state.translateX + "%)";
		this.overlay.style.opacity = state.opacity / 100;
		this.closeBtn.style.opacity = state.opacity / 100;
	},

	completeAnimation: function(callback)
	{
		this.animation = null;
		if (this.isOpen)
		{
			this.currentParams = this.endParams;
		}
		else
		{
			this.currentParams = this.startParams;

			BX.removeClass(this.overlay, "slider-panel-overlay-open");
			BX.removeClass(this.container, "slider-panel-container-open");

			this.container.style.removeProperty("width");
			this.container.style.removeProperty("right");
			this.container.style.removeProperty("max-width");
			this.container.style.removeProperty("min-width");
			this.closeBtn.style.removeProperty("opacity");

			this.getSlider().onPageClose();

			if (BX.type.isFunction(callback))
				callback(this);
		}
	},

	adjustLayout: function()
	{
		var headerPosition = BX.pos(this.getSlider().getHeader());
		var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

		var top = headerPosition.bottom - scrollTop;
		var windowHeight = BX.browser.IsMobile() ? window.innerHeight : document.documentElement.clientHeight;
		var height = 0;
		if (top < 0)
		{
			top = scrollTop;
			height = windowHeight;
		}
		else
		{
			top = headerPosition.bottom;
			height = windowHeight - headerPosition.bottom + scrollTop;
		}

		var right = 0;
		var imBar = this.getSlider().getImBar();
		if (imBar)
		{
			right = imBar.offsetWidth;
		}

		var leftMenuWidth = 240;
		var imbarWidth = imBar ? imBar.offsetWidth : 0;
		var pageWidth = document.documentElement.clientWidth;
		var scrollWidth = window.innerWidth - pageWidth;
		var delta = leftMenuWidth + imbarWidth + scrollWidth;

		if (pageWidth < 1160)
		{
			delta -= 175;
		}

		delta = Math.max(delta + this.getOffset(), 144 + this.getOffset());
		var width = "calc(100% - " + delta + "px)";

		this.overlay.style.height = height + "px";
		this.overlay.style.top = top + "px";

		this.container.style.width = width;
		this.container.style.height = height + "px";
		this.container.style.top = top + "px";
		this.container.style.right = right + "px";
	},

	setContent: function()
	{
		if (this.contentCallbackInvoved)
		{
			return;
		}

		this.contentCallbackInvoved = true;

		var loader = this.getSlider().getLoaderId(this.getUrl());
		this.showLoader(loader);

		var promise = new BX.Promise();

		promise
			.then(this.contentCallback)
			.then(
				function(result) {
					if (BX.type.isDomNode(result))
					{
						this.content.appendChild(result);
					}
					else if (BX.type.isNotEmptyString(result))
					{
						this.content.innerHTML = result;
					}

					this.closeLoader();
				}.bind(this),
				function(reason) {
					this.destroy();
					console.log("error", reason);
				}
		);

		promise.fulfill(this);
	},

	setFrameSrc: function()
	{
		if (this.iframeSrc !== this.getUrl())
		{
			this.iframeSrc = this.getUrl();
			this.iframe.src =
				BX.util.add_url_param(this.getUrl(), {
					IFRAME: "Y",
					IFRAME_TYPE: "SIDE_SLIDER"
				});

			var loader = this.getSlider().getLoaderId(this.getUrl());
			this.showLoader(loader);
		}
	},

	onIframeLoad: function(event)
	{
		var iframeWindow = this.iframe.contentWindow;
		var iframeLocation = iframeWindow.location;

		if (iframeLocation.toString() === "about:blank")
		{
			return;
		}

		this.closeLoader();

		iframeWindow.addEventListener("keydown", this.onFrameKeyDown.bind(this));
		iframeWindow.document.addEventListener("click", this.getSlider().handleClick.bind(this.getSlider()), true);

		if (BX.browser.IsMobile())
		{
			iframeWindow.document.body.style.paddingBottom = window.innerHeight * 2 / 3 + "px";
		}

		if (iframeWindow.BX)
		{
			iframeWindow.BX.onCustomEvent("BX.Bitrix24.PageSlider:onOpen", [this]);
			iframeWindow.BX.onCustomEvent("Bitrix24.Slider:onOpen", [this]);
		}

		if (this.options.events && BX.type.isFunction(this.options.events.onOpen))
		{
			this.options.events.onOpen(this);
		}

		var iframeUrl = iframeLocation.pathname + iframeLocation.search + iframeLocation.hash;
		this.iframeSrc = BX.util.remove_url_param(iframeUrl, ["IFRAME", "IFRAME_TYPE"]);
		this.url = this.iframeSrc;
	},

	onFrameKeyDown: function(event)
	{
		if (event.keyCode !== 27)
		{
			return;
		}

		var popups = BX.findChildren(this.getWindow().document.body, { className: "popup-window" }, false);
		for (var i = 0; i < popups.length; i++)
		{
			var popup = popups[i];
			if (popup.style.display === "block")
			{
				return;
			}
		}

		var centerX = this.getWindow().document.documentElement.clientWidth / 2;
		var centerY = this.getWindow().document.documentElement.clientHeight / 2;
		var element = this.getWindow().document.elementFromPoint(centerX, centerY);

		if (BX.hasClass(element, "bx-core-dialog-overlay") || BX.hasClass(element, "bx-core-window"))
		{
			return;
		}

		if (BX.findParent(element, { className: "bx-core-window" }))
		{
			return;
		}

		this.close();
	},

	createLoader: function(loader)
	{
		BX.remove(this.loader);

		loader = BX.type.isNotEmptyString(loader) ? loader : "default-loader";

		if (loader === "default-loader")
		{
			this.loader = BX.create("div", {
				props: {
					className: "slider-panel-loader " + loader
				},
				children:[
					BX.create("div",{
						props:{
							className: "b24-loader b24-loader-show"
						},
						children: [
							BX.create("div",{
								props:{
									className: "b24-loader-curtain"
								}
							})
						]
					})
				]
			});
		}
		else if (loader === "crm-entity-details-loader")
		{
			this.loader = BX.create("div", {
				props: {
					className: "slider-panel-loader " + loader
				},
				children: [
					BX.create("img", {
						attrs: {
							src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAAAtJREFUeAFjGMQAAACcAAG25ruvAAAAAElFTkSuQmCC"
						},
						props: {
							className: "slider-panel-loader-mask top"
						}
					}),
					BX.create("div", {
						props: {
							className: "slider-panel-loader-bg left"
						},
						children: [
							BX.create("img", {
								attrs: {
									src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAAAtJREFUeAFjGMQAAACcAAG25ruvAAAAAElFTkSuQmCC"
								},
								props: {
									className: "slider-panel-loader-mask left"
								}
							})
						]
					}),
					BX.create("div", {
						props: {
							className: "slider-panel-loader-bg right"
						},
						children: [
							BX.create("img", {
								attrs: {
									src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAAAtJREFUeAFjGMQAAACcAAG25ruvAAAAAElFTkSuQmCC"
								},
								props: {
									className: "slider-panel-loader-mask right"
								}
							})
						]
					})
				]
			});
		}
		else
		{
			this.loader = BX.create("div", {
				props: {
					className: "slider-panel-loader " + loader
				},
				children: [
					BX.create("img", {
						attrs: {
							src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAAAtJREFUeAFjGMQAAACcAAG25ruvAAAAAElFTkSuQmCC"
						},
						props: {
							className: "slider-panel-loader-mask left"
						}
					}),
					BX.create("img", {
						attrs: {
							src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAAAtJREFUeAFjGMQAAACcAAG25ruvAAAAAElFTkSuQmCC"
						},
						props: {
							className: "slider-panel-loader-mask right"
						}
					})
				]
			});
		}

		this.loader.dataset.loader = loader;
		this.content.appendChild(this.loader);
	},

	showLoader: function(loader)
	{
		if (!this.loader || this.loader.dataset.loader !== loader)
		{
			this.createLoader(loader);
		}

		this.loader.style.opacity = 1;
		this.loader.style.display = "block";
	},

	closeLoader: function()
	{
		this.loader.style.display = "none";
		this.loader.style.opacity = 0;
	},

	showCloseBtn: function()
	{
		this.closeBtn.style.removeProperty("opacity");
	},

	hideCLoseBtn: function()
	{
		this.closeBtn.style.opacity = 0;
	},

	/**
	 *
	 * @param {MouseEvent} event
	 */
	onOverlayClick: function(event)
	{
		this.close();
		event.stopPropagation();
	},

	/**
	 *
	 * @param {MouseEvent} event
	 */
	onCloseBtnClick: function(event)
	{
		this.close();
		event.stopPropagation();
	}

};


/* Old Name */
BX.Bitrix24.PageSlider = BX.Bitrix24.Slider;

})();
