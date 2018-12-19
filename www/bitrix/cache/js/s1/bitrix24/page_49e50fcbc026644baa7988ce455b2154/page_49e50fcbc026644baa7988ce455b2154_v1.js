
; /* Start:"a:4:{s:4:"full";s:80:"/bitrix/components/bitrix/idea.search/templates/.default/script.js?1544127418385";s:6:"source";s:66:"/bitrix/components/bitrix/idea.search/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
BX.ready(function(){
	BX.bind(
		BX('bx-idea-lifesearch-field'),
		'focus',
		function(){
			if(this.value == BX.message('IDEA_SEARCH_DEFAULT'))
				this.value = '';
		}
	);

	BX.bind(
		BX('bx-idea-lifesearch-field'),
		'blur',
		function(){
			if(this.value == "")
				this.value = BX.message('IDEA_SEARCH_DEFAULT');
		}
	);

	BX.fireEvent(BX('bx-idea-lifesearch-field'), 'blur');
})
/* End */
;
; /* Start:"a:4:{s:4:"full";s:74:"/bitrix/components/bitrix/idea/templates/.default/script.js?15441274188885";s:6:"source";s:59:"/bitrix/components/bitrix/idea/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
;(function(window){
	if (!!window["JSPublicIdea"])
		return;
	window["JSPublicIdea"] = {
		/*low*/
		RequestURL: window.location.pathname,
		LoadStatusList: function()
		{
			BX.ajax({
				url: this.RequestURL + '?AJAX=IDEA&ACTION=GET_STATUS_LIST&sessid='+BX.bitrix_sessid(),
				method: 'GET',
				dataType: 'json',
				processData: true,
				onsuccess: function(data)
				{
					BX.onCustomEvent(this, 'IdeaOnLoadStatusList', [data]);
				}
			});
		},
		SetStatus: function(IdeaId, StatusId)
		{
			BX.ajax({
				url: this.RequestURL + '?AJAX=IDEA&ACTION=SET_STATUS&IDEA_ID=' + IdeaId + '&STATUS_ID=' + StatusId + '&sessid=' + BX.bitrix_sessid(),
				method: 'GET',
				dataType: 'json',
				processData: true,
				onsuccess: function(data){
					BX.onCustomEvent(this, 'IdeaOnSetStatus', [data, IdeaId, StatusId]);
				}
			});
		},

		/*ext*/
		arStatuses: {},
		arDialog:{},

		IsEmptyStatusList: function()
		{
			var res = true;
			for (var i in this.arStatuses)
			{
				if (this.arStatuses.hasOwnProperty(i))
				{
					res = false;
					break;
				}
			}
			return res;
		},

		ShowStatusDialog: function(IdeaStatusNode, IdeaId)
		{
			IdeaId = IdeaId||0;
			if(IdeaId == 0)
				return;

			var CallBack = function()
			{
				var j = 0;
				var Items = '';
				for(var i in JSPublicIdea.arStatuses)
				{
					if (JSPublicIdea.arStatuses.hasOwnProperty(i))
					{
						if(j>0)
							Items += '<div class="popup-window-hr"><i></i></div>';

						Items += ('<div class="js-idea-popup-status-item idea-action-cursor' + (j==0?' js-idea-popup-status-item-1st':'') + '" onclick="JSPublicIdea.SetStatus(' + IdeaId + ', ' + JSPublicIdea.arStatuses[i].ID + ')">'+
							'<div class="status-color-' + JSPublicIdea.arStatuses[i].XML_ID.toLowerCase() + '">' + JSPublicIdea.arStatuses[i].VALUE + '</div>' +
						'</div>');
						j++;
					}
				}

				if(!JSPublicIdea.arDialog["STATUS_DIALOG_" + IdeaId])
					JSPublicIdea.arDialog["STATUS_DIALOG_" + IdeaId] = new BX.PopupWindow(
						'status-dialog-' + IdeaId,
						IdeaStatusNode,
						{
							content: Items,
							lightShadow: true,
							autoHide: true,
							zIndex: 2500,
							offsetTop: 5,
							offsetLeft: -13
						}
					);
				JSPublicIdea.arDialog["STATUS_DIALOG_" + IdeaId].show();
			};

			if(this.IsEmptyStatusList())
			{
				BX.addCustomEvent('IdeaOnLoadStatusList', CallBack);
				this.LoadStatusList();
				return;
			}

			CallBack();
		},

		/*LS*/
		LifeSearchCache:{},
		LifeSearchQuery: '',
		LifeSearchProcessing: false,
		LifeSearchWaiter: function(activity)
		{
			var display = activity=='Y' ?'visible' :'hidden';

			var LSInputField = BX('bx-idea-waiter-big-lifesearch');
			if(LSInputField)
				LSInputField.style.visibility = display;
		},
		LifeSearch: function(SearchQuery)
		{
			this.LifeSearchQuery = SearchQuery;

			var LSCloseButton = BX('bx-idea-close-button-lifesearch');
			if(LSCloseButton)
				LSCloseButton.style.visibility = SearchQuery.length>0 ?'visible' :'hidden';

			var IdeaContentNode = BX('idea-posts-content');
			if(this.LifeSearchCache[SearchQuery] && IdeaContentNode)
			{
				IdeaContentNode.innerHTML = this.LifeSearchCache[SearchQuery];
				var innerContent = BX.findChildren(IdeaContentNode, {id:'idea-posts-content'}, false);
				if(innerContent && innerContent[0] && typeof innerContent[0].innerHTML != 'undefined')
				{
					IdeaContentNode.innerHTML = innerContent[0].innerHTML;
					this.LifeSearchWaiter('N');
				}
				return;
			}

			if(this.LifeSearchProcessing)
				return;

			this.LifeSearchProcessing = true;

			BX.ajax({
				url: this.RequestURL + '?AJAX=IDEA&ACTION=GET_LIFE_SEARCH&LIFE_SEARCH_QUERY=' + BX.util.urlencode(SearchQuery),
				method: 'GET',
				dataType: 'json',
				processData: true,
				onsuccess: function(SearchQuery){
					return function(data){
						BX.onCustomEvent(this, 'IdeaOnLifeSearch', [data, SearchQuery]);
					}
				}(SearchQuery)
			});

			this.LifeSearchWaiter('Y');
		},

		/*Subscribe*/
		SetSubscribe: function(IdeaId, self)
		{
			BX.ajax({
				url: this.RequestURL + '?AJAX=IDEA&ACTION=SUBSCRIBE&IDEA_ID=' + IdeaId + '&sessid=' + BX.bitrix_sessid(),
				method: 'GET',
				dataType: 'json',
				processData: true,
				onsuccess: function(data){
					BX.onCustomEvent(this, 'IdeaOnSetSubscribe', [data, self]);
				}
			});
		},

		DeleteSubscribe: function(IdeaId, self)
		{
			BX.ajax({
				url: this.RequestURL + '?AJAX=IDEA&ACTION=UNSUBSCRIBE&IDEA_ID=' + IdeaId + '&sessid=' + BX.bitrix_sessid(),
				method: 'GET',
				dataType: 'json',
				processData: true,
				onsuccess: function(data){
					BX.onCustomEvent(this, 'IdeaOnDeleteSubscribe', [data, self]);
				}
			});
		}
	};

	var subscribeFunction = function()
		{
			var IDNode = BX.findChildren(this, {tagName: "span"}, false);
			if(IDNode)
			{
				var IdeaId = IDNode[0].className.substr('idea-post-subscribe-'.length);
				if(IdeaId && IdeaId>0)
					JSPublicIdea.SetSubscribe(IdeaId, this)
			}
		},
		unsubscribeFunction = function()
		{
			var IDNode = BX.findChildren(this, {tagName: "span"}, false);
			if(IDNode)
			{
				var IdeaId = IDNode[0].className.substr('idea-post-subscribe-'.length);
				if(IdeaId && IdeaId>0)
					JSPublicIdea.DeleteSubscribe(IdeaId, this)
			}
		};

	//Custom Handlers
	BX.addCustomEvent('IdeaOnSetSubscribe', function(data, self) {
		if(data.SUCCESS == 'Y')
		{
			var IDNode = BX.findChildren(self, {tagName: "span"}, false);
			if(IDNode)
			{
				IDNode[0].innerHTML = data.CONTENT;
				BX.unbindAll(self);
				BX.bind(self, "click", unsubscribeFunction);
			}
		}
	});
	BX.addCustomEvent('IdeaOnDeleteSubscribe', function(data, self) {
		if(data.SUCCESS == 'Y')
		{
			var IDNode = BX.findChildren(self, {tagName: "span"}, false);
			if(IDNode)
			{
				IDNode[0].innerHTML = data.CONTENT;
				BX.unbindAll(self);
				BX.bind(self, "click", subscribeFunction);
			}
		}
	});

	BX.addCustomEvent('IdeaOnLoadStatusList', function(data){
		if(data.SUCCESS == 'Y' && !!data.STATUSES)
		{
			for(var i in data.STATUSES)
			{
				if (data.STATUSES.hasOwnProperty(i))
				{
					if(typeof(data.STATUSES[i]) != 'object')
						continue;
					JSPublicIdea.arStatuses[i] = data.STATUSES[i];
				}
			}
		}
	});

	BX.addCustomEvent('IdeaOnSetStatus', function(data, IdeaId, StatusId){
		if(data.SUCCESS == 'Y')
		{
			var StatusNode = BX('status-' + IdeaId);
			if(StatusNode)
			{
				StatusNode.innerHTML = JSPublicIdea.arStatuses[StatusId].VALUE;
				StatusNode.parentNode.className = StatusNode.parentNode.className.replace(/(status-color-)[^ ]+/ig, "$1" + JSPublicIdea.arStatuses[StatusId].XML_ID.toLowerCase());
				if(JSPublicIdea.arDialog["STATUS_DIALOG_" + IdeaId])
					JSPublicIdea.arDialog["STATUS_DIALOG_" + IdeaId].close();
			}
		}
	});

	BX.addCustomEvent('IdeaOnLifeSearch', function(data, SearchQuery){
		JSPublicIdea.LifeSearchProcessing = false;
		var IdeaContentNode = BX('idea-posts-content');
		if(data.SUCCESS == 'Y' && IdeaContentNode)
		{
			JSPublicIdea.LifeSearchCache[SearchQuery] = data.CONTENT;
			if(IdeaContentNode)
			{
				IdeaContentNode.innerHTML = JSPublicIdea.LifeSearchCache[SearchQuery];
				var innerContent = BX.findChildren(IdeaContentNode, {id:'idea-posts-content'}, false);
				if(innerContent && innerContent[0] && typeof innerContent[0].innerHTML != 'undefined')
					IdeaContentNode.innerHTML = innerContent[0].innerHTML;
			}

			if(SearchQuery != JSPublicIdea.LifeSearchQuery)
			{
				JSPublicIdea.LifeSearch(JSPublicIdea.LifeSearchQuery);
				return;
			}
		}

		JSPublicIdea.LifeSearchWaiter('N');
	});

	//Prepare life search buttons
	BX.ready(function(){
		var LSCloseButton = BX('bx-idea-close-button-lifesearch');
		var LSInputField = BX('bx-idea-lifesearch-field');
		if(LSCloseButton)
		{
			//Set NULL cache
			//var LifeSearchCacheNULL = BX('idea-posts-content');
			//if(LifeSearchCacheNULL)
			//	JSPublicIdea.LifeSearchCache[''] = LifeSearchCacheNULL.innerHTML;
			//Set Start Search Event
			BX.bind(LSInputField, 'keyup', function(){
				JSPublicIdea.LifeSearch(this.value);
			});
			//Set Clear Search Event
			BX.bind(LSCloseButton, 'click', function(){
				JSPublicIdea.LifeSearch('');
				if(LSInputField)
					LSInputField.value = '';
			});
		}

		if(LSInputField && LSInputField.value.length>0)
			LSCloseButton.style.visibility = 'visible';

		/*Subscribe*/
		var NodeID, Subscribe = BX.findChildren(document, {className: "idea-post-subscribe"}, true);
		if(Subscribe)
		{
			for(NodeID in Subscribe)
			{
				if (Subscribe.hasOwnProperty(NodeID))
				{
					BX.bind(Subscribe[NodeID], "click", subscribeFunction);
				}
			}
		}

		var UnSubscribe = BX.findChildren(document, {className: "idea-post-unsubscribe"}, true);
		if(UnSubscribe)
		{
			for(NodeID in UnSubscribe)
			{
				if (UnSubscribe.hasOwnProperty(NodeID))
				{
					BX.bind(UnSubscribe[NodeID], "click", unsubscribeFunction);
				}
			}
		}
	});
})(window);
/* End */
;
; /* Start:"a:4:{s:4:"full";s:88:"/bitrix/components/bitrix/idea.category.list/templates/.default/script.js?15441274182642";s:6:"source";s:73:"/bitrix/components/bitrix/idea.category.list/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
BX.ready(function(){
	 var idea_active_menu= {
		tag:'a.bx-idea-active-menu',

		_node:BX('bx-idea-left-menu'),

		_tagname:function(){
			var name_patern=/^([a-z]{1,6})(\.|#)(\S+)/;
			var tag_n=name_patern.exec(this.tag)[1];
			return tag_n;
		},
		_classname:function(){
			var name_patern=/^([a-z]{1,6})(\.|#)(\S+)/;
			var class_n=name_patern.exec(this.tag)[3];
			return class_n;
		},

		active_tag:function(){
			var act_tag = BX.findChildren(this._node,{tagName:this._tagname(), className:this._classname()},true);
			if(act_tag)
				return act_tag[act_tag.length-1];
			else
				return false;
		},

		wrap: function(){
			var span = document.createElement('span');
			var span_corn = document.createElement('span');
			BX.addClass(span,'bx-idea-active-menu-item');
			//BX.addClass(span_corn,'bx-idea-menu-corner');

			if(!span.style.borderRadius && BX.browser.IsDoctype())span_corn.style.left='-9px';

			if(!BX.browser.IsDoctype() && BX.browser.IsIE()){
			span_corn.style.right='-12px';
			}

			span.style.borderRadius='3px 4px 4px 3px';
			var act_tag_wrap = this.active_tag();
			if(act_tag_wrap)
			{
				act_tag_wrap.parentNode.replaceChild(act_tag_wrap.parentNode.insertBefore(span, act_tag_wrap),act_tag_wrap);
				span.appendChild(act_tag_wrap);
				span.appendChild(span_corn);

				var TopParent = act_tag_wrap.parentNode.parentNode.parentNode.parentNode;
				if(BX.hasClass(TopParent, 'bx-idea-left-menu-li') && !BX.hasClass(TopParent, 'bx-idea-left-menu-open'))
					BX.addClass(TopParent, 'bx-idea-left-menu-open');

				var corn_height=(span.offsetHeight-3)/2;
				span_corn.style.borderBottomWidth = corn_height+'px';
				span_corn.style.borderTopWidth = corn_height+'px';
			}
		}
	};

	idea_active_menu.wrap();

	/*var menuLI = BX.findChildren(BX('bx-idea-left-menu'), {tagName:'li', className:'bx-idea-left-menu-li'}, true);
	if(menuLI)
	{
		for(var i=0; i<menuLI.length; i++)
	{
		var IsSubMenuExists = BX.findChildren(menuLI[i], {tagName:'ul', className:'bx-idea-left-menu_2'}, true);
		if(IsSubMenuExists)
				{
					var firstParentLink = BX.findChildren(menuLI[i], {tagName:'a', className:'bx-idea-left-menu-link'}, true);
					if(firstParentLink)
						firstParentLink[0].onclick = function()
						{
							BX.hasClass(this.parentNode, 'bx-idea-left-menu-open')?BX.removeClass(this.parentNode, 'bx-idea-left-menu-open'):BX.addClass(this.parentNode, 'bx-idea-left-menu-open');
						}
				}
		else
		{
				menuLI[i].onclick=function()
			{
					BX.hasClass(this, 'bx-idea-left-menu-open')?BX.removeClass(this, 'bx-idea-left-menu-open'):BX.addClass(this, 'bx-idea-left-menu-open');
				}
		}
		}
	}   */
});
/* End */
;; /* /bitrix/components/bitrix/idea.search/templates/.default/script.js?1544127418385*/
; /* /bitrix/components/bitrix/idea/templates/.default/script.js?15441274188885*/
; /* /bitrix/components/bitrix/idea.category.list/templates/.default/script.js?15441274182642*/
