
; /* Start:"a:4:{s:4:"full";s:82:"/bitrix/components/bitrix/tasks.report/templates/.default/script.js?15441274613687";s:6:"source";s:67:"/bitrix/components/bitrix/tasks.report/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
var filterResponsiblePopup;

function clearUser(e) {
	if(!e) e = window.event;

	BX.findPreviousSibling(this, {tagName : "input"}).value = "";
	var parent = this.parentNode.parentNode;
	var input = BX.findNextSibling(parent, {tagName : "input"})
	window[input.name.replace("F_", "O_FILTER_")].unselect(input.value);
	input.value = "0";
	BX.addClass(parent, "webform-field-textbox-empty");

	BX.PreventDefault(e);
}

var tasksReportDefaultTemplateInit = function() {

	BX.bind(BX("filter-date-interval-calendar-from"), "click", function(e) {
		if (!e) e = window.event;

		var curDate = new Date();
		var curTimestamp = Math.round(curDate / 1000) - curDate.getTimezoneOffset()*60;
		var nodeId = this;
		//jsCal endar. Show(this, "F_DATE_FROM", "F_DATE_FROM", "task-filter-form", true, curTimestamp, '', false);
		BX.calendar({
			node: nodeId, 
			field: "F_DATE_FROM", 
			form: "task-filter-form", 
			bTime: true, 
			currentTime: curTimestamp, 
			bHideTimebar: false,
			callback: function() {
				BX.removeClass(nodeId.parentNode.parentNode, "webform-field-textbox-empty");
			}
		});

		BX.PreventDefault(e);
	});

	BX.bind(BX("filter-date-interval-calendar-to"), "click", function(e) {
		if (!e) e = window.event;

		var curDate = new Date();
		var curTimestamp = Math.round(curDate / 1000) - curDate.getTimezoneOffset()*60;
		var nodeId = this;
		//jsCal endar. Show(this, "F_DATE_TO", "F_DATE_TO", "task-filter-form", true, curTimestamp, '', false);
		BX.calendar({
			node: nodeId, 
			field: "F_DATE_TO", 
			form: "task-filter-form", 
			bTime: true, 
			currentTime: curTimestamp, 
			bHideTimebar: false,
			callback: function() {
				BX.removeClass(nodeId.parentNode.parentNode, "webform-field-textbox-empty");
			}
		});

		BX.PreventDefault(e);
	});

	BX.bind(BX("filter-field-employee"), "click", function(e) {

		if(!e) e = window.event;

		filterResponsiblePopup = BX.PopupWindowManager.create("filter-responsible-employee-popup", this.parentNode, {
			offsetTop : 1,
			autoHide : true,
			content : BX("FILTER_RESPONSIBLE_ID_selector_content")
		});

		filterResponsiblePopup.show();

		BX.addCustomEvent(filterResponsiblePopup, "onPopupClose", onFilterResponsibleClose);

		this.value = "";
		BX.focus(this);

		BX.PreventDefault(e);
	});
	BX.bind(BX.findNextSibling(BX("filter-field-employee"), {tagName : "a"}), "click", clearUser);

	BX.bind(BX("filter-field-group"), "click", function(e) {

		if(!e) e = window.event;

		groupsPopup.show();

		BX.PreventDefault(e);
	});
	BX.bind(BX.findNextSibling(BX("filter-field-group"), {tagName : "a"}), "click", function(e){
		if(!e) e = window.event;

		var parent = this.parentNode.parentNode;
		var input = BX.findNextSibling(parent, {tagName : "input"})
		groupsPopup.deselect(input.value);
		input.value = "0";
		BX.addClass(parent, "webform-field-textbox-empty");

		BX.PreventDefault(e);
	});
};

function SortTable(url, e)
{
	if(!e) e = window.event;
	window.location = url;
	BX.PreventDefault(e);
}

function onFilterResponsibleSelect(arUser)
{
	document.forms["task-filter-form"]["F_RESPONSIBLE_ID"].value = arUser.id;

	BX.removeClass(BX("filter-field-employee").parentNode.parentNode, "webform-field-textbox-empty");

	filterResponsiblePopup.close();
}

function onFilterGroupSelect(arGroups)
{
	if (arGroups[0])
	{
		document.forms["task-filter-form"]["F_GROUP_ID"].value = arGroups[0].id;

		BX.removeClass(BX("filter-field-group").parentNode.parentNode, "webform-field-textbox-empty");
	}
}

function onFilterResponsibleClose()
{
	var emp = O_FILTER_RESPONSIBLE_ID.arSelected.pop();
	if (emp)
	{
		O_FILTER_RESPONSIBLE_ID.arSelected.push(emp);
		O_FILTER_RESPONSIBLE_ID.searchInput.value = emp.name;
	}
}
/* End */
;
; /* Start:"a:4:{s:4:"full";s:95:"/bitrix/components/bitrix/tasks.interface.topmenu/templates/.default/script.min.js?154412746160";s:6:"source";s:78:"/bitrix/components/bitrix/tasks.interface.topmenu/templates/.default/script.js";s:3:"min";s:82:"/bitrix/components/bitrix/tasks.interface.topmenu/templates/.default/script.min.js";s:3:"map";s:82:"/bitrix/components/bitrix/tasks.interface.topmenu/templates/.default/script.map.js";}"*/
BX.namespace("BX.Tasks");
/* End */
;
; /* Start:"a:4:{s:4:"full";s:96:"/bitrix/components/bitrix/tasks.interface.topmenu/templates/.default/logic.min.js?15441274611848";s:6:"source";s:77:"/bitrix/components/bitrix/tasks.interface.topmenu/templates/.default/logic.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
"use strict";BX.namespace("Tasks.Component");(function(){if(typeof BX.Tasks.Component.TopMenu!="undefined"){return}BX.Tasks.Component.TopMenu=BX.Tasks.Component.extend({sys:{code:"topmenu"},methodsStatic:{instances:{},getInstance:function(t){return BX.Tasks.Component.TopMenu.instances[t]},addInstance:function(t,e){BX.Tasks.Component.TopMenu.instances[t]=e}},methods:{construct:function(){this.callConstruct(BX.Tasks.Component);BX.Tasks.Component.TopMenu.addInstance(this.sys.code,this)},bindEvents:function(){var t=this;try{var e=this.option("use_ajax_filter")?this.scope().getElementsByClassName("tasks_role_link"):{};if(e.length){for(var n=0;n<e.length;n++){BX.bind(e[n],"click",function(t){BX.PreventDefault(t);var e=this.dataset.id=="view_all"?"":this.dataset.id;var n=this.dataset.url;BX.onCustomEvent("Tasks.TopMenu:onItem",[e,n]);var s=this.parentElement.getElementsByClassName("tasks_role_link");if(s.length){for(var a=0;a<s.length;a++){BX.removeClass(s[a],"main-buttons-item-active")}}BX.addClass(this,"main-buttons-item-active")})}}}catch(t){}BX.addCustomEvent("BX.Main.Filter:apply",function(t,e,n,s,a){var o=n.getFilterFieldsValues();var i=o.ROLEID;try{var r=BX.Tasks.Component.TopMenu.getInstance("topmenu").scope();var l=r.querySelectorAll(".tasks_role_link");for(var c=0;c<l.length;c++){BX.removeClass(l[c],"main-buttons-item-active")}if(!i){i="view_all"}BX.addClass(BX("tasks_panel_menu_"+i),"main-buttons-item-active");var u=BX.Tasks.Component.TasksToolbar.getInstance();u.getToolbarData(i,function(){u.render()})}catch(t){}})},spotLightInit:function(){var t=this;var e=BX("tasks_panel_menu_more_button");var n=BX("tasks_panel_menu_view_effective");if(n){var s=new BX.SpotLight({id:"tasks_sl_effective",targetElement:n,content:t.option("text_sl_effective"),targetVertex:"middle-center",autoSave:true});s.show()}}}})}).call(this);
/* End */
;
; /* Start:"a:4:{s:4:"full";s:102:"/bitrix/components/bitrix/socialnetwork.group.selector/templates/.default/script.min.js?15441274546649";s:6:"source";s:83:"/bitrix/components/bitrix/socialnetwork.group.selector/templates/.default/script.js";s:3:"min";s:87:"/bitrix/components/bitrix/socialnetwork.group.selector/templates/.default/script.min.js";s:3:"map";s:87:"/bitrix/components/bitrix/socialnetwork.group.selector/templates/.default/script.map.js";}"*/
(function(t){var e={};BX.GroupsPopup={searchTimeout:null,oXHR:null,create:function(t,i,o){if(!e[t])e[t]=new s(t,i,o);return e[t]},abortSearchRequest:function(){if(this.oXHR){this.oXHR.abort()}}};var s=function(e,s,i){this.tabs=[];this.items2Objects=[];this.selected=[];this.lastGroups=[];this.myGroups=[];this.featuresPerms=null;var o=[];if(i){if(i.lastGroups){this.lastGroups=i.lastGroups}if(i.myGroups){this.myGroups=i.myGroups}if(i.featuresPerms){this.featuresPerms=i.featuresPerms}if(i.events){for(var a in i.events){if(i.events.hasOwnProperty(a)){BX.addCustomEvent(this,a,i.events[a])}}}if(i.selected&&i.selected.length){this.selected=i.selected;BX.onCustomEvent(this,"onGroupSelect",[this.selected,{onInit:true}])}if(i.searchInput){this.searchInput=i.searchInput}else{this.searchInput=BX.create("input",{props:{className:"bx-finder-box-search-textbox"}});o.push(BX.create("div",{props:{className:"bx-finder-box-search"},style:{},children:[this.searchInput]}))}}BX.adjust(this.searchInput,{events:{keyup:BX.proxy(function(e){if(!e)e=t.event;this.search((e.target||e.srcElement).value)},this),focus:function(){this.value=""},blur:BX.proxy(function(){setTimeout(BX.proxy(function(){if(this.selected[0]){this.searchInput.value=this.selected[0].title}},this),150)},this)}});this.ajaxURL="/bitrix/components/bitrix/socialnetwork.group.selector/ajax.php";if(this.lastGroups.length>0){this.addTab("last",this.lastGroups)}if(this.myGroups.length>0){this.addTab("my",this.myGroups)}this.addTab("search");this.tabsOuter=BX.create("div",{props:{className:"bx-finder-box-tabs"}});this.tabsContentOuter=BX.create("td",{props:{className:"bx-finder-box-tabs-content-cell"}});o.splice(o.length,0,this.tabsOuter,BX.create("div",{props:{className:"popup-window-hr popup-window-buttons-hr"},html:"<i></i>"}),BX.create("div",{props:{className:"bx-finder-box-tabs-content"},children:[BX.create("table",{props:{className:"bx-finder-box-tabs-content-table"},children:[BX.create("tr",{children:[this.tabsContentOuter]})]})]}));this.content=BX.create("div",{props:{className:"bx-finder-box bx-lm-box sonet-groups-finder-box"},style:{padding:"2px 6px 6px 6px",minWidth:"500px"},children:o});this.popupWindow=BX.PopupWindowManager.create(e,s,{content:"",autoHide:true,events:{onPopupFirstShow:BX.proxy(function(t){t.setContent(this.content)},this),onPopupShow:BX.proxy(function(t){this.__render()},this)},buttons:[new BX.PopupWindowButton({text:BX.message("SONET_GROUP_BUTTON_CLOSE"),className:"popup-window-button-accept task-edit-popup-close-but",events:{click:function(){this.popupWindow.close()}}})]})};s.prototype.show=function(){this.popupWindow.show();this.searchInput.focus()};s.prototype.selectTab=function(t){for(var e in this.tabs){if(this.tabs.hasOwnProperty(e)){BX.removeClass(this.tabs[e].tab,"bx-finder-box-tab-selected");BX.adjust(this.tabs[e].content,{style:{display:"none"}})}}BX.addClass(t.tab,"bx-finder-box-tab-selected");BX.adjust(t.content,{style:{display:"block"}})};s.prototype.addTab=function(t,e,s){var i=BX.create("div",{props:{className:"bx-finder-box-tab-content bx-lm-box-tab-content-sonetgroup"}});if(s){BX.adjust(i,{style:{display:"block"}})}var o=BX.create("span",{props:{className:"bx-finder-box-tab"+(s?" bx-finder-box-tab-selected":"")},text:BX.message("SONET_GROUP_TABS_"+t.toUpperCase())});this.tabs[t]={tab:o,content:i};BX.adjust(this.tabs[t].tab,{events:{click:BX.proxy(function(){this.selectTab(this.tabs[t])},this)}});if(e){this.setItems(this.tabs[t],e)}};s.prototype.setItems=function(t,e){BX.cleanNode(t.content);if(!!e){for(var s=0,i=e.length;s<i;s++){t.content.appendChild(this.__renderItem(e[s]))}}};s.prototype.select=function(t){this.selected=[t];var e=0;var s=0;clearTimeout(BX.GroupsPopup.searchTimeout);if(this.items2Objects[t.id]){for(e=0,s=this.items2Objects[t.id].length;e<s;e++){BX.addClass(this.items2Objects[t.id][e],"bx-finder-box-item-t7-selected")}}BX.onCustomEvent(this,"onGroupSelect",[this.selected,{onInit:false}]);var i=[t.id];for(e=0,s=this.lastGroups.length;e<s;e++){if(!BX.util.in_array(this.lastGroups[e].id,i)){i.push(this.lastGroups[e].id)}}BX.userOptions.save("socialnetwork","groups_popup","last_selected",i.slice(0,10));if(this.selected[0]){this.searchInput.value=this.selected[0].title}this.popupWindow.close()};s.prototype.deselect=function(t){this.selected=[];if(t&&this.items2Objects[t]){for(var e=0,s=this.items2Objects[t].length;e<s;e++){BX.removeClass(this.items2Objects[t][e],"bx-finder-box-item-t7-selected")}}this.searchInput.value=""};s.prototype.search=function(t){if(t.length>0){clearTimeout(BX.GroupsPopup.searchTimeout);BX.GroupsPopup.abortSearchRequest();this.selectTab(this.tabs["search"]);var e=this.ajaxURL+"?mode=search&SITE_ID="+__bx_group_site_id+"&query="+encodeURIComponent(t);if(this.featuresPerms){e+="&features_perms[0]="+encodeURIComponent(this.featuresPerms[0]);e+="&features_perms[1]="+encodeURIComponent(this.featuresPerms[1])}BX.GroupsPopup.searchTimeout=setTimeout(BX.delegate(function(){BX.GroupsPopup.oXHR=BX.ajax.loadJSON(e,BX.proxy(function(t){this.setItems(this.tabs["search"],t)},this))},this),1e3)}else{clearTimeout(BX.GroupsPopup.searchTimeout)}};s.prototype.__render=function(){var t=false;BX.cleanNode(this.tabsOuter);BX.cleanNode(this.tabsContentOuter);for(var e in this.tabs){if(this.tabs.hasOwnProperty(e)){if(!t){t=BX.hasClass(this.tabs[e].tab,"bx-finder-box-tab-selected")}this.tabsOuter.appendChild(this.tabs[e].tab);this.tabsContentOuter.appendChild(this.tabs[e].content)}}if(!t){this.selectTab(this.tabs["last"]||this.tabs["my"]||this.tabs["search"])}};s.prototype.__renderItem=function(t){var e=BX.create("div",{props:{className:"bx-finder-box-item-t7-avatar bx-finder-box-item-t7-group-avatar"}});if(t.image){BX.adjust(e,{style:{background:"url('"+t.image+"') no-repeat center center",backgroundSize:"24px 24px"}})}var s=false;for(var i=0;i<this.selected.length;i++){if(this.selected[i].id==t.id){s=true;break}}var o=BX.create("div",{props:{className:"bx-finder-box-item-t7 bx-finder-element bx-lm-element-sonetgroup"+(typeof t.IS_EXTRANET!="undefined"&&t.IS_EXTRANET=="Y"?" bx-lm-element-extranet":"")+(s?" bx-finder-box-item-t7-selected":"")},children:[e,BX.create("div",{props:{className:"bx-finder-box-item-t7-space"}}),BX.create("div",{props:{className:"bx-finder-box-item-t7-info"},children:[BX.create("div",{text:t.title,props:{className:"bx-finder-box-item-t7-name"}})]})],events:{click:BX.proxy(function(){this.select(t)},this)}});if(!this.items2Objects[t.id]){this.items2Objects[t.id]=[o]}else if(!BX.util.in_array(o,this.items2Objects[t.id])){this.items2Objects[t.id].push(o)}return o}})(window);
/* End */
;
; /* Start:"a:4:{s:4:"full";s:92:"/bitrix/components/bitrix/tasks.user.selector/templates/.default/users.min.js?15441274618623";s:6:"source";s:73:"/bitrix/components/bitrix/tasks.user.selector/templates/.default/users.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
function TasksUsers(e,s,a){this.name=e;this.multiple=s;this.arSelected=[];this.bSubordinateOnly=a;this.ajaxUrl=""}TasksUsers.arEmployees={};TasksUsers.arEmployeesData={};TasksUsers.prototype.load=function(e,s,a){function t(s){TasksUsers.arEmployees[e]=s;this.show(e)}if(null==s)s=false;if(null==a)a=false;if(e!="extranet")e=parseInt(e);var r=BX(this.name+"_employee_section_"+e);if(!r.BX_LOADED){if(TasksUsers.arEmployees[e]!=null){this.show(e)}else{var n=this.ajaxUrl+"&MODE=EMPLOYEES&SECTION_ID="+e;BX.ajax.loadJSON(n,BX.proxy(t,this))}}if(a){BX(this.name+"_employee_search_layout").scrollTop=r.offsetTop-40}BX.toggleClass(r,"company-department-opened");BX.toggleClass(BX(this.name+"_children_"+e),"company-department-children-opened")};TasksUsers.prototype.show=function(e){var s=BX(this.name+"_employee_section_"+e);var a=TasksUsers.arEmployees[e];s.BX_LOADED=true;var t=BX(this.name+"_employees_"+e);if(t){t.innerHTML="";for(var r=0;r<a.length;r++){var n;var l=false;TasksUsers.arEmployeesData[a[r].ID]={id:a[r].ID,name:a[r].NAME,sub:a[r].SUBORDINATE=="Y"?true:false,sup:a[r].SUPERORDINATE=="Y"?true:false,position:a[r].WORK_POSITION,photo:a[r].PHOTO};var i=BX.create("input",{props:{className:"tasks-hidden-input"}});if(this.multiple){i.name=this.name+"[]";i.type="checkbox"}else{i.name=this.name;i.type="radio"}var o=document.getElementsByName(i.name);var p=0;while(!l&&p<o.length){if(o[p].value==a[r].ID&&o[p].checked){l=true}p++}i.value=a[r].ID;n=BX.create("div",{props:{className:"company-department-employee"+(l?" company-department-employee-selected":"")},events:{click:BX.proxy(this.select,this)},children:[i,BX.create("div",{props:{className:"company-department-employee-avatar"},style:{background:a[r].PHOTO?"url('"+a[r].PHOTO+"') no-repeat center center":""}}),BX.create("div",{props:{className:"company-department-employee-icon"}}),BX.create("div",{props:{className:"company-department-employee-info"},children:[BX.create("div",{props:{className:"company-department-employee-name"},text:BX.util.htmlspecialcharsback(a[r].NAME)}),BX.create("div",{props:{className:"company-department-employee-position"},html:!a[r].HEAD&&!a[r].WORK_POSITION?"&nbsp;":BX.util.htmlspecialchars(a[r].WORK_POSITION)+(a[r].HEAD&&a[r].WORK_POSITION?", ":"")+(a[r].HEAD?BX.message("TASKS_EMP_HEAD"):"")})]})]});t.appendChild(n)}}};TasksUsers.prototype.select=function(e){var s;var a=0;var t=e.target||e.srcElement;if(e.currentTarget){s=e.currentTarget}else{s=t;while(!BX.hasClass(s,"finder-box-item")&&!BX.hasClass(s,"company-department-employee")){s=s.parentNode}}var r=BX.findChild(s,{tag:"input"});if(!this.multiple){var n=document.getElementsByName(this.name);for(var a=0;a<n.length;a++){if(n[a].value!=r.value){BX.removeClass(n[a].parentNode,BX.hasClass(n[a].parentNode,"finder-box-item")?"finder-box-item-selected":"company-department-employee-selected")}else{BX.addClass(n[a].parentNode,BX.hasClass(n[a].parentNode,"finder-box-item")?"finder-box-item-selected":"company-department-employee-selected")}}r.checked=true;BX.addClass(s,BX.hasClass(s,"finder-box-item")?"finder-box-item-selected":"company-department-employee-selected");var l=BX.findChild(s,{tag:"DIV",className:"finder-box-item-text"},true)||BX.findChild(s,{tag:"DIV",className:"company-department-employee-name"},true);var i=BX.util.htmlspecialcharsback(l.innerHTML);this.searchInput.value=i;this.arSelected=[];this.arSelected[r.value]={id:r.value,name:i,sub:TasksUsers.arEmployeesData[r.value].sub,sup:TasksUsers.arEmployeesData[r.value].sup,position:TasksUsers.arEmployeesData[r.value].position,photo:TasksUsers.arEmployeesData[r.value].photo}}else{var n=document.getElementsByName(this.name+"[]");if(!BX.util.in_array(r,n)){r.checked=false;BX.toggleClass(r.parentNode,BX.hasClass(r.parentNode,"finder-box-item")?"finder-box-item-selected":"company-department-employee-selected")}for(var a=0;a<n.length;a++){if(n[a].value==r.value){n[a].checked=false;BX.toggleClass(n[a].parentNode,BX.hasClass(n[a].parentNode,"finder-box-item")?"finder-box-item-selected":"company-department-employee-selected")}}if(BX.hasClass(r.parentNode,"finder-box-item-selected")||BX.hasClass(r.parentNode,"company-department-employee-selected")){r.checked=true}if(r.checked){var o=BX.findChild(BX(this.name+"_selected_users"),{className:"finder-box-selected-items"});if(!BX(this.name+"_employee_selected_"+r.value)){var p=BX.create("DIV");p.id=this.name+"_employee_selected_"+r.value;p.className="finder-box-selected-item";var l=BX.findChild(s,{tag:"DIV",className:"finder-box-item-text"},true)||BX.findChild(s,{tag:"DIV",className:"company-department-employee-name"},true);p.innerHTML='<div class="finder-box-selected-item-icon" onclick="O_'+this.name+".unselect("+r.value+', this);"></div><span class="finder-box-selected-item-text">'+l.innerHTML+"</span>";o.appendChild(p);var c=BX(this.name+"_current_count");c.innerHTML=parseInt(c.innerHTML)+1;this.arSelected[r.value]={id:r.value,name:BX.util.htmlspecialcharsback(l.innerHTML),sub:TasksUsers.arEmployeesData[r.value].sub,sup:TasksUsers.arEmployeesData[r.value].sup,position:TasksUsers.arEmployeesData[r.value].position,photo:TasksUsers.arEmployeesData[r.value].photo}}}else{BX.remove(BX(this.name+"_employee_selected_"+r.value));var c=BX(this.name+"_current_count");c.innerHTML=parseInt(c.innerHTML)-1;this.arSelected[r.value]=null}}if(!BX.util.in_array(r.value,TasksUsers.lastUsers)){TasksUsers.lastUsers.unshift(r.value);BX.userOptions.save("tasks","user_search","last_selected",TasksUsers.lastUsers.slice(0,10))}if(this.onSelect){var d=this.arSelected.pop();this.arSelected.push(d);this.onSelect(d)}if(this.onChange){this.onChange(this.arSelected)}};TasksUsers.prototype.unselect=function(e,s){var a=document.getElementsByName(this.name+(this.multiple?"[]":""));for(var t=0;t<a.length;t++){if(a[t].value==e){a[t].checked=false;BX.removeClass(a[t].parentNode,BX.hasClass(a[t].parentNode,"finder-box-item")?"finder-box-item-selected":"company-department-employee-selected")}}if(this.multiple){if(s){BX.remove(s.parentNode)}var r=BX(this.name+"_current_count");r.innerHTML=parseInt(r.innerHTML)-1}this.arSelected[e]=null;if(this.onChange){this.onChange(this.arSelected)}};TasksUsers.prototype.search=function(e){if(!e)e=window.event;function s(e){this.showResults(e)}if(this.searchInput.value.length>0){this.displayTab("search");var a=this.ajaxUrl+"&MODE=SEARCH&SEARCH_STRING="+encodeURIComponent(this.searchInput.value);if(this.bSubordinateOnly){a+="&S_ONLY=Y"}BX.ajax.loadJSON(a,BX.proxy(s,this))}};TasksUsers.prototype.showResults=function(e){var s=e;var a=BX(this.name+"_search");var t=a.getElementsByTagName("input");for(var r=0,n=t.length;r<n;r++){if(t[r].checked){BX(this.name+"_last").appendChild(t[r])}}if(a){a.innerHTML="";var l=BX.create("table",{props:{className:"finder-box-tab-columns",cellspacing:"0"},children:[BX.create("tbody")]});var i=BX.create("tr");l.firstChild.appendChild(i);var o=BX.create("td");i.appendChild(o);a.appendChild(l);for(var r=0;r<s.length;r++){var p;var c=false;TasksUsers.arEmployeesData[s[r].ID]={id:s[r].ID,name:s[r].NAME,sub:s[r].SUBORDINATE=="Y"?true:false,sup:s[r].SUPERORDINATE=="Y"?true:false,position:s[r].WORK_POSITION,photo:s[r].PHOTO};var d=BX.create("input",{props:{className:"tasks-hidden-input"}});if(this.multiple){d.name=this.name+"[]";d.type="checkbox"}else{d.name=this.name;d.type="radio"}var t=document.getElementsByName(d.name);var m=0;while(!c&&m<t.length){if(t[m].value==s[r].ID&&t[m].checked){c=true}m++}d.value=s[r].ID;var h=s[r].NAME;var u="finded_anchor_user_id_"+s[r].ID;p=BX.create("div",{props:{className:"finder-box-item"+(c?" finder-box-item-selected":""),id:u},attrs:{"bx-tooltip-user-id":s[r].ID},events:{click:BX.proxy(this.select,this)},children:[d,BX.create("div",{props:{className:"finder-box-item-text"},text:h}),BX.create("div",{props:{className:"finder-box-item-icon"}})]});o.appendChild(p);if(r==Math.ceil(s.length/2)-1){o=BX.create("td");l.firstChild.appendChild(o)}}}};TasksUsers.prototype.displayTab=function(e){BX.removeClass(BX(this.name+"_last"),"finder-box-tab-content-selected");BX.removeClass(BX(this.name+"_search"),"finder-box-tab-content-selected");BX.removeClass(BX(this.name+"_structure"),"finder-box-tab-content-selected");BX.addClass(BX(this.name+"_"+e),"finder-box-tab-content-selected");BX.removeClass(BX(this.name+"_tab_last"),"finder-box-tab-selected");BX.removeClass(BX(this.name+"_tab_search"),"finder-box-tab-selected");BX.removeClass(BX(this.name+"_tab_structure"),"finder-box-tab-selected");BX.addClass(BX(this.name+"_tab_"+e),"finder-box-tab-selected")};TasksUsers.prototype._onFocus=function(){this.searchInput.value=""};
/* End */
;; /* /bitrix/components/bitrix/tasks.report/templates/.default/script.js?15441274613687*/
; /* /bitrix/components/bitrix/tasks.interface.topmenu/templates/.default/script.min.js?154412746160*/
; /* /bitrix/components/bitrix/tasks.interface.topmenu/templates/.default/logic.min.js?15441274611848*/
; /* /bitrix/components/bitrix/socialnetwork.group.selector/templates/.default/script.min.js?15441274546649*/
; /* /bitrix/components/bitrix/tasks.user.selector/templates/.default/users.min.js?15441274618623*/

//# sourceMappingURL=page_4703f4c8fc66423b59f0a97c2737c248.map.js