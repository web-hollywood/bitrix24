
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
; /* Start:"a:4:{s:4:"full";s:109:"/bitrix/templates/bitrix24/components/bitrix/socialnetwork.user_profile/.default/script.min.js?15441276456752";s:6:"source";s:90:"/bitrix/templates/bitrix24/components/bitrix/socialnetwork.user_profile/.default/script.js";s:3:"min";s:94:"/bitrix/templates/bitrix24/components/bitrix/socialnetwork.user_profile/.default/script.min.js";s:3:"map";s:94:"/bitrix/templates/bitrix24/components/bitrix/socialnetwork.user_profile/.default/script.map.js";}"*/
BX.namespace("BX.Socialnetwork.User");BX.Socialnetwork.User.Profile=function(){var t=function(t){this.ajaxPath="";this.siteId="";this.languageId="";this.otpDays={};this.showOtpPopup=false;this.otpRecoveryCodes=false;this.profileUrl="";this.passwordsUrl="";this.popupHint={};if(typeof t==="object"){this.ajaxPath=t.ajaxPath;this.siteId=t.siteId;this.languageId=t.languageId;this.otpDays=t.otpDays;this.showOtpPopup=t.showOtpPopup=="Y"?true:false;this.otpRecoveryCodes=t.otpRecoveryCodes=="Y"?true:false;this.profileUrl=t.profileUrl;this.passwordsUrl=t.passwordsUrl;this.codesUrl=t.codesUrl}this.init()};t.prototype.init=function(){if(this.showOtpPopup){var t=[];if(this.otpRecoveryCodes){t.push(new BX.PopupWindowButton({text:BX.message("SONET_OTP_CODES"),className:"popup-window-button-accept",events:{click:BX.proxy(function(){location.href=this.codesUrl},this)}}))}t.push(new BX.PopupWindowButton({text:BX.message("SONET_OTP_SUCCESS_POPUP_PASSWORDS"),className:"popup-window-button-accept",events:{click:BX.proxy(function(){location.href=this.passwordsUrl},this)}}),new BX.PopupWindowButtonLink({text:BX.message("SONET_OTP_SUCCESS_POPUP_CLOSE"),className:"popup-window-button-link-cancel",events:{click:BX.proxy(function(){location.href=this.profileUrl},this)}}));BX.PopupWindowManager.create("securityOtpSuccessPopup",null,{autoHide:false,offsetLeft:0,offsetTop:0,overlay:true,draggable:{restrict:true},closeByEsc:false,content:'<div style="width:450px;min-height:100px; padding:15px;font-size:14px;">'+BX.message("SONET_OTP_SUCCESS_POPUP_TEXT")+(this.otpRecoveryCodes?BX.message("SONET_OTP_SUCCESS_POPUP_TEXT_RES_CODE"):"")+'<div style="background-color: #fdfaea;padding: 10px;border-color: #e5e0c4 #f1edd7 #f9f6e4;border-style: solid;border-width: 1px;border-radius: 2px;">'+BX.message("SONET_OTP_SUCCESS_POPUP_TEXT2")+"</div></div>",buttons:t}).show()}BX.ready(BX.delegate(function(){this.initHint("user-profile-email-help")},this))};t.prototype.confirm=function(){if(confirm(BX.message("USER_PROFILE_CONFIRM")))return true;else return false};t.prototype.changeUserActivity=function(t,e){if(!this.confirm())return false;if(!parseInt(t)||!e)return false;BX.ajax.post(this.ajaxPath,{user_id:t,active:e,sessid:BX.bitrix_sessid(),site_id:this.siteId},function(t){if(parseInt(t)){window.location.reload()}else{var e=BX.PopupWindowManager.create("delete_error",this,{content:"<p>"+BX("SONET_ERROR_DELETE")+"</p>",offsetLeft:27,offsetTop:7,autoHide:true});e.show()}})};t.prototype.showExtranet2IntranetForm=function(t,e){var e=e?true:false;window.Bitrix24Extranet2IntranetForm=BX.PopupWindowManager.create("BXExtranet2Intranet",null,{autoHide:false,zIndex:0,offsetLeft:0,offsetTop:0,overlay:true,draggable:{restrict:true},closeByEsc:true,titleBar:BX.message(e?"BX24_TITLE_EMAIL":"BX24_TITLE"),closeIcon:{right:"12px",top:"10px"},buttons:[new BX.PopupWindowButton({text:BX.message("BX24_BUTTON"),className:"popup-window-button-accept",events:{click:function(){var t=this;var e=BX("EXTRANET2INTRANET_FORM");if(e)BX.ajax.submit(e,BX.delegate(function(e){t.popupWindow.setContent(e)}))}}}),new BX.PopupWindowButtonLink({text:BX.message("BX24_CLOSE_BUTTON"),className:"popup-window-button-link-cancel",events:{click:function(){this.popupWindow.close()}}})],content:'<div style="width:450px;height:230px"></div>',events:{onAfterPopupShow:function(){this.setContent('<div style="width:450px;height:230px">'+BX.message("BX24_LOADING")+"</div>");BX.ajax.post("/bitrix/tools/b24_extranet2intranet.php",{lang:BX.message("LANGUAGE_ID"),site_id:BX.message("SITE_ID")||"",USER_ID:t,IS_EMAIL:e?"Y":"N"},BX.delegate(function(t){this.setContent(t)},this))}}});Bitrix24Extranet2IntranetForm.show()};t.prototype.reinvite=function(t,e,o){if(!parseInt(t))return false;o=o||null;var i="reinvite_user_id_"+(e=="Y"?"extranet_":"")+t;BX.ajax.post("/bitrix/tools/intranet_invite_dialog.php",{lang:this.languageId,site_id:this.siteId,reinvite:i,sessid:BX.bitrix_sessid()},BX.delegate(function(t){var e=BX.PopupWindowManager.create("invite_access",o,{content:"<p>"+BX.message("SONET_REINVITE_ACCESS")+"</p>",offsetLeft:27,offsetTop:7,autoHide:true});e.show()},this))};t.prototype.deactivateUserOtp=function(t,e){if(!parseInt(t))return false;BX.ajax({method:"POST",dataType:"json",url:this.ajaxPath,data:{userId:t,sessid:BX.bitrix_sessid(),numDays:e,action:"deactivate"},onsuccess:function(t){if(t.error){}else{location.reload()}}})};t.prototype.deferUserOtp=function(t,e){if(!parseInt(t))return false;BX.ajax({method:"POST",dataType:"json",url:this.ajaxPath,data:{userId:t,sessid:BX.bitrix_sessid(),numDays:e,action:"defer"},onsuccess:function(t){if(t.error){}else{location.reload()}}})};t.prototype.activateUserOtp=function(t){if(!parseInt(t))return false;BX.ajax({method:"POST",dataType:"json",url:this.ajaxPath,data:{userId:t,sessid:BX.bitrix_sessid(),action:"activate"},onsuccess:function(t){if(t.error){}else{location.reload()}}})};t.prototype.showOtpDaysPopup=function(t,e,o){if(!parseInt(e))return false;o=o=="defer"?"defer":"deactivate";var i=this;var s=[];for(var n in this.otpDays){s.push({text:this.otpDays[n],numDays:n,onclick:function(t,s){this.popupWindow.close();if(o=="deactivate")i.deactivateUserOtp(e,s.numDays);else i.deferUserOtp(e,s.numDays)}})}BX.PopupMenu.show("securityOtpDaysPopup",t,s,{offsetTop:10,offsetLeft:0})};t.prototype.showLink=function(t){var e=t.parentNode;var o=e.querySelector("[data-input]");var i=e.querySelector("[data-link]");var s,n;o.style.width="auto";BX.addClass(e,"user-profile-show-input");s=o.offsetWidth;n=i.offsetWidth;t.style.display="none";setTimeout(function(){i.style.display="none";o.style.width=n+"px"},50);setTimeout(function(){o.style.opacity=1;o.style.width=s+"px"},100);BX.bind(o,"transitionend",function(){o.select()})};t.prototype.initHint=function(t){var e=BX(t);if(e){e.setAttribute("data-id",e);BX.bind(e,"mouseover",BX.proxy(function(){var t=BX.proxy_context.getAttribute("data-id");var e=BX.proxy_context.getAttribute("data-text");this.showHint(t,BX.proxy_context,e)},this));BX.bind(e,"mouseout",BX.proxy(function(){var t=BX.proxy_context.getAttribute("data-id");this.hideHint(t)},this))}};t.prototype.showHint=function(t,e,o){if(this.popupHint[t]){this.popupHint[t].close()}this.popupHint[t]=new BX.PopupWindow("user-profile-email-hint",e,{lightShadow:true,autoHide:false,darkMode:true,offsetLeft:0,offsetTop:2,bindOptions:{position:"top"},zIndex:200,events:{onPopupClose:function(){this.destroy()}},content:BX.create("div",{attrs:{style:"padding-right: 5px; width: 250px;"},html:o})});this.popupHint[t].setAngle({offset:13,position:"bottom"});this.popupHint[t].show();return true};t.prototype.hideHint=function(t){this.popupHint[t].close();this.popupHint[t]=null};return t}();
/* End */
;; /* /bitrix/components/bitrix/socialnetwork.admin.set/templates/.default/script.js?15441274532527*/
; /* /bitrix/templates/bitrix24/components/bitrix/socialnetwork.user_profile/.default/script.min.js?15441276456752*/

//# sourceMappingURL=page_4dd55960ccb0abf27461da54f9bb875e.map.js