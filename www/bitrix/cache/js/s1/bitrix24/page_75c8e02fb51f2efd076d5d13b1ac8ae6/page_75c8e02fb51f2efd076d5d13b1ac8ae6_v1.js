
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
; /* Start:"a:4:{s:4:"full";s:102:"/bitrix/templates/bitrix24/components/bitrix/socialnetwork.group/.default/script.min.js?15441276457606";s:6:"source";s:83:"/bitrix/templates/bitrix24/components/bitrix/socialnetwork.group/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function(){"use strict";BX.namespace("BX.Bitrix24");if(window["B24SGControl"]){return}window.B24SGControl=function(){this.instance=null;this.groupId=null;this.groupOpened=false;this.waitPopup=null;this.waitTimeout=null;this.notifyHintPopup=null;this.notifyHintTimeout=null;this.notifyHintTime=3e3;this.favoritesValue=null;this.newValue=null};window.B24SGControl.getInstance=function(){if(window.B24SGControl.instance==null){window.B24SGControl.instance=new B24SGControl}return window.B24SGControl.instance};window.B24SGControl.prototype={init:function(e){if(typeof e=="undefined"||typeof e.groupId=="undefined"||parseInt(e.groupId)<=0){return}this.groupId=parseInt(e.groupId);this.favoritesValue=!!e.favoritesValue;this.groupOpened=!!e.groupOpened;if(BX("bx-group-join-submit")){BX.bind(BX("bx-group-join-submit"),"click",BX.delegate(this.sendJoinRequest,this))}BX.addCustomEvent("BX.Bitrix24.LeftMenuClass:onMenuItemAdded",BX.delegate(function(){this.favoritesValue=true},this));BX.addCustomEvent("BX.Bitrix24.LeftMenuClass:onMenuItemDeleted",BX.delegate(function(){this.favoritesValue=false},this));BX.addCustomEvent("SidePanel.Slider:onMessage",BX.delegate(function(e){if(e.getEventId()=="sonetGroupEvent"){var t=e.getData();if(t.code=="afterSetFavorites"&&typeof t.data!="undefined"&&parseInt(t.data.groupId)>0&&parseInt(t.data.groupId)==this.groupId&&typeof t.data.value!="undefined"){this.favoritesValue=!!t.data.value}if(t.code=="afterSetSubscribe"&&typeof t.data!="undefined"&&parseInt(t.data.groupId)>0&&parseInt(t.data.groupId)==this.groupId&&typeof t.data.value!="undefined"){this.setNotifyButton(t.data.value,false)}if(e.slider===top.BX.SidePanel.Instance.getSliderByWindow(window)&&BX("socialnetwork-group-sidebar-block")&&BX.util.in_array(t.code,["afterModeratorAdd","afterModeratorRemove","afterOwnerSet","afterUserExclude"])&&typeof t.data!="undefined"&&parseInt(t.data.groupId)>0&&parseInt(t.data.groupId)==this.groupId){BX.SocialnetworkUICommon.reloadBlock({blockId:"socialnetwork-group-sidebar-block"})}}},this))},setSubscribe:function(e){var t=this;t.showWait();var o=!BX.hasClass(BX("group_menu_subscribe_button"),"webform-button-active")?"set":"unset";BX.ajax({url:"/bitrix/components/bitrix/socialnetwork.group_menu/ajax.php",method:"POST",dataType:"json",data:{groupID:t.groupId,action:o=="set"?"set":"unset",sessid:BX.bitrix_sessid()},onsuccess:function(e){t.processSubscribeAJAXResponse(e)}});BX.PreventDefault(e)},sendJoinRequest:function(e){BX.SocialnetworkUICommon.hideError(BX("bx-group-join-error"));BX.SocialnetworkUICommon.showButtonWait(BX("bx-group-join-submit"));BX.ajax({url:BX("bx-group-join-submit").getAttribute("bx-request-url"),method:"POST",dataType:"json",data:{groupID:this.groupId,MESSAGE:BX("bx-group-join-message")?BX("bx-group-join-message").value:"",ajax_request:"Y",save:"Y",sessid:BX.bitrix_sessid()},onsuccess:BX.delegate(function(e){BX.SocialnetworkUICommon.hideButtonWait(BX("bx-group-join-submit"));if(typeof e.MESSAGE!="undefined"&&e.MESSAGE=="SUCCESS"&&typeof e.URL!="undefined"){BX.addClass(BX("bx-group-join-form"),"sonet-group-user-request-form-invisible");BX.onCustomEvent(window.top,"sonetGroupEvent",[{code:"afterJoinRequestSend",data:{groupId:this.groupId}}]);top.location.href=e.URL}else if(typeof e.MESSAGE!="undefined"&&e.MESSAGE=="ERROR"&&typeof e.ERROR_MESSAGE!="undefined"&&e.ERROR_MESSAGE.length>0){BX.SocialnetworkUICommon.showError(e.ERROR_MESSAGE,BX("bx-group-join-error"))}},this),onfailure:BX.delegate(function(){BX.SocialnetworkUICommon.showError(BX.message("SONET_C6_T_AJAX_ERROR"),BX("bx-group-join-error"));BX.SocialnetworkUICommon.hideButtonWait(BX("bx-group-join-submit"))},this)})},setFavorites:function(e){var t=this;t.showWait();t.newValue=!t.favoritesValue;BX.ajax({url:"/bitrix/components/bitrix/socialnetwork.group_menu/ajax.php",method:"POST",dataType:"json",data:{groupID:t.groupId,action:t.favoritesValue?"fav_unset":"fav_set",sessid:BX.bitrix_sessid(),lang:BX.message("LANGUAGE_ID")},onsuccess:function(e){t.processFavoritesAJAXResponse(e);if(typeof e.NAME!="undefined"&&typeof e.URL!="undefined"){BX.onCustomEvent(window,"BX.Socialnetwork.WorkgroupFavorites:onSet",[{id:t.groupId,name:e.NAME,url:e.URL,extranet:typeof e.EXTRANET!="undefined"?e.EXTRANET:"N"},t.newValue])}},onfailure:function(e){}});BX.PreventDefault(e)},setNotifyButton:function(e,t){t=!!t;var o=BX("group_menu_subscribe_button",true);if(o){if(e){if(t){this.showNotifyHint(o,BX.message("SGMSubscribeButtonHintOn"))}BX.adjust(o,{attrs:{title:BX.message("SGMSubscribeButtonTitleOn")}});BX.addClass(o,"webform-button-active")}else{if(t){this.showNotifyHint(o,BX.message("SGMSubscribeButtonHintOff"))}BX.adjust(o,{attrs:{title:BX.message("SGMSubscribeButtonTitleOff")}});BX.removeClass(o,"webform-button-active")}}},processSubscribeAJAXResponse:function(e){var t=this;if(typeof e.SUCCESS!="undefined"&&e.SUCCESS=="Y"){t.closeWait();var o=BX("group_menu_subscribe_button");if(o){BX.delegate(function(){this.setNotifyButton(typeof e.RESULT=="undefined"||e.RESULT!="N",true)},t)()}return false}else if(BX.type.isNotEmptyString(e.ERROR)){t.processAJAXError(e["ERROR"]);return false}},processFavoritesAJAXResponse:function(e){var t=this;t.closeWait();if(typeof e["SUCCESS"]!="undefined"&&e["SUCCESS"]=="Y"){t.favoritesValue=t.newValue}else if(typeof e["ERROR"]!="undefined"&&e["ERROR"].length>0){t.processAJAXError(e["ERROR"])}return false},processAJAXError:function(e){var t=this;if(e.indexOf("SESSION_ERROR",0)===0){t.showErrorPopup(BX.message("SGMErrorSessionWrong"));return false}else if(e.indexOf("CURRENT_USER_NOT_AUTH",0)===0){t.showErrorPopup(BX.message("SGMErrorCurrentUserNotAuthorized"));return false}else if(e.indexOf("SONET_MODULE_NOT_INSTALLED",0)===0){t.showErrorPopup(BX.message("SGMErrorModuleNotInstalled"));return false}else{t.showErrorPopup(e);return false}},showWait:function(e){var t=this;if(e!==0){return t.waitTimeout=setTimeout(function(){t.showWait(0)},300)}if(!t.waitPopup){t.waitPopup=new BX.PopupWindow("sgm_wait",window,{autoHide:true,lightShadow:true,zIndex:2,content:BX.create("DIV",{props:{className:"sonet-sgm-wait-cont"},children:[BX.create("DIV",{props:{className:"sonet-sgm-wait-icon"}}),BX.create("DIV",{props:{className:"sonet-sgm-wait-text"},html:BX.message("SGMWaitTitle")})]})})}else{t.waitPopup.setBindElement(window)}t.waitPopup.show()},closeWait:function(){if(this.waitTimeout){clearTimeout(this.waitTimeout);this.waitTimeout=null}if(this.waitPopup){this.waitPopup.close()}},showNotifyHint:function(e,t){var o=this;if(o.notifyHintTimeout){clearTimeout(o.notifyHintTimeout);o.notifyHintTimeout=null}if(o.notifyHintPopup==null){o.notifyHintPopup=new BX.PopupWindow("sgm_notify_hint",e,{autoHide:true,lightShadow:true,zIndex:2,content:BX.create("DIV",{props:{className:"sonet-sgm-notify-hint-content"},style:{display:"none"},children:[BX.create("SPAN",{props:{id:"sgm_notify_hint_text"},html:t})]}),closeByEsc:true,closeIcon:false,offsetLeft:19,offsetTop:2});o.notifyHintPopup.TEXT=BX("sgm_notify_hint_text");o.notifyHintPopup.setBindElement(e)}else{o.notifyHintPopup.TEXT.innerHTML=t;o.notifyHintPopup.setBindElement(e)}o.notifyHintPopup.setAngle({});o.notifyHintPopup.show();o.notifyHintTimeout=setTimeout(function(){o.notifyHintPopup.close()},o.notifyHintTime)},showErrorPopup:function(e){this.closeWait();var t=new BX.PopupWindow("sgm-error"+Math.random(),window,{autoHide:true,lightShadow:false,zIndex:2,content:BX.create("DIV",{props:{className:"sonet-sgm-error-text-block"},html:e}),closeByEsc:true,closeIcon:true});t.show()}};window.BX.SGMSetSubscribe=window.B24SGControl.getInstance().setSubscribe})();
/* End */
;; /* /bitrix/components/bitrix/socialnetwork.admin.set/templates/.default/script.js?15441274532527*/
; /* /bitrix/templates/bitrix24/components/bitrix/socialnetwork.group/.default/script.min.js?15441276457606*/