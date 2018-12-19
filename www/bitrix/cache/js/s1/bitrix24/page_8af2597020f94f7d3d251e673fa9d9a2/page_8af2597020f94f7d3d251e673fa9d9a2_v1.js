
; /* Start:"a:4:{s:4:"full";s:82:"/bitrix/components/bitrix/photogallery/templates/.default/script.js?15441274386106";s:6:"source";s:67:"/bitrix/components/bitrix/photogallery/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
function debug_info(text)
{
	container_id = 'debug_info_forum';
	var div = document.getElementById(container_id);
	if (!div || div == null)
	{
		div = document.body.appendChild(document.createElement("DIV"));
		div.id = container_id;
//		div.className = "forum-debug";
		div.style.position = "absolute";
		div.style.width = "170px";
		div.style.padding = "5px";
		div.style.backgroundColor = "#FCF7D1";
		div.style.border = "1px solid #EACB6B";
		div.style.textAlign = "left";
		div.style.zIndex = '7900'; 
		div.style.fontSize = '11px'; 
		
		div.style.left = document.body.scrollLeft + (document.body.clientWidth - div.offsetWidth) - 5 + "px";
		div.style.top = document.body.scrollTop + 5 + "px";
	}
	if (typeof text == "object")
	{
		for (var ii in text)
		{
			div.innerHTML += ii + ': ' + text[ii] + "<br />";
		}
	}
	else
	{
		div.innerHTML += text + "<br />";
	}
	return;
}
/************************************************/

function PhotoPopupMenu()
{
	var _this = this;
	this.active = null;
	this.just_hide_item = false;
	this.events = null;
	
	this.PopupShow = function(div, pos, set_width, set_shadow, events)
	{
		this.PopupHide();
		if (!div) { return; } 
		if (typeof(pos) != "object") { pos = {}; } 

		this.active = div.id;
		
		if (set_width !== false && !div.style.width)
		{
			div.style.width = div.offsetWidth + 'px';
		}
		
		this.events = ((events && typeof events == "object") ? events : null);

		var res = jsUtils.GetWindowSize();
		
		pos['top'] = (pos['top'] ? pos['top'] : parseInt(res["scrollTop"] + res["innerHeight"]/2 - div.offsetHeight/2));
		pos['left'] = (pos['left'] ? pos['left'] : parseInt(res["scrollLeft"] + res["innerWidth"]/2 - div.offsetWidth/2));
		
		jsFloatDiv.Show(div, pos["left"], pos["top"], set_shadow, true, false);
		div.style.display = '';
		
		jsUtils.addEvent(document, "keypress", _this.OnKeyPress);
		
		var substrate = document.getElementById("photo_substrate");
		if (!substrate)
		{
			substrate = document.createElement("DIV");
			substrate.id = 	"photo_substrate";
			substrate.style.position = "absolute";
			substrate.style.display = "none";
			substrate.style.background = "#052635";
			substrate.style.opacity = "0.5";
			substrate.style.top = "0";
			substrate.style.left = "0";
			if (substrate.style.MozOpacity)
				substrate.style.MozOpacity = '0.5';
			else if (substrate.style.KhtmlOpacity)
				substrate.style.KhtmlOpacity = '0.5';
			if (jsUtils.IsIE())
		 		substrate.style.filter += "progid:DXImageTransform.Microsoft.Alpha(opacity=50)";
			document.body.appendChild(substrate);
		}
		
		substrate.style.width = res["scrollWidth"] + "px";
		substrate.style.height = res["scrollHeight"] + "px";
		substrate.style.zIndex = 7500;
		substrate.style.display = 'block';
	}

	this.PopupHide = function()
	{
		this.active = (this.active == null && arguments[0] ? arguments[0] : this.active);
		
		this.CheckEvent('BeforeHide');
		
		var div = document.getElementById(this.active);
		if (div)
		{
			jsFloatDiv.Close(div);
			div.style.display = 'none';
			if (!this.just_hide_item) {div.parentNode.removeChild(div); } 
		}
		var substrate = document.getElementById("photo_substrate");
		if (substrate) { substrate.style.display = 'none'; } 

		this.active = null;
		
		jsUtils.removeEvent(document, "keypress", _this.OnKeyPress);
		
		this.CheckEvent('AfterHide');
		this.events = null;
	}

	this.CheckClick = function(e)
	{
		var div = document.getElementById(_this.active);
		
		if (!div || !_this.IsVisible()) { return; }
		if (!jsUtils.IsIE() && e.target.tagName == 'OPTION') { return false; }
		
		var x = e.clientX + document.body.scrollLeft;
		var y = e.clientY + document.body.scrollTop;

		/*menu region*/
		var posLeft = parseInt(div.style.left);
		var posTop = parseInt(div.style.top);
		var posRight = posLeft + div.offsetWidth;
		var posBottom = posTop + div.offsetHeight;
		
		if (x >= posLeft && x <= posRight && y >= posTop && y <= posBottom) { return; }

		if(_this.controlDiv)
		{
			var pos = jsUtils.GetRealPos(_this.controlDiv);
			if(x >= pos['left'] && x <= pos['right'] && y >= pos['top'] && y <= pos['bottom'])
				return;
		}
		_this.PopupHide();
	}

	this.OnKeyPress = function(e)
	{
		if(!e) e = window.event
		if(!e) return;
		if(e.keyCode == 27)
			_this.PopupHide();
	},

	this.IsVisible = function()
	{
		return (document.getElementById(this.active).style.visibility != 'hidden');
	}, 
	
	this.CheckEvent = function()
	{
		if (!this.events || this.events == null)
		{
			return false;
		}
		
		eventName = arguments[0];
		
		if (this.events[eventName]) 
		{ 
			return this.events[eventName](arguments); 
		} 
		return true;
	}
}
var PhotoMenu;
if (!PhotoMenu) 
	PhotoMenu = new PhotoPopupMenu();

var jsUtilsPhoto = {
	GetElementParams : function(element)
	{
		if (!element) return false;
		if (element.style.display != 'none' && element.style.display != null)
			return {width: element.offsetWidth, height: element.offsetHeight};
		var originstyles = {position: element.style.position, visibility : element.style.visibility, display: element.style.display};
		element.style.position = 'absolute';
		element.style.visibility = 'hidden';
		element.style.display = 'block';
		var result = {width: element.offsetWidth, height: element.offsetHeight};
		element.style.display = originstyles.display;
		element.style.visibility = originstyles.visibility;
		element.style.position = originstyles.position;
		return result;
	}, 
	ClassCreate : function(parent, properties)
	{
		function oClass() { 
			this.init.apply(this, arguments); 
		}
		
		if (parent) 
		{
			var temp = function() { };
			temp.prototype = parent.prototype;
			oClass.prototype = new temp;
		}
		
		for (var property in properties)
			oClass.prototype[property] = properties[property];
		if (!oClass.prototype.init)
			oClass.prototype.init = function() {};
		
		oClass.prototype.constructor = oClass;
		
		return oClass;
	}, 
	ObjectsMerge : function(arr1, arr2)
	{
		var arr3 = {};
		for (var key in arr1)
			arr3[key] = arr1[key];
		for (var key in arr2)
			arr3[key] = arr2[key];
		return arr3;
	}
}; 

window.bPhotoMainLoad = true;
/* End */
;
; /* Start:"a:4:{s:4:"full";s:95:"/bitrix/components/bitrix/photogallery.section.list/templates/.default/script.js?15441274387387";s:6:"source";s:80:"/bitrix/components/bitrix/photogallery.section.list/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
function EditAlbum(url)
{
	var oEditAlbumDialog = new BX.CDialog({
		title : '',
		content_url: url + (url.indexOf('?') !== -1 ? "&" : "?") + "AJAX_CALL=Y",
		buttons: [BX.CDialog.btnSave, BX.CDialog.btnCancel],
		width: 600,
		height: 400
	});
	oEditAlbumDialog.Show();

	BX.addCustomEvent(oEditAlbumDialog, "onWindowRegister", function(){
		oEditAlbumDialog.adjustSizeEx();
		var pName = BX('bxph_name');

		if (pName) // Edit album properies
		{
			BX.focus(pName);
			if (BX('bxph_pass_row'))
			{
				BX('bxph_use_password').onclick = function()
				{
					var ch = !!this.checked;
					BX('bxph_pass_row').style.display = ch ? '' : 'none';
					BX('bxph_photo_password').disabled = !ch;
					if (ch)
						BX.focus(BX('bxph_photo_password'));

					oEditAlbumDialog.adjustSizeEx();
				};
			}
		}
		else // Edit album icon
		{
		}
	});

	oEditAlbumDialog.ClearButtons();
	oEditAlbumDialog.SetButtons([
		new BX.CWindowButton(
		{
			title: BX.message('JS_CORE_WINDOW_SAVE'),
			id: 'savebtn',
			action: function()
			{
				var pForm = oEditAlbumDialog.Get().getElementsByTagName('form')[0];
				if (pForm.action.indexOf('icon') == -1)
					CheckForm(pForm);
				else // Edit album icon
					CheckFormEditIcon(pForm);
			}
		}),
		oEditAlbumDialog.btnCancel
	]);

	window.oPhotoEditAlbumDialog = oEditAlbumDialog;
}

function CheckForm(form)
{
	if (typeof form != "object")
		return false;

	oData = {"AJAX_CALL" : "Y"};
	for (var ii in form.elements)
	{
		if (form.elements[ii] && form.elements[ii].name)
		{
			if (form.elements[ii].type && form.elements[ii].type.toLowerCase() == "checkbox")
			{
				if (form.elements[ii].checked == true)
					oData[form.elements[ii].name] = form.elements[ii].value;
			}
			else
				oData[form.elements[ii].name] = form.elements[ii].value;
		}
	}

	BX.showWait('photo_window_edit');
	window.oPhotoEditAlbumDialogError = false;

	BX.ajax.post(
		form.action,
		oData,
		function(data)
		{
			setTimeout(function(){
				BX.closeWait('photo_window_edit');
				result = {};

				if (window.oPhotoEditAlbumDialogError !== false)
				{
					var errorTr = BX("bxph_error_row");
					errorTr.style.display = "";
					errorTr.cells[0].innerHTML = window.oPhotoEditAlbumDialogError;
					window.oPhotoEditAlbumDialog.adjustSizeEx();
				}
				else
				{
					try
					{
						eval("result = " + data + ";");
						if (result['url'] && result['url'].length > 0)
							BX.reload(result['url']);

						var arrId = {"NAME" : "photo_album_name_", "DATE" : "photo_album_date_", "DESCRIPTION" : "photo_album_description_"};
						for (var ID in arrId)
						{
							if (BX(arrId[ID] + result['ID']))
								BX(arrId[ID] + result['ID']).innerHTML = result[ID];
						}
						var res = BX('photo_album_info_' + result['ID']);

						if (res)
						{
							if (result['PASSWORD'].length <= 0)
								res.className = res.className.replace("photo-album-password", "");
							else
								res.className += " photo-album-password ";
						}
						window.oPhotoEditAlbumDialog.Close();
					}
					catch(e)
					{
						var errorTr = BX("bxph_error_row");
						errorTr.style.display = "";
						errorTr.cells[0].innerHTML = BXPH_MESS.UnknownError;
						window.oPhotoEditAlbumDialog.adjustSizeEx();
					}
				}
			}, 200);
		}
	);
}

function CheckFormEditIcon(form)
{
	if (typeof form != "object")
		return false;

	oData = {"AJAX_CALL" : "Y"};
	for (var ii in form.elements)
	{
		if (form.elements[ii] && form.elements[ii].name)
		{
			if (form.elements[ii].type && form.elements[ii].type.toLowerCase() == "checkbox")
			{
				if (form.elements[ii].checked == true)
					oData[form.elements[ii].name] = form.elements[ii].value;
			}
			else
				oData[form.elements[ii].name] = form.elements[ii].value;
		}
	}
	oData["photos"] = [];
	for (var ii = 0; ii < form.elements["photos[]"].length; ii++)
	{
		if (form.elements["photos[]"][ii].checked == true)
			oData["photos"].push(form.elements["photos[]"][ii].value);
	}

	BX.showWait('photo_window_edit');
	window.oPhotoEditIconDialogError = false;

	BX.ajax.post(
		form.action,
		oData,
		function(data)
		{
			setTimeout(function(){
				BX.closeWait('photo_window_edit');
				var result = {};

				if (window.oPhotoEditIconDialogError !== false)
				{
					var errorCont = BX("bxph_error_cont");
					errorCont.style.display = "";
					errorCont.innerHTML = window.oPhotoEditIconDialogError + "<br/>";
					window.oPhotoEditAlbumDialog.adjustSizeEx();
				}
				else
				{
					try
					{
						eval("result = " + data + ";");
					}
					catch(e)
					{
						result = {};
					}

					if (parseInt(result["ID"]) > 0)
					{
						if (BX("photo_album_img_" + result['ID']))
							BX("photo_album_img_" + result['ID']).src = result['SRC'];
						else if (BX("photo_album_cover_" + result['ID']))
							BX("photo_album_cover_" + result['ID']).style.backgroundImage = "url('" + result['SRC'] + "')";
						window.oPhotoEditAlbumDialog.Close();
					}
					else
					{
						var errorTr = BX("bxph_error_row");
						errorTr.style.display = "";
						errorTr.cells[0].innerHTML = BXPH_MESS.UnknownError;
						window.oPhotoEditAlbumDialog.adjustSizeEx();
					}
				}
			}, 200);
		}
	);
}

function DropAlbum(url, id)
{
	BX.showWait('photo_window_edit');
	window.oPhotoEditAlbumDialogError = false;

	if (id > 0)
	{
		var pAlbum = BX("photo_album_info_" + id);
		if (pAlbum)
			pAlbum.style.display = "none";
	}

	BX.ajax.post(
		url,
		{"AJAX_CALL" : "Y"},
		function(data)
		{
			setTimeout(function(){
				BX.closeWait('photo_window_edit');

				if (window.oPhotoEditAlbumDialogError !== false)
					return alert(window.oPhotoEditAlbumDialogError);

				try
				{
					eval("result = " + data + ";");
					if (result['ID'])
					{
						var pAlbum = BX("photo_album_info_" + result['ID']);
						if (pAlbum && pAlbum.parentNode)
							pAlbum.parentNode.removeChild(pAlbum);
					}
				}
				catch(e)
				{
					if (id > 0)
					{
						var pAlbum = BX("photo_album_info_" + id);
						if (pAlbum && pAlbum.parentNode)
							pAlbum.style.display = "";
					}

					if (window.BXPH_MESS)
						return alert(window.BXPH_MESS.UnknownError);
				}
			}, 200);
		}
	);

	return false;
}

window.__photo_check_name_length_count = 0;
function __photo_check_name_length()
{
	var nodes = document.getElementsByTagName('a');
	var result = false;
	for (var ii = 0; ii < nodes.length; ii++)
	{
		var node = nodes[ii];
		if (!node.id.match(/photo\_album\_name\_(\d+)/gi))
			continue;
		result = true;
		if (node.offsetHeight <= node.parentNode.offsetHeight)
			continue;
		var div = node.parentNode;
		var text = node.innerHTML.replace(/\<wbr\/\>/gi, '').replace(/\<wbr\>/gi, '').replace(/\&shy\;/gi, '');
		while (div.offsetHeight < node.offsetHeight || div.offsetWidth < node.offsetWidth)
		{
			if ((div.offsetHeight  < (node.offsetHeight / 2)) || (div.offsetWidth < (node.offsetWidth / 2)))
				text = text.substr(0, parseInt(text.length / 2));
			else
				text = text.substr(0, (text.length - 2));
			node.innerHTML = text;
		}
		node.innerHTML += '...';
		if (div.offsetHeight < node.offsetHeight || div.offsetWidth < node.offsetWidth)
			node.innerHTML = text.substr(0, (text.length - 3)) + '...';
	}
	if (!result)
	{
		window.__photo_check_name_length_count++;
		if (window.__photo_check_name_length_count < 7)
			setTimeout(__photo_check_name_length, 250);
	}
}
setTimeout(__photo_check_name_length, 250);
/* End */
;; /* /bitrix/components/bitrix/photogallery/templates/.default/script.js?15441274386106*/
; /* /bitrix/components/bitrix/photogallery.section.list/templates/.default/script.js?15441274387387*/
