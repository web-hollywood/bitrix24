'use strict';

BX.namespace('Tasks.Component');

(function(){

	if(typeof BX.Tasks.Component.TasksWidgetRights != 'undefined')
	{
		return;
	}

	/**
	 * Main js controller for this template
	 */
	BX.Tasks.Component.TasksWidgetAccess = BX.Tasks.Component.extend({
		sys: {
			code: 'rights'
		},
		methods: {

			construct: function()
			{
				this.callConstruct(BX.Tasks.Component);

				// todo: i wish we have automatically-created collections, to get rid of such code:
				var firstLevel = null;
				BX.Tasks.each(this.option('levels'), function(level){
					firstLevel = level;
					return false;
				});

				this.vars.firstLevel = firstLevel;
				this.vars.addedUsersIds = [];

				this.getManager(); // just init
			},

			getManager: function()
			{
				return this.subInstance('items', function(){
					return new this.constructor.ItemManager({
						scope: this.scope(),
						preRendered: true,
						data: this.option('data'),
						parent: this
					});
				});
			}
		}
	});

	BX.Tasks.Component.TasksWidgetAccess.ItemManager = BX.Tasks.Util.ItemSet.extend({
		sys: {
			code: 'rights-is'
		},
		options: {
			controlBind: 'class',
			useSmartCodeNaming: true
		},
		methods: {

			bindItemActions: function()
			{
				this.callMethod(BX.Tasks.Util.ItemSet, 'bindItemActions');

				this.bindOnItemEx('i-operation-title', 'click', this.onItemOperationClick.bind(this));
			},

			onItemOperationClick: function(item, node)
			{
				var menu = [];
				BX.Tasks.each(this.optionP('levels'), function(level){

					menu.push({
						enabled: true,
						text: level.TITLE,
						onclick: this.passCtx(this.doMenuAction),
						itemRef: item,
						levelId: level.ID,
						levelTitle: level.TITLE
					});

				}.bind(this));

				// todo: when we delete item, we also should remove its menu!
				BX.PopupMenu.show(
					this.id()+'-op-popup-'+item.value(),
					node,
					menu,
					{angle: true, position: 'right', offsetLeft: 40, offsetTop: 0}
				);
			},

			doMenuAction: function(menu, e, menuItem)
			{
				menu.popupWindow.close();
				this.setItemOperation(menuItem.itemRef, menuItem.levelId, menuItem.levelTitle);
			},

			setItemOperation: function(item, levelId, levelTitle)
			{
				item.data().TASK_ID = levelId;
				item.control('operation-title').innerHTML = levelTitle;
				item.control('operation').value = levelId;
			},

			extractItemValue: function(data)
			{
				if('VALUE' in data)
				{
					return data.VALUE;
				}
				data.VALUE = this.getRandomHash();

				return data.VALUE;
			},

			prepareData: function(data)
			{
				var first = this.parent().vars.firstLevel;

				this.setField('ID', data, '');
				this.setField('TITLE', data, first.TITLE);
				this.setField('TASK_ID', data, first.ID);
				this.setField('MEMBER_ID', data, data.id);
				this.setField('DISPLAY', data, function(data){

					if('nameFormatted' in data)
					{
						return BX.util.htmlspecialcharsback(data.nameFormatted); // socnetlogdest returns escaped name, we want unescaped
					}

					var nameTemplate = this.option('nameTemplate');
					if(nameTemplate)
					{
						var formatted = BX.formatName(data, nameTemplate, 'Y');
						if(formatted == 'Noname') // Noname - bad, login - good
						{
							formatted = data.LOGIN || data.login;
						}

						return formatted;
					}

					return data.LOGIN;
				});

				data.ITEM_SET_INVISIBLE = '';

				return data;
			},

			openAddForm: function()
			{
				this.getSelector().open()
			},

			getSelector: function()
			{
				return this.subInstance('socnet', function(){
					var selector = new BX.Tasks.Integration.Socialnetwork.NetworkSelector({
						scope: this.control('open-form'),
						id: this.id()+'socnet-sel',
						mode: 'user',
						query: this.parent().getQuery(),
						useSearch: true,
						useAdd: false,
						controlBind: this.option('controlBind'),
						parent: this,
						popupOffsetTop: 5,
						popupOffsetLeft: 40,
						lastSelectedContext: 'TASKS_RIGHTS'
					});
					selector.bindEvent('item-selected', this.onSelectorItemSelected.bind(this));

					return selector;
				});
			},

			addItem: function(data)
			{
				var id = data.MEMBER_ID.toString();

				if (!this.isUserAdded(id))
				{
					this.callMethod(BX.Tasks.Util.ItemSet, 'addItem', arguments);
					this.addToAddedUsers(id);
				}
			},

			deleteItem: function(value)
			{
				var item = this.getItem(value.value());
				var idToDelete = item.opts.data.MEMBER_ID.toString();

				this.callMethod(BX.Tasks.Util.ItemSet, 'deleteItem', arguments);
				this.deleteFromAddedUsers(idToDelete);
			},

			onSelectorItemSelected: function(data)
			{
				data.MEMBER_ID = data.id;
				delete(data.id);
				this.addItem(data);

				// deselect it again
				this.getSelector().close();
				this.getSelector().deselectItem(data.MEMBER_ID);
			},

			isUserAdded: function(id)
			{
				return this.parent().vars.addedUsersIds.includes(id);
			},

			addToAddedUsers: function(id)
			{
				this.parent().vars.addedUsersIds.push(id);
			},

			deleteFromAddedUsers: function(id)
			{
				var key = this.parent().vars.addedUsersIds.indexOf(id);
				this.parent().vars.addedUsersIds.splice(key, 1);
			}
		}
	});

}).call(this);