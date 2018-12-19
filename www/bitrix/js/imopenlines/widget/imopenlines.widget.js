"use strict";

(function(window)
{
	if (!window.BX)
	{
		window.BX = {};
	}
	else if (window.BX.LiveChatWidget)
	{
		return;
	}

	document.addEventListener("DOMContentLoaded", () => { BX.LiveChatWidget.domReadyFlag = true; });

	const GetObjectValues = function(source)
	{
		const destination = [];
		for (let value in source)
		{
			if (source.hasOwnProperty(value))
			{
				destination.push(value);
			}
		}
		return destination;
	};

	const VoteType = {
		none: 'none',
		like: 'like',
		dislike: 'dislike',
	};
	const VoteTypeCheck = GetObjectValues(VoteType);

	const DeviceOrientation = {
		horizontal: 'horizontal',
		portrait: 'portrait',
	};

	const DeviceType = {
		mobile: 'mobile',
		desktop: 'desktop',
	};

	const LanguageType = {
		russian: 'ru',
		ukraine: 'ua',
		world: 'en',
	};

	const FormType = {
		none: 'none',
		like: 'like',
		consent: 'consent',
		welcome: 'welcome',
		offline: 'offline',
		history: 'history',
	};

	const LocationType = {
		topLeft: 1,
		topMiddle: 2,
		topBottom: 3,
		bottomLeft: 6,
		bottomMiddle: 5,
		bottomRight: 4,
	};
	const LocationStyle = {
		1: 'top-left',
		2: 'top-center',
		3: 'top-right',
		6: 'bottom-left',
		5: 'bottom-center',
		4: 'bottom-right',
	};

	const SubscriptionType = {
		widgetOpen: 'WIDGET_OPEN',
		widgetLoad: 'WIDGET_LOAD',
		widgetClose: 'WIDGET_CLOSE',
		dialogStart: 'DIALOG_START',
		dialogEnd: 'DIALOG_END',
		operatorAnswer: 'OPERATOR_ANSWER',
		operatorWrites: 'OPERATOR_WRITES',
		operatorMessage: 'OPERATOR_MESSAGE',
		userForm: 'USER_SEND_FORM',
		userMessage: 'USER_SEND_MESSAGE',
		userVote: 'USER_SEND_VOTE',
	};
	const SubscriptionTypeCheck = GetObjectValues(SubscriptionType);

	const WidgetStore = {
		dialogData: 'widget/dialogData',
		widgetData: 'widget/widgetData',
		userData: 'widget/userData',
	};

	const MessengerMessageStore = {
		add: 'messengerMessage/add',
		set: 'messengerMessage/set',
		setBefore: 'messengerMessage/setBefore',
		update: 'messengerMessage/update',
		delete: 'messengerMessage/delete',
	};

	class LiveChatWidget
	{
		constructor(config)
		{
			this.developerInfo = 'Do not use private methods.';
			this.__privateMethods__ = new LiveChatWidgetPrivate(config);
		}
		open()
		{
			return this.__privateMethods__.open();
		}

		close()
		{
			return this.__privateMethods__.close();
		}

		showNotification(params)
		{
			return this.__privateMethods__.showNotification(params);
		}

		getUserData()
		{
			return this.__privateMethods__.getUserData();
		}

		setUserRegisterData(params)
		{
			return this.__privateMethods__.setUserRegisterData(params);
		}

		setUtmData(params)
		{
			return this.__privateMethods__.setUtmData(params);
		}

		setCustomData(params)
		{
			return this.__privateMethods__.setCustomData(params);
		}

		/**
		 *
		 * @param params {Object}
		 * @returns {Function|Boolean} - Unsubscribe callback function or False
		 */
		subscribe(params)
		{
			return this.__privateMethods__.subscribe(params);
		}

		addLocalize(phrases)
		{
			return this.__privateMethods__.addLocalize(phrases);
		};

		start()
		{
			return this.__privateMethods__.start();
		}
	}

	class LiveChatWidgetPrivate
	{

	/* region 01. Initialize and store data */

		constructor(params = {})
		{
			this.ready = true;
			this.widgetDataRequested = false;

			this.code = params.code || '';
			this.host = params.host || '';
			this.language = params.language || 'en';
			this.copyright = params.copyright !== false;
			this.copyrightUrl = this.copyright && params.copyrightUrl? params.copyrightUrl: '';
			this.buttonInstance = typeof params.buttonInstance === 'object' && params.buttonInstance !== null? params.buttonInstance: null;

			if (typeof this.code === 'string')
			{
				if (this.code.length <= 0)
				{
					console.warn(`%cLiveChatWidget.constructor: code is not correct (%c${this.code}%c)`, "color: black;", "font-weight: bold; color: red", "color: black");
					this.ready = false;
				}
			}

			if (typeof this.host === 'string')
			{
				if (this.host.length <= 0 || !this.host.startsWith('http'))
				{
					console.warn(`%cLiveChatWidget.constructor: host is not correct (%c${this.host}%c)`, "color: black;", "font-weight: bold; color: red", "color: black");
					this.ready = false;
				}
			}

			const widgetData = {};
			if (params.location && typeof LocationStyle[params.location] !== 'undefined')
			{
				widgetData.location = params.location;
			}
			if (Utils.isPlainObject(params.styles) && typeof params.styles.backgroundColor !== 'undefined')
			{
				if (typeof widgetData.styles === 'undefined')
				{
					widgetData.styles = {};
				}
				widgetData.styles.backgroundColor = params.styles.backgroundColor;
			}

			/* store data */
			this.store = new Vuex.Store(
			{
				name: 'Bitrix LiveChat Widget ('+this.code+' / '+this.host+')',
				modules: {
					widget: this.getWidgetStore({widgetData}),
					messengerMessage: this.getMessengerMessageStore()
				}
			});

			this.inited = false;
			this.initEventFired = false;

			this.restClient = null;
			this.pullClient = null;

			this.utm = {};
			this.userRegisterData = {};
			this.customData = {};

			this.localize = {};
			this.subscribers = {};

			this.messagesQueue = [];

			this.configRequestXhr = null;

			this.rootNode = document.createElement('div');
			if (document.body.firstChild)
			{
				document.body.insertBefore(this.rootNode, document.body.firstChild);
			}
			else
			{
				document.body.appendChild(this.rootNode);
			}

			this.templateEngine = null;

			window.addEventListener('orientationchange', () =>
			{
				this.store.commit(WidgetStore.widgetData, {deviceOrientation: Utils.getDeviceOrientation()});

				if (
					this.store.state.widget.widgetData.showed
					&& this.store.state.widget.widgetData.deviceType == DeviceType.mobile
					&& this.store.state.widget.widgetData.deviceOrientation == DeviceOrientation.horizontal
				)
				{
					document.activeElement.blur();
				}
			});
		}

		getWidgetStore(params)
		{
			/* restore data */
			let widgetData = LocalStorage.get(this.getSiteId(), WidgetStore.widgetData, {
				configId: 0,
				configName: '',
				voteEnable: false,
				language: this.language,
				copyright: this.copyright,
				copyrightUrl: this.copyrightUrl,
				online: false,
				operators: [],
				connectors: [],
				styles: {
					backgroundColor: '#17a3ea'
				},
				showForm: FormType.none,
				deviceType: DeviceType.desktop,
				deviceOrientation: DeviceOrientation.portrait,
				location: LocationType.bottomRight,
				showed: false,
				dragged: false,
				showConsent: false,
				consentUrl: '',
				dialogStart: false,
				error: {
					active: false,
					code: '',
					description: ''
				}
			});
			widgetData.deviceType = Utils.getDeviceType();
			widgetData.deviceOrientation = Utils.getDeviceOrientation();
			widgetData.language = this.language;
			widgetData.copyright = this.copyright;
			widgetData.copyrightUrl = this.copyrightUrl;
			widgetData.dragged = false;
			widgetData.showConsent = false;
			widgetData.showForm = FormType.none;
			widgetData.error = {
				active: false,
				code: '',
				description: ''
			};
			widgetData.showed = false;

			if (Utils.isPlainObject(params.widgetData))
			{
				if (params.widgetData.location && typeof LocationStyle[params.widgetData.location] !== 'undefined')
				{
					widgetData.location = params.widgetData.location;
				}
				if (Utils.isPlainObject(params.widgetData.styles) && typeof params.widgetData.styles.backgroundColor !== 'undefined')
				{
					widgetData.styles.backgroundColor = params.widgetData.styles.backgroundColor;
				}
			}

			let dialogData = LocalStorage.get(this.getSiteId(), WidgetStore.dialogData, {
				chatId: 0,
				sessionId: 0,
				sessionClose: true,
				userVote: VoteType.none,
				userConsent: false,
				operator: {
					name: '',
					avatar: '',
					online: false,
				}
			});

			let userData = LocalStorage.get(this.getSiteId(), WidgetStore.userData, {
				id: 0,
				hash: '',
				name: '',
				lastName: '',
				avatar: '',
				email: '',
				www: '',
				gender: 'M',
				position: '',
			});
			if (!userData.hash)
			{
				let userHash = Cookie.get(this.getSiteId(), 'LIVECHAT_HASH');
				if (typeof userHash === 'string' && userHash.match(/^[a-f0-9]{32}$/))
				{
					userData.hash = userHash;
				}
			}

			return {
				namespaced: true,
				state: {
					siteId: this.getSiteId(),
					host: this.getHost(),
					widgetData,
					dialogData,
					userData
				},
				mutations: {
					widgetData: (state, params) =>
					{
						if (typeof params.configId === 'number')
						{
							state.widgetData.configId = params.configId;
						}
						if (typeof params.configName === 'string')
						{
							state.widgetData.configName = params.configName;
						}
						if (typeof params.language === 'string')
						{
							state.widgetData.language = params.language;
						}
						if (typeof params.online === 'boolean')
						{
							state.widgetData.online = params.online;
						}
						if (typeof params.voteEnable === 'boolean')
						{
							state.widgetData.voteEnable = params.voteEnable;
						}
						if (typeof params.dragged === 'boolean')
						{
							state.widgetData.dragged = params.dragged;
						}
						if (typeof params.showConsent === 'boolean')
						{
							state.widgetData.showConsent = params.showConsent;
						}
						if (typeof params.consentUrl === 'string')
						{
							state.widgetData.consentUrl = params.consentUrl;
						}
						if (typeof params.showed === 'boolean')
						{
							state.widgetData.showed = params.showed;
						}
						if (typeof params.copyright === 'boolean')
						{
							state.widgetData.copyright = params.copyright;
						}
						if (typeof params.dialogStart === 'boolean')
						{
							state.widgetData.dialogStart = params.dialogStart;
						}
						if (Utils.isPlainObject(params.error) && typeof params.error.active === 'boolean')
						{
							state.widgetData.error = {
								active: params.error.active,
								code: params.error.code || '',
								description: params.error.description || '',
							};
						}
						if (params.operators instanceof Array)
						{
							state.widgetData.operators = params.operators;
						}
						if (params.connectors instanceof Array)
						{
							state.widgetData.connectors = params.connectors;
						}
						if (typeof params.showForm === 'string' && typeof FormType[params.showForm] !== 'undefined')
						{
							state.widgetData.showForm = params.showForm;
						}
						if (typeof params.deviceType === 'string' && typeof DeviceType[params.deviceType] !== 'undefined')
						{
							state.widgetData.deviceType = params.deviceType;
						}
						if (typeof params.deviceOrientation === 'string' && typeof DeviceOrientation[params.deviceOrientation] !== 'undefined')
						{
							state.widgetData.deviceOrientation = params.deviceOrientation;
						}
						if (typeof params.location === 'number' && typeof LocationStyle[params.location] !== 'undefined')
						{
							state.widgetData.location = params.location;
						}

						LocalStorage.set(state.siteId, WidgetStore.widgetData, state.widgetData);
					},
					dialogData: (state, params) =>
					{
						if (typeof params.chatId === 'number')
						{
							state.dialogData.chatId = params.chatId;
						}
						if (typeof params.sessionId === 'number')
						{
							state.dialogData.sessionId = params.sessionId;
						}
						if (typeof params.sessionClose === 'boolean')
						{
							state.dialogData.sessionClose = params.sessionClose;
						}
						if (typeof params.userConsent === 'boolean')
						{
							state.dialogData.userConsent = params.userConsent;
						}
						if (typeof params.userVote === 'string' && typeof params.userVote !== 'undefined')
						{
							state.dialogData.userVote = params.userVote;
						}
						if (Utils.isPlainObject(params.operator))
						{
							if (typeof params.operator.name === 'string')
							{
								state.dialogData.operator.name = params.operator.name;
							}
							if (typeof params.operator.avatar === 'string')
							{
								if (!params.operator.avatar || params.operator.avatar.startsWith('http'))
								{
									state.dialogData.operator.avatar = params.operator.avatar;
								}
								else
								{
									state.dialogData.operator.avatar = state.host+params.operator.avatar;
								}
							}
							if (typeof params.operator.online === 'boolean')
							{
								state.dialogData.operator.online = params.operator.online;
							}
						}
						LocalStorage.set(state.siteId, WidgetStore.dialogData, state.dialogData);
					},
					userData: (state, params) =>
					{
						if (typeof params.id === 'number')
						{
							state.userData.id = params.id;
						}
						if (typeof params.hash === 'string' && params.hash !== state.userData.hash)
						{
							state.userData.hash = params.hash;
							Cookie.set(state.siteId, 'LIVECHAT_HASH', params.hash, {expires: 365*86400});
						}
						if (typeof params.name === 'string')
						{
							state.userData.name = params.name;
						}
						if (typeof params.lastName === 'string')
						{
							state.userData.lastName = params.lastName;
						}
						if (typeof params.avatar === 'string')
						{
							state.userData.avatar = params.avatar;
						}
						if (typeof params.email === 'string')
						{
							state.userData.email = params.email;
						}
						if (typeof params.www === 'string')
						{
							state.userData.www = params.www;
						}
						if (typeof params.gender === 'string')
						{
							state.userData.gender = params.gender;
						}
						if (typeof params.position === 'string')
						{
							state.userData.position = params.position;
						}
						LocalStorage.set(state.siteId, WidgetStore.userData, state.userData);
					},
				}
			};
		}

		getMessengerMessageStore()
		{
			const convertToHtml = function(text, quote = true, image = true, highlightText = '')
			{
				text = text.trim();
				text = text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

				if (text.startsWith('/me'))
				{
					text = `<i>${text.substr(4)}</i>`;
				}
				else if (text.startsWith('/loud'))
				{
					text = `<b>${text.substr(6)}</b>`;
				}

				const quoteSign = "&gt;&gt;";
				if(quote && text.indexOf(quoteSign) >= 0)
				{
					let textPrepareFlag = false;
					let textPrepare = text.split("\n");
					for(var i = 0; i < textPrepare.length; i++)
					{
						if(textPrepare[i].startsWith(quoteSign))
						{
							textPrepare[i] = textPrepare[i].replace(quoteSign, '<div class="bx-messenger-content-quote"><span class="bx-messenger-content-quote-icon"></span><div class="bx-messenger-content-quote-wrap">');
							while(++i < textPrepare.length && textPrepare[i].startsWith(quoteSign))
							{
								textPrepare[i] = textPrepare[i].replace(quoteSign, '');
							}
							textPrepare[i-1] += '</div></div>';
							textPrepareFlag = true;
						}
					}
					text = textPrepare.join("<br />");
				}

				//text = this.decodeBbCode(text, quote);

				text = text.replace(/\n/gi, '<br />');

				text = text.replace(/\t/gi, '&nbsp;&nbsp;&nbsp;&nbsp;');

				if (quote)
				{
					text = text.replace(/------------------------------------------------------<br \/>(.*?)\[(.*?)\]<br \/>(.*?)------------------------------------------------------(<br \/>)?/g, function(whole, p1, p2, p3, p4, offset){
						return (offset > 0? '<br>':'')+"<div class=\"bx-messenger-content-quote\"><span class=\"bx-messenger-content-quote-icon\"></span><div class=\"bx-messenger-content-quote-wrap\"><div class=\"bx-messenger-content-quote-name\">"+p1+" <span class=\"bx-messenger-content-quote-time\">"+p2+"</span></div>"+p3+"</div></div><br />";
					});
					text = text.replace(/------------------------------------------------------<br \/>(.*?)------------------------------------------------------(<br \/>)?/g, function(whole, p1, p2, p3, offset){
						return (offset > 0? '<br>':'')+"<div class=\"bx-messenger-content-quote\"><span class=\"bx-messenger-content-quote-icon\"></span><div class=\"bx-messenger-content-quote-wrap\">"+p1+"</div></div><br />";
					});
				}

				/*if (image)
				{
					let changed = false;
					text = text.replace(/<a(.*?)>(http[s]{0,1}:\/\/.*?)<\/a>/ig, function(whole, aInner, text, offset)
					{
						if(!text.match(/(\.(jpg|jpeg|png|gif)\?|\.(jpg|jpeg|png|gif)$)/i) || text.indexOf("/docs/pub/") > 0 || text.indexOf("logout=yes") > 0)
						{
							return whole;
						}
						else if (BX.MessengerCommon.isMobile())
						{
							changed = true;
							return (offset > 0? '<br />':'')+'<span class="bx-messenger-file-image"><span class="bx-messenger-file-image-src"><img src="'+text+'" class="bx-messenger-file-image-text" onclick="BXIM.messenger.openPhotoGallery(this.src);" onerror="BX.MessengerCommon.hideErrorImage(this)"></span></span>';
						}
						else
						{
							changed = true;
							return (offset > 0? '<br />':'')+'<span class="bx-messenger-file-image"><a' +aInner+ ' target="_blank" class="bx-messenger-file-image-src"><img src="'+text+'" class="bx-messenger-file-image-text" onerror="BX.MessengerCommon.hideErrorImage(this)"></a></span>';
						}
					});
					if (changed)
					{
						text = text.replace(/<\/span>(\n?)<br(\s\/?)>/ig, '</span>').replace(/<br(\s\/?)>(\n?)<br(\s\/?)>(\n?)<span/ig, '<br /><span');
					}
				}*/
				if (highlightText)
				{
					text = text.replace(new RegExp("("+highlightText.replace(/[\-\[\]\/{}()*+?.\\^$|]/g, "\\$&")+")",'ig'), '<span class="bx-messenger-highlight">$1</span>');
				}

				/*if (this.BXIM.settings.enableBigSmile)
				{
					var oneSmileInMessage = false;
					text = text.replace(
						/^(\s*<img\s+src=[^>]+?data-code=[^>]+?data-definition="UHD"[^>]+?style="width:)(\d+)(px[^>]+?height:)(\d+)(px[^>]+?class="bx-smile"\s*\/?>\s*)$/,
						function doubleSmileSize(match, start, width, middle, height, end) {
							oneSmileInMessage = true;
							return start + (parseInt(width, 10) * 2) + middle + (parseInt(height, 10) * 2) + end;
						}
					);
					if (objectReference && oneSmileInMessage)
					{
						objectReference.oneSmileInMessage = true;
					}
				}*/

				if (text.substr(-6) == '<br />')
				{
					text = text.substr(0, text.length-6);
				}
				text = text.replace(/<br><br \/>/ig, '<br />');
				text = text.replace(/<br \/><br>/ig, '<br />');

				return text;
			};

			const validate = function(fields)
			{
				const result = {};

				if (typeof fields.id === "number" || typeof fields.id === "string")
				{
					result.id = parseInt(fields.id);
				}
				if (typeof fields.templateId === "number" || typeof fields.templateId === "string")
				{
					result.templateId = parseInt(fields.templateId);
				}

				if (typeof fields.chatId === "number" || typeof fields.chatId === "string")
				{
					result.chatId = parseInt(fields.chatId);
				}
				else if (typeof fields.chat_id === "number" || typeof fields.chat_id === "string")
				{
					result.chatId = parseInt(fields.chat_id);
				}

				if (fields.date instanceof Date)
				{
					result.date = fields.date;
				}
				else if (typeof fields.date === "string")
				{
					result.date = new Date(fields.date);
				}
				else
				{
					result.date = new Date();
				}

				// previous P&P format
				if (typeof fields.textOriginal === "string" || typeof fields.textOriginal === "number")
				{
					result.text = fields.textOriginal.toString();

					if (typeof fields.text === "string" || typeof fields.text === "number")
					{
						result.textConverted = fields.text.toString();
					}
				}
				else // modern format
				{
					if (typeof fields.textConverted === "string" || typeof fields.textConverted === "number")
					{
						result.textConverted = fields.textConverted.toString();
					}
					else if (typeof fields.text_converted === "string" || typeof fields.text_converted === "number")
					{
						result.textConverted = fields.text_converted.toString();
					}
					if (typeof fields.text === "string" || typeof fields.text === "number")
					{
						result.text = fields.text.toString();

						if (typeof result.textConverted === 'undefined')
						{
							result.textConverted = convertToHtml(result.text);
						}
					}
				}

				if (typeof fields.senderId === "number" || typeof fields.senderId === "string")
				{
					result.authorId = parseInt(fields.senderId);
				}
				else if (typeof fields.author_id === "number" || typeof fields.author_id === "string")
				{
					result.authorId = parseInt(fields.author_id);
				}
				else if (typeof fields.authorId === "number" || typeof fields.authorId === "string")
				{
					result.authorId = parseInt(fields.authorId);
				}

				if (typeof fields.params === "object" && fields.params !== null)
				{
					const params = validateParams(fields.params);
					if (!params)
					{
						result.params = params;
					}
				}

				if (typeof fields.sending === "boolean")
				{
					result.sending = fields.sending;
				}
				if (typeof fields.unread === "boolean")
				{
					result.unread = fields.unread;
				}

				return result;
			};

			const validateParams = function(store, params)
			{
				const result = {};
				let resultCountElement = 0;
				try
				{
					for (let field in params)
					{
						if (!params.hasOwnProperty(field))
						{
							continue;
						}

						result[field] = params[field];
					}
				}
				catch(e)
				{}

				return resultCountElement? result: null;
			};


			/* restore data */
			return {
				namespaced: true,

				state: {
					created: 0,
					messages: [],
					messageDefault: Object.freeze({
						id: 0,
						chatId: 0,
						authorId: 0,
						date: null,
						text: "",
						textConverted: "",
						params: {},

						templateId: 0,
						unread: false,
						sending: false,
					})
				},
				utils: {

				},
				actions: {
					add(store, payload) // MessengerMessageStore.add
					{
						let message = Object.assign({}, store.state.messageDefault, validate(Object.assign({}, payload)));

						message.id = 'temporary'+store.state.created;
						message.templateId = message.id;
						message.sending = true;

						store.commit('add', message);

						return message.id;
					},
					set(store, payload) // MessengerMessageStore.set
					{
						if (payload instanceof Array)
						{
							payload = payload.map(message => {
								message = Object.assign({}, store.state.messageDefault, validate(Object.assign({}, message)));
								message.templateId = message.id;

								return message;
							});
						}
						else
						{
							payload = Object.assign({}, store.state.messageDefault, validate(Object.assign({}, payload)));
							payload.templateId = payload.id;
						}

						store.commit('set', {
							position: 'after',
							data: payload
						});
					},
					setBefore(store, payload) // MessengerMessageStore.setBefore
					{
						if (payload instanceof Array)
						{
							payload = payload.map(message => {
								message = Object.assign({}, store.state.messageDefault, validate(Object.assign({}, message)));
								message.templateId = message.id;
								return message;
							});
						}
						else
						{
							payload = Object.assign({}, store.state.messageDefault, validate(Object.assign({}, payload)));
							payload.templateId = payload.id;
						}

						store.commit('set', {
							position: 'before',
							data: payload
						});
					},
					update(store, payload) // MessengerMessageStore.update
					{
						let fields = Object.assign({}, validate(Object.assign({}, payload.fields)));

						store.commit('update', {
							id: payload.id,
							fields
						});

						return true;
					},
					delete(store, id)  // MessengerMessageStore.delete
					{
						store.commit('delete', id);
						return true;
					},
				},
				mutations: {
					add: (state, message) =>
					{
						state.messages.push(message);
						state.created += 1;
					},
					set: (state, payload) =>
					{
						if (payload.data instanceof Array)
						{
							if (payload.position == 'after')
							{
								for (let message of payload.data)
								{
									let index = state.messages.findIndex(element => element.id === message.id);
									if (index > -1)
									{
										state.messages[index] = message;
									}
									else
									{
										state.messages.push(message);
									}
								}
							}
							else
							{
								for (let message of payload.data)
								{
									let index = state.messages.findIndex(element => element.id === message.id);
									if (index > -1)
									{
										state.messages[index] = message;
									}
									else
									{
										state.messages.unshift(message);
									}
								}
							}
						}
						else
						{
							let index = state.messages.findIndex(element => element.id === payload.data.id);
							if (index > -1)
							{
								state.messages[index] = payload.data;
							}
							else
							{
								if (payload.position == 'after')
								{
									state.messages.push(payload.data);
								}
								else
								{
									state.messages.unshift(payload.data);
								}
							}
						}
					},
					update: (state, params) =>
					{
						let index = state.messages.findIndex(message => message.id == params.id);
						state.messages[index] = Object.assign(state.messages[index], params.fields);
					},
					delete: (state, id) =>
					{
						state.messages = state.messages.filter(message => message.id != id);
					}
				}
			};
		}

		initRestClient()
		{
			this.restClient = new LiveChatRestClient({endpoint: this.host+'/rest'});

			if (this.isUserRegistered())
			{
				this.restClient.setAuthId(this.getUserHash());
			}
			else
			{
				this.restClient.setAuthId(RestAuth.guest);
			}
		}

		requestWidgetData()
		{
			if (!this.isReady())
			{
				console.error('LiveChatWidget.start: widget code or host is not specified');
				return false;
			}

			this.widgetDataRequested = true;

			if (this.isConfigDataLoaded() && this.isUserRegistered())
			{
				this.requestData();
				this.inited = true;
				this.fireInitEvent();
			}
			else
			{
				this.restClient.callMethod(RestMethod.widgetConfigGet, {code: this.code}, (xhr) => {this.configRequestXhr = xhr}).then((result) => {
					this.configRequestXhr = null;
					this.clearError();

					this.storeDataFromRest(RestMethod.widgetConfigGet, result.data());

					if (!this.inited)
					{
						this.inited = true;
						this.fireInitEvent();
					}
				}).catch(result => {
					this.configRequestXhr = null;

					this.setError(result.error().ex.error, result.error().ex.error_description);
				});

				if (this.isConfigDataLoaded())
				{
					this.inited = true;
					this.fireInitEvent();
				}
			}

			this.timer = new BX.Messenger.timer();
		}

		requestData()
		{
			if (this.requestDataSend)
			{
				return true;
			}

			this.requestDataSend = true;

			if (this.configRequestXhr)
			{
				this.configRequestXhr.abort();
			}

			let query = {
				[RestMethod.widgetConfigGet]: [RestMethod.widgetConfigGet, {code: this.code}]
			};

			if (this.isUserRegistered())
			{
				query[RestMethod.widgetDialogGet] = [RestMethod.widgetDialogGet, {config_id: this.getConfigId()}];
				query[RestMethod.imDialogMessagesGet] = [RestMethod.imDialogMessagesGet, {chat_id: '$result['+RestMethod.widgetDialogGet+'][chatId]', convert_text: 'Y'}];
			}
			else
			{
				query[RestMethod.widgetUserRegister] = [RestMethod.widgetUserRegister, {config_id: '$result['+RestMethod.widgetConfigGet+'][configId]', ...this.getUserRegisterFields()}];
			}
			query[RestMethod.pullServerTime] = [RestMethod.pullServerTime, {}];
			query[RestMethod.pullConfigGet] = [RestMethod.pullConfigGet, {'CACHE': 'N'}];
			query[RestMethod.widgetUserGet] = [RestMethod.widgetUserGet, {}];

			this.restClient.callBatch(query, (response) =>
			{
				if (!response)
				{
					this.requestDataSend = false;
					this.setError('EMPTY_RESPONSE', 'Server returned an empty response.');
					return false;
				}

				let isUserRegistered = this.isUserRegistered();

				let configGet = response[RestMethod.widgetConfigGet];
				if (configGet && configGet.error())
				{
					this.requestDataSend = false;

					this.setError(configGet.error().ex.error, configGet.error().ex.error_description);
					return false;
				}
				this.storeDataFromRest(RestMethod.widgetConfigGet, configGet.data());

				let userGetResult = response[RestMethod.widgetUserGet];
				if (userGetResult.error())
				{
					this.requestDataSend = false;
					this.setError(userGetResult.error().ex.error, userGetResult.error().ex.error_description);
					return false;
				}
				this.storeDataFromRest(RestMethod.widgetUserGet, userGetResult.data());

				if (isUserRegistered)
				{
					let dialogGetResult = response[RestMethod.widgetDialogGet];
					if (dialogGetResult.error())
					{
						this.requestDataSend = false;
						this.setError(dialogGetResult.error().ex.error, dialogGetResult.error().ex.error_description);
						return false;
					}
					this.storeDataFromRest(RestMethod.widgetDialogGet, dialogGetResult.data());

					let dialogMessagesGetResult = response[RestMethod.imDialogMessagesGet];
					if (dialogMessagesGetResult.error())
					{
						this.requestDataSend = false;
						this.setError(dialogMessagesGetResult.error().ex.error, dialogMessagesGetResult.error().ex.error_description);
						return false;
					}
					this.storeDataFromRest(RestMethod.imDialogMessagesGet, dialogMessagesGetResult.data());
				}
				else
				{
					let userGetResult = response[RestMethod.widgetUserGet];
					if (userGetResult.error())
					{
						this.requestDataSend = false;
						this.setError(userGetResult.error().ex.error, userGetResult.error().ex.error_description);
						return false;
					}
					this.storeDataFromRest(RestMethod.widgetUserGet, userGetResult.data());

					let userRegisterResult = response[RestMethod.widgetUserRegister];
					if (userRegisterResult.error())
					{
						this.requestDataSend = false;
						this.setError(userRegisterResult.error().ex.error, userRegisterResult.error().ex.error_description);
						return false;
					}
					this.storeDataFromRest(RestMethod.widgetUserRegister, userRegisterResult.data());
				}

				var timeShift = 0;

				let serverTimeResult = response[RestMethod.pullServerTime];
				if (serverTimeResult && !serverTimeResult.error())
				{
					timeShift = Math.floor((Utils.getTimestamp() - new Date(serverTimeResult.data()).getTime())/1000);
				}

				let config = null;
				let pullConfigResult = response[RestMethod.pullConfigGet];
				if (pullConfigResult && !pullConfigResult.error())
				{
					config = pullConfigResult.data();
					config.server.timeShift = timeShift;
				}

				this.startPullClient(config).then(() => {
					this.sendMessages();
				}).catch((error) => {
					this.setError(error.ex.error, error.ex.error_description);
				});

				this.requestDataSend = false;
			}, false, false, 'init.config');
		}

		storeDataFromRest(type, result)
		{
			if (RestMethodCheck.includes(type))
			{
				console.warn(`%cLiveChatWidget.storeDataFromRest: config is not set, because you are trying to set as unknown type (%c${type}%c)`, "color: black;", "font-weight: bold; color: red", "color: black");
				return false;
			}

			if (type == RestMethod.widgetConfigGet)
			{
				this.store.commit(WidgetStore.widgetData, {
					configId: result.configId,
					configName: result.configName,
					voteEnable: result.voteEnable,
					operators: result.operators || [],
					online: result.online,
					consentUrl: result.consentUrl,
					connectors: result.connectors || [],
				});
			}
			else if (type == RestMethod.widgetUserRegister)
			{
				this.restClient.setAuthId(result.hash);
				this.store.commit(WidgetStore.dialogData, {
					chatId: result.chatId,
					userConsent: result.userConsent,
				});
			}
			else if (type == RestMethod.widgetUserGet)
			{
				this.store.commit(WidgetStore.userData, {
					id: result.id,
					hash: result.hash,
					name: result.name,
					lastName: result.lastName,
					avatar: result.avatar,
					email: result.email,
					www: result.www,
					gender: result.gender,
					position: result.position,
				});
			}
			else if (type == RestMethod.widgetDialogGet)
			{
				let operatorData = {
					name: '',
					avatar: '',
					online: false,
				};
				if (result.operator)
				{
					operatorData.name = result.operator.name;
					operatorData.avatar = result.operator.avatar;
					operatorData.online = result.operator.online;
				}

				this.store.commit(WidgetStore.dialogData, {
					chatId: result.chatId,
					sessionId: result.sessionId,
					sessionClose: result.sessionClose,
					userVote: result.userVote,
					userConsent: result.userConsent,
					operator: operatorData
				});
			}
			else if (type == RestMethod.imDialogMessagesGet)
			{
				this.store.dispatch(MessengerMessageStore.setBefore, result.messages);
			}


			return true;
		}

	/* endregion 01. Initialize and store data */

	/* region 02. Push & Pull */

		startPullClient(config)
		{
			let promise = new BX.Promise();

			if (this.pullClient)
			{
				if (!this.pullClient.isConnected())
				{
					this.pullClient.scheduleReconnect();
				}
				promise.resolve(true);
				return promise;
			}
			if (!this.getUserId() || !this.getSiteId() || !this.restClient)
			{
				promise.reject({
					ex: { error: 'WIDGET_NOT_LOADED', error_description: 'Widget is not loaded.'}
				});
				return promise;
			}

			this.pullClient = new BX.PullClient({
				serverEnabled: true,
				userId: this.getUserId(),
				siteId: this.getSiteId(),
				restClient: this.restClient,
				configTimestamp: config? config.server.config_timestamp: 0
			});
			this.pullClient.subscribe({
				type: BX.PullClient.SubscriptionType.Server,
				moduleId: 'im',
				callback: this.eventMessengerInteraction.bind(this)
			});
			this.pullClient.subscribe({
				type: BX.PullClient.SubscriptionType.Server,
				moduleId: 'imopenlines',
				callback: this.eventLinesInteraction.bind(this)
			});

			this.pullConnectedFirstTime = this.pullClient.subscribe({
				type: BX.PullClient.SubscriptionType.Status,
				callback: (result) => {
					if (result.status == BX.PullClient.PullStatus.Online)
					{
						promise.resolve(true);
						this.pullConnectedFirstTime();
					}
				}
			});

			this.pullClient.start(config).catch(function(){
				promise.reject({
					ex: { error: 'PULL_CONNECTION_ERROR', error_description: 'Pull is not connected.'}
				});
			});

			return promise;
		}

		stopPullClient()
		{
			if (this.pullClient)
			{
				this.pullClient.stop(BX.PullClient.CloseReasons.MANUAL, 'Closed manually');
			}
		}

		eventMessengerInteraction(data)
		{
			console.info('eventMessengerInteraction', data);

			if (data.command == "messageChat")
			{
				if (this.messagesQueue.length > 0 && data.params.message.senderId == this.getUserId())
				{
					return false;
				}
				this.store.dispatch(MessengerMessageStore.set, data.params.message);
			}
		}

		eventLinesInteraction(data)
		{
			console.info('eventLinesInteraction', data);

			if (data.command == "sessionStart")
			{
				this.store.commit(WidgetStore.dialogData, {
					sessionId: data.params.sessionId,
					sessionClose: false,
					userVote: VoteType.none,
				});
			}
			else if (data.command == "sessionOperatorChange")
			{
				this.store.commit(WidgetStore.dialogData, {
					operator: data.params.operator
				});
			}
			else if (data.command == "sessionFinish")
			{
				this.store.commit(WidgetStore.dialogData, {
					sessionId: data.params.sessionId,
					sessionClose: true,
				});
			}
		}

	/* endregion 02. Push & Pull */

	/* region 03. Template and template interaction */

		attachTemplate()
		{
			if (this.templateEngine)
			{
				this.store.commit(WidgetStore.widgetData, {showed: true});
				return true;
			}

			this.rootNode.innerHTML = '';
			this.rootNode.appendChild(document.createElement('div'));

			const widgetContext = this;

			this.templateEngine = new Vue({
				el: this.rootNode.firstChild,
				store: this.store,
				template: '<bx-livechat/>',
				beforeCreate: function() {
					this.$bitrixController = widgetContext;
					this.$bitrixMessages = widgetContext.localize;
				},
				destroyed: function() {
					this.$bitrixController.templateEngine = null;
					this.$bitrixController.templateAttached = false;
					this.$bitrixController.rootNode.innerHTML = '';
					this.$bitrixController = null;
				}
			});

			return true;
		}

		detachTemplate()
		{
			if (!this.templateEngine)
			{
				return true;
			}

			this.templateEngine.$destroy();

			return true;
		}

		addMessage(text = '', file = null)
		{
			if (!text && !file)
			{
				return false;
			}

			console.warn('addMessage', text, file);

			if (text == 'clear' || text == 'reload') // TODO remove this
			{
				this.store.commit(WidgetStore.widgetData, {dialogStart: false});
				this.store.commit(WidgetStore.dialogData, {chatId: 0, sessionId: 0, userConsent: false});
				this.store.commit(WidgetStore.userData, {id: 0, hash: ''});

				localStorage.clear();
				location.reload();

				return false;
			}

			this.store.dispatch(MessengerMessageStore.add, {
				chatId: this.getChatId(),
				authorId: this.getUserId(),
				text: text,
			}).then(messageId => {
				this.messagesQueue.push({
					id: messageId,
					text,
					file,
					sending: false
				});

				if (this.getChatId())
				{
					this.sendMessages();
				}
				else
				{
					this.requestData();
				}
			});

			return true;
		}

		sendMessages()
		{
			this.stopWritesMessage();
			this.messagesQueue.filter(element => !element.sending).forEach(element => {
				element.sending = true;
				this.restClient.callMethod(RestMethod.imMessageAdd, {
					'CHAT_ID': this.getChatId(),
					'MESSAGE': element.text
				}).then((result) => {
					this.store.dispatch(MessengerMessageStore.update, {
						id: element.id,
						fields: {
							id: result.data(),
							authorId: this.getUserId(),
							chatId: this.getChatId(),
							sending: false
						}
					});
					this.messagesQueue = this.messagesQueue.filter(el => el.id != element.id);
				});
			});
		}

		writesMessage()
		{
			if (
				!this.getChatId()
				|| this.timer.has('writes')
			)
			{
				return;
			}

			this.timer.start('writes', null, 28);

			this.restClient.callMethod(RestMethod.imSendTyping, {
				'CHAT_ID': this.getChatId()
			}).catch(() => {
				this.timer.stop('writes');
			});
		}

		stopWritesMessage()
		{
			this.timer.stop('writes');
		}

		sendDialogVote(result)
		{
			if (!this.getSessionId())
			{
				return false;
			}

			this.restClient.callMethod(RestMethod.widgetUserVote, {
				'SESSION_ID': this.getSessionId(),
				'ACTION': result
			}).catch((result) => {
				this.store.commit(WidgetStore.dialogData, {userVote: VoteType.none});
			});
		}

		setConsentDecision(result)
		{
			result = result === true;

			this.store.commit(WidgetStore.dialogData, {userConsent: result});

			if (result && this.isUserRegistered())
			{
				this.restClient.callMethod(RestMethod.widgetUserConsentApply, {
					config_id: this.getConfigId(),
					consent_url: location.href
				});
			}
		}

		sendConsentDecision(result)
		{
			// отправляем данные о решении на сервер
			// если результат сохранения был отрицательный, переотправляем позже при следующем действии пользователя
		}

	/* endregion 03. Templates and template interaction */

	/* region 04. Widget interaction and utils */

		start()
		{
			this.initRestClient();

			if (BX.LiveChatWidget.domReadyFlag)
			{
				if (this.isSessionActive())
				{
					this.requestWidgetData();
				}
			}
			else
			{
				document.addEventListener("DOMContentLoaded", () => {
					BX.LiveChatWidget.domReadyFlag = true;
					if (this.isSessionActive())
					{
						this.requestWidgetData();
					}
				});
			}
		}

		open()
		{
			if (!this.isWidgetDataRequested())
			{
				this.requestWidgetData();
			}
			this.attachTemplate();

			if (this.buttonInstance)
			{
				this.buttonInstance.shadow.setAutoClose(false);
				this.buttonInstance.buttons.stopPulseAnimation();
				this.buttonInstance.buttons.stopIconAnimation();
				this.buttonInstance.buttons.hide();
				this.buttonInstance.show();

				setTimeout(function(){
					this.buttonInstance.onWidgetClose()
				}.bind(this), 0);
			}
		}

		close()
		{
			if (this.buttonInstance)
			{
				this.buttonInstance.shadow.setAutoClose(true);
				this.buttonInstance.buttons.startPulseAnimation();
				this.buttonInstance.buttons.startIconAnimation();
				this.buttonInstance.buttons.hide();
				this.buttonInstance.show();
			}
			this.detachTemplate();
		}

		showNotification(params)
		{
			// TODO show popup notification and set badge on button
			// operatorName
			// notificationText
			// counter
		}

		fireInitEvent()
		{
			if (this.initEventFired)
			{
				return true;
			}

			window.dispatchEvent(new CustomEvent('onBitrixLiveChatInit', {detail: {
				widget: this,
				widgetCode: this.code,
				widgetHost: this.host,
			}}));

			this.initEventFired = true;

			return true;
		}

		isReady()
		{
			return this.ready;
		}

		isInited()
		{
			return this.inited;
		}

		isUserRegistered()
		{
			return !!this.getUserHash();
		}

		isConfigDataLoaded()
		{
			return this.store.state.widget.widgetData.configId;
		}

		isWidgetDataRequested()
		{
			return this.widgetDataRequested;
		}

		isChatLoaded()
		{
			return this.store.state.widget.dialogData.chatId > 0;
		}

		isSessionActive()
		{
			return !this.store.state.widget.dialogData.sessionClose;
		}

		isUserLoaded()
		{
			return this.store.state.widget.userData.id > 0;
		}

		getSiteId()
		{
			return this.host.replace(/(http.?:\/\/)|([:.\\\/])/mg, "")+this.code;
		}

		getHost()
		{
			return this.host;
		}

		getConfigId()
		{
			return this.store.state.widget.widgetData.configId;
		}

		getChatId()
		{
			return this.store.state.widget.dialogData.chatId;
		}

		getSessionId()
		{
			return this.store.state.widget.dialogData.sessionId;
		}

		getDialogId()
		{
			if (!this.getChatId())
				return '';

			return 'chat'+this.getChatId();
		}

		getUserHash()
		{
			return this.store.state.widget.userData.hash;
		}

		getUserId()
		{
			return this.store.state.widget.userData.id;
		}

		getUserData()
		{
			return this.store.state.widget.userData;
		}

		getUserRegisterFields()
		{
			return {
				'name': this.userRegisterData.name || '',
				'last_name': this.userRegisterData.lastName || '',
				'avatar': this.userRegisterData.avatar || '',
				'email': this.userRegisterData.email || '',
				'www': this.userRegisterData.www || '',
				'gender': this.userRegisterData.gender || '',
				'position': this.userRegisterData.position || '',
				'custom_hash': this.userRegisterData.hash || '',
				'consent_url': this.store.state.widget.widgetData.consentUrl? location.href: '',
			}
		}

		getWidgetLocationCode()
		{
			return LocationStyle[this.store.state.widget.widgetData.location];
		}

		setUserRegisterData(params)
		{
			const validUserFields = ['hash', 'name', 'lastName', 'avatar', 'email', 'www', 'gender', 'position'];

			if (!Utils.isPlainObject(params))
			{
				console.error(`%cLiveChatWidget.setUserData: params is not a object`, "color: black;");
				return false;
			}

			for (let field in this.userRegisterData)
			{
				if (!this.userRegisterData.hasOwnProperty(field))
				{
					continue;
				}
				if (!params[field])
				{
					delete this.userRegisterData[field];
				}
			}

			for (let field in params)
			{
				if (!params.hasOwnProperty(field))
				{
					continue;
				}

				if (validUserFields.indexOf(field) === -1)
				{
					console.warn(`%cLiveChatWidget.setUserData: user field is not set, because you are trying to set an unknown field (%c${field}%c)`, "color: black;", "font-weight: bold; color: red", "color: black");
					continue;
				}

				this.userRegisterData[field] = params[field];
			}
		}

		setUtmData(params)
		{
			if (!Utils.isPlainObject(params))
			{
				console.error(`%cLiveChatWidget.setUtmData: params is not a object`, "color: black;");
			}

			for (let type in this.utm)
			{
				if (!this.utm.hasOwnProperty(type))
				{
					continue;
				}
				if (!params[type])
				{
					delete this.utm[type];
				}
			}

			for (let type in params)
			{
				if (!params.hasOwnProperty(type))
				{
					continue;
				}

				this.utm[type] = params[type];
			}
		}

		setCustomData(params)
		{
			if (!Utils.isPlainObject(params))
			{
				console.error(`%cLiveChatWidget.setCustomData: params is not a object`, "color: black;");
				return false;
			}

			for (let key in params)
			{
				if (!params.hasOwnProperty(key))
				{
					continue;
				}

				if (typeof params[key] !== 'string' && typeof params[key] !== 'number' && params[key] !== 'boolean')
				{
					console.warn(`%cLiveChatWidget.setCustomData: data is not set, because you are trying to set prohibited data-type (%c${key} is ${typeof params.type}%c)`, "color: black;", "font-weight: bold; color: red", "color: black");
					continue;
				}

				if (typeof params[key] === 'boolean')
				{
					params[key] = params[key]? 'Y': 'N';
				}
				else if (typeof params[key] === 'string' && params[key].length > 245)
				{
					params[key] = params[key].substring(0, 245)+' [...]';
					console.warn(`%cLiveChatWidget.setCustomData: data has been reduced, because it exceeds the allowable length (%c${key}%c)`, "color: black;", "font-weight: bold; color: red", "color: black");
				}

				if (!params[key])
				{
					delete this.customData[key];
				}
				else
				{
					this.customData[key] = params[key];
				}
			}

			return true;
		}

		setError(code = '', description = '')
		{
			console.error(`LiveChatWidget.error: ${code} (${description})`);

			let localizeDescription = '';
			if (code == 'LIVECHAT_AUTH_PORTAL_USER')
			{
				localizeDescription = this.getLocalize('BX_LIVECHAT_PORTAL_USER').replace('#LINK_START#', '<a href="'+this.host+'">').replace('#LINK_END#', '</a>')
			}

			this.store.commit(WidgetStore.widgetData, {error: {active: true, code, description: localizeDescription}});
		}

		clearError()
		{
			this.store.commit(WidgetStore.widgetData, {error: {active: false, code: '', description: ''}});
		}

		/**
		 *
		 * @param params {Object}
		 * @returns {Function|Boolean} - Unsubscribe callback function or False
		 */
		subscribe(params)
		{
			if (!Utils.isPlainObject(params))
			{
				console.error(`%cLiveChatWidget.subscribe: params is not a object`, "color: black;");
				return false;
			}

			if (!SubscriptionType[params.type])
			{
				console.error(`%cLiveChatWidget.subscribe: subscription type is not correct (%c${params.type}%c)`, "color: black;", "font-weight: bold; color: red", "color: black");
				return false;
			}

			if (typeof params.callback !== 'function')
			{
				console.error(`%cLiveChatWidget.subscribe: callback is not a function (%c${typeof params.callback}%c)`, "color: black;", "font-weight: bold; color: red", "color: black");
				return false;
			}

			if (typeof (this.subscribers[params.type]) === 'undefined')
			{
				this.subscribers[params.type] = [];
			}

			this.subscribers[params.type].push(params.callback);

			return function () {
				this.subscribers[params.type] = this.subscribers[params.type].filter(function(element) {
					return element !== params.callback;
				});
			}.bind(this);
		}

		addLocalize(phrases)
		{
			if (typeof phrases !== "object")
			{
				return false;
			}

			for (let name in phrases)
			{
				if (phrases.hasOwnProperty(name))
				{
					this.localize[name] = phrases[name];
				}
			}

			return true;
		};

		getLocalize(name = '')
		{
			let phrase = '';
			if (typeof this.localize[name] === 'undefined')
			{
				console.warn(`LiveChatWidget.getLocalize: message with code '${name}' is undefined.`)
			}
			else
			{
				phrase = this.localize[name];
			}

			return phrase;
		}

		/* endregion 04. Widget interaction and utils */
	}

	const Utils = {
		browser: {
			isSafari: function()
			{
				return typeof navigator.vendor !== 'undefined' && navigator.vendor.includes("Apple");
			}
		},
		getTimestamp: function()
		{
			return (new Date()).getTime();
		},
		getDeviceType: function()
		{
			if(
				navigator.userAgent.match(/Android/i)
				|| navigator.userAgent.match(/webOS/i)
				|| navigator.userAgent.match(/iPhone/i)
				|| navigator.userAgent.match(/iPad/i)
				|| navigator.userAgent.match(/iPod/i)
				|| navigator.userAgent.match(/BlackBerry/i)
				|| navigator.userAgent.match(/Windows Phone/i)
			)
			{
				return DeviceType.mobile;
			}
			else
			{
				return DeviceType.desktop;
			}
		},
		getDeviceOrientation: function()
		{
			if (this.getDeviceType() !== DeviceType.mobile)
			{
				return DeviceOrientation.portrait;
			}

			return Math.abs(window.orientation) === 90? DeviceOrientation.horizontal: DeviceOrientation.portrait;
		},
		isDarkColor: function(hex)
		{
			if (!hex || !hex.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/))
			{
				return false;
			}

			if (hex.length === 4)
			{
				hex = hex.replace(/#([A-Fa-f0-9])/gi, "$1$1");
			}
			else
			{
				hex = hex.replace(/#([A-Fa-f0-9])/gi, "$1");
			}

			hex = hex.toLowerCase();

			let darkColor = [
				"#17a3ea",
				"#00c4fb",
				"#47d1e2",
				"#75d900",
				"#ffab00",
				"#ff5752",
				"#468ee5",
				"#1eae43"
			];
			if (darkColor.includes('#'+hex))
			{
				return true;
			}

			let bigint = parseInt(hex, 16);

			let red = (bigint >> 16) & 255;
			let green = (bigint >> 8) & 255;
			let blue = bigint & 255;

			let brightness = (red * 299 + green * 587 + blue * 114) / 1000;

			return brightness < 128;
		},
		isString: function(item)
		{
			return item === '' ? true : (item ? (typeof (item) == "string" || item instanceof String) : false);
		},
		isArray: function(item)
		{
			return item && Object.prototype.toString.call(item) == "[object Array]";
		},
		isFunction: function(item)
		{
			return item === null ? false : (typeof (item) == "function" || item instanceof Function);
		},
		isDomNode: function(item)
		{
			return item && typeof (item) == "object" && "nodeType" in item;
		},
		isDate: function(item)
		{
			return item && Object.prototype.toString.call(item) == "[object Date]";
		},
		isPlainObject: function(item)
		{
			if (!item || typeof item !== "object" || item.nodeType)
			{
				return false;
			}

			const hasProp = Object.prototype.hasOwnProperty;
			try
			{
				if (
					item.constructor
					&& !hasProp.call(item, "constructor")
					&& !hasProp.call(item.constructor.prototype, "isPrototypeOf")
				)
				{
					return false;
				}
			}
			catch (e)
			{
				return false;
			}

			let key;
			for (let key in item)
			{
			}

			return typeof(key) === "undefined" || hasProp.call(item, key);
		}
	};


	const LocalStorage =
	{
		enabled: null,

		isEnabled: function()
		{
			if (this.enabled !== null)
			{
				return this.enabled;
			}

			this.enabled = false;

			if (typeof window.localStorage !== 'undefined')
			{
				try
				{
					window.localStorage.setItem('__bx_test_ls_feature__', 'ok');
					if (window.localStorage.getItem('__bx_test_ls_feature__') === 'ok')
					{
						window.localStorage.removeItem('__bx_test_ls_feature__');
						this.enabled = true;
					}
				}
				catch(e)
				{
				}
			}

			return this.enabled;
		},

		set: function(siteId, name, value)
		{
			if (!this.isEnabled())
			{
				return false;
			}

			let storeValue = JSON.stringify({value});
			if (window.localStorage.getItem(this._getKey(siteId, name)) !== storeValue)
			{
				window.localStorage.setItem(this._getKey(siteId, name), storeValue);
			}

			return true;
		},

		get: function(siteId, name, defaultValue)
		{
			if (!this.isEnabled())
			{
				return typeof defaultValue !== 'undefined'? defaultValue: null;
			}

			let result = window.localStorage.getItem(this._getKey(siteId, name));
			if (result === null)
			{
				return typeof defaultValue !== 'undefined'? defaultValue: null;
			}

			try
			{
				result = JSON.parse(result);
				if (result && typeof result.value !== 'undefined')
				{
					result = result.value;
				}
				else
				{
					return typeof defaultValue !== 'undefined'? defaultValue: null;
				}
			}
			catch(e) {}

			return result;
		},

		remove: function(siteId, name)
		{
			if (!this.isEnabled())
			{
				return false;
			}
			return window.localStorage.removeItem(this._getKey(siteId, name));
		},

		_getKey: function(siteId, name)
		{
			return 'bx-livechat-' + siteId + '-' + name;
		},
	};

	const Cookie = {
		get: function (siteId, name)
		{
			if (navigator.cookieEnabled)
			{
				let result = document.cookie.match(new RegExp(
					"(?:^|; )" + (siteId+'_'+name).replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1') + "=([^;]*)"
				));

				if (result)
				{
					return decodeURIComponent(result[1]);
				}
			}

			if (LocalStorage.isEnabled())
			{
				let result = LocalStorage.get(siteId, name, undefined);
				if (typeof result !== 'undefined')
				{
					return result;
				}
			}

			if (typeof BX.LiveChatCookie === 'undefined')
			{
				BX.LiveChatCookie = {};
			}

			return BX.LiveChatCookie[siteId+'_'+name];
		},
		set: function (siteId, name, value, options)
		{
			options = options || {};

			let expires = options.expires;
			if (typeof(expires) == "number" && expires)
			{
				let currentDate = new Date();
				currentDate.setTime(currentDate.getTime() + expires * 1000);
				expires = options.expires = currentDate;
			}

			if (expires && expires.toUTCString)
			{
				options.expires = expires.toUTCString();
			}

			value = encodeURIComponent(value);

			let updatedCookie = siteId+'_'+name + "=" + value;

			for (let propertyName in options)
			{
				if (!options.hasOwnProperty(propertyName))
				{
					continue;
				}
				updatedCookie += "; " + propertyName;

				let propertyValue = options[propertyName];
				if (propertyValue !== true)
				{
					updatedCookie += "=" + propertyValue;
				}
			}

			document.cookie = updatedCookie;

			if (typeof BX.LiveChatCookie === 'undefined')
			{
				BX.LiveChatCookie = {};
			}

			BX.LiveChatCookie[siteId+'_'+name] = value;
			LocalStorage.set(siteId, name, value);

			return true;
		}
	};


	const RestAuth = {
		guest: 'guest',
	};

	const RestMethod = {
		widgetUserRegister: 'imopenlines.widget.user.register',
		widgetConfigGet: 'imopenlines.widget.config.get',
		widgetDialogGet: 'imopenlines.widget.dialog.get',
		widgetUserGet: 'imopenlines.widget.user.get',
		widgetUserConsentApply: 'imopenlines.widget.user.consent.apply',
		widgetUserVote: 'imopenlines.widget.user.vote',

		pullServerTime: 'server.time',
		pullConfigGet: 'pull.config.get',

		imCountersGet: 'im.counters.get', // not implemented
		imMessageAdd: 'im.message.add',
		imMessageUpdate: 'im.message.update', // not implemented
		imMessageDelete: 'im.message.delete', // not implemented
		imMessageLike: 'im.message.like', // not implemented
		imSendTyping: 'im.chat.sendTyping',
		imDialogMessagesGet: 'im.dialog.messages.get',  // not implemented

		diskFolderGet: 'im.disk.folder.get',  // not implemented
		diskFileUpload: 'disk.folder.uploadfile',  // not implemented
		diskFileCommit: 'im.disk.file.commit',  // not implemented
	};
	const RestMethodCheck = GetObjectValues(RestMethod);

	class LiveChatRestClient
	{
		constructor(params)
		{
			this.queryAuthRestore = false;

			this.setAuthId(RestAuth.guest);

			this.restClient = new BX.RestClient({
				endpoint: params.endpoint,
				queryParams: this.queryParams
			});
		}

		setAuthId(authId)
		{
			if (typeof this.queryParams !== 'object')
			{
				this.queryParams = {};
			}

			if (
				authId == RestAuth.guest
				|| typeof authId === 'string' && authId.match(/^[a-f0-9]{32}$/)
			)
			{
				this.queryParams.livechat_auth_id = authId;
			}
			else
			{
				console.error(`%LiveChatRestClient.setAuthId: auth is not correct (%c${authId}%c)`, "color: black;", "font-weight: bold; color: red", "color: black");
				return false;
			}

			return true;
		}

		getAuthId()
		{
			if (typeof this.queryParams !== 'object')
			{
				this.queryParams = {};
			}

			return this.queryParams.livechat_auth_id || null;
		}

		callMethod(method, params, callback, sendCallback)
		{
			const promise = new BX.Promise();

			this.restClient.callMethod(method, params, null, sendCallback, 'widget').then(result => {

				this.queryAuthRestore = false;
				promise.fulfill(result);

			}).catch(result => {

				let error = result.error();
				if (error.ex.error == 'LIVECHAT_AUTH_WIDGET_USER')
				{
					this.setAuthId(error.ex.hash);

					if (method === RestMethod.widgetUserRegister)
					{
						console.warn(`BX.LiveChatRestClient: ${error.ex.error_description} (${error.ex.error})`);

						this.queryAuthRestore = false;
						promise.reject(result);
						return false;
					}

					if (!this.queryAuthRestore)
					{
						console.warn('BX.LiveChatRestClient: your auth-token has expired, send query with a new token');

						this.queryAuthRestore = true;
						this.restClient.callMethod(method, params, null, sendCallback).then(result => {
							this.queryAuthRestore = false;
							promise.fulfill(result);
						}).catch(result => {
							this.queryAuthRestore = false;
							promise.reject(result);
						});

						return false;
					}
				}

				this.queryAuthRestore = false;
				promise.reject(result);

				return false;
			});

			return promise;
		};

		callBatch(calls, callback, bHaltOnError, sendCallback, logTag = 'batch')
		{
			let resultCallback = (result) =>
			{
				let error = null;
				for (let method in calls)
				{
					if (!calls.hasOwnProperty(method))
					{
						continue;
					}

					let error = result[method].error();
					if (error && error.ex.error == 'LIVECHAT_AUTH_WIDGET_USER')
					{
						this.setAuthId(error.ex.hash);

						if (method === RestMethod.widgetUserRegister)
						{
							console.warn(`BX.LiveChatRestClient: ${error.ex.error_description} (${error.ex.error})`);

							this.queryAuthRestore = false;
							callback(result);
							return false;
						}

						if (!this.queryAuthRestore)
						{
							console.warn('BX.LiveChatRestClient: your auth-token has expired, send query with a new token');

							this.queryAuthRestore = true;
							this.restClient.callBatch(calls, callback, bHaltOnError, sendCallback, 'widget.'+logTag);

							return false;
						}
					}
				}

				this.queryAuthRestore = false;
				callback(result);

				return true;
			};

			return this.restClient.callBatch(calls, resultCallback, bHaltOnError, sendCallback, 'widget.'+logTag);
		};
	}

	const BX = window.BX;

	Vue.use(Vuex);

	BX.LiveChatWidget = LiveChatWidget;
	BX.LiveChatWidget.VoteType = VoteType;
	BX.LiveChatWidget.SubscriptionType = SubscriptionType;
	BX.LiveChatWidget.LocationStyle = LocationStyle;
	BX.LiveChatWidget.WidgetStore = WidgetStore;

	window.dispatchEvent(new CustomEvent('onBitrixLiveChatLoaded', {detail: {}}));


	Vue.component('bx-livechat', {
		data: function(){
			return {
				isMobile: false,
				viewPortMetaSiteNode: null,
				viewPortMetaWidgetNode: null,
				storedMessage: '',
			}
		},
		created()
		{
			this.onCreated();

			document.addEventListener('keydown', this.onKeyDown);
		},
		beforeDestroy()
		{
			document.removeEventListener('keydown', this.onKeyDown);
		},
		directives: {
			focus: {
				inserted: function(element, params)
				{
					if (params.value)
					{
						element.focus();
					}
				}
			}
		},
		computed:
		{
			FormType: () => FormType,
			VoteType: () => VoteType,
			DeviceType: () => DeviceType,
			customBackgroundStyle: function(state)
			{
				return state.widgetData.styles.backgroundColor? 'background-color: '+state.widgetData.styles.backgroundColor+'!important;': '';
			},
			customBackgroundOnlineStyle: function(state)
			{
				return state.widgetData.styles.backgroundColor? 'border-color: '+state.widgetData.styles.backgroundColor+'!important;': '';
			},
			localize: function(state)
			{
				let messages = {};

				let bitrixMessages = {};
				if (typeof this.$root.$bitrixMessages !== 'undefined')
				{
					bitrixMessages = this.$root.$bitrixMessages;
				}
				else if (typeof BX.message !== 'undefined')
				{
					bitrixMessages = BX.message;
				}

				for (let message in bitrixMessages)
				{
					if (!bitrixMessages.hasOwnProperty(message))
					{
						continue
					}
					if (!message.startsWith('BX_LIVECHAT_'))
					{
						continue;
					}
					messages[message] = bitrixMessages[message];
				}

				return Object.freeze(messages);
			},
			widgetMobileDisabled: function (state)
			{
				if (state.widgetData.deviceType == DeviceType.mobile)
				{
					if (navigator.userAgent.toString().includes('iPad'))
					{
					}
					else if (state.widgetData.deviceOrientation == DeviceOrientation.horizontal)
					{
						if (navigator.userAgent.toString().includes('iPhone'))
						{
							return true;
						}
						else
						{
							return !(typeof window.screen === 'object' && window.screen.availHeight >= 800);
						}
					}
				}

				return false;
			},
			widgetClassName: function (state)
			{
				let className = ['bx-livechat-wrapper'];

				className.push('bx-livechat-show');

				if (state.widgetData.language == LanguageType.russian)
				{
					className.push('bx-livechat-logo-ru');
				}
				else if (state.widgetData.language == LanguageType.ukraine)
				{
					className.push('bx-livechat-logo-ua');
				}
				else
				{
					className.push('bx-livechat-logo-en');
				}

				if (!state.widgetData.online)
				{
					className.push('bx-livechat-offline-state');
				}

				className.push('bx-livechat-position-'+LocationStyle[state.widgetData.location]);

				if (state.widgetData.dragged)
				{
					className.push('bx-livechat-drag-n-drop');
				}

				if (state.widgetData.dialogStart)
				{
					className.push('bx-livechat-chat-start');
				}

				if (
					state.dialogData.operator.name
					&& !(state.widgetData.deviceType == DeviceType.mobile && state.widgetData.deviceOrientation == DeviceOrientation.horizontal)
				)
				{
					className.push('bx-livechat-has-operator');
				}

				if (this.isMobile)
				{
					className.push('bx-livechat-mobile');
				}
				else if (Utils.browser.isSafari())
				{
					className.push('bx-livechat-browser-safari');
				}

				if (state.widgetData.styles.backgroundColor && !Utils.isDarkColor(state.widgetData.styles.backgroundColor))
				{
					className.push('bx-livechat-bright-header');
				}

				return className.join(' ');
			},
			...Vuex.mapState({
				widgetData: state => state.widget.widgetData,
				userData: state => state.widget.userData,
				dialogData: state => state.widget.dialogData,
				messagesData: state => state.messengerMessage.messages,
			})
		},
		methods: {
			detectMobile: function ()
			{
				return (
					navigator.userAgent.match(/Android/i)
					|| navigator.userAgent.match(/webOS/i)
					|| navigator.userAgent.match(/iPhone/i)
					|| navigator.userAgent.match(/iPad/i)
					|| navigator.userAgent.match(/iPod/i)
					|| navigator.userAgent.match(/BlackBerry/i)
					|| navigator.userAgent.match(/Windows Phone/i)
				);
			},
			close: function (event)
			{
				this.onBeforeClose();
				this.$store.commit(WidgetStore.widgetData, {showed: false});
			},
			userVote: function (vote)
			{
				this.$store.commit(WidgetStore.widgetData, {showForm: FormType.none});
				this.$store.commit(WidgetStore.dialogData, {userVote: vote});

				this.$root.$bitrixController.sendDialogVote(vote);
			},
			showLikeForm: function (event)
			{
				if (!this.$store.state.widget.widgetData.voteEnable)
				{
					return false;
				}
				if (
					this.$store.state.widget.dialogData.sessionClose
					&& this.$store.state.widget.dialogData.userVote != VoteType.none
				)
				{
					return false;
				}
				this.$store.commit(WidgetStore.widgetData, {showForm: FormType.like});
			},
			showHistoryForm: function (event)
			{
				this.$store.commit(WidgetStore.widgetData, {showForm: FormType.history});
			},
			hideForm: function (event)
			{
				this.$store.commit(WidgetStore.widgetData, {showForm: FormType.none});
			},
			showConsentWidow: function (event)
			{
				this.$store.commit(WidgetStore.widgetData, {showConsent: true});
			},
			onConsentKeyDown: function(event)
			{
				if (event.keyCode == 9)
				{
					if (event.target === this.$refs.consentIframe)
					{
						if (event.shiftKey)
						{
							this.$refs.consentCancel.focus();
						}
						else
						{
							this.$refs.consentSuccess.focus();
						}
					}
					else if (event.target === this.$refs.consentSuccess)
					{
						if (event.shiftKey)
						{
							this.$refs.consentIframe.focus();
						}
						else
						{
							this.$refs.consentCancel.focus();
						}
					}
					else if (event.target === this.$refs.consentCancel)
					{
						if (event.shiftKey)
						{
							this.$refs.consentSuccess.focus();
						}
						else
						{
							this.$refs.consentIframe.focus();
						}
					}
					event.preventDefault();
				}
				else if (event.keyCode == 39 || event.keyCode == 37)
				{
					if (event.target.nextElementSibling)
					{
						event.target.nextElementSibling.focus();
					}
					else if (event.target.previousElementSibling)
					{
						event.target.previousElementSibling.focus();
					}
					event.preventDefault();
				}
			},
			agreeConsentWidow: function (event)
			{
				this.$store.commit(WidgetStore.widgetData, {showConsent: false});

				this.$root.$bitrixController.setConsentDecision(true);

				if (this.storedMessage)
				{
					this.onSendMessage(undefined, {focus: this.widgetData.deviceType != DeviceType.mobile});
					this.storedMessage = '';
				}
				else if (this.widgetData.showForm == FormType.none)
				{
					this.$root.$emit('onMessengerTextareaFocus');
				}
			},
			disagreeConsentWidow: function (event) {
				this.$store.commit(WidgetStore.widgetData, {showForm : FormType.none});
				this.$store.commit(WidgetStore.widgetData, {showConsent : false});

				this.$root.$bitrixController.setConsentDecision(false);

				if (this.storedMessage)
				{
					this.$root.$emit('onMessengerTextareaInsertText', this.storedMessage, undefined, undefined, undefined, this.widgetData.deviceType != DeviceType.mobile);
					this.storedMessage = '';
				}

				if (this.widgetData.deviceType != DeviceType.mobile)
				{
					this.$root.$emit('onMessengerTextareaFocus');
				}
			},
			logEvent: function (name, ...params)
			{
				console.info(name, ...params);
			},
			onCreated: function()
			{
				if(this.detectMobile())
				{
					this.isMobile = true;
					let viewPortMetaSiteNode = Array.from(
						document.head.getElementsByTagName('meta')
					).filter(element => element.name == 'viewport')[0];

					if (viewPortMetaSiteNode)
					{
						this.viewPortMetaSiteNode = viewPortMetaSiteNode;
						document.head.removeChild(this.viewPortMetaSiteNode);
					}
					else
					{
						let contentWidth = document.body.offsetWidth;
						if (contentWidth < window.innerWidth)
						{
							contentWidth = window.innerWidth;
						}
						if (contentWidth < 1024)
						{
							contentWidth = 1024;
						}

						this.viewPortMetaSiteNode = document.createElement('meta');
						this.viewPortMetaSiteNode.setAttribute('name', 'viewport');
						this.viewPortMetaSiteNode.setAttribute('content', `width=${contentWidth}, initial-scale=1.0, user-scalable=1`);
					}

					if (!this.viewPortMetaWidgetNode)
					{
						this.viewPortMetaWidgetNode = document.createElement('meta');
						this.viewPortMetaWidgetNode.setAttribute('name', 'viewport');
						this.viewPortMetaWidgetNode.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=0');
						document.head.appendChild(this.viewPortMetaWidgetNode);
					}

					document.body.classList.add('bx-livechat-mobile-state');

					setTimeout(() => {
						this.$store.commit(WidgetStore.widgetData, {showed: true});
					}, 50);
				}
				else
				{
					this.$store.commit(WidgetStore.widgetData, {showed: true});
				}
			},
			onBeforeClose()
			{
				if(this.isMobile)
				{
					document.body.classList.remove('bx-livechat-mobile-state');

					if (this.viewPortMetaWidgetNode)
					{
						document.head.removeChild(this.viewPortMetaWidgetNode);
						this.viewPortMetaWidgetNode = null;
					}

					if (this.viewPortMetaSiteNode)
					{
						document.head.appendChild(this.viewPortMetaSiteNode);
						this.viewPortMetaSiteNode = null;
					}
					this.isMobile = false;
				}
			},
			onAfterClose: function () {
				this.$root.$bitrixController.close();
			},
			onWritesMessage: function (text)
			{
				this.$root.$bitrixController.writesMessage();
			},
			onTextareaFocus: function (event)
			{
				if (
					this.widgetData.copyright &&
					this.widgetData.deviceType == DeviceType.mobile
				)
				{
					this.widgetData.copyright = false;
				}
			},
			onTextareaBlur: function (event)
			{
				if (!this.widgetData.copyright && this.widgetData.copyright !== this.$root.$bitrixController.copyright)
				{
					this.widgetData.copyright = this.$root.$bitrixController.copyright;
					this.$nextTick(() => {
						this.$root.$emit('onMessengerDialogScrollToBottom', true);
					});
				}
			},
			onSendMessage: function (text, params)
			{
				params = params || {};
				params.focus = params.focus !== false;

				if (!this.dialogData.userConsent && this.widgetData.consentUrl)
				{
					if (text)
					{
						this.storedMessage = text;
					}
					this.showConsentWidow();

					return false;
				}

				text = text? text: this.storedMessage;
				if (!text)
				{
					return false;
				}

				this.$store.commit(WidgetStore.widgetData, {dialogStart:true});
				this.$root.$bitrixController.addMessage(text);

				if (params.focus)
				{
					this.$root.$emit('onMessengerTextareaFocus');
				}

				return true;
			},
			onShowConsent: function (element, done)
			{
				element.classList.add('bx-livechat-consent-window-show');
				done();
			},
			onHideConsent: function (element, done)
			{
				element.classList.remove('bx-livechat-consent-window-show');
				element.classList.add('bx-livechat-consent-window-close');
				setTimeout(function() {
					done();
				}, 400);
			},
			onKeyDown: function (event)
			{
				if (event.keyCode == 27)
				{
					if (this.widgetData.showForm != FormType.none)
					{
						this.$store.commit(WidgetStore.widgetData, {showForm: FormType.none});
					}
					else if (this.widgetData.showConsent)
					{
						this.disagreeConsentWidow();
					}
					else
					{
						this.close();
					}

					event.preventDefault();
					event.stopPropagation();
				}
			},
		},
		template: `
			<transition enter-active-class="bx-livechat-show" leave-active-class="bx-livechat-close" @after-leave="onAfterClose">
				<div :class="widgetClassName" v-if="widgetData.showed">
					<div class="bx-livechat-box">
						<template v-if="widgetMobileDisabled">
							<div class="bx-livechat-head" :style="customBackgroundStyle">
								<div class="bx-livechat-title">{{widgetData.configName || localize.BX_LIVECHAT_TITLE}}</div>
								<div class="bx-livechat-control-box">
									<button class="bx-livechat-control-btn bx-livechat-control-btn-close" :title="localize.BX_LIVECHAT_CLOSE_BUTTON" @click="close"></button>
								</div>
							</div>	
							<div class="bx-livechat-body" key="orientation-head">
								<div class="bx-livechat-mobile-orientation-box">
									<div class="bx-livechat-mobile-orientation-icon"></div>
									<div class="bx-livechat-mobile-orientation-text">{{localize.BX_LIVECHAT_MOBILE_ROTATE}}</div>
								</div>
							</div>
						</template>
						<template v-else-if="widgetData.error.active">
							<div class="bx-livechat-head" :style="customBackgroundStyle">
								<div class="bx-livechat-title">{{widgetData.configName || localize.BX_LIVECHAT_TITLE}}</div>
								<div class="bx-livechat-control-box">
									<button class="bx-livechat-control-btn bx-livechat-control-btn-close" :title="localize.BX_LIVECHAT_CLOSE_BUTTON" @click="close"></button>
								</div>
							</div>
							<div class="bx-livechat-body" key="error-body">
								<div class="bx-livechat-warning-window">
									<div class="bx-livechat-warning-icon"></div>
									<template v-if="widgetData.error.description"> 
										<div class="bx-livechat-help-title bx-livechat-help-title-sm bx-livechat-warning-msg" v-html="widgetData.error.description"></div>
									</template> 
									<template v-else>
										<div class="bx-livechat-help-title bx-livechat-help-title-md bx-livechat-warning-msg">{{localize.BX_LIVECHAT_ERROR_TITLE}}</div>
										<div class="bx-livechat-help-title bx-livechat-help-title-sm bx-livechat-warning-msg">{{localize.BX_LIVECHAT_ERROR_DESC}}</div>
									</template> 
								</div>
							</div>
						</template>
						<template v-else-if="!widgetData.configId">
							<div class="bx-livechat-head" :style="customBackgroundStyle">
								<div class="bx-livechat-title">{{widgetData.configName || localize.BX_LIVECHAT_TITLE}}</div>
								<div class="bx-livechat-control-box">
									<button class="bx-livechat-control-btn bx-livechat-control-btn-close" :title="localize.BX_LIVECHAT_CLOSE_BUTTON" @click="close"></button>
								</div>
							</div>
							<div class="bx-livechat-body" key="loading-body">
								<div class="bx-livechat-loading-window">
									<svg class="bx-livechat-loading-circular" viewBox="25 25 50 50">
										<circle class="bx-livechat-loading-path" cx="50" cy="50" r="20" fill="none" stroke-miterlimit="10"/>
										<circle class="bx-livechat-loading-inner-path" cx="50" cy="50" r="20" fill="none" stroke-miterlimit="10"/>
									</svg>
									<h3 class="bx-livechat-help-title bx-livechat-help-title-md bx-livechat-loading-msg">{{localize.BX_LIVECHAT_LOADING}}</h3>
								</div>
							</div>	
						</template>			
						<template v-else>
							<div class="bx-livechat-head" :style="customBackgroundStyle">
								<template v-if="!dialogData.operator.name">
									<div class="bx-livechat-title">{{widgetData.configName || localize.BX_LIVECHAT_TITLE}}</div>
								</template>
								<template v-else>
									<div class="bx-livechat-user bx-livechat-status-online">
										<template v-if="dialogData.operator.avatar">
											<div class="bx-livechat-user-icon" :style="'background-image: url('+encodeURI(dialogData.operator.avatar)+')'">
												<div v-if="dialogData.operator.online" class="bx-livechat-user-status" :style="customBackgroundOnlineStyle"></div>
											</div>
										</template>
										<template v-else>
											<div class="bx-livechat-user-icon">
												<div v-if="dialogData.operator.online" class="bx-livechat-user-status" :style="customBackgroundOnlineStyle"></div>
											</div>
										</template>
										<div class="bx-livechat-user-info">
											<div class="bx-livechat-user-name">{{dialogData.operator.name}}</div>
											<div class="bx-livechat-user-position">{{localize.BX_LIVECHAT_USER}}</div>
										</div>
									</div>
								</template>
								<div class="bx-livechat-control-box">
									<transition name="bx-livechat-animation-fade">
										<span class="bx-livechat-control-btn-active" v-if="widgetData.dialogStart && dialogData.sessionId">
											<button v-if="widgetData.voteEnable && (!dialogData.sessionClose || dialogData.sessionClose && dialogData.userVote == VoteType.none)" :class="'bx-livechat-control-btn bx-livechat-control-btn-like bx-livechat-dialog-vote-'+(dialogData.userVote)" :title="localize.BX_LIVECHAT_VOTE_BUTTON" @click="showLikeForm"></button>
											<button v-if="widgetData.voteEnable && dialogData.sessionClose && dialogData.userVote != VoteType.none" :class="'bx-livechat-control-btn bx-livechat-control-btn-like bx-livechat-dialog-vote-'+(dialogData.userVote)"></button>
											<button class="bx-livechat-control-btn bx-livechat-control-btn-mail" :title="localize.BX_LIVECHAT_MAIL_BUTTON" @click="showHistoryForm"></button>
										</span>
									</transition>	
									<button class="bx-livechat-control-btn bx-livechat-control-btn-close" :title="localize.BX_LIVECHAT_CLOSE_BUTTON" @click="close"></button>
								</div>
							</div>
							<template v-if="!widgetData.dialogStart">
								<div class="bx-livechat-body" key="empty-message">
									<div class="bx-livechat-help-container">
										<transition name="bx-livechat-animation-fade">
											<h2 v-if="widgetData.online" key="online" class="bx-livechat-help-title bx-livechat-help-title-lg">{{localize.BX_LIVECHAT_ONLINE_LINE_1}}<div class="bx-livechat-help-subtitle">{{localize.BX_LIVECHAT_ONLINE_LINE_2}}</div></h2>
											<h2 v-else key="offline" class="bx-livechat-help-title bx-livechat-help-title-sm">{{localize.BX_LIVECHAT_OFFLINE}}</h2>
										</transition>	
										<div class="bx-livechat-help-user">
											<template v-for="operator in widgetData.operators">
												<div class="bx-livechat-user" :key="operator.id">
													<template v-if="operator.avatar">
														<div class="bx-livechat-user-icon" :style="'background-image: url('+encodeURI(operator.avatar)+')'"></div>
													</template>
													<template v-else>
														<div class="bx-livechat-user-icon"></div>
													</template>	
													<div class="bx-livechat-user-info">
														<div class="bx-livechat-user-name">{{operator.name}}</div>
													</div>
												</div>
											</template>	
										</div>
									</div>
								</div>	
							</template>
							<template v-else-if="widgetData.dialogStart">
								<div class="bx-livechat-body" key="with-message">
									<template v-if="messagesData.length > 0">
										<div class="bx-livechat-dialog">
											<bx-messenger-dialog
												:currentUserId="userData.id" 
												:messages="messagesData"
											 />
										</div>	 
									</template>
									<template v-else>
										<div class="bx-livechat-loading-window">
											<svg class="bx-livechat-loading-circular" viewBox="25 25 50 50">
												<circle class="bx-livechat-loading-path" cx="50" cy="50" r="20" fill="none" stroke-miterlimit="10"/>
												<circle class="bx-livechat-loading-inner-path" cx="50" cy="50" r="20" fill="none" stroke-miterlimit="10"/>
											</svg>
											<h3 class="bx-livechat-help-title bx-livechat-help-title-md bx-livechat-loading-msg">{{localize.BX_LIVECHAT_LOADING}}</h3>
										</div>
									</template>
									<template v-if="widgetData.showForm == FormType.like && widgetData.voteEnable">
										<transition enter-active-class="bx-livechat-form-rate-show" leave-active-class="bx-livechat-form-rate-close">
											<div class="bx-livechat-alert-box bx-livechat-form-rate-show">
												<div class="bx-livechat-alert-close" @click="hideForm"></div>
												<div class="bx-livechat-alert-rate-box">
													<h4 class="bx-livechat-alert-title bx-livechat-alert-title-mdl">{{localize.BX_LIVECHAT_VOTE_TITLE}}</h4>
													<div class="bx-livechat-btn-box">
														<button class="bx-livechat-btn bx-livechat-btn-like" @click="userVote(VoteType.like)"></button>
														<button class="bx-livechat-btn bx-livechat-btn-dislike" @click="userVote(VoteType.dislike)"></button>
													</div>
												</div>
											</div>
										</transition>
									</template>
									<template v-else-if="widgetData.showForm == FormType.history">
										<transition enter-active-class="bx-livechat-consent-window-show" leave-active-class="bx-livechat-form-close">
											<div class="bx-livechat-alert-box bx-livechat-form-show">	
												<bx-livechat-form/>
											</div>	
										</transition>	
									</template>
								</div>
							</template>	
							<div class="bx-livechat-footer">
								<bx-messenger-textarea
									:writesEventLetter="3"
									:enableEdit="true"
									:enableCommand="false"
									:enableMention="false"
									:autoFocus="widgetData.deviceType !== DeviceType.mobile"
									:isMobile="widgetData.deviceType === DeviceType.mobile"
									:styles="{button: {backgroundColor: widgetData.styles.backgroundColor}}"
									@writes="onWritesMessage" 
									@send="onSendMessage" 
									@focus="onTextareaFocus" 
									@blur="onTextareaBlur" 
									@edit="logEvent('edit message', $event)"
								/>
							</div>	
							<transition @enter="onShowConsent" @leave="onHideConsent" :css="false">
								<template v-if="widgetData.showConsent && widgetData.consentUrl">
									<div class="bx-livechat-consent-window">
										<div class="bx-livechat-consent-window-title">{{localize.BX_LIVECHAT_CONSENT_TITLE}}</div>
										<div class="bx-livechat-consent-window-content">
											<iframe class="bx-livechat-consent-window-content-iframe" ref="consentIframe" frameborder="0" marginheight="0"  marginwidth="0" allowtransparency="allow-same-origin" seamless="true" :src="widgetData.consentUrl" @keydown="onConsentKeyDown"></iframe>
										</div>								
										<div class="bx-livechat-consent-window-btn-box">
											<button class="bx-livechat-btn bx-livechat-btn-success" ref="consentSuccess" @click="agreeConsentWidow" @keydown="onConsentKeyDown" v-focus="true">{{localize.BX_LIVECHAT_CONSENT_AGREE}}</button>
											<button class="bx-livechat-btn bx-livechat-btn-cancel" ref="consentCancel" @click="disagreeConsentWidow" @keydown="onConsentKeyDown">{{localize.BX_LIVECHAT_CONSENT_DISAGREE}}</button>
										</div>
									</div>
								</template>
							</transition>
							<template v-if="widgetData.copyright">
								<template v-if="widgetData.copyrightUrl">
									<a :href="widgetData.copyrightUrl" target="_blank" class="bx-livechat-copyright">
										<span class="bx-livechat-logo-name">{{localize.BX_LIVECHAT_COPYRIGHT_TEXT}}</span>
										<span class="bx-livechat-logo-icon"></span>
									</a>
								</template>
								<template v-else>
									<div class="bx-livechat-copyright">	
										<span class="bx-livechat-logo-name">{{localize.BX_LIVECHAT_COPYRIGHT_TEXT}}</span>
										<span class="bx-livechat-logo-icon"></span>
									</div>
								</template>
							</template>
						</template>
					</div>
				</div>
			</transition>
		`
	});

	Vue.component('bx-livechat-form', {
		computed:
		{
			FormType: () => FormType,
			localize: function(state)
			{
				let messages = {};

				let bitrixMessages = {};
				if (typeof this.$root.$bitrixMessages !== 'undefined')
				{
					bitrixMessages = this.$root.$bitrixMessages;
				}
				else if (typeof BX.message !== 'undefined')
				{
					bitrixMessages = BX.message;
				}

				for (let message in bitrixMessages)
				{
					if (!bitrixMessages.hasOwnProperty(message))
					{
						continue
					}
					if (!message.startsWith('BX_LIVECHAT_'))
					{
						continue;
					}
					messages[message] = bitrixMessages[message];
				}

				return Object.freeze(messages);
			},
			...Vuex.mapState({
				widgetData: state => state.widget.widgetData,
				userData: state => state.widget.userData,
				dialogData: state => state.widget.dialogData,
			})
		},
		methods: {
			hideForm: function (event)
			{
				this.$parent.hideForm();
			},
			showConsentWidow: function (event)
			{
				this.$parent.showConsentWidow();
			},
		},
		directives: {
			focus: {
				inserted: function(element, params)
				{
					if (params.value)
					{
						element.focus();
					}
				}
			}
		},
		template: `
			<div class="" key="form">
				<div class="bx-livechat-alert-close" @click="hideForm"></div>
				<div class="bx-livechat-alert-form-box">
					<h4 class="bx-livechat-alert-title bx-livechat-alert-title-sm">{{localize.BX_LIVECHAT_MAIL_TITLE}}</h4>
					<div class="bx-livechat-alert-form-row">
						<div class="bx-livechat-alert-form-input-box bx-livechat-alert-form-email">
							<input class="bx-livechat-alert-form-input" type="text" :placeholder="localize.BX_LIVECHAT_MAIL_FIELD_EMAIL">
						</div>
					</div>
					<template v-if="widgetData.consentUrl && !dialogData.userConsent">
						<div class="bx-livechat-alert-form-row">
							<label class="bx-livechat-alert-form-checkbox" for="checkbox">
								<input class="bx-livechat-alert-form-input" type="checkbox" checked>
								{{localize.BX_LIVECHAT_CONSENT_CHECKBOX_1}} <span class="bx-livechat-alert-link" @click="showConsentWidow">{{localize.BX_LIVECHAT_CONSENT_CHECKBOX_2}}</span>.
							</label>
						</div>
					</template>
					<div class="bx-livechat-btn-box">
						<button class="bx-livechat-btn bx-livechat-btn-success" @click="hideForm">{{localize.BX_LIVECHAT_MAIL_SEND}}</button>
					</div>
				</div>
			</div>
		`
	});

})(window);