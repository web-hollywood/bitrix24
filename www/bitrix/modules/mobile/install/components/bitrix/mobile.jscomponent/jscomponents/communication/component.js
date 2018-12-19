"use strict";

BX.listeners = {};

var REVISION = 2; // api revision - check module/pull/include.php

var CloseReasons = {
	CONFIG_REPLACED : 3000,
	CHANNEL_EXPIRED : 3001,
	SERVER_RESTARTED : 3002,
	CONFIG_EXPIRED : 3003,
	SERVER_DIE : 1001,
	CODE_1000 : 1000
};
var SystemCommands = {
	CHANNEL_EXPIRE : 0,
	CONFIG_EXPIRE : 1,
	SERVER_RESTART : 2
};
var WebsocketReadyState = {
	0 : 'CONNECTING',
	1 : 'OPEN',
	2 : 'CLOSING',
	3 : 'CLOSED',
};

var isSecure = currentDomain.indexOf('https') == 0;

var CONFIG = {
	USER_ID: BX.componentParameters.get('USER_ID', 0),
	SITE_ID: BX.componentParameters.get('SITE_ID', 's1'),
	LANGUAGE_ID: BX.componentParameters.get('LANGUAGE_ID', 'en'),
	PULL_CONFIG: BX.componentParameters.get('PULL_CONFIG', {}),
};

/**
 * Interface for delegate of connector
 * @constructor
 */
var WebSocketConnectorDelegate = function ()
{
};
WebSocketConnectorDelegate.prototype = {
	getPath : function ()
	{ /** must be overridden in children class **/
	},
	updateConfig : function ()
	{ /** must be overridden in children class **/
	},
	onError : function ()
	{ /** must be overridden in children class **/
	},
	onClose : function ()
	{ /** must be overridden in children class **/
	},
	onMessage : function ()
	{ /** must be overridden in children class **/
	},
	onOpen : function ()
	{ /** must be overridden in children class **/
	},
};

/**
 * Class for settings of connector
 * @param initParams
 * @constructor
 */
var WebSocketConnectorParams = function (initParams)
{
	this.debug = false;
	this.attemptCount = 3;
	this.attemptInterval = 2000;
	this.betweenAttemptsInterval = 20000;

	this.disconnectOnBackground = true;

	if (initParams)
	{
		for (let key in initParams)
		{
			if (initParams.hasOwnProperty(key) && WebSocketConnectorParams.prototype.hasOwnProperty(key))
			{
				if (typeof this[key] === typeof initParams[key])
				{
					this[key] = initParams[key];
				}
				else
				{
					console.warn("WebSocketConnectorParams",
						"Parameter '" + key + "' must be " + typeof this[key] + ". Default value will be using (" + this[key] + ")");
				}
			}
			else
			{
				console.warn("WebSocketConnectorParams", "Unknown parameter '" + key + "'");
			}
		}
	}
};

/**
 * @param {WebSocketConnectorDelegate} delegate
 * @param {WebSocketConnectorParams} params
 * @constructor
 */
var WebSocketConnector = function (delegate, params)
{
	this.params = params;
	this.connectAttempt = 0;
	this.debug = BX.componentParameters.get('PULL_DEBUG_SOURCE', false);
	this.connecting = false;
	this._socket = null;
	this.delegate = delegate;
	this.offline = false;

	Object.defineProperty(this, "socket", {
		set : (value) =>
		{
			if (this._socket && this._socket.readyState === 1)
			{
				this._socket.close(1000, "normal");
			}

			this._socket = value;
		},
		get : () => this._socket
	});

	BX.addCustomEvent("online", () => {
		this.offline = false;
		if(!Application.isBackground())
		{
			this.connect();
		}
	});
	BX.addCustomEvent("offline", () => {
		this.offline = true;
	});
	if (this.params.disconnectOnBackground)
	{
		BX.addCustomEvent("onAppActive", () =>
		{
			this.waitingConnectionAfterBackground = true;
			this.connect(true);
		});
		BX.addCustomEvent("onAppPaused", () => this.disconnect(1000, "App is in background"));
	}
};

WebSocketConnector.prototype = {
	connectAttempt : 0,
	state : 0,
	connectionTimeoutId : null,
	connectionTimeoutTime : 0,
	connect : function (force)
	{
		if (!force)
		{
			if (this.socket && this.socket.readyState === 1)
			{
				console.warn("WebSocketConnector.connect: " +
					"WebSocket is already connected. Use second argument to force reconnect");
				return;
			}

			if (this.connectionTimeoutId && this.connectionTimeoutTime+60000 > (new Date()).getTime())
			{
				console.warn("WebSocketConnector.connect:" +
					" Connection will be established soon, but not now. Use second argument to force connection.");
				return;
			}
		}

		clearTimeout(this.connectionTimeoutId);

		let connectTimeout = 0;
		switch (this.connectAttempt)
		{
			case 0:
			{
				this.connectAttempt++;
				break;
			}
			case (this.params.attemptCount):
			{
				this.connectAttempt = 0;
				connectTimeout = this.params.betweenAttemptsInterval;
				break;
			}
			default:
			{
				this.connectAttempt++;
				connectTimeout = this.params.attemptInterval;
				break;
			}
		}
		this.connectionTimeoutTime = (new Date()).getTime();
		this.connectionTimeoutId = setTimeout(() =>
		{
			this.connectionTimeoutId = null;
			this.connectionTimeoutTime = 0;

			this.createWebSocket()
		}, connectTimeout);
	},
	disconnect : function (code, message)
	{
		/**
		 * @var this.socket WebSocket
		 */
		if (this.socket !== null && this.socket.readyState === 1)
		{
			code = (code? code: 1000);
			this.socket.close(code, message);
		}
	},
	createWebSocket : function ()
	{
		let connectPath = this.delegate.getPath();
		if (connectPath)
		{
			this.socket = new WebSocket(connectPath);
			this.socket.onclose = this.onclose.bind(this);
			this.socket.onerror = this.onerror.bind(this);
			this.socket.onmessage = this.onmessage.bind(this);
			this.socket.onopen = this.onopen.bind(this);
		}
		else
		{
			this.delegate.updateConfig();
		}
	},
	onopen : function ()
	{
		this.state = "connected";
		this.connectAttempt = 0;
		console.info("WebSocket -> onopen");
		this.delegate.onOpen.apply(this.delegate, arguments);
	},
	onclose : function ()
	{
		console.info("WebSocket -> onclose", arguments);
		this.delegate.onClose.apply(this.delegate, [arguments[0], this.waitingConnectionAfterBackground]);
		this.waitingConnectionAfterBackground = false;
	},
	onerror : function ()
	{
		console.error("WebSocket -> onerror", arguments);
		this.delegate.onError.apply(this.delegate, [arguments[0], this.waitingConnectionAfterBackground]);
		this.waitingConnectionAfterBackground = false;
	},
	onmessage : function ()
	{
		console.log("WebSocket -> onmessage", this.debug? arguments: true);
		this.delegate.onMessage.apply(this.delegate, arguments);
	}
};

/**
 *
 * @param config
 * @constructor
 */
function Connection(config)
{
	this.config = {
		channels : {},
		server : {
			 timeShift: 0
		},
		debug: {
			log: BX.componentParameters.get('PULL_DEBUG', true),
			logFunction: BX.componentParameters.get('PULL_DEBUG_FUNCTION', false)
		},
		actual: false,
	};
	this.session = {
		mid : null,
		tag : null,
		time : null,
		lastId: 0,
		history: {},
		messageCount: 0
	};

	this.connector = new WebSocketConnector(this, new WebSocketConnectorParams());

	this.expireCheckInterval = 60000;
	this.expireCheckTimeoutId = null;
	this.watchTagsQueue = {};
	this.watchUpdateInterval = 1740000;
	this.watchForceUpdateInterval = 5000;
	this.configRequestAfterErrorInterval = 60000;

	BX.addCustomEvent("onPullExtendWatch", data => this.extendWatch(data.id, data.force));
	BX.addCustomEvent("onPullClearWatch", data => this.clearWatchTag(data.id));
	BX.addCustomEvent("onUpdateServerTime", this.updateTimeShift.bind(this));

	Object.defineProperty(this, "socket", {
		get : () => this.connector.socket
	});

	if (config)
	{
		this.setConfig(config);
	}
}

Connection.prototype = Object.create(WebSocketConnectorDelegate.prototype);
Connection.prototype.constructor = Connection;

/**
 * Configuration
 */

Connection.prototype.start = function ()
{
	this.connect();
	this.updateWatch();
	this.checkChannelExpire();
};
Connection.prototype.setConfig = function (config)
{
	let isUpdated = false;

	for (let type in config.channels)
	{
		if (config.channels.hasOwnProperty(type))
		{
			this.config.channels[type] = config.channels[type];
			CONFIG.PULL_CONFIG.channels[type] = config.channels[type];
			isUpdated = true;
		}
	}

	for (let configId in config.server)
	{
		if (config.server.hasOwnProperty(configId))
		{
			this.config.server[configId] = config.server[configId];
			CONFIG.PULL_CONFIG.server[configId] = config.server[configId];
			isUpdated = true;
		}
	}
	if (!isUpdated)
	{
		console.warn("Connection.setConfig: nothing to update\n", this.config);
		return false;
	}

	BX.componentParameters.set('PULL_CONFIG', this.config);

	console.info("Connection.setConfig: new config set\n", this.config);
	this.config.actual = true;

	if (
		typeof config.api != 'undefined'
		&& parseInt(config.api.revision_mobile) > REVISION
	)
	{
		console.warn('Connection.setConfig: reload scripts because revision up ('+REVISION+' -> '+config.api.revision_mobile+')');
		CONFIG.PULL_CONFIG.api.revision_mobile = config.api.revision_mobile;
		BX.componentParameters.set('PULL_CONFIG', CONFIG.PULL_CONFIG);

		reloadAllScripts();
		return false;
	}

	return true;
};
Connection.prototype.getChannel = function (type)
{
	return this.config.channels[type];
};
Connection.prototype.isChannelsExpired = function ()
{
	let result = false;
	for (let type in this.config.channels)
	{
		if (!this.config.channels.hasOwnProperty(type))
		{
			continue;
		}
		if (new Date(this.config.channels[type].end).getTime() <= new Date().getTime())
		{
			this.config.actual = false;
			console.info("Connection.isChannelsExpired: "+type+" channel was expired.");
			result = true;
			break;
		}
	}

	return result;
};
Connection.prototype.checkChannelExpire = function ()
{
	clearTimeout(this.expireCheckTimeoutId);
	this.expireCheckTimeoutId = setTimeout(this.checkChannelExpire.bind(this), this.expireCheckInterval);
	if (this.isChannelsExpired())
	{
		this.connector.disconnect(CloseReasons.CONFIG_EXPIRED, "channel was expired");
	}
};
Connection.prototype.configRequest = function ()
{
	let promise = new BX.Promise();
	BX.rest.callBatch({
		serverTime : ['server.time'],
		configGet : ['pull.config.get', {'CACHE': 'N'}],
	}, (result) => {
		// serverTime block
		if (result.serverTime && !result.serverTime.error())
		{
			this.config.server.timeShift = Math.floor((new Date().getTime() - new Date(result.serverTime.data()).getTime())/1000);
		}

		if (result.configGet.error())
		{
			promise.reject(result.configGet);
		}
		else if (result.configGet)
		{
			promise.fulfill(result.configGet)
		}
	});

	return promise;
};
Connection.prototype.updateConfig = function ()
{
	clearTimeout(this.updateConfigTimeout);
	let updateConfigPromise = new BX.Promise();

	console.info("Connection.updateConfig: request new config");

	this.configRequest()
		.catch((result) =>
		{
			let error = result.error();
			if (error.status == 0)
			{
				console.error("Connection.updateConfig: connection error, we will be check again soon", error.ex);
			}
			else
			{
				console.error("Connection.updateConfig: we have some problems with config, we will be check again soon\n", result.answer);
			}
			this.config.actual = false;
			this.updateConfigTimeout = setTimeout(() => {
				this.updateConfig();
			}, this.configRequestAfterErrorInterval);

			updateConfigPromise.reject(result.answer)
		})
		.then((result) =>
		{
			this.setConfig(result.data());
			this.connect(true);

			updateConfigPromise.fulfill(result.data());
		});

	return updateConfigPromise;
};
Connection.prototype.parseResponse = function (response)
{
	let dataArray = response.match(/#!NGINXNMS!#(.*?)#!NGINXNME!#/gm);
	if (dataArray === null)
	{
		return false;
	}

	let messages = [];
	for (let i = 0; i < dataArray.length; i++)
	{
		dataArray[i] = dataArray[i].substring(12, dataArray[i].length - 12);
		if (dataArray[i].length <= 0)
		{
			continue;
		}

		let data = BX.parseJSON(dataArray[i]);

		this.session.lastId = data.id;

		if (data.mid)
		{
			this.session.mid = data.mid;
		}
		if (data.tag)
		{
			this.session.tag = data.tag;
		}
		if (data.time)
		{
			this.session.time = data.time;
		}
		messages.push(data.text);

		if (!this.session.history[data.text.module_id])
		{
			this.session.history[data.text.module_id] = {};
		}
		if (!this.session.history[data.text.module_id][data.text.command])
		{
			this.session.history[data.text.module_id][data.text.command] = 0;
		}
		this.session.history[data.text.module_id][data.text.command]++;
		this.session.messageCount++;
	}
	try
	{
		this.broadcastMessages(messages);
	}
	catch(e)
	{
		BX.postWebEvent("onPullStatus", {status : "offline"});
		BX.postComponentEvent("onPullStatus", [{status : "offline"}]);
		let text = "Connection.parseResponse:\n" +
			"========= PULL ERROR ===========\n" +
			"Error type: broadcastMessages execute error\n" +
			"\n" +
			"Data array: " + JSON.stringify(messages) + "\n" +
			"Catch error: " + JSON.stringify(e) + "\n" +
			"================================\n\n";
		console.error(text);
	}
};
Connection.prototype.broadcastMessages = function (messages)
{
	if (this.config.debug.log)
	{
		console.log("Connection.broadcastMessages: receive "+(messages.length == 1? "message": "messages")+":");
		messages.forEach(function (message) {console.log(message);});
	}

	let messageRevision = false;

	messages.forEach(function (message)
	{
		let moduleId = message.module_id = message.module_id.toLowerCase();
		let command = message.command;

		message.extra.server_time_ago = (((new Date()).getTime()-(message.extra.server_time_unix*1000))/1000)-this.config.server.timeShift;
		message.extra.server_time_ago = message.extra.server_time_ago > 0? message.extra.server_time_ago: 0;

		if (moduleId === 'pull')
		{
			switch (SystemCommands[command.toUpperCase()])
			{
				case SystemCommands.CHANNEL_EXPIRE:
				{
					if (command == 'channel_expire' && message.params.action == 'reconnect')
					{
						this.config.channels[message.params.channel.type] = message.params.new_channel;
						console.info("Connection.broadcastMessages: new config for "+message.params.channel.type+" channel set:\n", this.config.channels[message.params.channel.type]);
						this.connector.disconnect(CloseReasons.CONFIG_REPLACED, "config was replaced");
					}
					else
					{
						this.connector.disconnect(CloseReasons.CHANNEL_EXPIRED, "channel expired");
					}
					break;
				}
				case SystemCommands.CONFIG_EXPIRE:
				{
					this.connector.disconnect(CloseReasons.CHANNEL_EXPIRED, "channel expired");
					break;
				}
				case SystemCommands.SERVER_RESTART:
				{
					this.connector.disconnect(CloseReasons.SERVER_RESTARTED, "server was restarted");
					break;
				}
				default://
			}
		}
		else if (moduleId === 'online')
		{
			BX.postComponentEvent('onPullOnlineEvent', [message.command, message.params, message.extra]);
			BX.postWebEvent('onPullOnline', {command : message.command, params : message.params, extra : message.extra}, true);
		}
		else
		{
			BX.postComponentEvent('onPullEvent-' + message.module_id, [message.command, message.params, message.extra]);

			BX.postWebEvent('onPull-' + message.module_id, {command : message.command, params : message.params, extra : message.extra}, true);
			BX.postWebEvent('onPull', {module_id : message.module_id, command : message.command, params : message.params, extra : message.extra}, true);

			if (this.config.debug.logFunction)
			{
				let text = "Connection.broadcastMessages: get commands for use in console\n"+
				"==== for native component ==\n"+
				'BX.postComponentEvent("onPullEvent-'+message.module_id+'", ["'+message.command+'", '+JSON.stringify(message.params)+', '+JSON.stringify(message.extra)+']);'+"\n"+
				"\n"+
				"==== for mobile browser ==\n"+
				'BX.postWebEvent("onPull-'+message.module_id+'", {command: "'+message.command+'", params: '+JSON.stringify(message.params)+', extra: '+JSON.stringify(message.extra)+']}, true);'+"\n"+
				'BX.postWebEvent("onPull", {module_id: "'+message.module_id+'", command: "'+message.command+'", params: '+JSON.stringify(message.params)+', extra: '+JSON.stringify(message.extra)+']}, true);';
				console.info(text);
			}
		}

		if (parseInt(message.extra.revision_mobile) > REVISION)
		{
			messageRevision = message.extra.revision_mobile;
		}
	}, this);

	if (messageRevision)
	{
		console.warn('Connection.broadcastMessages: reload scripts because revision up ('+REVISION+' -> '+messageRevision+')');
		CONFIG.PULL_CONFIG.api.revision_mobile = messageRevision;
		BX.componentParameters.set('PULL_CONFIG', CONFIG.PULL_CONFIG);

		reloadAllScripts();
		return false;
	}
};
Connection.prototype.extendWatch = function (tag, force)
{
	if (!tag || this.watchTagsQueue[tag])
	{
		return false;
	}
	console.info("Connection.extendWatch: add new tag", tag);
	this.watchTagsQueue[tag] = true;
	if (force)
	{
		this.updateWatch(force);
	}
};
Connection.prototype.updateWatch = function (force)
{
	clearTimeout(this.watchUpdateTimeout);
	this.watchUpdateTimeout = setTimeout(() =>
	{
		let watchTags = [];
		for(let tagId in this.watchTagsQueue)
		{
			if(this.watchTagsQueue.hasOwnProperty(tagId))
			{
				watchTags.push(tagId);
			}
		}
		if (watchTags.length > 0)
		{
			console.info("Connection.updateWatch: send request for extend", watchTags);
			BX.rest.callMethod('pull.watch.extend', {'TAGS': watchTags}).then((result) => {
				let updatedTags = result.data();
				console.info("Connection.updateWatch: extend tags result", updatedTags);
				for (let tagId in updatedTags)
				{
					if(updatedTags.hasOwnProperty(tagId) && !updatedTags[tagId])
					{
						this.clearWatchTag(tagId);
					}
				}
				this.updateWatch();
			}).catch(() => {
				this.updateWatch();
			})
		}
		else if (force)
		{
			console.info("Connection.updateWatch: nothing to update");
		}
	}, force? this.watchForceUpdateInterval: this.watchUpdateInterval);
};
Connection.prototype.clearWatchTag = function (tagId)
{
	delete this.watchTagsQueue[tagId];
};

Connection.prototype.updateTimeShift = function(serverTime)
{
	if (!serverTime)
		return false;

	let timeShift = Math.floor((new Date().getTime() - new Date(serverTime).getTime())/1000);
	if (this.config.server.timeShift != timeShift)
	{
		console.warn('Connection.updateServerTime: time shift is changed ('+this.config.server.timeShift+' -> '+timeShift+')');
		this.config.server.timeShift = timeShift;
	}

	return true;
};

/**
 * WebSocketConnectorDelegate methods
 */
Connection.prototype.onMessage = function (message)
{
	this.parseResponse(message.data);
};
Connection.prototype.onError = function (error, waitingRestore)
{
	if (error['HTTPResponseStatusCode'] == 400)
	{
		this.config.actual = false;
	}
	if (waitingRestore)
	{
		BX.postComponentEvent("failRestoreConnection");
	}

	this.connector.connect();
};
Connection.prototype.onClose = function (event, waitingRestore)
{
	let reason = event.reason;
	let code = event.code;

	switch (code)
	{
		case CloseReasons.CHANNEL_EXPIRED:
		case CloseReasons.CONFIG_EXPIRED:
		case CloseReasons.SERVER_RESTARTED:
		{
			this.updateConfig();
			break;
		}
		case CloseReasons.CONFIG_REPLACED:
		{
			this.connect();
			break;
		}
		case CloseReasons.SERVER_DIE:
		{
			this.updateConfig();
			break;
		}
		case CloseReasons.CODE_1000:
		{
			// mb offline or reload
			break;
		}
		default:
		{
			console.error('Connection.onClose: unexpected connection close (wait restore: '+(waitingRestore? 'Y': 'N')+')', event)
		}
	}
};
Connection.prototype.getPath = function ()
{
	if (!this.config.actual)
	{
		return '';
	}

	let path = isSecure? this.config.server.websocket_secure: this.config.server.websocket;
	if (!path)
	{
		return '';
	}

	let channels = [];
	for (let type in this.config.channels)
	{
		if (!this.config.channels.hasOwnProperty(type))
		{
			continue;
		}
		channels.push(this.config.channels[type].id);
	}

	path = path+'?CHANNEL_ID='+channels.join('/');

	if (this.session.mid)
	{
		path = path+"&mid=" + this.session.mid;
	}
	if (this.session.tag)
	{
		path = path+"&tag=" + this.session.tag;
	}
	if (this.session.time)
	{
		path = path+"&time=" + this.session.time;
	}

	return path;
};

/**
 * Connection methods
 */
Connection.prototype.connect = function (force)
{
	if (this.config.actual)
	{
		this.connector.connect(force);
	}
	else
	{
		this.updateConfig();
	}
};
Connection.prototype.disconnect = function (code, message)
{
	this.connector.disconnect(code, message)
};

/**
 * Debug methods
 */

Connection.prototype.getServerStatus = function ()
{
	console.info('Connection.getServerStatus: server is '+(this.config.server.server_enabled? 'enabled': 'disabled'));
};

Connection.prototype.capturePullEvent = function (status)
{
	if (typeof(status) == 'undefined')
	{
		status = !this.config.debug.log;
	}

	console.info('Connection.capturePullEvent: capture "Pull Event" '+(status? 'enabled': 'disabled'));
	this.config.debug.log = !!status;

	BX.componentParameters.set('PULL_DEBUG', this.config.debug.log);
};

Connection.prototype.capturePullEventSource = function (status)
{
	if (typeof(status) == 'undefined')
	{
		status = !this.connector.debug;
	}

	console.info('Connection.capturePullEventSource: capture "Pull Event Source" '+(status? 'enabled': 'disabled'));
	this.connector.debug = !!status;

	BX.componentParameters.set('PULL_DEBUG_SOURCE', this.connector.debug);
};

Connection.prototype.capturePullEventFunction = function (status)
{
	if (typeof(status) == 'undefined')
	{
		status = !this.config.debug.logFunction;
	}

	console.info('Connection.capturePullEventFunction: capture "Pull Event Function"  '+(status? 'enabled': 'disabled'));
	this.config.debug.logFunction = !!status;

	BX.componentParameters.set('PULL_DEBUG_FUNCTION', this.config.debug.logFunction);
};

Connection.prototype.getDebugInfo = function ()
{
	let watchTags = [];
	for(let tagId in this.watchTagsQueue)
	{
		if(this.watchTagsQueue.hasOwnProperty(tagId))
		{
			watchTags.push(tagId);
		}
	}

	let text = "Connection.getDebugInfo:\n" +
		"================================\n"+
		"Revision: "+(REVISION)+"\n"+
		"UserId: "+CONFIG.USER_ID+" "+(CONFIG.USER_ID>0?'': '(guest)')+"\n"+
		"Queue Server: "+(this.config.server.server_enabled? 'Y': 'N')+"\n"+
		"\n"+
		"WebSocket status: "+(this.connector.socket? WebsocketReadyState[this.connector.socket.readyState]: WebsocketReadyState[3])+"\n"+
		"WebSocket try number: "+(this.connector.connectAttempt)+"\n"+
		"WebSocket path: "+this.getPath()+"\n"+
		"\n"+
		"Config state: "+(this.config.actual? 'OK': 'WAITING UPDATE')+"\n"+
		"Last message: "+(this.session.lastId > 0? this.session.lastId: '-')+"\n"+
		"Time last connect: "+(this.session.time)+"\n"+
		"Session message count: "+(this.session.messageCount)+"\n"+
		"Current time shift: "+(this.config.server.timeShift)+"\n\n"+
		"== Config channels ==\n"+JSON.stringify(this.config.channels)+"\n\n"+
		"== Config server ==\n"+JSON.stringify(this.config.server)+"\n\n"+
		"== Session == \n"+JSON.stringify(this.session)+"\n\n"+
		"Watch tags: \n"+JSON.stringify(watchTags)+"\n"+
		"================================";
	console.info(text);
};

Connection.prototype.getSessionHistory = function ()
{
	let text = "Connection.getSessionHistory:\n" +
			"===================\n"+
			"Message received: "+this.session.messageCount+"\n"+
			"===================";

	for(let moduleId in this.session.history)
	{
		if (!this.session.history.hasOwnProperty(moduleId))
		{
			continue;
		}
		text = text + "\n" + moduleId + "\n";
		for(let commandName in this.session.history[moduleId])
		{
			if (!this.session.history[moduleId].hasOwnProperty(commandName))
			{
				continue;
			}
			text = text + ' | --- '+commandName+': '+this.session.history[moduleId][commandName]+"\n";
		}
	}

	text = text + "===================";
	console.info(text);
};

if (typeof SocketConnection == 'undefined')
{
	var SocketConnection = new Connection(CONFIG.PULL_CONFIG);
	SocketConnection.start();
}
else
{
	SocketConnection.disconnect(1000, "restart");
	setTimeout(() => {
		SocketConnection = new Connection(CONFIG.PULL_CONFIG);
		SocketConnection.start();
	}, 2000);
}



/**
 *  Mobile interface badges
 */

function AppCounters()
{
	this.total = 0;
	this.config = {};
	this.configAssociation = {
		'stream': 'socialnetwork_livefeed',
		'notifications': 'im_messenger',
		'messages': 'im_messenger',
		'openlines': 'im_messenger',
	};

	this.sharedStorage = Application.sharedStorage();

	let counters = this.sharedStorage.get('counters');
	this.counters = counters? JSON.parse(counters): {};

	let userCounters = this.sharedStorage.get('userCounters');
	this.userCounters = userCounters? JSON.parse(userCounters): {};

	let userCountersDates = this.sharedStorage.get('userCountersDates');
	this.userCountersDates = userCountersDates? JSON.parse(userCountersDates): {};

	BX.addCustomEvent("onSetUserCounters", this.onSetUserCounters.bind(this));
	BX.addCustomEvent("onClearLiveFeedCounter", this.onClearLiveFeedCounter.bind(this));
	BX.addCustomEvent("onUpdateBadges", this.onUpdateBadges.bind(this));
	BX.addCustomEvent("onUpdateConfig", this.onUpdateConfig.bind(this));
	BX.addCustomEvent("onPullEvent-main", this.onPull.bind(this));
	BX.addCustomEvent("requestUserCounters", this.requestUserCounters.bind(this));

	this.updateCountersInterval = 500;
	this.updateUserCountersInterval = 500;

	this.databaseMessenger = new ReactDatabase(ChatDatabaseName, CONFIG.USER_ID, CONFIG.LANGUAGE_ID, CONFIG.SITE_ID);

	this.loadFromCache();
}

AppCounters.prototype.onSetUserCounters = function(counters, time)
{
	let startTime = null;

	if (
		time
		&& typeof this.userCounters[CONFIG.SITE_ID] == 'object'
		&& typeof this.userCountersDates[CONFIG.SITE_ID] == 'object'
	)
	{
		startTime = time.start*1000;

		for (let counter in this.userCountersDates[CONFIG.SITE_ID])
		{
			if (!this.userCountersDates[CONFIG.SITE_ID].hasOwnProperty(counter))
			{
				continue;
			}
			if (typeof counters[CONFIG.SITE_ID][counter] == 'undefined')
			{
				if (this.userCountersDates[CONFIG.SITE_ID][counter] <= startTime)
				{
					delete this.userCounters[CONFIG.SITE_ID][counter];
					delete this.userCountersDates[CONFIG.SITE_ID][counter];
				}
			}
		}
	}

	this.onUpdateUserCounters(counters, startTime);
};

AppCounters.prototype.onClearLiveFeedCounter = function(params)
{
	let startTime = null;

	if (
		BX.type.isNotEmptyString(params.counterCode)
		&& typeof params.serverTimeUnix != 'undefined'
		&& typeof this.userCounters[CONFIG.SITE_ID] == 'object'
		&& typeof this.userCountersDates[CONFIG.SITE_ID] == 'object'
	)
	{
		startTime = params.serverTimeUnix * 1000;

		var counters = {};
		counters[CONFIG.SITE_ID] = {};
		counters[CONFIG.SITE_ID][params.counterCode] = 0;

		if (this.userCountersDates[CONFIG.SITE_ID][params.counterCode] <= startTime)
		{
			delete this.userCounters[CONFIG.SITE_ID][params.counterCode];
			delete this.userCountersDates[CONFIG.SITE_ID][params.counterCode];
		}

		this.onUpdateUserCounters(counters, startTime);
	}
};

AppCounters.prototype.onUpdateUserCounters = function(counters, startTime)
{
	let currentTime = (new Date()).getTime();
	startTime = startTime || currentTime;

	for (let site in counters)
	{
		if (!counters.hasOwnProperty(site))
		{
			continue;
		}

		for (let counter in counters[site])
		{
			if (!counters[site].hasOwnProperty(counter))
			{
				continue;
			}

			if (typeof this.userCountersDates[site] == 'undefined')
			{
				this.userCountersDates[site] = {};
			}
			if (typeof this.userCountersDates[site][counter] == 'undefined')
			{
				this.userCountersDates[site][counter] = currentTime;
			}

			if (this.userCountersDates[site][counter] >= startTime)
			{
				delete counters[site][counter];
			}
			else
			{
				this.userCountersDates[site][counter] = startTime;
			}
		}
	}

	this.userCounters = Utils.objectMerge(this.userCounters, counters);

	if (!counters[CONFIG.SITE_ID])
		return false;

	let needUpdate = false;
	if (counters[CONFIG.SITE_ID].hasOwnProperty('**'))
	{
		counters[CONFIG.SITE_ID]['**'] = parseInt(counters[CONFIG.SITE_ID]['**']);
		if (this.counters['stream'] != counters[CONFIG.SITE_ID]['**'])
		{
			this.counters['stream'] = counters[CONFIG.SITE_ID]['**'];
			needUpdate = true;
		}
	}

	if (needUpdate)
	{
		this.update(true);
	}
	else
	{
		this.updateCache();
	}

	BX.postComponentEvent("onUpdateUserCounters", [this.userCounters]);
	BX.postWebEvent("onUpdateUserCounters", this.userCounters);

	return true;
};

AppCounters.prototype.onPull = function(command, params, extra)
{
	if (command == 'user_counter')
	{
		this.onUpdateUserCounters(params, extra.server_time_unix*1000);
	}
};

AppCounters.prototype.requestUserCounters = function(params)
{
	console.info('Counters.requestUserCounters: ', params);

	if (params.component && params.component.toString().length > 0)
	{
		BX.postComponentEvent("onUpdateUserCounters", [this.userCounters], params.component);
	}
	if (params.web)
	{
		BX.postWebEvent("onUpdateUserCounters", this.userCounters);
	}
};

AppCounters.prototype.onUpdateBadges = function(params, delay)
{
	let needUpdate = false;
	for (let element in params)
	{
		if (!params.hasOwnProperty(element))
		{
			continue;
		}

		params[element] = parseInt(params[element]);
		if (this.counters[element] != params[element])
		{
			this.counters[element] = params[element];
			needUpdate = true;
		}
	}
	if (needUpdate)
	{
		this.update(delay === false);
	}
};

AppCounters.prototype.onUpdateConfig = function(config)
{
	this.config = config;
	this.update();
};


AppCounters.prototype.update = function(delay)
{
	if (delay)
	{
		if (!this.updateCountersTimeout)
		{
			this.updateCountersTimeout = setTimeout(this.update.bind(this), 1000);
		}
		return true;
	}
	clearTimeout(this.updateCountersTimeout);
	this.updateCountersTimeout = null;

	let total = 0;

	for (let element in this.counters)
	{
		if (!this.counters.hasOwnProperty(element))
		{
			continue;
		}

		this.counters[element] = parseInt(this.counters[element]);
		if (this.counters[element] <= 0)
		{
			this.counters[element] = 0;
		}

		if (this.checkConfigCounter(element))
		{
			total += this.counters[element];
		}
	}

	console.info("AppCounters.update: update counters: "+this.total+"\n", this.counters);
	Application.setBadges(this.counters);

	if (this.total != total)
	{
		this.total = total;
		if (!Application.isBackground())
		{
			Application.setIconBadge(this.total);
		}
	}

	this.updateCache();

	return true;
};

AppCounters.prototype.checkConfigCounter = function(counter)
{
	let configName = this.configAssociation[counter];
	if (!configName)
	{
		return true;
	}

	return this.config[configName] === true;
};

AppCounters.prototype.loadFromCache = function ()
{
	this.databaseMessenger.table(ChatTables.notifyConfig).then(table =>
	{
		table.get().then(items =>
		{
			if (items.length <= 0)
			{
				this.update();
				return false;
			}

			let cacheData = JSON.parse(items[0].VALUE);
			for (counterType of cacheData.counterTypes)
			{
				this.config[counterType.type] = counterType.value;
			}

			console.info('SettingsNotify.loadCache: config load from cache', cacheData.counterTypes);

			this.update();

		}).catch(() => {
			this.update();
		});
	});

	return true;
};

AppCounters.prototype.updateCache = function ()
{
	clearTimeout(this.refreshUserCounterTimeout);
	this.refreshUserCounterTimeout = setTimeout(() =>
	{
		this.sharedStorage.set('counters', JSON.stringify(this.counters));
		this.sharedStorage.set('userCounters', JSON.stringify(this.userCounters));
		this.sharedStorage.set('userCountersDates', JSON.stringify(this.userCountersDates));
		console.info("AppCounters.updateCache: userCounters updated");
	}, this.updateUserCountersInterval);

	return true;
};

var Counters = new AppCounters();


/**
 * Auth restore
 */

var Authorization =
{
	restore:() => Application.auth(
		result => {
			console.info(
			(!result || result.status != "success")
				?"Authorization.restore: fail!"
				:"Authorization.restore: success!"
			);
		}
	),
	start:function(){
		if(typeof Application.auth === "function")
		{
			console.info("Authorization.start: auth restore is active\n", this);
			this.intervalId = setInterval(this.restore, this.interval);
		}
	},
	interval:24 * 60 * 1000,
	intervalId:0,
};

Authorization.start();


/**
 *  Push notification registration
 */

setTimeout(() =>
{
	Cordova.exec(
		(deviceInfo) =>
		{
			this.device = deviceInfo;
			Application.registerPushNotifications(
				function (data)
				{

					var dt = (Application.getPlatform() === "ios"
							? "APPLE"
							: "GOOGLE/REV2"
					);

					var token = null;

					if (typeof data == "object")
					{
						if (data.voipToken)
						{
							token = data.voipToken;
							dt = "APPLE/VOIP"
						}
						else if (data.token)
						{
							token = data.token;
						}
					}
					else
					{
						token = data;
					}

					BX.ajax({
						url : "/mobile/",
						method : "POST",
						dataType : "json",
						tokenSaveRequest : true,
						data : {
							mobile_action : "save_device_token",
							device_name : (typeof device.name == "undefined"? device.model: device.name),
							uuid : device.uuid,
							device_token : token,
							device_type : dt,
							sessid : BX.bitrix_sessid()
						}
					})
						.then((data) => console.log(data))
						.catch((e) => console.error(e))
					;
				}
			);
		},
		() =>
		{
		}, "Device", "getDeviceInfo", []);
}, 0);

/**
 * Push handling
 */


var PushNotifications = {
	urlByTag: function(tag)
	{
		var link = (BX.message('MobileSiteDir') ? BX.message('MobileSiteDir') : '/');
		var result = false;
		var unique = false;
		var uniqueParams = {};

		var params = [];

		if (
			tag.substr(0, 10) == 'BLOG|POST|'
			|| tag.substr(0, 13) == 'BLOG|COMMENT|'
			|| tag.substr(0, 18) == 'BLOG|POST_MENTION|'
			|| tag.substr(0, 21) == 'BLOG|COMMENT_MENTION|'
			|| tag.substr(0, 11) == 'BLOG|SHARE|'
			|| tag.substr(0, 17) == 'BLOG|SHARE2USERS|'
		)
		{
			params = tag.split("|");
			result = link + "mobile/log/?ACTION=CONVERT&ENTITY_TYPE_ID=BLOG_POST&ENTITY_ID=" + params[2];
		}
		else if(
			tag.substr(0, 11) == 'TASKS|TASK|'
			|| tag.substr(0, 14) == 'TASKS|COMMENT|'
		)
		{
			params = tag.split("|");
			result = link + "mobile/tasks/snmrouter/?routePage=view&TASK_ID=" + params[2];
		}
		else if (tag.substr(0, 12) == 'SONET|EVENT|')
		{
			params = tag.split("|");
			result = link + "mobile/log/?ACTION=CONVERT&ENTITY_TYPE_ID=LOG_ENTRY&ENTITY_ID=" + params[2];
		}
		else if (tag.substr(0, 11) == 'DISK_GROUP|')
		{
			params = tag.split("|");
			result = link + "mobile/?mobile_action=disk_folder_list&type=group&path=/&entityId=" + params[1];
		}

		if (result)
		{
			result = {
				LINK: result,
				UNIQUE: unique,
				DATA: uniqueParams
			};
		}

		return result;
	},
	handler: function ()
	{
		let push = Application.getLastNotification();
		let pushParams = {};

		if (typeof (push) !== 'object' || typeof (push.params) === 'undefined')
		{
			pushParams =  {'ACTION' : 'NONE'};
		}
		if(typeof push.params != "undefined")
		{
			try
			{
				pushParams = JSON.parse(push.params);
			}
			catch (e)
			{
				pushParams = {'ACTION' : push.params};
			}

			if (this.actions.includes(pushParams.ACTION))
			{
				var data = this.urlByTag(pushParams.TAG);

				if (
					typeof (data.LINK) != 'undefined'
					&& data.LINK.length > 0
				)
				{
					PageManager.openPage({
						url : data.LINK,
						unique : data.UNIQUE,
						data: data.DATA,
					});
				}
			}
		}
	},
	actions: ["post", "tasks", "comment", "mention", "share", "share2users", "sonet_group_event"],
	init:function(){
		this.handler(); //handle first start of the app
		BX.addCustomEvent("onAppActive", ()=> this.handler()); //listen for the app wake up
	}
};

PushNotifications.init();

/**
 * User Profile
 */

BX.addCustomEvent("onUserProfileOpen", userId =>
{
	console.log("onUserProfileOpen", userId);
	if(Application.getApiVersion() >= 27)
	{
		PageManager.openComponent("JSStackComponent",
			{
				scriptPath:"/mobile/mobile_component/user.profile/?version=1",
				params: {"userId": userId},
				canOpenInDefault:true,
				rootWidget:{
					name: "list",
					groupStyle: true,
					settings:{objectName: "form", groupStyle: true,}
				}
			});
	}
	else
	{
		PageManager.openPage({url:"/mobile/users/?user_id="+userId});
	}
});


/* Utils API */
var Utils = {};

Utils.isObjectChanged = function(currentProperties, newProperties)
{
	for (let name in newProperties)
	{
		if(!newProperties.hasOwnProperty(name))
		{
			continue;
		}

		if (typeof currentProperties[name] == 'undefined')
		{
			return true;
		}

		if (BX.type.isPlainObject(newProperties[name]))
		{
			if (!BX.type.isPlainObject(currentProperties[name]))
			{
				return true;
			}

			if (this.isObjectChanged(currentProperties[name], newProperties[name]) === true)
			{
				return true;
			}
		}
		else if (currentProperties[name] !== newProperties[name])
		{
			return true;
		}
	}

	return false;
};

Utils.objectMerge = function(currentProperties, newProperties)
{
	for (let name in newProperties)
	{
		if(!newProperties.hasOwnProperty(name))
		{
			continue;
		}
		if (BX.type.isPlainObject(newProperties[name]))
		{
			if (!BX.type.isPlainObject(currentProperties[name]))
			{
				currentProperties[name] = {};
			}
			currentProperties[name] = this.objectMerge(currentProperties[name], newProperties[name]);
		}
		else
		{
			currentProperties[name] = newProperties[name];
		}
	}

	return currentProperties;
};

Utils.objectClone = function(properties)
{
	let newProperties = {};
	if (properties === null)
		return null;

	if (typeof properties == 'object')
	{
		if (BX.type.isArray(properties))
		{
			newProperties = [];
			for (let i=0, l=properties.length; i<l; i++)
			{
				if (typeof properties[i] == "object")
				{
					newProperties[i] = Utils.objectClone(properties[i]);
				}
				else
				{
					newProperties[i] = properties[i];
				}
			}
		}
		else
		{
			newProperties =  {};
			if (properties.constructor)
			{
				if (BX.type.isDate(properties))
				{
					newProperties = new Date(properties);
				}
				else
				{
					newProperties = new properties.constructor();
				}
			}

			for (let i in properties)
			{
				if (!properties.hasOwnProperty(i))
				{
					continue;
				}
				if (typeof properties[i] == "object")
				{
					newProperties[i] = Utils.objectClone(properties[i]);
				}
				else
				{
					newProperties[i] = properties[i];
				}
			}
		}
	}
	else
	{
		newProperties = properties;
	}

	return newProperties;
};









