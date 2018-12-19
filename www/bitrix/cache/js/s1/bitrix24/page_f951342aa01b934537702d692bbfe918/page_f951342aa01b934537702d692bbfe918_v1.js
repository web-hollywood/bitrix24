
; /* Start:"a:4:{s:4:"full";s:82:"/bitrix/components/bitrix/meeting.edit/templates/.default/script.js?15441274347628";s:6:"source";s:67:"/bitrix/components/bitrix/meeting.edit/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
window.saveTimer = null;

if (!window.listItemParams)
{
	window.listItemParams = {
		isItem: {property: 'BXLISTITEM'},
		getData: function() {
			if (!this.BXLISTCOUNER)
				this.BXLISTCOUNER = BX.findChild(this, {className: 'meet-ag-block-title-num'}, true)

			return {
				counter: this.BXLISTCOUNER,
				children: this.nextSibling
			}
		},
		getCounterValue: function(num, prefix)
		{
			if (prefix)
			{
				prefix = prefix.substring(0, prefix.length - 6);
				if (prefix && prefix.charAt(prefix.length-1) != '.')
				{
					prefix += '.';
				}
			}

			return (prefix || '') + num + (prefix ? '' : '.') + '&nbsp;';
		}
	};
}

function getUserUrl(id)
{
	return window.bx_user_url_tpl.replace(/#user_id#|#id#/i, id);
}


function BXOnMembersListChange()
{
	window.arMembersList = arguments[0];

	if (!window.meeting_owner_data)
		window.meeting_owner_data = window.arMembersList[window.meeting_owner];
	else if (!window.arMembersList[window.meeting_owner])
		window.arMembersList[window.meeting_owner] = window.meeting_owner_data;

	BX.onCustomEvent('onMeetingChangeUsersList', []);
	BX.onCustomEvent('onMembersListChange', [BX.util.array_values(window.arMembersList)]);
}

function BXSelectMembers(el)
{
	if (!window.BXMembersSelector)
	{
		window.BXMembersSelector = BX.PopupWindowManager.create("members-popup", el, {
			offsetTop : 1,
			autoHide : true,
			content : BX("USERS_selector_content")
		});
	}

	if (window.BXMembersSelector.popupContainer.style.display != "block")
	{
		window.BXMembersSelector.show();
	}
}

function BXSelectKeepers(el)
{
	var a = BX.util.array_values(window.arMembersList);
	UpdateKeepersList(a);

	if (!window.BXKeeperSelector)
	{
		window.BXKeeperSelector = BX.PopupWindowManager.create("keepers-popup", el, {
			offsetTop : 1,
			autoHide : true,
			content : BX("keeper_selector_content")
		});
	}

	if (window.BXKeeperSelector.popupContainer.style.display != "block" && a.length > 1)
	{
		window.BXKeeperSelector.show();
	}
}

function meetingAction(id, params)
{
	var p = {r: Math.random(), MEETING_ID:id};
	if (params && params.state)
		p.STATE = params.state;

	p.sessid = BX.bitrix_sessid();
	BX.ajax.loadJSON('/bitrix/tools/ajax_meeting.php', p, meetingHandler);
}

function meetingHandler(params)
{
	switch (params.state)
	{
		case 'A':
			switchView('protocol');
		case 'C':
			BX('switcher').style.display = 'block';
		break;
		case 'P':
			BX('switcher').style.display = 'none';
			switchView('agenda');
		break;
	}

	BX('meeting_state_text').innerHTML = BX.message('MEETING_STATE_' + params.state);
	BX('meeting_toolbar').className = 'meeting-toolbar toolbar-' + params.state;
}

function switchView(type)
{
	window.current_view = type;

	if (type == 'agenda')
	{
		BX.addClass(BX('switch_agenda', true), 'meeting-tab-active');
		BX.removeClass(BX('switch_protocol', true), 'meeting-tab-active');
		BX.removeClass(BX('agenda_block'), 'meeting-detail-agenda-protocol-active');
	}
	else
	{
		BX.removeClass(BX('switch_agenda', true), 'meeting-tab-active');
		BX.addClass(BX('switch_protocol', true), 'meeting-tab-active');
		BX.addClass(BX('agenda_block'), 'meeting-detail-agenda-protocol-active');
	}

	updateIndexes();

	if (jsDD)
		jsDD.refreshDestArea();
}

var updTimer = null;
function updateIndexes()
{
	if (updTimer)
		clearTimeout(updTimer);
	updTimer = setTimeout("updateListNumbers()", 30);
}

function updateListNumbers()
{
	BX.listNumber(window.listItemParams);
}

function saveData(bTimeout)
{
	if (!!window.BXMEETINGCANEDIT)
	{
		if (window.saveTimer)
			clearTimeout(window.saveTimer);

		if (!bTimeout)
		{
			window.saveTimer = setTimeout("saveData(true)", 1000);
		}
		else
		{
			var f = document.forms.meeting_edit
			if (f.MEETING_ID.value > 0)
			{
				f.save_type.value = 'BGSAVE';
				BX.ajax.submit(f);
				setTimeout(function(){
					f.save_type.value = 'SUBMIT';
				}, 15);
			}
		}
	}
}

function replaceKeys(repl, link)
{
	var i,j,row,subrows,arFields = ['AGENDA', 'AGENDA_PARENT', 'AGENDA_ORIGINAL', 'AGENDA_TYPE', 'AGENDA_TITLE', 'AGENDA_TASK', 'AGENDA_DEADLINE', 'AGENDA_SORT', 'AGENDA_ITEM'];

	var ie7 = false;
	/*@cc_on
		 @if (@_jscript_version <= 5.7)
			ie7 = true;
		/*@end
	@*/

	for (i in repl)
	{
		if (!repl[i])
			continue;

		if (document.forms.meeting_edit['AGENDA['+i+']'])
		{
			row = BX('agenda_item_' + i);
			if (row)
			{
				row.BXINSTANCEKEY = row.BXINSTANCE.ID = repl[i][0];
				row.BXINSTANCE.ITEM_ID = repl[i][1];

				row.id = 'agenda_item_' + repl[i][0];
				row.nextSibling.id = 'agenda_blocks_' + repl[i][0];

				BX('agenda_item_comments_'+i).id = 'agenda_item_comments_'+repl[i][0];

				document.forms.meeting_edit['AGENDA['+i+']'].value = repl[i][0];
				document.forms.meeting_edit['AGENDA_ITEM['+i+']'].value = repl[i][1];

				for (j = 0; j < arFields.length; j++)
				{
					if (document.forms.meeting_edit[arFields[j]+'['+i+']'])
					{
						document.forms.meeting_edit[arFields[j]+'['+i+']'].name = arFields[j]+'['+repl[i][0]+']';
						if (ie7)
						{
							document.forms.meeting_edit[arFields[j]+'['+repl[i][0]+']'] = document.forms.meeting_edit[arFields[j]+'['+i+']']
						}
					}
				}
				document.forms.meeting_edit['AGENDA_RESPONSIBLE['+i+'][]'].name = 'AGENDA_RESPONSIBLE['+repl[i][0]+'][]';
				if (ie7)
				{
					document.forms.meeting_edit['AGENDA_RESPONSIBLE['+repl[i][0]+'][]'] = document.forms.meeting_edit['AGENDA_RESPONSIBLE['+i+'][]']
				}

				var link_href = link.replace('#ITEM_ID#', repl[i][1]),
					icons = BX.findChild(row, {tag: 'DIV', className: 'meeting-ag-info-icons'}, true),
					anchor = BX.findChild(row, {tag: 'A', className: 'meeting-ag-block-title-text'}, true),
					anchor_tasks = BX.findChild(row, {tag: 'A', className: 'meeting-ag-tasks-ic'}, true);

				if (icons) icons.style.display = 'block';
				if (anchor) anchor.href = link_href;
				if (anchor_tasks) anchor_tasks.href = link_href + '#tasks';

				subrows = BX.findChildren(row.nextSibling, listItemParams.isItem);

				if (subrows && subrows.length > 0)
				{
					for (j = 0; j < subrows.length; j++)
					{
						subrows[j].BXINSTANCE.INSTANCE_PARENT_ID = repl[i][0];
						document.forms.meeting_edit['AGENDA_PARENT['+subrows[j].BXINSTANCEKEY+']'].value = repl[i][0];
					}
				}
			}
		}
	}
}

function replaceTasks(tasks)
{
	var i,j,q,row;
	for (i in tasks)
	{
		row = BX('agenda_item_' + i);
		if (row)
		{
			row.BXINSTANCE.AGENDA_TASK_CHECKED = false;
			if (tasks[i])
			{
				row.BXINSTANCE.TASKS_COUNT[0]++;
				row.BXINSTANCE.TASKS_COUNT[1]++;
				row.BXINSTANCE.TASK_ID = tasks[i];
				row.BXINSTANCE.TASK_ACCESS = true;
			}
			else
			{
				row.BXINSTANCE.TASK_ID = null;
			}

			if (window.currently_edited_row != row)
			{
				viewRow(row, false)
			}
			else
			{
				BX.addClass(BX('meeting_make_task_'+i), 'meeting-has-task');
				BX('meeting_make_task_'+i).setAttribute('onclick', 'taskIFramePopup.tasksList=[]; taskIFramePopup.view('+tasks[i]+');');
			}

			q = document.forms.meeting_edit['AGENDA_TASK['+row.BXINSTANCEKEY+']'];
			if (q && q.length > 1)
			{
				for (j=0;j<q.length;j++)
				{
					if (q[j].value != 'Y')
					{
						q[j].parentNode.removeChild(q[j]);
					}
				}
			}
		}
	}
}

function meetingOnTaskDeleted(task_id)
{
	var r = BX('meeting_task_' + task_id);
	if (r)
	{
		row = BX.findParent(r, listItemParams.isItem);
		if (row)
		{
			row.BXINSTANCE.TASK_ID = null;
			row.BXINSTANCE.AGENDA_TASK_CHECKED = false;

			if (window.currently_edited_row != row)
			{
				viewRow(row, false);
			}
			else
			{
				BX.removeClass(BX('meeting_make_task_'+i), 'meeting-has-task');
			}
		}
	}
}
BX.addCustomEvent('onTaskDeleted', meetingOnTaskDeleted);
/* End */
;
; /* Start:"a:4:{s:4:"full";s:100:"/bitrix/components/bitrix/intranet.user.selector.new/templates/.default/users.min.js?154412742413982";s:6:"source";s:80:"/bitrix/components/bitrix/intranet.user.selector.new/templates/.default/users.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function(){if(window.IntranetUsers)return;window.IntranetUsers=function(e,t,a){this.name=e;this.multiple=t;this.arSelected=[];this.arFixed=[];this.bSubordinateOnly=a;this.ajaxUrl="";this.lastSearchTime=0};IntranetUsers.arStructure={};IntranetUsers.bSectionsOnly=false;IntranetUsers.arEmployees={group:{}};IntranetUsers.arEmployeesData={};IntranetUsers.ajaxUrl="";IntranetUsers.prototype.loadGroup=function(e){var t=BX(this.name+"_group_section_"+e);function a(t){IntranetUsers.arEmployees["group"][e]=t;this.show(e,t,"g")}e=parseInt(e);if(IntranetUsers.arEmployees["group"][e]!=null){this.show(e,IntranetUsers.arEmployees["group"][e],"g")}else{var s=this.getAjaxUrl()+"&MODE=EMPLOYEES&GROUP_ID="+e;BX.ajax.loadJSON(s,BX.proxy(a,this))}BX.toggleClass(t,"company-department-opened");BX.toggleClass(BX(this.name+"_gchildren_"+e),"company-department-children-opened")};IntranetUsers.prototype.load=function(e,t,a,s){this.bSectionsOnly=s;function n(t){IntranetUsers.arStructure[e]=t.STRUCTURE;IntranetUsers.arEmployees[e]=t.USERS;this.show(e,false,"",this.bSectionsOnly)}if(null==t)t=false;if(null==a)a=false;if(null==s)s=false;if(e!="extranet")e=parseInt(e);var r=BX(this.name+"_employee_section_"+e);if(!r.BX_LOADED){if(IntranetUsers.arEmployees[e]!=null){this.show(e,false,"",this.bSectionsOnly)}else{var i=this.getAjaxUrl()+"&MODE=EMPLOYEES&SECTION_ID="+e;BX.ajax.loadJSON(i,BX.proxy(n,this))}}if(a){BX(this.name+"_employee_search_layout").scrollTop=r.offsetTop-40}BX.toggleClass(r,"company-department-opened");BX.toggleClass(BX(this.name+"_children_"+e),"company-department-children-opened")};IntranetUsers.prototype.show=function(e,t,a,s){s=!!s;a=a||"";var n=BX(this.name+"_"+a+"employee_section_"+e);var r=t||IntranetUsers.arEmployees[e];if(n!==null){n.BX_LOADED=true}var i=BX(this.name+"_"+a+"employees_"+e);if(i){if(IntranetUsers.arStructure[e]!=null&&!a){var l=IntranetUsers.arStructure[e];var o=BX(this.name+"_"+a+"children_"+e);if(o){for(var c=0;c<l.length;c++){obSectionRow1=BX.create("div",{props:{className:"company-department"},children:[s?BX.create("span",{props:{className:"company-department-inner",id:this.name+"_employee_section_"+l[c].ID},children:[BX.create("div",{props:{className:"company-department-arrow"},attrs:{onclick:"O_"+this.name+".load("+l[c].ID+", false, false, true)"}}),BX.create("div",{props:{className:"company-department-text"},attrs:{"data-section-id":l[c].ID,onclick:"O_"+this.name+".selectSection("+this.name+"_employee_section_"+l[c].ID+")"},text:l[c].NAME})]}):BX.create("span",{props:{className:"company-department-inner",id:this.name+"_employee_section_"+l[c].ID},attrs:{onclick:"O_"+this.name+".load("+l[c].ID+")"},children:[BX.create("div",{props:{className:"company-department-arrow"}}),BX.create("div",{props:{className:"company-department-text"},text:l[c].NAME})]})]});obSectionRow2=BX.create("div",{props:{className:"company-department-children",id:this.name+"_children_"+l[c].ID},children:[BX.create("div",{props:{className:"company-department-employees",id:this.name+"_employees_"+l[c].ID},children:[BX.create("span",{props:{className:"company-department-employees-loading"},text:BX.message("INTRANET_EMP_WAIT")})]})]});o.appendChild(obSectionRow1);o.appendChild(obSectionRow2)}o.appendChild(i)}}i.innerHTML="";for(var c=0;c<r.length;c++){var p;var d=false;IntranetUsers.arEmployeesData[r[c].ID]={id:r[c].ID,name:r[c].NAME,sub:r[c].SUBORDINATE=="Y"?true:false,sup:r[c].SUPERORDINATE=="Y"?true:false,position:r[c].WORK_POSITION,photo:r[c].PHOTO};var m=BX.create("input",{props:{className:"intranet-hidden-input"}});if(this.multiple){m.name=this.name+"[]";m.type="checkbox"}else{m.name=this.name;m.type="radio"}var h=document.getElementsByName(m.name);var u=0;while(!d&&u<h.length){if(h[u].value==r[c].ID&&h[u].checked){d=true}u++}m.value=r[c].ID;p=BX.create("div",{props:{className:"company-department-employee"+(d?" company-department-employee-selected":"")},events:{click:BX.proxy(this.select,this)},children:[m,BX.create("div",{props:{className:"company-department-employee-avatar"},style:{background:r[c].PHOTO?"url('"+r[c].PHOTO+"') no-repeat center center":"",backgroundSize:r[c].PHOTO?"cover":""}}),BX.create("div",{props:{className:"company-department-employee-icon"}}),BX.create("div",{props:{className:"company-department-employee-info"},children:[BX.create("div",{props:{className:"company-department-employee-name"},text:r[c].NAME}),BX.create("div",{props:{className:"company-department-employee-position"},html:!r[c].HEAD&&!r[c].WORK_POSITION?"&nbsp;":BX.util.htmlspecialchars(r[c].WORK_POSITION)+(r[c].HEAD&&r[c].WORK_POSITION?", ":"")+(r[c].HEAD?BX.message("INTRANET_EMP_HEAD"):"")})]})]});i.appendChild(p)}}};IntranetUsers.prototype.select=function(e){var t;var a=0;var s=e.target||e.srcElement;if(e.currentTarget){t=e.currentTarget}else{t=s;while(!BX.hasClass(t,"finder-box-item")&&!BX.hasClass(t,"company-department-employee")){t=t.parentNode}}var n=BX.findChild(t,{tag:"input"});if(!this.multiple){var r=document.getElementsByName(this.name);for(var a=0;a<r.length;a++){if(r[a].value!=n.value){BX.removeClass(r[a].parentNode,BX.hasClass(r[a].parentNode,"finder-box-item")?"finder-box-item-selected":"company-department-employee-selected")}else{BX.addClass(r[a].parentNode,BX.hasClass(r[a].parentNode,"finder-box-item")?"finder-box-item-selected":"company-department-employee-selected")}}n.checked=true;BX.addClass(t,BX.hasClass(t,"finder-box-item")?"finder-box-item-selected":"company-department-employee-selected");this.searchInput.value=IntranetUsers.arEmployeesData[n.value].name;this.arSelected=[];this.arSelected[n.value]={id:n.value,name:IntranetUsers.arEmployeesData[n.value].name,sub:IntranetUsers.arEmployeesData[n.value].sub,sup:IntranetUsers.arEmployeesData[n.value].sup,position:IntranetUsers.arEmployeesData[n.value].position,photo:IntranetUsers.arEmployeesData[n.value].photo}}else{var r=document.getElementsByName(this.name+"[]");if(!BX.util.in_array(n,r)&&!BX.util.in_array(n.value,this.arFixed)){n.checked=false;BX.toggleClass(n.parentNode,BX.hasClass(n.parentNode,"finder-box-item")?"finder-box-item-selected":"company-department-employee-selected")}for(var a=0;a<r.length;a++){if(r[a].value==n.value&&!BX.util.in_array(n.value,this.arFixed)){r[a].checked=false;BX.toggleClass(r[a].parentNode,BX.hasClass(r[a].parentNode,"finder-box-item")?"finder-box-item-selected":"company-department-employee-selected")}}if(BX.hasClass(n.parentNode,"finder-box-item-selected")||BX.hasClass(n.parentNode,"company-department-employee-selected")){n.checked=true}if(n.checked){var i=BX.findChild(BX(this.name+"_selected_users"),{className:"finder-box-selected-items"});if(!BX(this.name+"_employee_selected_"+n.value)){var l=BX.create("DIV");l.id=this.name+"_employee_selected_"+n.value;l.className="finder-box-selected-item";var o=BX.findChild(t,{tag:"DIV",className:"finder-box-item-text"},true)||BX.findChild(t,{tag:"DIV",className:"company-department-employee-name"},true);l.innerHTML='<div class="finder-box-selected-item-icon" id="'+this.name+"-user-selector-unselect-"+n.value+'" onclick="O_'+this.name+".unselect("+n.value+', this);"></div><span class="finder-box-selected-item-text">'+o.innerHTML+"</span>";i.appendChild(l);var c=BX(this.name+"_current_count");c.innerHTML=parseInt(c.innerHTML)+1;this.arSelected[n.value]={id:n.value,name:IntranetUsers.arEmployeesData[n.value].name,sub:IntranetUsers.arEmployeesData[n.value].sub,sup:IntranetUsers.arEmployeesData[n.value].sup,position:IntranetUsers.arEmployeesData[n.value].position,photo:IntranetUsers.arEmployeesData[n.value].photo}}}else{BX.remove(BX(this.name+"_employee_selected_"+n.value));var c=BX(this.name+"_current_count");c.innerHTML=parseInt(c.innerHTML)-1;this.arSelected[n.value]=null}}var p=BX.util.array_search(n.value,IntranetUsers.lastUsers);if(p>=0)IntranetUsers.lastUsers.splice(p,1);IntranetUsers.lastUsers.unshift(n.value);BX.userOptions.save("intranet","user_search","last_selected",IntranetUsers.lastUsers.slice(0,10));if(this.onSelect){var d=this.arSelected.pop();this.arSelected.push(d);this.onSelect(d)}BX.onCustomEvent(this,"on-change",[this.toObject(this.arSelected)]);if(this.onChange){this.onChange(this.arSelected)}};IntranetUsers.prototype.toObject=function(e){var t={};for(var a in e){a=parseInt(a);if(typeof a=="number"&&e[a]!==null){t[a]=BX.clone(e[a])}}return t};IntranetUsers.prototype.selectSection=function(e){var t=BX(e);if(!t){return false}else{var a=BX.findChild(t,{tag:"div",className:"company-department-text"});if(a){if(this.onSectionSelect){this.onSectionSelect({id:a.getAttribute("data-section-id"),name:a.innerHTML})}}}};IntranetUsers.prototype.unselect=function(e){var t=BX(this.name+"-user-selector-unselect-"+e);var a=document.getElementsByName(this.name+(this.multiple?"[]":""));for(var s=0;s<a.length;s++){if(a[s].value==e){a[s].checked=false;BX.removeClass(a[s].parentNode,BX.hasClass(a[s].parentNode,"finder-box-item")?"finder-box-item-selected":"company-department-employee-selected")}}if(this.multiple){if(t){BX.remove(t.parentNode)}var n=BX(this.name+"_current_count");n.innerHTML=parseInt(n.innerHTML)-1}this.arSelected[e]=null;BX.onCustomEvent(this,"on-change",[this.toObject(this.arSelected)]);if(this.onChange){this.onChange(this.arSelected)}};IntranetUsers.prototype.getSelected=function(){return this.arSelected};IntranetUsers.prototype.setSelected=function(e){for(var t=0,a=this.arSelected.length;t<a;t++){if(this.arSelected[t]&&this.arSelected[t].id)this.unselect(this.arSelected[t].id)}if(!this.multiple){e=[e[0]]}this.arSelected=[];for(var t=0,a=e.length;t<a;t++){this.arSelected[e[t].id]=e[t];var s=BX.create("input",{props:{className:"intranet-hidden-input",value:e[t].id,checked:"checked",name:this.name+(this.multiple?"[]":"")}});BX(this.name+"_last").appendChild(s);if(this.multiple){var n=BX.findChild(BX(this.name+"_selected_users"),{className:"finder-box-selected-items"});var r=BX.create("div",{props:{className:"finder-box-selected-item",id:this.name+"_employee_selected_"+e[t].id},html:'<div class="finder-box-selected-item-icon" id="'+this.name+"-user-selector-unselect-"+e[t].id+'" onclick="O_'+this.name+".unselect("+e[t].id+', this);"></div><span class="finder-box-selected-item-text">'+BX.util.htmlspecialchars(e[t].name)+"</span>"});n.appendChild(r)}var i=document.getElementsByName(this.name+(this.multiple?"[]":""));for(var l=0;l<i.length;l++){if(i[l].value==e[t].id){BX.toggleClass(i[l].parentNode,BX.hasClass(i[l].parentNode,"finder-box-item")?"finder-box-item-selected":"company-department-employee-selected")}}}if(this.multiple){BX.adjust(BX(this.name+"_current_count"),{text:e.length})}};IntranetUsers.prototype.setFixed=function(e){if(typeof e!="object")e=[];this.arFixed=e;var t=BX.findChildren(BX(this.name+"_selected_users"),{className:"finder-box-selected-item-icon"},true);for(i=0;i<t.length;i++){var a=t[i].id.replace(this.name+"-user-selector-unselect-","");BX.adjust(t[i],{style:{visibility:BX.util.in_array(a,this.arFixed)?"hidden":"visible"}})}};IntranetUsers.prototype.search=function(e){this.searchRqstTmt=clearTimeout(this.searchRqstTmt);if(typeof this.searchRqst=="object"){this.searchRqst.abort();this.searchRqst=false}if(!e)e=window.event;if(this.searchInput.value.length>0){this.displayTab("search");var t=this.getAjaxUrl()+"&MODE=SEARCH&SEARCH_STRING="+encodeURIComponent(this.searchInput.value);if(this.bSubordinateOnly)t+="&S_ONLY=Y";var a=this;this.searchRqstTmt=setTimeout(function(){var e=(new Date).getTime();a.lastSearchTime=e;a.searchRqst=BX.ajax.loadJSON(t,BX.proxy(function(t){if(a.lastSearchTime==e)a.showResults(t)},a))},400)}};IntranetUsers.prototype.showResults=function(e){var t=e;var a=BX(this.name+"_search");var s=a.getElementsByTagName("input");var n=null;for(n=0,count=s.length;n<count;n++){if(s[n].checked){BX(this.name+"_last").appendChild(s[n])}}if(a){a.innerHTML="";var r=BX.create("table",{props:{className:"finder-box-tab-columns",cellspacing:"0"},children:[BX.create("tbody")]});var i=BX.create("tr");r.firstChild.appendChild(i);var l=BX.create("td");i.appendChild(l);a.appendChild(r);for(n=0;n<t.length;n++){var o;var c=false;IntranetUsers.arEmployeesData[t[n].ID]={id:t[n].ID,name:t[n].NAME,sub:t[n].SUBORDINATE=="Y"?true:false,sup:t[n].SUPERORDINATE=="Y"?true:false,position:t[n].WORK_POSITION,photo:t[n].PHOTO};var p=BX.create("input",{props:{className:"intranet-hidden-input"}});if(this.multiple){p.name=this.name+"[]";p.type="checkbox"}else{p.name=this.name;p.type="radio"}s=document.getElementsByName(p.name);var d=0;while(!c&&d<s.length){if(s[d].value==t[n].ID&&s[d].checked){c=true}d++}p.value=t[n].ID;var m=t[n].NAME;o=BX.create("div",{props:{className:"finder-box-item"+(c?" finder-box-item-selected":"")},events:{click:BX.proxy(this.select,this)},children:[p,BX.create("div",{props:{className:"finder-box-item-text"},attrs:{"bx-tooltip-user-id":t[n].ID,"bx-tooltip-classname":"intrantet-user-selector-tooltip"},text:m}),BX.create("div",{props:{className:"finder-box-item-icon"}})]});l.appendChild(o);if(n==Math.ceil(t.length/2)-1){l=BX.create("td");r.firstChild.appendChild(l)}}}};IntranetUsers.prototype.displayTab=function(e){BX.removeClass(BX(this.name+"_last"),"finder-box-tab-content-selected");BX.removeClass(BX(this.name+"_search"),"finder-box-tab-content-selected");BX.removeClass(BX(this.name+"_structure"),"finder-box-tab-content-selected");BX.removeClass(BX(this.name+"_groups"),"finder-box-tab-content-selected");BX.addClass(BX(this.name+"_"+e),"finder-box-tab-content-selected");BX.removeClass(BX(this.name+"_tab_last"),"finder-box-tab-selected");BX.removeClass(BX(this.name+"_tab_search"),"finder-box-tab-selected");BX.removeClass(BX(this.name+"_tab_structure"),"finder-box-tab-selected");BX.removeClass(BX(this.name+"_tab_groups"),"finder-box-tab-selected");BX.addClass(BX(this.name+"_tab_"+e),"finder-box-tab-selected")};IntranetUsers.prototype._onFocus=function(){this.searchInput.value=""};IntranetUsers.prototype.getAjaxUrl=function(){return this.ajaxUrl||IntranetUsers.ajaxUrl}})();
/* End */
;
; /* Start:"a:4:{s:4:"full";s:89:"/bitrix/components/bitrix/main.file.input/templates/.default/script.min.js?15441273849095";s:6:"source";s:70:"/bitrix/components/bitrix/main.file.input/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function(){var e=window.BX;if(e["MFInput"])return;var t={},i=function(){var i=function(i){try{this.params=i;this.controller=e("mfi-"+i.controlId);this.button=e("mfi-"+i.controlId+"-button");this.editor=null;if(e("mfi-"+i.controlId+"-editor")){this.editor=new e.AvatarEditor({enableCamera:i.enableCamera});e.addCustomEvent(this.editor,"onApply",e.delegate(this.addFile,this));e.bind(e("mfi-"+i.controlId+"-editor"),"click",e.delegate(this.editor.click,this.editor))}this.init(i);t[i.controlId]=this;this.template=e.message("MFI_THUMB2").replace("#input_name#",this.params.inputName);window["FILE_INPUT_"+i.controlId]=this;this.INPUT=e("file_input_"+i["controlId"])}catch(t){e.debug(t)}};i.prototype={init:function(t){this.agent=e.Uploader.getInstance({id:t["controlId"],CID:t["controlUid"],streams:1,uploadFormData:"N",uploadMethod:"immediate",uploadFileUrl:t["urlUpload"],allowUpload:t["allowUpload"],allowUploadExt:t["allowUploadExt"],uploadMaxFilesize:t["uploadMaxFilesize"],showImage:false,sortItems:false,input:e("file_input_"+t["controlId"]),dropZone:this.controller.parentNode,placeHolder:this.controller,fields:{thumb:{tagName:"",template:e.message("MFI_THUMB")}}});this.fileEvents={onFileIsAttached:e.delegate(this.onFileIsAttached,this),onFileIsAppended:e.delegate(this.onFileIsAppended,this),onFileIsBound:e.delegate(this.onFileIsBound,this),onFileIsReadyToFrame:e.delegate(this.onFileIsReadyToFrame,this),onUploadStart:e.delegate(this.onUploadStart,this),onUploadProgress:e.delegate(this.onUploadProgress,this),onUploadDone:e.delegate(this.onUploadDone,this),onUploadError:e.delegate(this.onUploadError,this),onUploadRestore:e.delegate(this.onUploadRestore,this)};e.addCustomEvent(this.agent,"onAttachFiles",e.delegate(this.onAttachFiles,this));e.addCustomEvent(this.agent,"onQueueIsChanged",e.delegate(this.onQueueIsChanged,this));e.addCustomEvent(this.agent,"onFileIsInited",e.delegate(this.onFileIsInited,this));e.addCustomEvent(this.agent,"onPackageIsInitialized",e.delegate(function(e){var t={mfi_mode:"upload",cid:this.agent.CID,moduleId:this.params["moduleId"],forceMd5:this.params["forceMd5"],allowUpload:this.agent.limits["allowUpload"],allowUploadExt:this.agent.limits["allowUploadExt"],uploadMaxFilesize:this.agent.limits["uploadMaxFilesize"],mfi_sign:this.params["controlSign"]},i;for(i in t){if(t.hasOwnProperty(i)&&t[i]){e.post.data[i]=t[i];e.post.size+=(i+"").length+(t[i]+"").length}}},this));var i=[],a=[],n,s,r=e.findChildren(this.controller,{tagName:"LI"});for(var o=0;o<r.length;o++){n=e.findChild(r[o],{attribute:{"data-bx-role":"file-name"}},true);s=e.findChild(r[o],{attribute:{"data-bx-role":"file-id"}},true);if(n&&s){i.push({name:n.innerHTML,file_id:s.value});a.push(r[o])}}this.agent.onAttach(i,a);this.inited=true;this.checkUploadControl()},checkUploadControl:function(){if(e(this.button)){if(!(this.params["maxCount"]>0&&this.params["maxCount"]<=this.agent.getItems().length)){this.button.removeAttribute("disable")}else if(this.params["maxCount"]==1){}else{this.button.setAttribute("disable","Y")}}},onQueueIsChanged:function(){if(this.params["maxCount"]>0){this.checkUploadControl()}},onAttachFiles:function(t){var i=false,a;if(t&&this.inited===true&&this.params["maxCount"]>0){if(this.params["maxCount"]==1&&t.length>0){while(this.agent.getItems().length>0){this.deleteFile(this.agent.getItems().getFirst(),false)}while(t.length>1)t.pop()}var n=this.params["maxCount"]-this.agent.getItems().length;n=n>0?n:0;while(t.length>n){t.pop();i=true}}if(i){this.onError("Too much files.")}e.onCustomEvent(this,"onFileUploaderChange",[t,this]);return t},onFileIsInited:function(t,i){for(var a in this["fileEvents"]){if(this["fileEvents"].hasOwnProperty(a))e.addCustomEvent(i,a,this["fileEvents"][a])}},onFileIsAppended:function(e,t){var i=this.agent.getItem(e);this.bindEventsHandlers(i.node,t)},onFileIsBound:function(e,t){var i=this.agent.getItem(e);this.bindEventsHandlers(i.node,t)},bindEventsHandlers:function(t,i){var a=e.findChild(t,{attribute:{"data-bx-role":"file-delete"}},true),n;if(a)e.bind(a,"click",e.proxy(function(){this.deleteFile(i)},this));a=e.findChild(t,{attribute:{"data-bx-role":"file-preview"}},true);if(a){a.removeAttribute("data-bx-role");if(i.file.parentCanvas){var s=e.UploaderUtils.scaleImage(i.file.parentCanvas,{width:100,height:100},"exact"),r=e.create("CANVAS",{props:{width:100,height:100}});a.appendChild(r);r.getContext("2d").drawImage(i.file.parentCanvas,s.source.x,s.source.y,s.source.width,s.source.height,0,0,s.destin.width,s.destin.height);i.canvas=r}}i.file.parentCanvas=null;a=e.findChild(t,{tagName:"A",attribute:{"data-bx-role":"file-name"}},true);if(a){if(this.editor&&((n=e.findChild(t,{tagName:"CANVAS"},true))&&n||(n=e.findChild(t,{tagName:"IMG"},true))&&n)){e.bind(a,"click",e.proxy(function(t){e.PreventDefault(t);this.editor.showFile({name:a.innerHTML,tmp_url:a.href});return false},this))}else if(a.getAttribute("href")==="#"){e.bind(a,"click",e.proxy(function(t){e.PreventDefault(t);return false},this))}}},addFile:function(e,t){e.name=e["name"]||"image.png";e.parentCanvas=t;this.agent.onAttach([e])},deleteFile:function(t){var i=t?this.agent.getItem(t.id):false;if(!i)return;t=i.item;var a=i.node;var n;if(t.file["justUploaded"]===true&&t.file["file_id"]>0){var s={fileID:t.file["file_id"],sessid:e.bitrix_sessid(),cid:this.agent.CID,mfi_mode:"delete"};e.ajax.post(this.agent.uploadFileUrl,s)}else{var r=a.parentNode.parentNode,o=e.findChild(a,{tagName:"INPUT",attribute:{"data-bx-role":"file-id"}},true);if(o){var l=o.name,d=o.value,h=l+"_del",p=this.agent.id+"_deleted[]";if(l.indexOf("[")>0){h=l.substr(0,l.indexOf("["))+"_del"+l.substr(l.indexOf("["))}n=e.create("INPUT",{props:{name:l,type:"hidden",value:d}});r.appendChild(n);var f=e.create("INPUT",{props:{name:h,type:"hidden",value:d}});r.appendChild(f);f=e.create("INPUT",{props:{name:p,type:"hidden",value:d}});r.appendChild(f)}}for(var u in this["fileEvents"]){if(this["fileEvents"].hasOwnProperty(u))e.addCustomEvent(t,u,this["fileEvents"][u])}e.unbindAll(a);var g=t.file?t.file["file_id"]:null;delete t.hash;t.deleteFile("deleteFile");if(g){e.onCustomEvent(this,"onDeleteFile",[g,t,this]);e.onCustomEvent(this,"onFileUploaderChange",[[g],this]);if(!!n){e.fireEvent(n,"change")}}},_deleteFile:function(){},clear:function(){while(this.agent.getItems().length>0){this.deleteFile(this.agent.getItems().getFirst(),false)}},onUploadStart:function(t){var i=this.agent.getItem(t.id).node;if(i)e.addClass(i,"uploading")},onUploadProgress:function(t,i){i=Math.min(i,98);var a=t.id;if(!t.__progressBarWidth)t.__progressBarWidth=5;if(i>t.__progressBarWidth){t.__progressBarWidth=Math.ceil(i);t.__progressBarWidth=t.__progressBarWidth>100?100:t.__progressBarWidth;if(e("wdu"+a+"Progressbar"))e.adjust(e("wdu"+a+"Progressbar"),{style:{width:t.__progressBarWidth+"%"}});if(e("wdu"+a+"ProgressbarText"))e.adjust(e("wdu"+a+"ProgressbarText"),{text:t.__progressBarWidth+"%"})}},onUploadDone:function(t,i){var a=this.agent.getItem(t.id).node,n=i["file"];if(e(a)){e.removeClass(a,"uploading");e.addClass(a,"saved");var s=this.template,r;n["ext"]=t.ext;n["preview_url"]=t.canvas?t.canvas.toDataURL("image/png"):"/bitrix/images/1.gif";t.canvas=null;delete t.canvas;for(var o in n){if(n.hasOwnProperty(o)){r=n[o];if(o.toLowerCase()==="size")r=e.UploaderUtils.getFormattedSize(r,0);else if(o.toLowerCase()==="name")r=n["originalName"];s=s.replace(new RegExp("#"+o.toLowerCase()+"#","gi"),e.util.htmlspecialchars(r)).replace(new RegExp("#"+o.toUpperCase()+"#","gi"),e.util.htmlspecialchars(r))}}t.file.file_id=n["file_id"];t.file.justUploaded=true;t.name=n["originalName"];a.innerHTML=s;this.bindEventsHandlers(a,t);if(this.params.inputName.indexOf("[")<0){e.remove(e.findChild(a.parentNode.parentNode,{tagName:"INPUT",attr:{name:this.params.inputName}},false));e.remove(e.findChild(a.parentNode.parentNode,{tagName:"INPUT",attr:{name:this.params.inputName+"_del"}},false))}e.onCustomEvent(this,"onAddFile",[n["file_id"],this,n,a]);e.onCustomEvent(this,"onUploadDone",[i["file"],t,this]);e.fireEvent(e("file-"+n["file_id"]),"change")}else{this.onUploadError(t,i,this.agent)}},onUploadError:function(t,i,a){var n=this.agent.getItem(t.id).node,s=e.message("MFI_UPLOADING_ERROR");if(i&&i.error)s=i.error;e.removeClass(n,"uploading");e.addClass(n,"error");n.appendChild(e.create("DIV",{attrs:{className:"upload-file-error"},html:s}));e.onCustomEvent(this,"onErrorFile",[t["file"],this])},onError:function(t,i,a){var n="Uploading error.",s=n,r,o;if(a){if(a["error"]&&typeof a["error"]=="string")s=a["error"];else if(a["message"]&&typeof a["message"]=="string")s=a["message"];else if(e.type.isArray(a["errors"])&&a["errors"].length>0){s=[];for(var l=0;l<a["errors"].length;l++){if(typeof a["errors"][l]=="object"&&a["errors"][l]["message"])s.push(a["errors"][l]["message"])}if(s.length<=0)s.push("Uploading error.");s=s.join(" ")}}t.files=t.files||{};for(o in t.files){if(t.files.hasOwnProperty(o)){r=this.agent.queue.items.getItem(o);this.onUploadError(r,{error:s},s!=n)}}}};return i}();e.MFInput={init:function(e){return new i(e)},get:function(e){return t[e]||null}}})();
/* End */
;
; /* Start:"a:4:{s:4:"full";s:102:"/bitrix/components/bitrix/socialnetwork.group.selector/templates/.default/script.min.js?15441274546649";s:6:"source";s:83:"/bitrix/components/bitrix/socialnetwork.group.selector/templates/.default/script.js";s:3:"min";s:87:"/bitrix/components/bitrix/socialnetwork.group.selector/templates/.default/script.min.js";s:3:"map";s:87:"/bitrix/components/bitrix/socialnetwork.group.selector/templates/.default/script.map.js";}"*/
(function(t){var e={};BX.GroupsPopup={searchTimeout:null,oXHR:null,create:function(t,i,o){if(!e[t])e[t]=new s(t,i,o);return e[t]},abortSearchRequest:function(){if(this.oXHR){this.oXHR.abort()}}};var s=function(e,s,i){this.tabs=[];this.items2Objects=[];this.selected=[];this.lastGroups=[];this.myGroups=[];this.featuresPerms=null;var o=[];if(i){if(i.lastGroups){this.lastGroups=i.lastGroups}if(i.myGroups){this.myGroups=i.myGroups}if(i.featuresPerms){this.featuresPerms=i.featuresPerms}if(i.events){for(var a in i.events){if(i.events.hasOwnProperty(a)){BX.addCustomEvent(this,a,i.events[a])}}}if(i.selected&&i.selected.length){this.selected=i.selected;BX.onCustomEvent(this,"onGroupSelect",[this.selected,{onInit:true}])}if(i.searchInput){this.searchInput=i.searchInput}else{this.searchInput=BX.create("input",{props:{className:"bx-finder-box-search-textbox"}});o.push(BX.create("div",{props:{className:"bx-finder-box-search"},style:{},children:[this.searchInput]}))}}BX.adjust(this.searchInput,{events:{keyup:BX.proxy(function(e){if(!e)e=t.event;this.search((e.target||e.srcElement).value)},this),focus:function(){this.value=""},blur:BX.proxy(function(){setTimeout(BX.proxy(function(){if(this.selected[0]){this.searchInput.value=this.selected[0].title}},this),150)},this)}});this.ajaxURL="/bitrix/components/bitrix/socialnetwork.group.selector/ajax.php";if(this.lastGroups.length>0){this.addTab("last",this.lastGroups)}if(this.myGroups.length>0){this.addTab("my",this.myGroups)}this.addTab("search");this.tabsOuter=BX.create("div",{props:{className:"bx-finder-box-tabs"}});this.tabsContentOuter=BX.create("td",{props:{className:"bx-finder-box-tabs-content-cell"}});o.splice(o.length,0,this.tabsOuter,BX.create("div",{props:{className:"popup-window-hr popup-window-buttons-hr"},html:"<i></i>"}),BX.create("div",{props:{className:"bx-finder-box-tabs-content"},children:[BX.create("table",{props:{className:"bx-finder-box-tabs-content-table"},children:[BX.create("tr",{children:[this.tabsContentOuter]})]})]}));this.content=BX.create("div",{props:{className:"bx-finder-box bx-lm-box sonet-groups-finder-box"},style:{padding:"2px 6px 6px 6px",minWidth:"500px"},children:o});this.popupWindow=BX.PopupWindowManager.create(e,s,{content:"",autoHide:true,events:{onPopupFirstShow:BX.proxy(function(t){t.setContent(this.content)},this),onPopupShow:BX.proxy(function(t){this.__render()},this)},buttons:[new BX.PopupWindowButton({text:BX.message("SONET_GROUP_BUTTON_CLOSE"),className:"popup-window-button-accept task-edit-popup-close-but",events:{click:function(){this.popupWindow.close()}}})]})};s.prototype.show=function(){this.popupWindow.show();this.searchInput.focus()};s.prototype.selectTab=function(t){for(var e in this.tabs){if(this.tabs.hasOwnProperty(e)){BX.removeClass(this.tabs[e].tab,"bx-finder-box-tab-selected");BX.adjust(this.tabs[e].content,{style:{display:"none"}})}}BX.addClass(t.tab,"bx-finder-box-tab-selected");BX.adjust(t.content,{style:{display:"block"}})};s.prototype.addTab=function(t,e,s){var i=BX.create("div",{props:{className:"bx-finder-box-tab-content bx-lm-box-tab-content-sonetgroup"}});if(s){BX.adjust(i,{style:{display:"block"}})}var o=BX.create("span",{props:{className:"bx-finder-box-tab"+(s?" bx-finder-box-tab-selected":"")},text:BX.message("SONET_GROUP_TABS_"+t.toUpperCase())});this.tabs[t]={tab:o,content:i};BX.adjust(this.tabs[t].tab,{events:{click:BX.proxy(function(){this.selectTab(this.tabs[t])},this)}});if(e){this.setItems(this.tabs[t],e)}};s.prototype.setItems=function(t,e){BX.cleanNode(t.content);if(!!e){for(var s=0,i=e.length;s<i;s++){t.content.appendChild(this.__renderItem(e[s]))}}};s.prototype.select=function(t){this.selected=[t];var e=0;var s=0;clearTimeout(BX.GroupsPopup.searchTimeout);if(this.items2Objects[t.id]){for(e=0,s=this.items2Objects[t.id].length;e<s;e++){BX.addClass(this.items2Objects[t.id][e],"bx-finder-box-item-t7-selected")}}BX.onCustomEvent(this,"onGroupSelect",[this.selected,{onInit:false}]);var i=[t.id];for(e=0,s=this.lastGroups.length;e<s;e++){if(!BX.util.in_array(this.lastGroups[e].id,i)){i.push(this.lastGroups[e].id)}}BX.userOptions.save("socialnetwork","groups_popup","last_selected",i.slice(0,10));if(this.selected[0]){this.searchInput.value=this.selected[0].title}this.popupWindow.close()};s.prototype.deselect=function(t){this.selected=[];if(t&&this.items2Objects[t]){for(var e=0,s=this.items2Objects[t].length;e<s;e++){BX.removeClass(this.items2Objects[t][e],"bx-finder-box-item-t7-selected")}}this.searchInput.value=""};s.prototype.search=function(t){if(t.length>0){clearTimeout(BX.GroupsPopup.searchTimeout);BX.GroupsPopup.abortSearchRequest();this.selectTab(this.tabs["search"]);var e=this.ajaxURL+"?mode=search&SITE_ID="+__bx_group_site_id+"&query="+encodeURIComponent(t);if(this.featuresPerms){e+="&features_perms[0]="+encodeURIComponent(this.featuresPerms[0]);e+="&features_perms[1]="+encodeURIComponent(this.featuresPerms[1])}BX.GroupsPopup.searchTimeout=setTimeout(BX.delegate(function(){BX.GroupsPopup.oXHR=BX.ajax.loadJSON(e,BX.proxy(function(t){this.setItems(this.tabs["search"],t)},this))},this),1e3)}else{clearTimeout(BX.GroupsPopup.searchTimeout)}};s.prototype.__render=function(){var t=false;BX.cleanNode(this.tabsOuter);BX.cleanNode(this.tabsContentOuter);for(var e in this.tabs){if(this.tabs.hasOwnProperty(e)){if(!t){t=BX.hasClass(this.tabs[e].tab,"bx-finder-box-tab-selected")}this.tabsOuter.appendChild(this.tabs[e].tab);this.tabsContentOuter.appendChild(this.tabs[e].content)}}if(!t){this.selectTab(this.tabs["last"]||this.tabs["my"]||this.tabs["search"])}};s.prototype.__renderItem=function(t){var e=BX.create("div",{props:{className:"bx-finder-box-item-t7-avatar bx-finder-box-item-t7-group-avatar"}});if(t.image){BX.adjust(e,{style:{background:"url('"+t.image+"') no-repeat center center",backgroundSize:"24px 24px"}})}var s=false;for(var i=0;i<this.selected.length;i++){if(this.selected[i].id==t.id){s=true;break}}var o=BX.create("div",{props:{className:"bx-finder-box-item-t7 bx-finder-element bx-lm-element-sonetgroup"+(typeof t.IS_EXTRANET!="undefined"&&t.IS_EXTRANET=="Y"?" bx-lm-element-extranet":"")+(s?" bx-finder-box-item-t7-selected":"")},children:[e,BX.create("div",{props:{className:"bx-finder-box-item-t7-space"}}),BX.create("div",{props:{className:"bx-finder-box-item-t7-info"},children:[BX.create("div",{text:t.title,props:{className:"bx-finder-box-item-t7-name"}})]})],events:{click:BX.proxy(function(){this.select(t)},this)}});if(!this.items2Objects[t.id]){this.items2Objects[t.id]=[o]}else if(!BX.util.in_array(o,this.items2Objects[t.id])){this.items2Objects[t.id].push(o)}return o}})(window);
/* End */
;
; /* Start:"a:4:{s:4:"full";s:92:"/bitrix/components/bitrix/tasks.task.selector/templates/.default/tasks.min.js?15441274616011";s:6:"source";s:73:"/bitrix/components/bitrix/tasks.task.selector/templates/.default/tasks.js";s:3:"min";s:77:"/bitrix/components/bitrix/tasks.task.selector/templates/.default/tasks.min.js";s:3:"map";s:77:"/bitrix/components/bitrix/tasks.task.selector/templates/.default/tasks.map.js";}"*/
function TasksTask(e,a,t){this.name=e;this.multiple=a;this.arSelected=[];this.useLocalCache=t;this.arTasksData=[];this.ajaxParameters={}}TasksTask.arTasks={};TasksTask.arTasksData={};TasksTask.prototype.addAjaxParameter=function(e,a){if(typeof e!="undefined"&&e.toString().length>0)this.ajaxParameters[e.toString()]=a};TasksTask.prototype.setSelected=function(){throw new Exception("setSelected is not implemented")};TasksTask.prototype.getSelected=function(){return this.toObject(this.arSelected)};TasksTask.prototype.select=function(e){var a;var t=0;var s=e.target||e.srcElement;if(e.currentTarget){a=e.currentTarget}else{a=s;while(!BX.hasClass(a,"finder-box-item")){a=a.parentNode}}var i=BX.findChild(a,{tag:"input"});var n=BX.findChild(a,{tag:"DIV",className:"finder-box-item-text"},true);var r,l=null;if(typeof TasksTask.arTasksData[i.value]!="undefined"){r=TasksTask.arTasksData[i.value].sub;l=TasksTask.arTasksData[i.value].position}else if(typeof this.arTasksData[i.value]!="undefined"){r=this.arTasksData[i.value].sub;l=this.arTasksData[i.value].position}var c={id:i.value,name:BX.util.htmlspecialcharsback(n.innerHTML),sub:r,position:l};if(!this.multiple){var o=document.getElementsByName(this.name);for(var t=0;t<o.length;t++){if(o[t].value!=i.value){BX.removeClass(o[t].parentNode,"finder-box-item-selected")}else{BX.addClass(o[t].parentNode,"finder-box-item-selected")}}i.checked=true;BX.addClass(a,"finder-box-item-selected");this.searchInput.value=BX.util.htmlspecialcharsback(n.innerHTML);this.arSelected=[];this.arSelected[i.value]=c}else{var o=document.getElementsByName(this.name+"[]");for(var t=0;t<o.length;t++){if(o[t].value==i.value){o[t].checked=false;BX.toggleClass(o[t].parentNode,"finder-box-item-selected")}}if(BX.hasClass(i.parentNode,"finder-box-item-selected")){i.checked=true}if(i.checked){var d=BX.findChild(BX(this.name+"_selected_tasks"),{className:"finder-box-selected-items"});if(!BX(this.name+"_task_selected_"+i.value)){var h=BX.create("DIV");h.id=this.name+"_task_selected_"+i.value;h.className="finder-box-selected-item";h.innerHTML='<div class="finder-box-selected-item-icon" onclick="O_'+this.name+".unselect("+i.value+', this);" id="task-unselect-'+i.value+'"></div><a href="'+BX.message("TASKS_PATH_TO_TASK").replace("#task_id#",i.value).replace("#action#","view")+'" target="_blank" class="finder-box-selected-item-text">'+n.innerHTML+"</a>";d.appendChild(h);var u=BX(this.name+"_current_count");u.innerHTML=parseInt(u.innerHTML)+1;this.arSelected[i.value]=c}}else{BX.remove(BX(this.name+"_task_selected_"+i.value));var u=BX(this.name+"_current_count");u.innerHTML=parseInt(u.innerHTML)-1;this.arSelected[i.value]=null}}if(this.onSelect){this.onSelect(c)}BX.onCustomEvent(this,"on-change",[this.toObject(this.arSelected)]);if(this.onChange){this.onChange(this.arSelected)}};TasksTask.prototype.toObject=function(e){var a={};for(var t in e){t=parseInt(t);if(typeof t=="number"&&e[t]!==null){a[t]=BX.clone(e[t])}}return a};TasksTask.prototype.unselect=function(e,a){if(!this.arSelected[e]){return}var t=document.getElementsByName(this.name+(this.multiple?"[]":""));for(var s=0;s<t.length;s++){if(t[s].value==e){t[s].checked=false;BX.removeClass(t[s].parentNode,"finder-box-item-selected")}}if(this.multiple){if(!a){a=BX("task-unselect-"+e)}if(a){BX.remove(a.parentNode)}var i=BX(this.name+"_current_count");i.innerHTML=parseInt(i.innerHTML)-1}this.arSelected[e]=null;BX.onCustomEvent(this,"on-change",[this.toObject(this.arSelected)]);if(this.onChange){this.onChange(this.arSelected)}};TasksTask.prototype.setFocus=function(){var e=BX(this.name+"_task_input");if(e){e.focus()}};TasksTask.prototype.search=function(e){if(!e)e=window.event;if(this.searchInput.value.length>1){this.displayTab("search");var a=(typeof this.ajaxUrl!="undefined"?this.ajaxUrl:TasksTask.ajaxUrl)+"&MODE=SEARCH&SEARCH_STRING="+encodeURIComponent(this.searchInput.value)+"&"+BX.ajax.prepareData(this.filter,"FILTER");BX.ajax({url:a,method:"post",dataType:"json",async:true,processData:true,emulateOnload:true,start:true,data:this.ajaxParameters,onsuccess:BX.proxy(function(e){this.showResults(e)},this)})}};TasksTask.prototype.showResults=function(e){var a=e;var t=BX(this.name+"_search");var s=t.getElementsByTagName("input");for(var i=0,n=s.length;i<n;i++){if(s[i].checked){BX(this.name+"_last").appendChild(s[i])}}if(t){t.innerHTML="";for(var i=0;i<a.length;i++){var r;var l=false;(this.useLocalCache?this:TasksTask).arTasksData[a[i].ID]={id:a[i].ID,name:a[i].TITLE,status:a[i].STATUS};var c=BX.create("input",{props:{className:"tasks-hidden-input"}});if(this.multiple){c.name=this.name+"[]";c.type="checkbox"}else{c.name=this.name;c.type="radio"}var s=document.getElementsByName(c.name);var o=0;while(!l&&o<s.length){if(s[o].value==a[i].ID&&s[o].checked){l=true}o++}c.value=a[i].ID;switch(parseInt(a[i].STATUS)){case-1:var d=" task-status-overdue";break;case-2:case 1:var d=" task-status-new";break;case 2:var d=" task-status-accepted";break;case 3:var d=" task-status-in-progress";break;case 4:var d=" task-status-waiting";break;case 5:var d=" task-status-completed";break;case 6:var d=" task-status-delayed";break;case 7:var d=" task-status-declined";break;default:var d=""}obTaskRow=BX.create("div",{props:{className:"finder-box-item"+d+(l?" finder-box-item-selected":"")},events:{click:BX.proxy(this.select,this)},children:[c,BX.create("div",{props:{className:"finder-box-item-text"},text:a[i].TITLE}),BX.create("div",{props:{className:"finder-box-item-icon"}})]});t.appendChild(obTaskRow)}}};TasksTask.prototype.displayTab=function(e){BX.removeClass(BX(this.name+"_last"),"finder-box-tab-content-selected");BX.removeClass(BX(this.name+"_search"),"finder-box-tab-content-selected");BX.addClass(BX(this.name+"_"+e),"finder-box-tab-content-selected");BX.removeClass(BX(this.name+"_tab_last"),"finder-box-tab-selected");BX.removeClass(BX(this.name+"_tab_search"),"finder-box-tab-selected");BX.addClass(BX(this.name+"_tab_"+e),"finder-box-tab-selected")};
/* End */
;; /* /bitrix/components/bitrix/meeting.edit/templates/.default/script.js?15441274347628*/
; /* /bitrix/components/bitrix/intranet.user.selector.new/templates/.default/users.min.js?154412742413982*/
; /* /bitrix/components/bitrix/main.file.input/templates/.default/script.min.js?15441273849095*/
; /* /bitrix/components/bitrix/socialnetwork.group.selector/templates/.default/script.min.js?15441274546649*/
; /* /bitrix/components/bitrix/tasks.task.selector/templates/.default/tasks.min.js?15441274616011*/

//# sourceMappingURL=page_f951342aa01b934537702d692bbfe918.map.js