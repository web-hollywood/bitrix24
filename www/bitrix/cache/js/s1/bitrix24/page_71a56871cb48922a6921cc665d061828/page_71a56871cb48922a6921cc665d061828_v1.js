
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
; /* Start:"a:4:{s:4:"full";s:104:"/bitrix/components/bitrix/socialnetwork.group_create.ex/templates/.default/script.min.js?154412745426625";s:6:"source";s:84:"/bitrix/components/bitrix/socialnetwork.group_create.ex/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
function BXSwitchProject(e){BX.BXGCE.recalcFormPartProject(e)}function BXSwitchNotVisible(e){if(BX("GROUP_OPENED")&&BX("GROUP_OPENED").type=="checkbox"){if(e){BX("GROUP_OPENED").disabled=false}else{BX("GROUP_OPENED").disabled=true;BX("GROUP_OPENED").checked=false}}}function BXSwitchExtranet(e,t){if(BX("INVITE_EXTRANET_block")){if(e){BX("INVITE_EXTRANET_block_container").style.display="block"}BX.BXGCE.showHideBlock({container:BX("INVITE_EXTRANET_block_container"),block:BX("INVITE_EXTRANET_block"),show:e,duration:t?1e3:0,callback:{complete:function(){if(e){BX.removeClass(BX("INVITE_EXTRANET_block_container"),"invisible")}else{BX("INVITE_EXTRANET_block_container").style.display="none";BX.addClass(BX("INVITE_EXTRANET_block_container"),"invisible")}}}})}if(BX("GROUP_OPENED")){if(!e){if(BX("GROUP_OPENED").type=="checkbox"){BX("GROUP_OPENED").disabled=false}}else{if(BX("GROUP_OPENED").type=="checkbox"){BX("GROUP_OPENED").disabled=true;BX("GROUP_OPENED").checked=false}else{BX("GROUP_OPENED").value="N"}}}if(BX("GROUP_VISIBLE")){if(!e){if(BX("GROUP_VISIBLE").type=="checkbox"){BX("GROUP_VISIBLE").disabled=false}}else{if(BX("GROUP_VISIBLE").type=="checkbox"){BX("GROUP_VISIBLE").disabled=true;BX("GROUP_VISIBLE").checked=false}else{BX("GROUP_VISIBLE").value="N"}}}if(BX("GROUP_INITIATE_PERMS")&&BX("GROUP_INITIATE_PERMS_OPTION_E")&&BX("GROUP_INITIATE_PERMS_OPTION_K")){if(e){BX("GROUP_INITIATE_PERMS_OPTION_E").selected=true}else{BX("GROUP_INITIATE_PERMS_OPTION_K").selected=true}}if(BX("GROUP_INITIATE_PERMS_PROJECT")&&BX("GROUP_INITIATE_PERMS_OPTION_PROJECT_E")&&BX("GROUP_INITIATE_PERMS_OPTION_PROJECT_K")){if(e){BX("GROUP_INITIATE_PERMS_OPTION_PROJECT_E").selected=true}else{BX("GROUP_INITIATE_PERMS_OPTION_PROJECT_K").selected=true}}if(BX("USERS_employee_section_extranet")){BX("USERS_employee_section_extranet").style.display=e?"inline-block":"none"}}function BXGCESubmitForm(e){if(BX("EXTRANET_INVITE_ACTION")){BX("EXTRANET_INVITE_ACTION").value=BX.BXGCE.lastAction}var t=BX("sonet_group_create_popup_form").action;if(t){if(BX("SONET_GROUP_ID")&&parseInt(BX("SONET_GROUP_ID").value)<=0){t+=(t.indexOf("?")>=0?"&":"?")+"action=createGroup&groupType="+BX.BXGCE.selectedTypeCode}BX.BXGCE.disableSubmitButton(true);BX.ajax.submitAjax(document.forms.sonet_group_create_popup_form,{url:t,method:"POST",dataType:"json",onsuccess:function(e){if(typeof e["ERROR"]!="undefined"&&e["ERROR"].length>0){BX.BXGCE.showError((typeof e["WARNING"]!="undefined"&&e["WARNING"].length>0?e["WARNING"]+"<br>":"")+e["ERROR"]);if(typeof BX.SocNetLogDestination.obItems!="undefined"&&typeof e["USERS_ID"]!="undefined"&&BX.type.isArray(e["USERS_ID"])){var t=false;var o=[];var i=false;var n=0;for(n=0;n<e["USERS_ID"].length;n++){o["U"+e["USERS_ID"][n]]="users"}if(BX.BXGCE.arUserSelector.length>0){for(var a=0;a<BX.BXGCE.arUserSelector.length;a++){t=BX.findChildren(BX("sonet_group_create_popup_users_item_post_"+BX.BXGCE.arUserSelector[a]),{className:"feed-add-post-destination-users"},true);if(t){for(n=0;n<t.length;n++){i=t[n].getAttribute("data-id");if(i&&i.length>0){BX.SocNetLogDestination.deleteItem(i,"users",BX.BXGCE.arUserSelector[a])}}}BX.SocNetLogDestination.obItemsSelected[BX.BXGCE.arUserSelector[a]]=o;BX.SocNetLogDestination.reInit(BX.BXGCE.arUserSelector[a])}}}BX.BXGCE.disableSubmitButton(false)}else if(e["MESSAGE"]=="SUCCESS"){if(window===top.window){if(typeof e["URL"]!=="undefined"&&e["URL"].length>0){top.location.href=e["URL"]}}else{if(typeof e.ACTION!="undefined"){var s=false;if(BX.util.in_array(e.ACTION,["create","edit"])&&typeof e.GROUP!="undefined"){s={code:e.ACTION=="create"?"afterCreate":"afterEdit",data:{group:e.GROUP}}}else if(BX.util.in_array(e.ACTION,["invite"])){s={code:"afterInvite",data:{}}}if(s){window.top.BX.SidePanel.Instance.postMessageAll(window,"sonetGroupEvent",s);BX.SidePanel.Instance.close();if(e.ACTION=="create"&&BX.type.isNotEmptyString(e.URL)&&(!BX.type.isNotEmptyString(BX.BXGCE.config.refresh)||BX.BXGCE.config.refresh=="Y")){top.window.location.href=e.URL}}else{BX.SocialnetworkUICommon.reload();var l=BX.SidePanel.Instance.getSliderByWindow(window);if(l){window.top.BX.onCustomEvent("SidePanel.Slider:onClose",[l.getEvent("onClose")])}window.top.BX.onCustomEvent("BX.Bitrix24.PageSlider:close",[false]);window.top.BX.onCustomEvent("onSonetIframeCancelClick")}}}}},onfailure:function(e){BX.BXGCE.disableSubmitButton(false);BX.BXGCE.showError(BX.message("SONET_GCE_T_AJAX_ERROR"))}})}e.preventDefault()}function __deleteExtranetEmail(e){var t=false;if(!e||!BX.type.isDomNode(e))e=this;if(e){BX(e).parentNode.parentNode.removeChild(BX(e).parentNode);var o=parseInt(BX(e).parentNode.id.substring(36));top.BXExtranetMailList[o-1]="";BX("EMAILS").value="";for(var i=0;i<top.BXExtranetMailList.length;i++){if(top.BXExtranetMailList[i].length>0){if(t)BX("EMAILS").value+=", ";BX("EMAILS").value+=top.BXExtranetMailList[i];t=true}}}}(function(){if(!!BX.BXGCE){return}BX.BXGCE={config:{refresh:"Y"},groupId:null,userSelector:"",lastAction:"invite",arUserSelector:[],formSteps:2,animationList:{},selectedTypeCode:false};BX.BXGCE.init=function(e){if(typeof e!="undefined"){if(typeof e.groupId!="undefined"){this.groupId=parseInt(e.groupId)}if(typeof e.config!="undefined"){this.config=e.config}}var t=null,o=null;if(BX("sonet_group_create_form_step_1")){var i=BX.findChildren(BX("sonet_group_create_form_step_1"),{className:"social-group-tile-item"},true);for(t=0,o=i.length;t<o;t++){BX.bind(i[t],"click",BX.delegate(function(e){var t=e.currentTarget;var o=this.selectedTypeCode=t.getAttribute("bx-type");if(BX.type.isNotEmptyString(o)){this.showStep({step:2});if(BX("GROUP_NAME_input")){BX("GROUP_NAME_input").focus()}this.recalcForm({type:o})}e.preventDefault()},this))}}if(BX("additional-block-features")){var n=BX.findChildren(BX("additional-block-features"),{className:"social-group-create-form-pencil"},true);for(t=0,o=n.length;t<o;t++){BX.bind(n[t],"click",BX.delegate(function(e){var t=e.currentTarget;var o=BX.findParent(t,{className:"social-group-create-form-field-list-item"},BX("additional-block-features"));if(o){BX.addClass(o,"custom-value")}var i=BX.findChild(o,{className:"social-group-create-form-field-input-text"},true);var n=BX.findChild(o,{className:"social-group-create-form-field-list-label"},true);if(i&&n){i.value=n.innerText}e.preventDefault()},this))}var a=BX.findChildren(BX("additional-block-features"),{className:"social-group-create-form-field-cancel"},true);for(t=0,o=a.length;t<o;t++){BX.bind(a[t],"click",BX.delegate(function(e){var t=e.currentTarget;var o=BX.findParent(t,{className:"social-group-create-form-field-list-item"},BX("additional-block-features"));if(o){BX.removeClass(o,"custom-value")}var i=BX.findChild(o,{className:"social-group-create-form-field-input-text"},true);if(i){i.value=""}e.preventDefault()},this))}}if(BX("GROUP_NAME_input")){BX("GROUP_NAME_input").focus()}BX.bind(BX("sonet_group_create_popup_form_button_step_2_back"),"click",BX.delegate(function(e){this.showStep({step:1});return e.preventDefault()},this));BX.bind(BX("sonet_group_create_popup_form_button_submit"),"click",function(e){BXGCESubmitForm(e);var t=BX.SidePanel.Instance.getSliderByWindow(window);if(t){window.top.BX.onCustomEvent("SidePanel.Slider:onClose",[t.getEvent("onClose")])}});BX.bind(BX("sonet_group_create_popup_form_button_step_2_cancel"),"click",function(e){var t=BX.SidePanel.Instance.getSliderByWindow(window);if(t){window.top.BX.onCustomEvent("SidePanel.Slider:onClose",[t.getEvent("onClose")])}window.top.BX.onCustomEvent("BX.Bitrix24.PageSlider:close",[false]);window.top.BX.onCustomEvent("onSonetIframeCancelClick");return e.preventDefault()});if(BX.SidePanel.Instance.getTopSlider()){BX.addCustomEvent(BX.SidePanel.Instance.getTopSlider().getWindow(),"SidePanel.Slider:onClose",function(e){setTimeout(function(){BX.SidePanel.Instance.destroy(e.getSlider().getUrl())},500)})}BX.bind(BX("GROUP_INITIATE_PERMS"),"change",BX.BXGCE.onInitiatePermsChange);BX.bind(BX("GROUP_INITIATE_PERMS_PROJECT"),"change",BX.BXGCE.onInitiatePermsChange);if(BX("GROUP_MODERATORS_switch")&&BX("GROUP_MODERATORS_PROJECT_switch")){var s=BX.delegate(function(){var e=BX.hasClass(BX("GROUP_MODERATORS_block_container"),"invisible");if(e){BX("GROUP_MODERATORS_block_container").style.display="block"}this.showHideBlock({container:BX("GROUP_MODERATORS_block_container"),block:BX("GROUP_MODERATORS_block"),show:e,duration:500,callback:{complete:function(){if(!e){BX("GROUP_MODERATORS_block_container").style.display="none"}BX.toggleClass(BX("GROUP_MODERATORS_block_container"),"invisible")}}})},this);BX.bind(BX("GROUP_MODERATORS_switch"),"click",s);BX.bind(BX("GROUP_MODERATORS_PROJECT_switch"),"click",s)}if(BX("IS_EXTRANET_GROUP")&&BX("IS_EXTRANET_GROUP").type=="checkbox"){BX.bind(BX("IS_EXTRANET_GROUP"),"click",function(){BXSwitchExtranet(BX("IS_EXTRANET_GROUP").checked,true)})}if(BX("GROUP_VISIBLE")&&BX("GROUP_VISIBLE").type=="checkbox"){BX.bind(BX("GROUP_VISIBLE"),"click",function(){BXSwitchNotVisible(BX("GROUP_VISIBLE").checked)})}if(BX("switch_additional")){BX.bind(BX("switch_additional"),"click",BX.delegate(function(e){var t=BX.getEventTarget(e).getAttribute("bx-block-id");if(BX.type.isNotEmptyString(t)){if(!BX.hasClass(BX("switch_additional"),"opened")){this.onToggleAdditionalBlock({callback:BX.delegate(function(){this.highlightAdditionalBlock(t)},this)})}else{this.highlightAdditionalBlock(t)}}else{this.onToggleAdditionalBlock()}},this))}if(BX.type.isNotEmptyString(e.avatarUploaderId)&&BX("GROUP_IMAGE_ID_block")&&typeof BX.UploaderManager!="undefined"){setTimeout(function(){var t=BX.UploaderManager.getById(e.avatarUploaderId);if(t){BX.addCustomEvent(t,"onQueueIsChanged",function(e,t,o,i){if(t=="add"){BX.addClass(BX("GROUP_IMAGE_ID_block"),"social-group-create-link-upload-set")}else if(t=="delete"){BX.removeClass(BX("GROUP_IMAGE_ID_block"),"social-group-create-link-upload-set")}})}},0)}};BX.BXGCE.onToggleAdditionalBlock=function(e){BX.toggleClass(BX("switch_additional"),"opened");var t=BX.hasClass(BX("block_additional"),"invisible");if(t){BX("block_additional").style.display="block"}this.showHideBlock({container:BX("block_additional"),block:BX("block_additional_inner"),show:t,duration:1e3,callback:{complete:function(){BX.toggleClass(BX("block_additional"),"invisible");if(typeof e!="undefined"&&typeof e.callback=="function"){if(!t){BX("block_additional").style.display="none"}e.callback()}}}})};BX.BXGCE.showHideBlock=function(e){if(typeof e=="undefined"){return false}var t=typeof e.container!="undefined"?BX(e.container):false;var o=typeof e.block!="undefined"?BX(e.block):false;var i=!!e.show;if(!t||!o){return false}if(typeof this.animationList[o.id]!="undefined"&&this.animationList[o.id]!=null){return false}this.animationList[o.id]=null;var n=parseInt(o.offsetHeight);var a=typeof e.duration!="undefined"&&parseInt(e.duration)>0?parseInt(e.duration):0;if(i){t.style.display="block"}if(a>0){if(BX.type.isNotEmptyString(o.id)){this.animationList[o.id]=true}BX.delegate(new BX["easing"]({duration:a,start:{height:i?0:n,opacity:i?0:100},finish:{height:i?n:0,opacity:i?100:0},transition:BX.easing.makeEaseOut(BX.easing.transitions.quart),step:function(e){t.style.maxHeight=e.height+"px";t.style.opacity=e.opacity/100},complete:BX.delegate(function(){if(BX.type.isNotEmptyString(o.id)){this.animationList[o.id]=null}if(typeof e.callback!="undefined"&&typeof e.callback.complete=="function"){t.style.maxHeight="";t.style.opacity="";e.callback.complete()}},this)}).animate(),this)}else{e.callback.complete()}return true};BX.BXGCE.highlightAdditionalBlock=function(e){var t=BX("additional-block-"+e);if(t){var o="item-highlight";var i=BX.GetWindowScrollPos();BX.addClass(t,o);setTimeout(function(){var e=BX.pos(t);new BX.easing({duration:500,start:{scroll:i.scrollTop},finish:{scroll:e.top},transition:BX.easing.makeEaseOut(BX.easing.transitions.quart),step:function(e){window.scrollTo(0,e.scroll)},complete:function(){}}).animate()},600);setTimeout(function(){BX.removeClass(t,o)},3e3)}};BX.BXGCE.onInitiatePermsChange=function(){var e=this.id=="GROUP_INITIATE_PERMS"?"GROUP_INITIATE_PERMS_OPTION_PROJECT_":"GROUP_INITIATE_PERMS_OPTION_";if(BX(e+this.options[this.selectedIndex].value)){BX(e+this.options[this.selectedIndex].value).selected=true}};BX.BXGCE.showStep=function(e){var t=typeof e!="undefined"&&typeof e.step!="undefined"?parseInt(e.step):1;for(var o=1;o<=this.formSteps;o++){if(BX("sonet_group_create_form_step_"+o)){BX("sonet_group_create_form_step_"+o).style.display=o==t?"block":"none"}}};BX.BXGCE.recalcFormPartProjectBlock=function(e,t){if(BX(e)){if(t){BX.addClass(BX(e),"sgcp-switch-project")}else{BX.removeClass(e,"sgcp-switch-project")}}};BX.BXGCE.recalcFormPartProject=function(e){e=!!e;if(BX("GROUP_PROJECT")){this.setCheckedValue(BX("GROUP_PROJECT"),e)}BX.BXGCE.recalcFormPartProjectBlock("IS_PROJECT_block",e);BX.BXGCE.recalcFormPartProjectBlock("GROUP_VISIBLE_LABEL_block",e);BX.BXGCE.recalcFormPartProjectBlock("GROUP_OPENED_LABEL_block",e);BX.BXGCE.recalcFormPartProjectBlock("GROUP_CLOSED_LABEL_block",e);BX.BXGCE.recalcFormPartProjectBlock("GROUP_EXTRANET_LABEL_block",e);BX.BXGCE.recalcFormPartProjectBlock("GROUP_OWNER_LABEL_block",e);BX.BXGCE.recalcFormPartProjectBlock("GROUP_ADD_DEPT_HINT_block",e);BX.BXGCE.recalcFormPartProjectBlock("GROUP_MODERATORS_LABEL_block",e);BX.BXGCE.recalcFormPartProjectBlock("GROUP_MODERATORS_SWITCH_LABEL_block",e);BX.BXGCE.recalcFormPartProjectBlock("GROUP_TYPE_LABEL_block",e);BX.BXGCE.recalcFormPartProjectBlock("GROUP_SUBJECT_ID_LABEL_block",e);BX.BXGCE.recalcFormPartProjectBlock("GROUP_INVITE_PERMS_block",e);BX.BXGCE.recalcFormPartProjectBlock("GROUP_INVITE_PERMS_LABEL_block",e);if(BX("sonet_group_create_popup_form_button_submit")&&BX("sonet_group_create_popup_form_button_submit").getAttribute("bx-action-type")=="create"){BX("sonet_group_create_popup_form_button_submit").innerHTML=BX.message(e?"SONET_GCE_T_DO_CREATE_PROJECT":"SONET_GCE_T_DO_CREATE")}if(BX("GROUP_NAME_input")){BX("GROUP_NAME_input").placeholder=BX.message(e?"SONET_GCE_T_NAME2_PROJECT":"SONET_GCE_T_NAME2")}if(BX("pagetitle-slider")){BX("pagetitle-slider").innerHTML=BX.message(this.groupId>0?e?"SONET_GCE_T_TITLE_EDIT_PROJECT":"SONET_GCE_T_TITLE_EDIT":e?"SONET_GCE_T_TITLE_CREATE_PROJECT":"SONET_GCE_T_TITLE_CREATE")}};BX.BXGCE.recalcForm=function(e){var t=typeof e!="undefined"&&typeof e.type!="undefined"?e.type:false;if(!t||typeof this.types[t]=="undefined"){return}this.recalcFormPartProject(this.types[t].PROJECT=="Y");if(BX("GROUP_OPENED")){this.setCheckedValue(BX("GROUP_OPENED"),this.types[t].OPENED=="Y")}if(BX("GROUP_VISIBLE")){this.setCheckedValue(BX("GROUP_VISIBLE"),this.types[t].VISIBLE=="Y")}if(BX("IS_EXTRANET_GROUP")){this.setCheckedValue(BX("IS_EXTRANET_GROUP"),this.types[t].EXTERNAL=="Y")}this.recalcFormDependencies()};BX.BXGCE.recalcFormDependencies=function(){if(BX("IS_EXTRANET_GROUP")){BXSwitchExtranet(this.getCheckedValue(BX("IS_EXTRANET_GROUP")),false)}if(BX("GROUP_VISIBLE")&&BX("GROUP_OPENED")){var e=this.getCheckedValue(BX("GROUP_VISIBLE"));if(!e){this.setCheckedValue(BX("GROUP_OPENED"),false)}}};BX.BXGCE.setSelector=function(e){BX.BXGCE.userSelector=e};BX.BXGCE.disableBackspace=function(e){if(BX.SocNetLogDestination.backspaceDisable||BX.SocNetLogDestination.backspaceDisable!=null){BX.unbind(window,"keydown",BX.SocNetLogDestination.backspaceDisable)}BX.bind(window,"keydown",BX.SocNetLogDestination.backspaceDisable=function(e){if(e.keyCode==8){e.preventDefault();return false}});setTimeout(function(){BX.unbind(window,"keydown",BX.SocNetLogDestination.backspaceDisable);BX.SocNetLogDestination.backspaceDisable=null},5e3)};BX.BXGCE.selectCallback=function(e){if(typeof e=="undefined"||!BX.type.isNotEmptyString(e.name)||typeof e.item=="undefined"||!BX.type.isNotEmptyString(e.type)){return}var t=e.name,o=e.type,i=e.item;var n=typeof BX.BXGCESelectorManager.controls[t]!="undefined"&&typeof BX.BXGCESelectorManager.controls[t].single!="undefined"&&!!BX.BXGCESelectorManager.controls[t].single;var a=typeof BX.BXGCESelectorManager.controls[t]!="undefined"&&typeof BX.BXGCESelectorManager.controls[t].controlName!="undefined"&&BX.BXGCESelectorManager.controls[t].controlName?BX.BXGCESelectorManager.controls[t].controlName:"USER_CODES[]";if(!BX.findChild(BX("sonet_group_create_popup_users_item_post_"+t),{attr:{"data-id":i.id}},false,false)){if(n){BX.cleanNode(BX("sonet_group_create_popup_users_item_post_"+t));BX("sonet_group_create_popup_users_input_post_"+t).style.display="none"}BX("sonet_group_create_popup_users_item_post_"+t).appendChild(BX.create("span",{attrs:{"data-id":i.id},props:{className:"feed-add-post-destination feed-add-post-destination-"+o},children:[BX.create("input",{attrs:{type:"hidden",name:a,value:i.id}}),BX.create("span",{props:{className:"feed-add-post-destination-text"},html:i.name}),BX.create("span",{props:{className:"feed-add-post-del-but"},events:{click:function(e){BX.SocNetLogDestination.deleteItem(i.id,o,t);e.preventDefault()},mouseover:function(){BX.addClass(this.parentNode,"feed-add-post-destination-hover")},mouseout:function(){BX.removeClass(this.parentNode,"feed-add-post-destination-hover")}}})]}));BX.BXGCE.showDepartmentHint(t)}BX("sonet_group_create_popup_users_input_post_"+t).value="";if(!n){BX.SocNetLogDestination.BXfpSetLinkName({formName:t,tagInputName:"sonet_group_create_popup_users_tag_post_"+t,tagLink1:BX.message("SONET_GCE_T_DEST_LINK_1"),tagLink2:BX.message("SONET_GCE_T_DEST_LINK_2")})}else{BX.style(BX("sonet_group_create_popup_users_tag_post_"+t),"display","none");BX.SocNetLogDestination.closeDialog()}};BX.BXGCE.selectCallbackOld=function(e,t,o,i,n){BX.BXGCE.selectCallback({name:n,type:t,item:e})};BX.BXGCE.showDepartmentHint=function(e){if(!BX.type.isPlainObject(BX.SocNetLogDestination.obItemsSelected[e])||!BX("GROUP_ADD_DEPT_HINT_block")){return false}var t=false;for(var o in BX.SocNetLogDestination.obItemsSelected[e]){if(!BX.SocNetLogDestination.obItemsSelected[e].hasOwnProperty(o)){continue}if(o.match(/DR\d+/)){t=true;break}}if(t){BX.addClass(BX("GROUP_ADD_DEPT_HINT_block"),"visible")}else{BX.removeClass(BX("GROUP_ADD_DEPT_HINT_block"),"visible")}return t};BX.BXGCE.unSelectCallback=function(e){if(typeof e=="undefined"||!BX.type.isNotEmptyString(e.name)||typeof e.item=="undefined"){return}var t=e.name,o=e.item;var i=typeof BX.BXGCESelectorManager.controls[t]!="undefined"&&typeof BX.BXGCESelectorManager.controls[t].single!="undefined"&&!!BX.BXGCESelectorManager.controls[t].single;var n=typeof BX.BXGCESelectorManager.controls[t]!="undefined"&&typeof BX.BXGCESelectorManager.controls[t].tagLinkText1!="undefined"&&BX.BXGCESelectorManager.controls[t].tagLinkText1.length>0?BX.BXGCESelectorManager.controls[t].tagLinkText1:BX.message("SONET_GCE_T_DEST_LINK_1");var a=typeof BX.BXGCESelectorManager.controls[t]!="undefined"&&typeof BX.BXGCESelectorManager.controls[t].tagLinkText2!="undefined"&&BX.BXGCESelectorManager.controls[t].tagLinkText2.length>0?BX.BXGCESelectorManager.controls[t].tagLinkText2:BX.message("SONET_GCE_T_DEST_LINK_2");BX.delegate(BX.SocNetLogDestination.BXfpUnSelectCallback,{formName:t,inputContainerName:"sonet_group_create_popup_users_item_post_"+t,inputName:"sonet_group_create_popup_users_input_post_"+t,tagInputName:"sonet_group_create_popup_users_tag_post_"+t,tagLink1:n,tagLink2:a})(o);if(!i){BX.SocNetLogDestination.BXfpSetLinkName({formName:t,tagInputName:"sonet_group_create_popup_users_tag_post_"+t,tagLink1:BX.message("SONET_GCE_T_DEST_LINK_1"),tagLink2:BX.message("SONET_GCE_T_DEST_LINK_2")})}else{BX.style(BX("sonet_group_create_popup_users_tag_post_"+t),"display","inline-block")}};BX.BXGCE.unSelectCallbackOld=function(e,t,o,i){BX.SocNetLogDestination.BXfpUnSelectCallback.apply(this,[e,t,o,i]);BX.BXGCE.showDepartmentHint(i)};BX.BXGCE.openDialogCallback=function(e){if(typeof e=="undefined"||!BX.type.isNotEmptyString(e.name)){return}var t=e.name;BX.PopupWindow.setOptions({popupZindex:2100});var o=typeof BX.BXGCESelectorManager.controls[t]!="undefined"&&typeof BX.BXGCESelectorManager.controls[t].single!="undefined"&&!!BX.BXGCESelectorManager.controls[t].single;if(o){BX("sonet_group_create_popup_users_input_post_"+t).style.display="inline-block"}BX.SocNetLogDestination.BXfpOpenDialogCallback.apply(this,arguments)};BX.BXGCE.openDialogCallbackOld=function(e){BX.BXGCE.openDialogCallback.apply(this,[{name:e}])};BX.BXGCE.closeDialogCallback=function(e){var t=typeof e!="undefined"&&BX.type.isNotEmptyString(e.name)?e.name:"";BX.SocNetLogDestination.BXfpCloseDialogCallback.apply(this,[t])};BX.BXGCE.bindActionLink=function(e){if(e===undefined||e==null){return}BX.bind(e,"click",function(t){BX.PopupMenu.destroy("invite-dialog-usertype-popup");var o=[{text:BX.message("SONET_GCE_T_DEST_EXTRANET_SELECTOR_INVITE"),id:"sonet_group_create_popup_action_invite",className:"menu-popup-no-icon",onclick:function(){BX.BXGCE.onActionSelect("invite")}},{text:BX.message("SONET_GCE_T_DEST_EXTRANET_SELECTOR_ADD"),id:"sonet_group_create_popup_action_add",className:"menu-popup-no-icon",onclick:function(){BX.BXGCE.onActionSelect("add")}}];var i={offsetLeft:-14,offsetTop:4,zIndex:1200,lightShadow:false,angle:{position:"top",offset:50},events:{onPopupShow:function(e){}}};BX.PopupMenu.show("sonet_group_create_popup_action_popup",e,o,i)})};BX.BXGCE.onActionSelect=function(e){if(e!="add"){e="invite"}BX.BXGCE.lastAction=e;BX("sonet_group_create_popup_action_title_link").innerHTML=BX.message("SONET_GCE_T_DEST_EXTRANET_SELECTOR_"+(e=="invite"?"INVITE":"ADD"));if(e=="invite"){BX("sonet_group_create_popup_action_block_invite").style.display="block";BX("sonet_group_create_popup_action_block_invite_2").style.display="block";BX("sonet_group_create_popup_action_block_add").style.display="none"}else{BX("sonet_group_create_popup_action_block_invite").style.display="none";BX("sonet_group_create_popup_action_block_invite_2").style.display="none";BX("sonet_group_create_popup_action_block_add").style.display="block"}BX("sonet_group_create_popup_action_block_"+e).style.display="block";BX("sonet_group_create_popup_action_block_"+(e=="invite"?"add":"invite")).style.display="none";BX.PopupMenu.destroy("sonet_group_create_popup_action_popup")};BX.BXGCE.showError=function(e){if(BX("sonet_group_create_error_block")){BX("sonet_group_create_error_block").innerHTML=e;BX.removeClass(BX("sonet_group_create_error_block"),"sonet-ui-form-error-block-invisible")}};BX.BXGCE.showMessage=function(){};BX.BXGCE.disableSubmitButton=function(e){e=!!e;var t=BX("sonet_group_create_popup_form_button_submit");if(t){if(e){BX.SocialnetworkUICommon.showButtonWait(t);BX.unbind(t,"click",BXGCESubmitForm)}else{BX.SocialnetworkUICommon.hideButtonWait(t);BX.bind(t,"click",BXGCESubmitForm)}}};BX.BXGCE.getCheckedValue=function(e){var t=false;if(!BX(e)){return t}if(e.type=="hidden"){t=e.value=="Y"}else if(e.type=="checkbox"){t=e.checked}return t};BX.BXGCE.setCheckedValue=function(e,t){if(!BX(e)){return}t=!!t;if(e.type=="checkbox"){e.checked=t}else{e.value=t?"Y":"N"}};BX.BXGCETagsForm=function(e){this.popup=null;this.addNewLink=null;this.hiddenField=null;this.popupContent=null;this.init(e)};BX.BXGCETagsForm.prototype.init=function(e){this.addNewLink=BX(e.addNewLinkId);this.tagsContainer=BX(e.containerNodeId);this.hiddenField=BX(e.hiddenFieldId);this.popupContent=BX(e.popupContentNodeId);this.popupInput=BX.findChild(this.popupContent,{tag:"input"});var t=BX.findChildren(this.tagsContainer,{className:"js-id-tdp-mem-sel-is-item-delete"},true);for(var o=0,i=t.length;o<i;o++){BX.bind(t[o],"click",BX.proxy(this.onTagDelete,{obj:this,tagBox:t[o].parentNode.parentNode,tagValue:t[o].parentNode.parentNode.getAttribute("data-tag")}))}BX.bind(this.addNewLink,"click",BX.proxy(this.onAddNewClick,this))};BX.BXGCETagsForm.prototype.onTagDelete=function(){BX.remove(this.tagBox);this.obj.hiddenField.value=this.obj.hiddenField.value.replace(this.tagValue+",","").replace("  "," ")};BX.BXGCETagsForm.prototype.show=function(){if(this.popup===null){this.popup=new BX.PopupWindow("bx-group-tag-popup",this.addNewLink,{content:this.popupContent,lightShadow:false,offsetTop:8,offsetLeft:10,autoHide:true,angle:true,closeByEsc:true,zIndex:-840,buttons:[new BX.PopupWindowButton({text:BX.message("SONET_GCE_T_TAG_ADD"),events:{click:BX.proxy(this.onTagAdd,this)}})]});BX.bind(this.popupInput,"keydown",BX.proxy(this.onKeyPress,this));BX.bind(this.popupInput,"keyup",BX.proxy(this.onKeyPress,this))}this.popup.show();BX.focus(this.popupInput)};BX.BXGCETagsForm.prototype.addTag=function(e){var t=BX.type.isNotEmptyString(e)?e.split(","):this.popupInput.value.split(",");var o=[];for(var i=0;i<t.length;i++){var n=BX.util.trim(t[i]);if(n.length>0){var a=this.hiddenField.value.split(",");if(!BX.util.in_array(n,a)){var s=null;var l=BX.create("span",{children:[BX.create("span",{props:{className:"js-id-tdp-mem-sel-is-item social-group-create-form-field-item"},children:[BX.create("a",{props:{className:"social-group-create-form-field-item-text"},text:n}),s=BX.create("span",{props:{className:"js-id-tdp-mem-sel-is-item-delete social-group-create-form-field-item-delete"}})]})],attrs:{"data-tag":n},props:{className:"js-id-tdp-mem-sel-is-items social-group-create-sliders-h-invisible"}});this.tagsContainer.insertBefore(l,this.addNewLink);BX.bind(s,"click",BX.proxy(this.onTagDelete,{obj:this,tagBox:l,tagValue:n}));this.hiddenField.value+=n+",";o.push(n)}}}return o};BX.BXGCETagsForm.prototype.onTagAdd=function(){this.addTag();this.popupInput.value="";this.popup.close()};BX.BXGCETagsForm.prototype.onAddNewClick=function(e){e=e||window.event;this.show();e.preventDefault()};BX.BXGCETagsForm.prototype.onKeyPress=function(e){e=e||window.event;var t=e.keyCode?e.keyCode:e.which?e.which:null;if(t==13){setTimeout(BX.proxy(this.onTagAdd,this),0)}};BX.BXGCESelectorInstance=function(e){this.single=typeof e!="undefined"&&typeof e.single!="undefined"&&!!e.single;this.controlName=typeof e!="undefined"&&typeof e.controlName!="undefined"?e.controlName:false;this.tagLinkText1=typeof e!="undefined"&&typeof e.tagLinkText1!="undefined"?e.tagLinkText1:"";this.tagLinkText2=typeof e!="undefined"&&typeof e.tagLinkText2!="undefined"?e.tagLinkText2:""};BX.BXGCESelectorInstance.prototype.init=function(e){BX.bind(BX(e.contId),"click",function(){var t=typeof e.id!="undefined"&&typeof BX.BXGCESelectorManager.controls[e.id]!="undefined"&&typeof BX.BXGCESelectorManager.controls[e.id].single!="undefined"&&!!BX.BXGCESelectorManager.controls[e.id].single;if(!t||BX("sonet_group_create_popup_users_item_post_"+e.id)&&BX("sonet_group_create_popup_users_item_post_"+e.id).children.length<=0){BX.onCustomEvent(window,"BX.BXGCE:open",[e])}})};BX.BXGCESelectorManager={controls:{}}})();
/* End */
;
; /* Start:"a:4:{s:4:"full";s:89:"/bitrix/components/bitrix/main.file.input/templates/.default/script.min.js?15441273849095";s:6:"source";s:70:"/bitrix/components/bitrix/main.file.input/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function(){var e=window.BX;if(e["MFInput"])return;var t={},i=function(){var i=function(i){try{this.params=i;this.controller=e("mfi-"+i.controlId);this.button=e("mfi-"+i.controlId+"-button");this.editor=null;if(e("mfi-"+i.controlId+"-editor")){this.editor=new e.AvatarEditor({enableCamera:i.enableCamera});e.addCustomEvent(this.editor,"onApply",e.delegate(this.addFile,this));e.bind(e("mfi-"+i.controlId+"-editor"),"click",e.delegate(this.editor.click,this.editor))}this.init(i);t[i.controlId]=this;this.template=e.message("MFI_THUMB2").replace("#input_name#",this.params.inputName);window["FILE_INPUT_"+i.controlId]=this;this.INPUT=e("file_input_"+i["controlId"])}catch(t){e.debug(t)}};i.prototype={init:function(t){this.agent=e.Uploader.getInstance({id:t["controlId"],CID:t["controlUid"],streams:1,uploadFormData:"N",uploadMethod:"immediate",uploadFileUrl:t["urlUpload"],allowUpload:t["allowUpload"],allowUploadExt:t["allowUploadExt"],uploadMaxFilesize:t["uploadMaxFilesize"],showImage:false,sortItems:false,input:e("file_input_"+t["controlId"]),dropZone:this.controller.parentNode,placeHolder:this.controller,fields:{thumb:{tagName:"",template:e.message("MFI_THUMB")}}});this.fileEvents={onFileIsAttached:e.delegate(this.onFileIsAttached,this),onFileIsAppended:e.delegate(this.onFileIsAppended,this),onFileIsBound:e.delegate(this.onFileIsBound,this),onFileIsReadyToFrame:e.delegate(this.onFileIsReadyToFrame,this),onUploadStart:e.delegate(this.onUploadStart,this),onUploadProgress:e.delegate(this.onUploadProgress,this),onUploadDone:e.delegate(this.onUploadDone,this),onUploadError:e.delegate(this.onUploadError,this),onUploadRestore:e.delegate(this.onUploadRestore,this)};e.addCustomEvent(this.agent,"onAttachFiles",e.delegate(this.onAttachFiles,this));e.addCustomEvent(this.agent,"onQueueIsChanged",e.delegate(this.onQueueIsChanged,this));e.addCustomEvent(this.agent,"onFileIsInited",e.delegate(this.onFileIsInited,this));e.addCustomEvent(this.agent,"onPackageIsInitialized",e.delegate(function(e){var t={mfi_mode:"upload",cid:this.agent.CID,moduleId:this.params["moduleId"],forceMd5:this.params["forceMd5"],allowUpload:this.agent.limits["allowUpload"],allowUploadExt:this.agent.limits["allowUploadExt"],uploadMaxFilesize:this.agent.limits["uploadMaxFilesize"],mfi_sign:this.params["controlSign"]},i;for(i in t){if(t.hasOwnProperty(i)&&t[i]){e.post.data[i]=t[i];e.post.size+=(i+"").length+(t[i]+"").length}}},this));var i=[],a=[],n,s,r=e.findChildren(this.controller,{tagName:"LI"});for(var o=0;o<r.length;o++){n=e.findChild(r[o],{attribute:{"data-bx-role":"file-name"}},true);s=e.findChild(r[o],{attribute:{"data-bx-role":"file-id"}},true);if(n&&s){i.push({name:n.innerHTML,file_id:s.value});a.push(r[o])}}this.agent.onAttach(i,a);this.inited=true;this.checkUploadControl()},checkUploadControl:function(){if(e(this.button)){if(!(this.params["maxCount"]>0&&this.params["maxCount"]<=this.agent.getItems().length)){this.button.removeAttribute("disable")}else if(this.params["maxCount"]==1){}else{this.button.setAttribute("disable","Y")}}},onQueueIsChanged:function(){if(this.params["maxCount"]>0){this.checkUploadControl()}},onAttachFiles:function(t){var i=false,a;if(t&&this.inited===true&&this.params["maxCount"]>0){if(this.params["maxCount"]==1&&t.length>0){while(this.agent.getItems().length>0){this.deleteFile(this.agent.getItems().getFirst(),false)}while(t.length>1)t.pop()}var n=this.params["maxCount"]-this.agent.getItems().length;n=n>0?n:0;while(t.length>n){t.pop();i=true}}if(i){this.onError("Too much files.")}e.onCustomEvent(this,"onFileUploaderChange",[t,this]);return t},onFileIsInited:function(t,i){for(var a in this["fileEvents"]){if(this["fileEvents"].hasOwnProperty(a))e.addCustomEvent(i,a,this["fileEvents"][a])}},onFileIsAppended:function(e,t){var i=this.agent.getItem(e);this.bindEventsHandlers(i.node,t)},onFileIsBound:function(e,t){var i=this.agent.getItem(e);this.bindEventsHandlers(i.node,t)},bindEventsHandlers:function(t,i){var a=e.findChild(t,{attribute:{"data-bx-role":"file-delete"}},true),n;if(a)e.bind(a,"click",e.proxy(function(){this.deleteFile(i)},this));a=e.findChild(t,{attribute:{"data-bx-role":"file-preview"}},true);if(a){a.removeAttribute("data-bx-role");if(i.file.parentCanvas){var s=e.UploaderUtils.scaleImage(i.file.parentCanvas,{width:100,height:100},"exact"),r=e.create("CANVAS",{props:{width:100,height:100}});a.appendChild(r);r.getContext("2d").drawImage(i.file.parentCanvas,s.source.x,s.source.y,s.source.width,s.source.height,0,0,s.destin.width,s.destin.height);i.canvas=r}}i.file.parentCanvas=null;a=e.findChild(t,{tagName:"A",attribute:{"data-bx-role":"file-name"}},true);if(a){if(this.editor&&((n=e.findChild(t,{tagName:"CANVAS"},true))&&n||(n=e.findChild(t,{tagName:"IMG"},true))&&n)){e.bind(a,"click",e.proxy(function(t){e.PreventDefault(t);this.editor.showFile({name:a.innerHTML,tmp_url:a.href});return false},this))}else if(a.getAttribute("href")==="#"){e.bind(a,"click",e.proxy(function(t){e.PreventDefault(t);return false},this))}}},addFile:function(e,t){e.name=e["name"]||"image.png";e.parentCanvas=t;this.agent.onAttach([e])},deleteFile:function(t){var i=t?this.agent.getItem(t.id):false;if(!i)return;t=i.item;var a=i.node;var n;if(t.file["justUploaded"]===true&&t.file["file_id"]>0){var s={fileID:t.file["file_id"],sessid:e.bitrix_sessid(),cid:this.agent.CID,mfi_mode:"delete"};e.ajax.post(this.agent.uploadFileUrl,s)}else{var r=a.parentNode.parentNode,o=e.findChild(a,{tagName:"INPUT",attribute:{"data-bx-role":"file-id"}},true);if(o){var l=o.name,d=o.value,h=l+"_del",p=this.agent.id+"_deleted[]";if(l.indexOf("[")>0){h=l.substr(0,l.indexOf("["))+"_del"+l.substr(l.indexOf("["))}n=e.create("INPUT",{props:{name:l,type:"hidden",value:d}});r.appendChild(n);var f=e.create("INPUT",{props:{name:h,type:"hidden",value:d}});r.appendChild(f);f=e.create("INPUT",{props:{name:p,type:"hidden",value:d}});r.appendChild(f)}}for(var u in this["fileEvents"]){if(this["fileEvents"].hasOwnProperty(u))e.addCustomEvent(t,u,this["fileEvents"][u])}e.unbindAll(a);var g=t.file?t.file["file_id"]:null;delete t.hash;t.deleteFile("deleteFile");if(g){e.onCustomEvent(this,"onDeleteFile",[g,t,this]);e.onCustomEvent(this,"onFileUploaderChange",[[g],this]);if(!!n){e.fireEvent(n,"change")}}},_deleteFile:function(){},clear:function(){while(this.agent.getItems().length>0){this.deleteFile(this.agent.getItems().getFirst(),false)}},onUploadStart:function(t){var i=this.agent.getItem(t.id).node;if(i)e.addClass(i,"uploading")},onUploadProgress:function(t,i){i=Math.min(i,98);var a=t.id;if(!t.__progressBarWidth)t.__progressBarWidth=5;if(i>t.__progressBarWidth){t.__progressBarWidth=Math.ceil(i);t.__progressBarWidth=t.__progressBarWidth>100?100:t.__progressBarWidth;if(e("wdu"+a+"Progressbar"))e.adjust(e("wdu"+a+"Progressbar"),{style:{width:t.__progressBarWidth+"%"}});if(e("wdu"+a+"ProgressbarText"))e.adjust(e("wdu"+a+"ProgressbarText"),{text:t.__progressBarWidth+"%"})}},onUploadDone:function(t,i){var a=this.agent.getItem(t.id).node,n=i["file"];if(e(a)){e.removeClass(a,"uploading");e.addClass(a,"saved");var s=this.template,r;n["ext"]=t.ext;n["preview_url"]=t.canvas?t.canvas.toDataURL("image/png"):"/bitrix/images/1.gif";t.canvas=null;delete t.canvas;for(var o in n){if(n.hasOwnProperty(o)){r=n[o];if(o.toLowerCase()==="size")r=e.UploaderUtils.getFormattedSize(r,0);else if(o.toLowerCase()==="name")r=n["originalName"];s=s.replace(new RegExp("#"+o.toLowerCase()+"#","gi"),e.util.htmlspecialchars(r)).replace(new RegExp("#"+o.toUpperCase()+"#","gi"),e.util.htmlspecialchars(r))}}t.file.file_id=n["file_id"];t.file.justUploaded=true;t.name=n["originalName"];a.innerHTML=s;this.bindEventsHandlers(a,t);if(this.params.inputName.indexOf("[")<0){e.remove(e.findChild(a.parentNode.parentNode,{tagName:"INPUT",attr:{name:this.params.inputName}},false));e.remove(e.findChild(a.parentNode.parentNode,{tagName:"INPUT",attr:{name:this.params.inputName+"_del"}},false))}e.onCustomEvent(this,"onAddFile",[n["file_id"],this,n,a]);e.onCustomEvent(this,"onUploadDone",[i["file"],t,this]);e.fireEvent(e("file-"+n["file_id"]),"change")}else{this.onUploadError(t,i,this.agent)}},onUploadError:function(t,i,a){var n=this.agent.getItem(t.id).node,s=e.message("MFI_UPLOADING_ERROR");if(i&&i.error)s=i.error;e.removeClass(n,"uploading");e.addClass(n,"error");n.appendChild(e.create("DIV",{attrs:{className:"upload-file-error"},html:s}));e.onCustomEvent(this,"onErrorFile",[t["file"],this])},onError:function(t,i,a){var n="Uploading error.",s=n,r,o;if(a){if(a["error"]&&typeof a["error"]=="string")s=a["error"];else if(a["message"]&&typeof a["message"]=="string")s=a["message"];else if(e.type.isArray(a["errors"])&&a["errors"].length>0){s=[];for(var l=0;l<a["errors"].length;l++){if(typeof a["errors"][l]=="object"&&a["errors"][l]["message"])s.push(a["errors"][l]["message"])}if(s.length<=0)s.push("Uploading error.");s=s.join(" ")}}t.files=t.files||{};for(o in t.files){if(t.files.hasOwnProperty(o)){r=this.agent.queue.items.getItem(o);this.onUploadError(r,{error:s},s!=n)}}}};return i}();e.MFInput={init:function(e){return new i(e)},get:function(e){return t[e]||null}}})();
/* End */
;
; /* Start:"a:4:{s:4:"full";s:91:"/bitrix/components/bitrix/main.ui.selector/templates/.default/script.min.js?154412738410379";s:6:"source";s:71:"/bitrix/components/bitrix/main.ui.selector/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function(){"use strict";BX.namespace("BX.Main");BX.Main.selectorManager={getById:function(t){if(typeof this.controls[t]!="undefined"){return this.controls[t]}return null},controls:{}};BX.Main.Selector=function(){this.initialized=false;this.blockInit=false;this.id="";this.inputId=null;this.input=null;this.tagId=null;this.tag=null;this.options=null;this.callback=null;this.items=null;this.entities=null;this.mainPopupWindow=null;this.entitiesSet=["users","emails","crmemails","groups","sonetgroups","department","departmentRelation","contacts","companies","leads","deals"];this.auxObject=null};BX.Main.Selector.controls={};BX.Main.Selector.create=function(t){if(typeof t.id=="undefined"||!t.id){t.id=BX.util.hashCode(Math.random().toString())}else if(typeof BX.Main.selectorManager.controls[t.id]!="undefined"){return BX.Main.selectorManager.controls[t.id]}var e=new BX.Main.Selector;e.init(t);BX.Main.selectorManager.controls[e.getId()]=e;return e};BX.Main.Selector.proxyCallback=function(t,e){t(e)};BX.Main.Selector.prototype={init:function(t){try{if(!("SocNetLogDestination"in BX)){throw new ReferenceError("No BX.SocNetLogDestination detected. Forgot to include socialnetwork module and/or its assets?")}}catch(t){throw t}this.id=t.id;this.inputId=t.inputId?t.inputId:null;this.input=t.inputId&&BX(t.inputId)?BX(t.inputId):null;this.containerNode=t.containerId&&BX(t.containerId)?BX(t.containerId):null;this.bindNode=t.bindId&&BX(t.bindId)?BX(t.bindId):this.containerNode;this.tagId=t.tagId?t.tagId:null;this.tag=t.tagId&&BX(t.tagId)?BX(t.tagId):null;this.openDialogWhenInit=typeof t.openDialogWhenInit=="undefined"||!!t.openDialogWhenInit;this.options=t.options||{};this.callback=t.callback||null;this.items=t.items||null;this.entities=t.entities||null;var e={name:this.id,pathToAjax:t.pathToAjax?t.pathToAjax:null,searchInput:this.input||null,bindMainPopup:{node:this.bindNode,offsetTop:"5px",offsetLeft:"15px"},bindSearchPopup:{node:this.bindNode,offsetTop:"5px",offsetLeft:"15px"},userSearchArea:this.getOption("userSearchArea"),lazyLoad:this.getOption("lazyLoad")=="Y",useClientDatabase:this.getOption("useClientDatabase")=="Y",sendAjaxSearch:this.getOption("sendAjaxSearch")!="N",showSearchInput:this.getOption("useSearch")=="Y",allowAddUser:this.getOption("allowAddUser")=="Y",allowAddCrmContact:this.getOption("allowAddCrmContact")=="Y",allowAddSocNetGroup:this.getOption("allowAddSocNetGroup")=="Y",allowSearchEmailUsers:this.getOption("allowSearchEmailUsers")=="Y",allowSearchCrmEmailUsers:this.getOption("allowSearchCrmEmailUsers")=="Y",allowSearchNetworkUsers:this.getOption("allowSearchNetworkUsers")=="Y",enableDepartments:this.getOption("enableDepartments")=="Y",departmentSelectDisable:this.getOption("departmentSelectDisable")=="Y",enableSonetgroups:this.getOption("enableSonetgroups")=="Y",enableProjects:this.getOption("enableProjects")=="Y",isCrmFeed:this.getOption("isCrmFeed")=="Y",callback:{select:this.callback.select!=null?BX.delegate(function(t,e,i,n,o,a){this.getOption("useNewCallback")=="Y"?BX.Main.Selector.proxyCallback(this.callback.select,{name:o,item:t,type:e,search:i,bUndeleted:n,state:a}):this.callback.select(t,e,i,n,o,a)},this):null,unSelect:this.callback.unSelect!=null?BX.delegate(function(t,e,i,n){this.getOption("useNewCallback")=="Y"?BX.Main.Selector.proxyCallback(this.callback.unSelect,{name:n,item:t,type:e,search:i}):this.callback.unSelect(t,e,i,n)},this):null,openDialog:this.callback.openDialog!=null?BX.delegate(function(t){this.getOption("useNewCallback")=="Y"?BX.Main.Selector.proxyCallback(this.callback.openDialog,{name:t}):this.callback.openDialog(t)},this):null,closeDialog:this.callback.closeDialog!=null?BX.delegate(function(t){this.getOption("useNewCallback")=="Y"?BX.Main.Selector.proxyCallback(this.callback.closeDialog,{name:t}):this.callback.closeDialog(t)},this):null,openSearch:this.callback.openSearch!=null?BX.delegate(function(t){this.getOption("useNewCallback")=="Y"?BX.Main.Selector.proxyCallback(this.callback.openSearch,{name:t}):this.callback.openSearch(t)},this):null,closeSearch:this.callback.closeSearch!=null?BX.delegate(function(t){this.getOption("useNewCallback")=="Y"?BX.Main.Selector.proxyCallback(this.callback.closeSearch,{name:t}):this.callback.closeSearch(t)},this):null,openEmailAdd:this.callback.openEmailAdd!=null?BX.delegate(function(t){this.getOption("useNewCallback")=="Y"?BX.Main.Selector.proxyCallback(this.callback.openEmailAdd,{name:t}):this.callback.openEmailAdd(t)},this):null,closeEmailAdd:this.callback.closeEmailAdd!=null?BX.delegate(function(t){this.getOption("useNewCallback")=="Y"?BX.Main.Selector.proxyCallback(this.callback.closeEmailAdd,{name:t}):this.callback.closeEmailAdd(t)},this):null},allowSonetGroupsAjaxSearchFeatures:this.getOption("allowSonetGroupsAjaxSearchFeatures")};var i=null;e.items={};for(var n=0;n<this.entitiesSet.length;n++){i=this.entitiesSet[n];e.items[i]=this.entities[i]||{}}e.itemsLast={};e.itemsSelected=this.items.selected||{};BX.SocNetLogDestination.init(e);if(this.input){if(!this.options.lazyLoad){this.initDialog()}if(this.tag){BX.bind(this.tag,"focus",BX.delegate(function(t){this.initDialog({realParams:true,bByFocusEvent:true});return BX.PreventDefault(t)},this));BX.SocNetLogDestination.BXfpSetLinkName({formName:this.id,tagInputName:t.tagId,tagLink1:BX.message("BX_FPD_LINK_1"),tagLink2:BX.message("BX_FPD_LINK_2")})}BX.bind(this.input,"keydown",BX.proxy(BX.SocNetLogDestination.BXfpSearchBefore,{formName:this.id,inputName:t.inputId}));this.auxObject={formName:this.id,inputNode:BX(t.inputId),tagInputName:t.tagId};BX.bind(this.input,"bxchange",BX.proxy(BX.SocNetLogDestination.BXfpSearch,this.auxObject));this.input.setAttribute("data-bxchangehandler","Y")}else if(e.showSearchInput){if(!this.options.lazyLoad){this.initDialog()}}if(this.items.hidden){for(var o in this.items.hidden){if(this.items.hidden.hasOwnProperty(o)){this.callback.select.apply({id:(typeof this.items.hidden[o]["PREFIX"]!="undefined"?this.items.hidden[o]["PREFIX"]:"SG")+this.items.hidden[o]["ID"],name:this.items.hidden[o]["NAME"]},typeof this.items.hidden[o]["TYPE"]!="undefined"?this.items.hidden[o]["TYPE"]:"sonetgroups","",true,"","init")}}}},show:function(){this.initDialog()},initDialog:function(t){if(typeof t=="undefined"||typeof t.realParams=="undefined"){t=null}if(this.blockInit){return}var e={id:this.id};if(!this.initialized){BX.onCustomEvent(window,"BX.Main.Selector:beforeInitDialog",[e])}setTimeout(BX.delegate(function(){if(typeof e.blockInit=="undefined"||e.blockInit!==true){if(this.initialized){if(!this.mainPopupWindow||!this.mainPopupWindow.isShown()){this.openDialog(t)}}else{this.getData(BX.delegate(function(e){if(!!this.openDialogWhenInit){this.openDialog(t)}BX.onCustomEvent(window,"BX.Main.Selector:afterInitDialog",[{id:this.id}]);if(typeof this.options.eventOpen!="undefined"){BX.addCustomEvent(window,this.options.eventOpen,BX.delegate(function(t){if(typeof t.id=="undefined"||t.id!=this.id){return}if(t.bindNode){var e=BX.findChild(t.bindNode,{tagName:"input",attr:{type:"text"}},true);if(e){BX.bind(e,"keydown",BX.proxy(BX.SocNetLogDestination.BXfpSearchBefore,{formName:this.id,inputName:null,inputNode:e}));this.auxObject={formName:this.id,inputNode:e,tagInputName:t.tagId};BX.SocNetLogDestination.obElementBindMainPopup[this.id].node=e;BX.SocNetLogDestination.obElementBindSearchPopup[this.id].node=e;if(e.getAttribute("data-bxchangehandler")!=="Y"){BX.bind(e,"bxchange",BX.proxy(BX.SocNetLogDestination.BXfpSearch,this.auxObject));BX.SocNetLogDestination.obItemsSelected[this.id]={};e.setAttribute("data-bxchangehandler","Y")}if(typeof t.value!="undefined"){BX.SocNetLogDestination.obItemsSelected[this.id]=t.value}}this.openDialog({bindNode:t.bindNode})}},this))}},this))}}},this),1)},openDialog:function(t){BX.SocNetLogDestination.openDialog(this.id,t);this.mainPopupWindow=BX.SocNetLogDestination.popupWindow},closeDialog:function(){BX.SocNetLogDestination.closeDialog()},getData:function(t){this.blockInit=true;BX.ajax({url:"/bitrix/components/bitrix/main.ui.selector/ajax.php",method:"POST",dataType:"json",data:{sessid:BX.bitrix_sessid(),site:BX.message("SITE_ID"),options:this.options,action:"getData"},onsuccess:BX.delegate(function(e){this.blockInit=false;if(!!e.SUCCESS){this.addData(e.DATA,t);this.initialized=true}},this),onfailure:BX.delegate(function(t){this.blockInit=false},this)})},addData:function(t,e){function i(t,e){if(typeof e!="undefined"){if(typeof t=="undefined"){t={}}for(var i in e){if(e.hasOwnProperty(i)){t[i]=e[i]}}}}i(BX.SocNetLogDestination.obItems[this.id]["groups"],t.ITEMS.GROUPS);i(BX.SocNetLogDestination.obItems[this.id]["users"],t.ITEMS.USERS);i(BX.SocNetLogDestination.obItems[this.id]["emails"],t.ITEMS.EMAILS);i(BX.SocNetLogDestination.obItems[this.id]["crmemails"],t.ITEMS.CRMEMAILS);i(BX.SocNetLogDestination.obItems[this.id]["sonetgroups"],t.ITEMS.SONETGROUPS);i(BX.SocNetLogDestination.obItems[this.id]["department"],t.ITEMS.DEPARTMENT);BX.SocNetLogDestination.obItems[this.id]["departmentRelation"]=BX.SocNetLogDestination.buildDepartmentRelation(BX.SocNetLogDestination.obItems[this.id]["department"]);BX.SocNetLogDestination.obItemsLast[this.id]["users"]=typeof t["ITEMS_LAST"]["USERS"]!="undefined"?t["ITEMS_LAST"]["USERS"]:{};BX.SocNetLogDestination.obItemsLast[this.id]["emails"]=typeof t["ITEMS_LAST"]["EMAILS"]!="undefined"?t["ITEMS_LAST"]["EMAILS"]:{};BX.SocNetLogDestination.obItemsLast[this.id]["crmemails"]=typeof t["ITEMS_LAST"]["CRMEMAILS"]!="undefined"?t["ITEMS_LAST"]["CRMEMAILS"]:{};BX.SocNetLogDestination.obItemsLast[this.id]["sonetgroups"]=typeof t["ITEMS_LAST"]["SONETGROUPS"]!="undefined"?t["ITEMS_LAST"]["SONETGROUPS"]:{};BX.SocNetLogDestination.obItemsLast[this.id]["department"]=typeof t["ITEMS_LAST"]["DEPARTMENT"]!="undefined"?t["ITEMS_LAST"]["DEPARTMENT"]:{};BX.SocNetLogDestination.obItemsLast[this.id]["groups"]=typeof t["ITEMS_LAST"]["GROUPS"]!="undefined"?t["ITEMS_LAST"]["GROUPS"]:{};if(typeof t.ITEMS_LAST.CRM!="undefined"&&t.ITEMS_LAST.CRM.length>0){BX.SocNetLogDestination.obCrmFeed[this.id]=true}if(typeof t.SONETGROUPS_LIMITED!="undefined"&&t.SONETGROUPS_LIMITED=="Y"){BX.SocNetLogDestination.obAllowSonetGroupsAjaxSearch[this.id]=true}BX.SocNetLogDestination.obDestSort[this.id]=t.DEST_SORT;e.apply(this,t)},getId:function(){return this.id},getOption:function(t){return typeof this.options[t]!="undefined"?this.options[t]:null}}})();
/* End */
;
; /* Start:"a:4:{s:4:"full";s:88:"/bitrix/components/bitrix/search.tags.input/templates/.default/script.js?154412744813020";s:6:"source";s:72:"/bitrix/components/bitrix/search.tags.input/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
var Errors = {
	"result_unval" : "Error in result",
	"result_empty" : "Empty result"
};

function JsTc(oHandler, sParams, sParser) // TC = TagCloud
{
	var t = this;

	t.oObj = typeof oHandler == 'object' ? oHandler : document.getElementById("TAGS");
	t.sParams = sParams;
	// Arrays for data
	if (sParser)
	{
		t.sExp = new RegExp("["+sParser+"]+", "i");
	}
	else
	{
		t.sExp = new RegExp(",");
	}
	t.oLast = {"str":false, "arr":false};
	t.oThis = {"str":false, "arr":false};
	t.oEl = {"start":false, "end":false};
	t.oUnfinedWords = {};
	// Flags
	t.bReady = true;
	t.eFocus = true;
	// Array with results & it`s showing
	t.aDiv = null;
	t.oDiv = null;
	// Pointers
	t.oActive = null;
	t.oPointer = [];
	t.oPointer_default = [];
	t.oPointer_this = 'input_field';

	t.oObj.onblur = function()
	{
		t.eFocus = false;
	};

	t.oObj.onfocus = function()
	{
		if (!t.eFocus)
		{
			t.eFocus = true;
			setTimeout(function(){t.CheckModif('focus')}, 500);
		}
	};

	t.oLast["arr"] = t.oObj.value.split(t.sExp);
	t.oLast["str"] = t.oLast["arr"].join(":");

	setTimeout(function(){t.CheckModif('this')}, 500);

	this.CheckModif = function(__data)
	{
		var
			sThis = false, tmp = 0,
			bUnfined = false, word = "",
			cursor = {};

		if (!t.eFocus)
			return;

		if (t.bReady && t.oObj.value.length > 0)
		{
			// Preparing input data
			t.oThis["arr"] = t.oObj.value.split(t.sExp);
			t.oThis["str"] = t.oThis["arr"].join(":");

			// Getting modificated element
			if (t.oThis["str"] && (t.oThis["str"] != t.oLast["str"]))
			{
				cursor['position'] = TCJsUtils.getCursorPosition(t.oObj);
				if (cursor['position']['end'] > 0 && !t.sExp.test(t.oObj.value.substr(cursor['position']['end']-1, 1)))
				{
					cursor['arr'] = t.oObj.value.substr(0, cursor['position']['end']).split(t.sExp);
					sThis = t.oThis["arr"][cursor['arr'].length - 1];

					t.oEl['start'] = cursor['position']['end'] - cursor['arr'][cursor['arr'].length - 1].length;
					t.oEl['end'] = t.oEl['start'] + sThis.length;
					t.oEl['content'] = sThis;

					t.oLast["arr"] = t.oThis["arr"];
					t.oLast["str"] = t.oThis["str"];
				}
			}
			if (sThis)
			{
				// Checking for UnfinedWords
				for (tmp = 2; tmp <= sThis.length; tmp++)
				{
					word = sThis.substr(0, tmp);
					if (t.oUnfinedWords[word] == '!fined')
					{
						bUnfined = true;
						break;
					}
				}
				if (!bUnfined)
					t.Send(sThis);
			}
		}
		setTimeout(function(){t.CheckModif('this')}, 500);
	};

	t.Send = function(sSearch)
	{
		if (!sSearch)
			return false;

		var oError = [];
		t.bReady = false;
		if (BX('wait_container'))
		{
			BX('wait_container').innerHTML = BX.message('JS_CORE_LOADING');
			BX.show(BX('wait_container'));
		}
		BX.ajax.post(
			'/bitrix/components/bitrix/search.tags.input/search.php',
			{"search":sSearch, "params":t.sParams},
			function(data)
			{
				var result = {};
				t.bReady = true;

				try
				{
					eval("result = " + data + ";");
				}
				catch(e)
				{
					oError['result_unval'] = e;
				}

				if (TCJsUtils.empty(result))
					oError['result_empty'] = Errors['result_empty'];

				try
				{
					if (TCJsUtils.empty(oError) && (typeof result == 'object'))
					{
						if (!(result.length == 1 && result[0]['NAME'] == t.oEl['content']))
						{
							t.Show(result);
							return;
						}
					}
					else
					{
						t.oUnfinedWords[t.oEl['content']] = '!fined';
					}
				}
				catch(e)
				{
					oError['unknown_error'] = e;
				}

				if(BX('wait_container'))
					BX.hide(BX('wait_container'));
			}
		);
	};

	t.Show = function(result)
	{
		t.Destroy();
		t.oDiv = document.body.appendChild(document.createElement("DIV"));
		t.oDiv.id = t.oObj.id+'_div';

		t.oDiv.className = "search-popup";
		t.oDiv.style.position = 'absolute';

		t.aDiv = t.Print(result);
		var pos = TCJsUtils.GetRealPos(t.oObj);
		t.oDiv.style.width = parseInt(pos["width"]) + "px";
		TCJsUtils.show(t.oDiv, pos["left"], pos["bottom"]);
		TCJsUtils.addEvent(document, "click", t.CheckMouse);
		TCJsUtils.addEvent(document, "keydown", t.CheckKeyword);
	};

	t.Print = function(aArr)
	{
		var aEl = null;
		var aResult = [];
		var aRes = [];
		var iCnt = 0;
		var oDiv = null;
		var oSpan = null;
		var sPrefix = t.oDiv.id;

		for (var tmp_ in aArr)
		{
			// Math
			if (aArr.hasOwnProperty(tmp_))
			{
				aEl = aArr[tmp_];
				aRes = [];
				aRes['ID'] = (aEl['ID'] && aEl['ID'].length > 0) ? aEl['ID'] : iCnt++;
				aRes['GID'] = sPrefix + '_' + aRes['ID'];
				aRes['NAME'] = TCJsUtils.htmlspecialcharsEx(aEl['NAME']);
				aRes['~NAME'] = aEl['NAME'];
				aRes['CNT'] = aEl['CNT'];
				aResult[aRes['GID']] = aRes;
				t.oPointer.push(aRes['GID']);
				// Graph
				oDiv = t.oDiv.appendChild(document.createElement("DIV"));
				oDiv.id = aRes['GID'];
				oDiv.name = sPrefix + '_div';

				oDiv.className = 'search-popup-row';

				oDiv.onmouseover = function(){t.Init(); this.className='search-popup-row-active';};
				oDiv.onmouseout = function(){t.Init(); this.className='search-popup-row';};
				oDiv.onclick = function(e){
						t.oActive = this.id;
						t.Replace();
						t.Destroy();
						BX.PreventDefault(e);
					};

				oSpan = oDiv.appendChild(document.createElement("DIV"));
				oSpan.id = oDiv.id + '_NAME';
				oSpan.className = "search-popup-el search-popup-el-cnt";
				oSpan.innerHTML = aRes['CNT'];

				oSpan = oDiv.appendChild(document.createElement("DIV"));
				oSpan.id = oDiv.id + '_NAME';
				oSpan.className = "search-popup-el search-popup-el-name";
				oSpan.innerHTML = aRes['NAME'];
			}
		}
		t.oPointer.push('input_field');
		t.oPointer_default = t.oPointer;
		return aResult;
	};

	t.Destroy = function()
	{
		try
		{
			TCJsUtils.hide(t.oDiv);
			t.oDiv.parentNode.removeChild(t.oDiv);
		}
		catch(e)
		{}
		t.aDiv = [];
		t.oPointer = [];
		t.oPointer_default = [];
		t.oPointer_this = 'input_field';
		t.bReady = true;
		t.eFocus = true;
		t.oActive = null;

		TCJsUtils.removeEvent(document, "click", t.CheckMouse);
		TCJsUtils.removeEvent(document, "keydown", t.CheckKeyword);
	};

	t.Replace = function()
	{
		if (typeof t.oActive == 'string')
		{
			var tmp = t.aDiv[t.oActive];
			var tmp1 = '';
			if (typeof tmp == 'object')
			{
				var elEntities = document.createElement("textarea");
				elEntities.innerHTML = tmp['~NAME'];
				tmp1 = elEntities.value;
			}
			//this preserves leading spaces
			var start = t.oEl['start'];
			while(start < t.oObj.value.length && t.oObj.value.substring(start, start+1) == " ")
				start++;

			t.oObj.value = t.oObj.value.substring(0, start) + tmp1 + t.oObj.value.substr(t.oEl['end']);
			TCJsUtils.setCursorPosition(t.oObj, start + tmp1.length);
		}
	};

	t.Init = function()
	{
		t.oActive = false;
		t.oPointer = t.oPointer_default;
		t.Clear();
		t.oPointer_this = 'input_pointer';
	};

	t.Clear = function()
	{
		var oEl = t.oDiv.getElementsByTagName("div");
		if (oEl.length > 0 && typeof oEl == 'object')
		{
			for (var ii in oEl)
			{
				if (oEl.hasOwnProperty(ii))
				{
					var oE = oEl[ii];
					if (oE && (typeof oE == 'object') && (oE.name == t.oDiv.id + '_div'))
					{
						oE.className = "search-popup-row";
					}
				}
			}
		}
	};

	t.CheckMouse = function()
	{
		t.Replace();
		t.Destroy();
	};

	t.CheckKeyword = function(e)
	{
		if (!e)
			e = window.event;
		var oP = null;
		var oEl = null;
		if ((37 < e.keyCode && e.keyCode <41) || (e.keyCode == 13))
		{
			t.Clear();

			switch (e.keyCode)
			{
				case 38:
					oP = t.oPointer.pop();
					if (t.oPointer_this == oP)
					{
						t.oPointer.unshift(oP);
						oP = t.oPointer.pop();
					}

					if (oP != 'input_field')
					{
						t.oActive = oP;
						oEl = document.getElementById(oP);
						if (typeof oEl == 'object')
						{
							oEl.className = "search-popup-row-active";
						}
					}
					t.oPointer.unshift(oP);
					break;
				case 40:
					oP = t.oPointer.shift();
					if (t.oPointer_this == oP)
					{
						t.oPointer.push(oP);
						oP = t.oPointer.shift();
					}
					if (oP != 'input_field')
					{
						t.oActive = oP;
						oEl = document.getElementById(oP);
						if (typeof oEl == 'object')
						{
							oEl.className = "search-popup-row-active";
						}
					}
					t.oPointer.push(oP);
					break;
				case 39:
					t.Replace();
					t.Destroy();
					break;
				case 13:
					t.Replace();
					t.Destroy();
					if (TCJsUtils.IsIE())
					{
						e.returnValue = false;
						e.cancelBubble = true;
					}
					else
					{
						e.preventDefault();
						e.stopPropagation();
					}
					break;
			}
			t.oPointer_this	= oP;
		}
		else
		{
			t.Destroy();
		}
	}
}

var TCJsUtils =
{
	arEvents:  [],

	addEvent: function(el, evname, func)
	{
		if(el.attachEvent) // IE
			el.attachEvent("on" + evname, func);
		else if(el.addEventListener) // Gecko / W3C
			el.addEventListener(evname, func, false);
		else
			el["on" + evname] = func;
		this.arEvents[this.arEvents.length] = {'element': el, 'event': evname, 'fn': func};
	},

	removeEvent: function(el, evname, func)
	{
		if(el.detachEvent) // IE
			el.detachEvent("on" + evname, func);
		else if(el.removeEventListener) // Gecko / W3C
			el.removeEventListener(evname, func, false);
		else
			el["on" + evname] = null;
	},

	getCursorPosition: function(oObj)
	{
		var result = {'start': 0, 'end': 0};
		if (!oObj || (typeof oObj != 'object'))
			return result;
		try
		{
			if (document.selection != null && oObj.selectionStart == null)
			{
				oObj.focus();
				var oRange = document.selection.createRange();
				var oParent = oRange.parentElement();
				var sBookmark = oRange.getBookmark();
				var sContents_ = oObj.value;
				var sContents = sContents_;
				var sMarker = '__' + Math.random() + '__';

				while(sContents.indexOf(sMarker) != -1)
				{
					sMarker = '__' + Math.random() + '__';
				}

				if (!oParent || oParent == null || (oParent.type != "textarea" && oParent.type != "text"))
				{
					return result;
				}

				oRange.text = sMarker + oRange.text + sMarker;
				sContents = oObj.value;
				result['start'] = sContents.indexOf(sMarker);
				sContents = sContents.replace(sMarker, "");
				result['end'] = sContents.indexOf(sMarker);
				oObj.value = sContents_;
				oRange.moveToBookmark(sBookmark);
				oRange.select();
				return result;
			}
			else
			{
				return {
					'start': oObj.selectionStart,
					'end': oObj.selectionEnd
				};
			}
		}
		catch(e){}
		return result;
	},

	setCursorPosition: function(oObj, iPosition)
	{
		if (typeof oObj != 'object')
			return false;

		oObj.focus();

		try
		{
			if (document.selection != null && oObj.selectionStart == null)
			{
				var oRange = document.selection.createRange();
				oRange.select();
			}
			else
			{
				oObj.selectionStart = iPosition;
				oObj.selectionEnd = iPosition;
			}
			return true;
		}
		catch(e)
		{
			return false;
		}
	},

	printArray: function (oObj, sParser, iLevel)
	{
		try
		{
			var result = '';
			var space = '';

			if (iLevel==undefined)
				iLevel = 0;
			if (!sParser)
				sParser = "\n";

			for (var j=0; j<=iLevel; j++)
				space += '  ';

			for (var i in oObj)
			{
				if (oObj.hasOwnProperty(i))
				{
					if (typeof oObj[i] == 'object')
						result += space+i + " = {"+ sParser + TCJsUtils.printArray(oObj[i], sParser, iLevel+1) + ", " + sParser + "}" + sParser;
					else
						result += space+i + " = " + oObj[i] + "; " + sParser;
				}
			}
			return result;
		}
		catch(e)
		{
		}
	},

	empty: function(oObj)
	{
		if (oObj)
		{
			for (var i in oObj)
			{
				if (oObj.hasOwnProperty(i))
				{
					return false;
				}
			}
		}
		return true;
	},

	show: function(oDiv, iLeft, iTop)
	{
		if (typeof oDiv != 'object')
			return;
		var zIndex = parseInt(oDiv.style.zIndex);
		if(zIndex <= 0 || isNaN(zIndex))
			zIndex = 2200;
		oDiv.style.zIndex = zIndex;
		oDiv.style.left = iLeft + "px";
		oDiv.style.top = iTop + "px";
		return oDiv;
	},

	hide: function(oDiv)
	{
		if (oDiv)
			oDiv.style.display = 'none';
	},

	GetRealPos: function(el)
	{
		if(!el || !el.offsetParent)
			return false;

		var res = {};
		var objParent = el.offsetParent;
		res["left"] = el.offsetLeft;
		res["top"] = el.offsetTop;
		while(objParent && objParent.tagName != "BODY")
		{
			res["left"] += objParent.offsetLeft;
			res["top"] += objParent.offsetTop;
			objParent = objParent.offsetParent;
		}
		res["right"]=res["left"] + el.offsetWidth;
		res["bottom"]=res["top"] + el.offsetHeight;
		res["width"]=el.offsetWidth;
		res["height"]=el.offsetHeight;

		return res;
	},

	IsIE: function()
	{
		return (document.attachEvent && !TCJsUtils.IsOpera());
	},

	IsOpera: function()
	{
		return (navigator.userAgent.toLowerCase().indexOf('opera') != -1);
	},

	htmlspecialcharsEx: function(str)
	{
		return str.replace(/&amp;/g, '&amp;amp;').replace(/&lt;/g, '&amp;lt;').replace(/&gt;/g, '&amp;gt;').replace(/&quot;/g, '&amp;quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	},

	htmlspecialcharsback: function(str)
	{
		return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;;/g, '"').replace(/&amp;/g, '&');
	}
};

/* End */
;; /* /bitrix/components/bitrix/socialnetwork.admin.set/templates/.default/script.js?15441274532527*/
; /* /bitrix/components/bitrix/socialnetwork.group_create.ex/templates/.default/script.min.js?154412745426625*/
; /* /bitrix/components/bitrix/main.file.input/templates/.default/script.min.js?15441273849095*/
; /* /bitrix/components/bitrix/main.ui.selector/templates/.default/script.min.js?154412738410379*/
; /* /bitrix/components/bitrix/search.tags.input/templates/.default/script.js?154412744813020*/
