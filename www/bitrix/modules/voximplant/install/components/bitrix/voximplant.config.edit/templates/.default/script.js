;(function(window){
	if (!!window.BX.VoxImplantConfigEdit)
		return;

	var defaults = {
		maximumGroups: 0
	};

	var ajaxUrl = '/bitrix/components/bitrix/voximplant.config.edit/ajax.php';

	/**
	 *
	 * @param {object} params
	 * @param {Node} params.node
	 * @constructor
	 */
	var AccessEdit = function(params)
	{
		this.accessCodes = params.accessCodes || {};
		this.elements = {
			main: params.node,
			addButton: null
		};
		this.init();
	};

	AccessEdit.prototype.init = function()
	{
		BX.Access.Init({other:{disabled:true}});
		this.render();
	};

	AccessEdit.prototype.render = function()
	{
		var self = this;
		var result = document.createDocumentFragment();

		for(var id in this.accessCodes)
		{
			result.appendChild(BX.create("span", {props: {className: "bx-destination bx-destination-users"}, children: [
				BX.create("span", {props: {className: "bx-destination-text"}, text: BX.util.htmlspecialchars(this.accessCodes[id].NAME)}),
				BX.create("span", {
					props: {className: "bx-destination-del-but"},
					events: {
						click: function(e)
						{
							self.deleteAccess(id);
							self.render();
						}
					}
				}),
				BX.create("input", {attrs: {type: "hidden", name: "LINE_ACCESS[]", value: BX.util.htmlspecialchars(id)}})
			]}));
		}

		this.elements.addButton = BX.create("span", {
			props: {className: "bx-destination-add"},
			text: BX.message("VI_CONFIG_LINE_ADD"),
			events: {
				click: this._onAddAccessClick.bind(this)
			}
		});
		result.appendChild(this.elements.addButton);

		BX.cleanNode(this.elements.main);
		this.elements.main.appendChild(result);
	};

	AccessEdit.prototype._onAddAccessClick = function()
	{
		var self = this;

		BX.Access.SetSelected(this.accessCodes, 'voximplantLineAccess');
		BX.Access.ShowForm({
			bind: 'voximplantLineAccess',
			callback: function(data)
			{
				var providerName;
				var accessName;
				for(var provider in data)
				{
					for(var id in data[provider])
					{
						providerName = BX.Access.GetProviderName(data[provider][id].provider);
						accessName = data[provider][id].name;
						self.accessCodes[id] = {
							'PROVIDER': providerName,
							'NAME': accessName
						};
					}
				}
				self.render();
			}
		});
	};

	AccessEdit.prototype.deleteAccess = function(id)
	{
		if(this.accessCodes[id])
			delete this.accessCodes[id];
	};

	BX.VoxImplantConfigEdit = function(params)
	{
		this.node = params.node;
		this.melodies = params.melodies;
		this.accessCodes = params.accessCodes || {};

		this.popupTooltip = {};

		this.groupSliderOpen = false;
		this.currentGroupId = null;
		this.previousGroupId = null;

		this.ivrSliderOpen = false;
		this.currentIvrId = null;
		this.previousIvrId = null;



		this.lineAccessEditor = null;

		this._onTooltipMouseOverHandler = this._onTooltipMouseOver.bind(this);
		this._onTooltipMouseOutHandler = this._onTooltipMouseOut.bind(this);

		this.init();
		this.bindEvents();
	};

	BX.VoxImplantConfigEdit.setDefaults = function (params)
	{
		for (var key in params)
		{
			if (params.hasOwnProperty(key) && defaults.hasOwnProperty(key))
			{
				defaults[key] = params[key];
			}
		}
	};

	BX.VoxImplantConfigEdit.prototype.getNode = function(name, scope)
	{
		if (!scope)
			scope = this.node;

		return scope ? scope.querySelector('[data-role="'+name+'"]') : null;
	};

	BX.VoxImplantConfigEdit.prototype.init = function ()
	{
		this.currentGroupId = this.getNode('select-group').value;
		for (var melodyId in this.melodies)
		{
			if(this.melodies.hasOwnProperty(melodyId))
			{
				this.loadMelody(melodyId, this.melodies[melodyId]);
			}
		}
	};

	BX.VoxImplantConfigEdit.prototype.bindEvents = function ()
	{
		var self = this;
		BX.bind(BX('vi_crm_forward'), 'change', function (e)
		{
			if (BX('vi_crm_forward').checked)
				BX('vi_crm_rule').style.height = '40px';
			else
				BX('vi_crm_rule').style.height = '0';
		});

		var inputDirectCode = BX('input-direct_code');
		if (inputDirectCode)
		{
			BX.bind(BX('input-direct_code'), 'change', function (e)
			{
				if (BX('input-direct_code').checked)
					BX('vi-direct-code-rule').style.height = '40px';
				else
					BX('vi-direct-code-rule').style.height = '0';
			});
		}

		var recordingCheckbox = BX('vi-recording');
		if (recordingCheckbox)
		{
			BX.bind(recordingCheckbox, 'change', function (e)
			{
				if (recordingCheckbox.checked)
					BX('vi-recording-details').style.maxHeight = '160px';
				else
					BX('vi-recording-details').style.maxHeight = 0;
			})
		}

		var transcribeCheckbox = BX('vi_transcribe');
		if (transcribeCheckbox)
		{
			BX.bind(transcribeCheckbox, 'change', function (e)
			{
				if (transcribeCheckbox.checked)
					BX('vi_transcribe_lang').style.height = '40px';
				else
					BX('vi_transcribe_lang').style.height = 0;
			})
		}

		var useBackupNumberCheckbox = BX('vi_use_specific_backup_number');
		if(useBackupNumberCheckbox)
		{
			BX.bind(useBackupNumberCheckbox, 'change', function(e)
			{
				if(useBackupNumberCheckbox.checked)
					BX('vi_backup_number_settings').style.maxHeight = '100px';
				else
					BX('vi_backup_number_settings').style.maxHeight = 0;
			})
		}

		var callbackRedialCheckbox = BX('vi_callback_redial');
		if (callbackRedialCheckbox)
		{
			BX.bind(callbackRedialCheckbox, 'change', function (e)
			{
				if (callbackRedialCheckbox.checked)
					BX('vi_callback_redial_options').style.maxHeight = '100px';
				else
					BX('vi_callback_redial_options').style.maxHeight = 0;
			})
		}

		var canBeSelectedCheckbox = BX('vi_can_be_selected');
		if (canBeSelectedCheckbox)
		{
			BX.bind(canBeSelectedCheckbox, 'change', function (e)
			{
				if(e.target.dataset.locked === "Y")
				{
					BX.Voximplant.showLicensePopup('line-selection');
					e.target.checked = false;
					e.preventDefault();
					return false;
				}

				if (canBeSelectedCheckbox.checked)
					BX('vi_number_selection_option').style.maxHeight = '250px';
				else
					BX('vi_number_selection_option').style.maxHeight = 0;
			});
		}

		var lineAccessContainer = this.getNode("line-access");
		if (lineAccessContainer)
		{
			this.lineAccessEditor = new AccessEdit({
				node: lineAccessContainer,
				accessCodes: this.accessCodes
			});
		}

		var tooltipNodes = BX.findChildrenByClassName(BX('tel-set-main-wrap'), "tel-context-help");
		for (var i = 0; i < tooltipNodes.length; i++)
		{
			tooltipNodes[i].setAttribute('data-id', i);
			BX.bind(tooltipNodes[i], 'mouseover', this._onTooltipMouseOverHandler);
			BX.bind(tooltipNodes[i], 'mouseout', this._onTooltipMouseOutHandler);
		}

		BX.bind(this.getNode('show-group-config'), 'click', this.onShowGroupClick.bind(this));
		BX.bind(this.getNode('show-crm-exception-list'), 'click', this.onShowCrmExceptionListClick.bind(this));
		BX.bind(this.getNode('show-ivr-config'), 'click', this.onShowIvrClick.bind(this));
		BX.bind(this.getNode('select-group'), 'change', this._onGroupIdChanged.bind(this));
		BX.bind(this.getNode('select-ivr'), 'change', this._onIvrIdChanged.bind(this));
		BX.bind(this.getNode('config-edit-submit'), 'click', this._onSubmitClick.bind(this));
		BX.bind(this.getNode('input-line-prefix'), 'input', this._onInputLinePrefixInput.bind(this));

		BX.addCustomEvent(window, 'SidePanel.Slider:onClose', this._onSliderClosed.bind(this));
		BX.addCustomEvent(window, 'SidePanel.Slider:onMessage', this._onSliderMessageReceived.bind(this));
	};

	BX.VoxImplantConfigEdit.prototype.loadMelody = function (curId, params)
	{
		if (typeof params !== "object")
			return;

		var inputName = params.INPUT_NAME || "",
			defaultMelody = params.DEFAULT_MELODY || "",
			mfi = BX["MFInput"] ? BX.MFInput.get(curId) : null;
		BX.bind(BX("config_edit_form").elements["MELODY_LANG"], "change", function ()
		{
			if (!(!!BX("config_edit_form").elements[inputName] && !!BX("config_edit_form").elements[inputName]))
				window.jwplayer(curId + "player_div").load([{file: defaultMelody.replace("#LANG_ID#", this.value)}]);
		});
		BX(curId + 'span').appendChild(BX('file_input_' + curId));
		if (mfi)
		{
			BX.bind(BX(curId + 'default'), "click", function ()
			{
				mfi.clear();
			});
			BX.addCustomEvent(mfi, "onDeleteFile", function ()
			{
				BX.hide(BX(curId + 'default'));
				BX.show(BX(curId + 'notice'));
				window.jwplayer(curId + "player_div").load([{file: defaultMelody.replace("#LANG_ID#", BX("config_edit_form").elements["MELODY_LANG"].value)}]);
			});
			BX.addCustomEvent(mfi, "onUploadDone", function (file, item)
			{
				BX.show(BX(curId + 'default'));
				BX.hide(BX(curId + 'notice'));
				if (!!window["jwplayer"])
				{
					window.jwplayer(curId + "player_div").load([{file: file["url"] + (file["url"].indexOf(".mp3") > 0 ? "" : "&/melody.mp3" )}]);
				}
			});
		}
		else
		{
			BX.bind(BX(curId + 'default'), "click", function ()
			{
				window["FILE_INPUT_" + curId]._deleteFile(BX('config_edit_form').elements[inputName]);
			});
			BX.addCustomEvent(window["FILE_INPUT_" + curId], 'onSubmit', function ()
			{
				BX(curId + 'span').appendChild(
					BX.create('SPAN', {
						attrs: {id: curId + 'waiter'},
						props: {className: "webform-field-upload-list"},
						html: '<i></i>'
					})
				);
			});
			BX.addCustomEvent(window["FILE_INPUT_" + curId], 'onFileUploaderChange', function ()
			{
				window["FILE_INPUT_" + curId].INPUT.disabled = false;
			});
			BX.addCustomEvent(window["FILE_INPUT_" + curId], 'onDeleteFile', function (id)
			{
				BX.hide(BX(curId + 'default'));
				BX(curId + 'notice').innerHTML = BX.message("VI_CONFIG_EDIT_DOWNLOAD_TUNE_TIP");
				window.jwplayer(curId + "player_div").load([{file: defaultMelody.replace("#LANG_ID#", BX("config_edit_form").elements["MELODY_LANG"].value)}]);
				window["FILE_INPUT_" + curId].INPUT.disabled = false;
			});

			BX.addCustomEvent(window["FILE_INPUT_" + curId], 'onDone', function (files, id, err)
			{
				BX.remove(BX(curId + 'waiter'));
				if (!!files && files.length > 0)
				{
					var n = BX(curId + 'notice');
					if (err === false && !!files[0])
					{
						if (id !== 'init')
						{
							n.innerHTML = BX.message('VI_CONFIG_EDIT_UPLOAD_SUCCESS');
							if (!!window["jwplayer"])
							{
								window.jwplayer(curId + "player_div").load([{file: files[0]["fileURL"]}]);
							}
							BX(curId + 'default').style.display = '';
						}
					}
					else if (!!files[0] && files[0]["error"])
					{
						n.innerHTML = files[0]["error"];
					}
				}
			});
		}
	};

	BX.VoxImplantConfigEdit.prototype._onTooltipMouseOver = function (e)
	{
		this.showTooltip(e.target.dataset.id, e.target, e.target.dataset.text);
	};

	BX.VoxImplantConfigEdit.prototype._onTooltipMouseOut = function (e)
	{
		this.hideTooltip(e.target.dataset.id);
	};

	BX.VoxImplantConfigEdit.prototype.showTooltip = function (id, bind, text)
	{
		if (this.popupTooltip[id])
			this.popupTooltip[id].close();

		this.popupTooltip[id] = new BX.PopupWindow('bx-voximplant-tooltip', bind, {
			lightShadow: true,
			autoHide: false,
			darkMode: true,
			offsetLeft: 0,
			offsetTop: 2,
			bindOptions: {position: "top"},
			zIndex: 200,
			events: {
				onPopupClose: function ()
				{
					this.destroy()
				}
			},
			content: BX.create("div", {attrs: {style: "padding-right: 5px; width: 250px;"}, html: text})
		});
		this.popupTooltip[id].setAngle({offset: 13, position: 'bottom'});
		this.popupTooltip[id].show();

		return true;
	};

	BX.VoxImplantConfigEdit.prototype.hideTooltip = function (id)
	{
		this.popupTooltip[id].close();
		this.popupTooltip[id] = null;
	};

	BX.VoxImplantConfigEdit.prototype.onShowGroupClick = function (e)
	{
		this.showGroupSettings({
			groupId: this.getNode('select-group').value
		});
	};

	BX.VoxImplantConfigEdit.prototype.onShowCrmExceptionListClick = function(e)
	{
		BX.SidePanel.Instance.open('/crm/configs/exclusion/');
	};

	BX.VoxImplantConfigEdit.prototype.onShowIvrClick = function (e)
	{
		this.showIvrSettings({
			ivrId: this.getNode('select-ivr').value
		});
	};

	BX.VoxImplantConfigEdit.prototype.showGroupSettings = function (params)
	{
		var groupId = parseInt(params.groupId);
		if (BX.SidePanel.Instance.open("/telephony/editgroup.php?ID=" + groupId, {cacheable: false}))
		{
			this.groupSliderOpen = true;
		}
	};

	BX.VoxImplantConfigEdit.prototype.showIvrSettings = function (params)
	{
		var ivrId = parseInt(params.ivrId);
		if (BX.SidePanel.Instance.open("/telephony/editivr.php?ID=" + ivrId, {cacheable: false}))
		{
			this.ivrSliderOpen = true;
		}
	};

	BX.VoxImplantConfigEdit.prototype._onGroupIdChanged = function (e)
	{
		var groupId = e.target.value;
		var groupCount = e.target.options.length - 2;
		if (groupId === 'new')
		{
			if (defaults.maximumGroups > 0 && groupCount >= defaults.maximumGroups)
			{
				e.target.value = e.target.options.item(2).value;
				BX.Voximplant.showLicensePopup('groups');
			}
			else
			{
				this.showGroupSettings({
					groupId: 0
				})
			}
		}
		this.previousGroupId = this.currentGroupId;
		this.currentGroupId = groupId;
		BX.PreventDefault(e);
	};

	BX.VoxImplantConfigEdit.prototype._onIvrIdChanged = function (e)
	{
		var ivrId = e.target.value;
		if (ivrId === 'new')
		{
			this.showIvrSettings({
				ivrId: 0
			})
		}
		this.previousIvrId = this.currentIvrId;
		this.currentIvrId = ivrId;
		BX.PreventDefault(e);
	};

	BX.VoxImplantConfigEdit.prototype._onSliderClosed = function(event)
	{
		if(this.groupSliderOpen)
		{
			this.groupSliderOpen = false;
			if (this.currentGroupId === 'new')
			{
				this.getNode('select-group').value = this.previousGroupId;
				this.currentGroupId = this.previousGroupId;
			}
		}
		else if(this.ivrSliderOpen)
		{
			if (this.currentIvrId === 'new')
			{
				this.getNode('select-ivr').value = this.previousIvrId;
				this.currentIvrId = this.previousIvrId;
			}
		}
	};

	BX.VoxImplantConfigEdit.prototype._onSliderMessageReceived = function(event)
	{
		var eventId = event.getEventId();

		if(eventId === "QueueEditor::onSave")
		{
			var groupFields = event.getData()['DATA']['GROUP'];
			if(!groupFields['ID'])
			{
				return;
			}
			this.afterGroupSaved(groupFields);
		}
		else if(eventId === "IvrEditor::onSave")
		{
			var ivrFields = event.getData()['ivr'];
			if(!ivrFields['ID'])
			{
				return;
			}
			this.afterIvrSaved(ivrFields);
		}
	};

	BX.VoxImplantConfigEdit.prototype._onSubmitClick = function(e)
	{
		var self = this;

		var saveButton = this.getNode("config-edit-submit");
		var waitNode = BX.create('span', {props : {className : "wait"}});

		BX.addClass(saveButton, "webform-small-button-wait webform-small-button-active");
		saveButton.appendChild(waitNode);

		BX.submit(BX('config_edit_form'));
	};

	/**
	 * @param {Event} e
	 */
	BX.VoxImplantConfigEdit.prototype._onInputLinePrefixInput = function(e)
	{
		var node = e.target;
		node.value = node.value.replace(/[^\d#*]/g,'');
		e.preventDefault();
	};

	BX.VoxImplantConfigEdit.prototype.afterGroupSaved = function(groupFields)
	{
		var groupSelect = this.getNode('select-group');
		var optionFound = false;
		var optionNode;
		for (var i = 0; i < groupSelect.options.length; i++)
		{
			optionNode = groupSelect.options.item(i);
			if (optionNode.value == groupFields.ID)
			{
				optionNode.innerText = BX.util.htmlspecialchars(groupFields.NAME);
				optionFound = true;
				break;
			}
		}
		if (!optionFound)
		{
			groupSelect.add(BX.create('option', {
				attrs: {value: groupFields.ID},
				text: BX.util.htmlspecialchars(groupFields.NAME)
			}));
		}
		groupSelect.value = groupFields.ID;
		this.currentGroupId = groupFields.ID;
	};

	BX.VoxImplantConfigEdit.prototype.afterIvrSaved = function(ivrFields)
	{
		var ivrSelect = this.getNode('select-ivr');
		var optionFound = false;
		var optionNode;
		for (var i = 0; i < ivrSelect.options.length; i++)
		{
			optionNode = ivrSelect.options.item(i);
			if (optionNode.value == ivrFields.ID)
			{
				optionNode.innerText = BX.util.htmlspecialchars(ivrFields.NAME);
				optionFound = true;
				break;
			}
		}
		if (!optionFound)
		{
			ivrSelect.add(BX.create('option', {
				attrs: {value: ivrFields.ID},
				text: BX.util.htmlspecialchars(ivrFields.NAME)
			}));
		}
		ivrSelect.value = ivrFields.ID;
		this.currentIvrId = ivrFields.ID;
	};

	BX.ViCallerId = {

	};

	BX.ViCallerId.init = function(params)
	{
		BX.ViCallerId.inputNumber = params.number;

		BX.ViCallerId.placeholder = params.placeholder;
		BX.ViCallerId.number = params.number;
		BX.ViCallerId.numberFormatted = params.numberFormatted;
		BX.ViCallerId.verified = params.verified;
		BX.ViCallerId.verifiedUntil = params.verifiedUntil;

		BX.ViCallerId.phoneInput = null;
		BX.ViCallerId.codeInput = null;
		BX.ViCallerId.phoneNotice = null;
		BX.ViCallerId.blockAjax = false;
		BX.ViCallerId.blockVerify = false;

		BX.ViCallerId.phoneInputFormatter = null;

		BX.ViCallerId.drawState();

		BX.bind(BX('vi_link_options'), 'click', function(e)
		{
			if (BX('vi_link_options_div').style.display == 'none')
			{
				BX.removeClass(BX(this), 'webform-button-create');
				BX('vi_link_options_div').style.display = 'block';
			}
			else
			{
				BX.addClass(BX(this), 'webform-button-create');
				BX('vi_link_options_div').style.display = 'none';
			}
			BX.PreventDefault(e);
		});
	};

	BX.ViCallerId.drawState = function(params)
	{
		var inputNode = null;
		var codeNode = null;
		var buttonNode = null;
		var noticeNode = null;

		params = typeof (params) == 'object'? params: {};
		params.state = params.state? parseInt(params.state): 1;

		if (params.state == 1)
		{
			inputNode = BX.create("div", {props : { className : "tel-new-num-form" }, children: [
				BX.create("span", { props : { className : "tel-balance-phone-icon" }}),
				BX.create("a", {
					props : { attrs: { href: '#put-phone'},
						className : "tel-balance-phone-url" },
					events:
					{
						click : function(e)
						{
							BX.ViCallerId.drawState({
								state: BX.ViCallerId.number.length <= 0? 2: 3
							});
							return BX.PreventDefault(e);
						}
					},
					html: BX.ViCallerId.number.length <= 0? BX.message('TELEPHONY_PUT_PHONE'): BX.message('TELEPHONY_VERIFY_PHONE')
				}),
				BX.ViCallerId.number.length <= 0? null: BX.create("span", { props : { className : "tel-num-change-text"}, html: ' '+BX.message('TELEPHONY_OR')}),
				BX.ViCallerId.number.length <= 0? null: BX.create("a", {
					props : { attrs: { href: '#change-phone'},
						className : "tel-balance-phone-url" },
					events:
					{
						click : function(e)
						{
							BX.ViCallerId.removePhone();
							return BX.PreventDefault(e);
						}
					},
					html: BX.message('TELEPHONY_PUT_PHONE_AGAING')
				})
			]})
		}
		else if (params.state == 2 || params.state == 3)
		{
			inputNode = BX.create("div", {attrs: {id: 'tel-new-num-form'}, props : { className : "tel-new-num-form "+(params.state == 3? 'tel-new-num-form-disable': '')  }, children: [
				BX.create("span", { props : { className : "tel-balance-phone-icon" }}),
				BX.create("a", {
					props : { attrs: { href: '#put-phone'},
						className : "webform-small-button"},
					events:
					{
						click : params.state == 3? null: function(e)
						{
							BX.ViCallerId.connectPhone(BX.ViCallerId.phoneInputFormatter.getValue());
							return BX.PreventDefault(e);
						}
					},
					children: [
						BX.create("span", { props : { className : "webform-small-button-left" }}),
						BX.create("span", { props : { className : "webform-small-button-text" }, html: BX.message('TELEPHONY_CONFIRM')}),
						BX.create("span", { props : { className : "webform-small-button-right" }})
					]
				}),
				BX.create("div", { props : { className : "tel-new-num-inp-wrap" }, children: [
					BX.ViCallerId.phoneInput = BX.create("input", { props : { className : "tel-new-num-inp"}, attrs: { placeholder: BX.message('TELEPHONY_EXAMPLE'), type: 'text', value: BX.ViCallerId.inputNumber, disabled: params.state == 3}})
				]})
			]});

			BX.ViCallerId.phoneInputFormatter = new BX.PhoneNumber.Input({
				node: BX.ViCallerId.phoneInput
			});

			if (params.state == 2)
			{
				BX.ViCallerId.phoneNotice = noticeNode = BX.create("div", { props : { className : "tel-new-num-notice" }, html: BX.message('TELEPHONY_VERIFY_CODE')+'<br>'+BX.message('TELEPHONY_VERIFY_CODE_4')+'<br><br>'+BX.message('TELEPHONY_VERIFY_CODE_3')});
			}
			else if (params.state == 3)
			{
				BX.ViCallerId.verifyPhone();
				BX.ViCallerId.phoneNotice = noticeNode = BX.create("div", { props : { className : "tel-new-num-notice" }, html: BX.message('TELEPHONY_VERIFY_CODE_2')+'<br>'+BX.message('TELEPHONY_VERIFY_CODE_4')+'<br><br>'+BX.message('TELEPHONY_VERIFY_CODE_3')});
				codeNode = BX.create("div", {props : { className : "tel-new-num-pass" }, children: [
					BX.create("span", { props : { className : "tel-new-num-pass-title" }, html: BX.message('TELEPHONY_PUT_CODE')}),
					BX.create("br"),
					BX.ViCallerId.codeInput = BX.create("input", { props : { className : "tel-new-num-inp"}, attrs: { type: 'text' }}),
					BX.create("a", {
						props : { attrs: { href: '#put-code'},
							className : "webform-small-button webform-small-button-accept" },
						events:
						{
							click : function(e)
							{
								BX.ViCallerId.activatePhone(BX.ViCallerId.codeInput.value);
								return BX.PreventDefault(e);
							}
						},
						children: [
							BX.create("span", { props : { className : "webform-small-button-left" }}),
							BX.create("span", { props : { className : "webform-small-button-text" }, html: BX.message('TELEPHONY_JOIN')}),
							BX.create("span", { props : { className : "webform-small-button-right" }})
						]
					}),
					BX.create("br"),
					BX.create("br"),
					BX.create("br"),
					BX.create("a", {
						attrs: { href: '#put-code', style: 'margin-left: 3px; margin-right: 7px;'},
						props : { className : "webform-small-button" },
						events:
						{
							click : function(e)
							{
								BX.ViCallerId.verifyPhone();
								return BX.PreventDefault(e);
							}
						},
						children: [
							BX.create("span", { props : { className : "webform-small-button-left" }}),
							BX.create("span", { props : { className : "webform-small-button-text" }, html: BX.message('TELEPHONY_RECALL')}),
							BX.create("span", { props : { className : "webform-small-button-right" }})
						]
					}),
					BX.create("a", {
						props : { attrs: { href: '#put-code'},
							className : "webform-small-button" },
						events:
						{
							click : function(e)
							{
								BX.ViCallerId.removePhone();
								return BX.PreventDefault(e);
							}
						},
						children: [
							BX.create("span", { props : { className : "webform-small-button-left" }}),
							BX.create("span", { props : { className : "webform-small-button-text" }, html: BX.message('TELEPHONY_PUT_PHONE_AGAING')}),
							BX.create("span", { props : { className : "webform-small-button-right" }})
						]
					})
				]});
				buttonNode = null;
			}
		}

		var nodes = [];
		if (BX.ViCallerId.number.length <= 0 || !BX.ViCallerId.verified)
		{
			var inputText = null;
			if (BX.ViCallerId.number.length <= 0)
			{
				inputText = BX.create("div", { props : { className : "tel-balance-text" }, children: [
					BX.create("span", { props : { className : "tel-balance-text-bold"}, html: BX.message('TELEPHONY_EMPTY_PHONE') }),
					BX.create("span", { html: BX.message('TELEPHONY_EMPTY_PHONE_DESC')})
				]});
			}
			else
			{
				inputText = BX.create("div", { children: [
					BX.create("div", { props : { className : "tel-num-not-conf-text"}, html: BX.message('TELEPHONY_CONFIRM_PHONE') }),
					BX.create("div", { props : { className : "tel-num-not-conf-block tel-num-block"}, html: BX.ViCallerId.numberFormatted }),
					BX.create("div", { props : { className : "tel-balance-text" }, children: [
						BX.create("strong", { html: BX.message('TELEPHONY_EMPTY_PHONE_DESC')})
					]})
				]});
			}

			nodes = [
				BX.create("div", { props : { className : "tel-new-num-block" }, children : [
					inputText,
					inputNode,
					noticeNode,
					codeNode,
					buttonNode
				]})
			];
		}
		else
		{
			nodes = [
				BX.create("div", { props : { className : "tel-balance-text" }, children: [
					BX.create("strong", { props : { className : "tel-balance-text-bold"}, html: BX.message('TELEPHONY_PHONE') })
				]}),
				BX.create("div", { props : { className : "tel-num-block"}, html: BX.ViCallerId.numberFormatted }),
				BX.create("div", { props : { className : "tel-num-change-block" }, children: [
					BX.create("span", { props : { className : "tel-num-change-text"}, html: BX.message('TELEPHONY_JOIN_TEXT')+" "}),
					BX.create("a", {
						props : { attrs: { href: '#change-phone'},
							className : "tel-num-change-link" },
						events:
						{
							click : function(e)
							{
								if (confirm(BX.message('TELEPHONY_DELETE_CONFIRM')))
								{
									BX.ViCallerId.removePhone();
								}
								return BX.PreventDefault(e);
							}
						},
						html: BX.message('TELEPHONY_REJOIN')
					})
				]}),
				BX.create("div", { props : { className : "tel-set-item-block" }, children: [
					BX.create("span", { props : { className : "tel-num-alert-text"}, html: BX.message('TELEPHONY_CONFIRM_DATE').replace('#DATE#', '<b>'+BX.ViCallerId.verifiedUntil+'</b>') })
				]})
			];
		}

		BX.ViCallerId.drawOnPlaceholder(nodes);
	};

	BX.ViCallerId.connectPhone = function(number)
	{
		if (BX.ViCallerId.blockAjax)
			return false;

		BX.showWait();
		BX.ViCallerId.blockAjax = true;

		if (BX('tel-new-num-form'))
		{
			BX.addClass(BX('tel-new-num-form'), 'tel-new-num-form-disable');
		}

		BX.ajax({
			url: ajaxUrl,
			method: 'POST',
			dataType: 'json',
			timeout: 30,
			data: {'VI_CONNECT': 'Y', 'NUMBER': number, 'VI_AJAX_CALL' : 'Y', 'sessid': BX.bitrix_sessid()},
			onsuccess: BX.delegate(function(data)
			{
				BX.closeWait();
				BX.ViCallerId.blockAjax = false;
				if (data.ERROR == '')
				{
					BX.ViCallerId.inputNumber = number;
					if (data.VERIFIED)
					{
						BX.ViCallerId.number = data.NUMBER;
						BX.ViCallerId.verified = true;
						BX.ViCallerId.verifiedUntil = data.VERIFIED_UNTIL;
						BX.ViCallerId.drawState({state: 1});
					}
					else
					{
						BX.ViCallerId.verified = false;
						BX.ViCallerId.drawState({state: 3});
					}
				}
				else
				{
					BX.addClass(BX.ViCallerId.phoneNotice, 'tel-new-num-notice-err');
					BX.ViCallerId.phoneNotice.innerHTML = data.ERROR == 'MONEY_LOW'? BX.message('TELEPHONY_ERROR_MONEY_LOW'): BX.message('TELEPHONY_ERROR_PHONE');

					BX.addClass(BX.ViCallerId.phoneInput, 'tel-new-num-inp-err');
					BX.removeClass(BX('tel-new-num-form'), 'tel-new-num-form-disable');
				}
			}, this),
			onfailure: function(){
				BX.closeWait();
				BX.ViCallerId.blockAjax = false;
			}

		});
	};

	BX.ViCallerId.verifyPhone = function()
	{
		if (BX.ViCallerId.blockAjax)
			return false;

		if (BX.ViCallerId.blockVerify)
		{
			BX.Voximplant.alert(BX.message('VI_CONFIG_EDIT_ERROR'), BX.message('TELEPHONY_VERIFY_ALERT'));
			return true;
		}
		setTimeout(function(){
			BX.ViCallerId.blockVerify = false;
		}, 60000);
		BX.ViCallerId.blockVerify = true;

		BX.showWait();
		BX.ViCallerId.blockAjax = true;
		BX.ajax({
			url: ajaxUrl,
			method: 'POST',
			dataType: 'json',
			timeout: 30,
			data: {'VI_VERIFY': 'Y', 'VI_AJAX_CALL' : 'Y', 'sessid': BX.bitrix_sessid()},
			onsuccess: function(data){
				BX.closeWait();
				BX.ViCallerId.blockAjax = false;
				if (data.ERROR == '185' || data.ERROR == '183')
				{
					BX.Voximplant.alert(BX.message('VI_CONFIG_EDIT_ERROR'), BX.message('TELEPHONY_ERROR_BLOCK'));
					BX.ViCallerId.removePhone();
				}
			},
			onfailure: function(){
				BX.closeWait();
				BX.ViCallerId.blockVerify = false;
				BX.ViCallerId.blockAjax = false;
			}
		});
	};

	BX.ViCallerId.activatePhone = function(code)
	{
		if (BX.ViCallerId.blockAjax)
			return false;

		BX.showWait();
		BX.ViCallerId.blockAjax = true;
		BX.ajax({
			url: ajaxUrl,
			method: 'POST',
			dataType: 'json',
			timeout: 30,
			data: {'VI_ACTIVATE': 'Y', 'CODE': code, 'VI_AJAX_CALL' : 'Y', 'sessid': BX.bitrix_sessid()},
			onsuccess: BX.delegate(function(data)
			{
				BX.ViCallerId.blockVerify = false;
				BX.closeWait();
				BX.ViCallerId.blockAjax = false;
				if (data.ERROR == '')
				{
					BX.ViCallerId.number = data.NUMBER;
					BX.ViCallerId.numberFormatted = data.NUMBER_FORMATTED;
					BX.ViCallerId.verified = true;
					BX.ViCallerId.verifiedUntil = data.VERIFIED_UNTIL;
					BX.ViCallerId.drawState({state: 1});
				}
				else
				{
					BX.Voximplant.alert(BX.message('VI_CONFIG_EDIT_ERROR'), BX.message('TELEPHONY_WRONG_CODE'));
					BX.addClass(BX.ViCallerId.codeInput, 'tel-new-num-inp-err');
				}
			}, this),
			onfailure: function(){
				BX.closeWait();
				BX.ViCallerId.blockVerify = false;
				BX.ViCallerId.blockAjax = false;
			}
		});
	};

	BX.ViCallerId.removePhone = function()
	{
		if (BX.ViCallerId.blockAjax)
			return false;

		BX.ViCallerId.blockVerify = false;

		BX.showWait();
		BX.ViCallerId.blockAjax = true;
		BX.ajax({
			url: ajaxUrl,
			method: 'POST',
			dataType: 'json',
			timeout: 30,
			data: {'VI_REMOVE': 'Y', 'VI_AJAX_CALL' : 'Y', 'sessid': BX.bitrix_sessid()},
			onsuccess: BX.delegate(function(data)
			{
				BX.closeWait();
				BX.ViCallerId.blockAjax = false;
				if (data.ERROR == '')
				{
					BX.ViCallerId.number = '';
					BX.ViCallerId.verified = false;
					BX.ViCallerId.drawState({state: 1});
				}
				else
				{
					BX.Voximplant.alert(BX.message('VI_CONFIG_EDIT_ERROR'), BX.message('TELEPHONY_ERROR_REMOVE'));
				}
			}, this),
			onfailure: function(){
				BX.closeWait();
				BX.ViCallerId.blockAjax = false;
			}
		});
	};

	BX.ViCallerId.drawOnPlaceholder = function(children)
	{
		BX.ViCallerId.placeholder.innerHTML = '';
		BX.adjust(BX.ViCallerId.placeholder, {children: children});
	};

})(window);

(function()
{
	if(BX.Voximplant.Sip)
		return;

	BX.Voximplant.Sip = function(regId)
	{
		this.regId = regId;

		this.elements = {
			'regStatus': BX('vi_sip_reg_status'),
			'regStatusText': BX('vi_sip_reg_status_desc'),
			'regNeedUpdate': BX('vi_sip_reg_need_update'),
			'addFields': document.querySelector(".js-tel-set-sip-additional-fields")
		};
		this.init();
		this.checkStatus();
	};

	BX.Voximplant.Sip.prototype.init = function()
	{
		this.elements.addFields.addEventListener("click", function()
		{
			BX.addClass(BX("vi-tel-sip-show-additional-fields"), "tel-set-sip-additional-fields-hidden");
			BX.removeClass(BX("vi-tel-sip-additional-fields"), "tel-set-sip-additional-fields-hidden");
		});
	};

	BX.Voximplant.Sip.prototype.checkStatus = function()
	{
		var self = this;
		BX.showWait();
		BX.ajax({
			url: '/bitrix/components/bitrix/voximplant.config.edit/ajax.php?VI_SIP_CHECK',
			method: 'POST',
			dataType: 'json',
			timeout: 60,
			data: {'VI_SIP_CHECK': 'Y', 'REG_ID': this.regId, 'VI_AJAX_CALL' : 'Y', 'sessid': BX.bitrix_sessid()},
			onsuccess: BX.delegate(function(data)
			{
				if (data.ERROR == '')
				{
					BX.closeWait();

					if (data.REG_STATUS == 'in_progress')
					{
						setTimeout(function(){
							self.checkStatus();
						}, 30000)
					}

					self.elements.regStatus.title = data.REG_LAST_UPDATED? BX.message('VI_CONFIG_SIP_LAST_UPDATED').replace('#DATE#', data.REG_LAST_UPDATED): '';
					self.elements.regStatus.className = 'tel-set-sip-reg-status-result tel-set-sip-reg-status-result-'+data.REG_STATUS;
					self.elements.regStatus.innerHTML = BX.message('VI_CONFIG_SIP_C_STATUS_'+data.REG_STATUS.toUpperCase());
					self.elements.regStatusText.innerHTML = BX.message('VI_CONFIG_SIP_C_STATUS_'+data.REG_STATUS.toUpperCase()+'_DESC');

					if (data.REG_STATUS == 'error')
					{
						self.elements.regStatusText.innerHTML = self.elements.regStatusText.innerHTML+'<br><br>'+(data.REG_LAST_UPDATED? BX.message('VI_CONFIG_SIP_ERROR').replace('#DATE#', data.REG_LAST_UPDATED).replace('#CODE#', data.REG_CODE).replace('#MESSAGE#', data.REG_ERROR_MESSAGE): '');
						self.elements.regNeedUpdate.value = 'Y';
					}
				}
				else
				{
					self.elements.regStatus.title = '';
					self.elements.regStatus.className = 'tel-set-sip-reg-status-result tel-set-sip-reg-status-result-error';
					self.elements.regStatus.innerHTML = BX.message('VI_CONFIG_SIP_C_STATUS_ERROR');
					self.elements.regStatusText.innerHTML = BX.message('VI_CONFIG_SIP_ERROR').replace('#DATE#', 'n/a').replace('#CODE#', 'ACCOUNT_ERROR').replace('#MESSAGE#', data.ERROR);
					self.elements.regNeedUpdate.value = 'Y';
				}
			}, this),
			onfailure: function(){
				BX.closeWait();
				self.elements.regStatus.title = '';
				self.elements.regStatus.className = 'tel-set-sip-reg-status-result tel-set-sip-reg-status-result-error';
				self.elements.regStatus.innerHTML = BX.message('VI_CONFIG_SIP_C_STATUS_ERROR');
				self.elements.regStatusText.innerHTML = BX.message('VI_CONFIG_SIP_C_STATUS_ERROR_DESC');
				self.elements.regNeedUpdate.value = 'Y';
			}
		});
	};
})();

