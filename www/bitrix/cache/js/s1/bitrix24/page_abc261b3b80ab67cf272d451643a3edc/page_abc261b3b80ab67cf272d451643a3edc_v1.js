
; /* Start:"a:4:{s:4:"full";s:83:"/bitrix/components/bitrix/crm.product/templates/.default/splitter.js?15441274015668";s:6:"source";s:68:"/bitrix/components/bitrix/crm.product/templates/.default/splitter.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
BX.namespace("BX.Crm");

BX.Crm.Splitter = (function() {
	var Splitter = function(params){

		if(!params && typeof params != "object")
			return;

		this.moveBtn = params.splitterMoveBtn;
		this.splitterElem = params.splitterElem;
		this.minValue = params.minValue;
		this.maxValue = params.maxValue;
		this.startPos = {};
		this.isCollaps = !!params.isCollapse;
		this.splitterCallBack = params.splitterCallBack || null;
		this.startPos.blocksPos = [];

		this.splitterCallBackParams = [];

		for(var i=0; i<this.splitterElem.length; i++)
		{
			if(this.splitterCallBack){
				this.splitterCallBackParams.push({
					node : this.splitterElem[i].node,
					attr : this.splitterElem[i].attr,
					val  : 0
				})
			}
			this.startPos.blocksPos.push(
				this.splitterElem[i].expandValue
			)
		}

		if(!!params.collapse)
		{
			this.collapseBtn = params.collapse.collapseBtn;
			this.collapseCallback = params.collapse.collapseCallback || null;

			this.collapseAnimDuration = (!!params.collapse.collapseAnimDuration) ? params.collapse.collapseAnimDuration : 250;
			this.collapseAnimTimeFunc = (!!params.collapse.collapseAnimTimeFunc) ? params.collapse.collapseAnimTimeFunc : BX.easing.transitions.linear;

			BX.bind(this.collapseBtn, 'mousedown', BX.proxy(this.toggle, this));
			BX.bind(this.collapseBtn, 'click', BX.proxy(this.toggle, this));
		}

		BX.bind(this.moveBtn, 'mousedown', BX.proxy(this.scale, this));
	};

	Splitter.prototype.setStartPos = function(e)
	{
		e =  e || window.event;
		BX.fixEventPageX(e);
		BX.PreventDefault(e);

		this.startPos = {
			move : e.pageX,
			blocksPos : []
		};

		for(var i=0; i<this.splitterElem.length; i++)
		{
			if (this.isCollaps)
			{
				this.startPos.blocksPos.push(
					parseInt(BX.style(this.splitterElem[i].node, this.splitterElem[i].attr))
				);
			}
			else
			{
				this.startPos.blocksPos.push(
					parseInt(BX.style(this.splitterElem[i].node, this.splitterElem[i].attr))
				);
			}
		}
	};

	Splitter.prototype.scale = function(e)
	{
		e =  e || window.event;
		BX.PreventDefault(e);

		if(this.isCollaps)
			return;

		document.onmousedown = BX.False;
		document.body.onselectstart = BX.False;
		document.body.ondragstart = BX.False;
		document.body.style.MozUserSelect = "none";
		document.body.style.cursor = "ew-resize";

		this.setStartPos(e);

		BX.bind(document, 'mousemove', BX.proxy(this._scale, this));
		BX.bind(document, "mouseup", BX.proxy(this.stopMove, this));
	};

	Splitter.prototype._scale = function(e)
	{
		e =  e || window.event;
		BX.fixEventPageX(e);
		var diff = e.pageX - this.startPos.move;

		this._move(diff);
	};

	Splitter.prototype._move = function(diff)
	{
		for(var i=0; i<this.splitterElem.length; i++)
		{
			if(this.splitterElem[i].isInversion)
			{
				if(this.startPos.blocksPos[i] - diff >=this.splitterElem[i].minValue && this.startPos.blocksPos[i] - diff <=this.splitterElem[i].maxValue){
					this.splitterElem[i].node.style[this.splitterElem[i].attr] = (this.startPos.blocksPos[i] - diff) + 'px';
				}
			}else {
				if(this.startPos.blocksPos[i] + diff >=this.splitterElem[i].minValue && this.startPos.blocksPos[i] + diff <=this.splitterElem[i].maxValue){
					this.splitterElem[i].node.style[this.splitterElem[i].attr] = (this.startPos.blocksPos[i] + diff) + 'px';
				}
			}
		}
	};

	Splitter.prototype.stopMove = function()
	{
		BX.unbind(document, 'mousemove', BX.proxy(this._scale, this));
		BX.unbind(document, 'mouseup', BX.proxy(this.stopMove, this));

		document.onmousedown = null;
		document.body.onselectstart = null;
		document.body.ondragstart = null;
		document.body.style.MozUserSelect = "";
		document.body.style.cursor = "auto";

		if(this.splitterCallBack){
			for(var i=0; i<this.splitterCallBackParams.length; i++){
				this.splitterCallBackParams[i].val = parseInt(BX.style(this.splitterElem[i].node, this.splitterElem[i].attr));
			}
			this.splitterCallBack(this.isCollaps, this.splitterCallBackParams);
		}
	};

	Splitter.prototype.toggle = function(e)
	{

		BX.PreventDefault(e);
		if(e.type == 'mousedown') return;

		var animParams = {
			start : {},
			finish : {}
		};

		if(this.isCollaps)
			this.expand(animParams);
		else
			this.collapse(e, animParams);
	};

	Splitter.prototype.expand = function(animParams)
	{

		for(var i=0; i<this.splitterElem.length; i++)
		{
			animParams.start['attr_' + i] = this.splitterElem[i].collapseValue;
			animParams.finish['attr_' + i] = this.startPos.blocksPos[i];
		}
		this._easing(animParams);
		this.isCollaps = false;
	};

	Splitter.prototype.collapse = function(e, animParams)
	{
		this.setStartPos(e);

		for(var i=0; i<this.splitterElem.length; i++)
		{
			animParams.start['attr_' + i] = this.startPos.blocksPos[i];
			animParams.finish['attr_' + i] = this.splitterElem[i].collapseValue;
		}
		this._easing(animParams);
		this.isCollaps = true;
	};

	Splitter.prototype._easing = function(params)
	{
		var easing = new BX.easing({
			duration : this.collapseAnimDuration,
			start : params.start,
			finish :  params.finish,
			transition : this.collapseAnimTimeFunc,
			step : BX.proxy(function(state){
				for(var i=0; i<this.splitterElem.length; i++){
					this.splitterElem[i].node.style[this.splitterElem[i].attr] = state['attr_' + i] + 'px';
				}
			}, this),
			complete: BX.proxy( function()
			{
				if(this.collapseCallback)
				{
					for(var i=0; i<this.splitterCallBackParams.length; i++){
						this.splitterCallBackParams[i].val = parseInt(BX.style(this.splitterElem[i].node, this.splitterElem[i].attr));
					}
					this.collapseCallback(this.isCollaps, this.splitterCallBackParams);
				}
			}, this)
		});
		easing.animate();
	};

	return Splitter;
})();

/* End */
;
; /* Start:"a:4:{s:4:"full";s:87:"/bitrix/components/bitrix/crm.product/templates/.default/list_manager.js?15441274013567";s:6:"source";s:72:"/bitrix/components/bitrix/crm.product/templates/.default/list_manager.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
BX.namespace("BX.Crm");

if (typeof(BX.Crm.ProductListManagerClass) === "undefined")
{
	BX.Crm.ProductListManagerClass = function()
	{
		this._settings = {};

		this.splitter = null;
	};

	BX.Crm.ProductListManagerClass.prototype = {
		initialize: function (settings)
		{
			this._settings = settings ? settings : {};

			this._settings.splitterBtnId = this._settings.splitterBtnId || "";
			this._settings.splitterNodeId = this._settings.splitterNodeId || "";
			this._settings.splitterNode = BX(this._settings.splitterNodeId);
			this._settings.hideBtnId = this._settings.hideBtnId || "";
			this._settings.viewOptionId = this._settings.viewOptionId || "";

			if (typeof(this._settings.splitterState) !== "object")
			{
				this._settings.splitterState = {
					rightSideWidth: 250,
					rightSideClosed: "N"
				}
			}
			this._settings.splitterState.rightSideWidth = parseInt(this._settings.splitterState.rightSideWidth);
			if (this._settings.splitterState.rightSideWidth < 100)
			{
				this._settings.splitterState.rightSideWidth = 250;
				this._settings.splitterState.rightSideClosed = "N";
			}
			if (this._settings.splitterState.rightSideClosed !== "Y"
				&& this._settings.splitterState.rightSideClosed !== "N")
			{
				this._settings.splitterState.rightSideClosed = "N";
			}

			this.ajaxUrl = "/bitrix/components/bitrix/crm.product/ajax.php";

			this.initSplitter();
		},
		initSplitter: function()
		{
			var self = this;
			this.splitter = new BX.Crm.Splitter({
				splitterMoveBtn :  BX(this._settings.splitterBtnId),
				isCollapse: this._settings.splitterState.rightSideClosed === "Y",
				splitterElem : [
					{
						node : BX(this._settings.splitterNodeId),
						attr : 'width',
						collapseValue : 0,
						expandValue: this._settings.splitterState.rightSideWidth,
						minValue : 100,
						maxValue : 930,
						isInversion : true
					}
				],
				splitterCallBack : BX.delegate(this._handleSplitterState, this),
				collapse : {
					collapseBtn : BX(this._settings.hideBtnId),
					collapseCallback : function(isCollapse){
						if(this.collapseBtn.classList)
							this.collapseBtn.classList.toggle('bx-crm-goods-close');
						self._handleSplitterState(isCollapse);
					},
					collapseAnimDuration : 250,
					collapseAnimTimeFunc : BX.easing.makeEaseOut(BX.easing.transitions.linear)
				}
			});
		},
		_handleSplitterState: function(isCollapsed, paramsList)
		{
			var save = false;

			isCollapsed = !!isCollapsed;
			if ((this._settings.splitterState.rightSideClosed === "Y") !== isCollapsed)
			{
				this._settings.splitterState.rightSideClosed = isCollapsed ? "Y" : "N";
				save = true;
			}

			if (paramsList instanceof Array)
			{
				for (var i=0; i<paramsList.length; i++)
				{
					if (paramsList[i].node && paramsList[i].node === this._settings.splitterNode)
					{
						this._settings.splitterState.rightSideWidth = parseInt(paramsList[i].val);
						save = true;
						break;
					}
				}
			}

			if (save)
				this.saveViewOptions(this._settings.splitterState);
		},
		saveViewOptions: function(options)
		{
			BX.ajax({
				method: "POST",
				dataType: "json",
				url: this.ajaxUrl,
				data: {
					sessid: BX.bitrix_sessid(),
					action: "saveViewOptions",
					viewOptionId: this._settings.viewOptionId,
					rightSideWidth: options.rightSideWidth || 250,
					rightSideClosed: options.rightSideClosed || "N"
				}
			})
		}
	};

	BX.Crm.ProductListManagerClass.create = function(settings)
	{
		var self = new BX.Crm.ProductListManagerClass();
		self.initialize(settings);
		return self;
	};
}

/* End */
;
; /* Start:"a:4:{s:4:"full";s:97:"/bitrix/components/bitrix/main.interface.buttons/templates/.default/script.min.js?154412738440309";s:6:"source";s:77:"/bitrix/components/bitrix/main.interface.buttons/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
BX.namespace("BX.Main");if(typeof BX.Main.interfaceButtons==="undefined"){BX.Main.interfaceButtons=function(t,e){this.classItem="main-buttons-item";this.classItemSublink="main-buttons-item-sublink";this.classItemText="main-buttons-item-text";this.classItemCounter="main-buttons-item-counter";this.classItemIcon="main-buttons-item-icon";this.classItemMore="main-buttons-item-more";this.classOnDrag="main-buttons-drag";this.classDropzone="main-buttons-submenu-dropzone";this.classSeporator="main-buttons-submenu-separator";this.classHiddenLabel="main-buttons-hidden-label";this.classSubmenuItem="main-buttons-submenu-item";this.classItemDisabled="main-buttons-disabled";this.classItemOver="over";this.classItemActive="main-buttons-item-active";this.classSubmenu="main-buttons-submenu";this.classSecret="secret";this.classItemLocked="locked";this.submenuIdPrefix="main_buttons_popup_";this.childMenuIdPrefix="main_buttons_popup_child_";this.submenuWindowIdPrefix="menu-popup-";this.classSettingMenuItem="main-buttons-submenu-setting";this.classEditState="main-buttons-edit";this.classEditItemButton="main-buttons-item-edit-button";this.classDragItemButton="main-buttons-item-drag-button";this.classSettingsApplyButton="main-buttons-submenu-settings-apply";this.classSettingsResetButton="main-buttons-submenu-settings-reset";this.classSetHome="main-buttons-set-home";this.classSetHide="main-buttons-set-hide";this.classManage="main-buttons-manage";this.classContainer="main-buttons";this.classSubmenuNoHiddenItem="main-buttons-submenu-item-no-hidden";this.classDefaultSubmenuItem="menu-popup-item";this.classInner="main-buttons-inner-container";this.listContainer=null;this.pinContainer=null;this.dragItem=null;this.overItem=null;this.moreButton=null;this.messages=null;this.licenseParams=null;this.isSubmenuShown=false;this.isSubmenuShownOnDragStart=false;this.isSettingsEnabled=true;this.containerId=e.containerId;this.tmp={};this.init(t,e);return{getItemById:BX.delegate(this.getItemById,this),getAllItems:BX.delegate(this.getAllItems,this),getHiddenItems:BX.delegate(this.getHiddenItems,this),getVisibleItems:BX.delegate(this.getVisibleItems,this),getDisabledItems:BX.delegate(this.getDisabledItems,this),getMoreButton:BX.delegate(this.getMoreButton,this),adjustMoreButtonPosition:BX.delegate(this.adjustMoreButtonPosition,this),showSubmenu:BX.delegate(this.showSubmenu,this),closeSubmenu:BX.delegate(this.closeSubmenu,this),refreshSubmenu:BX.delegate(this.refreshSubmenu,this),getCurrentSettings:BX.delegate(this.getCurrentSettings,this),saveSettings:BX.delegate(this.saveSettings,this),setCounterValueByItemId:BX.delegate(this.setCounterValueByItemId,this),getCounterValueByItemId:BX.delegate(this.getCounterValueByItemId,this),updateCounter:BX.delegate(this.updateCounter,this),getActive:BX.delegate(this.getActive,this),isEditEnabled:BX.delegate(this.isEditEnabled,this),isActiveInMoreMenu:BX.delegate(this.isActiveInMoreMenu,this),isSettingsEnabled:this.isSettingsEnabled,classes:{item:this.classItem,itemText:this.classItemText,itemCounter:this.classItemCounter,itemIcon:this.classItemIcon,itemDisabled:this.classItemDisabled,itemOver:this.classItemOver,itemActive:this.classItemActive,itemLocked:this.classItemLocked,submenu:this.classSubmenu,submenuItem:this.classSubmenuItem,containerOnDrag:this.classOnDrag,classSettingMenuItem:this.classSettingMenuItem},itemsContainer:this.listContainer,itemsContainerId:this.listContainer.id}};BX.Main.interfaceButtons.prototype={init:function(t,e){this.listContainer=BX(this.getId());if(!BX.type.isPlainObject(e)){throw"BX.MainButtons: params is not Object"}if(!("containerId"in e)||!BX.type.isNotEmptyString(e.containerId)){throw"BX.MainButtons: containerId not set in params"}if(!BX.type.isDomNode(this.listContainer)){throw"BX.MainButtons: #"+e.containerId+" is not dom node"}if("classes"in e&&BX.type.isPlainObject(e.classes)){this.setCustomClasses(e.classes)}if("messages"in e&&BX.type.isPlainObject(e.messages)){this.setMessages(e.messages)}if("licenseWindow"in e&&BX.type.isPlainObject(e.licenseWindow)){this.setLicenseWindowParams(e.licenseWindow)}if("disableSettings"in e&&e.disableSettings==="true"){this.isSettingsEnabled=false;this.visibleControlMoreButton()}this.moreButton=this.getMoreButton();this.listChildItems={};if(this.isSettingsEnabled){this.dragAndDropInit()}this.adjustMoreButtonPosition();this.bindOnClickOnMoreButton();this.bindOnScrollWindow();this.setContainerHeight();BX.bind(this.getContainer(),"click",BX.delegate(this._onDocumentClick,this));BX.addCustomEvent("onPullEvent-main",BX.delegate(this._onPush,this));this.updateMoreButtonCounter();if(this.isActiveInMoreMenu()){this.activateItem(this.moreButton)}var i=this.getVisibleItems();var s=BX.type.isArray(i)&&i.length>0?i[0]:null;var n=BX.Buttons.Utils.getByTag(s,"a");if(!BX.type.isDomNode(n)){return}var a=n.getAttribute("href");if(a.charAt(0)==="?"){a=n.pathname+n.search}if(!this.lastHomeLink){this.lastHomeLink=a}this.bindOnResizeFrame()},_onDocumentClick:function(t){var e=this.getItem(t);var i,s,n,a,o,u;if(this.isDragButton(t.target)){t.preventDefault();t.stopPropagation()}if(BX.type.isDomNode(e)){if(this.isSettings(e)){this.enableEdit();BX.hide(this.getSettingsButton());BX.show(this.getSettingsApplyButton());return false}if(this.isApplySettingsButton(e)){t.preventDefault();t.stopPropagation();this.disableEdit();BX.show(this.getSettingsButton());BX.hide(this.getSettingsApplyButton());return false}if(this.isResetSettingsButton(e)){this.resetSettings();return false}if(this.isLocked(e)){t.preventDefault();this.showLicenseWindow();return false}if(this.isEditButton(t.target)){var r,h;t.preventDefault();t.stopPropagation();if(this.isSubmenuItem(e)){e=this.getItemAlias(e)}try{r=JSON.parse(BX.data(e,"item"))}catch(t){}h=this.getItemEditMenu();if(h&&h.popupWindow.isShown()&&this.lastEditNode===e){h.popupWindow.close()}else{this.showItemEditMenu(r,t.target)}this.lastEditNode=e;return false}if(this.isSetHide(e)){o=this.getVisibleItems();u=BX.type.isArray(o)?o.length:null;a=this.editItemData.ID.replace(this.listContainer.id+"_","");s=this.getItemById(a);n=this.getItemAlias(s);s=this.isVisibleItem(s)?s:n;if(this.isDisabled(n)){this.enableItem(n)}else if(!this.isDisabled(n)&&u>2){this.disableItem(n)}if(u===2){BX.onCustomEvent(window,"BX.Main.InterfaceButtons:onHideLastVisibleItem",[s,this])}this.refreshSubmenu();this.saveSettings();this.adjustMoreButtonPosition();if(this.isEditEnabled()){this.enableEdit();BX.hide(this.getSettingsButton());BX.show(this.getSettingsApplyButton())}this.editMenu.popupWindow.close();return false}if(this.isSetHome(e)){a=this.editItemData.ID.replace(this.listContainer.id+"_","");s=this.getItemById(a);n=this.getItemAlias(s);if(this.isDisabled(n)){this.enableItem(n)}this.listContainer.insertBefore(s,BX.firstChild(this.listContainer));this.adjustMoreButtonPosition();this.refreshSubmenu();this.saveSettings();if(this.isEditEnabled()){this.enableEdit();BX.hide(this.getSettingsButton());BX.show(this.getSettingsApplyButton())}this.editMenu.popupWindow.close();return false}if(!this.isSublink(t.target)){i=this.dataValue(e,"onclick");if(BX.type.isNotEmptyString(i)){t.preventDefault();this.execScript(i)}}}if(this.isEditEnabled()){this.getSubmenu().popupWindow.setAutoHide(false)}},isActiveInMoreMenu:function(){var t=this.getHiddenItems();var e=this.getDisabledItems();var i=t.concat(e);return i.some(function(t){var e;try{e=JSON.parse(BX.data(t,"item"))}catch(t){}return BX.type.isPlainObject(e)&&("IS_ACTIVE"in e&&e.IS_ACTIVE===true||e.IS_ACTIVE==="true"||e.IS_ACTIVE==="Y")},this)},_onPush:function(t,e){if(t==="user_counter"&&e&&BX.message("SITE_ID")in e){var i=e[BX.message("SITE_ID")];for(var s in i){if(i.hasOwnProperty(s)){this.updateCounter(s,i[s])}}}},bindOnScrollWindow:function(){BX.bind(window,"scroll",BX.delegate(this._onScroll,this))},getActive:function(){var t=this.getAllItems();var e,i;var s=null;if(BX.type.isArray(t)){t.forEach(function(t){try{e=JSON.parse(BX.data(t,"item"))}catch(t){e=null}if(BX.type.isPlainObject(e)&&"IS_ACTIVE"in e&&(e.IS_ACTIVE===true||e.IS_ACTIVE==="true"||e.IS_ACTIVE==="Y")){s=e}},this)}if(BX.type.isPlainObject(s)){i=BX(s.ID);if(BX.type.isDomNode(i)){s.NODE=i}else{s.NODE=null}}return s},isSetHome:function(t){return BX.hasClass(t,this.classSetHome)},isSetHide:function(t){return BX.hasClass(t,this.classSetHide)},getSettingsButton:function(){return BX.Buttons.Utils.getByClass(this.getSubmenuContainer(),this.classSettingMenuItem)},getSettingsApplyButton:function(){return BX.Buttons.Utils.getByClass(this.getSubmenuContainer(),this.classSettingsApplyButton)},isApplySettingsButton:function(t){return BX.hasClass(t,this.classSettingsApplyButton)},enableEdit:function(){var t=this.getSubmenu();if(t&&"popupWindow"in t){t.popupWindow.setAutoHide(false)}BX.addClass(this.listContainer,this.classEditState);BX.addClass(this.getSubmenuContainer(),this.classEditState);this.isEditEnabledState=true},disableEdit:function(){var t=this.getSubmenu();if(t&&"popupWindow"in t){t.popupWindow.setAutoHide(true)}BX.removeClass(this.listContainer,this.classEditState);BX.removeClass(this.getSubmenuContainer(),this.classEditState);this.isEditEnabledState=false},isEditEnabled:function(){return this.isEditEnabledState},showItemEditMenu:function(t,e){if(BX.type.isPlainObject(t)&&"ID"in t){var i=[this.listContainer.id,"_edit_item"].join("");var s=BX.PopupMenu.getMenuById(i);if(s){BX.PopupMenu.destroy(i)}s=this.createItemEditMenu(t,i,e);s.popupWindow.show()}},getContainer:function(){if(!BX.type.isDomNode(this.container)){this.container=BX(this.containerId).parentNode}return this.container},getItemEditMenu:function(){return BX.PopupMenu.getMenuById([this.listContainer.id,"_edit_item"].join(""))},createItemEditMenu:function(t,e,i){var s;var n=[{text:this.message("MIB_SET_HOME"),className:"main-buttons-set-home menu-popup-no-icon"}];var a=t.ID.replace(this.listContainer.id+"_","");var o=this.getItemById(a);if(this.isDisabled(o)){n.push({text:this.message("MIB_SET_SHOW"),className:"main-buttons-set-hide menu-popup-no-icon"})}else{n.push({text:this.message("MIB_SET_HIDE"),className:"main-buttons-set-hide menu-popup-no-icon"})}var u=BX.pos(i);var r={menuId:e,anchor:i,menuItems:n,settings:{autoHide:true,offsetTop:0,offsetLeft:u.width/2,zIndex:20,angle:{position:"top",offset:u.width/2}}};s=BX.PopupMenu.create(r.menuId,r.anchor,r.menuItems,r.settings);if(this.isVisibleItem(o)){t.NODE=o}else{t.NODE=this.getItemAlias(o)}this.editItemData=t;if("menuItems"in s&&BX.type.isArray(s.menuItems)){s.menuItems.forEach(function(t){BX.bind(t.layout.item,"click",BX.delegate(this._onDocumentClick,this))},this)}BX.onCustomEvent(window,"BX.Main.InterfaceButtons:onBeforeCreateEditMenu",[s,t,this]);this.editMenu=s;return s},setHome:function(){var t=this.getVisibleItems();var e=BX.type.isArray(t)&&t.length>0?t[0]:null;var i=BX.Buttons.Utils.getByTag(e,"a");if(!BX.type.isDomNode(i)){return}var s=i.getAttribute("href");if(s.charAt(0)==="?"){s=i.pathname+i.search}if(!this.lastHomeLink){this.lastHomeLink=s}if(this.lastHomeLink!==s){BX.userOptions.save("ui",this.listContainer.id,"firstPageLink",s);BX.onCustomEvent("BX.Main.InterfaceButtons:onFirstItemChange",[s,e])}this.lastHomeLink=s},isEditButton:function(t){return BX.hasClass(t,this.classEditItemButton)},isDragButton:function(t){return BX.hasClass(t,this.classDragItemButton)},isResetSettingsButton:function(t){return BX.hasClass(t,this.classSettingsResetButton)},getContainerHeight:function(){var t=this.getAllItems().map(function(t){var e=getComputedStyle(t);return BX.height(t)+parseInt(e.marginTop)+parseInt(e.marginBottom)});return Math.max.apply(Math,t)},setContainerHeight:function(){var t=this.getContainerHeight();var e=8;BX.height(this.listContainer,t-e)},setLicenseWindowParams:function(t){this.licenseParams=t||{}},message:function(t){var e;try{e=this.messages[t]}catch(t){e=""}return e},setCustomClasses:function(t){if(!BX.type.isPlainObject(t)){return}this.classItem=t.item||this.classItem;this.classItemSublink=t.itemSublink||this.classItemSublink;this.classItemText=t.itemText||this.classItemText;this.classItemCounter=t.itemCounter||this.classItemCounter;this.classItemIcon=t.itemIcon||this.classItemIcon;this.classItemMore=t.itemMore||this.classItemMore;this.classItemOver=t.itemOver||this.classItemOver;this.classItemActive=t.itemActive||this.classItemActive;this.classItemDisabled=t.itemDisabled||this.classItemDisabled;this.classOnDrag=t.onDrag||this.classOnDrag;this.classDropzone=t.dropzone||this.classDropzone;this.classSeporator=t.separator||this.classSeporator;this.classSubmenuItem=t.submenuItem||this.classSubmenuItem;this.classSubmenu=t.submenu||this.classSubmenu;this.classSecret=t.secret||this.classSecret;this.classItemLocked=t.itemLocked||this.classItemLocked},setMessages:function(t){if(!BX.type.isPlainObject(t)){return}this.messages=t},makeFullItemId:function(t){if(!BX.type.isNotEmptyString(t)){return}return[this.listContainer.id,t.replace("-","_")].join("_")},getItemById:function(t){var e=null;var i;if(BX.type.isNotEmptyString(t)){i=this.makeFullItemId(t);e=BX.Buttons.Utils.getBySelector(this.listContainer,"#"+i)}return e},getItemCounterObject:function(t){var e=null;if(BX.type.isDomNode(t)){e=BX.Buttons.Utils.getByClass(t,this.classItemCounter)}return e},setCounterValue:function(t,e){var i=this.getItemCounterObject(t);if(BX.type.isDomNode(i)){i.innerText=e>99?"99+":e>0?e:"";t.dataset.counter=e}this.updateMoreButtonCounter()},updateCounter:function(t,e){if(t.indexOf("crm")===0&&e<0){return}var i,s,n;var a=null;var o=this.getAllItems();if(BX.type.isArray(o)){o.forEach(function(e){try{s=JSON.parse(BX.data(e,"item"))}catch(t){s={}}if(BX.type.isPlainObject(s)&&"COUNTER_ID"in s&&s.COUNTER_ID===t){a=e}},this)}i=this.getItemCounterObject(a);if(BX.type.isDomNode(i)){a=this.getItem(i);i.innerText=e>99?"99+":e>0?e:"";a.dataset.counter=e}n=this.getItemAlias(a);if(BX.type.isDomNode(n)){i=this.getItemCounterObject(n);if(BX.type.isDomNode(i)){i.innerText=e>99?"99+":e>0?e:"";n.dataset.counter=e}}this.updateMoreButtonCounter()},setCounterValueByItemId:function(t,e){var i=e!==null?parseFloat(e):null;var s,n;if(!BX.type.isNotEmptyString(t)){throw"Bad first arg. Need string as item id"}if(i!==null&&!BX.type.isNumber(i)){throw"Bad two arg. Need number counter value - Integer, Float or string with number"}s=this.getItemById(t);if(!BX.type.isDomNode(s)){console.info("Not found node with id #"+t);return}n=this.getItemAlias(s);this.setCounterValue(s,i);this.setCounterValue(n,i)},getCounterValueByItemId:function(t){var e,i;var s=NaN;if(!BX.type.isNotEmptyString(t)){throw"Bad first arg. Need string item id"}else{e=this.getItemById(t);s=this.dataValue(e,"counter");s=parseFloat(s);if(!BX.type.isNumber(s)){i=this.getItemCounterObject(e);s=parseFloat(i.innerText)}}return s},setMoreButtonCounter:function(t){var e=this.getItemCounterObject(this.moreButton);var i=t>99?"99+":t>0?t:"";i=parseInt(i);i=BX.type.isNumber(i)?i:"";e.innerText=i},bindOnClickOnMoreButton:function(){BX.bind(this.moreButton,"click",BX.delegate(this._onClickMoreButton,this))},bindOnResizeFrame:function(){window.frames["maininterfacebuttonstmpframe-"+this.getId()].onresize=BX.throttle(this._onResizeHandler,20,this)},getId:function(){return BX.Buttons.Utils.getByClass(this.getContainer(),this.classInner).id},getAllItems:function(){return BX.Buttons.Utils.getByClass(this.listContainer,this.classItem,true)},getVisibleItems:function(){var t=this.getAllItems();var e=this;var i=[];if(t&&t.length){i=t.filter(function(t){return e.isVisibleItem(t)&&!e.isDisabled(t)})}return i},getHiddenItems:function(){var t=this.getAllItems();var e=[];var i=this;if(t&&t.length){e=t.filter(function(t){return!i.isVisibleItem(t)&&!i.isDisabled(t)})}return e},getDisabledItems:function(){return this.getAllItems().filter(function(t){return this.isDisabled(t)},this)},getMoreButton:function(){var t=null;this.getAllItems().forEach(function(e){!t&&BX.hasClass(e,this.classItemMore)&&(t=e)},this);return t},getLastVisibleItem:function(){var t=this.getVisibleItems();var e=null;if(BX.type.isArray(t)&&t.length){e=t[t.length-1]}if(!BX.type.isDomNode(e)){e=null}return e},adjustMoreButtonPosition:function(){var t=this.getLastVisibleItem();var e=this.isMoreButton(t);if(!e){this.listContainer.insertBefore(this.moreButton,t)}this.updateMoreButtonCounter()},getSubmenuId:function(t){var e="";if(BX.type.isDomNode(this.listContainer)&&BX.type.isNotEmptyString(this.listContainer.id)){e=this.submenuIdPrefix+this.listContainer.id}if(t){e=this.submenuWindowIdPrefix+e}return e},getChildMenuId:function(){var t="";if(BX.type.isDomNode(this.listContainer)&&BX.type.isNotEmptyString(this.listContainer.id)){t=this.childMenuIdPrefix+this.listContainer.id}return t},getSubmenuItemText:function(t){var e,i,s;if(!BX.type.isDomNode(t)){return null}e=this.findChildrenByClassName(t,this.classItemText);i=this.findChildrenByClassName(t,this.classItemCounter);if(BX.type.isDomNode(i)&&BX.type.isDomNode(e)){i.dataset.counter=this.dataValue(t,"counter");s=e.outerHTML+i.outerHTML}else{e=this.dataValue(t,"text");i=this.dataValue(t,"counter");s=e}return s},getChildMenuItemText:function(t){var e,i,s;if(!BX.type.isDomNode(t)){return null}e=this.findChildrenByClassName(t,this.classItemText);i=this.findChildrenByClassName(t,this.classItemCounter);if(BX.type.isDomNode(i)&&BX.type.isDomNode(e)){i.dataset.counter=this.dataValue(t,"counter");s=e.outerHTML+i.outerHTML}else{e=this.dataValue(t,"text");s=e}return s},getLockedClass:function(t){var e="";if(BX.type.isDomNode(t)&&this.isLocked(t)){e=this.classItemLocked}return e},getSubmenuItems:function(){var t=this.getAllItems();var e=this.getHiddenItems();var i=this.getDisabledItems();var s=[];var n,a;if(t.length){t.forEach(function(t){if(e.indexOf(t)===-1&&i.indexOf(t)===-1){s.push({text:this.getSubmenuItemText(t),href:this.dataValue(t,"url"),onclick:this.dataValue(t,"onclick"),title:t.getAttribute("title"),className:[this.classSubmenuItem,this.getIconClass(t),this.classSecret,this.getAliasLink(t),this.getLockedClass(t)].join(" ")})}},this)}if(e.length){e.forEach(function(t){try{n=JSON.parse(this.dataValue(t,"item"))}catch(t){n=null}a=[this.classSubmenuItem,this.getIconClass(t),this.getAliasLink(t),this.getLockedClass(t)];if(BX.type.isPlainObject(n)&&("IS_ACTIVE"in n&&n.IS_ACTIVE===true||n.IS_ACTIVE==="true"||n.IS_ACTIVE==="Y")){a.push(this.classItemActive)}s.push({text:this.getSubmenuItemText(t),href:this.dataValue(t,"url"),onclick:this.dataValue(t,"onclick"),title:t.getAttribute("title"),className:a.join(" "),items:this.getChildMenuItems(t)})},this)}if(this.isSettingsEnabled){s.push({text:"<span>"+this.message("MIB_HIDDEN")+"</span>",className:[this.classSeporator,this.classSubmenuItem,this.classHiddenLabel].join(" ")});if(!i.length){s.push({text:"<span>"+this.message("MIB_NO_HIDDEN")+"</span>",className:[this.classSubmenuItem,this.classSubmenuNoHiddenItem].join(" ")})}if(i.length){i.forEach(function(t){try{n=JSON.parse(this.dataValue(t,"item"))}catch(t){n=null}a=[this.classSubmenuItem,this.classItemDisabled,this.getIconClass(t),this.getAliasLink(t),this.getLockedClass(t)];if(BX.type.isPlainObject(n)&&("IS_ACTIVE"in n&&n.IS_ACTIVE===true||n.IS_ACTIVE==="true"||n.IS_ACTIVE==="Y")){a.push(this.classItemActive)}s.push({text:this.getSubmenuItemText(t),href:this.dataValue(t,"url"),onclick:this.dataValue(t,"onclick"),title:t.getAttribute("title"),className:a.join(" "),items:this.getChildMenuItems(t)})},this)}s.push({text:"<span>"+this.message("MIB_MANAGE")+"</span>",className:[this.classSeporator,this.classSubmenuItem,this.classHiddenLabel,this.classManage].join(" ")});s.push({text:this.message("MIB_SETTING_MENU_ITEM"),className:[this.classSettingMenuItem,this.classSubmenuItem].join(" ")});s.push({text:this.message("MIB_APPLY_SETTING_MENU_ITEM"),className:[this.classSettingsApplyButton,this.classSubmenuItem].join(" ")});s.push({text:this.message("MIB_RESET_SETTINGS"),className:[this.classSettingsResetButton,this.classSubmenuItem].join(" ")})}return s},getChildMenuItems:function(t){var e;try{e=JSON.parse(this.dataValue(t,"item"))}catch(t){e=null}if(!BX.type.isPlainObject(e)){return[]}if(!BX.type.isArray(this.listChildItems[t.id])){var i={};this.setListAllItems(i,e);var s=this.getListItems(i,"");if(s.length){this.listChildItems[t.id]=BX.type.isArray(s[0].items)?s[0].items:[]}}return this.listChildItems[t.id]},setListAllItems:function(t,e){var i=[];if(BX.type.isPlainObject(e)){i.push(e)}else{i=e}i.forEach(function(e){t[e["ID"].replace(this.containerId+"_","")]=e;if(BX.type.isArray(e["ITEMS"])){this.setListAllItems(t,e["ITEMS"])}},this)},getListItems:function(t,e){var i=[];for(var s in t){if(!t.hasOwnProperty(s)){continue}var n=t[s];if(n["PARENT_ID"]===e){var a,o={text:n["TEXT"],href:n["URL"],onclick:n["ON_CLICK"],title:n["TITLE"]};a=this.getListItems(t,s);if(a.length){o.items=a}i.push(o);delete t[s]}}return i},getSubmenuArgs:function(){var t=this.getSubmenuId();var e=this.moreButton;var i=BX.pos(e);var s=this.getSubmenuItems();var n={autoHide:true,offsetLeft:i.width/2-80,angle:{position:"top",offset:100},zIndex:0,events:{onPopupClose:BX.delegate(this._onSubmenuClose,this)}};return[t,e,s,n]},getChildMenuArgs:function(t){var e=this.getChildMenuId();var i=this.getChildMenuItems(t);if(!i||BX.type.isArray(i)&&!i.length){return[]}var s={autoHide:true,angle:true,offsetLeft:t.getBoundingClientRect().width/2};return[e,t,i,s]},visibleControlMoreButton:function(){var t=this.getHiddenItems();if(!t.length||t.length===1&&this.isMoreButton(t[0])){this.getMoreButton().style.display="none"}else{this.getMoreButton().style.display=""}},createSubmenu:function(){var t=BX.PopupMenu.create.apply(BX.PopupMenu,this.getSubmenuArgs());if(this.isSettingsEnabled){this.dragAndDropInitInSubmenu()}t.menuItems.forEach(function(t){BX.bind(t.layout.item,"click",BX.delegate(this._onDocumentClick,this))},this);return t},createChildMenu:function(t){return BX.PopupMenu.create.apply(BX.PopupMenu,this.getChildMenuArgs(t))},showSubmenu:function(){var t=this.getSubmenu();if(t!==null){t.popupWindow.show()}else{this.destroySubmenu();t=this.createSubmenu();t.popupWindow.show()}this.setSubmenuShown(true);this.activateItem(this.moreButton);if(this.isEditEnabled()){t.popupWindow.setAutoHide(false)}},showChildMenu:function(t){var e=BX.PopupMenu.getMenuById(this.getChildMenuId()),i=null;if(e&&e.bindElement){if(e.bindElement.id!==t.id){this.destroyChildMenu(t);i=this.createChildMenu(t);i.popupWindow.show()}else{e.popupWindow.show()}}else{this.destroyChildMenu(t);i=this.createChildMenu(t);i.popupWindow.show()}},closeSubmenu:function(){var t=this.getSubmenu();if(t===null){return}t.popupWindow.close();if(!this.isActiveInMoreMenu()){this.deactivateItem(this.moreButton)}this.setSubmenuShown(false)},closeChildMenu:function(t){var e=this.getChildMenu(t);if(e===null){return}e.popupWindow.close()},getSubmenu:function(){return BX.PopupMenu.getMenuById(this.getSubmenuId())},getChildMenu:function(){return BX.PopupMenu.getMenuById(this.getChildMenuId())},destroySubmenu:function(){BX.PopupMenu.destroy(this.getSubmenuId())},destroyChildMenu:function(){BX.PopupMenu.destroy(this.getChildMenuId())},refreshSubmenu:function(){var t=this.getSubmenu();var e;if(t===null){return}e=this.getSubmenuArgs();if(BX.type.isArray(e)){this.destroySubmenu();this.createSubmenu();this.showSubmenu()}},setSubmenuShown:function(t){this.isSubmenuShown=false;if(BX.type.isBoolean(t)){this.isSubmenuShown=t}},activateItem:function(t){if(!BX.type.isDomNode(t)){return}if(!BX.hasClass(t,this.classItemActive)){BX.addClass(t,this.classItemActive)}},deactivateItem:function(t){if(!BX.type.isDomNode(t)){return}if(BX.hasClass(t,this.classItemActive)){BX.removeClass(t,this.classItemActive)}},getCurrentSettings:function(){var t={};this.getAllItems().forEach(function(e,i){t[e.id]={sort:i,isDisabled:this.isDisabled(e)}},this);return t},saveSettings:function(){var t=this.getCurrentSettings();var e="settings";var i;if(!BX.type.isPlainObject(t)){return}if(BX.type.isDomNode(this.listContainer)){if("id"in this.listContainer){i=this.listContainer.id;t=JSON.stringify(t);BX.userOptions.save("ui",i,e,t);this.setHome()}}},resetSettings:function(){var t=null;var e=BX.PopupWindowManager.create(this.listContainer.id+"_reset_popup",null,{content:this.message("MIB_RESET_ALERT"),autoHide:false,overlay:true,closeByEsc:true,closeIcon:true,draggable:{restrict:true},titleBar:this.message("MIB_RESET_SETTINGS"),buttons:[t=new BX.PopupWindowButton({text:this.message("MIB_RESET_BUTTON"),className:"popup-window-button-create",events:{click:function(){if(BX.hasClass(t.buttonNode,"popup-window-button-wait")){return}BX.addClass(t.buttonNode,"popup-window-button-wait");this.handleResetSettings(function(i){if(i){BX.removeClass(t.buttonNode,"popup-window-button-wait");e.setContent(i)}else{var s="settings";BX.userOptions.save("ui",this.listContainer.id,s,JSON.stringify({}));BX.userOptions.save("ui",this.listContainer.id,"firstPageLink","");window.location.reload()}}.bind(this))}.bind(this)}}),new BX.PopupWindowButtonLink({text:this.message("MIB_CANCEL_BUTTON"),className:"popup-window-button-link-cancel",events:{click:function(){this.popupWindow.close()}}})]});e.show()},handleResetSettings:function(t){var e=[];BX.onCustomEvent("BX.Main.InterfaceButtons:onBeforeResetMenu",[e,this]);var i=new BX.Promise;var s=i;for(var n=0;n<e.length;n++){i=i.then(e[n])}i.then(function(e){t(null,e)},function(e){t(e,null)});s.fulfill()},moveButtonAlias:function(t){var e,i;if(!t||!this.dragItem){return}e=this.getItemAlias(this.dragItem);i=this.getItemAlias(t);if(this.isListItem(e)){if(!i){this.listContainer.appendChild(e)}else{this.listContainer.insertBefore(e,i)}}},moveButton:function(t){var e;if(!BX.type.isDomNode(t)||!BX.type.isDomNode(this.dragItem)){return}if(this.isListItem(t)){if(this.isDisabled(this.dragItem)){this.dragItem.dataset.disabled="false"}if(BX.type.isDomNode(t)){this.listContainer.insertBefore(this.dragItem,t)}else{this.listContainer.appendChild(this.dragItem)}}if(this.isSubmenuItem(t)){if(this.isDisabled(this.dragItem)&&!this.isDisabled(t)){this.enableItem(this.dragItem)}e=this.getSubmenuContainer();e.insertBefore(this.dragItem,t)}},getSubmenuContainer:function(){var t=this.getSubmenu();var e=null;if(t!==null){e=t.itemsContainer}return e},findNextSiblingByClass:function(t,e){var i=t;for(;!!t;t=t.nextElementSibling){if(e){if(BX.hasClass(t,e)&&t!==i){return t}}else{return null}}},findParentByClassName:function(t,e){for(;t&&t!==document;t=t.parentNode){if(e){if(BX.hasClass(t,e)){return t}}else{return null}}},findChildrenByClassName:function(t,e){var i=null;if(BX.type.isDomNode(t)&&BX.type.isNotEmptyString(e)){i=BX.Buttons.Utils.getByClass(t,e)}return i},dragAndDropInit:function(){this.getAllItems().forEach(function(t,e){if(!this.isSeparator(t)&&!this.isSettings(t)&&!this.isApplySettingsButton(t)&&!this.isResetSettingsButton(t)){t.setAttribute("draggable","true");t.setAttribute("tabindex","-1");t.dataset.link="item"+e;BX.bind(t,"dragstart",BX.delegate(this._onDragStart,this));BX.bind(t,"dragend",BX.delegate(this._onDragEnd,this));BX.bind(t,"dragenter",BX.delegate(this._onDragEnter,this));BX.bind(t,"dragover",BX.delegate(this._onDragOver,this));BX.bind(t,"dragleave",BX.delegate(this._onDragLeave,this));BX.bind(t,"drop",BX.delegate(this._onDrop,this))}BX.bind(t,"mouseover",BX.delegate(this._onMouse,this));BX.bind(t,"mouseout",BX.delegate(this._onMouse,this))},this)},dragAndDropInitInSubmenu:function(){var t=this.getSubmenu();var e=t.menuItems;e.forEach(function(t){if(!this.isSeparator(t.layout.item)&&!this.isSettings(t.layout.item)&&!this.isApplySettingsButton(t.layout.item)&&!this.isResetSettingsButton(t.layout.item)){t.layout.item.draggable=true;t.layout.item.dataset.sortable=true;BX.bind(t.layout.item,"dragstart",BX.delegate(this._onDragStart,this));BX.bind(t.layout.item,"dragenter",BX.delegate(this._onDragEnter,this));BX.bind(t.layout.item,"dragover",BX.delegate(this._onDragOver,this));BX.bind(t.layout.item,"dragleave",BX.delegate(this._onDragLeave,this));BX.bind(t.layout.item,"dragend",BX.delegate(this._onDragEnd,this));BX.bind(t.layout.item,"drop",BX.delegate(this._onDrop,this))}if(BX.hasClass(t.layout.item,this.classHiddenLabel)&&!BX.hasClass(t.layout.item,this.classManage)){BX.bind(t.layout.item,"dragover",BX.delegate(this._onDragOver,this))}},this)},getItem:function(t){if(!BX.type.isDomNode(t)){if(!t||!BX.type.isDomNode(t.target)){return null}}else{t={target:t}}var e=this.findParentByClassName(t.target,this.classItem);if(!BX.type.isDomNode(e)){e=this.findParentByClassName(t.target,this.classDefaultSubmenuItem)}return e},setOpacity:function(t){if(!BX.type.isDomNode(t)){return}BX.style(t,"opacity",".1")},unsetOpacity:function(t){if(!BX.type.isDomNode(t)){return}BX.style(t,"opacity","1")},setDragStyles:function(){BX.addClass(this.listContainer,this.classOnDrag);BX.addClass(BX(this.getSubmenuId(true)),this.classOnDrag);this.setOpacity(this.dragItem)},unsetDragStyles:function(){var t=this.getSubmenu();this.getAllItems().forEach(function(t){this.unsetOpacity(t);BX.removeClass(t,"over")},this);if(t&&"menuItems"in t&&BX.type.isArray(t.menuItems)&&t.menuItems.length){t.menuItems.forEach(function(t){this.unsetOpacity(t);BX.removeClass(t.layout.item,"over")},this)}BX.removeClass(this.listContainer,this.classOnDrag);BX.removeClass(BX(this.getSubmenuId(true)),this.classOnDrag)},getIconClass:function(t){var e="";if(BX.type.isDomNode(t)&&"dataset"in t&&"class"in t.dataset&&BX.type.isNotEmptyString(t.dataset.class)){e=t.dataset.class}return e},disableItem:function(t){var e=this.getItemAlias(t);if(t&&"dataset"in t){t.dataset.disabled="true";if(e){e.dataset.disabled="true"}}},enableItem:function(t){var e;if(!BX.type.isDomNode(t)){return}if(this.isSubmenuItem(t)){BX.removeClass(t,this.classItemDisabled);e=this.getItemAlias(t);if(BX.type.isDomNode(e)){e.dataset.disabled="false"}}},getAliasLink:function(t){return this.dataValue(t,"link")||""},getItemAlias:function(t){var e=null;if(!BX.type.isDomNode(t)){return e}var i=this.getAllItems();var s=this.isSubmenuItem(t);var n=this.isListItem(t);if(!s&&!n){return e}if(s){i.forEach(function(i){BX.hasClass(t,this.getAliasLink(i))&&(e=i)},this)}if(n){e=BX.Buttons.Utils.getByClass(document,this.getAliasLink(t))}return e},hideItem:function(t){!!t&&BX.addClass(t,this.classSecret)},showItem:function(t){!!t&&BX.removeClass(t,this.classSecret)},fakeDragItem:function(){var t=null;if(!BX.type.isDomNode(this.dragItem)||!BX.type.isDomNode(this.overItem)){return}if(this.isDragToSubmenu()){t=this.getItemAlias(this.dragItem);if(t!==this.dragItem){this.listContainer.appendChild(this.dragItem);this.dragItem=t;this.showItem(this.dragItem);this.adjustMoreButtonPosition();this.updateSubmenuItems();this.tmp.moved=false;this.tmp.movetToSubmenu=true;this.setOpacity(this.dragItem)}}if(this.isDragToList()&&!this.tmp.movetToSubmenu){t=this.getItemAlias(this.dragItem);if(t!==this.dragItem){this.hideItem(this.dragItem);this.dragItem=t;this.adjustMoreButtonPosition();this.updateSubmenuItems();this.setOpacity(this.dragItem)}}this.tmp.movetToSubmenu=false},updateSubmenuItems:function(){var t=this.getHiddenItems();var e=this.getDisabledItems();var i=this;var s=[];var n,a,o;n=this.getSubmenu();if(n===null){return}a=n.menuItems;if(!BX.type.isArray(a)||!a.length){return}s=e.concat(t);a.forEach(function(t){o=[].some.call(s,function(e){return BX.hasClass(t.layout.item,i.dataValue(e,"link"))||i.isDisabled(t.layout.item)||i.isSeparator(t.layout.item)||i.isDropzone(t.layout.item)});if(o||(i.isSettings(t.layout.item)||i.isApplySettingsButton(t.layout.item)||i.isResetSettingsButton(t.layout.item)||i.isNotHiddenItem(t.layout.item)||i.isSeparator(t.layout.item)||t.layout.item===i.dragItem)&&!i.isMoreButton(t.layout.item)){i.showItem(t.layout.item)}else{i.hideItem(t.layout.item)}})},isNotHiddenItem:function(t){return BX.hasClass(t,this.classSubmenuNoHiddenItem)},getNotHidden:function(){return BX.Buttons.Utils.getByClass(this.getSubmenuContainer(),this.classSubmenuNoHiddenItem)},setOverStyles:function(t){if(BX.type.isDomNode(t)&&!BX.hasClass(t,this.classItemOver)){BX.addClass(t,this.classItemOver)}},unsetOverStyles:function(t){if(BX.type.isDomNode(t)&&BX.hasClass(t,this.classItemOver)){BX.removeClass(t,this.classItemOver)}},dataValue:function(t,e){var i="";var s;if(BX.type.isDomNode(t)){s=BX.data(t,e);if(typeof s!=="undefined"){i=s}}return i},execScript:function(script){if(BX.type.isNotEmptyString(script)){eval(script)}},showLicenseWindow:function(){var t;if(!B24.licenseInfoPopup){return}t=B24.licenseInfoPopup;t.init({B24_LICENSE_BUTTON_TEXT:this.message("MIB_LICENSE_BUY_BUTTON"),B24_TRIAL_BUTTON_TEXT:this.message("MIB_LICENSE_TRIAL_BUTTON"),IS_FULL_DEMO_EXISTS:this.licenseParams.isFullDemoExists,HOST_NAME:this.licenseParams.hostname,AJAX_URL:this.licenseParams.ajaxUrl,LICENSE_ALL_PATH:this.licenseParams.licenseAllPath,LICENSE_DEMO_PATH:this.licenseParams.licenseDemoPath,FEATURE_GROUP_NAME:this.licenseParams.featureGroupName,AJAX_ACTIONS_URL:this.licenseParams.ajaxActionsUrl,B24_FEATURE_TRIAL_SUCCESS_TEXT:this.message("MIB_LICENSE_WINDOW_TRIAL_SUCCESS_TEXT")});t.show("main-buttons",this.message("MIB_LICENSE_WINDOW_HEADER_TEXT"),this.message("MIB_LICENSE_WINDOW_TEXT"))},_onDragStart:function(t){var e=this.getVisibleItems();var i=BX.type.isArray(e)?e.length:null;this.dragItem=this.getItem(t);if(!BX.type.isDomNode(this.dragItem)){return}if(i===2&&this.isListItem(this.dragItem)){t.preventDefault();BX.onCustomEvent(window,"BX.Main.InterfaceButtons:onHideLastVisibleItem",[this.dragItem,this]);return}if(this.isMoreButton(this.dragItem)||this.isSeparator(this.dragItem)||this.isNotHiddenItem(this.dragItem)){t.preventDefault();return}this.isSubmenuShownOnDragStart=!!this.isSubmenuShown;if(this.isListItem(this.dragItem)){this.showSubmenu()}this.setDragStyles();if(!this.isEditEnabled()){this.enableEdit()}},_onDragEnd:function(t){t.preventDefault();var e=this.getItem(t);var i,s;if(!BX.type.isDomNode(e)){return}this.unsetDragStyles();if(!this.isSubmenuShownOnDragStart){this.refreshSubmenu();if(!this.isEditEnabled()){this.closeSubmenu()}}else{this.refreshSubmenu()}i=BX.findNextSibling(this.dragItem,BX.delegate(function(t){return this.isVisibleItem(t)},this));s=BX.findPreviousSibling(this.dragItem,BX.delegate(function(t){return this.isVisibleItem(t)},this));if(BX.type.isDomNode(s)&&(BX.hasClass(s,this.classHiddenLabel)||this.isDisabled(s)&&this.isSubmenuItem(s))||(BX.type.isDomNode(i)&&BX.hasClass(i,this.classManage)||this.isDisabled(i)&&this.isSubmenuItem(i))){this.disableItem(this.dragItem);this.refreshSubmenu()}if(this.isEditEnabled()){this.enableEdit();BX.show(this.getSettingsApplyButton());BX.hide(this.getSettingsButton())}else{this.disableEdit();BX.hide(this.getSettingsApplyButton());BX.show(this.getSettingsButton())}this.updateMoreButtonCounter();this.saveSettings();this.dragItem=null;this.overItem=null;this.tmp.moved=false},updateMoreButtonCounter:function(){var t,e,i,s;t=this.getHiddenItems();s=this.getDisabledItems();t=t.concat(s);e=0;if(BX.type.isArray(t)){t.forEach(function(t){e+=parseInt(this.dataValue(t,"counter"))||0},this)}if(BX.type.isNumber(e)){this.setMoreButtonCounter(e)}},_onDragEnter:function(t){var e=this.getItem(t);if(BX.type.isDomNode(e)&&this.isNotHiddenItem(e)){this.setOverStyles(e)}},_onDragOver:function(t){t.preventDefault();var e=null;this.overItem=this.getItem(t);if(!BX.type.isDomNode(this.overItem)||!BX.type.isDomNode(this.dragItem)||this.overItem===this.dragItem||this.isNotHiddenItem(this.overItem)){return}this.fakeDragItem();if(this.isNext(t)&&this.isGoodPosition(t)&&!this.isMoreButton(this.overItem)){e=this.findNextSiblingByClass(this.overItem,this.classItem);if(this.isMoreButton(e)&&!this.tmp.moved){e=e.previousElementSibling;this.tmp.moved=true}if(!BX.type.isDomNode(e)){e=this.findNextSiblingByClass(this.overItem,this.classSubmenuItem)}if(BX.type.isDomNode(e)){this.moveButton(e);this.moveButtonAlias(e);this.adjustMoreButtonPosition();this.updateSubmenuItems()}}if(!this.isNext(t)&&this.isGoodPosition(t)&&!this.isMoreButton(this.overItem)||!this.isGoodPosition(t)&&this.isMoreButton(this.overItem)&&this.getVisibleItems().length===1){this.moveButton(this.overItem);this.moveButtonAlias(this.overItem);this.adjustMoreButtonPosition();this.updateSubmenuItems()}},_onDragLeave:function(t){var e=this.getItem(t);if(BX.type.isDomNode(e)){this.unsetOverStyles(t.target)}},_onDrop:function(t){var e=this.getItem(t);if(!BX.type.isDomNode(e)){return}if(this.isNotHiddenItem(e)||this.isDisabled(e)){this.disableItem(this.dragItem);this.adjustMoreButtonPosition()}this.unsetDragStyles();t.preventDefault()},getIndex:function(t,e){return[].indexOf.call(t||[],e)},_onSubmenuClose:function(){this.setSubmenuShown(false);if(this.isEditEnabled()){this.activateItem(this.moreButton)}else{if(!this.isActiveInMoreMenu()){this.deactivateItem(this.moreButton)}}},_onResizeHandler:function(){this.adjustMoreButtonPosition();this.updateSubmenuItems();if(!this.isSettingsEnabled){this.visibleControlMoreButton()}},_onClickMoreButton:function(t){t.preventDefault();this.showSubmenu()},_onMouse:function(t){var e=this.getItem(t);if(t.type==="mouseover"&&!BX.hasClass(e,this.classItemOver)){if(!BX.hasClass(e,this.classItemMore)){this.showChildMenu(e)}BX.addClass(e,this.classItemOver)}if(t.type==="mouseout"&&BX.hasClass(e,this.classItemOver)){BX.removeClass(e,this.classItemOver)}},getSettingsResetButton:function(){return BX.Buttons.Utils.getByClass(this.getSubmenuContainer(),this.classSettingsResetButton)},_onScroll:function(){if(BX.style(this.pinContainer,"position")==="fixed"){this.closeSubmenu()}},isDisabled:function(t){var e=false;if(BX.type.isDomNode(t)){e=this.dataValue(t,"disabled")==="true"||BX.hasClass(t,this.classItemDisabled)}return e},isSettings:function(t){var e=false;if(BX.type.isDomNode(t)){e=BX.hasClass(t,this.classSettingMenuItem)}return e},isLocked:function(t){var e=false;if(BX.type.isDomNode(t)){e=this.dataValue(t,"locked")==="true"||BX.hasClass(t,this.classItemLocked)}return e},isDropzone:function(t){return BX.hasClass(t,this.classDropzone)},isNext:function(t){var e=this.dragItem.getBoundingClientRect();var i=this.overItem.getBoundingClientRect();var s=getComputedStyle(this.dragItem);var n=parseInt(s.marginRight.replace("px",""));var a=null;if(this.isListItem(this.overItem)){a=t.clientX>i.left-n&&t.clientX>e.right}if(this.isSubmenuItem(this.overItem)){a=t.clientY>e.top}return a},isGoodPosition:function(t){var e=this.overItem;var i,s;if(!BX.type.isDomNode(e)){return false}i=e.getBoundingClientRect();if(this.isListItem(e)){s=this.isNext(t)&&t.clientX>=i.left+i.width/2||!this.isNext(t)&&t.clientX<=i.left+i.width/2}if(this.isSubmenuItem(e)){s=this.isNext(t)&&t.clientY>=i.top+i.height/2||!this.isNext(t)&&t.clientY<=i.top+i.height/2}return s},isSubmenuItem:function(t){return BX.hasClass(t,this.classSubmenuItem)},isVisibleItem:function(t){if(!BX.type.isDomNode(t)){return false}return t.offsetTop===0},isMoreButton:function(t){var e=false;if(BX.type.isDomNode(t)&&BX.hasClass(t,this.classItemMore)){e=true}return e},isListItem:function(t){var e=false;if(BX.type.isDomNode(t)&&BX.hasClass(t,this.classItem)){e=true}return e},isSublink:function(t){var e=false;if(BX.type.isDomNode(t)){e=BX.hasClass(t,this.classItemSublink)}return e},isSeparator:function(t){var e=false;if(BX.type.isDomNode(t)){e=BX.hasClass(t,this.classSeporator)}return e},isDragToSubmenu:function(){return!this.isSubmenuItem(this.dragItem)&&this.isSubmenuItem(this.overItem)},isDragToList:function(){return this.isSubmenuItem(this.dragItem)&&!this.isSubmenuItem(this.overItem)}}}if(typeof BX.Main.interfaceButtonsManager==="undefined"){BX.Main.interfaceButtonsManager={data:{},init:function(t){var e=null;if(!BX.type.isPlainObject(t)||!("containerId"in t)){throw"BX.Main.interfaceButtonsManager: containerId not set in params Object"}e=BX(t.containerId);if(BX.type.isDomNode(e)){this.data[t.containerId]=new BX.Main.interfaceButtons(e,t)}else{BX(BX.delegate(function(){e=BX(t.containerId);if(!BX.type.isDomNode(e)){throw"BX.Main.interfaceButtonsManager: container is not dom node"}this.data[t.containerId]=new BX.Main.interfaceButtons(e,t)},this))}},getById:function(t){var e=null;if(BX.type.isString(t)&&BX.type.isNotEmptyString(t)){try{e=this.data[t]}catch(t){}}return e},getObjects:function(){return this.data}}}
/* End */
;
; /* Start:"a:4:{s:4:"full";s:94:"/bitrix/components/bitrix/main.interface.buttons/templates/.default/utils.min.js?1544127384575";s:6:"source";s:76:"/bitrix/components/bitrix/main.interface.buttons/templates/.default/utils.js";s:3:"min";s:80:"/bitrix/components/bitrix/main.interface.buttons/templates/.default/utils.min.js";s:3:"map";s:80:"/bitrix/components/bitrix/main.interface.buttons/templates/.default/utils.map.js";}"*/
(function(){"use strict";BX.namespace("BX.Buttons");BX.Buttons.Utils={getByClass:function(e,t,l){var n=[];if(t){n=(e||document.body).getElementsByClassName(t);if(!l){n=n.length?n[0]:null}else{n=[].slice.call(n)}}return n},getByTag:function(e,t,l){var n=[];if(t){n=(e||document.body).getElementsByTagName(t);if(!l){n=n.length?n[0]:null}else{n=[].slice.call(n)}}return n},getBySelector:function(e,t,l){var n=[];if(t){if(!l){n=(e||document.body).querySelector(t)}else{n=(e||document.body).querySelectorAll(t);n=[].slice.call(n)}}return n}}})();
/* End */
;
; /* Start:"a:4:{s:4:"full";s:90:"/bitrix/components/bitrix/crm.product.list/templates/.default/script.min.js?15441274015509";s:6:"source";s:71:"/bitrix/components/bitrix/crm.product.list/templates/.default/script.js";s:3:"min";s:75:"/bitrix/components/bitrix/crm.product.list/templates/.default/script.min.js";s:3:"map";s:75:"/bitrix/components/bitrix/crm.product.list/templates/.default/script.map.js";}"*/
BX.CrmProductSectionManager=function(){this._id="";this._settings={};this._dialogs={}};BX.CrmProductSectionManager.prototype={initialize:function(e,t){this._id=e;this._settings=t?t:{}},getSetting:function(e,t){return typeof this._settings[e]!="undefined"?this._settings[e]:t},getMessage:function(e){return typeof BX.CrmProductSectionManager.messages[e]!="undefined"?BX.CrmProductSectionManager.messages[e]:""},addSection:function(){this._dialogs["ADD"]={};var e=this._dialogs["ADD"]["POPUP"]=new BX.PopupWindow(this._id+"SectionAdd",null,{autoHide:false,draggable:true,offsetLeft:0,offsetTop:0,bindOptions:{forceBindPosition:false},closeByEsc:true,closeIcon:{top:"10px",right:"15px"},titleBar:this.getMessage("addDialogTitle"),events:{onPopupShow:function(){},onPopupClose:BX.delegate(function(){this._dialogs["ADD"]["POPUP"].destroy()},this),onPopupDestroy:BX.delegate(function(){delete this._dialogs["ADD"]},this)},content:this._prepareSectionAddDialogContent()});e.show();var t=this._dialogs["ADD"]["ELEMENTS"]["NAME"];BX.focus(t);t.select()},_prepareSectionAddDialogContent:function(){var e=BX.create("TABLE");var t=e.insertRow(-1);var i=t.insertCell(-1);t=e.insertRow(-1);i=t.insertCell(-1);var a=BX.create("DIV",{attrs:{"class":"bx-crm-popup-content"}});i.appendChild(a);a.appendChild(BX.create("LABEL",{attrs:{"class":"bx-crm-popup-label"},html:this.getMessage("nameFieldTitle")+":"}));if(!this._dialogs["ADD"]){this._dialogs["ADD"]={}}this._dialogs["ADD"]["ELEMENTS"]={};a.appendChild(this._dialogs["ADD"]["ELEMENTS"]["NAME"]=BX.create("INPUT",{attrs:{"class":"bx-crm-popup-input"},props:{type:"text",value:this.getMessage("defaultName")},style:{fontSize:"16px",marginTop:"10px"}}));a=BX.create("DIV",{attrs:{"class":"bx-crm-popup-buttons"},children:[BX.create("A",{attrs:{"class":"bx-crm-btn bx-crm-btn-big bx-crm-btn-green"},text:this.getMessage("addBtnText"),events:{click:BX.delegate(this._hanleSectionAddDialogSave,this)}}),BX.create("A",{attrs:{"class":"bx-crm-btn bx-crm-btn-big bx-crm-btn-transparent"},text:this.getMessage("cancelBtnText"),events:{click:BX.delegate(this._hanleSectionAddDialogCancel,this)}})]});i.appendChild(a);return e},_hanleSectionAddDialogSave:function(){var e=BX(this.getSetting("formID"));var t=BX(this.getSetting("actionField"));var i=BX(this.getSetting("nameField"));var a=this._dialogs["ADD"]["ELEMENTS"]["NAME"];if(e&&t&&i&&a){var s=a.value;if(!BX.type.isNotEmptyString(s)){alert(this.getMessage("emptyNameError"));return}if(a.value.length>0){t.value="ADD_SECTION";i.value=a.value;BX.showWait();e.submit()}}},_hanleSectionAddDialogCancel:function(){this._dialogs["ADD"]["POPUP"].close()},renameSection:function(e,t){this._dialogs["RENAME"]={};this._dialogs["RENAME"]["DATA"]={};this._dialogs["RENAME"]["DATA"]["ID"]=e;this._dialogs["RENAME"]["DATA"]["NAME"]=t;var i=this._dialogs["RENAME"]["POPUP"]=new BX.PopupWindow(this._id+"SectionRename",null,{autoHide:false,draggable:true,offsetLeft:0,offsetTop:0,bindOptions:{forceBindPosition:false},closeByEsc:true,closeIcon:{top:"10px",right:"15px"},titleBar:this.getMessage("renameDialogTitle"),events:{onPopupShow:function(){},onPopupClose:BX.delegate(function(){this._dialogs["RENAME"]["POPUP"].destroy()},this),onPopupDestroy:BX.delegate(function(){delete this._dialogs["RENAME"]},this)},content:this._prepareSectionRenameDialogContent()});i.show();var a=this._dialogs["RENAME"]["ELEMENTS"]["NAME"];BX.focus(a);a.select()},_prepareSectionRenameDialogContent:function(){var e=BX.create("TABLE");var t=e.insertRow(-1);var i=t.insertCell(-1);t=e.insertRow(-1);i=t.insertCell(-1);var a=BX.create("DIV",{attrs:{"class":"bx-crm-popup-content"}});i.appendChild(a);a.appendChild(BX.create("LABEL",{attrs:{"class":"bx-crm-popup-label"},html:this.getMessage("nameFieldTitle")+":"}));if(!this._dialogs["RENAME"]){this._dialogs["RENAME"]={}}this._dialogs["RENAME"]["ELEMENTS"]={};a.appendChild(this._dialogs["RENAME"]["ELEMENTS"]["NAME"]=BX.create("INPUT",{attrs:{"class":"bx-crm-popup-input"},props:{type:"text",value:this._dialogs["RENAME"]["DATA"]["NAME"]},style:{fontSize:"16px",marginTop:"10px"}}));a=BX.create("DIV",{attrs:{"class":"bx-crm-popup-buttons"},children:[BX.create("A",{attrs:{"class":"bx-crm-btn bx-crm-btn-big bx-crm-btn-green"},text:this.getMessage("renameBtnText"),events:{click:BX.delegate(this._hanleSectionRenameDialogSave,this)}}),BX.create("A",{attrs:{"class":"bx-crm-btn bx-crm-btn-big bx-crm-btn-transparent"},text:this.getMessage("cancelBtnText"),events:{click:BX.delegate(this._hanleSectionRenameDialogCancel,this)}})]});i.appendChild(a);return e},_hanleSectionRenameDialogSave:function(){BX.showWait();var e=BX(this.getSetting("formID"));var t=BX(this.getSetting("actionField"));var i=BX(this.getSetting("nameField"));var a=BX(this.getSetting("IDField"));var s=this._dialogs["RENAME"]["ELEMENTS"]["NAME"];var n=this._dialogs["RENAME"]["DATA"]["ID"];if(e&&t&&i&&s&&a&&n>0){if(s.value.length>0){t.value="RENAME_SECTION";i.value=s.value;a.value=n;e.submit()}}},_hanleSectionRenameDialogCancel:function(){this._dialogs["RENAME"]["POPUP"].close()}};BX.CrmProductSectionManager.getDefault=function(){return this._default};BX.CrmProductSectionManager.items={};BX.CrmProductSectionManager._default=null;BX.CrmProductSectionManager.create=function(e,t){var i=new BX.CrmProductSectionManager;i.initialize(e,t);this.items[e]=i;if(!this._default){this._default=i}return i};if(typeof BX.CrmProductSectionManager.messages=="undefined"){BX.CrmProductSectionManager.messages={}}
/* End */
;
; /* Start:"a:4:{s:4:"full";s:125:"/bitrix/components/bitrix/crm.interface.grid/templates/flat/bitrix/main.interface.grid/.default/script.min.js?154412740131128";s:6:"source";s:105:"/bitrix/components/bitrix/crm.interface.grid/templates/flat/bitrix/main.interface.grid/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
function BxInterfaceGrid(e){this.oActions={};this.oColsMeta={};this.oColsNames={};this.oEditData={};this.oSaveData={};this.oOptions={};this.oVisibleCols=null;this.vars={};this.menu=null;this.settingsMenu=[];this.filterMenu=[];this.checkBoxCount=0;this.bColsChanged=false;this.bViewsChanged=false;this.oFilterRows={};this.activeRow=null;var t=this;this.table_id=e;this.tableNode=BX(this.table_id);this.InitTable=function(){var e=document.getElementById(this.table_id);if(!e||e.rows.length<1||e.rows[0].cells.length<1)return;var i;var s=e.rows[0].cells.length;for(i=0;i<s;i++){var a;for(a=0;a<2;a++){var n=e.rows[a].cells[i];n.onmouseover=function(){t.HighlightGutter(this,true)};n.onmouseout=function(){t.HighlightGutter(this,false)};if(a==1){if(n.className&&(n.className=="bx-crm-actions-col"||n.className=="bx-crm-checkbox-col"))continue;if(this.vars.user_authorized){n.onbxdragstart=t.DragStart;n.onbxdragstop=t.DragStop;n.onbxdrag=t.Drag;n.onbxdraghout=function(){t.HighlightGutter(this,false)};jsDD.registerObject(n);n.onbxdestdraghover=t.DragHover;n.onbxdestdraghout=t.DragOut;n.onbxdestdragfinish=t.DragFinish;jsDD.registerDest(n)}}}}var l=e.rows.length;for(i=0;i<l;i++){var r=e.rows[i];if(r.className&&r.className=="bx-crm-grid-footer")continue;r.cells[0].className+=" bx-crm-left";r.cells[r.cells.length-1].className+=" bx-crm-right";if(i>=2){var o=r.cells[0].childNodes[0];if(o&&o.tagName&&o.tagName.toUpperCase()=="INPUT"&&o.type.toUpperCase()=="CHECKBOX"){o.onclick=function(){t.SelectRow(this);t.EnableActions()};jsUtils.addEvent(r,"click",t.OnClickRow);this.checkBoxCount++}}if(r.oncontextmenu)jsUtils.addEvent(r,"contextmenu",this.OnRowContext)}if(e.rows.length>2){e.rows[2].className+=" bx-top";var c=e.rows[e.rows.length-1];if(c.className&&c.className=="bx-crm-grid-footer")c=e.rows[e.rows.length-2];c.className+=" bx-crm-bottom"}var h=this;var d={gridObject:h,initEventParams:{}};if(typeof this.initEventParams==="object"&&this.initEventParams!==null){d["initEventParams"]=this.initEventParams}BX.onCustomEvent(window,"BXInterfaceGridAfterInitTable",[d])};this.OnRowContext=function(e){if(!t.menu)return;if(!e)e=window.event;if(!phpVars.opt_context_ctrl&&e.ctrlKey||phpVars.opt_context_ctrl&&!e.ctrlKey)return;var i;if(e.target)i=e.target;else if(e.srcElement)i=e.srcElement;var s=i;while(s&&!(s.tagName&&s.tagName.toUpperCase()=="TD"&&s.oncontextmenu))s=jsUtils.FindParentObject(s,"td");var a=null;if(s&&s.oncontextmenu){a=s.oncontextmenu();a[a.length]={SEPARATOR:true}}s=i;while(s&&!(s.tagName&&s.tagName.toUpperCase()=="TR"&&s.oncontextmenu))s=jsUtils.FindParentObject(s,"tr");var n=t.menu;n.PopupHide();t.activeRow=s;if(t.activeRow)t.activeRow.className+=" bx-active";n.OnClose=function(){if(t.activeRow){t.activeRow.className=t.activeRow.className.replace(/\s*bx-active/i,"");t.activeRow=null}t.SaveColumns()};var l=BX.util.array_merge(a,s.oncontextmenu());if(l.length==0)return;n.SetItems(l);n.BuildItems();var r=jsUtils.GetWindowScrollPos();var o=e.clientX+r.scrollLeft;var c=e.clientY+r.scrollTop;var h={};h["left"]=h["right"]=o;h["top"]=h["bottom"]=c;n.PopupShow(h);e.returnValue=false;if(e.preventDefault)e.preventDefault()};this.ShowActionMenu=function(e,i){t.menu.PopupHide();t.activeRow=jsUtils.FindParentObject(e,"tr");if(t.activeRow)t.activeRow.className+=" bx-active";t.menu.ShowMenu(e,t.oActions[i],false,false,function(){if(t.activeRow){t.activeRow.className=t.activeRow.className.replace(/\s*bx-active/i,"");t.activeRow=null}})};this.HighlightGutter=function(e,t){var i=e.parentNode.parentNode.parentNode;var s=i.rows[0].cells[e.cellIndex];var a=s.className.indexOf("bx-crm-sorted")!=-1;if(t){if(a){s.className+=" bx-over-sorted";e.className+=" bx-over-sorted"}else{s.className+=" bx-over";e.className+=" bx-over"}}else{if(a){s.className=s.className.replace(/\s*bx-over-sorted/i,"");e.className=e.className.replace(/\s*bx-over-sorted/i,"")}else{s.className=s.className.replace(/\s*bx-over/i,"");e.className=e.className.replace(/\s*bx-over/i,"")}}};this.HighlightRow=function(e,t){if(t)e.className+=" bx-over";else e.className=e.className.replace(/\s*bx-over/i,"")};this.SelectRow=function(e){var t=e.parentNode.parentNode;var i=t.parentNode.parentNode;var s=document.getElementById(i.id+"_selected_span");var a=parseInt(s.innerHTML);if(e.checked){t.className+=" bx-selected selected";a++}else{t.className=t.className.replace(/\s*bx-selected/gi,"");t.className=t.className.replace(/\s*selected/gi,"");a--}s.innerHTML=a.toString();var n=document.getElementById(i.id+"_check_all");if(a==this.checkBoxCount)n.checked=true;else n.checked=false;if(e.checked){BX.onCustomEvent("onSelectRow",[this,a,e])}else{BX.onCustomEvent("onUnSelectRow",[this,a,e])}};this.OnClickRow=function(e){if(!e)var e=window.event;var i=e.target?e.target:e.srcElement?e.srcElement:null;if(!i)return;if(!i.parentNode.cells)return;var s=i.parentNode.cells[0].childNodes[0];if(s&&s.tagName&&s.tagName.toUpperCase()=="INPUT"&&s.type.toUpperCase()=="CHECKBOX"&&!s.disabled){s.checked=!s.checked;t.SelectRow(s)}else{var a=BX.findParent(i,{tagName:"tr",className:"bx-crm-table-body"},this.tableNode);if(a){var n=BX.findChild(a,{tagName:"td",className:"bx-crm-checkbox-col"});if(n){s=BX.findChild(n,{tagName:"input",property:{type:"checkbox"}});if(s){s.checked=!s.checked;t.SelectRow(s)}}}}t.EnableActions()};this.SelectAllRows=function(e){var t=document.getElementById(this.table_id);var i=e.checked;var s;var a=t.rows.length;for(s=2;s<a;s++){var n=t.rows[s].cells[0].childNodes[0];if(n&&n.tagName&&n.tagName.toUpperCase()=="INPUT"&&n.type.toUpperCase()=="CHECKBOX"){if(n.checked!=i&&!n.disabled){n.checked=i;this.SelectRow(n)}}}this.EnableActions()};this.EnableActions=function(){var e=document.forms["form_"+this.table_id];if(!e)return;var t=this.IsActionEnabled();var i=this.IsActionEnabled("edit");if(e.apply)e.apply.disabled=!t};this.IsActionEnabled=function(e){var t=document.forms["form_"+this.table_id];if(!t)return;var i=false;var s=document.getElementById(this.table_id+"_selected_span");if(s&&parseInt(s.innerHTML)>0)i=true;var a=t["action_all_rows_"+this.table_id];if(e=="edit")return!(a&&a.checked)&&i;else return a&&a.checked||i};this.SwitchActionButtons=function(e){var t=document.getElementById("bx_grid_"+this.table_id+"_action_buttons");var i=t;while(i=jsUtils.FindNextSibling(i,"td"))i.style.display=e?"none":"";t.style.display=e?"":"none"};this.ActionEdit=function(e){if(this.IsActionEnabled("edit")){var t=document.forms["form_"+this.table_id];if(!t)return;this.SwitchActionButtons(true);var i=t["ID[]"];if(!i.length)i=new Array(i);for(var s=0;s<i.length;s++){var a=i[s];if(a.checked){var n=jsUtils.FindParentObject(a,"tr");BX.denyEvent(n,"dblclick");var l=jsUtils.FindParentObject(a,"td");l=jsUtils.FindNextSibling(l,"td");if(l.className=="bx-crm-actions-col")l=jsUtils.FindNextSibling(l,"td");var r=a.value;this.oSaveData[r]={};for(var o in this.oColsMeta){if(this.oColsMeta[o].editable==true&&this.oEditData[r][o]!==false){this.oSaveData[r][o]=l.innerHTML;l.innerHTML="";var c=this.oEditData[r][o];var h="FIELDS["+r+"]["+o+"]";switch(this.oColsMeta[o].type){case"checkbox":l.appendChild(BX.create("INPUT",{props:{type:"hidden",name:h,value:"N"}}));l.appendChild(BX.create("INPUT",{props:{type:"checkbox",name:h,value:"Y",checked:c=="Y",defaultChecked:c=="Y"}}));break;case"list":var d=[];var f,v;for(v=0;v<this.oColsMeta[o].items.length;v++){f=this.oColsMeta[o].items[v].val;d[d.length]=BX.create("OPTION",{props:{value:f,selected:f==c},text:this.oColsMeta[o].items[v].ttl})}l.appendChild(BX.create("SELECT",{props:{name:h},children:d}));break;case"date":var u=BX.create("SPAN",{style:{whiteSpace:"nowrap"}});u.appendChild(BX.create("INPUT",{props:{type:"text",name:h,value:c,size:this.oColsMeta[o].size?this.oColsMeta[o].size:10}}));u.appendChild(BX.create("A",{props:{href:"javascript:void(0);",title:this.vars.mess.calend_title},html:'<img src="'+this.vars.calendar_image+'" alt="'+this.vars.mess.calend_title+'" class="calendar-icon" onclick="BX.calendar({node:this, field:\''+h+"', bTime: true, currentTime: '"+this.vars.server_time+'\'});" onmouseover="this.className+=\' calendar-icon-hover\';" onmouseout="this.className = this.className.replace(/s*calendar-icon-hover/ig, \'\');" border="0"/>'}));l.appendChild(u);break;default:var m={className:"bx-crm-folder-title list",type:"text",name:h,value:c,size:this.oColsMeta[o].size?this.oColsMeta[o].size:15};if(this.oColsMeta[o].maxlength)m.maxLength=this.oColsMeta[o].maxlength;l.appendChild(BX.create("INPUT",{props:m}));break}}l=jsUtils.FindNextSibling(l,"td")}}a.disabled=true}t.elements["action_button_"+this.table_id].value="edit"}};this.ActionCancel=function(){var e=document.forms["form_"+this.table_id];if(!e)return;this.SwitchActionButtons(false);var t=e["ID[]"];if(!t.length)t=new Array(t);for(var i=0;i<t.length;i++){var s=t[i];if(s.checked){var a=jsUtils.FindParentObject(s,"tr");BX.allowEvent(a,"dblclick");var n=jsUtils.FindParentObject(s,"td");n=jsUtils.FindNextSibling(n,"td");if(n.className=="bx-crm-actions-col")n=jsUtils.FindNextSibling(n,"td");var l=s.value;for(var r in this.oColsMeta){if(this.oColsMeta[r].editable==true&&this.oEditData[l][r]!==false)n.innerHTML=this.oSaveData[l][r];n=jsUtils.FindNextSibling(n,"td")}}s.disabled=false}e.elements["action_button_"+this.table_id].value=""};this.ActionDelete=function(){var e=document.forms["form_"+this.table_id];if(!e)return;e.elements["action_button_"+this.table_id].value="delete";BX.submit(e)};this.SetActionName=function(e){var t=this.GetForm();if(!t)return;t.elements["action_button_"+this.table_id].value=e};this.GetForm=function(){return document.forms["form_"+this.table_id]};this.GetCheckedCheckboxes=function(){var e=[];for(var t=0,i=this.GetForm().elements.length;t<i;t++){var s=this.GetForm().elements[t];if(s.type.toLowerCase()=="checkbox"&&s.checked){e.push(s)}}return e};this.ActionCustom=function(e){this.SetActionName(e);BX.submit(form)};this.DeleteItem=function(e,t){var i=document.getElementById("ID_"+e);if(i){if(confirm(t)){var s=document.forms["form_"+this.table_id];if(!s)return;var a=s["ID[]"];if(!a.length)a=new Array(a);for(var n=0;n<a.length;n++){a[n].checked=false}i.checked=true;this.ActionDelete()}}};this.ForAllClick=function(e){if(e.checked&&!confirm(this.vars.mess.for_all_confirm)){e.checked=false;return}var t=e.form["ID[]"];if(t){if(!t.length)t=new Array(t);for(var i=0;i<t.length;i++)t[i].disabled=e.checked}this.EnableActions()};this.Sort=function(e,t,i,s){if(t==""){var a=null,n=false;if(s.length>0)a=s[0];if(!a)a=window.event;if(a)n=a.ctrlKey;e+=n?i=="asc"?"desc":"asc":i}else if(t=="asc")e+="desc";else e+="asc";this.Reload(e)};this.InitVisCols=function(){if(this.oVisibleCols==null){this.oVisibleCols={};for(var e in this.oColsMeta)this.oVisibleCols[e]=true}};this.CheckColumn=function(e,t){var i=this.menu.GetMenuByItemId(t.id);var s=!(i.GetItemInfo(t).ICON=="checked");i.SetItemIcon(t,s?"checked":"");this.InitVisCols();this.oVisibleCols[e]=s;this.bColsChanged=true};this.HideColumn=function(e){this.InitVisCols();this.oVisibleCols[e]=false;this.bColsChanged=true;this.SaveColumns()};this.ApplySaveColumns=function(){t.menu.PopupHide();t.SaveColumns()};this.SaveColumns=function(e){var i="";if(e){i=e}else{if(!t.bColsChanged)return;for(var s in t.oVisibleCols)if(t.oVisibleCols[s])i+=(i!=""?",":"")+s}BX.ajax.get("/bitrix/components"+t.vars.component_path+"/settings.php?GRID_ID="+t.table_id+"&action=showcolumns&columns="+i+"&sessid="+t.vars.sessid,BX.delegate(t._onColumnsSaved,t))};this._onColumnsSaved=function(){window.setTimeout(BX.delegate(this.Reload,this),500)};this.Reload=function(e){jsDD.Disable();if(!e){e=this.vars.current_url}if(this.vars.ajax.AJAX_ID==""){window.location=e}else{BX.ajax.get(e+(e.indexOf("?")==-1?"?":"&")+"bxajaxid="+this.vars.ajax.AJAX_ID+"&sessid="+BX.bitrix_sessid(),BX.delegate(this.onAjaxReload,this))}};this.onAjaxReload=function(e){BX("comp_"+this.vars.ajax.AJAX_ID).innerHTML=e;this.InitTable();BX.onCustomEvent(window,"BXInterfaceGridAfterReload",[])};this.SetTheme=function(e,i){BX.loadCSS(this.vars.template_path+"/themes/"+i+"/style.css");BX(t.table_id).className="bx-crm-interface-grid bx-crm-interface-grid-theme-"+i;var s=this.menu.GetMenuByItemId(e.id);s.SetAllItemsIcon("");s.SetItemIcon(e,"checked");BX.ajax.get("/bitrix/components"+t.vars.component_path+"/settings.php?GRID_ID="+t.table_id+"&action=settheme&theme="+i+"&sessid="+t.vars.sessid)};this.SetView=function(e){var i=t.oOptions.views[e].saved_filter;var s=i&&t.oOptions.filters[i]?function(){t.ApplyFilter(i)}:function(){t.Reload()};BX.ajax.get("/bitrix/components"+t.vars.component_path+"/settings.php?GRID_ID="+t.table_id+"&action=setview&view_id="+e+"&sessid="+t.vars.sessid,s)};this.EditCurrentView=function(){var e=this;this.ShowSettings(this.oOptions.views[this.oOptions.current_view],function(){var t=e.SaveSettings(e.oOptions.current_view,true);e.oOptions.views[e.oOptions.current_view]={name:t.name,columns:t.columns,sort_by:t.sort_by,sort_order:t.sort_order,page_size:t.page_size,saved_filter:t.saved_filter}})};this.AddView=function(){var e="view_"+Math.round(Math.random()*1e6);var i={};for(var s in this.oOptions.views[this.oOptions.current_view])i[s]=this.oOptions.views[this.oOptions.current_view][s];i.name=this.vars.mess.viewsNewView;this.ShowSettings(i,function(){var i=t.SaveSettings(e);t.oOptions.views[e]={name:i.name,columns:i.columns,sort_by:i.sort_by,sort_order:i.sort_order,page_size:i.page_size,saved_filter:i.saved_filter};t.bViewsChanged=true;var s=document["views_"+t.table_id];s.views_list.options[s.views_list.length]=new Option(i.name!=""?i.name:t.vars.mess.viewsNoName,e,true,true)})};this.EditView=function(e){this.ShowSettings(this.oOptions.views[e],function(){var i=t.SaveSettings(e);t.oOptions.views[e]={name:i.name,columns:i.columns,sort_by:i.sort_by,sort_order:i.sort_order,page_size:i.page_size,saved_filter:i.saved_filter};t.bViewsChanged=true;var s=document["views_"+t.table_id];s.views_list.options[s.views_list.selectedIndex].text=i.name!=""?i.name:t.vars.mess.viewsNoName})};this.DeleteView=function(e){if(!confirm(this.vars.mess.viewsDelete))return;var i=document["views_"+this.table_id];var s=i.views_list.selectedIndex;i.views_list.remove(s);i.views_list.selectedIndex=s<i.views_list.length?s:i.views_list.length-1;this.bViewsChanged=true;BX.ajax.get("/bitrix/components"+this.vars.component_path+"/settings.php?GRID_ID="+this.table_id+"&action=delview&view_id="+e+"&sessid="+t.vars.sessid)};this.ShowSettings=function(e,t){var i=false;if(!window["settingsDialog"+this.table_id]){window["settingsDialog"+this.table_id]=new BX.CDialog({content:'<form name="settings_'+this.table_id+'"></form>',title:this.vars.mess.settingsTitle,width:this.vars.settingWndSize.width,height:this.vars.settingWndSize.height,resize_id:"InterfaceGridSettingWnd"});i=true}window["settingsDialog"+this.table_id].ClearButtons();window["settingsDialog"+this.table_id].SetButtons([{title:this.vars.mess.settingsSave,action:function(){t();this.parentWindow.Close()}},BX.CDialog.prototype.btnCancel]);window["settingsDialog"+this.table_id].Show();var s=document["settings_"+this.table_id];if(i)s.appendChild(BX("view_settings_"+this.table_id));s.view_name.focus();s.view_name.value=e.name;var a=[];if(e.columns!=""){a=e.columns.split(",")}else{for(var n in this.oColsMeta)a[a.length]=n}var l={};for(var n=0,r=a.length;n<r;n++)l[a[n]]=true;jsSelectUtils.deleteAllOptions(s.view_all_cols);for(var n in this.oColsNames)if(!l[n])s.view_all_cols.options[s.view_all_cols.length]=new Option(this.oColsNames[n],n,false,false);jsSelectUtils.deleteAllOptions(s.view_cols);for(var n in l)s.view_cols.options[s.view_cols.length]=new Option(this.oColsNames[n],n,false,false);jsSelectUtils.selectOption(s.view_sort_by,e.sort_by);jsSelectUtils.selectOption(s.view_sort_order,e.sort_order);jsSelectUtils.selectOption(s.view_page_size,e.page_size);jsSelectUtils.deleteAllOptions(s.view_filters);s.view_filters.options[0]=new Option(this.vars.mess.viewsFilter,"");for(var n in this.oOptions.filters)s.view_filters.options[s.view_filters.length]=new Option(this.oOptions.filters[n].name,n,n==e.saved_filter,n==e.saved_filter);if(s.set_default_settings){s.set_default_settings.checked=false;s.delete_users_settings.disabled=true}};this.SaveSettings=function(e,i){var s=document["settings_"+this.table_id];var a="";var n=s.view_cols.length;for(var l=0;l<n;l++){if(typeof s.view_cols[l]!=="undefined"){a+=(a!=""?",":"")+s.view_cols[l].value}}var r={GRID_ID:this.table_id,view_id:e,action:"savesettings",sessid:this.vars.sessid,name:s.view_name.value,columns:a,sort_by:s.view_sort_by.value,sort_order:s.view_sort_order.value,page_size:s.view_page_size.value,saved_filter:s.view_filters.value};if(s.set_default_settings){r.set_default_settings=s.set_default_settings.checked?"Y":"N";r.delete_users_settings=s.delete_users_settings.checked?"Y":"N"}var o=null;if(i===true){o=function(){if(r.saved_filter&&t.oOptions.filters[r.saved_filter]){t.ApplyFilter(r.saved_filter)}else{t.Reload()}}}BX.ajax.post("/bitrix/components"+t.vars.component_path+"/settings.php",r,o);return r};this.ReloadViews=function(){if(t.bViewsChanged)t.Reload()};this.ShowViews=function(){this.bViewsChanged=false;var e=false;if(!window["viewsDialog"+this.table_id]){var i=new BX.CWindowButton({title:this.vars.mess.viewsApply,hint:this.vars.mess.viewsApplyTitle,action:function(){var e=document["views_"+t.table_id];if(e.views_list.selectedIndex!=-1)t.SetView(e.views_list.value);window["bxGrid_"+t.table_id].bViewsChanged=false;this.parentWindow.Close()}});window["viewsDialog"+this.table_id]=new BX.CDialog({content:'<form name="views_'+this.table_id+'"></form>',title:this.vars.mess.viewsTitle,buttons:[i,BX.CDialog.prototype.btnClose],width:this.vars.viewsWndSize.width,height:this.vars.viewsWndSize.height,resize_id:"InterfaceGridViewsWnd"});BX.addCustomEvent(window["viewsDialog"+this.table_id],"onWindowUnRegister",this.ReloadViews);e=true}window["viewsDialog"+this.table_id].Show();var s=document["views_"+this.table_id];if(e)s.appendChild(BX("views_list_"+this.table_id))};this.DragStart=function(){var e=document.body.appendChild(document.createElement("DIV"));var t=document.body.appendChild(document.createElement("DIV"));e.appendChild(t);e.style.position="absolute";e.style.zIndex=10;e.className="bx-drag-object";e.style.width=this.clientWidth+"px";this.__dragCopyDiv=e;this.className+=" bx-drag-source";t.innerHTML=this.innerHTML;if(t.clientHeight<e.clientHeight){var i=Math.floor((e.clientHeight-t.clientHeight)/2);if(i>0)t.style.marginTop=""+i+"px"}var s=document.body.appendChild(document.createElement("DIV"));s.style.position="absolute";s.style.zIndex=20;s.className="bx-drag-arrow";this.__dragArrowDiv=s;return true};this.Drag=function(e,t){var i=this.__dragCopyDiv;i.style.left=e+"px";i.style.top=t+"px";return true};this.DragStop=function(){this.className=this.className.replace(/\s*bx-grid-drag-source/gi,"");this.__dragCopyDiv.parentNode.removeChild(this.__dragCopyDiv);this.__dragCopyDiv=null;this.__dragArrowDiv.parentNode.removeChild(this.__dragArrowDiv);this.__dragArrowDiv=null;return true};this.DragHover=function(e,i,s){if(e===null||typeof e!=="object"||!e.hasOwnProperty("__dragArrowDiv"))return false;t.HighlightGutter(this,true);this.className+=" bx-drag-over";var a=e.__dragArrowDiv;var n=jsUtils.GetRealPos(this);if(this.cellIndex<=e.cellIndex)a.style.left=n["left"]-6+"px";else a.style.left=n["right"]-6+"px";a.style.top=n["top"]-12+"px";return true};this.DragOut=function(e,i,s){t.HighlightGutter(this,false);this.className=this.className.replace(/\s*bx-drag-over/gi,"");var a=e.__dragArrowDiv;a.style.left="-1000px";return true};this.DragFinish=function(e,i,s,a){t.HighlightGutter(this,false);this.className=this.className.replace(/\s*bx-drag-over/gi,"");if(this==e)return true;var n=BX(t.table_id);var l=0;for(var r=0;r<2;r++){cell=n.rows[1].cells[r];if(cell.className&&(cell.className.indexOf("bx-crm-actions-col")!=-1||cell.className.indexOf("bx-crm-checkbox-col")!=-1))l++}var o=[];for(var c in t.oColsMeta)o[o.length]=c;var h=e.cellIndex-l;var d=this.cellIndex-l;var f=o[h];if(d<h){for(var r=h;r>d;r--)o[r]=o[r-1]}else{for(var r=h;r<d;r++)o[r]=o[r+1]}o[d]=f;var v="";for(var r=0;r<o.length;r++)v+=(v!=""?",":"")+o[r];t.SaveColumns(v);return true};this.InitFilter=function(){var e=BX("flt_header_"+this.table_id);if(e)jsUtils.addEvent(e,"contextmenu",this.OnRowContext)};this.SwitchFilterRow=function(e,t){if(t){var i=this.menu.GetMenuByItemId(t.id);i.SetItemIcon(t,this.oFilterRows[e]?"":"checked")}else{var s=this.filterMenu[0].MENU;for(var a=0;a<s.length;a++){if(s[a].ID=="flt_"+this.table_id+"_"+e){s[a].ICONCLASS=this.oFilterRows[e]?"":"checked";break}}}var n=BX("flt_row_"+this.table_id+"_"+e);n.style.display=this.oFilterRows[e]?"none":"";this.oFilterRows[e]=this.oFilterRows[e]?false:true;var l=BX("a_minmax_"+this.table_id);if(l&&l.className.indexOf("bx-filter-max")!=-1)this.SwitchFilter(l);this.SaveFilterRows()};this.SwitchFilterRows=function(e){this.menu.PopupHide();var t=0;for(var i in this.oFilterRows){t++;if(t==1&&e==false)continue;this.oFilterRows[i]=e;var s=BX("flt_row_"+this.table_id+"_"+i);s.style.display=e?"":"none"}var a=this.filterMenu[0].MENU;for(var t=0;t<a.length;t++){if(t==0&&e==false)continue;if(a[t].SEPARATOR==true)break;a[t].ICONCLASS=e?"checked":""}var n=BX("a_minmax_"+this.table_id);if(n&&n.className.indexOf("bx-filter-max")!=-1)this.SwitchFilter(n);this.SaveFilterRows()};this.SaveFilterRows=function(){var e="";for(var t in this.oFilterRows)if(this.oFilterRows[t])e+=(e!=""?",":"")+t;BX.ajax.get("/bitrix/components"+this.vars.component_path+"/settings.php?GRID_ID="+this.table_id+"&action=filterrows&rows="+e+"&sessid="+this.vars.sessid)};this.SwitchFilter=function(e){var t=e.className.indexOf("bx-filter-min")!=-1;e.className=t?"bx-filter-btn bx-filter-max":"bx-filter-btn bx-filter-min";e.title=t?this.vars.mess.filterShow:this.vars.mess.filterHide;var i=BX("flt_content_"+this.table_id);i.style.display=t?"none":"";BX.ajax.get("/bitrix/components"+this.vars.component_path+"/settings.php?GRID_ID="+this.table_id+"&action=filterswitch&show="+(t?"N":"Y")+"&sessid="+this.vars.sessid)};this.ClearFilter=function(e){if(!BX.type.isDomNode(e)){e=document.forms["filter_"+this.table_id]}for(var t=0,i=e.elements.length;t<i;t++){var s=e.elements[t];switch(s.type.toLowerCase()){case"text":case"textarea":s.value="";break;case"select-one":s.selectedIndex=0;break;case"select-multiple":for(var a=0,n=s.options.length;a<n;a++)s.options[a].selected=false;break;case"checkbox":s.checked=false;break;default:break}if(s.onchange)s.onchange()}var l=BX.findChild(e,{tag:"INPUT",property:{type:"hidden",name:"clear_filter"}},true,false);if(l){l.value="Y"}BX.submit(e)};this.ShowFilters=function(){var e=false;if(!window["filtersDialog"+this.table_id]){var i=new BX.CWindowButton({title:this.vars.mess.filtersApply,hint:this.vars.mess.filtersApplyTitle,action:function(){var e=document["filters_"+t.table_id];if(e.filters_list.value)t.ApplyFilter(e.filters_list.value);this.parentWindow.Close()}});window["filtersDialog"+this.table_id]=new BX.CDialog({content:'<form name="filters_'+this.table_id+'"></form>',title:this.vars.mess.filtersTitle,buttons:[i,BX.CDialog.prototype.btnClose],width:this.vars.filtersWndSize.width,height:this.vars.filtersWndSize.height,resize_id:"InterfaceGridFiltersWnd"});e=true}window["filtersDialog"+this.table_id].Show();var s=document["filters_"+this.table_id];if(e)s.appendChild(BX("filters_list_"+this.table_id))};this.AddFilter=function(e){if(!e)e={};var i="filter_"+Math.round(Math.random()*1e6);var s={name:this.vars.mess.filtersNew,fields:e};this.ShowFilterSettings(s,function(){var e=t.SaveFilter(i);t.oOptions.filters[i]={name:e.name,fields:e.fields};var s=document["filters_"+t.table_id];s.filters_list.options[s.filters_list.length]=new Option(e.name!=""?e.name:t.vars.mess.viewsNoName,i,true,true);if(t.filterMenu.length==4)t.filterMenu=BX.util.insertIntoArray(t.filterMenu,1,{SEPARATOR:true});var a={ID:"mnu_"+t.table_id+"_"+i,TEXT:BX.util.htmlspecialchars(e.name),TITLE:t.vars.mess.ApplyTitle,ONCLICK:"bxGrid_"+t.table_id+".ApplyFilter('"+i+"')"};t.filterMenu=BX.util.insertIntoArray(t.filterMenu,2,a)})};this.AddFilterAs=function(){var e=document.forms["filter_"+this.table_id];var t=this.GetFilterFields(e);this.ShowFilters();this.AddFilter(t)};this.EditFilter=function(e){this.ShowFilterSettings(this.oOptions.filters[e],function(){var i=t.SaveFilter(e);t.oOptions.filters[e]={name:i.name,fields:i.fields};var s=document["filters_"+t.table_id];s.filters_list.options[s.filters_list.selectedIndex].text=i.name!=""?i.name:t.vars.mess.viewsNoName;for(var a=0,n=t.filterMenu.length;a<n;a++){if(t.filterMenu[a].ID&&t.filterMenu[a].ID=="mnu_"+t.table_id+"_"+e){t.filterMenu[a].TEXT=BX.util.htmlspecialchars(i.name);break}}})};this.DeleteFilter=function(e){if(!confirm(this.vars.mess.filtersDelete))return;var i=document["filters_"+this.table_id];var s=i.filters_list.selectedIndex;i.filters_list.remove(s);i.filters_list.selectedIndex=s<i.filters_list.length?s:i.filters_list.length-1;for(var a=0,n=this.filterMenu.length;a<n;a++){if(t.filterMenu[a].ID&&t.filterMenu[a].ID=="mnu_"+t.table_id+"_"+e){this.filterMenu=BX.util.deleteFromArray(this.filterMenu,a);if(this.filterMenu.length==5)this.filterMenu=BX.util.deleteFromArray(this.filterMenu,1);break}}delete this.oOptions.filters[e];BX.ajax.get("/bitrix/components"+this.vars.component_path+"/settings.php?GRID_ID="+this.table_id+"&action=delfilter&filter_id="+e+"&sessid="+t.vars.sessid)};this.ShowFilterSettings=function(e,t){var i=false;if(!window["filterSettingsDialog"+this.table_id]){window["filterSettingsDialog"+this.table_id]=new BX.CDialog({content:'<form name="flt_settings_'+this.table_id+'"></form>',title:this.vars.mess.filterSettingsTitle,width:this.vars.filterSettingWndSize.width,height:this.vars.filterSettingWndSize.height,resize_id:"InterfaceGridFilterSettingWnd"});i=true}window["filterSettingsDialog"+this.table_id].ClearButtons();window["filterSettingsDialog"+this.table_id].SetButtons([{title:this.vars.mess.settingsSave,action:function(){t();this.parentWindow.Close()}},BX.CDialog.prototype.btnCancel]);window["filterSettingsDialog"+this.table_id].Show();var s=document["flt_settings_"+this.table_id];if(i)s.appendChild(BX("filter_settings_"+this.table_id));s.filter_name.focus();s.filter_name.value=e.name;this.SetFilterFields(s,e.fields)};this.SetFilterFields=function(e,t){BX.onCustomEvent(this,"BEFORE_SET_FILTER_FIELDS",[this,e,t]);for(var i=0,s=e.elements.length;i<s;i++){var a=e.elements[i];if(a.name=="filter_name"){continue}var n=a.name;var l=t[n]?t[n]:"";switch(a.type.toLowerCase()){case"select-one":case"text":case"textarea":{a.value=l;break}case"radio":case"checkbox":{a.checked=a.value==l;break}case"select-multiple":{n=n.substr(0,n.length-2);l=typeof t[n]==="object"&&t[n]?t[n]:{};var r=false;for(var o=0,c=a.options.length;o<c;o++){var h=a.options[o];var d="sel"+h.value;var f=l[d]?l[d]:null;h.selected=h.value==f;if(h.value==f){r=true}}if(!r&&a.options.length>0&&a.options[0].value==""){a.options[0].selected=true}break}}if(a.onchange)a.onchange()}BX.onCustomEvent(this,"AFTER_SET_FILTER_FIELDS",[this,e,t])};this.GetFilterFields=function(e){var t={};BX.onCustomEvent(this,"BEFORE_GET_FILTER_FIELDS",[this,e,t]);for(var i=0,s=e.elements.length;i<s;i++){var a=e.elements[i];if(a.name=="filter_name")continue;switch(a.type.toLowerCase()){case"select-one":case"text":case"textarea":t[a.name]=a.value;break;case"radio":case"checkbox":if(a.checked)t[a.name]=a.value;break;case"select-multiple":var n=a.name.substr(0,a.name.length-2);t[n]={};for(var l=0,r=a.options.length;l<r;l++)if(a.options[l].selected)t[n]["sel"+a.options[l].value]=a.options[l].value;break;default:break}}BX.onCustomEvent(this,"AFTER_GET_FILTER_FIELDS",[this,e,t]);return t};this.SaveFilter=function(e){var i=document["flt_settings_"+this.table_id];var s={GRID_ID:this.table_id,filter_id:e,action:"savefilter",sessid:this.vars.sessid,name:i.filter_name.value,fields:this.GetFilterFields(i)};BX.ajax.post("/bitrix/components"+t.vars.component_path+"/settings.php",s);return s};this.ApplyFilter=function(e){var t=document.forms["filter_"+this.table_id];this.SetFilterFields(t,this.oOptions.filters[e].fields);t.appendChild(BX.create("INPUT",{attrs:{type:"hidden",name:"grid_filter_id",value:e}}));t.appendChild(BX.create("INPUT",{attrs:{type:"hidden",name:"apply_filter",value:"Y"}}));BX.submit(t)};this.OnDateChange=function(e){var t=false,i=false,s=false,a=false,n=false;if(e.value=="interval")n=t=i=s=true;else if(e.value=="before")i=true;else if(e.value=="after"||e.value=="exact")t=true;else if(e.value=="days")a=true;BX.findNextSibling(e,{tag:"span",class:"bx-filter-from"}).style.display=t?"":"none";BX.findNextSibling(e,{tag:"span",class:"bx-filter-to"}).style.display=i?"":"none";BX.findNextSibling(e,{tag:"span",class:"bx-filter-hellip"}).style.display=s?"":"none";BX.findNextSibling(e,{tag:"span",class:"bx-filter-days"}).style.display=a?"":"none";var l=BX.findNextSibling(e,{tag:"span",class:"bx-filter-br"});if(l)l.style.display=n?"":"none"};this.getRowByCheckBox=function(e){return e.parentNode.parentNode};this.removeRow=function(e,t){var i=this.getRow(e);new BX.easing({duration:600,start:{opacity:100,height:i.scrollHeight},finish:{opacity:0,height:0},transition:BX.easing.makeEaseOut(BX.easing.transitions.quad),step:function(e){i.style.height=e.height+"px";i.style.opacity=e.opacity/10},complete:BX.delegate(function(){var s=this.getCheckbox(e);if(s.checked){s.checked=false;this.SelectRow(s)}BX.remove(i);t&&t()},this)}).animate();var s=BX("bx-disk-total-grid-item");if(s){BX.adjust(s,{text:""+(parseInt(s.textContent||s.innerText,10)-1)})}};this.getRow=function(e){var t=this.getCheckbox(e);return this.getRowByCheckBox(t)};this.getCheckbox=function(e){return BX("ID_"+e)}}BX.namespace("BX.Crm");if(typeof BX.Crm.GridPageSizeControl==="undefined"){BX.Crm.GridPageSizeControl=function(){var e=function(e){this.grid=e.grid||null;this.gridId=e.gridId||"";this.nodeId=e.nodeId||"";this.node=null;if(this.nodeId){this.node=BX(this.nodeId);if(this.node){BX.bind(this.node,"change",BX.proxy(this.handlePageSizeControlChange,this))}}};e.prototype={handlePageSizeControlChange:function(e){e=e||window.event;var t=e.target||e.srcElement;if(this.grid){this.grid.oOptions.views[this.grid.oOptions.current_view].page_size=parseInt(t.value);this.saveGridSettings(this.grid.oOptions.current_view,true)}},saveGridSettings:function(e,t){var i={GRID_ID:this.grid.table_id,view_id:e,action:"savesettings",sessid:this.grid.vars.sessid,name:this.grid.oOptions.views[e].name,columns:this.grid.oOptions.views[e].columns,sort_by:this.grid.oOptions.views[e].sort_by,sort_order:this.grid.oOptions.views[e].sort_order,page_size:this.grid.oOptions.views[e].page_size,saved_filter:this.grid.oOptions.views[e].saved_filter};var s=null;var a=this;if(t===true){s=function(){if(i.saved_filter&&a.grid.oOptions.filters[i.saved_filter]){a.grid.ApplyFilter(i.saved_filter)}else{a.grid.Reload()}}}BX.ajax.post("/bitrix/components"+a.grid.vars.component_path+"/settings.php",i,s);return i}};return e}()}
/* End */
;
; /* Start:"a:4:{s:4:"full";s:124:"/bitrix/components/bitrix/crm.interface.filter/templates/flat/bitrix/main.interface.filter/new/script.min.js?154412740145419";s:6:"source";s:104:"/bitrix/components/bitrix/crm.interface.filter/templates/flat/bitrix/main.interface.filter/new/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
if(typeof BX.InterfaceGridFilter==="undefined"){BX.InterfaceGridFilter=function(){this._defaultItemId="";this._id="";this._settings=null;this._itemInfos={};this._fieldInfos={};this._visibleFieldCount=0;this._items={};this._fields={};this._addFieldOpener=null;this._settingsOpener=null;this._ignoreFieldVisibilityChange=false;this._isApplied=false;this._currentItemId="";this._activeItemId="";this._saveAsDlg=null;this._enableProvider=true;this._manager=null;this._fieldProvider=null;this._isFolded=false;this._presetsDeleted=[];this._saveVisibleFieldsTimeoutId=null;this._closeOpen=null;this._addFieldHandler=BX.delegate(this._handleAddFieldButtonClick,this);this._settingsHandler=BX.delegate(this._handleSettingsButtonClick,this);this._applyHandler=BX.delegate(this._handleApplyButtonClick,this);this._saveHandler=BX.delegate(this._handleSaveAsMenuItemClick,this);this._cancelHandler=BX.delegate(this._handleCancelButtonClick,this);this._switchHandler=BX.delegate(this._handleSwitchViewButtonClick,this);this._managerHandler=null};BX.InterfaceGridFilter.prototype={initialize:function(e,t){this._id=BX.type.isNotEmptyString(e)?e:"";this._settings=t?t:BX.CrmParamBag.create(null);this._isApplied=this._settings.getParam("isApplied",false);this._isFolded=this._settings.getParam("isFolded",true);this._presetsDeleted=this._settings.getParam("presetsDeleted",[]);this._defaultItemId=this._settings.getParam("defaultItemId","filter_default");this._currentItemId=this._settings.getParam("currentItemId","");this._activeItemId=this._currentItemId;if(this._activeItemId===""){this._activeItemId=this._defaultItemId}this._itemInfos=this._settings.getParam("itemInfos",{});var i=this._settings.getParam("currentValues",{});if(BX.type.isArray(i)){i={}}var n=this._activeItemId===this._defaultItemId;this._items[this._defaultItemId]=BX.InterfaceGridFilterItem.create(this._defaultItemId,BX.CrmParamBag.create({filter:this,info:{name:"",fields:n?i:{},filter_rows:this._settings.getParam("defaultVisibleRows","")},isActive:n}));for(var s in this._itemInfos){if(!this._itemInfos.hasOwnProperty(s)||s===this._defaultItemId||this.isDeleletedPreset(s)){continue}this._items[s]=BX.InterfaceGridFilterItem.create(s,BX.CrmParamBag.create({filter:this,info:this._itemInfos[s],isActive:this._activeItemId===s}))}this._fieldInfos=this._settings.getParam("fieldInfos",{});for(var r in this._fieldInfos){if(!this._fieldInfos.hasOwnProperty(r)){continue}var a=BX.InterfaceGridFilterField.create(r,BX.CrmParamBag.create({filter:this,info:this._fieldInfos[r]}));this._fields[r]=a;if(a.isVisible()){this._visibleFieldCount++}}BX.bind(this.getAddFieldButton(),"click",this._addFieldHandler);BX.bind(this.getSettingsButton(),"click",this._settingsHandler);BX.bind(this.getApplyButton(),"click",this._applyHandler);BX.bind(this.getAddFilterButton(),"click",this._saveHandler);BX.bind(this.getCancelButton(),"click",this._cancelHandler);this._closeOpen=new BX.InterfaceGridFilterCloseOpen(this._settings.getParam("innerBlock",""),this._settings.getParam("mainBlock",""),this);this._closeOpen.initialize();var l=this.getSwitchViewButton();if(l){l.title=this.getMessage(this._isFolded?"buttonMaximize":"buttonMinimize");BX.bind(l,"click",this._switchHandler)}this._enableProvider=this._settings.getParam("enableProvider",false);if(!this._enableProvider){this._manager=BX.CrmInterfaceGridManager.items[this.getGridId()+"_MANAGER"];if(this._manager){this._initializeFieldControllers()}else{this._managerHandler=BX.delegate(this._onManagerCreated,this);this._manager=null;BX.addCustomEvent(BX.CrmInterfaceGridManager,"CREATED",this._managerHandler)}}else{this._fieldProvider=BX.InterfaceFilterFieldInfoProvider.items[this.getGridId()];if(this._fieldProvider){this._initializeFieldControllers()}else{this._fieldProvider=null;BX.addCustomEvent(window,"InterfaceFilterFieldInfoProviderCreate",BX.delegate(this._onFieldInfoProviderCreated,this))}}},release:function(){var e=this.getSwitchViewButton();if(e){BX.unbind(e,"click",this._switchHandler)}BX.unbind(this.getAddFieldButton(),"click",this._addFieldHandler);BX.unbind(this.getSettingsButton(),"click",this._settingsHandler);BX.unbind(this.getApplyButton(),"click",this._applyHandler);BX.unbind(this.getAddFilterButton(),"click",this._saveHandler);BX.unbind(this.getCancelButton(),"click",this._cancelHandler);if(this._managerHandler){BX.removeCustomEvent(BX.CrmInterfaceGridManager,"CREATED",this._managerHandler)}},_onManagerCreated:function(e){BX.removeCustomEvent(BX.CrmInterfaceGridManager,"CREATED",this._managerHandler);this._managerHandler=null;if(e.getId()===this.getGridId()+"_MANAGER"){this._manager=e;this._initializeFieldControllers()}},_onFieldInfoProviderCreated:function(e){if(e.getId()===this.getGridId()){this._fieldProvider=e;this._initializeFieldControllers()}},_initializeFieldControllers:function(){for(var e in this._fields){if(this._fields.hasOwnProperty(e)){this._fields[e].initializeController()}}},getMessage:function(e){return BX.InterfaceGridFilter.getMessage(e)},getId:function(){return this._id},isApplied:function(){return this._isApplied},isFolded:function(){return this._isFolded},getCurrentItemId:function(){return this._currentItemId},getGridId:function(){return this._settings.getParam("gridId","")},getFormName:function(){return this._settings.getParam("formName","")},getForm:function(){return document.forms[this.getFormName()]},getCurrentTime:function(){return this._settings.getParam("currentTime","")},getServiceUrl:function(){return this._settings.getParam("serviceUrl","")},getContainerId:function(){return this._settings.getParam("containerId","flt_wrapper")},getItemContainerId:function(e){return this._settings.getParam("itemContainerPrefix","flt_tab_")+e.toString()},getFieldContainerId:function(e){return this._settings.getParam("fieldContainerPrefix","flt_field_")+e.toString()},getFieldDelimiterContainerId:function(e){return this._settings.getParam("fieldDelimiterContainerPrefix","flt_field_delim_")+e.toString()},getVisibleFieldCount:function(){return this._visibleFieldCount},getVisibleFieldIds:function(){var e=[];var t=this._fields;for(var i in t){if(t.hasOwnProperty(i)&&t[i].isVisible()){e.push(i)}}return e},getFieldInfo:function(e){if(!this._fieldProvider&&!this._manager){return null}var t=this._fieldProvider?this._fieldProvider.getFieldInfos():this._manager.getSetting("filterFields",null);if(!t){return null}for(var i=0;i<t.length;i++){if(t[i]["id"]===e){return t[i]}}return null},saveVisibleFields:function(){if(this._saveVisibleFieldsTimeoutId!==null){window.clearTimeout(this._saveVisibleFieldsTimeoutId);this._saveVisibleFieldsTimeoutId=null}var e=this;this._saveVisibleFieldsTimeoutId=window.setTimeout(function(){e._doSaveVisibleFields()},100)},_doSaveVisibleFields:function(){this._saveVisibleFieldsTimeoutId=null;BX.ajax.get(this.getServiceUrl(),{GRID_ID:this.getGridId(),action:"filterrows",filter_id:this._activeItemId!==this._defaultItemId?this._activeItemId:"",rows:this.getVisibleFieldIds().join(",")})},saveActiveItem:function(e){var t=this._items[this._activeItemId];if(!t){return}BX.ajax.post(this.getServiceUrl(),{GRID_ID:this.getGridId(),filter_id:t.getId(),action:"savefilter",name:t.getName(),fields:this.getFieldParams(),rows:this.getVisibleFieldIds().join(",")},e)},isDeleletedPreset:function(e){for(var t=0;t<this._presetsDeleted.length;t++){if(this._presetsDeleted[t]===e){return true}}return false},deleteActiveItem:function(){var e=this._items[this._activeItemId];if(!e){return}var t=e.getId();BX.ajax.post(this.getServiceUrl(),{GRID_ID:this.getGridId(),filter_id:t,action:"delfilter"});if(/^filter_[0-9]+$/i.test(t)||this.isDeleletedPreset(t)){return}this._presetsDeleted.push(t);var i=BX.userOptions.delay;BX.userOptions.delay=100;BX.userOptions.save("crm.interface.grid.filter",this.getId().toLowerCase(),"presetsDeleted",this._presetsDeleted.join(","));BX.userOptions.delay=i},requireFieldVisibilityChange:function(e){if(this._ignoreFieldVisibilityChange){return true}return!e.isVisible()||this.getVisibleFieldCount()>1},handleFieldVisibilityChange:function(e){if(this._ignoreFieldVisibilityChange){return}if(e.isVisible()){this._visibleFieldCount++}else{this._visibleFieldCount--}this._adjustStyle();this._showDeleteButtons(this._visibleFieldCount>1);this.saveVisibleFields()},requireItemActivityChange:function(e){return true},handleItemActivityChange:function(e){if(!e.isActive()){return}this._setActiveItem(e)},handleSaveAsDialogClose:function(e){if(e.getButtonId()!=="save"){return}var t=e.getValues();var i="filter_"+Math.random().toString().substring(2).toString();var n={name:t["name"]?t["name"]:BX.InterfaceGridFilter.getMessage("defaultFilterName"),fields:this.getFieldParams()};this._itemInfos[i]=n;var s=this._items[i]=BX.InterfaceGridFilterItem.create(i,BX.CrmParamBag.create({filter:this,info:n,isActive:false}));s.setActive(true);this.saveActiveItem()},getFieldParams:function(){var e={};for(var t in this._fields){if(this._fields.hasOwnProperty(t)){this._fields[t].getParams(e)}}return e},setFieldParams:function(e){for(var t in this._fields){if(this._fields.hasOwnProperty(t)){this._fields[t].setParams(e)}}},_setActiveItem:function(e){BX.onCustomEvent(document,"bx-ui-crm-filter-set-active-item",[this,e]);var t=null;if(this._activeItemId!==""){t=this._items[this._activeItemId]}if(t){t.setFieldParams(this.getFieldParams());t.setVisibleFieldIds(this.getVisibleFieldIds());t.setActive(false)}this._activeItemId=e.getId();t=this._items[this._activeItemId];var i=this._getWrapper();if(t.isCurrent()){if(this.isApplied())BX.addClass(i,"bx-current-filter")}else{BX.removeClass(i,"bx-current-filter")}this.setFieldParams(t.getFieldParams());this._ignoreFieldVisibilityChange=true;this._visibleFieldCount=0;var n=t.getVisibleFieldIds();if(n.length>0){for(var s in this._fields){if(!this._fields.hasOwnProperty(s)){continue}var r=false;for(var a=0;a<n.length;a++){if(n[a]===s){r=true;break}}this._fields[s].setVisible(r);if(r){this._visibleFieldCount++}}}else{for(var s in this._fieldInfos){if(!this._fieldInfos.hasOwnProperty(s)){continue}var r=this._fieldInfos[s]["isVisible"];this._fields[s].setVisible(r);if(r){this._visibleFieldCount++}}}this._adjustStyle();this._showDeleteButtons(this._visibleFieldCount>1);this._ignoreFieldVisibilityChange=false},apply:function(e){var t=this._items[e];if(t){this._setActiveItem(t);this.applyActive()}},applyActive:function(){var e=this._currentItemId;this._currentItemId=this._activeItemId;if(e!==""){this._items[e].handleCurrentItemChange(this)}this._items[this._currentItemId].handleCurrentItemChange(this);var t=this.getForm();if(!t){return}var i=BX.findChild(t,{tag:"INPUT",property:{type:"hidden",name:"grid_filter_id"}},true,false);if(i){i.value=this._activeItemId!==this._defaultItemId?this._activeItemId:""}var n=BX.findChild(t,{tag:"INPUT",property:{type:"hidden",name:"apply_filter"}},true,false);if(n){n.value="Y"}BX.onCustomEvent(window,"CrmGridFilterApply",[this]);BX.submit(t)},clear:function(){var e=this.getForm();if(!e){return}var t=BX.findChild(e,{tag:"INPUT",property:{type:"hidden",name:"clear_filter"}},true,false);if(t){t.value="Y"}this.setFieldParams({});BX.submit(e)},_adjustStyle:function(){var e=BX(this.getContainerId());if(!e){return}var t=BX.findChild(e,{class:"bx-filter-bottom-separate"},true,false);var i=BX.findChild(e,{class:"bx-filter-content"},true,false);if(this.getVisibleFieldCount()>1){BX.removeClass(i,"bx-filter-content-first");t.style.display=""}else{BX.addClass(i,"bx-filter-content-first");t.style.display="none"}},_getWrapper:function(){return BX.findChild(BX(this.getContainerId()),{tag:"DIV",class:"bx-filter-wrap"},true)},getAddFieldButton:function(){return BX.findChild(BX(this.getContainerId()),{tag:"SPAN",class:"bx-filter-add-button"},true,false)},getAddFilterButton:function(){return BX.findChild(BX(this.getContainerId()),{tag:"SPAN",class:"bx-filter-add-tab"},true,false)},getSettingsButton:function(){return BX.findChild(BX(this.getContainerId()),{tag:"SPAN",class:"bx-filter-setting"},true,false)},getApplyButton:function(){return BX.findChild(BX(this.getContainerId()),{tag:"INPUT",property:{type:"button",name:"set_filter"}},true,false)},getCancelButton:function(){return BX.findChild(BX(this.getContainerId()),{tag:"INPUT",property:{type:"button",name:"reset_filter"}},true,false)},getSwitchViewButton:function(){return BX.findChild(BX(this.getContainerId()),{tag:"SPAN",class:"bx-filter-switcher-tab"},true,false)},setFieldsVisible:function(e,t){this._ignoreFieldVisibilityChange=true;this._visibleFieldCount=0;e=!!e;t=t?t:{};var i=typeof t["skipTop"]!=="undefined"?parseInt(t["skipTop"]):0;var n=this._fields;for(var s in n){if(!n.hasOwnProperty(s)){continue}var r=n[s];if(r.isVisible()!==e){if(i>0){i--}else{r.setVisible(e)}}if(r.isVisible()){this._visibleFieldCount++}}this._adjustStyle();this._showDeleteButtons(this._visibleFieldCount>1);this.saveVisibleFields();this._ignoreFieldVisibilityChange=false},setFolded:function(e){e=!!e;if(e===this._isFolded){return}this._isFolded=e;if(this._closeOpen)this._closeOpen.toggle();var t=BX(this._settings.getParam("mainBlock",""));if(e){BX.addClass(this._getWrapper(),"bx-filter-folded");if(t)t.style.height="0"}else{BX.removeClass(this._getWrapper(),"bx-filter-folded")}if(this._activeItemId!==""){var i=this._items[this._activeItemId];if(i){i.handleFilterFoldingChange(this)}}var n=this.getSwitchViewButton();if(n){n.title=this.getMessage(e?"buttonMaximize":"buttonMinimize")}var s=BX.userOptions.delay;BX.userOptions.delay=100;BX.userOptions.save("crm.interface.grid.filter",this.getId().toLowerCase(),"isFolded",e?"Y":"N");BX.userOptions.delay=s},_showDeleteButtons:function(e){e=!!e;var t=this._fields;for(var i in t){if(t.hasOwnProperty(i)){t[i].showDeleteButton(e)}}},_handleAddFieldButtonClick:function(e){var t=[];var i=this._fields;for(var n in i){if(!i.hasOwnProperty(n)){continue}var s=i[n];t.push({id:s.getId(),text:s.getName(),onchange:s.getToggleHandler(),checked:s.isVisible(),tag:"field"})}t.push({id:"__showAll",text:this.getMessage("showAll"),onclick:BX.delegate(this._handleShowAllButtonClick,this),checked:false,tag:"command",allowToggle:false,separatorBefore:true});t.push({id:"__hideAll",text:this.getMessage("hideAll"),onclick:BX.delegate(this._handleHideAllButtonClick,this),checked:false,tag:"command",allowToggle:false});var r=this.getAddFieldButton();var a=BX.pos(r);this._addFieldOpener=BX.InterfaceGridFilterCheckListMenu.create(this.getId()+"_ADD_FIELDS",BX.CrmParamBag.create({allowToggle:true,items:t,anchor:r,offsetTop:Math.round(a.height/4),offsetLeft:Math.round(a.width/2),angle:{position:"top",offset:0}}));this._addFieldOpener.open()},_handleSettingsButtonClick:function(e){var t=[];if(this._activeItemId==this._defaultItemId){t.push({id:"saveAs",text:this.getMessage("saveAs"),onclick:BX.delegate(this._handleSaveAsMenuItemClick,this),checked:false})}else{t.push({id:"save",text:this.getMessage("save"),onclick:BX.delegate(this._handleSaveMenuItemClick,this),checked:false});t.push({id:"saveAs",text:this.getMessage("saveAs"),onclick:BX.delegate(this._handleSaveAsMenuItemClick,this),checked:false});t.push({id:"delete",text:this.getMessage("delete"),onclick:BX.delegate(this._handleDeleteMenuItemClick,this),checked:false})}var i=this.getSettingsButton();var n=BX.pos(i);this._settingsOpener=BX.InterfaceGridFilterCheckListMenu.create(this.getId()+"_SETTINGS_"+this._activeItemId.toUpperCase(),BX.CrmParamBag.create({allowToggle:false,items:t,anchor:i,closeOnClick:true,offsetTop:Math.round(n.height/4),offsetLeft:Math.round(n.width/2),angle:{position:"top",offset:0}}));this._settingsOpener.open()},_handleApplyButtonClick:function(e){if(this._activeItemId===this._defaultItemId){this.applyActive();return}var t=this;this.saveActiveItem(function(){t.applyActive()})},_handleCancelButtonClick:function(e){this.clear()},_handleShowAllButtonClick:function(e){if(this._addFieldOpener){var t=this._addFieldOpener.getItemsByTag("field");for(var i=0;i<t.length;i++){t[i].setChecked(true)}}this.setFieldsVisible(true,{})},_handleHideAllButtonClick:function(e){if(this._addFieldOpener){var t=this._addFieldOpener.getItemsByTag("field");for(var i=1;i<t.length;i++){t[i].setChecked(false)}}this.setFieldsVisible(false,{skipTop:1})},_handleSaveMenuItemClick:function(e){if(this._isApplied&&this._currentItemId===this._activeItemId){var t=this;this.saveActiveItem(function(){t.applyActive()})}else{this.saveActiveItem()}},_handleSaveAsMenuItemClick:function(e){if(!this._saveAsDlg){this._saveAsDlg=BX.InterfaceGridFilterSaveAsDialog.create(this.getId()+"_SAVE_AS",BX.CrmParamBag.create({filter:this}))}this._saveAsDlg.openDialog()},_handleDeleteMenuItemClick:function(e){var t=this._activeItemId;var i=this._items[t];if(t===this._defaultItemId||!i){return}this.deleteActiveItem();if(i.isCurrent()){this.clear()}i.clearLayout();this._items[this._defaultItemId].setActive(true);delete this._items[t]},_handleSwitchViewButtonClick:function(e){this.setFolded(!this.isFolded())}};BX.InterfaceGridFilter.isEmptyObject=function(e){if(e===null||e===undefined){return true}var t=Object.prototype.hasOwnProperty;if(typeof e.length!=="undefined"){return e.length===0}if(typeof e==="object"){for(var i in e){if(t.call(e,i)){return false}}}return true};if(typeof BX.InterfaceGridFilter.messages==="undefined"){BX.InterfaceGridFilter.messages={}}BX.InterfaceGridFilter.getMessage=function(e){return typeof BX.InterfaceGridFilter.messages[e]!=="undefined"?BX.InterfaceGridFilter.messages[e]:""};BX.InterfaceGridFilter.items={};BX.InterfaceGridFilter.create=function(e,t){if(this.items.hasOwnProperty(e)){this.items[e].release();delete this.items[e]}var i=new BX.InterfaceGridFilter;i.initialize(e,t);this.items[e]=i;return i}}if(typeof BX.InterfaceGridFilterItem==="undefined"){BX.InterfaceGridFilterItem=function(){this._id="";this._settings=null;this._filter=null;this._container=null;this._isActive=false;this._info={};this._fieldParams={};this._visibleFieldIds=[]};BX.InterfaceGridFilterItem.prototype={initialize:function(e,t){this._id=BX.type.isNotEmptyString(e)?e:"";this._settings=t?t:BX.CrmParamBag.create(null);this._filter=t.getParam("filter",null);this._info=t.getParam("info",{});this._fieldParams=typeof this._info["fields"]!=="undefined"?this._info["fields"]:{};var i=typeof this._info["filter_rows"]!=="undefined"?this._info["filter_rows"]:null;if(BX.type.isString(i)){i=i.split(",")}if(BX.type.isArray(i)){this._visibleFieldIds=i}else{for(var n in this._fieldParams){if(this._fieldParams.hasOwnProperty(n)){this._visibleFieldIds.push(BX.InterfaceGridFilterField.convertParamToFieldId(n))}}}this._isActive=t.getParam("isActive",false);var s=this._filter.getItemContainerId(e);this._container=BX(s);if(!this._container){this.layout()}BX.bind(this._container,"click",BX.delegate(this._onClick,this))},getId:function(){return this._id},getName:function(){return this._info["name"]},getInfo:function(){return this._info},isActive:function(){return this._isActive},isCurrent:function(){return this._filter.getCurrentItemId()===this.getId()},setActive:function(e){e=!!e;if(this._isActive===e){return}if(!this._filter.requireItemActivityChange(this)){return}this._isActive=e;this._filter.handleItemActivityChange(this);this._adjustStyle()},getFieldParams:function(){return this._fieldParams},setFieldParams:function(e){this._fieldParams=e},getVisibleFieldIds:function(){return this._visibleFieldIds},setVisibleFieldIds:function(e){this._visibleFieldIds=e},layout:function(){var e=BX.findChild(BX(this._filter.getContainerId()),{tag:"DIV",class:"bx-filter-tabs-block"},true);if(!e){return}this._container=BX.create("SPAN",{props:{id:this._filter.getItemContainerId(this.getId())},attrs:{class:"bx-filter-tab"},text:this.getName()});e.insertBefore(this._container,this._filter.getAddFilterButton())},clearLayout:function(){if(!this._container){return}BX.remove(this._container)},_adjustStyle:function(){if(this._filter.isFolded()){if(this.isCurrent()){BX.addClass(this._container,"bx-filter-tab-active")}else{BX.removeClass(this._container,"bx-filter-tab-active")}}else{if(this._isActive){BX.addClass(this._container,"bx-filter-tab-active")}else{BX.removeClass(this._container,"bx-filter-tab-active")}}},handleFilterFoldingChange:function(e){this._adjustStyle()},handleCurrentItemChange:function(e){this._adjustStyle()},_onClick:function(e){if(!this.isActive()){this.setActive(true)}if(this._filter.isFolded()){this._filter.applyActive()}}};BX.InterfaceGridFilterItem.create=function(e,t){var i=new BX.InterfaceGridFilterItem;i.initialize(e,t);return i}}if(typeof BX.InterfaceGridFilterField==="undefined"){BX.InterfaceGridFilterField=function(){this._id="";this._settings=null;this._filter=null;this._info={};this._container=null;this._delimiterContainer=null;this._isVisible=true;this._deleteButton=null;this._controller=null};BX.InterfaceGridFilterField.prototype={initialize:function(e,t){this._id=BX.type.isNotEmptyString(e)?e:"";this._settings=t?t:BX.CrmParamBag.create(null);this._filter=t.getParam("filter",null);this._container=BX(this._filter.getFieldContainerId(e));this._delimiterContainer=BX(this._filter.getFieldDelimiterContainerId(e));this._info=t.getParam("info",{});this._isVisible=this._info["isVisible"];this._deleteButton=BX.findChild(this._container,{tag:"SPAN",class:"bx-filter-item-delete"},true,false);if(this._deleteButton){this._deleteButton.title=BX.InterfaceGridFilter.getMessage("buttonDeleteField");BX.bind(this._deleteButton,"click",BX.delegate(this._handleDeleteButtonClick,this))}if(this.getType()==="date"){this._controller=BX.InterfaceGridFilterDate.create(BX.CrmParamBag.create({containerId:this._filter.getFieldContainerId(e),formName:this._filter.getFormName(),currentTime:this._filter.getCurrentTime()}))}if(this._controller){this._controller.layout()}this._handleVisibilityChange()},initializeController:function(){if(this.getType()!=="custom"){return}var e=this._filter.getFieldInfo(this._id);if(!e){return}if(e["typeName"]==="USER"){this._controller=BX.InterfaceGridFilterUser.create(BX.CrmParamBag.create({containerId:this._filter.getFieldContainerId(this._id),info:e}));if(this._controller){this._controller.layout()}}else if(e["typeName"]==="WIDGET_PERIOD"){this._controller=BX.InterfaceGridFilterWidgetPeriod.create(BX.CrmParamBag.create({containerId:this._filter.getFieldContainerId(this._id),info:e}));if(this._controller){this._controller.layout()}}},getId:function(){return this._id},getName:function(){return this._info["name"]},getType:function(){return this._info["type"]},isVisible:function(){return this._isVisible},getToggleHandler:function(){return BX.delegate(this._handleToggleButtonClick,this)},_handleToggleButtonClick:function(e){this.toggle()},_handleDeleteButtonClick:function(e){this.setVisible(false)},_handleVisibilityChange:function(){var e=BX.findChildren(this._container,{tag:/^INPUT|SELECT|TEXTAREA/i},true);if(!BX.type.isArray(e)){return}var t=!this._isVisible;for(var i=0;i<e.length;i++){var n=e[i];var s=n.name;if(s===""){continue}n.disabled=t}},setVisible:function(e){e=!!e;if(this._isVisible===e){return}if(!this._filter.requireFieldVisibilityChange(this)){return}this._container.style.display=e?"":"none";if(this._delimiterContainer){this._delimiterContainer.style.display=e?"":"none"}this._isVisible=e;this._handleVisibilityChange();this._filter.handleFieldVisibilityChange(this)},toggle:function(){this.setVisible(!this._isVisible)},showDeleteButton:function(e){if(this._deleteButton){this._deleteButton.style.display=!!e?"":"none"}},getParams:function(e){if(!this.isVisible()){return}if(this._controller&&this._controller.tryGetParams(e)){return}var t=BX.findChildren(this._container,{tag:/^INPUT|SELECT|TEXTAREA/i},true);for(var i=0;i<t.length;i++){var n=t[i];var s=n.name;if(s===""){continue}switch(n.type.toLowerCase()){case"select-one":case"text":case"textarea":case"hidden":{e[s]=n.value;break}case"radio":{if(n.checked){e[s]=n.value}break}case"checkbox":{e[s]=n.checked?n.value:false;break}case"select-multiple":{s=s.substr(0,s.length-2);e[s]={};for(var r=0;r<n.options.length;r++){if(n.options[r].selected&&n.options[r].value){e[s]["sel"+n.options[r].value]=n.options[r].value}}break}}}},setParams:function(e){if(this._controller&&this._controller.trySetParams(e)){return}var t=BX.findChildren(this._container,{tag:/^INPUT|SELECT|TEXTAREA/i},true);var i=false;for(var n=0;n<t.length;n++){var s=t[n];var r=s.name;if(r===""){continue}var a=false;var l=typeof e[r]!=="undefined"?e[r]:null;switch(s.type.toLowerCase()){case"select-one":case"text":case"textarea":case"hidden":s.value=l!==null?l:"";a=true;break;case"select-multiple":{r=r.substr(0,r.length-2);l=typeof e[r]==="object"&&e[r]?e[r]:{};if(l===null){for(var o=0;o<s.options.length;o++){s.options[o].selected=false}}else{var d=false;for(var h=0;h<s.options.length;h++){var f=s.options[h];var u="sel"+f.value;var c=l[u]?l[u]:null;f.selected=f.value==c;if(f.value==c){d=true}}if(!d&&s.options.length>0&&s.options[0].value==""){s.options[0].selected=true}}a=true;break}case"radio":case"checkbox":{s.checked=l!==null?l:false}a=true;break}if(a){if(!i){i=true}if(BX.type.isFunction(s.onchange)){try{BX.fireEvent(s,"change")}catch(e){}}}}if(i&&this._controller&&BX.type.isFunction(this._controller.handleParamsChange)){this._controller.handleParamsChange()}}};BX.InterfaceGridFilterField.convertParamToFieldId=function(e){return e.replace(/_[a-z]+$/,"")};BX.InterfaceGridFilterField.create=function(e,t){var i=new BX.InterfaceGridFilterField;i.initialize(e,t);return i}}if(typeof BX.InterfaceGridFilterDate==="undefined"){BX.InterfaceGridFilterDate=function(){this._settings=null;this._container=null};BX.InterfaceGridFilterDate.prototype={initialize:function(e){this._settings=e?e:BX.CrmParamBag.create(null);this._container=BX(e.getParam("containerId"));var t=BX.findChild(this._container,{tag:"SELECT",class:"bx-filter-date-interval-select"},true,false);if(t){BX.bind(t,"change",BX.delegate(this._onIntervalChange,this))}BX.bind(BX.findChild(BX.findChild(this._container,{tag:"DIV",class:"bx-filter-date-from"},true,false),{tag:"SPAN",class:"bx-calendar-icon"},true,false),"click",BX.delegate(this._onDataFromClick,this));BX.bind(BX.findChild(BX.findChild(this._container,{tag:"DIV",class:"bx-filter-date-to"},true,false),{tag:"SPAN",class:"bx-calendar-icon"},true,false),"click",BX.delegate(this._onDataToClick,this))},_openCalendar:function(e,t){BX.calendar({node:e,field:t,form:this._settings.getParam("formName"),bTime:false,currentTime:this._settings.getParam("currentTime"),bHideTime:false})},_onIntervalChange:function(e){this.layout()},_onDataFromClick:function(e){var t=BX.findChild(this._container,{tag:"DIV",class:"bx-filter-date-from"},true,false);if(!t){return}this._openCalendar(BX.findChild(t,{tag:"SPAN",class:"bx-calendar-icon"},true,false),BX.findChild(t,{tag:"INPUT",class:"bx-input-date"},true,false))},_onDataToClick:function(e){var t=BX.findChild(this._container,{tag:"DIV",class:"bx-filter-date-to"},true,false);if(!t){return}this._openCalendar(BX.findChild(t,{tag:"SPAN",class:"bx-calendar-icon"},true,false),BX.findChild(t,{tag:"INPUT",class:"bx-input-date"},true,false))},_displayNode:function(e,t){var i=BX.findChild(this._container,e,true,false);if(i){i.style.display=t?"":"none"}},layout:function(){var e=BX.findChild(this._container,{tag:"SELECT",class:"bx-filter-date-interval-select"},true,false);if(!e){return}var t,i,n,s;t=i=n=s=false;var r=e.value;if(r==="interval"){t=i=n=true}else if(r==="before"){i=true}else if(r==="after"||r==="exact"){t=true}else if(r==="days"){s=true}this._displayNode({tag:"DIV",class:"bx-filter-date-days"},s);this._displayNode({tag:"DIV",class:"bx-filter-date-days-suffix"},s);this._displayNode({tag:"DIV",class:"bx-filter-date-from"},t);this._displayNode({tag:"DIV",class:"bx-filter-date-to"},i);this._displayNode({tag:"SPAN",class:"bx-filter-calendar-separate"},n)},tryGetParams:function(e){return false},trySetParams:function(e){return false},handleParamsChange:function(){this.layout()}};BX.InterfaceGridFilterDate.create=function(e){var t=new BX.InterfaceGridFilterDate;t.initialize(e);return t}}if(typeof BX.InterfaceGridFilterUser==="undefined"){BX.InterfaceGridFilterUser=function(){this._settings=null;this._info=null;this._container=null};BX.InterfaceGridFilterUser.prototype={initialize:function(e){this._settings=e?e:BX.CrmParamBag.create(null);this._container=BX(e.getParam("containerId"));this._info=e.getParam("info",null)},layout:function(){},trySetParams:function(e){if(!this._info){return false}var t=this._info["params"]?this._info["params"]:{};var i=t["data"]?t["data"]:{};this._setElementByParam(i["elementId"],i["paramName"],e);var n=t["search"]?t["search"]:{};this._setElementByParam(n["elementId"],n["paramName"],e);return true},tryGetParams:function(e){return false},_setElementByParam:function(e,t,i){var n=BX.type.isNotEmptyString(e)?BX(e):null;if(BX.type.isElementNode(n)){n.value=BX.type.isNotEmptyString(t)&&i[t]?i[t]:""}}};BX.InterfaceGridFilterUser.create=function(e){var t=new BX.InterfaceGridFilterUser;t.initialize(e);return t}}if(typeof BX.InterfaceGridFilterWidgetPeriod==="undefined"){BX.InterfaceGridFilterWidgetPeriod=function(){this._settings=null;this._info=null;this._container=null;this._editor=null;this._editorId="";this._elementId="";this._editorChangeListener=BX.delegate(this.onEditorChange,this)};BX.InterfaceGridFilterWidgetPeriod.prototype={initialize:function(e){this._settings=e?e:BX.CrmParamBag.create(null);this._container=BX(e.getParam("containerId"));this._info=e.getParam("info",null);if(this._info){this._editorId=this._info["params"]["editor"]["id"];this._elementId=this._info["params"]["data"]["elementId"]}if(typeof BX.CrmWidgetConfigPeriodEditor!=="undefined"){if(typeof BX.CrmWidgetConfigPeriodEditor.items[this._editorId]!=="undefined"){this.setEditor(BX.CrmWidgetConfigPeriodEditor.items[this._editorId])}else{BX.addCustomEvent(window,"CrmWidgetConfigPeriodEditorCreate",BX.delegate(this.onEditorCreate,this))}}},layout:function(){},trySetParams:function(e){var t=this._info["params"]["data"];var i=e[t["paramName"]]?e[t["paramName"]]:"";if(this._editor){this._editor.removeChangeListener(this._editorChangeListener);var n=this.internalizeConfig(i);this._editor.setPeriod(n["period"]);if(BX.type.isNumber(n["year"])){this._editor.setYear(n["year"])}if(BX.type.isNumber(n["quarter"])){this._editor.setQuarter(n["quarter"])}if(BX.type.isNumber(n["month"])){this._editor.setMonth(n["month"])}this._editor.addChangeListener(this._editorChangeListener)}var s=BX(this._elementId);if(BX.type.isElementNode(s)){s.value=i}return true},tryGetParams:function(e){e[this._info["params"]["data"]["paramName"]]=this.getValue();return true},setEditor:function(e){if(this._editor){this._editor.removeChangeListener(this._editorChangeListener)}this._editor=e;if(this._editor){this._editor.addChangeListener(this._editorChangeListener)}},getValue:function(){if(!this._editor){return""}return this.externalizeConfig({period:this._editor.getPeriod(),year:this._editor.getYear(),quarter:this._editor.getQuarter(),month:this._editor.getMonth()})},internalizeConfig:function(e){var t=new Date;var i=t.getFullYear();var n=t.getMonth()+1;var s=n>=10?4:n>=7?3:n>=4?2:1;var r={period:BX.CrmWidgetFilterPeriod.undefined};var a=e.split("-");if(a.length>0){r["period"]=a[0]}if(r["period"]===BX.CrmWidgetFilterPeriod.year||r["period"]===BX.CrmWidgetFilterPeriod.quarter||r["period"]===BX.CrmWidgetFilterPeriod.month){r["year"]=a.length>1?parseInt(a[1]):i}if(r["period"]===BX.CrmWidgetFilterPeriod.quarter){r["quarter"]=a.length>2?parseInt(a[2]):s}else if(r["period"]===BX.CrmWidgetFilterPeriod.month){r["month"]=a.length>2?parseInt(a[2]):n}return r},externalizeConfig:function(e){var t=e["period"];var i=e["year"];var n=e["quarter"];var s=e["month"];if(t===BX.CrmWidgetFilterPeriod.year){return t+"-"+i}else if(t===BX.CrmWidgetFilterPeriod.quarter){return t+"-"+i+"-"+n}else if(t===BX.CrmWidgetFilterPeriod.month){return t+"-"+i+"-"+s}return t},setValueFromEditor:function(){var e=BX(this._elementId);if(BX.type.isElementNode(e)){e.value=this.getValue()}},onEditorCreate:function(e){if(this._editorId===e.getId()){this.setEditor(e);this.setValueFromEditor()}},onEditorChange:function(e){this.setValueFromEditor()}};BX.InterfaceGridFilterWidgetPeriod.create=function(e){var t=new BX.InterfaceGridFilterWidgetPeriod;t.initialize(e);return t}}if(typeof BX.InterfaceGridFilterSaveAsDialog==="undefined"){BX.InterfaceGridFilterSaveAsDialog=function(){this._id="";this._settings=null;this._filter=null;this._dlg=null;this._buttonId="";this._nameInput=null};BX.InterfaceGridFilterSaveAsDialog.prototype={initialize:function(e,t){this._id=e;this._settings=t?t:BX.CrmParamBag.create(null);this._filter=t.getParam("filter",null)},getId:function(){return this._id},getButtonId:function(){return this._buttonId},getValues:function(){return{name:this._nameInput?this._nameInput.value:""}},openDialog:function(){if(this._dlg){this._dlg.show();return}this._dlg=new BX.PopupWindow(this.getId()+"_SAVE_AS",null,{autoHide:false,draggable:true,offsetLeft:0,offsetTop:0,bindOptions:{forceBindPosition:false},closeByEsc:true,closeIcon:{top:"10px",right:"15px"},titleBar:BX.InterfaceGridFilter.getMessage("saveAsDialogTitle"),events:{onPopupClose:BX.delegate(this._handleDialogClose,this)},content:this._prepareContent(),buttons:this._prepareButtons()});this._dlg.show()},_prepareContent:function(){var e=BX.create("TABLE",{style:{width:"350px",margin:"5px 0 0 0"}});var t=e.insertRow(-1);var i=t.insertCell(-1);i.align="right";i.innerHTML=BX.InterfaceGridFilter.getMessage("saveAsDialogFieldName")+":";i=t.insertCell(-1);this._nameInput=BX.create("INPUT",{style:{width:"200px"},props:{type:"text",maxlength:"255",size:"30"},text:BX.InterfaceGridFilter.getMessage("defaultFilterName")});i.appendChild(this._nameInput);return e},_prepareButtons:function(){return[new BX.PopupWindowButton({text:BX.InterfaceGridFilter.getMessage("buttonSave"),className:"popup-window-button-accept",events:{click:BX.delegate(this._handleSaveButtonClick,this)}}),new BX.PopupWindowButtonLink({text:BX.InterfaceGridFilter.getMessage("buttonCancel"),className:"popup-window-button-link-cancel",events:{click:BX.delegate(this._handleCancelButtonClick,this)}})]},_handleSaveButtonClick:function(e){this._buttonId="save";this._filter.handleSaveAsDialogClose(this);this._dlg.close()},_handleCancelButtonClick:function(e){this._buttonId="cancel";this._filter.handleSaveAsDialogClose(this);this._dlg.close()},_handleDialogClose:function(e){if(this._dlg){this._dlg.destroy()}this._dlg=null}};BX.InterfaceGridFilterSaveAsDialog.create=function(e,t){var i=new BX.InterfaceGridFilterSaveAsDialog;i.initialize(e,t);return i}}if(typeof BX.InterfaceGridFilterCheckListMenu==="undefined"){BX.InterfaceGridFilterCheckListMenu=function(){this._id="";this._settings=null;this._filter=null;this._allowToggle=true;this._items=[];this._menuId="";this._menu=null};BX.InterfaceGridFilterCheckListMenu.prototype={initialize:function(e,t){this._id=e;this._menuId=this._id.toLowerCase();this._settings=t?t:BX.CrmParamBag.create(null);this._filter=t.getParam("filter",null);this._allowToggle=this.getSetting("allowToggle",true);this._closeOnClick=this.getSetting("closeOnClick",false);var i=this.getSetting("items");for(var n=0;n<i.length;n++){var s=i[n];this._items.push(BX.InterfaceGridFilterCheckListMenuItem.create(s["id"],BX.CrmParamBag.create({text:BX.type.isString(s["text"])?s["text"]:"",checked:BX.type.isBoolean(s["checked"])?s["checked"]:false,tag:BX.type.isNotEmptyString(s["tag"])?s["tag"]:"",onchange:BX.type.isFunction(s["onchange"])?s["onchange"]:null,onclick:BX.type.isFunction(s["onclick"])?s["onclick"]:null,allowToggle:BX.type.isBoolean(s["allowToggle"])?s["allowToggle"]:this._allowToggle,closeOnClick:BX.type.isBoolean(s["closeOnClick"])?s["closeOnClick"]:this._closeOnClick,separatorBefore:BX.type.isBoolean(s["separatorBefore"])?s["separatorBefore"]:false,separatorAfter:BX.type.isBoolean(s["separatorAfter"])?s["separatorAfter"]:false,menu:this})))}},getId:function(){return this._id},getSetting:function(e,t){return this._settings.getParam(e,t)},open:function(){var e=[];for(var t=0;t<this._items.length;t++){var i=this._items[t].createPopupMenuItems();for(var n=0;n<i.length;n++){e.push(i[n])}}if(typeof BX.PopupMenu.Data[this._menuId]!=="undefined"){BX.PopupMenu.Data[this._menuId].popupWindow.destroy();delete BX.PopupMenu.Data[this._menuId]}this._menu=BX.PopupMenu.show(this._menuId,this.getSetting("anchor",null),e,{offsetTop:parseInt(this.getSetting("offsetTop",0)),offsetLeft:parseInt(this.getSetting("offsetLeft",0)),angle:this.getSetting("angle",{})})},close:function(){if(typeof BX.PopupMenu.Data[this._menuId]!=="undefined"){BX.PopupMenu.Data[this._menuId].popupWindow.close()}},getItemsByTag:function(e){var t=[];for(var i=0;i<this._items.length;i++){var n=this._items[i];if(n.getTag()===e){t.push(n)}}return t},getContainer:function(){return BX("menu-popup-"+this.getId().toLowerCase())}};BX.InterfaceGridFilterCheckListMenu.create=function(e,t){var i=new BX.InterfaceGridFilterCheckListMenu;i.initialize(e,t);return i}}if(typeof BX.InterfaceGridFilterCheckListMenuItem==="undefined"){BX.InterfaceGridFilterCheckListMenuItem=function(){this._id="";this._settings=null;this._menu=null;this._checked=false;this._tag="";this._allowToggle=true;this._closeOnClick=false};BX.InterfaceGridFilterCheckListMenuItem.prototype={initialize:function(e,t){this._id=e;this._settings=t?t:BX.CrmParamBag.create(null);this._menu=t.getParam("menu",null);this._checked=t.getParam("checked",false);this._tag=this.getSetting("tag","");this._allowToggle=this.getSetting("allowToggle",true);this._closeOnClick=this.getSetting("closeOnClick",false)},getSetting:function(e,t){return this._settings.getParam(e,t)},getId:function(){return this._id},getTag:function(){return this._tag},setTag:function(e){this._tag=e},isChecked:function(){return this._checked},setChecked:function(e){e=!!e;if(this._checked===e){return}this._checked=e;var t=BX.findChild(this._menu.getContainer(),{tag:"A",class:"crm-check-list-menu-item-"+this.getId().toLowerCase()},true,false);if(t){if(e){BX.addClass(t,"menu-popup-item-checked")}else{BX.removeClass(t,"menu-popup-item-checked")}}var i=this.getSetting("onchange",null);if(BX.type.isFunction(i)){try{i({id:this.getId(),checked:e},this)}catch(e){}}},isTogglable:function(){return this._allowToggle},toggle:function(){if(this._allowToggle){this.setChecked(!this.isChecked())}},createPopupMenuItems:function(){var e=[];if(this.getSetting("separatorBefore",false)){e.push({SEPARATOR:true})}e.push({text:this.getSetting("text",this.getId()),className:"crm-filter-popup-item"+(this.isChecked()?" menu-popup-item-checked":"")+" crm-check-list-menu-item-"+this.getId().toLowerCase(),href:"#",onclick:BX.delegate(this._onClick,this)});if(this.getSetting("separatorAfter",false)){e.push({SEPARATOR:true})}return e},_onClick:function(e){BX.PreventDefault(e);var t=this.getSetting("onclick",null);if(BX.type.isFunction(t)){try{t({id:this.getId(),checked:this.isChecked()},this)}catch(e){}}if(this._closeOnClick){this._menu.close();return}this.toggle()}};BX.InterfaceGridFilterCheckListMenuItem.create=function(e,t){var i=new BX.InterfaceGridFilterCheckListMenuItem;i.initialize(e,t);return i}}if(typeof BX.InterfaceGridFilterCloseOpen==="undefined"){BX.InterfaceGridFilterCloseOpen=function(e,t,i){this.filter=i;this.innerBlock=BX(e);this.mainBlock=BX(t);this.isOpen=null};BX.InterfaceGridFilterCloseOpen.prototype={initialize:function(){this.isOpen=!this.filter.isFolded()},_easing:function(e){var t=this;var i=new BX.easing({duration:300,start:{height:e.start},finish:{height:e.finish},transition:BX.easing.makeEaseOut(BX.easing.transitions.circ),step:BX.delegate(this._step,this),complete:BX.proxy(this._complete,this)});i.animate()},toggle:function(){if(this.isOpen){this._easing({start:this.innerBlock.offsetHeight,finish:0});this.isOpen=false}else{this._easing({start:this.mainBlock.offsetHeight,finish:this.innerBlock.offsetHeight});this.isOpen=true}},_step:function(e){this.mainBlock.style.height=e.height+"px"},_complete:function(){if(this.isOpen)this.mainBlock.style.height="auto"}}}if(typeof BX.InterfaceGridFilterNavigationBar==="undefined"){BX.InterfaceGridFilterNavigationBar=function(){this._id="";this._settings=null;this._binding=null;this._items=null;this._activeItem=null;this._menu=null;this._isMenuShown=false;this._containerClickHandler=BX.delegate(this.onContainerClick,this)};BX.InterfaceGridFilterNavigationBar.prototype={initialize:function(e,t){this._id=e;this._settings=t?t:BX.CrmParamBag.create(null);var i=BX(this.getSetting("containerId",""));if(BX.type.isDomNode(i)){BX.bind(i,"click",this._containerClickHandler)}this._binding=this.getSetting("binding",null);this._items=[];var n=this.getSetting("items",[]);for(var s=0;s<n.length;s++){var r=n[s];var a=BX.type.isNotEmptyString(r["id"])?r["id"]:s;r["parent"]=this;var l=BX.InterfaceGridFilterNavigationBarItem.create(a,BX.CrmParamBag.create(r));if(this._activeItem===null&&l.isActive()){this._activeItem=l}this._items.push(l)}},getId:function(){return this._id},getSetting:function(e,t){return this._settings.getParam(e,t)},getBinding:function(){return this._binding},processMenuItemClick:function(e){this.closeMenu();if(!e.isActive()){e.openUrl()}},openMenu:function(){if(this._isMenuShown){return}this._menuId=this._id+"_menu";if(typeof BX.PopupMenu.Data[this._menuId]!=="undefined"){BX.PopupMenu.Data[this._menuId].popupWindow.destroy();delete BX.PopupMenu.Data[this._menuId]}var e=[];for(var t=0,i=this._items.length;t<i;t++){e.push(this._items[t].createMenuItem())}this._menu=BX.PopupMenu.create(this._menuId,this._activeItem.getButton(),e,{autoHide:true,offsetLeft:5,offsetTop:5,angle:{position:"top",offset:42},events:{onPopupClose:BX.delegate(this.onMenuClose,this)}});this._menu.popupWindow.show();this._isMenuShown=true},closeMenu:function(){if(this._menu&&this._menu.popupWindow){this._menu.popupWindow.close()}},onMenuClose:function(){this._menu=null;if(typeof BX.PopupMenu.Data[this._menuId]!=="undefined"){BX.PopupMenu.Data[this._menuId].popupWindow.destroy();delete BX.PopupMenu.Data[this._menuId]}this._isMenuShown=false},onContainerClick:function(e){this.openMenu()}};BX.InterfaceGridFilterNavigationBar.create=function(e,t){var i=new BX.InterfaceGridFilterNavigationBar;i.initialize(e,t);return i}}if(typeof BX.InterfaceGridFilterNavigationBarItem==="undefined"){BX.InterfaceGridFilterNavigationBarItem=function(){this._id="";this._settings=null;this._parent=null;this._button=null;this._name="";this._hint=null;this._isActive=false;this._menuItemClickHandler=BX.delegate(this.onMenuItemClick,this)};BX.InterfaceGridFilterNavigationBarItem.prototype={initialize:function(e,t){this._id=e;this._settings=t?t:BX.CrmParamBag.create(null);this._name=this.getSetting("name","");this._parent=this.getSetting("parent");if(!this._parent){throw"InterfaceGridFilterNavigationBarItem: The parameter 'parent' is not found."}this._isActive=this.getSetting("active",false);if(this._isActive){this._button=BX(this.getSetting("buttonId"));if(this._button){if(this.getSetting("enableHint",true)){this.createHint(this.getSetting("hint",null))}}}},getId:function(){return this._id},getSetting:function(e,t){return this._settings.getParam(e,t)},getName:function(){return this._name},getButton:function(){return this._button},isActive:function(){return this._isActive},createHint:function(e){if(!e||!this._button){return}this._hint=BX.PopupWindowManager.create(this._id+"_hint",this._button,{autoHide:true,closeByEsc:false,angle:{position:"bottom",offset:42},events:{onPopupClose:BX.delegate(this.onHintClose,this)},content:BX.create("DIV",{attrs:{className:"crm-popup-contents"},children:[BX.create("SPAN",{attrs:{className:"crm-popup-title"},text:e["title"]}),BX.create("P",{text:e["content"]}),BX.create("P",{children:[BX.create("A",{props:{href:"#"},text:e["disabling"],events:{click:BX.delegate(this.onDisableHint,this)}})]})]})});this._hint.show()},createMenuItem:function(){var e=this._isActive?"crm-filter-nav-popup-menu-item-checked":"crm-filter-nav-popup-menu-item-checked-no";var t=this.getSetting("icon","");if(t!==""){e+=" crm-menu-popup-item-icon-"+t}return{id:this._id,text:this._name,className:e,onclick:this._menuItemClickHandler}},openUrl:function(){var e=this.getSetting("url","");if(e===""){return}var t=this._parent.getBinding();if(t){var i=BX.type.isNotEmptyString(t["category"])?t["category"]:"";var n=BX.type.isNotEmptyString(t["name"])?t["name"]:"";var s=BX.type.isNotEmptyString(t["key"])?t["key"]:"";if(i!==""&&n!==""&&s!==""){var r=new Date;var a=r.getFullYear().toString();var l=r.getMonth()+1;l=l>=10?l.toString():"0"+l.toString();var o=r.getDate();o=o>=10?o.toString():"0"+o.toString();var d=this._id+":"+a+l+o;BX.userOptions.save(i,n,s,d,false)}}setTimeout(function(){window.location.href=e},150)},onDisableHint:function(e){if(this._hint){this._hint.close();BX.userOptions.save("main.interface.filter.navigation",this._parent.getId().toLowerCase(),"enable_"+this._id.toLowerCase()+"_hint","N",false)}return BX.PreventDefault(e)},onHintClose:function(){if(this._hint){this._hint.destroy();this._hint=null}},onMenuItemClick:function(e,t){this._parent.processMenuItemClick(this)}};BX.InterfaceGridFilterNavigationBarItem.create=function(e,t){var i=new BX.InterfaceGridFilterNavigationBarItem;i.initialize(e,t);return i}}
/* End */
;
; /* Start:"a:4:{s:4:"full";s:95:"/bitrix/components/bitrix/crm.product.section.tree/templates/.default/script.js?154412740114884";s:6:"source";s:79:"/bitrix/components/bitrix/crm.product.section.tree/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
BX.namespace("BX.Crm");

BX.Crm.showModalWithStatusAction = function (response, action)
{
	if (!response.message) {
		if (response.status == "success") {
			response.message = BX.message("CRM_JS_STATUS_ACTION_SUCCESS");
		}
		else {
			response.message = BX.message("CRM_JS_STATUS_ACTION_ERROR") + ". " + this.getFirstErrorFromResponse(response);
		}
	}
	var messageBox = BX.create("div", {
		props: {
			className: "bx-crm-alert"
		},
		children: [
			BX.create("span", {
				props: {
					className: "bx-crm-aligner"
				}
			}),
			BX.create("span", {
				props: {
					className: "bx-crm-alert-text"
				},
				text: response.message
			}),
			BX.create("div", {
				props: {
					className: "bx-crm-alert-footer"
				}
			})
		]
	});

	var currentPopup = BX.PopupWindowManager.getCurrentPopup();
	if(currentPopup)
	{
		currentPopup.destroy();
	}

	var idTimeout = setTimeout(function ()
	{
		var w = BX.PopupWindowManager.getCurrentPopup();
		if (!w || w.uniquePopupId != "bx-crm-status-action") {
			return;
		}
		w.close();
		w.destroy();
	}, 3000);
	var popupConfirm = BX.PopupWindowManager.create("bx-crm-status-action", null, {
		content: messageBox,
		onPopupClose: function ()
		{
			this.destroy();
			clearTimeout(idTimeout);
		},
		autoHide: true,
		zIndex: 10200,
		className: "bx-crm-alert-popup"
	});
	popupConfirm.show();

	BX("bx-crm-status-action").onmouseover = function (e)
	{
		clearTimeout(idTimeout);
	};

	BX("bx-crm-status-action").onmouseout = function (e)
	{
		idTimeout = setTimeout(function ()
		{
			var w = BX.PopupWindowManager.getCurrentPopup();
			if (!w || w.uniquePopupId != "bx-crm-status-action") {
				return;
			}
			w.close();
			w.destroy();
		}, 3000);
	};
};
BX.Crm.getFirstErrorFromResponse = function(reponse)
{
	reponse = reponse || {};
	if(!reponse.errors)
		return "";

	return reponse.errors.shift().message;
};


BX.Crm.ProductSectionTreeClass = (function ()
{
	var ProductSectionTreeClass = function (parameters)
	{
		this.catalogId = parseInt(parameters["catalogId"]);
		this.sectionId = parseInt(parameters["sectionId"]);
		this.treeInfo = parameters["treeInfo"];
		this.productListUri = parameters["productListUri"];
		this.jsEventsMode = false;
		this.isExternalSectionSelectDisabled = false;
		this.isSelectSectionEventDisabled = false;
		if (typeof(parameters["jsEventsMode"]) !== "undefined" && parameters["jsEventsMode"] !== null)
			this.jsEventsMode = !!parameters["jsEventsMode"];
		this.containerId = parameters.containerId;
		this.container = BX(this.containerId);
		this.ajaxUrl = "/bitrix/components/bitrix/crm.product.section.tree/ajax.php";
		this.jsEventsManagerId = parameters.jsEventsManagerId || "";
		this.jsEventsManager = BX.Crm[this.jsEventsManagerId] || null;

		this.setEvents();

		this.selectedNodes = [];
		this.sectionInfo = {
			"0": {
				node: BX.findPreviousSibling(this.container, {"tag": "div", "class": "tal"}),
				name: BX.message("CRM_PRODUCT_SECTION_TREE_TITLE")
			}
		};
		this.buildTree(this.container, this.treeInfo);
		this.container.style.display = "block";

		if (this.container)
		{
			var tal = this.sectionInfo["0"].node;
			if (tal)
			{
				BX.bind(tal, "click", BX.delegate(this.handleTitleClick, this));
				tal.style.cursor = "pointer";
			}
		}
	};

	ProductSectionTreeClass.prototype = {
		setEvents: function ()
		{
			BX.addCustomEvent("onBeforeSelectSection", BX.proxy(this.onBeforeSelectSection, this));
			BX.addCustomEvent(this.container, "onSelectSection", BX.proxy(this.onSelectSection, this));
			//BX.addCustomEvent(this.container, "onUnSelectSection", BX.proxy(this.onUnSelectSection, this));
			BX.addCustomEvent("onRemoveRowFromProductList", BX.proxy(this.onRemoveRowFromProductList, this));

			if (this.jsEventsMode)
			{
				this.jsEventsManager.registerEventHandler("CrmProduct_SelectSection", BX.proxy(this.onExternalSectionSelect, this));
			}
		},
		buildTreeNode: function (sectionInfo)
		{
			var node;
			node = BX.create("li", {
				props: {
					className: "bx-crm-section-container bx-crm-parent bx-crm-close"
				},
				attrs: {
					"data-object-id": sectionInfo.id
				},
				children: [
					BX.create("div", {
						props: {
							className: "bx-crm-section-container"
						},
						children: [
							BX.create("table", {
								children: [
									BX.create("tr", {
										children: [
											BX.create("td", {
												props: {
													className: "bx-crm-wf-arrow"
												},
												events: {
													click: BX.delegate(this.handleArrowClick, this)
												},
												children: [
													BX.create("span")
												]
											}),
											BX.create("td", {
												props: {
													className: "bx-crm-wf-section-icon"
												},
												children: [
													BX.create("span")
												]
											}),
											BX.create("td", {
												props: {
													className: "bx-crm-wf-section-name"
												},
												events: {
													click: BX.delegate(function (e)
													{
														var target = e.target || e.srcElement;
														var parent = BX.findParent(target, {
															className: "bx-crm-parent"
														});
														BX.onCustomEvent("onBeforeSelectSection", [parent]);
														//if (BX.hasClass(parent, "selected")) {
															/*BX.removeClass(parent, "selected");
															BX.onCustomEvent(this.container, "onUnSelectSection", [parent]);*/
															//return;
														//}
														BX.onCustomEvent(this.container, "onSelectSection", [parent]);
													}, this)
												},
												children: [
													BX.create("span", {
														text: sectionInfo.name
													})
												]
											})
										]
									})
								]
							})
						]
					})
				]
			});

			if (sectionInfo["selected"] === "Y")
			{
				BX.addClass(node, "selected");
				this.selectedNodes.push({id: sectionInfo.id, node: node});
			}

			if (sectionInfo["hasChildren"] !== "Y")
			{
				var td;
				if(td = BX.findChild(node, {className: "bx-crm-wf-arrow"}, true))
					BX.addClass(td, "bx-crm-wf-section-empty");
			}

			this.sectionInfo[sectionInfo.id] = {node: node, name: sectionInfo.name};

			var dest = BX.findChild(node, {
				className: "bx-crm-section-container"
			});
			if(!dest)
			{
				return node;
			}

			dest.onbxdestdraghout = function ()
			{
				BX.removeClass(this.parentNode, "selected");
			};
			dest.onbxdestdragfinish = BX.delegate(
				function (currentNode, x, y) {
				BX.ajax({
					method: "POST",
					dataType: "json",
					url: this.ajaxUrl,
					data: {
						action: "moveTo",
						catalogId: this.catalogId,
						sectionId: currentNode.getAttribute("data-object-id"),
						targetSectionId: BX.proxy_context.parentNode.getAttribute("data-object-id"),
						sessid: BX.bitrix_sessid()
					},
					onsuccess: function (response) {
						BX.Crm.showModalWithStatusAction(response);
					}
				});

				return true;
			},
				this
			);
			dest.onbxdestdraghover = function (currentNode, x, y)
			{
				if(BX.hasClass(this.parentNode, "selected"))
				{
					return;
				}
				BX.addClass(this.parentNode, "selected");

				if(BX.hasClass(this.parentNode, "bx-crm-open"))
				{
					return;
				}

				var arrow = BX.findChild(this, {
					className: "bx-crm-wf-arrow"
				}, true);
				if(!arrow)
					return;

				BX.fireEvent(arrow, "click");

				return true;
			};
			window.jsDD.registerDest(dest);

			return node;
		},
		buildTree: function(node, treeInfo, checkChildren, buildUp)
		{
			buildUp = !!buildUp;

			if (!node || !treeInfo)
				return;

			var el, id, i, ul, td;

			ul = null;
			if (treeInfo instanceof Array)
			{
				for (i = 0; i < treeInfo.length; i++)
				{
					if (buildUp)
					{
						if (this.sectionInfo[treeInfo[i]["ID"]])
						{
							var childNode = this.sectionInfo[treeInfo[i]["ID"]].node;
							this.buildTree(childNode, treeInfo[i]["CHILDREN"], false, true);
						}
						else
						{
							this.buildTree(node, treeInfo);
						}
					}
					else
					{
						if (i === 0)
						{
							while (el = BX.findChild(node, {"tag": "ul", "class": "bx-crm-wood-section"}))
								node.removeChild(el);
							ul = BX.create("ul", {props: {className: "bx-crm-wood-section"}});
						}

						if (ul)
						{
							el = this.buildTreeNode({
								"id": treeInfo[i]["ID"],
								"name": treeInfo[i]["NAME"],
								"selected": treeInfo[i]["SELECTED"],
								"hasChildren": treeInfo[i]["HAS_CHILDREN"]
							});
							if (treeInfo[i]["SELECTED"] === "Y" && !treeInfo[i]["CHILDREN"].length)
							{
								if(td = BX.findChild(el, {className: "bx-crm-wf-arrow"}, true))
									BX.addClass(td, "bx-crm-wf-section-empty");
							}
							ul.appendChild(el);
							if (treeInfo[i]["CHILDREN"])
							{
								this.buildTree(el, treeInfo[i]["CHILDREN"]);
							}
							node.appendChild(ul);
							if (node !== this.container)
							{
								BX.removeClass(node, "bx-crm-close");
								BX.addClass(node, "bx-crm-open");
								BX.addClass(node, "bx-crm-loaded");
							}
						}
					}
				}
				if (i === 0 && !!checkChildren)
				{
					td = BX.findChild(node, {
						className: "bx-crm-wf-arrow"
					}, true);
					if(td)
						BX.addClass(td, "bx-crm-wf-section-empty");
				}
			}
		},
		loadSubsections: function (node)
		{
			if (!node)
				return;

			var sectionId = node.getAttribute("data-object-id");
			if (!sectionId)
				return;

			BX.ajax({
				method: "POST",
				dataType: "json",
				url: this.ajaxUrl,
				data: {
					action: "getSubsections",
					catalogId: this.catalogId,
					sectionId: sectionId,
					sessid: BX.bitrix_sessid()
				},
				onsuccess: BX.delegate(function (response)
				{
					if(!response || response.status != "success")
					{
						BX.Crm.showModalWithStatusAction(response);
						return;
					}
					this.buildTree(node, response["response"], true);
					window.jsDD.refreshDestArea();

				}, this)
			})
		},
		expandTree: function (sectionId)
		{
			BX.ajax({
				method: "POST",
				dataType: "json",
				url: this.ajaxUrl,
				data: {
					action: "getInitialTree",
					catalogId: this.catalogId,
					sectionId: sectionId,
					sessid: BX.bitrix_sessid()
				},
				onsuccess: BX.delegate(function (response)
				{
					if(!response || response.status != "success")
					{
						BX.Crm.showModalWithStatusAction(response);
						return;
					}
					this.handleExpandTreeAjaxResponse(response);
					window.jsDD.refreshDestArea();

				}, this)
			})
		},
		handleExpandTreeAjaxResponse: function (response)
		{
			if (response["response"] && response["response"] instanceof Array && response["response"].length)
				this.buildTree(this.container, response["response"], false, true);
		},
		onBeforeSelectSection: function (nodeSelected)
		{
			var nodeInfo;

			while (this.selectedNodes.length > 0)
			{
				nodeInfo = this.selectedNodes.shift();
				if (BX.type.isDomNode(nodeInfo.node))
					BX.removeClass(nodeInfo.node, "selected");
			}
		},
		onExternalSectionSelect: function (params)
		{
			if (this.isExternalSectionSelectDisabled)
				return;

			this.isSelectSectionEventDisabled = true;

			if (params && params.hasOwnProperty("sectionId"))
			{
				BX.onCustomEvent("onBeforeSelectSection", [null]);
				if (parseInt(params.sectionId) === 0)
				{
					this.selectedNodes.push({id: "0", node: null});
				}
				else
				{
					if (!this.sectionInfo[params.sectionId])
					{
						this.expandTree(params.sectionId);
					}
					if (this.sectionInfo[params.sectionId])
					{
						var node = this.sectionInfo[params.sectionId].node;
						this.expandParents(node);
						this.onSelectSection(node);
					}
				}
			}

			this.isSelectSectionEventDisabled = false;
		},
		onSelectSection: function (node)
		{
			if (!BX.type.isDomNode(node))
				return;

			BX.addClass(node, "selected");

			var sectionId = node.getAttribute("data-object-id");
			if (!sectionId)
				return;

			this.selectedNodes.push({id: sectionId, node: node});

			this.sectionId = sectionId;

			if (this.jsEventsMode)
			{
				var arrowNode = BX.findChild(node, {tagName: "td", className: "bx-crm-wf-arrow"}, true);
				if (arrowNode)
				{
					var arrowParent = BX.findParent(arrowNode, {className: "bx-crm-parent"});
					if (!BX.hasClass(arrowParent, "bx-crm-open"))
						BX.fireEvent(arrowNode, "click");
				}

				var params = {
					catalogId: this.catalogId,
					sectionId: sectionId,
					sectionName: this.sectionInfo[sectionId].name
				};
				if (!this.isSelectSectionEventDisabled)
				{
					this.isExternalSectionSelectDisabled = true;
					this.jsEventsManager.fireEvent("CrmProduct_SelectSection", [params]);
					this.isExternalSectionSelectDisabled = false;
				}
			}
			else
			{
				var url = this.productListUri;
				document.location.href = url.replace(/#section_id#/g, sectionId);
			}
		},
		/*onUnSelectSection: function (node)
		{
		},*/
		onRemoveRowFromProductList: function (sectionId)
		{
			BX.remove(
				BX.findChild(
					this.container,
					{
						tagName: "li",
						className: "bx-crm-section-container",
						attribute: {"data-object-id": sectionId}
					}, true
				)
			);
		},
		handleTitleClick: function(e)
		{
			BX.onCustomEvent("onBeforeSelectSection", [null]);
			this.selectedNodes.push({id: "0", node: null});
			if (this.jsEventsMode)
			{
				var params = {
					catalogId: this.catalogId,
					sectionId: "0",
					sectionName: this.sectionInfo["0"].name
				};
				if (!this.isSelectSectionEventDisabled)
				{
					this.isExternalSectionSelectDisabled = true;
					BX.onCustomEvent(this.jsEventsManager, "CrmProduct_SelectSection", [params]);
					this.isExternalSectionSelectDisabled = false;
				}
			}
			else
			{
				var url = this.productListUri;
				document.location.href = url.replace(/#section_id#/g, "0");
			}
		},
		handleArrowClick: function (e)
		{
			var target = e.target || e.srcElement;
			var parent = BX.findParent(target, {
				className: "bx-crm-parent"
			});
			if (BX.hasClass(parent, "bx-crm-open")) {
				BX.removeClass(parent, "bx-crm-open");
				BX.addClass(parent, "bx-crm-close");
				return;
			}
			if (BX.hasClass(parent, "bx-crm-loaded")) {
				BX.removeClass(parent, "bx-crm-close");
				BX.addClass(parent, "bx-crm-open");
				return;
			}
			this.loadSubsections(parent);
		},
		expandParents: function (node)
		{
			if (!BX.type.isDomNode(node))
				return;

			var parent, arrow;
			parent = node;
			while(parent = BX.findParent(parent, {tag: "li", className: "bx-crm-parent"}, this.container))
			{
				if (BX.hasClass(parent, "bx-crm-close") && parent.hasAttribute("data-object-id"))
				{
					arrow = BX.findChild(parent, {tagName: "td", className: "bx-crm-wf-arrow"}, true);
					if (arrow)
					{
						BX.fireEvent(arrow, "click");
					}
				}
			}
		}
	};

	return ProductSectionTreeClass;
})();

/* End */
;
; /* Start:"a:4:{s:4:"full";s:100:"/bitrix/components/bitrix/crm.product.section.crumbs/templates/.default/script.min.js?15441274017474";s:6:"source";s:81:"/bitrix/components/bitrix/crm.product.section.crumbs/templates/.default/script.js";s:3:"min";s:85:"/bitrix/components/bitrix/crm.product.section.crumbs/templates/.default/script.min.js";s:3:"map";s:85:"/bitrix/components/bitrix/crm.product.section.crumbs/templates/.default/script.map.js";}"*/
BX.namespace("BX.Crm");if(typeof BX.Crm.showModalWithStatusAction==="undefined"){BX.Crm.showModalWithStatusAction=function(t,e){if(!t.message){if(t.status=="success"){t.message=BX.message("CRM_JS_STATUS_ACTION_SUCCESS")}else{t.message=BX.message("CRM_JS_STATUS_ACTION_ERROR")+". "+this.getFirstErrorFromResponse(t)}}var s=BX.create("div",{props:{className:"bx-crm-alert"},children:[BX.create("span",{props:{className:"bx-crm-aligner"}}),BX.create("span",{props:{className:"bx-crm-alert-text"},text:t.message}),BX.create("div",{props:{className:"bx-crm-alert-footer"}})]});var i=BX.PopupWindowManager.getCurrentPopup();if(i){i.destroy()}var r=setTimeout(function(){var t=BX.PopupWindowManager.getCurrentPopup();if(!t||t.uniquePopupId!="bx-crm-status-action"){return}t.close();t.destroy()},3e3);var n=BX.PopupWindowManager.create("bx-crm-status-action",null,{content:s,onPopupClose:function(){this.destroy();clearTimeout(r)},autoHide:true,zIndex:10200,className:"bx-crm-alert-popup"});n.show();BX("bx-crm-status-action").onmouseover=function(t){clearTimeout(r)};BX("bx-crm-status-action").onmouseout=function(t){r=setTimeout(function(){var t=BX.PopupWindowManager.getCurrentPopup();if(!t||t.uniquePopupId!="bx-crm-status-action"){return}t.close();t.destroy()},3e3)}}}if(typeof BX.Crm.getFirstErrorFromResponse==="undefined"){BX.Crm.getFirstErrorFromResponse=function(t){t=t||{};if(!t.errors)return"";return t.errors.shift().message}}BX.Crm.ProductSectionCrumbsClass=function(){var t=function(t){this.containerId=t.containerId;this.catalogId=t.catalogId||0;this.sectionId=t.catalogId||0;this.crumbs=t.crumbs||[];this.componentId=t.componentId||"";this.collapsedCrumbs=[];this.childrenCrumbs=[];this.showOnlyDeleted=t.showOnlyDeleted||0;this.jsEventsMode=!!t.jsEventsMode;this.container=BX(this.containerId);this.isExternalSectionSelectDisabled=false;this.isSelectSectionEventDisabled=false;this.ajaxUrl="/bitrix/components/bitrix/crm.product.section.crumbs/ajax.php";this.jsEventsManagerId=t.jsEventsManagerId||"";this.jsEventsManager=BX.Crm[this.jsEventsManagerId]||null;this.container.style.opacity=1;this.buildCrumbs(this.sectionId,this.crumbs);if(this.jsEventsMode){this.jsEventsManager.registerEventHandler("CrmProduct_SelectSection",BX.delegate(this.onExternalSectionSelect,this))}};t.prototype={setEvents:function(){BX.bindDelegate(this.container,"click",{tag:"span",className:"icon-arrow"},BX.proxy(this.onClickArrow,this));BX.bind(BX("root_dots_"+this.containerId),"click",BX.proxy(this.onClickDots,this))},unsetEvents:function(){BX.unbindAll(this.container);BX.unbindAll(BX("root_dots_"+this.containerId))},expand:function(t,e,s){var i=t.getAttribute("data-objectId");BX.PopupMenu.show("crm_product_section_crumbs_"+i,e,s[i],{autoHide:true,angle:{offset:0},events:{onPopupClose:function(){}}})},onClickDots:function(t){var e=BX.PopupMenu.getMenuById("crm_product_section_crumbs_0");if(e&&e.popupWindow)BX.PopupMenu.destroy("crm_product_section_crumbs_0");var s=t.srcElement||t.target;BX.PopupMenu.show("crm_product_section_crumbs_0",s,this.collapsedCrumbs,{autoHide:true,angle:{offset:0},events:{onPopupClose:function(){}}})},onClickArrow:function(t){var e=t.srcElement||t.target;var s=BX.findParent(e,{className:"bx-crm-interface-product-section-crumbs-item-container"},this.container);var i=s.getAttribute("data-objectId");var r=s.getAttribute("data-isRoot");if(i){var n=BX.PopupMenu.getMenuById("crm_product_section_crumbs_"+i);if(n&&n.popupWindow)BX.PopupMenu.destroy("crm_product_section_crumbs_"+i);this.expand(s,e,this.childrenCrumbs)}},reloadCrumbs:function(t){BX.ajax({method:"POST",dataType:"json",url:this.ajaxUrl,data:{action:"getCrumbs",componentId:this.componentId,catalogId:this.catalogId,sectionId:t,urlTemplate:"#section_id#",jsEventsMode:this.jsEventsMode?"Y":"N",sessid:BX.bitrix_sessid()},onsuccess:BX.delegate(function(e){if(!e||e.status!="success"){BX.Crm.showModalWithStatusAction(e);return}this.buildCrumbs(t,e["response"])},this)})},onSectionSelect:function(t){if(!this.isSelectSectionEventDisabled&&this.jsEventsMode){this.isExternalSectionSelectDisabled=true;this.jsEventsManager.fireEvent("CrmProduct_SelectSection",[t]);this.reloadCrumbs(t["sectionId"]);this.isExternalSectionSelectDisabled=false}},onExternalSectionSelect:function(t){if(this.isExternalSectionSelectDisabled)return;if(t&&t.hasOwnProperty("sectionId")){this.reloadCrumbs(t.sectionId)}},buildCrumbs:function(t,e){var s=[];var i=[],r=[],n={},o,c;var a,u;this.cleanCrumbs();if(e instanceof Array){s=e.splice(-3,3);for(a=0;a<e.length;a++){n={};n["title"]="";n["text"]=BX.util.htmlspecialchars(e[a]["NAME"]);n["data"]={menuId:"crm_product_section_crumbs_0",sectionId:""+e[a]["ID"]};if(this.jsEventsMode)n["onclick"]=BX.proxy(this.onClickCrumbLink,this);else n["href"]=e[a]["LINK"];i[a]=n}}if(i.length>0){this.container.appendChild(BX.create("SPAN",{attrs:{id:"root_dots_"+this.containerId,className:"bx-crm-interface-product-section-crumbs-item-container-arrow"}}))}for(a=0;a<s.length;a++){if(s[a]["CHILDREN"]instanceof Array){o=s[a]["CHILDREN"];for(u=0;u<o.length;u++){n={};n["title"]="";n["text"]=BX.util.htmlspecialchars(o[u]["NAME"]);n["data"]={menuId:"crm_product_section_crumbs_"+s[a]["ID"],sectionId:o[u]["LINK"]};if(this.jsEventsMode)n["onclick"]=BX.proxy(this.onClickCrumbLink,this);else n["href"]=o[u]["LINK"];if(!r[s[a]["ID"]])r[s[a]["ID"]]=[];r[s[a]["ID"]].push(n)}c=BX.create("SPAN",{attrs:{"class":"bx-crm-interface-product-section-crumbs-item-container","data-isRoot":parseInt(s[a]["ID"])===0?"1":"","data-objectId":BX.util.htmlspecialchars(""+s[a]["ID"]),"data-objectName":BX.util.htmlspecialchars(s[a]["NAME"])}});if(s.length!==a+1){c.appendChild(BX.create("SPAN",{attrs:{className:"popup-control"},children:[BX.create("SPAN",{attrs:{className:"popup-current"},children:[BX.create("SPAN",{attrs:{className:"icon-arrow"}})]})]}))}if(this.jsEventsMode){c.appendChild(BX.create("SPAN",{attrs:{className:"bx-crm-interface-product-section-crumbs-item-link",style:"cursor: pointer;"},events:{click:BX.proxy(this.onClickCrumbLink,this)},children:[BX.create("SPAN",{attrs:{className:"bx-crm-interface-product-section-crumbs-item-current"},html:BX.util.htmlspecialchars(s[a]["NAME"])})]}))}else{c.appendChild(BX.create("A",{attrs:{className:"bx-crm-interface-product-section-crumbs-item-link",style:"cursor: pointer;",href:s[a]["LINK"]},children:[BX.create("SPAN",{attrs:{className:"bx-crm-interface-product-section-crumbs-item-current"},html:BX.util.htmlspecialchars(s[a]["NAME"])})]}))}c.appendChild(BX.create("SPAN",{attrs:{className:"clb"}}));this.container.appendChild(c)}}this.sectionId=t;this.collapsedCrumbs=i;this.childrenCrumbs=r;this.setEvents()},cleanCrumbs:function(){this.unsetEvents();if(BX.type.isDomNode(this.container))BX.cleanNode(this.container)},onClickCrumbLink:function(t,e){if(t&&!e){var s=BX.getEventTarget(t);if(s){var i=BX.findParent(s,{className:"bx-crm-interface-product-section-crumbs-item-container"},this.container);var r=i.getAttribute("data-objectId");var n=i.getAttribute("data-objectName");var o=i.getAttribute("data-isRoot");if(r&&n)this.onSectionSelect({sectionId:r,sectionName:n})}}else if(e&&typeof e==="object"&&e["data"]&&e["data"]["menuId"]&&e["data"]["sectionId"]&&e["text"]){var c=BX.PopupMenu.getMenuById(e["data"]["menuId"]);if(c){if(c&&c.popupWindow)BX.PopupMenu.destroy(e["data"]["menuId"])}this.onSectionSelect({sectionId:e["data"]["sectionId"],sectionName:e["text"]})}}};return t}();
/* End */
;
; /* Start:"a:4:{s:4:"full";s:85:"/bitrix/components/bitrix/crm.product.menu/templates/.default/script.js?1544127401484";s:6:"source";s:71:"/bitrix/components/bitrix/crm.product.menu/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/

function product_delete(title, message, btnTitle, path)
{
	var d;
	d = new BX.CDialog({
		title: title,
		head: '',
		content: message,
		resizable: false,
		draggable: true,
		height: 70,
		width: 300
	});
	
	var _BTN = [	
		{
			title: btnTitle,
			id: 'crmOk',
			'action': function () 
			{
				window.location.href = path;
				BX.WindowManager.Get().Close();
			}
		},
		BX.CDialog.btnCancel
	];	
	d.ClearButtons();
	d.SetButtons(_BTN);
	d.Show();
}
/* End */
;
; /* Start:"a:4:{s:4:"full";s:91:"/bitrix/components/bitrix/crm.interface.toolbar/templates/flat/script.min.js?15441274011784";s:6:"source";s:72:"/bitrix/components/bitrix/crm.interface.toolbar/templates/flat/script.js";s:3:"min";s:76:"/bitrix/components/bitrix/crm.interface.toolbar/templates/flat/script.min.js";s:3:"map";s:76:"/bitrix/components/bitrix/crm.interface.toolbar/templates/flat/script.map.js";}"*/
if(typeof BX.InterfaceToolBar==="undefined"){BX.InterfaceToolBar=function(){this._id="";this._settings=null;this._container=null;this._moreBtn=null};BX.InterfaceToolBar.prototype={initialize:function(e,t){this._id=e;this._settings=t?t:BX.CrmParamBag.create(null);var n=this._container=BX(this.getSetting("containerId",""));if(n){var i=this.getSetting("moreButtonClassName","crm-setting-btn");if(BX.type.isNotEmptyString(i)){var r=this._moreBtn=BX.findChild(n,{className:i},true,false).parentNode;if(r){BX.bind(r,"click",BX.delegate(this._onMoreButtonClick,this))}}}},getId:function(){return this._id},getSetting:function(e,t){return this._settings.getParam(e,t)},_onMenuClose:function(){var e={menu:this._menu};BX.onCustomEvent(window,"CrmInterfaceToolbarMenuClose",[this,e])},_onMoreButtonClick:function(e){var t=this.getSetting("items",null);if(!BX.type.isArray(t)){return}var n=/return\s+false(\s*;)?\s*$/;var i=/;\s*$/;var r=[];for(var o=0;o<t.length;o++){var s=t[o];var a=typeof s["SEPARATOR"]!=="undefined"?s["SEPARATOR"]:false;if(a){r.push({SEPARATOR:true});continue}var u=typeof s["LINK"]!=="undefined"?s["LINK"]:"";var f=typeof s["ONCLICK"]!=="undefined"?s["ONCLICK"]:"";if(u!==""){var l='window.location.href = "'+u+'";';f=f!==""?l+" "+f:l}if(f!==""){if(!n.test(f)){if(!i.test(f)){f+=";"}f+=" return false;"}}r.push({TEXT:typeof s["TEXT"]!=="undefined"?s["TEXT"]:"",TITLE:typeof s["TITLE"]!=="undefined"?s["TITLE"]:"",ICONCLASS:s["ICON"]?s["ICON"]:null,ONCLICK:f})}this._menuId=this._id.toLowerCase()+"_menu";this._menu=new PopupMenu(this._menuId,1010);this._menu.ShowMenu(this._moreBtn,r,false,false,BX.delegate(this._onMenuClose,this))}};BX.InterfaceToolBar.create=function(e,t){var n=new BX.InterfaceToolBar;n.initialize(e,t);return n}}
/* End */
;; /* /bitrix/components/bitrix/crm.product/templates/.default/splitter.js?15441274015668*/
; /* /bitrix/components/bitrix/crm.product/templates/.default/list_manager.js?15441274013567*/
; /* /bitrix/components/bitrix/main.interface.buttons/templates/.default/script.min.js?154412738440309*/
; /* /bitrix/components/bitrix/main.interface.buttons/templates/.default/utils.min.js?1544127384575*/
; /* /bitrix/components/bitrix/crm.product.list/templates/.default/script.min.js?15441274015509*/
; /* /bitrix/components/bitrix/crm.interface.grid/templates/flat/bitrix/main.interface.grid/.default/script.min.js?154412740131128*/
; /* /bitrix/components/bitrix/crm.interface.filter/templates/flat/bitrix/main.interface.filter/new/script.min.js?154412740145419*/
; /* /bitrix/components/bitrix/crm.product.section.tree/templates/.default/script.js?154412740114884*/
; /* /bitrix/components/bitrix/crm.product.section.crumbs/templates/.default/script.min.js?15441274017474*/
; /* /bitrix/components/bitrix/crm.product.menu/templates/.default/script.js?1544127401484*/
; /* /bitrix/components/bitrix/crm.interface.toolbar/templates/flat/script.min.js?15441274011784*/

//# sourceMappingURL=page_abc261b3b80ab67cf272d451643a3edc.map.js