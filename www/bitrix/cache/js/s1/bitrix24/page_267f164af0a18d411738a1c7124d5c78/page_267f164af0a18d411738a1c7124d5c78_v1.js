
; /* Start:"a:4:{s:4:"full";s:93:"/bitrix/components/bitrix/socialnetwork.admin.set/templates/.default/script.js?15441274532527";s:6:"source";s:78:"/bitrix/components/bitrix/socialnetwork.admin.set/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
var waitDiv = null;
var waitPopup = null;
var waitTimeout = null;
var waitTime = 500;

function __SASSetAdmin()
{
	__SASShowWait();
	BX.ajax({
		url: '/bitrix/components/bitrix/socialnetwork.admin.set/ajax.php',
		method: 'POST',
		dataType: 'json',
		data: {'ACTION': 'SET', 'sessid': BX.bitrix_sessid(), 'site': BX.util.urlencode(BX.message('SASSiteId'))},
		onsuccess: function(data) { __SASProcessAJAXResponse(data); }
	});
}

function __SASProcessAJAXResponse(data)
{
	if (data["SUCCESS"] != "undefined" && data["SUCCESS"] == "Y")
	{
		BX.reload();
		return false;
	}
	else if (data["ERROR"] != "undefined" && data["ERROR"].length > 0)
	{
		if (data["ERROR"].indexOf("SESSION_ERROR", 0) === 0)
		{
			__SASShowError(BX.message('SASErrorSessionWrong'));
			BX.reload();
		}
		else if (data["ERROR"].indexOf("CURRENT_USER_NOT_ADMIN", 0) === 0)
		{
			__SASShowError(BX.message('SASErrorNotAdmin'));
			return false;
		}
		else if (data["ERROR"].indexOf("CURRENT_USER_NOT_AUTH", 0) === 0)
		{
			__SASShowError(BX.message('SASErrorCurrentUserNotAuthorized'));
			return false;
		}
		else if (data["ERROR"].indexOf("SONET_MODULE_NOT_INSTALLED", 0) === 0)
		{
			__SASShowError(BX.message('SASErrorModuleNotInstalled'));
			return false;
		}
		else
		{
			__SASShowError(data["ERROR"]);
			return false;		
		}
	}
}
				
function __SASShowError(errorText) 
{
	__SASCloseWait();

	var errorPopup = new BX.PopupWindow('sas-error' + Math.random(), window, {
		autoHide: true,
		lightShadow: false,
		zIndex: 2,
		content: BX.create('DIV', {props: {'className': 'sonet-adminset-error-text-block'}, html: errorText}),
		closeByEsc: true,
		closeIcon: true
	});
	errorPopup.show();

}

function __SASShowWait(timeout)
{
	if (timeout !== 0)
	{
		return (waitTimeout = setTimeout(function(){
			__SASShowWait(0)
		}, 50));
	}

	if (!waitPopup)
	{
		waitPopup = new BX.PopupWindow('sas_wait', window, {
			autoHide: true,
			lightShadow: true,
			zIndex: 2,
			content: BX.create('DIV', {
				props: {
					className: 'sonet-adminset-wait-cont'
				},
				children: [
					BX.create('DIV', {
						props: {
							className: 'sonet-adminset-wait-icon'
						}
					}),
					BX.create('DIV', {
						props: {
							className: 'sonet-adminset-wait-text'
						},
						html: BX.message('SASWaitTitle')
					})
				]
			})
		});
	}
	else
		waitPopup.setBindElement(window);

	waitPopup.show();
}

function __SASCloseWait()
{
	if (waitTimeout)
	{
		clearTimeout(waitTimeout);
		waitTimeout = null;
	}

	if (waitPopup)
		waitPopup.close();
}
/* End */
;
; /* Start:"a:4:{s:4:"full";s:104:"/bitrix/components/bitrix/main.userconsent.request/templates/.default/user_consent.min.js?15441273847363";s:6:"source";s:85:"/bitrix/components/bitrix/main.userconsent.request/templates/.default/user_consent.js";s:3:"min";s:89:"/bitrix/components/bitrix/main.userconsent.request/templates/.default/user_consent.min.js";s:3:"map";s:89:"/bitrix/components/bitrix/main.userconsent.request/templates/.default/user_consent.map.js";}"*/
(function(){function t(t){this.caller=t.caller;this.formNode=t.formNode;this.controlNode=t.controlNode;this.inputNode=t.inputNode;this.config=t.config}t.prototype={};BX.UserConsent={msg:{title:"MAIN_USER_CONSENT_REQUEST_TITLE",btnAccept:"MAIN_USER_CONSENT_REQUEST_BTN_ACCEPT",btnReject:"MAIN_USER_CONSENT_REQUEST_BTN_REJECT",loading:"MAIN_USER_CONSENT_REQUEST_LOADING",errTextLoad:"MAIN_USER_CONSENT_REQUEST_ERR_TEXT_LOAD"},events:{save:"main-user-consent-request-save",refused:"main-user-consent-request-refused",accepted:"main-user-consent-request-accepted"},current:null,autoSave:false,isFormSubmitted:false,isConsentSaved:false,attributeControl:"data-bx-user-consent",load:function(t){var e=this.find(t)[0];if(!e){return null}this.bind(e);return e},loadAll:function(t,e){this.find(t,e).forEach(this.bind,this)},loadFromForms:function(){var t=document.getElementsByTagName("FORM");t=BX.convert.nodeListToArray(t);t.forEach(this.loadAll,this)},find:function(t){if(!t){return[]}var e=t.querySelectorAll("["+this.attributeControl+"]");e=BX.convert.nodeListToArray(e);return e.map(this.createItem.bind(this,t)).filter(function(t){return!!t})},bind:function(t){if(t.config.submitEventName){BX.addCustomEvent(t.config.submitEventName,this.onSubmit.bind(this,t))}else if(t.formNode){BX.bind(t.formNode,"submit",this.onSubmit.bind(this,t))}BX.bind(t.controlNode,"click",this.onClick.bind(this,t))},createItem:function(e,n){var i=n.querySelector('input[type="checkbox"]');if(!i){return}try{var s=JSON.parse(n.getAttribute(this.attributeControl));var o={formNode:null,controlNode:n,inputNode:i,config:s};if(e.tagName=="FORM"){o.formNode=e}else{o.formNode=BX.findParent(i,{tagName:"FORM"})}o.caller=this;return new t(o)}catch(r){return null}},onClick:function(t,e){this.requestForItem(t);e.preventDefault()},onSubmit:function(t,e){this.isFormSubmitted=true;if(this.check(t)){return true}else{if(e){e.preventDefault()}return false}},check:function(t){if(t.inputNode.checked){this.saveConsent(t);return true}this.requestForItem(t);return false},requestForItem:function(t){this.setCurrent(t);this.requestConsent(t.config.id,{sec:t.config.sec,replace:t.config.replace},this.onAccepted,this.onRefused)},setCurrent:function(t){this.current=t;this.autoSave=t.config.autoSave;this.actionRequestUrl=t.config.actionUrl},onAccepted:function(){if(!this.current){return}var t=this.current;this.saveConsent(this.current,function(){BX.onCustomEvent(t,this.events.accepted,[]);BX.onCustomEvent(this,this.events.accepted,[t]);this.isConsentSaved=true;if(this.isFormSubmitted&&t.formNode&&!t.config.submitEventName){BX.submit(t.formNode)}});this.current.inputNode.checked=true;this.current=null},onRefused:function(){BX.onCustomEvent(this.current,this.events.refused,[]);BX.onCustomEvent(this,this.events.refused,[this.current]);this.current.inputNode.checked=false;this.current=null;this.isFormSubmitted=false},initPopup:function(){if(this.popup){return}this.popup={}},popup:{isInit:false,caller:null,nodes:{container:null,shadow:null,head:null,loader:null,content:null,textarea:null,buttonAccept:null,buttonReject:null},onAccept:function(){this.hide();BX.onCustomEvent(this,"accept",[])},onReject:function(){this.hide();BX.onCustomEvent(this,"reject",[])},init:function(){if(this.isInit){return true}var t=document.querySelector("script[data-bx-template]");if(!t){return false}var e=document.createElement("DIV");e.innerHTML=t.innerHTML;e=e.children[0];if(!e){return false}document.body.insertBefore(e,document.body.children[0]);this.isInit=true;this.nodes.container=e;this.nodes.shadow=this.nodes.container.querySelector("[data-bx-shadow]");this.nodes.head=this.nodes.container.querySelector("[data-bx-head]");this.nodes.loader=this.nodes.container.querySelector("[data-bx-loader]");this.nodes.content=this.nodes.container.querySelector("[data-bx-content]");this.nodes.textarea=this.nodes.container.querySelector("[data-bx-textarea]");this.nodes.buttonAccept=this.nodes.container.querySelector("[data-bx-btn-accept]");this.nodes.buttonReject=this.nodes.container.querySelector("[data-bx-btn-reject]");this.nodes.buttonAccept.textContent=BX.message(this.caller.msg.btnAccept);this.nodes.buttonReject.textContent=BX.message(this.caller.msg.btnReject);BX.bind(this.nodes.buttonAccept,"click",this.onAccept.bind(this));BX.bind(this.nodes.buttonReject,"click",this.onReject.bind(this));return true},setTitle:function(t){if(!this.nodes.head){return}this.nodes.head.textContent=t},setContent:function(t){if(!this.nodes.textarea){return}this.nodes.textarea.textContent=t},show:function(t){if(typeof t=="boolean"){this.nodes.loader.style.display=!t?"":"none";this.nodes.content.style.display=t?"":"none"}this.nodes.container.style.display=""},hide:function(){this.nodes.container.style.display="none"}},cache:{list:[],stringifyKey:function(t){return BX.type.isString(t)?t:JSON.stringify({key:t})},set:function(t,e){var n=this.get(t);if(n){n.data=e}else{this.list.push({key:this.stringifyKey(t),data:e})}},getData:function(t){var e=this.get(t);return e?e.data:null},get:function(t){t=this.stringifyKey(t);var e=this.list.filter(function(e){return e.key==t});return e.length>0?e[0]:null},has:function(t){return!!this.get(t)}},requestConsent:function(t,e,n,i){e=e||{};e.id=t;var s=this.cache.stringifyKey(e);if(!this.popup.isInit){this.popup.caller=this;if(!this.popup.init()){return}BX.addCustomEvent(this.popup,"accept",n.bind(this));BX.addCustomEvent(this.popup,"reject",i.bind(this))}if(this.current&&this.current.config.text){this.cache.set(s,this.current.config.text)}if(this.cache.has(s)){this.setTextToPopup(this.cache.getData(s))}else{this.popup.setTitle(BX.message(this.msg.loading));this.popup.show(false);this.sendActionRequest("getText",e,function(t){this.cache.set(s,t.text||"");this.setTextToPopup(this.cache.getData(s))},function(){this.popup.hide();alert(BX.message(this.msg.errTextLoad))})}},setTextToPopup:function(t){var e="";var n=t.indexOf("\n");var i=t.indexOf(".");n=n<i?n:i;if(n>=0&&n<=100){e=t.substr(0,n).trim();e=e.split(".").map(Function.prototype.call,String.prototype.trim).filter(String)[0]}this.popup.setTitle(e?e:BX.message(this.msg.title));this.popup.setContent(t);this.popup.show(true)},saveConsent:function(t,e){this.setCurrent(t);var n={id:t.config.id,sec:t.config.sec,url:window.location.href};if(t.config.originId){var i=t.config.originId;if(t.formNode&&i.indexOf("%")>=0){var s=t.formNode.querySelectorAll('input[type="text"], input[type="hidden"]');s=BX.convert.nodeListToArray(s);s.forEach(function(t){if(!t.name){return}i=i.replace("%"+t.name+"%",t.value?t.value:"")})}n.originId=i}if(t.config.originatorId){n.originatorId=t.config.originatorId}BX.onCustomEvent(t,this.events.save,[n]);BX.onCustomEvent(this,this.events.save,[t,n]);if(this.isConsentSaved||!t.config.autoSave){if(e){e.apply(this,[])}}else{this.sendActionRequest("saveConsent",n,e,e)}},sendActionRequest:function(t,e,n,i){n=n||null;i=i||null;e.action=t;e.sessid=BX.bitrix_sessid();e.action=t;BX.ajax({url:this.actionRequestUrl,method:"POST",data:e,timeout:10,dataType:"json",processData:true,onsuccess:BX.proxy(function(t){t=t||{};if(t.error){i.apply(this,[t])}else if(n){n.apply(this,[t])}},this),onfailure:BX.proxy(function(){var t={error:true,text:""};if(i){i.apply(this,[t])}},this)})}};BX.ready(function(){BX.UserConsent.loadFromForms()})})();
/* End */
;; /* /bitrix/components/bitrix/socialnetwork.admin.set/templates/.default/script.js?15441274532527*/
; /* /bitrix/components/bitrix/main.userconsent.request/templates/.default/user_consent.min.js?15441273847363*/

//# sourceMappingURL=page_267f164af0a18d411738a1c7124d5c78.map.js