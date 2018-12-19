;(function (window) {
	if (!window.BX)
	{
		window.BX = {};
	}
	else if (window.BX.LiveChat)
	{
		return;
	}

	var BX = window.BX;

	BX.LiveChat = function () {
		this.supportStorage = navigator.cookieEnabled && typeof(sessionStorage) != 'undefined';
		this.debug = false; // TODO false this

		this.mobileFlag = false;
		this.mobileFull = true;
		this.windowTitle = document.title;

		this.bodyMeta = false;
		this.bodyMetaContent = '';
	};

	BX.LiveChat.prototype.getPopupTemplate = function ()
	{
		var template = this.getSidebarTemplate();
		if (!this.buttonDisable)
		{
			template = template+
				'<div class="bx-imopenlines-config-button">'+
					'<div class="bx-imopenlines-config-button-item"></div>'+
				'</div>';
		}

		return template;
	}

	BX.LiveChat.prototype.getSidebarTemplate = function ()
	{
		return ''+
			'<div class="bx-imopenlines-config-sidebar '+(this.context != 'PAGE' && this.mobileFlag? "bx-imopenlines-config-sidebar-mobile": "")+'">'+
				'<div class="bx-imopenlines-config-sidebar-inner">'+
					'<div class="bx-imopenlines-config-sidebar-header">'+
						'<span class="bx-imopenlines-config-sidebar-back">'+
							'<span class="bx-imopenlines-config-sidebar-back-item"></span>'+
						'</span>'+
						'<span class="bx-imopenlines-config-sidebar-message">'+
							'<span class="bx-imopenlines-config-sidebar-message-item bx-imopenlines-config-sidebar-title">'+this.message('DEFAULT_TITLE')+'</span>'+
						'</span>'+
						'<div class="bx-imopenlines-config-sidebar-rollup">'+
							'<span class="bx-imopenlines-config-sidebar-rollup-item"></span>'+
						'</div>'+
						'<span class="bx-imopenlines-config-sidebar-close">'+
							'<span class="bx-imopenlines-config-sidebar-close-item"></span>'+
						'</span>'+
					'</div>'+
					'<div class="bx-imopenlines-config-sidebar-info">'+
						'<div class="bx-imopenlines-config-sidebar-info-inner">'+
							'<div class="bx-imopenlines-config-sidebar-info-block-container">'+
								'<div class="bx-imopenlines-config-cloud-top"></div>'+
								'<div class="bx-imopenlines-config-sidebar-info-title">'+
									'<h4 class="bx-imopenlines-config-sidebar-info-title-item">'+this.message('READY_TO_RESPOND')+'</h4>'+
								'</div>'+
								'<div class="bx-imopenlines-config-sidebar-info-block-container-inner">'+
								'</div>'+
							'</div>'+
							'<div id="socials" class="bx-imopenlines-config-sidebar-social">'+
								'<div class="bx-imopenlines-config-sidebar-cloud-middle"></div>'+
								'<div class="bx-imopenlines-config-sidebar-cloud-bottom"></div>'+
								'<div class="bx-imopenlines-config-sidebar-circle"></div>'+
								'<div class="bx-imopenlines-config-sidebar-social-title">'+
									'<h4 class="bx-imopenlines-config-sidebar-social-title-item">'+this.message('LOADING_MESSAGE')+'</h4>'+
								'</div>'+
								'<div class="bx-imopenlines-config-sidebar-social-container"></div>'+
								'<div class="bx-imopenlines-config-sidebar-social-description">'+
									'<span class="bx-imopenlines-config-sidebar-social-description-item"></span>'+
								'</div>'+
							'</div>'+
						'</div>'+
					'</div>'+
					'<div class="bx-imopenlines-config-sidebar-iframe-container"></div>'+
					'<div class="bx-imopenlines-config-sidebar-chat-container">'+
						'<div class="bx-imopenlines-config-sidebar-chat">'+
							'<div class="bx-imopenlines-messenger-textarea-place">' +
								'<div class="bx-imopenlines-messenger-textarea-resize"></div>' +
								'<div class="bx-imopenlines-messenger-textarea-send">' +
									'<span class="bx-imopenlines-messenger-textarea-send-button"></span>' +
									'<span title="'+this.message('TEXTAREA_HOTKEY')+'" class="bx-imopenlines-messenger-textarea-cntr-enter">Enter</span>' +
								'</div>' +
								'<div title="'+this.message('TEXTAREA_SMILE')+'" class="bx-imopenlines-messenger-textarea-smile"></div>' +
								'<div title="'+this.message('TEXTAREA_FILE')+'" class="bx-imopenlines-messenger-textarea-file"></div>' +
								'<div class="bx-imopenlines-messenger-textarea">' +
									'<textarea placeholder="'+this.message('TEXTAREA_PLACEHOLDER')+'" class="bx-imopenlines-messenger-textarea-input"></textarea>' +
								'</div>' +
								'<div class="bx-imopenlines-messenger-textarea-clear"></div>' +
							'</div>'+
						'</div>'+
					'</div>'+
					'<a href="'+this.copyrightUrl+'" target="_blank" class="bx-imopenlines-config-sidebar-logo" '+( this.copyright? '': 'style="display:none"' )+'>'+
						'<span class="bx-imopenlines-config-sidebar-logo-text">'+this.message('POWERED_BY')+'</span>'+
						'<span class="bx-imopenlines-config-sidebar-logo-image"></span>'+
					'</a>'+
				'</div>'+
			'</div>';
	}

	BX.LiveChat.prototype.getUserBlock = function (params)
	{
		if (params.avatar && params.avatar.indexOf('images/blank.gif') >= 0)
		{
			params.avatar = '';
		}

		if (params.avatar && params.avatar.toString().substr(0, 4) != 'http')
		{
			params.avatar = this.sourceDomain+params.avatar;
		}

		var avatar = params.avatar? 'style="background: url(\''+params.avatar+'\'); background-size: cover;"': "";
		var name = params.name? params.name: "";
		if (!name)
		{
			return "";
		}

		return '<span class="bx-imopenlines-config-sidebar-info-block">'+
			'<span class="bx-imopenlines-config-sidebar-info-block-image" '+avatar+'></span>'+
			'<span class="bx-imopenlines-config-sidebar-info-block-name">'+name+'</span>'+
		'</span>';
	};

	BX.LiveChat.prototype.getSocialBlock = function (params)
	{
		var target = this.context == 'POPUP'? ' target="_blank"': '';
        var title = params.title != ''? ' title="'+params.title+'"': '';
		return '<a href="'+params.link+'" class="connector-icon connector-icon-'+params.code.replace('.', '-')+'"'+target+''+title+'></a>';
	};

	BX.LiveChat.prototype.init = function (params)
	{
		if (window.BxLiveChatInit)
		{
			var externalParams = window.BxLiveChatInit();
			if (externalParams)
			{
				if (typeof(externalParams.button) != 'undefined')
				{
					params.button = externalParams.button;
				}
				if (typeof(externalParams.user) == 'object')
				{
					params.user = externalParams.user;
				}
				if (typeof(externalParams.firstMessage) != 'undefined')
				{
					params.firstMessage = externalParams.firstMessage;
				}
				if (typeof(externalParams.currentUrl) != 'undefined')
				{
					params.currentUrl = externalParams.currentUrl;
				}
			}
		}

		if (this.inited || !navigator.cookieEnabled)
		{
			if (params.context == 'PAGE')
			{
				location.href = location.protocol+'//'+location.host+(location.port? ':'+location.port: '');
			}
			return false;
		}
		this.inited = true;
		params = params || {};

		this.id = Math.random().toString().substr(2);
		this.context = params.context == 'PAGE'? 'PAGE': 'POPUP';
		this.placeholder = this.context == 'PAGE'? params.placeholder: '';
		this.bitrix24 = params.bitrix24 || '';
		this.code = params.code || '';
		this.source = params.source || '';
		this.buttonDisable = typeof(params.button) != 'undefined' && !params.button;
		this.copyright = typeof(params.copyright) == 'undefined' || params.copyright? true: false;
		this.copyrightUrl = typeof(params.copyrightUrl) == 'undefined' || !params.copyrightUrl? 'https://www.bitrix24.com': params.copyrightUrl;
		this.lang = typeof(params.lang) == 'undefined' || !params.lang? null: params.lang;
		this.mobileFlag = ((/Android/i.test(navigator.userAgent)) || (/(iPad;)|(iPhone;)/i.test(navigator.userAgent)));
		this.user = {};
		if (params.user)
		{
			if (params.user.hash && params.user.hash.length == 32)
			{
				this.user.hash = params.user.hash;
			}
			if (params.user.name && params.user.name.length > 0)
			{
				this.user.name = params.user.name;
			}
			if (params.user.lastName)
			{
				this.user.lastName = params.user.lastName;
			}
			if (params.user.email)
			{
				this.user.email = params.user.email;
			}
			if (params.user.avatar)
			{
				this.user.avatar = params.user.avatar;
			}
		}
		this.firstMessage = params.firstMessage? params.firstMessage: '';
		this.currentUrl = params.currentUrl? params.currentUrl: location.href;

		if (!this.source)
		{
			if (this.context == 'PAGE')
			{
				this.source = location.href;
			}
			else if (this.code && this.bitrix24)
			{
				this.source = this.bitrix24+'/online/'+this.code+'?widget_user_lang='+this.lang;
			}
			else
			{
				console.log('LiveChat: initialize config error!');
				return false;
			}
		}

		this.firstLoad = true;
		this.language = {};

		var sourceHref = document.createElement('a');
		sourceHref.href = this.source;

		this.sourceDomain = sourceHref.protocol+'//'+sourceHref.hostname+(sourceHref.port && sourceHref.port != '80' && sourceHref.port != '443'? ":"+sourceHref.port: "");

		if (params.context == 'PAGE')
		{
			this.showContextPage();
		}
		else
		{
			this.showContextPopup();
		}

		this.prepareContent();

		if (params.context == 'PAGE' || this.getCookie('LIVECHAT_LOAD_FRAME'))
		{
			this.frameCreate();
		}

		return true;
	};

	BX.LiveChat.prototype.openLiveChat = function ()
	{
		if (this.mobileFlag && !this.mobileFull)
		{
			if (this.bodyMeta)
			{
				this.bodyMetaContent = this.bodyMeta.getAttribute('content');
				this.bodyMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
			}
			else
			{
				var addMetaTag = true;
				var metaTags = document.getElementsByTagName('meta');
				for (var i = 0; i < metaTags.length; i++)
				{
					if (metaTags[i].getAttribute('name') == 'viewport')
					{
						addMetaTag = false;
						this.bodyMeta = metaTags[i];
						this.bodyMetaContent = metaTags[i].getAttribute('content');
						break;
					}
				}
				if (addMetaTag)
				{
					this.bodyMeta = document.createElement('meta');
					this.bodyMeta.setAttribute('name', 'viewport');
					this.bodyMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
					document.head.appendChild(this.bodyMeta);
				}
				else
				{
					this.bodyMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
				}
			}
		}

		this.contentMain.classList.toggle("bx-imopenlines-config-sidebar-open");
		if (this.contentButton)
		{
			this.contentButton.classList.toggle("bx-imopenlines-config-sidebar-open");
		}
		this.popupSetPosition();
		if (!this.contentFrame)
		{
			this.frameCreate();
		}
		if (this.supportStorage)
		{
			setTimeout(this.delegate(function(){
				this.sendDataToFrame({'action': 'textareaFocus'});
			}, this), 400);
			sessionStorage.bxLiveChatOpened = "open";
		}
	};

	BX.LiveChat.prototype.closeLiveChat = function()
	{
		this.contentMain.classList.toggle("bx-imopenlines-config-sidebar-open");
		if (this.contentButton)
		{
			this.contentButton.classList.toggle("bx-imopenlines-config-sidebar-open");
		}

		sessionStorage.bxLiveChatOpened = "close";

		if (this.bodyMeta)
		{
			if (this.bodyMetaContent)
			{
				this.bodyMeta.setAttribute('content', this.bodyMetaContent);
			}
			else
			{
				this.remove(this.bodyMeta);
				this.bodyMeta = null;
			}
		}

		if (typeof(BX.SiteButton) != 'undefined')
		{
			BX.SiteButton.onWidgetClose();
		}
	};

	BX.LiveChat.prototype.showContextPage = function ()
	{
		this.content = document.getElementById(this.placeholder);
		if (!this.content)
			return false;

		this.content.innerHTML = this.getSidebarTemplate();

		this.contentMain = this.content.firstChild;
		this.contentMain.classList.add("bx-imopenlines-sidebar-inline");

		document.body.classList.add('flexible');

		return true;
	};

	BX.LiveChat.prototype.showContextPopup = function ()
	{
		this.content = document.createElement('div');
		this.content.className = 'bx-crm-widget-wrapper bx-crm-widget-chat-config-wrapper';
		this.content.innerHTML = this.getPopupTemplate();
		document.body.insertBefore(this.content, document.body.firstChild);

		this.contentMain = this.content.getElementsByClassName("bx-imopenlines-config-sidebar")[0];

		if (this.mobileFlag)
		{
			//document.documentElement.classList.add('bx-imopenlines-config-mobile');
			//document.body.classList.add('bx-imopenlines-config-mobile');

			this.mobileFull = true;
			var metaTags = document.getElementsByTagName('meta');
			for (var i = 0; i < metaTags.length; i++)
			{
				if (metaTags[i].getAttribute('name') == 'viewport')
				{
					this.mobileFull = false;
					break;
				}
			}

			if (this.mobileFull)
			{
				document.body.classList.add('bx-imopenlines-static-page');
			}
			else
			{
				document.body.classList.add('bx-imopenlines-static-adaptive');
			}
		}

		this.contentButton = this.content.getElementsByClassName("bx-imopenlines-config-button")[0];
		if (this.contentButton)
		{
			this.addEventListener(this.contentButton, 'click', this.delegate(this.openLiveChat, this), false);
		}

		this.contentCloseButton = this.content.getElementsByClassName("bx-imopenlines-config-sidebar-close")[0];
		this.addEventListener(this.contentCloseButton, 'click', this.delegate(this.closeLiveChat, this), false);

		return true;
	};

	BX.LiveChat.prototype.prepareContent = function ()
	{
		this.contentTitle = this.content.getElementsByClassName("bx-imopenlines-config-sidebar-title")[0];

		this.contentUsers = this.content.getElementsByClassName("bx-imopenlines-config-sidebar-info-block-container")[0];
		this.contentUsersTitle = this.content.getElementsByClassName("bx-imopenlines-config-sidebar-info-title-item")[0];
		this.contentUsersBox = this.content.getElementsByClassName("bx-imopenlines-config-sidebar-info-block-container-inner")[0];

		this.contentSocials = this.content.getElementsByClassName("bx-imopenlines-config-sidebar-social")[0];
		this.contentSocialsTitle = this.contentSocials.getElementsByClassName("bx-imopenlines-config-sidebar-social-title-item")[0];
		this.contentSocialsIconsBox = this.contentSocials.getElementsByClassName("bx-imopenlines-config-sidebar-social-container")[0];
		this.contentSocialsDescription = this.contentSocials.getElementsByClassName("bx-imopenlines-config-sidebar-social-description-item")[0];

		this.contentInner = this.content.getElementsByClassName("bx-imopenlines-config-sidebar-inner")[0];
		this.contentIframeBox = this.contentInner.getElementsByClassName("bx-imopenlines-config-sidebar-iframe-container")[0];

		this.contentFormInput = this.content.getElementsByClassName("bx-imopenlines-messenger-textarea-input")[0];
		this.contentFormEnter = this.content.getElementsByClassName("bx-imopenlines-messenger-textarea-send-button")[0];
		this.contentFormKey = this.content.getElementsByClassName("bx-imopenlines-messenger-textarea-cntr-enter")[0];
		this.contentFormFile = this.content.getElementsByClassName("bx-imopenlines-messenger-textarea-file")[0];
		this.contentFormSmile = this.content.getElementsByClassName("bx-imopenlines-messenger-textarea-smile")[0];

		this.addEventListener(this.contentFormEnter, 'click', this.delegate(this.sendMessage, this), false);
		this.addEventListener(this.contentFormInput, 'keyup', this.delegate(function(event){
			if (event.keyCode == 13)
			{
				this.sendMessage();
			}
		}, this), false);

		this.contentBackButton = this.content.getElementsByClassName("bx-imopenlines-config-sidebar-back")[0];
		this.addEventListener(this.contentBackButton, 'click', this.delegate(function(){
			this.contentInner.classList.toggle("bx-imopenlines-config-enter-message");
		}, this), false);

		return true;
	};

	BX.LiveChat.prototype.sendMessage = function ()
	{
		if (!this.contentFormInput.value)
			return '';

		this.contentInner.classList.add("bx-imopenlines-config-enter-message");
		this.contentInner.classList.add("bx-imopenlines-config-has-message");
		this.sendDataToFrame({'action': 'message', 'text': this.contentFormInput.value});

		this.contentFormInput.value = '';
	};

	BX.LiveChat.prototype.popupSetPosition = function ()
	{
		if (!this.mobileFlag || this.context == 'PAGE')
			return '';

		if (this.mobileFull)
		{
			this.contentMain.setAttribute('style', 'margin-top: '+(window.scrollY+20)+'px;');
		}
	};

	BX.LiveChat.prototype.frameCreate = function ()
	{
		if (this.frameCreated)
			return true;

		this.frameCreated = true;

		var externalData = '';
		if (this.user || this.firstMessage || this.currentUrl)
		{
			if (this.user && this.user.hash)
			{
				externalData += '&userHash='+encodeURIComponent(this.user.hash);
			}
			if (this.user && this.user.name)
			{
				externalData += '&userName='+encodeURIComponent(this.user.name);
			}
			if (this.user && this.user.lastName)
			{
				externalData += '&userLastName='+encodeURIComponent(this.user.lastName);
			}
			if (this.user && this.user.email)
			{
				externalData += '&userEmail='+encodeURIComponent(this.user.email);
			}
			if (this.user && this.user.avatar)
			{
				externalData += '&userAvatar='+encodeURIComponent(this.user.avatar);
			}
			if (this.currentUrl)
			{
				externalData += '&currentUrl='+encodeURIComponent(this.currentUrl.substring(0, 255));
			}
			if (this.firstMessage)
			{
				externalData += '&firstMessage='+encodeURIComponent(this.firstMessage.substring(0, 1000-this.firstMessage.length-externalData.length));
			}
		}

		var locationHash = {
			domain: window.location.protocol + '//' + window.location.host,
			from: window.location
		};
		var frameSrc = this.source +(this.source.indexOf('?') == -1? '?': '&')+'iframe=Y'+externalData+'&r='+(+new Date()) + '#' + encodeURIComponent(JSON.stringify(locationHash));
		var frameName = 'bx_ol_iframe_'+this.id;

		this.contentFrame = document.createElement('iframe');
		this.contentFrame.setAttribute('id', frameName);
		this.contentFrame.setAttribute('name', frameName);
		this.contentFrame.setAttribute('src', frameSrc);

		this.contentFrame.setAttribute('scrolling', 'no');
		this.contentFrame.setAttribute('frameborder', '0');
		this.contentFrame.setAttribute('marginheight', '0');
		this.contentFrame.setAttribute('marginwidth', '0');
		this.contentFrame.setAttribute('style', 'width: 100%; height: 100%; border: 0px; overflow: hidden; padding: 0; margin: 0;');

		this.addEventListener(this.contentFrame, 'load', this.delegate(function(){
			this.frameEndLoad();
		}, this));

		this.addEventListener(window, 'message', this.delegate(function(event){
			if(event && event.origin == this.sourceDomain)
			{
				this.frameEventReceive(event.data);
			}
		}, this));

		this.contentIframeBox.appendChild(this.contentFrame);
/*
		this.contentFrameFormInitializer = document.createElement('form');
		this.contentFrameFormInitializer.setAttribute('method', 'POST');
		this.contentFrameFormInitializer.setAttribute('target', frameName);
		this.contentFrameFormInitializer.setAttribute('action', frameSrc);
		this.contentIframeBox.appendChild(this.contentFrameFormInitializer);
		this.contentFrameFormInitializer.submit();
*/
		return true;
	};

	BX.LiveChat.prototype.frameEndLoad = function ()
	{
		var ie = 0 /*@cc_on + @_jscript_version @*/;
		if(typeof window.postMessage === 'function' && !ie)
		{
			this.contentFrame.contentWindow.postMessage(JSON.stringify({
				'action': 'init',
				'domain': this.sourceDomain,
				'uniqueLoadId': this.id,
				'textarea': this.contentFormInput.value,
				'showed': this.supportStorage && sessionStorage.bxLiveChatOpened == "open"
			}), this.sourceDomain);
		}
		else
		{
			this.checkHash(this.id);
		}

		this.contentMain.classList.add("bx-imopenlines-config-sidebar-loaded");

		if (this.supportStorage && sessionStorage.bxLiveChatOpened == "open" || location.href.indexOf('imolAction=answer') >= 0)
		{
			this.contentMain.classList.add("bx-imopenlines-config-sidebar-open", "bx-imopenlines-config-sidebar-open-immediately");

			if (this.supportStorage && sessionStorage.bxLiveChatShowed == "open")
			{
				this.contentMain.classList.add("bx-imopenlines-config-sidebar-open-immediately-2");
			}
			if (this.contentButton)
			{
				this.contentButton.classList.add("bx-imopenlines-config-sidebar-open", "bx-imopenlines-config-sidebar-open-immediately");
			}

			setTimeout(this.delegate(function(){
				this.contentMain.classList.remove('bx-imopenlines-config-sidebar-open-immediately');
				this.contentMain.classList.remove('bx-imopenlines-config-sidebar-open-immediately-2');
				if (this.contentButton)
				{
					this.contentButton.classList.remove('bx-imopenlines-config-sidebar-open-immediately');
				}
			}, this), 1000);

			if (typeof(BX.SiteButton) != 'undefined')
			{
				BX.SiteButton.hide();
			}
		}
	};

	BX.LiveChat.prototype.sendDataToFrame = function(data)
	{
		var encodedData = JSON.stringify(data);
		if(typeof window.postMessage === 'function')
		{
			this.contentFrame.contentWindow.postMessage(encodedData, this.sourceDomain);
		}
		return true;
	};

	BX.LiveChat.prototype.hideChatBlock = function()
	{
		this.remove(this.contentMain);
	}

	BX.LiveChat.prototype.frameEventReceive = function(dataString, uniqueLoadId)
	{
		if (this.debug)
		{
			console.log('event receive!', dataString, uniqueLoadId);
		}
		var data = {};
		try { data = JSON.parse(dataString); } catch (err){}
		if(!data.action) return;

		if (data.action == 'blank')
		{
			this.hideChatBlock();
		}
		else if (data.action == 'init')
		{
			this.contentTitle.innerHTML = data.title;

			var queueList = '';
			if (data.queue)
			{
				for (var i = 0; i < data.queue.length; i++)
				{
					queueList += this.getUserBlock(data.queue[i]);
				}
			}
			this.contentUsersBox.innerHTML = queueList;
			if (data.queue && data.queue.length)
			{
				this.contentUsers.classList.add("bx-imopenlines-config-sidebar-visible-block");
			}
			else
			{
				this.contentUsersTitle.innerHTML = this.message('RESPOND_LATER');
			}

			var socialList = '';
			var networkUrl = '';
			if (data.connectors)
			{
				for (var i = 0; i < data.connectors.length; i++)
				{
					socialList += this.getSocialBlock(data.connectors[i]);
					if (data.connectors[i].code == 'network')
					{
						networkUrl = data.connectors[i].link;
					}
				}
			}
			this.contentSocialsIconsBox.innerHTML = socialList;
			if (data.connectors && data.connectors.length)
			{
				this.contentSocialsTitle.innerHTML = this.message('SONET_ICONS');
				this.contentSocialsDescription.innerHTML = this.message('SONET_ICONS_CLICK');
				this.contentSocials.classList.add("bx-imopenlines-config-sidebar-visible-socials");
			}

			if (data.errorCode == '3RD_PARTY_COOKIE')
			{
				this.contentUsersTitle.innerHTML = this.message('ERROR_TITLE');
				this.contentSocialsTitle.innerHTML = this.message('ERROR_3RD_PARTY_COOKIE_DESC');
			}
			else if (data.errorCode == 'INTRANET_USER')
			{
				this.contentUsersTitle.innerHTML = this.message('ERROR_TITLE');
				if (networkUrl)
				{
					var openLineInPortalUrl = this.sourceDomain+'/online/?IM_DIALOG=networkLines'+networkUrl.match(/&IM_DIALOG=networkLines(.{32})/i)[1];
					this.contentSocialsTitle.innerHTML = this.message('ERROR_INTRANET_USER_DESC_2').replace('#URL_START#', '<a href="'+openLineInPortalUrl+'">').replace('#URL_END#', '</a>');
				}
				else
				{
					this.contentSocialsTitle.innerHTML = this.message('ERROR_INTRANET_USER_DESC').replace("#URL#", '<a href="'+this.sourceDomain+'">'+this.sourceDomain+'</a>');
				}

			}
			else if (data.errorCode && data.errorCode.toString().length > 0)
			{
				this.contentUsersTitle.innerHTML = this.message('ERROR_TITLE');
				this.contentSocialsTitle.innerHTML = this.message('ERROR_UNKNOWN');
			}
		}
		else if (data.action == 'receiveMessage' || data.action == 'readMessage')
		{
			if (data.action == 'readMessage' && this.contentMain.classList.contains("bx-imopenlines-config-sidebar-open"))
			{
				return false;
			}

			clearInterval(this.timeoutNewMessage);
			this.timeoutNewMessage = setInterval(this.delegate(function(){
				document.title = (document.title == '-+-+-+- '+this.windowTitle? '+-+-+-+ '+this.windowTitle: '-+-+-+- '+this.windowTitle);
			}, this), 500);

			this.setCookie('LIVECHAT_LOAD_FRAME', true, {expires: 3600});
			this.contentMain.classList.add("bx-imopenlines-config-sidebar-open");
			if (this.contentButton)
			{
				this.contentButton.classList.add("bx-imopenlines-config-sidebar-open");
			}
			if (typeof(BX.SiteButton) != 'undefined')
			{
				BX.SiteButton.hide();
			}
			this.contentInner.classList.add("bx-imopenlines-config-enter-message");
			this.popupSetPosition();
		}
		else if (data.action == 'resizeTextarea' || data.action == 'openSmileMenu'  || data.action == 'openFileMenu' || data.action == 'openFrameDialog')
		{
			this.contentInner.classList.add("bx-imopenlines-config-has-message");
			this.contentInner.classList.add("bx-imopenlines-config-enter-message");
		}
		else if (data.action == 'showDialog' || data.action == 'sendMessage')
		{
			if (data.action == 'sendMessage')
			{
				clearInterval(this.timeoutNewMessage);
				document.title = this.windowTitle;

				this.setCookie('LIVECHAT_LOAD_FRAME', true, {expires: 3600})
			}

			this.contentInner.classList.add("bx-imopenlines-config-enter-message");
			this.contentInner.classList.add("bx-imopenlines-config-has-message");
			if (this.supportStorage)
			{
				sessionStorage.bxLiveChatShowed = "open";
			}
		}
		else if (data.action == 'textareaFocused')
		{
			this.mobileTextareaFucused = true;
			clearInterval(this.timeoutNewMessage);
			document.title = this.windowTitle;
		}
		else if (data.action == 'textareaBlured')
		{
			this.mobileTextareaFucused = false;
			clearInterval(this.timeoutNewMessage);
			document.title = this.windowTitle;
		}

		return true;
	};

	BX.LiveChat.prototype.checkHash = function(uniqueLoadId)
	{
		var dataString = window.location.hash.substring(1);
		this.frameEventReceive(dataString, uniqueLoadId);

		setTimeout(this.delegate(function(){
			this.checkHash(uniqueLoadId)
		},this), 1000);

		return true;
	};

	BX.LiveChat.prototype.delegate = function (func, thisObject)
	{
		if (!func || !thisObject)
			return func;

		return function() {
			var cur = BX.proxy_context;
			BX.proxy_context = this;
			var res = func.apply(thisObject, arguments);
			BX.proxy_context = cur;
			return res;
		}
	};

	BX.LiveChat.prototype.addEventListener = function(el, eventName, handler)
	{
		el = el || window;
		if (window.addEventListener)
		{
			el.addEventListener(eventName, handler, false);
		}
		else
		{
			el.attachEvent('on' + eventName, handler);
		}
	};

	BX.LiveChat.prototype.message = function(mess)
	{
		return BX.LiveChatMessage.add(mess);
	};

	BX.LiveChat.prototype.getCookie = function (name)
	{
		var matches = document.cookie.match(new RegExp(
			"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
		));

		return matches ? decodeURIComponent(matches[1]) : undefined;
	};

	BX.LiveChat.prototype.remove = function(ob)
	{
		if (ob && null != ob.parentNode)
			ob.parentNode.removeChild(ob);
		ob = null;
		return null;
	};

	BX.LiveChat.prototype.setCookie = function (name, value, options)
	{
		options = options || {};

		var expires = options.expires;
		if (typeof(expires) == "number" && expires)
		{
			var currentDate = new Date();
			currentDate.setTime(currentDate.getTime() + expires * 1000);
			expires = options.expires = currentDate;
		}

		if (expires && expires.toUTCString)
		{
			options.expires = expires.toUTCString();
		}

		value = encodeURIComponent(value);

		var updatedCookie = name + "=" + value;

		for (var propertyName in options)
		{
			if (!options.hasOwnProperty(propertyName))
			{
				continue;
			}
			updatedCookie += "; " + propertyName;
			var propertyValue = options[propertyName];
			if (propertyValue !== true)
			{
				updatedCookie += "=" + propertyValue;
			}
		}

		document.cookie = updatedCookie;

		return true;
	};

	BX.LiveChat = new BX.LiveChat();

	BX.LiveChatMessage = function ()
	{
		this.language = {};
	};

	BX.LiveChatMessage.prototype.add = function(mess)
	{
		if (typeof(mess) == "string")
		{
			return this.language[mess]? this.language[mess]: "";
		}
		else
		{
			for (var i in mess)
			{
				if (mess.hasOwnProperty(i))
				{
					this.language[i] = mess[i];
				}
			}
			return true;
		}
	};

	BX.LiveChatMessage = new BX.LiveChatMessage();

	setTimeout(function() {
		if (window.BxLiveChatLoader) {
			for (var i = 0; i < window.BxLiveChatLoader.length; i++) {
				window.BxLiveChatLoader[i]();
			}
		}
	}, 10);

})(window);