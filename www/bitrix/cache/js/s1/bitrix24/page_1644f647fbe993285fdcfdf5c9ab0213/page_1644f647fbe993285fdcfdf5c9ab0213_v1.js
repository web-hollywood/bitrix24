
; /* Start:"a:4:{s:4:"full";s:85:"/bitrix/components/bitrix/lists.lists/templates/.default/script.min.js?15441274321399";s:6:"source";s:66:"/bitrix/components/bitrix/lists.lists/templates/.default/script.js";s:3:"min";s:70:"/bitrix/components/bitrix/lists.lists/templates/.default/script.min.js";s:3:"map";s:70:"/bitrix/components/bitrix/lists.lists/templates/.default/script.map.js";}"*/
BX.namespace("BX.Lists");BX.Lists.ListsIblockClass=function(){var s=function(s){this.ajaxUrl="/bitrix/components/bitrix/lists.lists/ajax.php";this.randomString=s.randomString;this.jsClass="ListsIblockClass_"+s.randomString};s.prototype.showLiveFeed=function(s){BX.Lists.ajax({method:"POST",dataType:"json",url:BX.Lists.addToLinkParam(this.ajaxUrl,"action","setLiveFeed"),data:{iblockId:s,checked:BX("bx-lists-show-live-feed-"+s).checked},onsuccess:BX.delegate(function(s){if(s.status=="error"){s.errors=s.errors||[{}];BX.Lists.showModalWithStatusAction({status:"error",message:s.errors.pop().message})}},this)})};s.prototype.createDefaultProcesses=function(){BX.addClass(BX("bx-lists-default-processes"),"webform-small-button-wait");BX("bx-lists-default-processes").setAttribute("onclick","");BX.Lists.ajax({method:"POST",dataType:"json",url:BX.Lists.addToLinkParam(this.ajaxUrl,"action","createDefaultProcesses"),data:{siteId:BX("bx-lists-select-site").value},onsuccess:BX.delegate(function(s){if(s.status=="success"){location.reload()}else{BX("bx-lists-default-processes").setAttribute("onclick",'BX.Lists["'+this.jsClass+'"].createDefaultProcesses();');s.errors=s.errors||[{}];BX.Lists.showModalWithStatusAction({status:"error",message:s.errors.pop().message});BX.removeClass(BX("bx-lists-default-processes"),"webform-small-button-wait")}},this)})};return s}();
/* End */
;; /* /bitrix/components/bitrix/lists.lists/templates/.default/script.min.js?15441274321399*/

//# sourceMappingURL=page_1644f647fbe993285fdcfdf5c9ab0213.map.js