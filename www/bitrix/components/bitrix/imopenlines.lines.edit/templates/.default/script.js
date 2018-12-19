;(function(window){
	if (!!window.BX.OpenLinesConfigEdit)
		return;

	var destination = function(params, type) {
		this.p = (!!params ? params : {});
		if (!!params["SELECTED"])
		{
			var res = {}, tp, j;
			for (tp in params["SELECTED"])
			{
				if (params["SELECTED"].hasOwnProperty(tp) && typeof params["SELECTED"][tp] == "object")
				{
					for (j in params["SELECTED"][tp])
					{
						if (params["SELECTED"][tp].hasOwnProperty(j))
						{
							if (tp == 'USERS')
								res['U' + params["SELECTED"][tp][j]] = 'users';
							else if (tp == 'SG')
								res['SG' + params["SELECTED"][tp][j]] = 'sonetgroups';
							else if (tp == 'DR')
								res['DR' + params["SELECTED"][tp][j]] = 'department';
						}
					}
				}
			}
			this.p["SELECTED"] = res;
		}

		this.nodes = {};
		var makeDepartmentTree = function(id, relation)
		{
			var arRelations = {}, relId, arItems, x;
			if (relation[id])
			{
				for (x in relation[id])
				{
					if (relation[id].hasOwnProperty(x))
					{
						relId = relation[id][x];
						arItems = [];
						if (relation[relId] && relation[relId].length > 0)
							arItems = makeDepartmentTree(relId, relation);
						arRelations[relId] = {
							id: relId,
							type: 'category',
							items: arItems
						};
					}
				}
			}
			return arRelations;
		},
		buildDepartmentRelation = function(department)
		{
			var relation = {}, p;
			for(var iid in department)
			{
				if (department.hasOwnProperty(iid))
				{
					p = department[iid]['parent'];
					if (!relation[p])
						relation[p] = [];
					relation[p][relation[p].length] = iid;
				}
			}
			return makeDepartmentTree('DR0', relation);
		};
		if (true || type == 'users')
		{
			this.params = {
				'name' : null,
				'searchInput' : null,
				'extranetUser' :  (this.p['EXTRANET_USER'] == "Y"),
				'bindMainPopup' : { node : null, 'offsetTop' : '5px', 'offsetLeft': '15px'},
				'bindSearchPopup' : { node : null, 'offsetTop' : '5px', 'offsetLeft': '15px'},
				departmentSelectDisable : true,
				'callback' : {
					'select' : BX.delegate(this.select, this),
					'unSelect' : BX.delegate(this.unSelect, this),
					'openDialog' : BX.delegate(this.openDialog, this),
					'closeDialog' : BX.delegate(this.closeDialog, this),
					'openSearch' : BX.delegate(this.openDialog, this),
					'closeSearch' : BX.delegate(this.closeSearch, this)
				},
				items : {
					users : (!!this.p['USERS'] ? this.p['USERS'] : {}),
					groups : {},
					sonetgroups : {},
					department : (!!this.p['DEPARTMENT'] ? this.p['DEPARTMENT'] : {}),
					departmentRelation : (!!this.p['DEPARTMENT'] ? buildDepartmentRelation(this.p['DEPARTMENT']) : {}),
					contacts : {},
					companies : {},
					leads : {},
					deals : {}
				},
				itemsLast : {
					users : (!!this.p['LAST'] && !!this.p['LAST']['USERS'] ? this.p['LAST']['USERS'] : {}),
					sonetgroups : {},
					department : {},
					groups : {},
					contacts : {},
					companies : {},
					leads : {},
					deals : {},
					crm : []
				},
				itemsSelected : (!!this.p['SELECTED'] ? BX.clone(this.p['SELECTED']) : {}),
				isCrmFeed : false,
				destSort : (!!this.p['DEST_SORT'] ? BX.clone(this.p['DEST_SORT']) : {})
			}
		}
	}, destinationInstance = null;
	destination.prototype = {
		setInput : function(node, inputName)
		{
			node = BX(node);
			if (!!node && !node.hasAttribute("bx-destination-id"))
			{
				var id = 'destination' + ('' + new Date().getTime()).substr(6), res;
				node.setAttribute('bx-destination-id', id);
				res = new destInput(id, node, inputName);
				this.nodes[id] = node;
				BX.defer_proxy(function(){
					this.params.name = res.id;
					this.params.searchInput = res.nodes.input;
					this.params.bindMainPopup.node = res.nodes.container;
					this.params.bindSearchPopup.node = res.nodes.container;

					BX.SocNetLogDestination.init(this.params);
				}, this)();
			}
		},
		select : function(item, type, search, bUndeleted, id)
		{
			var type1 = type, prefix = 'S';

			if (type == 'groups')
			{
				type1 = 'all-users';
			}
			else if (BX.util.in_array(type, ['contacts', 'companies', 'leads', 'deals']))
			{
				type1 = 'crm';
			}

			if (type == 'sonetgroups')
			{
				prefix = 'SG';
			}
			else if (type == 'groups')
			{
				prefix = 'UA';
			}
			else if (type == 'users')
			{
				prefix = 'U';
			}
			else if (type == 'department')
			{
				prefix = 'DR';
			}
			else if (type == 'contacts')
			{
				prefix = 'CRMCONTACT';
			}
			else if (type == 'companies')
			{
				prefix = 'CRMCOMPANY';
			}
			else if (type == 'leads')
			{
				prefix = 'CRMLEAD';
			}
			else if (type == 'deals')
			{
				prefix = 'CRMDEAL';
			}

			var stl = (bUndeleted ? ' bx-destination-undelete' : '');
			stl += (type == 'sonetgroups' && typeof window['arExtranetGroupID'] != 'undefined' && BX.util.in_array(item.entityId, window['arExtranetGroupID']) ? ' bx-destination-extranet' : '');

			var el = BX.create("span", {
				attrs : {
					'data-id' : item.id
				},
				props : {
					className : "bx-destination bx-destination-"+type1+stl
				},
				children: [
					BX.create("span", {
						props : {
							'className' : "bx-destination-text"
						},
						html : item.name
					})
				]
			});

			if(!bUndeleted)
			{
				el.appendChild(BX.create("span", {
					props : {
						'className' : "imopenlines-remove-btn"
					},
					events : {
						'click' : function(e){
							BX.SocNetLogDestination.deleteItem(item.id, type, id);
							BX.PreventDefault(e)
						},
						'mouseover' : function(){
							BX.addClass(this.parentNode, 'bx-destination-hover');
						},
						'mouseout' : function(){
							BX.removeClass(this.parentNode, 'bx-destination-hover');
						}
					}
				}));
			}
			BX.onCustomEvent(this.nodes[id], 'select', [item, el, prefix]);
		},
		unSelect : function(item, type, search, id)
		{
			BX.onCustomEvent(this.nodes[id], 'unSelect', [item]);
		},
		openDialog : function(id)
		{
			BX.onCustomEvent(this.nodes[id], 'openDialog', []);
		},
		closeDialog : function(id)
		{
			if (!BX.SocNetLogDestination.isOpenSearch())
			{
				BX.onCustomEvent(this.nodes[id], 'closeDialog', []);
				this.disableBackspace();
			}
		},
		closeSearch : function(id)
		{
			if (!BX.SocNetLogDestination.isOpenSearch())
			{
				BX.onCustomEvent(this.nodes[id], 'closeSearch', []);
				this.disableBackspace();
			}
		},
		disableBackspace : function()
		{
			if (BX.SocNetLogDestination.backspaceDisable || BX.SocNetLogDestination.backspaceDisable !== null)
				BX.unbind(window, 'keydown', BX.SocNetLogDestination.backspaceDisable);

			BX.bind(window, 'keydown', BX.SocNetLogDestination.backspaceDisable = function(event){
				if (event.keyCode == 8)
				{
					BX.PreventDefault(event);
					return false;
				}
				return true;
			});
			setTimeout(function(){
				BX.unbind(window, 'keydown', BX.SocNetLogDestination.backspaceDisable);
				BX.SocNetLogDestination.backspaceDisable = null;
			}, 5000);
		}
	};
	var destInput = function(id, node, inputName)
	{
		this.node = node;
		this.id = id;
		this.inputName = inputName;
		this.node.appendChild(BX.create('SPAN', {
			props : { className : "bx-destination-wrap" },
			html : [
				'<span id="', this.id, '-container"><span class="bx-destination-wrap-item"></span></span>',
				'<span class="bx-destination-input-box" id="', this.id, '-input-box">',
					'<input type="text" value="" class="bx-destination-input" id="', this.id, '-input">',
				'</span>',
				'<a href="#" class="bx-destination-add" id="', this.id, '-add-button"></a>'
			].join('')}));
		BX.defer_proxy(this.bind, this)();
	};
	destInput.prototype = {
		bind : function()
		{
			this.nodes = {
				inputBox : BX(this.id + '-input-box'),
				input : BX(this.id + '-input'),
				container : BX(this.id + '-container'),
				button : BX(this.id + '-add-button')
			};
			BX.bind(this.nodes.input, 'keyup', BX.proxy(this.search, this));
			BX.bind(this.nodes.input, 'keydown', BX.proxy(this.searchBefore, this));
			BX.bind(this.nodes.button, 'click', BX.proxy(function(e){BX.SocNetLogDestination.openDialog(this.id); BX.PreventDefault(e); }, this));
			BX.bind(this.nodes.container, 'click', BX.proxy(function(e){BX.SocNetLogDestination.openDialog(this.id); BX.PreventDefault(e); }, this));
			this.onChangeDestination();
			BX.addCustomEvent(this.node, 'select', BX.proxy(this.select, this));
			BX.addCustomEvent(this.node, 'unSelect', BX.proxy(this.unSelect, this));
			BX.addCustomEvent(this.node, 'delete', BX.proxy(this.delete, this));
			BX.addCustomEvent(this.node, 'openDialog', BX.proxy(this.openDialog, this));
			BX.addCustomEvent(this.node, 'closeDialog', BX.proxy(this.closeDialog, this));
			BX.addCustomEvent(this.node, 'closeSearch', BX.proxy(this.closeSearch, this));
		},
		select : function(item, el, prefix)
		{
			if (BX.message('LM_BUSINESS_USERS_ON') == 'Y' && BX.message('LM_BUSINESS_USERS').split(',').indexOf(item.id) == -1)
			{
				BX.SocNetLogDestination.closeDialog(this.id);
				BX.imolTrialHandler.openPopup('imol_queue', BX.message('LM_BUSINESS_USERS_TEXT'));
				return false;
			}
			if(!BX.findChild(this.nodes.container, { attr : { 'data-id' : item.id }}, false, false))
			{
				el.appendChild(BX.create("INPUT", { props : {
						type : "hidden",
						name : ('CONFIG['+this.inputName+']'+ '[' + prefix + '][]'),
						value : item.id
					}
				}));
				this.nodes.container.appendChild(el);
			}
			this.onChangeDestination();
		},
		unSelect : function(item)
		{
			var elements = BX.findChildren(this.nodes.container, {attribute: {'data-id': ''+item.id+''}}, true);
			if (elements !== null)
			{
				for (var j = 0; j < elements.length; j++)
					BX.remove(elements[j]);
			}
			this.onChangeDestination();
		},
		onChangeDestination : function()
		{
			var selectedId = [];
			var nodesButton = BX.findChildrenByClassName(this.nodes.container, "bx-destination", false);
			for (var i = 0; i < nodesButton.length; i++)
			{
				selectedId.push({
					'id' : nodesButton[i].getAttribute('data-id').substr(1),
					'name' : nodesButton[i].innerText
				});
			}
			BX.onCustomEvent('onChangeDestination', [selectedId]);

			this.nodes.input.innerHTML = '';
			this.nodes.button.innerHTML = (BX.SocNetLogDestination.getSelectedCount(this.id) <= 0 ? BX.message("LM_ADD1") : BX.message("LM_ADD2"));
		},
		openDialog : function()
		{
			BX.style(this.nodes.inputBox, 'display', 'inline-block');
			BX.style(this.nodes.button, 'display', 'none');
			BX.focus(this.nodes.input);
		},
		closeDialog : function()
		{
			if (this.nodes.input.value.length <= 0)
			{
				BX.style(this.nodes.inputBox, 'display', 'none');
				BX.style(this.nodes.button, 'display', 'inline-block');
				this.nodes.input.value = '';
			}
		},
		closeSearch : function()
		{
			if (this.nodes.input.value.length > 0)
			{
				BX.style(this.nodes.inputBox, 'display', 'none');
				BX.style(this.nodes.button, 'display', 'inline-block');
				this.nodes.input.value = '';
			}
		},
		searchBefore : function(event)
		{
			if (event.keyCode == 8 && this.nodes.input.value.length <= 0)
			{
				BX.SocNetLogDestination.sendEvent = false;
				BX.SocNetLogDestination.deleteLastItem(this.id);
			}
			return true;
		},
		search : function(event)
		{
			if (event.keyCode == 16 || event.keyCode == 17 || event.keyCode == 18 || event.keyCode == 20 || event.keyCode == 244 || event.keyCode == 224 || event.keyCode == 91)
				return false;

			if (event.keyCode == 13)
			{
				BX.SocNetLogDestination.selectFirstSearchItem(this.id);
				return true;
			}
			if (event.keyCode == 27)
			{
				this.nodes.input.value = '';
				BX.style(this.nodes.button, 'display', 'inline');
			}
			else
			{
				BX.SocNetLogDestination.search(this.nodes.input.value, true, this.id);
			}

			if (!BX.SocNetLogDestination.isOpenDialog() && this.nodes.input.value.length <= 0)
			{
				BX.SocNetLogDestination.openDialog(this.id);
			}
			else if (BX.SocNetLogDestination.sendEvent && BX.SocNetLogDestination.isOpenDialog())
			{
				BX.SocNetLogDestination.closeDialog();
			}
			if (event.keyCode == 8)
			{
				BX.SocNetLogDestination.sendEvent = true;
			}
			return true;
		}
	};

	window.BX.OpenLinesConfigEdit = {
		popupTooltip: {},
		initDestination : function(node, inputName, params)
		{
			if (destinationInstance === null)
				destinationInstance = new destination(params);
			destinationInstance.setInput(BX(node), inputName);
			this.receiveReloadUsersMessage();
		},
		addEventForTooltip : function()
		{
			BX.UI.Hint.init(BX('imopenlines-field-container'));
			/*var arNodes = BX.findChildrenByClassName(BX('imol_config_edit_form'), "ui-form-settings-tooltip");
			for (var i = 0; i < arNodes.length; i++)
			{
				if (arNodes[i].getAttribute('context-help') == 'y')
					continue;

				arNodes[i].setAttribute('data-id', i);
				arNodes[i].setAttribute('context-help', 'y');
				BX.bind(arNodes[i], 'mouseover', function(){
					var id = this.getAttribute('data-id');
					var text = this.getAttribute('data-text');

					BX.OpenLinesConfigEdit.showTooltip(id, this, text);
				});
				BX.bind(arNodes[i], 'mouseout', function(){
					var id = this.getAttribute('data-id');
					BX.OpenLinesConfigEdit.hideTooltip(id);
				});
			}*/
		},
		showTooltip : function(id, bind, text)
		{
			if (this.popupTooltip[id])
				this.popupTooltip[id].close();

			this.popupTooltip[id] = new BX.PopupWindow('bx-imopenlines-tooltip', bind, {
				lightShadow: true,
				autoHide: false,
				darkMode: true,
				offsetLeft: 0,
				offsetTop: 2,
				bindOptions: {position: "top"},
				zIndex: 200,
				events : {
					onPopupClose : function() {this.destroy()}
				},
				content : BX.create("div", { attrs : { style : "padding-right: 5px; width: 250px;" }, html: text})
			});
			this.popupTooltip[id].setAngle({offset:13, position: 'bottom'});
			this.popupTooltip[id].show();

			return true;
		},
		hideTooltip : function(id)
		{
			this.popupTooltip[id].close();
			this.popupTooltip[id] = null;
		},

		//actions
		addPreloader: function ()
		{
			var preloader = BX.create("div", {
				props: {
					className: "side-panel-overlay side-panel-overlay-open",
					style : "position: fixed; background-color: rgba(255, 255, 255, .7);"
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
			document.body.appendChild(preloader);
		},
		actionClose: function()
		{
			BX.OpenLinesConfigEdit.toggleSelectFormOrText(
				BX('imol_action_close'),
				BX('imol_action_close_form'),
				BX('imol_action_close_text')
			);
		},
		actionAutoClose: function()
		{
			BX.OpenLinesConfigEdit.toggleSelectFormOrText(
				BX('imol_action_auto_close'),
				BX('imol_action_auto_close_form'),
				BX('imol_action_auto_close_text')
			);
		},
		changeTitle: function()
		{
			BX('bx-line-title').innerText = BX('bx-line-title-input').value;
		},
		changeNoAnswerBox: function(selector)
		{
			var noAnswerBox = BX('imol_no_answer_rule');

			if (typeof(noAnswerBoxValue) == 'undefined' || noAnswerBox.options[noAnswerBox.options.selectedIndex].value != 'queue')
				noAnswerBoxValue = noAnswerBox.options[noAnswerBox.options.selectedIndex].value;

			noAnswerBox.innerHTML = '';

			var colorAnimate = false;
			if (selector.options[selector.selectedIndex].value == 'strictly' || selector.options[selector.selectedIndex].value == 'all')
			{
				//noAnswerBox.options[noAnswerBox.length] = BX.create("option", {attrs: { value: "form", disabled: "true"}, html: BX.message('IMOL_CONFIG_EDIT_NO_ANSWER_RULE_FORM') });
				noAnswerBox.options[noAnswerBox.length] = BX.create("option", {attrs: { value: "text"}, html: BX.message('IMOL_CONFIG_EDIT_NO_ANSWER_RULE_TEXT') });
				noAnswerBox.options[noAnswerBox.length] = BX.create("option", {attrs: { value: "none"}, html: BX.message('IMOL_CONFIG_EDIT_NO_ANSWER_RULE_NONE') });
				if (selector.options[selector.selectedIndex].value == 'all')
				{
					BX('imol_queue_time_title').innerHTML = BX.message('IMOL_CONFIG_EDIT_NA_TIME');
					BX('imol_workers_time_link').innerHTML = BX.message('IMOL_CONFIG_EDIT_NA_TIME');
					BX.animationHandler.fadeSlideToggleByClass(BX('imol_limitation_max_chat_block'), false);
					colorAnimate = true;
				}
				else if (BX('imol_queue_time_title').innerHTML != BX.message('IMOL_CONFIG_EDIT_QUEUE_TIME'))
				{
					BX('imol_queue_time_title').innerHTML = BX.message('IMOL_CONFIG_EDIT_QUEUE_TIME');
					BX('imol_workers_time_link').innerHTML = BX.message('IMOL_CONFIG_EDIT_QUEUE_TIME');
					BX.animationHandler.fadeSlideToggleByClass(BX('imol_limitation_max_chat_block'), true);
					colorAnimate = true;
				}
			}
			else
			{
				//noAnswerBox.options[noAnswerBox.length] = BX.create("option", {attrs: { value: "form", disabled: "true"}, html: BX.message('IMOL_CONFIG_EDIT_NO_ANSWER_RULE_FORM') });
				noAnswerBox.options[noAnswerBox.length] = BX.create("option", {attrs: { value: "text"}, html: BX.message('IMOL_CONFIG_EDIT_NO_ANSWER_RULE_TEXT') });
				noAnswerBox.options[noAnswerBox.length] = BX.create("option", {attrs: { value: "queue"}, html: BX.message('IMOL_CONFIG_EDIT_NO_ANSWER_RULE_QUEUE') });
				noAnswerBox.options[noAnswerBox.length] = BX.create("option", {attrs: { value: "none"}, html: BX.message('IMOL_CONFIG_EDIT_NO_ANSWER_RULE_NONE') });

				if (BX('imol_queue_time_title').innerHTML != BX.message('IMOL_CONFIG_EDIT_QUEUE_TIME'))
				{
					BX('imol_queue_time_title').innerHTML = BX.message('IMOL_CONFIG_EDIT_QUEUE_TIME');
					BX('imol_workers_time_link').innerHTML = BX.message('IMOL_CONFIG_EDIT_QUEUE_TIME');
					BX.animationHandler.fadeSlideToggleByClass(BX('imol_limitation_max_chat_block'), true);
					colorAnimate = true;
				}
			}
			if (colorAnimate)
			{
				BX.fx.colorAnimate.addRule('animationRule1', "#525c69", "#ccc", "color", 100, 1, true);
				BX.fx.colorAnimate(BX('imol_queue_time_title'), 'animationRule1');
				BX.fx.colorAnimate(BX('imol_workers_time_link'), 'animationRule1');
			}

			for (var i = 0; i < noAnswerBox.options.length; i++)
			{
				if (noAnswerBox.options[i].value == noAnswerBoxValue)
				{
					noAnswerBox.options.selectedIndex = i;
				}
			}
		},
		toggleCrmBlock: function()
		{
			BX.animationHandler.fadeSlideToggleByClass(BX('imol_crm_block'))
		},
		toggleCheckOnlineBlock: function()
		{
			BX.animationHandler.fadeSlideToggleByClass(BX('imol_check_online_block'))
		},
		toggleCrmSourceRule: function()
		{
			var selector = BX('imol_crm_create');
			if (selector.options[selector.selectedIndex].value != 'none')
			{
				BX.removeClass(BX('imol_crm_source_rule'), 'invisible');
			}
			else
			{
				BX.addClass(BX('imol_crm_source_rule'), 'invisible');
			}
		},
		toggleQueueSettingsBlock: function(e)
		{
			e.preventDefault();
			BX.animationHandler.fadeSlideToggleByClass(BX('imol_queue_settings_block'));
			BX.OpenLinesConfigEdit.toggleBoolInputValue(BX('imol_queue_settings_input'));
		},
		toggleAutoActionSettingsBlock: function(e)
		{
			e.preventDefault();
			BX.animationHandler.fadeSlideToggleByClass(BX('imol_auto_action_settings_block'));
			BX.OpenLinesConfigEdit.toggleBoolInputValue(BX('imol_auto_action_settings_input'));
		},
		toggleAutoMessageBlock: function()
		{
			BX.animationHandler.fadeSlideToggleByClass(BX('imol_action_welcome'))
		},
		toggleAgreementBlock: function()
		{
			BX.animationHandler.fadeSlideToggleByClass(BX('imol_agreement_message_block'))
		},
		toggleVoteBlock: function()
		{
			BX.animationHandler.fadeSlideToggleByClass(BX('imol_vote_message_block'))
		},
		toggleBotBlock: function()
		{
			BX.animationHandler.fadeSlideToggleByClass(BX('imol_welcome_bot_block'))
		},
		toggleWorkersTimeBlock: function(e)
		{
			e.preventDefault();
			BX.animationHandler.fadeSlideToggleByClass(BX('imol_workers_time_block'));
			BX.OpenLinesConfigEdit.toggleBoolInputValue(BX('imol_workers_time_input'));
		},
		toggleWorktimeBlock: function()
		{
			BX.animationHandler.fadeSlideToggleByClass(BX('imol_worktime_block'))
		},
		toggleNoAnswerRule: function()
		{
			BX.OpenLinesConfigEdit.toggleSelectFormText(
				BX('imol_no_answer_rule'),
				BX('imol_no_answer_rule_form_form'),
				BX('imol_no_answer_rule_text')
			);
		},
		toggleQueueMaxChat: function()
		{
			BX.animationHandler.fadeSlideToggleByClass(BX('imol_max_chat'))
		},
		toggleWorktimeDayoffRule: function()
		{
			BX.OpenLinesConfigEdit.toggleSelectFormText(
				BX('imol_worktime_dayoff_rule'),
				BX('imol_worktime_dayoff_rule_form'),
				BX('imol_worktime_dayoff_rule_text')
			);
		},
		openExtraContainer: function()
		{
			BX.addClass(BX('imol_extra_btn'), 'imopenlines-extra-btn-container-active');
			BX.removeClass(BX('imol_extra_container'), 'ui-form-border-bottom');
			BX.animationHandler.fadeSlideToggleByClass(BX('imol_setting_container'), true);
			BX('imol_config_opened').setAttribute('value', 'Y');
		},
		receiveReloadUsersMessage: function()
		{
			BX.addCustomEvent(
				"SidePanel.Slider:onMessage",
				BX.delegate(
					function(event) {
						if (event.getEventId() === "ImOpenlines:reloadUsersList")
						{
							var destinationId = BX('users_for_queue').getAttribute('bx-destination-id');
							var userContainer = BX(destinationId + '-container');
							var users = BX.findChild(userContainer, {class: 'bx-destination-users'}, false, true);

							for (var i = 0; i < users.length; i++)
							{
								BX.SocNetLogDestination.deleteItem(users[i].dataset.id, 'users', destinationId);
							}

							var newUsers = event.getData();

							if (typeof newUsers === "object")
							{
								newUsers = Object.values(newUsers);
							}

							for (i = 0; i < newUsers.length; i++)
							{
								destinationInstance.select(newUsers[i], 'users', false, false, destinationId);
							}
						}
					},
					this
				)
			);
		},

		//toggle providers
		toggleSelectFormText: function(selector, form, textarea)
		{
			if (selector.options[selector.selectedIndex].value == 'form')
			{
				BX.animationHandler.fadeSlideToggleByClass(form, true);
				BX.animationHandler.fadeSlideToggleByClass(textarea, true);
			}
			else if (selector.options[selector.selectedIndex].value == 'text')
			{
				BX.animationHandler.fadeSlideToggleByClass(form, false);
				BX.animationHandler.fadeSlideToggleByClass(textarea, true);
			}
			else
			{
				BX.animationHandler.fadeSlideToggleByClass(form, false);
				BX.animationHandler.fadeSlideToggleByClass(textarea, false);
			}
		},
		toggleSelectFormOrText: function(selector, form, textarea)
		{
			if (selector.options[selector.selectedIndex].value == 'form')
			{
				BX.animationHandler.fadeSlideToggleByClass(form, true);
				BX.animationHandler.fadeSlideToggleByClass(textarea, false);
			}
			else if (selector.options[selector.selectedIndex].value == 'text' || selector.options[selector.selectedIndex].value == 'quality')
			{
				BX.animationHandler.fadeSlideToggleByClass(form, false);
				BX.animationHandler.fadeSlideToggleByClass(textarea, true);
			}
			else
			{
				BX.animationHandler.fadeSlideToggleByClass(form, false);
				BX.animationHandler.fadeSlideToggleByClass(textarea, false);
			}
		},
		toggleTitleEdit: function ()
		{
			var classList = ['imopenlines-show-inline', 'imopenlines-show-none'],
				titleNode = BX('bx-line-title'),
				input = BX('bx-line-title-input');
			BX.toggleClass(titleNode, classList);
			BX.toggleClass(input, classList);
		},
		toggleExtraContainer: function()
		{
			BX.toggleClass(BX('imol_extra_btn'), ['imopenlines-extra-btn-container-active', '']);
			BX.toggleClass(BX('imol_extra_container'), ['ui-form-border-bottom', '']);
			BX.animationHandler.fadeSlideToggleByClass(BX('imol_setting_container'));

			var value =  BX.hasClass(BX('imol_extra_btn'),'imopenlines-extra-btn-container-active') ? 'Y' : 'N';
			BX('imol_config_opened').setAttribute('value', value);
		},
		toggleBoolInputValue: function(input)
		{
			input.value = input.value === 'Y' ? 'N' : 'Y';
		},

		//binders
		bindEvents: function()
		{
			BX.bind(
				BX('imol_config_edit_form'),
				'submit',
				BX.OpenLinesConfigEdit.addPreloader
			);
			BX.bind(
				BX('bx-title-edit-btn'),
				'click',
				BX.OpenLinesConfigEdit.toggleTitleEdit
			);
			BX.bind(
				BX('bx-line-title-input'),
				'change',
				BX.OpenLinesConfigEdit.changeTitle
			);
			BX.bind(
				BX('imol_crm_create'),
				'change',
				BX.OpenLinesConfigEdit.toggleCrmSourceRule
			);
			BX.bind(
				BX('imol_extra_btn'),
				'click',
				BX.OpenLinesConfigEdit.toggleExtraContainer
			);
			BX.bind(
				BX('imol_no_answer_rule'),
				'change',
				BX.OpenLinesConfigEdit.toggleNoAnswerRule
			);
			BX.bind(
				BX('imol_worktime_dayoff_rule'),
				'change',
				BX.OpenLinesConfigEdit.toggleWorktimeDayoffRule
			);
			BX.bind(
				BX('imol_queue_settings_link'),
				'click',
				BX.OpenLinesConfigEdit.toggleQueueSettingsBlock
			);
			BX.bind(
				BX('imol_auto_action_settings_link'),
				'click',
				BX.OpenLinesConfigEdit.toggleAutoActionSettingsBlock
			);
			BX.bind(
				BX('imol_workers_time_link'),
				'click',
				BX.OpenLinesConfigEdit.toggleWorkersTimeBlock
			);
			BX.bind(
				BX('imol_agreement_message'),
				'change',
				BX.OpenLinesConfigEdit.toggleAgreementBlock
			);
			BX.bind(
				BX('imol_vote_message'),
				'change',
				BX.OpenLinesConfigEdit.toggleVoteBlock
			);
			BX.bind(
				BX('imol_crm_checkbox'),
				'change',
				BX.OpenLinesConfigEdit.toggleCrmBlock
			);
			BX.bind(
				BX('imol_check_online'),
				'change',
				BX.OpenLinesConfigEdit.toggleCheckOnlineBlock
			);
			BX.bind(
				BX('imol_welcome_message'),
				'change',
				BX.OpenLinesConfigEdit.toggleAutoMessageBlock
			);
			BX.bind(
				BX('imol_worktime_checkbox'),
				'change',
				BX.OpenLinesConfigEdit.toggleWorktimeBlock
			);
			BX.bind(
				BX('imol_action_close'),
				'change',
				BX.OpenLinesConfigEdit.actionClose
			);
			BX.bind(
				BX('imol_action_auto_close'),
				'change',
				BX.OpenLinesConfigEdit.actionAutoClose
			);
			BX.bind(BX('imol_queue_type'),
				'change',
				function(e) {
					BX.OpenLinesConfigEdit.changeNoAnswerBox(this);
					BX.OpenLinesConfigEdit.changeNoAnswerBox(this);
					BX.OpenLinesConfigEdit.toggleNoAnswerRule();
				}
			);
			BX.bind(
				BX('imol_limitation_max_chat'),
				'change',
				BX.OpenLinesConfigEdit.toggleQueueMaxChat
			);
			BX.bindDelegate(
				document.body,
				'click',
				{className: 'ui-form-settings-extra-link-item'},
				function (e) {
					var nodeId = this.dataset.itemId;
					if (BX.hasClass(BX('imol_setting_container'), 'invisible'))
					{
						BX.OpenLinesConfigEdit.openExtraContainer();
						setTimeout(function () {
							BX.animationHandler.smoothScroll(BX(nodeId));
						}, 300);
					}
					else
					{
						BX.animationHandler.smoothScroll(BX(nodeId));
					}
				}
			);
		},
		onLoad: function () {
			BX.OpenLinesConfigEdit.toggleNoAnswerRule();
			BX.OpenLinesConfigEdit.toggleWorktimeDayoffRule();
			BX.OpenLinesConfigEdit.actionClose();
			BX.OpenLinesConfigEdit.actionAutoClose();
		}
	};

	window.BX.imolTrialHandler = {
		openPopup : function(dialogId, text)
		{
			if (typeof(B24) != 'undefined' && typeof(B24.licenseInfoPopup) != 'undefined')
			{
				B24.licenseInfoPopup.show(dialogId, BX.message('IMOL_CONFIG_EDIT_POPUP_LIMITED_TITLE'), text);
			}
			else
			{
				alert(text);
			}
		},

		openPopupQueueAll : function () {
			BX.imolTrialHandler.openPopup('imol_queue_all', BX.message('IMOL_CONFIG_EDIT_POPUP_LIMITED_QUEUE_ALL'));
		},

		openPopupQueueVote : function () { //imolOpenTrialPopup("imol_vote"
			BX.imolTrialHandler.openPopup('imol_vote', BX.message('IMOL_CONFIG_EDIT_POPUP_LIMITED_VOTE'));
		},

		init : function () {
			BX.bind(
				BX('imol_queue_all'),
				'click',
				BX.imolTrialHandler.openPopupQueueAll
			);
			BX.bind(
				BX('imol_vote'),
				'click',
				BX.imolTrialHandler.openPopupQueueVote
			);
		}

	};

	window.BX.animationHandler = {
		animate: function(params) //creates animation
		{
			params = params || {};
			var node = params.node || null;

			var p = new BX.Promise();

			if(!BX.type.isElementNode(node))
			{
				p.reject();
				return p;
			}

			var duration = params.duration || 300;

			var rt = {};

			rt.animations = [];

			// add or get animation
			var anim = null;

			if(anim === null)
			{
				var easing = new BX.easing({
					duration : duration,
					start: params.start,
					finish: params.finish,
					transition: BX.easing.transitions.linear,
					step : params.step,
					complete: function()
					{
						// cleanup animation
						for(var k in rt.animations)
						{
							if(rt.animations[k].node == node)
							{
								rt.animations[k].easing = null;
								rt.animations[k].node = null;

								rt.animations.splice(k, 1);

								break;
							}
						}

						node = null;
						anim = null;

						params.complete.call(this);

						if(p)
						{
							p.fulfill();
						}
					}
				});
				anim = {node: node, easing: easing};

				rt.animations.push(anim);
			}
			else
			{
				anim.easing.stop();

				if(p)
				{
					p.reject();
				}
			}

			anim.easing.animate();

			return p;
		},
		animateShowHide: function(params) //node toggle event handler method
		{
			params = params || {};
			var node = params.node || null;

			if(!BX.type.isElementNode(node))
			{
				var p = new BX.Promise();
				p.reject();
				return p;
			}

			var invisible = BX.hasClass(node, 'invisible');
			var way = (typeof params.way == 'undefined' || params.way === null) ? invisible : !!params.way;

			if(invisible != way)
			{
				var p = new BX.Promise();
				p.resolve();
				return p;
			}

			var toShow = params.toShow || {};
			var toHide = params.toHide || {};

			return BX.animationHandler.animate({
				node: node,
				duration: params.duration,
				start: !way ? toShow : toHide,
				finish: way ? toShow : toHide,
				complete: function(){
					BX[!way ? 'addClass' : 'removeClass'](node, 'invisible');
					node.style.cssText = '';

					if(BX.type.isFunction(params.complete))
					{
						params.complete.call(this);
					}
				},
				step: function(state){

					if(typeof state.opacity != 'undefined')
					{
						node.style.opacity = state.opacity/100;
					}
					if(typeof state.height != 'undefined')
					{
						node.style.height = state.height+'px';
					}
					if(typeof state.width != 'undefined')
					{
						node.style.width = state.width+'px';
					}
				}
			});
		},
		fadeSlideToggleByClass: function(node, way, duration, onComplete) //node toggle event handler call with params
		{
			return BX.animationHandler.animateShowHide({
				node: node,
				duration: duration,
				toShow: {opacity: 100, height: BX.animationHandler.getInvisibleSize(node).height},
				toHide: {opacity: 0, height: 0},
				complete: onComplete,
				way: way //false - addClass, true - removeClass
			});
		},
		getInvisibleSize: function(node) //automatically calculates node height
		{
			var invisible = BX.hasClass(node, 'invisible');

			if(invisible)
			{
				BX.removeClass(node, 'invisible');
			}
			var p = BX.pos(node);
			if(invisible)
			{
				BX.addClass(node, 'invisible');
			}

			return p;
		},
		smoothScroll: function (node) {
			var posFrom = BX.GetWindowScrollPos().scrollTop,
				posTo = BX.pos(node).top - Math.round(BX.GetWindowInnerSize().innerHeight / 2),
				toBottom = posFrom < posTo,
				distance = Math.abs(posTo - posFrom),
				speed = Math.round(distance / 100) > 20 ? 20 : Math.round(distance / 100),
				step = 4 * speed,
				posCurrent = toBottom ? posFrom + step : posFrom - step,
				timer = 0;

			if (toBottom)
			{
				for (var i = posFrom; i < posTo; i += step)
				{
					setTimeout("window.scrollTo(0," + posCurrent +")", timer * speed);
					posCurrent += step;
					if (posCurrent > posTo)
					{
						posCurrent = posTo;
					}
					timer++;
				}
			}
			else
			{
				for (var i = posFrom; i > posTo; i -= step)
				{
					setTimeout("window.scrollTo(0," + posCurrent +")", timer * speed);
					posCurrent -= step;
					if (posCurrent < posTo)
					{
						posCurrent = posTo;
					}
					timer++;
				}
			}

		}
	};

	BX.ready(function(){
		BX.imolTrialHandler.init();
		BX.OpenLinesConfigEdit.onLoad();
		BX.OpenLinesConfigEdit.bindEvents();
		BX.OpenLinesConfigEdit.addEventForTooltip();
	});
})(window);