;(function (window)
{
	BX.namespace('BX.UI.Tile');
	if (BX.UI.Tile.List)
	{
		return;
	}

	var selectorList = [];

	/**
	 * Tile.
	 *
	 */
	function Tile(params)
	{
		this.id = params.id;
		this.node = params.node;
		this.data = params.data;

		this.nameNode = Helper.getNode('tile-item-name', this.node);
	}

	/**
	 * TileSelector.
	 *
	 */
	function TileSelector(params)
	{
		this.init(params);
	}
	TileSelector.prototype.events = {
		containerClick: 'container-click',
		tileClick: 'tile-click',
		tileRemove: 'tile-remove',
		tileEdit: 'tile-edit',
		tileAdd: 'tile-add',
		buttonAdd: 'add',
		buttonSelect: 'select',
		buttonSelectFirst: 'select-first',
		search: 'search',
		input: 'input',
		searcherCategoryClick: 'popup-category-click',
		searcherItemClick: 'popup-item-click'
	};
	TileSelector.getById = function (id)
	{
		var filtered = selectorList.filter(function (item) {
			return item.id === id;
		});
		return filtered.length > 0 ? filtered[0] : null;
	};
	TileSelector.getList = function ()
	{
		return selectorList;
	};

	TileSelector.prototype.init = function (params)
	{
		this.list = [];
		this.id = params.id;
		this.context = BX(params.containerId);
		this.duplicates = params.duplicates;
		this.multiple = params.multiple;
		this.readonly = params.readonly;

		this.attributeId = 'data-bx-id';
		this.attributeData = 'data-bx-data';
		this.tileContainer = Helper.getNode('tile-container', this.context);
		this.tileTemplate = Helper.getNode('tile-template', this.context);
		this.input = Helper.getNode('tile-input', this.context);
		this.buttonAdd = Helper.getNode('tile-add', this.context);
		this.buttonSelect = Helper.getNode('tile-select', this.context);

		if (!this.context || !this.input)
		{
			return;
		}

		Helper.getNodes('tile-item', this.context).forEach(this.initNode.bind(this));

		if (!this.readonly)
		{
			this.initEventHandlers();
		}

		this.searcher = null;

		selectorList.push(this);
	};
	TileSelector.prototype.initEventHandlers = function ()
	{
		if (this.buttonAdd)
		{
			BX.bind(this.buttonAdd, 'click', this.onButtonAdd.bind(this));
		}
		if (this.context)
		{
			BX.bind(this.context, 'click', this.onContainerClick.bind(this));
		}
		if (this.buttonSelect)
		{
			BX.bind(this.buttonSelect, 'click', this.onButtonSelect.bind(this));
			BX.bind(this.tileContainer, 'click', this.onButtonSelect.bind(this));
		}
		BX.bind(this.input, 'input', this.onInput.bind(this));
		BX.bind(this.input, 'blur', this.onInputEnd.bind(this));
		Helper.handleKeyEnter(this.input, this.onInputEnd.bind(this));
	};
	TileSelector.prototype.getSearchInput = function ()
	{
		return this.input;
	};
	TileSelector.prototype.isSearcherInit = function ()
	{
		return !!this.searcher;
	};
	TileSelector.prototype.clearSearcher = function ()
	{
		this.isButtonSelectFired = false;
		if (this.searcher)
		{
			this.searcher.hide();
			this.searcher = null;
		}
	};
	TileSelector.prototype.hideSearcher = function ()
	{
		this.searcher.hide();
	};
	TileSelector.prototype.showSearcher = function (title)
	{
		if (!this.searcher)
		{
			this.searcher = new Searcher({
				'id': this.id,
				'caller': this,
				'context': this.context,
				'title': title || ''
			});
		}

		this.searcher.filterByName();
		this.searcher.show();
	};
	TileSelector.prototype.setSearcherData = function (dataList)
	{
		if (!this.searcher)
		{
			this.showSearcher();
		}

		this.searcher.setCategories(dataList);
	};
	TileSelector.prototype.initNode = function (node)
	{
		if (!node)
		{
			return null;
		}

		var id = node.getAttribute(this.attributeId);
		var data = node.getAttribute(this.attributeData);
		try
		{
			data = JSON.parse(data);
		}
		catch (e)
		{
			try
			{
				data = JSON.parse(BX.util.htmlspecialcharsback(data));
			}
			catch (e)
			{
				data = {};
			}
		}

		var tile = new Tile({
			'id': id,
			'node': node,
			'data': data
		});
		if (tile.id && !this.duplicates && this.findDuplicates(tile.id))
		{
			tile = null;
			return null;
		}

		var removeButton = Helper.getNode('remove', node);
		if (removeButton)
		{
			BX.bind(removeButton, 'click', this.onRemove.bind(this, tile));
		}

		BX.bind(node, 'click', this.onClick.bind(this, tile));

		this.list.push(tile);

		return tile;
	};

	TileSelector.prototype.onRemove = function (tile, e)
	{
		e.preventDefault();
		e.stopPropagation();
		this.removeTile(tile);
		return false;
	};
	TileSelector.prototype.onClick = function (tile, e)
	{
		e.preventDefault();
		e.stopPropagation();
		this.fire(this.events.tileClick, [tile]);
	};


	TileSelector.prototype.removeTiles = function ()
	{
		var list = this.list;
		list.forEach(this.removeTile.bind(this));
	};
	TileSelector.prototype.removeTile = function (tile)
	{
		this.list = BX.util.deleteFromArray(this.list, this.list.indexOf(tile));
		BX.remove(tile.node);
		this.fire(this.events.tileRemove, [tile]);
	};
	TileSelector.prototype.getTile = function (id)
	{
		var filtered = this.list.filter(function (item) {
			return item.id === id;
		});
		return filtered.length > 0 ? filtered[0] : null;
	};
	TileSelector.prototype.getTilesData = function ()
	{
		return this.list.map(function (tile) {
			return tile.data;
		});
	};
	TileSelector.prototype.getTilesId = function ()
	{
		return this.list.map(function (tile) {
			return tile.id;
		}).filter(function (id) {
			return !!id;
		});
	};
	TileSelector.prototype.getTiles = function ()
	{
		return this.list;
	};
	TileSelector.prototype.findDuplicates = function (id)
	{
		var tile = this.getTile(id);
		if (!tile)
		{
			return false;
		}

		this.removeTile(tile);
	};
	TileSelector.prototype.addTile = function (name, data, id, background, color)
	{
		if (!name || this.readonly)
		{
			return null;
		}

		if (!this.multiple)
		{
			this.removeTiles();
			if (this.isSearcherInit())
			{
				this.hideSearcher();
			}
		}

		data = data || {};
		id = id || '';
		color = color || '';
		background = background || '';

		var template = this.tileTemplate;
		if (!template)
		{
			return null;
		}

		template = template.innerHTML;
		var style = '';
		if (color)
		{
			style += 'color: ' + BX.util.htmlspecialchars(color) + '; ';
		}
		if (background)
		{
			style += 'background-color: ' + BX.util.htmlspecialchars(background) + '; ';
		}
		template = Helper.replace(template, {
			'id': BX.util.htmlspecialchars(id + ''),
			'name': BX.util.htmlspecialchars(name),
			'data': BX.util.htmlspecialchars(JSON.stringify(data)),
			'style': style
		});


		var node = document.createElement('div');
		node.innerHTML = template;
		node = node.children[0];

		var tile = this.initNode(node);
		if (!tile)
		{
			return null;
		}

		this.input.parentNode.insertBefore(node, this.input);
		this.fire(this.events.tileAdd, [tile]);

		return tile;
	};
	TileSelector.prototype.updateTile = function (tile, name, data, bgcolor, color)
	{
		if (!tile || this.readonly)
		{
			return null;
		}

		name = name || null;
		data = data || null;
		bgcolor = bgcolor || null;
		color = color || null;

		if (name)
		{
			tile.nameNode.textContent = name;
		}

		if (data)
		{
			tile.data = data;
		}

		if (bgcolor || bgcolor === null)
		{
			tile.node.style.backgroundColor = bgcolor;
		}

		if (color)
		{
			tile.node.style.color = color;
		}

		this.fire(this.events.tileEdit, [tile]);

		return tile;
	};

	TileSelector.prototype.fire = function (eventName, data)
	{
		BX.onCustomEvent(this, eventName, data);
	};
	TileSelector.prototype.onInput = function ()
	{
		var value = this.input.value;
		if (this.searcher && value.length > 0)
		{
			this.searcher.filterByName(value);
		}

		this.fire(this.events.input, [this.input.value]);
	};
	TileSelector.prototype.onInputEnd = function ()
	{
		var value = this.input.value;
		this.input.value = '';
		Helper.changeDisplay(this.input, false);
		Helper.changeDisplay(this.buttonSelect, true);

		this.fire(this.events.search, [value]);
	};
	TileSelector.prototype.onButtonAdd = function (e)
	{
		e.preventDefault();
		e.stopPropagation();

		this.fire(this.events.buttonAdd, []);
	};
	TileSelector.prototype.onContainerClick = function ()
	{
		this.fire(this.events.containerClick, []);
	};
	TileSelector.prototype.onButtonSelect = function (e)
	{
		e.preventDefault();
		e.stopPropagation();

		Helper.changeDisplay(this.buttonSelect, false);
		Helper.changeDisplay(this.input, true);
		this.input.focus();

		this.fire(this.events.buttonSelect, []);
		if (!this.isButtonSelectFired)
		{
			this.fire(this.events.buttonSelectFirst, []);
			this.isButtonSelectFired = true;
		}
	};

	var Helper = {
		getObjectByKey:  function (list, key, value)
		{
			var filtered = list.filter(function (item) {
				return (item.hasOwnProperty(key) && item[key] === value);
			});
			return filtered.length > 0 ? filtered[0] : null;
		},
		getNode:  function (role, context)
		{
			var nodes = this.getNodes(role, context);
			return nodes.length > 0 ? nodes[0] : null;
		},
		getNodes: function (role, context)
		{
			if (!context)
			{
				return [];
			}

			return BX.convert.nodeListToArray(context.querySelectorAll('[data-role="' + role + '"]'));
		},
		changeClass: function (node, className, isAdd)
		{
			if (!node)
			{
				return;
			}

			if (isAdd)
			{
				BX.addClass(node, className);
			}
			else
			{
				BX.removeClass(node, className);
			}
		},
		changeDisplay: function (node, isShow)
		{
			if (!node)
			{
				return;
			}

			node.style.display = isShow ? '' : 'none';
		},
		replace: function (text, data, isDataSafe)
		{
			data = data || {};
			isDataSafe = isDataSafe || false;

			if (!text)
			{
				return '';
			}

			for (var key in data)
			{
				if (!data.hasOwnProperty(key))
				{
					continue;
				}

				var value = data[key];
				value = value || '';
				if (!isDataSafe && value)
				{
					value = BX.util.htmlspecialchars(value);
				}
				text = text.replace(new RegExp('%' + key + '%', 'g'), value);
			}
			return text;
		},
		handleKeyEnter: function (inputNode, callback)
		{
			if (!callback)
			{
				return;
			}

			var handler = function (event)
			{
				event = event || window.event;
				if ((event.keyCode === 0xA)||(event.keyCode === 0xD))
				{
					event.preventDefault();
					event.stopPropagation();
					callback();
					return false;
				}
			};
			BX.bind(inputNode, 'keyup', handler);
		},
		getTemplatedNode: function (templateNode, replaceData, isDataSafe)
		{
			if (!templateNode)
			{
				return null;
			}

			var template = Helper.replace(templateNode.innerHTML, replaceData, isDataSafe);
			var node = document.createElement('div');
			node.innerHTML = template;

			return node.children[0];
		}
	};


	BX.UI.Tile.List = TileSelector;

})(window);