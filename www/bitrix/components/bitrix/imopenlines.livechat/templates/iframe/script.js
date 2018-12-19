function LiveChatBackend(params)
{
	this.init = function(params)
	{
		this.initParams = params;

		this.timeout = {};

		// Post message
		this.postMessageDomain = null;
		this.postMessageOrigin = null;
		this.postMessageSource = null;

		// Process parameters from top window
		this.initFrameParameters();

		// Start listener of resize events
		this.initEvent();
	};

	this.initFrameParameters = function()
	{
		if(!this.isFrame())
		{
			return;
		}

		if(!window.location.hash)
		{
			return;
		}

		var frameParameters = {};
		try
		{
			frameParameters = JSON.parse(decodeURIComponent(window.location.hash.substring(1)));
		}
		catch (err){}

		if(frameParameters.domain)
		{
			this.postMessageDomain = frameParameters.domain;
		}
	};

	this.isFrame = function()
	{
		return window != window.top;
	};

	this.initEvent = function()
	{
		if(!this.isFrame())
		{
			return;
		}

		if(typeof window.postMessage === 'function')
		{
			BX.bind(window, 'message', BX.proxy(function(event){
				if(event && event.origin == this.postMessageDomain)
				{
					var data = {};
					try { data = JSON.parse(event.data); } catch (err){}
					if (data.action == 'init')
					{
						this.uniqueLoadId = data.uniqueLoadId;
						this.postMessageSource = event.source;
						this.postMessageOrigin = event.origin;
						this.postMessageStartShowed = data.showed;

						var initMessage = {};

						initMessage['uniqueLoadId'] = this.uniqueLoadId;
						initMessage['action'] = 'init';
						initMessage['title'] = this.initParams.LINE_NAME;
						initMessage['connectors'] = this.initParams.CONNECTORS;
						initMessage['queue'] = this.initParams.QUEUE;
						initMessage['showedDialog'] = this.showedDialog? 'Y':'N';
						if (this.initParams.ERROR_CODE)
						{
							initMessage['errorCode'] = this.initParams.ERROR_CODE;
						}
						this.sendDataToFrameHolder(initMessage);

						if (typeof(BXIM) != 'undefined')
						{
							BXIM.messenger.popupMessengerTextarea.value = data.textarea;
							BXIM.messenger.textareaCheckText();
							if (this.postMessageStartShowed)
							{
								setTimeout(function(){
									BXIM.messenger.popupMessengerTextarea.focus();
								}, 200);
							}
						}
						else
						{
							BX.addCustomEvent("onImInit", BX.delegate(function(BxImObject) {
								BxImObject.messenger.popupMessengerTextarea.value = data.textarea;
								BxImObject.messenger.textareaCheckText();
								if (this.postMessageStartShowed)
								{
									setTimeout(function(){
										BxImObject.messenger.popupMessengerTextarea.focus();
									}, 200);
								}
							}, this));
						}
					}
					else if (data.action == 'message')
					{
						BXIM.messenger.popupMessengerTextarea.value = data.text;
						BXIM.messenger.sendMessage(BXIM.messenger.currentTab);
					}
					else if (data.action == 'textareaFocus')
					{
						setTimeout(function(){
							if (typeof(BXIM) != 'undefined')
							{
								BXIM.messenger.popupMessengerTextarea.focus();
							}
						}, 200);
					}
				}
			}, this));
		}

		BX.addCustomEvent("onImTextareaFocus", BX.delegate(function(focus)
		{
			var initMessage = {};
			initMessage['uniqueLoadId'] = this.uniqueLoadId;
			initMessage['action'] = focus? 'textareaFocused': 'textareaBlured';
			this.sendDataToFrameHolder(initMessage);

		}, this));
		BX.addCustomEvent("onImDrawTab", BX.delegate(function(params)
		{
			if (params.hasMessage)
			{
				this.showedDialog = true;
				var initMessage = {};
				initMessage['uniqueLoadId'] = this.uniqueLoadId;
				initMessage['action'] = 'showDialog';
				this.sendDataToFrameHolder(initMessage);
			}
		}, this));
		BX.addCustomEvent("onImBeforeMessageSend", BX.delegate(function()
		{
			var initMessage = {};
			initMessage['uniqueLoadId'] = this.uniqueLoadId;
			initMessage['action'] = 'sendMessage';
			this.sendDataToFrameHolder(initMessage);
		}, this));
		BX.addCustomEvent("onImMessageRead", BX.delegate(function()
		{
			var initMessage = {};
			initMessage['uniqueLoadId'] = this.uniqueLoadId;
			initMessage['action'] = 'readMessage';
			this.sendDataToFrameHolder(initMessage);
		}, this));
		BX.addCustomEvent("onImMessageReceive", BX.delegate(function()
		{
			var initMessage = {};
			initMessage['uniqueLoadId'] = this.uniqueLoadId;
			initMessage['action'] = 'receiveMessage';
			this.sendDataToFrameHolder(initMessage);
		}, this));
		BX.addCustomEvent("onImResizeTextarea", BX.delegate(function()
		{
			var initMessage = {};
			initMessage['uniqueLoadId'] = this.uniqueLoadId;
			initMessage['action'] = 'resizeTextarea';
			this.sendDataToFrameHolder(initMessage);
		}, this));
		BX.addCustomEvent("onImOpenFileMenu", BX.delegate(function()
		{
			var initMessage = {};
			initMessage['uniqueLoadId'] = this.uniqueLoadId;
			initMessage['action'] = 'openFileMenu';
			this.sendDataToFrameHolder(initMessage);
		}, this));
		BX.addCustomEvent("onImOpenSmileMenu", BX.delegate(function()
		{
			var initMessage = {};
			initMessage['uniqueLoadId'] = this.uniqueLoadId;
			initMessage['action'] = 'openSmileMenu';
			this.sendDataToFrameHolder(initMessage);
		}, this));
		BX.addCustomEvent("onImOpenFrameDialog", BX.delegate(function()
		{
			var initMessage = {};
			initMessage['uniqueLoadId'] = this.uniqueLoadId;
			initMessage['action'] = 'openFrameDialog';
			this.sendDataToFrameHolder(initMessage);
		}, this));
	};

	this.sendDataToFrameHolder = function(data)
	{
		var encodedData = JSON.stringify(data);
		if (!this.postMessageOrigin)
		{
			clearTimeout(this.timeout[encodedData]);
			this.timeout[encodedData] = setTimeout(BX.delegate(function(){
				this.sendDataToFrameHolder(data);
			}, this), 10);
			return true;
		}
		if(typeof window.postMessage === 'function')
		{
			if(this.postMessageSource)
			{
				this.postMessageSource.postMessage(
					encodedData,
					this.postMessageOrigin
				);
			}
		}

		var ie = 0 /*@cc_on + @_jscript_version @*/;
		if(ie)
		{
			var url = window.location.hash.substring(1);
			top.location = url.substring(0, url.indexOf('#')) + '#' + encodedData;
		}
	};

	this.init(params);
}

function ImExtendLinesLivechatFormShow(type, stage, params)
{
	var showCustomPhoneInput = (BX.message('PHONE_BASE_LANG') == 'ru' || BX.message('PHONE_BASE_LANG') == 'ua');

	if (this.popupMessengerLiveChatFormStage == type+'-'+stage)
	{
		return true;
	}

	if (type != 'done')
	{
		this.popupMessengerDialog.className = "bx-messenger-box-dialog bx-messenger-chat-livechat";
	}

	this.popupMessengerLiveChatFormType = type;
	this.popupMessengerLiveChatFormStage = type+'-'+stage;
	this.popupMessengerBodyLiveChatForm.className = "bx-messenger-livechat-form";

	clearTimeout(this.popupMessengerLiveChatActionTimeout);

	var livechatSession = BX.MessengerCommon.livechatGetSession(this.currentTab.toString().substr(4));
	if (livechatSession.showForm == 'N')
	{
	}
	else if (type == 'offline')
	{
		if (typeof(this.phones[this.BXIM.userId]) != 'undefined' || this.BXIM.userEmail)
		{
			return false;
		}
		if (!stage || stage == 1)
		{
			BX.cleanNode(this.popupMessengerBodyLiveChatForm);
			BX.adjust(this.popupMessengerBodyLiveChatForm, {children: [
				BX.create("div", { props : { className : "bx-messenger-livechat-form-wrap" }, children: [
					BX.create("div", { props : { className : "bx-messenger-livechat-form-close" }, events: {click: BX.delegate(function(){
						this.linesLivechatFormHide();
					}, this)}}),
					BX.create("div", { props : { className : "bx-messenger-livechat-form-text-wrap" }, children: [
						BX.create("div", { props : { className : "bx-messenger-livechat-form-text" }, html: BX.message('IMOL_LIVECHAT_FORM_TITLE_OFFLINE')}),
						BX.create("input", { attrs: {type: 'hidden', name: 'form', value: 'offline'}, props : { className : "bx-messenger-livechat-form-input bx-messenger-livechat-form-input-form bx-messenger-livechat-form-input-hidden" }})
					]}),
					BX.create("div", { props : { className : "bx-messenger-livechat-form-input-wrap" }, children: [
						BX.create("input", { attrs: {placeholder: BX.message('IMOL_LIVECHAT_FORM_INPUT_EMAIL'), name: 'email'}, props : { className : "bx-messenger-livechat-form-input bx-messenger-livechat-form-input-email" }, events: {keydown: BX.delegate(function(event){
							this.tooltipClose();

							if (event.keyCode == 9 || event.keyCode == 13)
							{
								this.linesLivechatFormShow('offline', 2);
							}

							if (event.ctrlKey || event.metaKey || event.shiftKey)
							{
								return true;
							}

							if (event.keyCode == 13)
							{
								BX.proxy_context.parentNode.nextSibling.firstChild.nextSibling.focus();
								if (!BX.proxy_context.value || !BX.proxy_context.value.match(/^(.*)@(.*)\.[a-zA-Z]{2,}$/))
								{
									setTimeout(BX.proxy(function(){
										var item = BX.findChildByClassName(this.popupMessengerBodyLiveChatForm, "bx-messenger-livechat-form-input-email");
										this.tooltip(item, BX.message('IMOL_LIVECHAT_FORM_INPUT_EMAIL_ERROR'), {offsetTop: 10, offsetLeft: 12});
									}, this), 500);
								}
							}

							clearTimeout(this.popupMessengerLiveChatActionTimeout);
							this.popupMessengerLiveChatActionTimeout = setTimeout(BX.proxy(function(){
								this.linesLivechatFormShow('offline', 2);
							}, this), 500);

						}, this), blur: BX.delegate(function(){
							if (!BX.proxy_context.value || !BX.proxy_context.value.match(/^(.*)@(.*)\.[a-zA-Z]{2,}$/))
							{
								clearTimeout(this.popupMessengerLiveChatActionTimeout);
								this.popupMessengerLiveChatActionTimeout = setTimeout(BX.delegate(function(){
									var item = BX.findChildByClassName(this.popupMessengerBodyLiveChatForm, "bx-messenger-livechat-form-input-email");
									this.tooltip(item, BX.message('IMOL_LIVECHAT_FORM_INPUT_EMAIL_ERROR'), {offsetTop: 10, offsetLeft: 12});
								},this), 500);
							}
						}, this)}})
					]}),
					BX.create("div", { props : { className : "bx-messenger-livechat-form-input-wrap" }, children: [
						BX.create("span", { props : { className : "bx-messenger-livechat-form-input-flag" }}),
						BX.create("input", { attrs: {name: showCustomPhoneInput? "": "phone", placeholder: BX.message('IMOL_LIVECHAT_FORM_INPUT_PHONE')}, props : { className : "bx-messenger-livechat-form-input bx-messenger-livechat-form-input-phone", value : BX.message('PHONE_CODE') }, events: {keydown: BX.delegate(function(){
							if (event.keyCode == 13)
							{
								BX.proxy_context.parentNode.nextSibling.firstChild.focus();
							}
						}, this)}}),
						showCustomPhoneInput? BX.create("input", { attrs: {type: 'hidden', name: 'phone'}, props : { className : "bx-messenger-livechat-form-input bx-messenger-livechat-form-input-hidden" }}): null
					]}),
					BX.create("div", { props : { className : "bx-messenger-livechat-form-input-wrap" }, children: [
						BX.create("input", { attrs: {placeholder: BX.message('IMOL_LIVECHAT_FORM_INPUT_NAME'), name: 'name', value: (this.BXIM.messenger.users[this.BXIM.userId].name == BX.message('DEFAULT_GUEST_NAME')? '': this.BXIM.messenger.users[this.BXIM.userId].name)}, props : { className : "bx-messenger-livechat-form-input bx-messenger-livechat-form-input-name" }, events: {keydown: BX.delegate(function(){
							if (event.keyCode == 13)
							{
								BX.proxy_context.parentNode.nextSibling.firstChild.focus();
							}
						}, this)}})
					]}),
					BX.create("div", { props : { className : "bx-messenger-livechat-form-submit-wrap" }, children: [
						BX.create("input", { attrs: {type: 'button', value: BX.message('IMOL_LIVECHAT_FORM_BUTTON_SEND')}, props : { className : "bx-messenger-livechat-form-submit" }, events: {click: BX.delegate(function(event){
							var item = BX.findChildByClassName(this.popupMessengerBodyLiveChatForm, "bx-messenger-livechat-form-input-email");
							if (!item.value || !item.value.match(/^(.*)@(.*)\.[a-zA-Z]{2,}$/))
							{
								this.tooltip(item, BX.message('IMOL_LIVECHAT_FORM_INPUT_EMAIL_ERROR'), {offsetTop: 10, offsetLeft: 12});
								item.focus();
							}
							else
							{
								var config = {};
								BX.findChildrenByClassName(this.popupMessengerBodyLiveChatForm, "bx-messenger-livechat-form-input").forEach(function(item){
									if (!item.name)
										return false;

									item.name = item.name.toUpperCase();
									config[item.name] = item.value;

									return true;
								});
								this.linesLivechatFormShow('done', 1, {text: BX.message('IMOL_LIVECHAT_FORM_RESULT_OFFLINE'), values: config});
							}
							return BX.PreventDefault(event);
						}, this)}})
					]})
				]})
			]});
			BX.defer(function(){
				this.popupMessengerDialog.classList.add('bx-messenger-livechat-form-offline-1');
				this.popupMessengerBodyLiveChatForm.classList.add('bx-messenger-livechat-form-active');

				var item = BX.findChildByClassName(this.popupMessengerBodyLiveChatForm, "bx-messenger-livechat-form-input-phone");

				if (showCustomPhoneInput)
				{
					new BXMaskedPhone({
						url: BX.message('PHONE_BASE_PATH'),
						country: BX.message('PHONE_BASE_LANG'),
						'maskedInput': {
							input: item,
							dataInput: item.nextElementSibling
						},
						'flagNode': item.previousElementSibling,
						'flagSize': 24
					});
				}
				else
				{
					item.previousElementSibling.style.display = 'none';
					item.style.paddingLeft = '13px';
				}
			}, this)();
		}
		if (stage == 2)
		{
			BX.defer(function(){
				this.popupMessengerDialog.classList.add('bx-messenger-livechat-form-offline-2');
				this.popupMessengerBodyLiveChatForm.classList.add('bx-messenger-livechat-form-active');
			}, this)();
		}
	}
	else if (type == 'welcome')
	{
		if (
			typeof(this.phones[this.BXIM.userId]) != 'undefined'
			|| this.BXIM.userEmail
			|| this.users[this.BXIM.userId].name != BX.message('DEFAULT_GUEST_NAME')
		)
		{
			return false;
		}
		if (!stage || stage == 1)
		{
			BX.cleanNode(this.popupMessengerBodyLiveChatForm);
			BX.adjust(this.popupMessengerBodyLiveChatForm, {children: [
				BX.create("div", { props : { className : "bx-messenger-livechat-form-wrap" }, children: [
					BX.create("div", { props : { className : "bx-messenger-livechat-form-close" }, events: {click: BX.delegate(function(){
						this.linesLivechatFormHide();
					}, this)}}),
					BX.create("div", { props : { className : "bx-messenger-livechat-form-text-wrap" }, children: [
						BX.create("div", { props : { className : "bx-messenger-livechat-form-text" }, html: BX.message('IMOL_LIVECHAT_FORM_TITLE_WELCOME')}),
						BX.create("input", { attrs: {type: 'hidden', name: 'form', value: 'welcome'}, props : { className : "bx-messenger-livechat-form-input bx-messenger-livechat-form-input-form bx-messenger-livechat-form-input-hidden" }})
					]}),
					BX.create("div", { props : { className : "bx-messenger-livechat-form-input-wrap" }, children: [
						BX.create("input", { attrs: {placeholder: BX.message('IMOL_LIVECHAT_FORM_INPUT_NAME'), name: 'name'}, props : { className : "bx-messenger-livechat-form-input bx-messenger-livechat-form-input-name" }, events: {keydown: BX.delegate(function(event){
							if (event.keyCode == 9 || event.keyCode == 13)
							{
								this.linesLivechatFormShow('welcome', 2);
							}
							if (event.keyCode == 13)
							{
								BX.proxy_context.parentNode.nextSibling.firstChild.focus();
							}
							if (event.ctrlKey || event.metaKey || event.shiftKey)
							{
								return true;
							}
							clearTimeout(this.popupMessengerLiveChatActionTimeout);
							this.popupMessengerLiveChatActionTimeout = setTimeout(BX.proxy(function(){
								this.linesLivechatFormShow('welcome', 2);
							}, this), 500);
						}, this)}})
					]}),
					BX.create("div", { props : { className : "bx-messenger-livechat-form-input-wrap" }, children: [
						BX.create("input", { attrs: {placeholder: BX.message('IMOL_LIVECHAT_FORM_INPUT_EMAIL'), name: 'email'}, props : { className : "bx-messenger-livechat-form-input bx-messenger-livechat-form-input-email" }, events: {keydown: BX.delegate(function(event){
							if (event.keyCode == 13)
							{
								BX.proxy_context.parentNode.nextSibling.firstChild.nextSibling.focus();
								if (BX.proxy_context.value && !BX.proxy_context.value.match(/^(.*)@(.*)\.[a-zA-Z]{2,}$/))
								{
									setTimeout(BX.proxy(function(){
										var item = BX.findChildByClassName(this.popupMessengerBodyLiveChatForm, "bx-messenger-livechat-form-input-email");
										this.tooltip(item, BX.message('IMOL_LIVECHAT_FORM_INPUT_EMAIL_ERROR'), {offsetTop: 10, offsetLeft: 12});
									}, this), 500);
								}
							}
						}, this), blur: BX.delegate(function(){
							if (BX.proxy_context.value && !BX.proxy_context.value.match(/^(.*)@(.*)\.[a-zA-Z]{2,}$/))
							{
								clearTimeout(this.popupMessengerLiveChatActionTimeout);
								this.popupMessengerLiveChatActionTimeout = setTimeout(BX.delegate(function(){
									var item = BX.findChildByClassName(this.popupMessengerBodyLiveChatForm, "bx-messenger-livechat-form-input-email");
									this.tooltip(item, BX.message('IMOL_LIVECHAT_FORM_INPUT_EMAIL_ERROR'), {offsetTop: 10, offsetLeft: 12});
								},this), 500);
							}
						}, this)}})
					]}),
					BX.create("div", { props : { className : "bx-messenger-livechat-form-input-wrap" }, children: [
						BX.create("span", { props : { className : "bx-messenger-livechat-form-input-flag" }}),
						BX.create("input", { attrs: {name: showCustomPhoneInput? "": "phone", placeholder: BX.message('IMOL_LIVECHAT_FORM_INPUT_PHONE')}, props : { className : "bx-messenger-livechat-form-input bx-messenger-livechat-form-input-phone", value : BX.message('PHONE_CODE') }, events: {keydown: BX.delegate(function(){
							if (event.keyCode == 13)
							{
								BX.proxy_context.parentNode.nextSibling.firstChild.focus();
							}
						}, this)}}),
						showCustomPhoneInput? BX.create("input", { attrs: {type: 'hidden', name: 'phone'}, props : { className : "bx-messenger-livechat-form-input bx-messenger-livechat-form-input-hidden" }}): null
					]}),
					BX.create("div", { props : { className : "bx-messenger-livechat-form-submit-wrap" }, children: [
						BX.create("input", { attrs: {type: 'button', value: BX.message('IMOL_LIVECHAT_FORM_BUTTON_SEND')}, props : { className : "bx-messenger-livechat-form-submit" }, events: {click: BX.delegate(function(event){
							var done = true;
							var item = BX.findChildByClassName(this.popupMessengerBodyLiveChatForm, "bx-messenger-livechat-form-input-email");
							if (item.value && !item.value.match(/^(.*)@(.*)\.[a-zA-Z]{2,}$/))
							{
								if (!this.tooltipIsOpen())
								{
									this.tooltip(item, BX.message('IMOL_LIVECHAT_FORM_INPUT_EMAIL_ERROR'), {offsetTop: 10, offsetLeft: 12});
									done = false;
								}
							}

							if (done)
							{
								this.tooltipClose();
								var config = {};
								var hasValues = false;
								BX.findChildrenByClassName(this.popupMessengerBodyLiveChatForm, "bx-messenger-livechat-form-input").forEach(function(item){
									if (!item.name)
										return false;

									item.name = item.name.toUpperCase();
									config[item.name] = item.value;

									if (item.value && item.name != 'FORM')
									{
										hasValues = true;
									}

									return true;
								});

								if (hasValues)
								{
									this.linesLivechatFormShow('done', 1, {text: BX.message('IMOL_LIVECHAT_FORM_RESULT_WELCOME'), values: config});
								}
								else
								{
									this.linesLivechatFormHide();
								}
							}
							return BX.PreventDefault(event);
						}, this)}})
					]})
				]})
			]});
			BX.defer(function(){
				this.popupMessengerDialog.classList.add('bx-messenger-livechat-form-welcome-1');
				this.popupMessengerBodyLiveChatForm.classList.add('bx-messenger-livechat-form-active');

				var item = BX.findChildByClassName(this.popupMessengerBodyLiveChatForm, "bx-messenger-livechat-form-input-phone");
				if (showCustomPhoneInput)
				{
					new BXMaskedPhone({
						url : BX.message('PHONE_BASE_PATH'),
						country : BX.message('PHONE_BASE_LANG'),
						'maskedInput' : {
							input : item,
							dataInput : item.nextElementSibling
						},
						'flagNode' : item.previousElementSibling,
						'flagSize' : 24
					});
				}
				else
				{
					item.previousElementSibling.style.display = 'none';
					item.style.paddingLeft = '13px';
				}
			}, this)();
		}
		if (stage == 2)
		{
			BX.defer(function(){
				this.popupMessengerDialog.classList.add('bx-messenger-livechat-form-welcome-2');
				this.popupMessengerBodyLiveChatForm.classList.add('bx-messenger-livechat-form-active');
			}, this)();
		}
	}
	else if (type == 'history')
	{
		if (livechatSession.sessionId <= 0)
			return false;

		BX.cleanNode(this.popupMessengerBodyLiveChatForm);
		BX.adjust(this.popupMessengerBodyLiveChatForm, {children: [
			BX.create("div", { props : { className : "bx-messenger-livechat-form-wrap" }, children: [
				BX.create("div", { props : { className : "bx-messenger-livechat-form-close" }, events: {click: BX.delegate(function(){
					this.linesLivechatFormHide();
				}, this)}}),
				BX.create("div", { props : { className : "bx-messenger-livechat-form-text-wrap" }, children: [
					BX.create("div", { props : { className : "bx-messenger-livechat-form-text" }, html: BX.message('IMOL_LIVECHAT_FORM_TITLE_HISTORY')}),
					BX.create("input", { attrs: {type: 'hidden', name: 'form', value: 'history'}, props : { className : "bx-messenger-livechat-form-input bx-messenger-livechat-form-input-form bx-messenger-livechat-form-input-hidden" }})
				]}),
				BX.create("div", { props : { className : "bx-messenger-livechat-form-input-wrap" }, children: [
					BX.create("input", { attrs: {placeholder: BX.message('IMOL_LIVECHAT_FORM_INPUT_EMAIL'), name: 'email', value: this.BXIM.userEmail}, props : { className : "bx-messenger-livechat-form-input bx-messenger-livechat-form-input-email" }, events: {keydown: BX.delegate(function(event){
						this.tooltipClose();

						if (event.keyCode == 9 || event.keyCode == 13)
						{
							if (!BX.proxy_context.value || !BX.proxy_context.value.match(/^(.*)@(.*)\.[a-zA-Z]{2,}$/))
							{
								this.tooltip(BX.proxy_context, BX.message('IMOL_LIVECHAT_FORM_INPUT_EMAIL_ERROR_2'), {offsetTop: 10, offsetLeft: 12});
								BX.proxy_context.parentNode.nextSibling.firstChild.nextSibling.focus();
								return BX.PreventDefault(event);
							}
							else if (event.keyCode == 13)
							{
								BX.proxy_context.parentNode.nextSibling.firstChild.focus();
							}
						}
					}, this)}})
				]}),
				BX.create("div", { props : { className : "bx-messenger-livechat-form-submit-wrap" }, children: [
					BX.create("input", { attrs: {type: 'button', value: BX.message('IMOL_LIVECHAT_FORM_BUTTON_YES')}, props : { className : "bx-messenger-livechat-form-submit" }, events: {click: BX.delegate(function(event){
						var done = true;
						var item = BX.findChildByClassName(this.popupMessengerBodyLiveChatForm, "bx-messenger-livechat-form-input-email");
						if (!item.value || !item.value.match(/^(.*)@(.*)\.[a-zA-Z]{2,}$/))
						{
							if (!this.tooltipIsOpen())
							{
								this.tooltip(item, BX.message('IMOL_LIVECHAT_FORM_INPUT_EMAIL_ERROR'), {offsetTop: 10, offsetLeft: 12});
							}
							item.focus();
							done = false;
						}

						if (done)
						{
							this.tooltipClose();
							var config = {};
							BX.findChildrenByClassName(this.popupMessengerBodyLiveChatForm, "bx-messenger-livechat-form-input").forEach(function(item){
								if (!item.name)
									return false;

								item.name = item.name.toUpperCase();
								config[item.name] = item.value;

								return true;
							});
							this.linesLivechatFormShow('done', 1, {text: BX.message('IMOL_LIVECHAT_FORM_RESULT_HISTORY'), values: config});
						}
						return BX.PreventDefault(event);
					}, this)}}),
					BX.create("input", { attrs: {type: 'button', value: BX.message('IMOL_LIVECHAT_FORM_BUTTON_NO')}, props : { className : "bx-messenger-livechat-form-cancel" }, events: {click: BX.delegate(function(event){
						this.tooltipClose();
						this.linesLivechatFormShow();
						return BX.PreventDefault(event);
					}, this)}})
				]})
			]})
		]});
		BX.defer(function(){
			this.popupMessengerDialog.classList.add('bx-messenger-livechat-form-history');
			this.popupMessengerBodyLiveChatForm.classList.add('bx-messenger-livechat-form-active');
		}, this)();

	}
	else if (type == 'done')
	{
		var textOneLine = params.text.length <= 27;
		BX.cleanNode(this.popupMessengerBodyLiveChatForm);
		BX.adjust(this.popupMessengerBodyLiveChatForm, {children: [
			BX.create("div", { props : { className : "bx-messenger-livechat-form-wrap" }, children: [
				BX.create("div", { props : { className : "bx-messenger-livechat-form-close" }, events: {click: BX.delegate(function(){
					this.linesLivechatFormHide();
				}, this)}}),
				BX.create("div", { props : { className : "bx-messenger-livechat-form-done-text-block-wrap" }, children: [
					BX.create("div", { props : { className : "bx-messenger-livechat-form-done-text-block" }, children: [
						BX.create("div", { props : { className : "bx-messenger-livechat-form-done-icon-wrap" }, children: [
							BX.create("div", { props : { className : "bx-messenger-livechat-form-done-icon" }})
						]}),
						BX.create("div", { props : { className : "bx-messenger-livechat-form-done-text"+(textOneLine? "": " bx-messenger-livechat-form-done-text-small") }, html: params.text})
					]})
				]})
			]})
		]});

		BX.defer(function(){
			this.popupMessengerDialog.classList.add(textOneLine? "bx-messenger-livechat-form-done-small": "bx-messenger-livechat-form-done");
			this.popupMessengerBodyLiveChatForm.classList.add('bx-messenger-livechat-form-active');
		}, this)();

		clearTimeout(this.popupMessengerLiveChatActionTimeout);
		this.popupMessengerLiveChatActionTimeout = setTimeout(BX.proxy(function(){
			this.linesLivechatFormHide();
		}, this), (textOneLine? 3: 5)*1000);

		if (params.values)
		{
			this.linesLivechatFormSend(params.values);
		}

		this.popupMessengerTextarea.focus();
	}
	else
	{
		this.popupMessengerDialog.classList.add("bx-messenger-livechat-form-animation");

		clearTimeout(this.popupMessengerLiveChatActionTimeout);
		this.popupMessengerLiveChatActionTimeout = setTimeout(BX.proxy(function(){
			BX.cleanNode(this.popupMessengerBodyLiveChatForm);
		}, this), 1000);

		this.popupMessengerTextarea.focus();
	}

	BX.MessengerCommon.linesBodyScroll();

	return true;
}

function ImExtendLinesLivechatFormSend(params)
{
	var chatId = this.currentTab.substr(4);
	if (this.blockJoinChat[chatId])
		return false;

	if (this.chat[chatId] && this.chat[chatId].entity_type != 'LIVECHAT')
		return false;

	if (!BX.MessengerCommon.userInChat(chatId))
		return false;

	this.blockJoinChat[chatId] = true;

	var formId = params.FORM? params.FORM.toUpperCase(): null;
	if (!formId)
		return false;

	delete params.FORM;

	if (typeof(params.NAME) != 'undefined')
	{
		this.users[this.BXIM.userId].name = params.NAME;
	}

	if (formId != 'HISTORY' && typeof(params.EMAIL) != 'undefined')
	{
		this.BXIM.userEmail = params.EMAIL;
	}

	if (typeof(params.PHONE) != 'undefined')
	{
		if (!this.phones[this.BXIM.userId])
		{
			this.phones[this.BXIM.userId] = {};
		}
		this.phones[this.BXIM.userId]['PERSONAL_MOBILE'] = params.PHONE;
	}

	this.popupMessengerLiveChatLastSend = +(new Date());

	BX.ajax({
		url: this.BXIM.pathToAjax+'?LINES_LIVECHAT_FORM&V='+this.BXIM.revision,
		method: 'POST',
		dataType: 'json',
		timeout: 60,
		data: {'COMMAND': 'sendLivechatForm', 'CHAT_ID' : chatId, 'FORM' : formId, 'FIELDS' : params, 'IM_OPEN_LINES_CLIENT' : 'Y', 'IM_AJAX_CALL' : 'Y', 'sessid': BX.bitrix_sessid()},
		onsuccess: BX.delegate(function(){
			this.blockJoinChat[chatId] = false;
		}, this),
		onfailure: BX.delegate(function(){
			this.blockJoinChat[chatId] = false;
		}, this)
	});

	return true;
};


if (!window.LiveChatBackendInit)
{
	window.LiveChatBackendInit = true;

	BX.addCustomEvent(window, 'onImInit', function(messengerClass){
		messengerClass.messenger.linesLivechatFormShow = ImExtendLinesLivechatFormShow;
		messengerClass.messenger.linesLivechatFormSend = ImExtendLinesLivechatFormSend;
	});
}
