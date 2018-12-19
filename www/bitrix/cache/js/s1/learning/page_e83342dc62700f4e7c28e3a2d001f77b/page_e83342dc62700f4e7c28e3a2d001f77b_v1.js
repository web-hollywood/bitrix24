
; /* Start:"a:4:{s:4:"full";s:89:"/bitrix/components/bitrix/learning.course.tree/templates/.default/script.js?1544127428690";s:6:"source";s:75:"/bitrix/components/bitrix/learning.course.tree/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
function JCMenu(sOpenedSections, COURSE_ID)
{
	this.oSections = {};
	this.COURSE_ID = COURSE_ID;

	var aSect = sOpenedSections.split(',');
	for(var i in aSect)
		this.oSections[aSect[i]] = true;

	this.OpenChapter = function(oThis, id)
	{
		if (oThis.parentNode.className == '')
		{
			this.oSections[id] = false;
			oThis.parentNode.className = 'close';
		}
		else
		{
			this.oSections[id] = true;
			oThis.parentNode.className = '';
		}

		var sect='';
		for(var i in this.oSections)
		if(this.oSections[i] == true)
			sect += (sect != ''? ',':'')+i;
		document.cookie = "LEARN_MENU_"+this.COURSE_ID+"=" + sect + "; expires=Thu, 31 Dec 2020 23:59:59 GMT; path=/;";

		return false;
	}

}
/* End */
;
; /* Start:"a:4:{s:4:"full";s:94:"/bitrix/components/bitrix/learning.course.contents/templates/.default/script.js?15441274282200";s:6:"source";s:79:"/bitrix/components/bitrix/learning.course.contents/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/

function ImgShw(ID, width, height)
{
	var scroll = "no";
	var top=0, left=0;
	if(width > screen.width-10 || height > screen.height-28) scroll = "yes";
	if(height < screen.height-28) top = Math.floor((screen.height - height)/2-14);
	if(width < screen.width-10) left = Math.floor((screen.width - width)/2-5);
	width = Math.min(width, screen.width-10);	
	height = Math.min(height, screen.height-28);	
	var wnd = window.open("","","scrollbars="+scroll+",resizable=yes,width="+width+",height="+height+",left="+left+",top="+top);
	wnd.document.write("<html><head>\n");
	wnd.document.write("<"+"script language='JavaScript'>\n");
	wnd.document.write("<!--\n");
	wnd.document.write("function KeyPress()\n");
	wnd.document.write("{\n");
	wnd.document.write("	if(window.event.keyCode == 27)\n");
	wnd.document.write("		window.close();\n");
	wnd.document.write("}\n");
	wnd.document.write("//-->\n");
	wnd.document.write("</"+"script>\n");
	wnd.document.write("<title>Image View</title></head>\n");
	wnd.document.write("<body topmargin=\"0\" leftmargin=\"0\" marginwidth=\"0\" marginheight=\"0\" onKeyPress=\"KeyPress()\">\n");
	wnd.document.write("<img src=\""+ID+"\" border=\"0\">");
	wnd.document.write("</body>");
	wnd.document.write("</html>");
	wnd.document.close();
}

function ShowImg(sImgPath, width, height, alt)
{
	var scroll = 'no';
	var top=0, left=0;
	if(width > screen.width-10 || height > screen.height-28)
		scroll = 'yes';
	if(height < screen.height-28)
		top = Math.floor((screen.height - height)/2-14);
	if(width < screen.width-10)
		left = Math.floor((screen.width - width)/2);
	width = Math.min(width, screen.width-10);	
	height = Math.min(height, screen.height-28);	
	window.open('/bitrix/tools/imagepg.php?alt='+alt+'&img='+sImgPath,'','scrollbars='+scroll+',resizable=yes, width='+width+',height='+height+',left='+left+',top='+top);
}

function LearningInitSpoiler (oHead)
{
	if (typeof oHead != "object" || !oHead)
		return false; 
	var oBody = oHead.nextSibling;

	while (oBody.nodeType != 1)
		oBody=oBody.nextSibling;

	oBody.style.display = (oBody.style.display == 'none' ? '' : 'none'); 
	oHead.className = (oBody.style.display == 'none' ? '' : 'learning-spoiler-head-open'); 
}

/* End */
;
; /* Start:"a:4:{s:4:"full";s:71:"/bitrix/components/bitrix/player/mediaplayer/flvscript.js?1544127412654";s:6:"source";s:57:"/bitrix/components/bitrix/player/mediaplayer/flvscript.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
function getFlashVersion()
{
	var v = 0;
	var n = navigator;
	if (n.platform == 'Win32' && n.userAgent.indexOf('Opera') == (-1) && window.ActiveXObject)
	{
		for (var i = 9; i > 2; i--)
			if (new ActiveXObject("ShockwaveFlash.ShockwaveFlash."+i))
				return i;
	}
	else if(n.plugins)
	{
		for (var i = 0, l = n.plugins.length; i < l; i++)
			if (n.plugins[i].name.indexOf('Flash') != -1)
				v = parseInt(n.plugins[i].description.substr(16, 2));
	}
	return v;
}

function showFLVPlayer(id, mess)
{
	var oDiv = document.getElementById(id + '_div');
	if (oDiv)
	{
		oDiv.style.display = 'block';
		if (getFlashVersion() < 9)
			oDiv.innerHTML = mess;
	}
}
/* End */
;; /* /bitrix/components/bitrix/learning.course.tree/templates/.default/script.js?1544127428690*/
; /* /bitrix/components/bitrix/learning.course.contents/templates/.default/script.js?15441274282200*/
; /* /bitrix/components/bitrix/player/mediaplayer/flvscript.js?1544127412654*/
