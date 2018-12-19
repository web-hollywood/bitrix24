;(function () {

	"use strict";

	if (window["SBPETabs"])
		return;

	BX.namespace('BX.ContactCenter');

	BX.ContactCenter.TileGrid = function (params)
	{
 		if (typeof params === "object")
 		{
 			this.wrapper = params.wrapper;
 			this.inner = params.inner;
 			this.tiles = params.tiles;
 			this.minTileWidth = 0;
 			this.maxTileWidth = 0;
			this.tileRowLength = 0;

			// You can set min. max. width or amount of tiles in one row
			if(params.sizeSettings)
 			{
 				this.minTileWidth = params.sizeSettings.minWidth;
				this.maxTileWidth = params.sizeSettings.maxWidth;
 			}
			else if (params.tileRowLength)
			{
				this.tileRowLength = params.tileRowLength;
			}
			else
			{
				this.minTileWidth = 180;
				this.maxTileWidth = 250;
 			}

 			this.tileRatio = params.tileRatio || 1.8;
 			this.maxTileHeight = this.maxTileWidth / this.tileRatio;
 		}

 		this.setTileWidth();
 		BX.bind(window, 'resize', this.setTileWidth.bind(this));

 	};

 	BX.ContactCenter.TileGrid.prototype =
	{
		setTileWidth : function ()
		{
			var obj =  this.getTileCalculating();

			var width = obj.width;
			var height = obj.height;

			if(this.minTileWidth)
			{
				width = width <= this.maxTileWidth ? obj.width : this.maxTileWidth;
				height = height <= this.maxTileHeight ? obj.height : this.maxTileHeight;
			}

			requestAnimationFrame(function() {
				for(var i=0; i<this.tiles.length; i++)
				{
					this.tiles[i].style.width = width + 'px';
					this.tiles[i].style.height = height + 'px';
					this.tiles[i].style.marginLeft = obj.margin + 'px';
					this.tiles[i].style.marginTop = obj.margin + 'px';
				}
				this.inner.style.marginLeft = (obj.margin * -1) + 'px';
				this.inner.style.marginTop = (obj.margin * -1) + 'px';
			}.bind(this));
		},

		getTileCalculating : function()
		{
			var wrapperWidth = this.wrapper.clientWidth;
			var wholeMarginSize =  wrapperWidth / 100 * 5; // 4% of whole width for margins
			var width = 0,
				tileAmountInRow = 0;

			if(this.tileRowLength)
			{
				tileAmountInRow = this.tileRowLength;
				width = (wrapperWidth - wholeMarginSize) / this.tileRowLength;
			}
			else
			{
				width = this.minTileWidth;
				tileAmountInRow = (wrapperWidth - wholeMarginSize) / width;

				// if tiles in one line can fit more than tiles amount
				if(tileAmountInRow > this.tiles.length)
				{
					width = (wrapperWidth - wholeMarginSize) / this.tiles.length;
					width = width > this.maxTileWidth ? this.maxTileWidth : width;
				}
				// if there is an hole (width doesn't fit) in the end tile row, increase tile width
				else if((tileAmountInRow - Math.floor(tileAmountInRow)) > 0)
				{
					tileAmountInRow = Math.floor(tileAmountInRow);
					width = (wrapperWidth - wholeMarginSize) / tileAmountInRow;
				}
			}

			return {
				width: width,
				margin: wholeMarginSize / (tileAmountInRow-1),
				height: width / this.tileRatio
			};
		}


	};

 	BX.ContactCenter.Menu = function(params)
	{
		this.element = params.element;
		this.bindElement = document.getElementById(params.bindElement);
		this.items = this.prepareItems(params.items);

		this.init();
	};

	BX.ContactCenter.Menu.prototype =
	{
		init: function ()
		{
			var params = {
				maxHeight: 300
			};

			this.menu = new BX.PopupMenuWindow(
				this.element,
				this.bindElement,
				this.items,
				params
			);

			BX.bind(this.bindElement, 'click', BX.delegate(this.show, this));
		},

		show: function()
		{
			this.menu.show();
		},

		close: function()
		{
			this.menu.close();
		},

		prepareItems: function (items)
		{
			if (typeof items === "object")
			{
				items = Object.values(items)
			}

			var newItems = [];
			var newItem;

			for (var i = 0; i < items.length; i++)
			{
				newItem = this.prepareItem(items[i]);

				if (newItem.delimiterBefore)
				{
					newItems.push({delimiter: true});
				}

				newItems.push(newItem);

				if (newItem.delimiterAfter)
				{
					newItems.push({delimiter: true});
				}
			}

			return newItems;
		},

		prepareItem: function (item)
		{
			var newItem = {};

			newItem.title = item.NAME;
			newItem.text = item.NAME;
			newItem.delimiterAfter = item.DELIMITER_AFTER;
			newItem.delimiterBefore = item.DELIMITER_BEFORE;

			if (item.FIXED)
			{
				newItem.className = 'menu-popup-no-icon intranet-contact-list-item-add';
			}

			if (item.ONCLICK)
			{
				newItem.onclick = BX.delegate(
					function (e) {
						eval(item.ONCLICK);
						this.close();
					},
					this
				);
			}

			if (item.LIST)
			{
				newItem.items = this.prepareItems(item.LIST);
			}

			return newItem;
		},
	};

	BX.ContactCenter.Loader = function()
	{
		this.parentNode = document.querySelector("#intranet-contact-wrap");
		this.blockNode = document.querySelector("#intranet-contact-list");
		this.body = BX.create("div", {
			props: {
				className: "intranet-side-panel-overlay"
			},
			children: [
				BX.create("div", {
					props: {
						className: "side-panel-default-loader-container"
					},
					html:
						'<svg class="side-panel-default-loader-circular" viewBox="25 25 50 50">' +
						'<circle ' +
						'class="side-panel-default-loader-path" ' +
						'cx="50" cy="50" r="20" fill="none" stroke-miterlimit="10"' +
						'/>' +
						'</svg>'
				})
			]
		});

		this.setSizeDelegated();

		BX.bind(window, 'resize', this.setSizeDelegated.bind(this));
	};

	BX.ContactCenter.Loader.prototype =
	{
		show: function ()
		{
			this.parentNode.insertBefore(this.body, this.blockNode);
		},
		hide: function ()
		{
			this.parentNode.removeChild(this.body);
		},
		setSize: function () {
			this.body.style.width = this.blockNode.clientWidth + "px";
			this.body.style.height = this.blockNode.clientHeight + "px";
		},
		setSizeDelegated: function () {
			setTimeout(
				BX.delegate(function(event) {
					this.setSize();
				}, this),
				500
			)
		}
	};

	BX.ContactCenter.Ajax = function(params, appearance)
	{
		this.signedParameters = params.signedParameters;
		this.componentName = params.componentName;
		this.sliderUrls = params.sliderUrls;
		this.loader = new BX.ContactCenter.Loader();
		this.appearance = appearance;

		this.init();
	};

	BX.ContactCenter.Ajax.prototype =
	{
		init: function ()
		{
			BX.addCustomEvent(
				"SidePanel.Slider:onMessage",
				BX.delegate(function(event) {
					if (event.getEventId() === "ContactCenter:reload")
					{
						this.reload();
					}
				}, this)
			);
		},
		reload: function ()
		{
			this.loader.show();

			BX.ajax.runComponentAction(this.componentName, 'reload', {
				mode: 'class',
				signedParameters: this.signedParameters
			}).then(
				BX.delegate(
					function(response) {
						var elem = BX.create('div');
						elem.innerHTML = response.data.html;
						BX('intranet-contact-list').innerHTML = elem.querySelector('#intranet-contact-list').innerHTML;
						this.appearance.loadPage(response.data.js_data);
						BX.remove(elem);
						this.loader.hide();
					},
					this
				),
				BX.delegate(
					function(response) {
						this.loader.hide();
					},
					this
				)
			);
		},
		isContactCenterBlockUrl: function(url)
		{
			var result = false,
				reg;

			if (url)
			{
				for (var i = 0; i < this.sliderUrls.length; i++)
				{
					reg = new RegExp(this.sliderUrls[i], 'ig');
					if (url.match(reg) !== null)
					{
						result = true;
						break;
					}
				}
			}

			return result;
		}
	};

 	BX.ContactCenter.Appearance = function(params)
	{
		this.loadPage(params);
	};

	BX.ContactCenter.Appearance.prototype =
	{
		loadPage: function(params)
		{
			var wrapper = BX('intranet-contact-wrap');
			var title_list = Array.prototype.slice.call(wrapper.getElementsByClassName('intranet-contact-item'));

			new BX.ContactCenter.TileGrid({
				wrapper: wrapper,
				inner: BX('intranet-contact-list'),
				tiles: title_list,
				sizeSettings : {
					minWidth : 180,
					maxWidth: 250
				}
			});

			if (params.handleMailLinks)
			{
				this.bindMailPagesSlider();
			}

			if (params.menu)
			{
				for (var i = 0; i < params.menu.length; i++)
				{
					new BX.ContactCenter.Menu(params.menu[i]);
				}
			}
		},
		bindMailPagesSlider: function ()
		{
			if (window === window.top)
			{
				top.BX.SidePanel.Instance.bindAnchors({
					rules: [
						{
							condition: [
								'^/mail/config/(new|edit)',
							],
							options: {
								width: 760,
								cacheable: false,
								allowChangeHistory: false
							}
						}
					]
				});
			}
		}
	};

	BX.ContactCenter.Init = function(params)
	{
		var appearance = new BX.ContactCenter.Appearance(params);
		var ajax = new BX.ContactCenter.Ajax(params, appearance);
	};

})();