; /* /bitrix/js/fileman/light_editor/le_dialogs.js?154412741230956*/
; /* /bitrix/js/fileman/light_editor/le_controls.js?154412741224518*/
; /* /bitrix/js/fileman/light_editor/le_toolbarbuttons.js?154412741243001*/
; /* /bitrix/js/fileman/light_editor/le_core.min.js?154412741251247*/

; /* Start:"a:4:{s:4:"full";s:61:"/bitrix/js/fileman/light_editor/le_dialogs.js?154412741230956";s:6:"source";s:45:"/bitrix/js/fileman/light_editor/le_dialogs.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
window.LHEDailogs = {};

window.LHEDailogs['Anchor'] = function(pObj)
{
	return {
		title: BX.message.AnchorProps,
		innerHTML : '<table>' +
			'<tr>' +
				'<td class="lhe-dialog-label lhe-label-imp">' + BX.message.AnchorName + ':</td>' +
				'<td class="lhe-dialog-param"><input type="text" size="20" value="" id="lhed_anchor_name"></td>' +
			'</tr></table>',
		width: 300,
		OnLoad: function()
		{
			pObj.pName = BX("lhed_anchor_name");
			pObj.pLEditor.focus(pObj.pName);

			var pElement = pObj.pLEditor.GetSelectionObject();
			var value = "";
			if (pElement)
			{
				var bxTag = pObj.pLEditor.GetBxTag(pElement);
				if (bxTag.tag == "anchor" && bxTag.params.value)
				{
					value = bxTag.params.value.replace(/([\s\S]*?name\s*=\s*("|'))([\s\S]*?)(\2[\s\S]*?(?:>\s*?<\/a)?(?:\/?))?>/ig, "$3");
				}
			}
			pObj.pName.value = value;
		},
		OnSave: function()
		{
			var anchorName = pObj.pName.value.replace(/[^\w\d]/gi, '_');
			if(pObj.pSel)
			{
				if(anchorName.length > 0)
					pObj.pSel.id = anchorName;
				else
					pObj.pLEditor.executeCommand('Delete');
			}
			else if(anchorName.length > 0)
			{
				var id = pObj.pLEditor.SetBxTag(false, {tag: "anchor", params: {value : '<a name="' + anchorName + '"></a>'}});
				pObj.pLEditor.InsertHTML('<img id="' + id + '" src="' + pObj.pLEditor.oneGif + '" class="bxed-anchor" />');
			}
		}
	};
}

window.LHEDailogs['Link'] = function(pObj)
{
	var strHref = pObj.pLEditor.arConfig.bUseFileDialogs ? '<input type="text" size="26" value="" id="lhed_link_href"><input type="button" value="..." style="min-width: 20px; max-width: 40px;" onclick="window.LHED_Link_FDOpen();">' : '<input type="text" size="30" value="" id="lhed_link_href">';

	var str = '<table width="100%">' +
	'<tr>' +
		'<td class="lhe-dialog-label lhe-label-imp">' + BX.message.LinkText + ':</td>' +
		'<td class="lhe-dialog-param"><input type="text" size="30" value="" id="lhed_link_text"></td>' +
	'</tr>' +
	'<tr>' +
		'<td class="lhe-dialog-label lhe-label-imp">' + BX.message.LinkHref + ':</td>' +
		'<td class="lhe-dialog-param">' + strHref + '</td>' +
	'</tr>';

	if (!pObj.pLEditor.arConfig.bBBCode)
	{
		str +=
	'<tr>' +
		'<td class="lhe-dialog-label">' + BX.message.LinkTitle + ':</td>' +
		'<td class="lhe-dialog-param"><input type="text" size="30" value="" id="lhed_link_title"></td>' +
	'</tr>' +
	'<tr>' +
		'<td class="lhe-dialog-label">' + BX.message.LinkTarget + '</td>' +
		'<td class="lhe-dialog-param">' +
			'<select id="lhed_link_target">' +
				'<option value="">' + BX.message.LinkTarget_def + '</option>' +
				'<option value="_blank">' + BX.message.LinkTarget_blank + '</option>' +
				'<option value="_parent">' + BX.message.LinkTarget_parent + '</option>' +
				'<option value="_self">' + BX.message.LinkTarget_self + '</option>' +
				'<option value="_top">' + BX.message.LinkTarget_top + '</option>' +
			'</select>' +
		'</td>' +
	'</tr>';
	}
	str += '</table>';

	return {
		title: BX.message.LinkProps,
		innerHTML : str,
		width: 420,
		OnLoad: function()
		{
			pObj._selectionStart = pObj._selectionEnd = null;
			pObj.bNew = true;
			pObj.pText = BX("lhed_link_text");
			pObj.pHref = BX("lhed_link_href");

			pObj.pLEditor.focus(pObj.pHref);

			if (!pObj.pLEditor.bBBCode)
			{
				pObj.pTitle = BX("lhed_link_title");
				pObj.pTarget = BX("lhed_link_target");
			}

			if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode)
			{
				if (pObj.prevTextSelection)
					pObj.pText.value = pObj.prevTextSelection;

				if (pObj.pLEditor.pTextarea.selectionStart != undefined)
				{
					pObj._selectionStart = pObj.pLEditor.pTextarea.selectionStart;
					pObj._selectionEnd = pObj.pLEditor.pTextarea.selectionEnd;
				}
			}
			else // WYSIWYG
			{
				if(!pObj.pSel)
				{
					var bogusImg = pObj.pLEditor.pEditorDocument.getElementById('bx_lhe_temp_bogus_node');
					if (bogusImg)
					{
						pObj.pSel = BX.findParent(bogusImg, {tagName: 'A'});
						bogusImg.parentNode.removeChild(bogusImg);
					}
				}

				var parA = (pObj.pSel && pObj.pSel.tagName.toUpperCase() != 'A') ? BX.findParent(pObj.pSel, {tagName : 'A'}) : false;
				if (parA)
					pObj.pSel = parA;

				pObj.bNew = !pObj.pSel || pObj.pSel.tagName.toUpperCase() != 'A';

				// Select Link
				if (!pObj.bNew && !BX.browser.IsIE())
					pObj.pLEditor.oPrevRange = pObj.pLEditor.SelectElement(pObj.pSel);


				var
					selectedText = false,
					oRange = pObj.pLEditor.oPrevRange;

				// Get selected text
				if (oRange.startContainer && oRange.endContainer) // DOM Model
				{
					if (oRange.startContainer == oRange.endContainer && (oRange.endContainer.nodeType == 3 || oRange.endContainer.nodeType == 1))
						selectedText = oRange.startContainer.textContent.substring(oRange.startOffset, oRange.endOffset) || '';
				}
				else // IE
				{
					if (oRange.text == oRange.htmlText)
						selectedText = oRange.text || '';
				}

				if (pObj.pSel && pObj.pSel.tagName.toUpperCase() == 'IMG')
					selectedText = false;

				if (selectedText === false)
				{
					var textRow = BX.findParent(pObj.pText, {tagName: 'TR'});
					textRow.parentNode.removeChild(textRow);
					pObj.pText = false;
				}
				else
				{
					pObj.pText.value = selectedText || '';
				}

				if (!pObj.bNew)
				{
					var bxTag = pObj.pLEditor.GetBxTag(pObj.pSel);
					if (pObj.pText !== false)
						pObj.pText.value = pObj.pSel.innerHTML;

					if (pObj.pSel && pObj.pSel.childNodes && pObj.pSel.childNodes.length > 0)
					{
						for (var i = 0; i < pObj.pSel.childNodes.length; i++)
						{
							if (pObj.pSel.childNodes[i] && pObj.pSel.childNodes[i].nodeType != 3)
							{
								var textRow = BX.findParent(pObj.pText, {tagName: 'TR'});
								textRow.parentNode.removeChild(textRow);
								pObj.pText = false;
								break;
							}
						}
					}

					if (bxTag.tag == 'a')
					{
						pObj.pHref.value = bxTag.params.href;
						if (!pObj.pLEditor.bBBCode)
						{
							pObj.pTitle.value = bxTag.params.title || '';
							pObj.pTarget.value = bxTag.params.target || '';
						}
					}
					else
					{
						pObj.pHref.value = pObj.pSel.getAttribute('href');
						if (!pObj.pLEditor.bBBCode)
						{
							pObj.pTitle.value = pObj.pSel.getAttribute('title') || '';
							pObj.pTarget.value = pObj.pSel.getAttribute('target') || '';
						}
					}
				}
			}
		},
		OnSave: function()
		{
			var
				link,
				href = pObj.pHref.value;

			if (href.length  < 1) // Need for showing error
				return;

			if (pObj.pText && pObj.pText.value.length <=0)
				pObj.pText.value = href;

			// BB code mode
			if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode)
			{
				if (pObj._selectionStart != undefined && pObj._selectionEnd != undefined)
				{
					pObj.pLEditor.pTextarea.selectionStart = pObj._selectionStart;
					pObj.pLEditor.pTextarea.selectionEnd = pObj._selectionEnd;
				}

				var res = "";
				if (!pObj.pText || pObj.pText && pObj.pText.value == href)
					res = '[URL]' + href + '[/URL]';
				else
					res = '[URL=' + href + ']' + pObj.pText.value + '[/URL]';
				pObj.pLEditor.WrapWith("", "",  res);
			}
			else
			{
				// WYSIWYG mode
				var arlinks = [];
				if (pObj.pSel && pObj.pSel.tagName.toUpperCase() == 'A')
				{
					arlinks[0] = pObj.pSel;
				}
				else
				{
					var sRand = '#'+Math.random().toString().substring(5);
					var pDoc = pObj.pLEditor.pEditorDocument;

					if (pObj.pText !== false) // Simple case
					{
						pObj.pLEditor.InsertHTML('<a id="bx_lhe_' + sRand + '">#</a>');
						arlinks[0] = pDoc.getElementById('bx_lhe_' + sRand);
						arlinks[0].removeAttribute("id");
					}
					else
					{
						pDoc.execCommand('CreateLink', false, sRand);
						var arLinks_ = pDoc.getElementsByTagName('A');
						for(var i = 0; i < arLinks_.length; i++)
							if(arLinks_[i].getAttribute('href', 2) == sRand)
								arlinks.push(arLinks_[i]);
					}
				}

				var oTag, i, l = arlinks.length, link;
				for (i = 0;  i < l; i++)
				{
					link = arlinks[i];
					oTag = false;

					if (pObj.pSel && i == 0)
					{
						oTag = pObj.pLEditor.GetBxTag(link);
						if (oTag.tag != 'a' || !oTag.params)
							oTag = false;
					}

					if (!oTag)
						oTag = {tag: 'a', params: {}};

					oTag.params.href = href;
					if (!pObj.pLEditor.bBBCode)
					{
						oTag.params.title = pObj.pTitle.value;
						oTag.params.target = pObj.pTarget.value;
					}

					pObj.pLEditor.SetBxTag(link, oTag);
					SetAttr(link, 'href', href);
					// Add text
					if (pObj.pText !== false)
						link.innerHTML = BX.util.htmlspecialchars(pObj.pText.value);

					if (!pObj.pLEditor.bBBCode)
					{
						SetAttr(link, 'title', pObj.pTitle.value);
						SetAttr(link, 'target', pObj.pTarget.value);
					}
				}
			}
		}
	};
}

window.LHEDailogs['Image'] = function(pObj)
{
	var sText = '', i, strSrc;

	if (pObj.pLEditor.arConfig.bUseMedialib)
		strSrc = '<input type="text" size="30" value="" id="lhed_img_src"><input class="lhe-br-but" type="button" value="..." onclick="window.LHED_Img_MLOpen();">';
	else if (pObj.pLEditor.arConfig.bUseFileDialogs)
		strSrc = '<input type="text" size="30" value="" id="lhed_img_src"><input class="lhe-br-but" type="button" value="..." onclick="window.LHED_Img_FDOpen();">';
	else
		strSrc = '<input type="text" size="33" value="" id="lhed_img_src">';

	for (i = 0; i < 200; i++){sText += 'text ';}

	var str = '<table width="100%">' +
	'<tr>' +
		'<td class="lhe-dialog-label lhe-label-imp">' + BX.message.ImageSrc + ':</td>' +
		'<td class="lhe-dialog-param">' + strSrc + '</td>' +
	'</tr>';
	if (!pObj.pLEditor.arConfig.bBBCode)
	{
		str +=
	'<tr>' +
		'<td class="lhe-dialog-label">' + BX.message.ImageTitle + ':</td>' +
		'<td class="lhe-dialog-param"><input type="text" size="33" value="" id="lhed_img_title"></td>' +
	'</tr>' +
	'<tr>' +
		'<td class="lhe-dialog-label">' + BX.message.ImgAlign + ':</td>' +
		'<td class="lhe-dialog-param">' +
			'<select id="lhed_img_align">' +
				'<option value="">' + BX.message.LinkTarget_def + '</option>' +
				'<option value="top">' + BX.message.ImgAlignTop + '</option>' +
				'<option value="right">' + BX.message.ImgAlignRight + '</option>' +
				'<option value="bottom">' + BX.message.ImgAlignBottom + '</option>' +
				'<option value="left">' + BX.message.ImgAlignLeft + '</option>' +
				'<option value="middle">' + BX.message.ImgAlignMiddle + '</option>' +
			'</select>' +
		'</td>' +
	'</tr>' +
	'<tr>' +
		'<td colSpan="2" class="lhe-dialog-param"><span class="lhed-img-preview-label">' + BX.message.ImageSizing + ':</span>' +
		'<div class="lhed-img-size-cont"><input type="text" size="4" value="" id="lhed_img_width"> x <input type="text" size="4" value="" id="lhed_img_height"> <input type="checkbox" id="lhed_img_save_prop" checked><label for="lhed_img_save_prop">' + BX.message.ImageSaveProp + '</label></div></td>' +
	'</tr>';
	str +=
	'<tr>' +
		'<td colSpan="2" class="lhe-dialog-param"><span class="lhed-img-preview-label">' + BX.message.ImagePreview + ':</span>' +
			'<div class="lhed-img-preview-cont"><img id="lhed_img_preview" style="display:none" />' + sText + '</div>' +
		'</td>' +
	'</tr>';
	}
	str += '</table>';

	var PreviewOnLoad = function()
	{
		var w = parseInt(this.style.width || this.getAttribute('width') || this.offsetWidth);
		var h = parseInt(this.style.height || this.getAttribute('hright') || this.offsetHeight);
		if (!w || !h)
			return;
		pObj.iRatio = w / h; // Remember proportion
		pObj.curWidth = pObj.pWidth.value = w;
		pObj.curHeight = pObj.pHeight.value = h;
	};

	var PreviewReload = function()
	{
		var newSrc = pObj.pSrc.value;
		if (!newSrc) return;
		if (pObj.prevSrc != newSrc)
		{
			pObj.prevSrc = pObj.pPreview.src = newSrc;
			pObj.pPreview.style.display = "";
			pObj.pPreview.removeAttribute("width");
			pObj.pPreview.removeAttribute("height");
		}

		if (pObj.curWidth && pObj.curHeight)
		{
			pObj.pPreview.style.width = pObj.curWidth + 'px';
			pObj.pPreview.style.height = pObj.curHeight + 'px';
		}

		if (!pObj.pLEditor.bBBCode)
		{
			SetAttr(pObj.pPreview, 'align', pObj.pAlign.value);
			SetAttr(pObj.pPreview, 'title', pObj.pTitle.value);
		}
	};

	if (pObj.pLEditor.arConfig.bUseMedialib || pObj.pLEditor.arConfig.bUseFileDialogs)
	{
		window.LHED_Img_SetUrl = function(filename, path, site)
		{
			var url, srcInput = BX("lhed_img_src"), pTitle;

			if (typeof filename == 'object') // Using medialibrary
			{
				url = filename.src;
				if (pTitle = BX("lhed_img_title"))
					pTitle.value = filename.name;
			}
			else // Using file dialog
			{
				url = (path == '/' ? '' : path) + '/'+filename;
			}

			srcInput.value = url;
			if(srcInput.onchange)
				srcInput.onchange();

			pObj.pLEditor.focus(srcInput, true);
		};
	}

	return {
		title: BX.message.ImageProps,
		innerHTML : str,
		width: 500,
		OnLoad: function()
		{
			pObj.bNew = !pObj.pSel || pObj.pSel.tagName.toUpperCase() != 'IMG';
			pObj.bSaveProp = true;
			pObj.iRatio = 1;

			pObj.pSrc = BX("lhed_img_src");
			pObj.pLEditor.focus(pObj.pSrc);

			if (!pObj.pLEditor.bBBCode)
			{
				pObj.pPreview = BX("lhed_img_preview");
				pObj.pTitle = BX("lhed_img_title");
				pObj.pAlign = BX("lhed_img_align");
				pObj.pWidth = BX("lhed_img_width");
				pObj.pHeight = BX("lhed_img_height");
				pObj.pSaveProp = BX("lhed_img_save_prop");
				pObj.bSetInStyles = false;
				pObj.pSaveProp.onclick = function()
				{
					pObj.bSaveProp = this.checked ? true : false;
					if (pObj.bSaveProp)
						pObj.pWidth.onchange();
				};
				pObj.pWidth.onchange = function()
				{
					var w = parseInt(this.value);
					if (isNaN(w)) return;
					pObj.curWidth = pObj.pWidth.value = w;
					if (pObj.bSaveProp)
					{
						var h = Math.round(w / pObj.iRatio);
						pObj.curHeight = pObj.pHeight.value = h;
					}
					PreviewReload();
				};
				pObj.pHeight.onchange = function()
				{
					var h = parseInt(this.value);
					if (isNaN(h)) return;
					pObj.curHeight = pObj.pHeight.value = h;
					if (pObj.bSaveProp)
					{
						var w = parseInt(h * pObj.iRatio);
						pObj.curWidth = pObj.pWidth.value = w;
					}
					PreviewReload();
				};
				pObj.pAlign.onchange = pObj.pTitle.onchange = PreviewReload;
				pObj.pSrc.onchange = PreviewReload;
				pObj.pPreview.onload = PreviewOnLoad;
			}
			else if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode && pObj.pLEditor.pTextarea.selectionStart != undefined)
			{
				pObj._selectionStart = pObj.pLEditor.pTextarea.selectionStart;
				pObj._selectionEnd = pObj.pLEditor.pTextarea.selectionEnd;
			}

			if (!pObj.bNew) // Select Img
			{
				var bxTag = pObj.pLEditor.GetBxTag(pObj.pSel);
				if (bxTag.tag !== 'img')
					bxTag.params = {};

				pObj.pSrc.value = bxTag.params.src || '';
				if (!pObj.pLEditor.bBBCode)
				{
					pObj.pPreview.onload = function(){pObj.pPreview.onload = PreviewOnLoad;};
					if (pObj.pSel.style.width || pObj.pSel.style.height)
						pObj.bSetInStyles = true;
					pObj.bSetInStyles = false;

					var w = parseInt(pObj.pSel.style.width || pObj.pSel.getAttribute('width') || pObj.pSel.offsetWidth);
					var h = parseInt(pObj.pSel.style.height || pObj.pSel.getAttribute('height') || pObj.pSel.offsetHeight);
					if (w && h)
					{
						pObj.iRatio = w / h; // Remember proportion
						pObj.curWidth = pObj.pWidth.value = w;
						pObj.curHeight = pObj.pHeight.value = h;
					}
					pObj.pTitle.value = bxTag.params.title || '';
					pObj.pAlign.value = bxTag.params.align || '';
					PreviewReload();
				}
			}
		},
		OnSave: function()
		{
			var src = pObj.pSrc.value, img, oTag;

			if (src.length < 1) // Need for showing error
				return;

			// BB code mode
			if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode)
			{
				if (pObj._selectionStart != undefined && pObj._selectionEnd != undefined)
				{
					pObj.pLEditor.pTextarea.selectionStart = pObj._selectionStart;
					pObj.pLEditor.pTextarea.selectionEnd = pObj._selectionEnd;
				}
				pObj.pLEditor.WrapWith("", "",  '[IMG]' + src + '[/IMG]');
			}
			else
			{
				// WYSIWYG mode
				if (pObj.pSel)
				{
					img = pObj.pSel;
					oTag = pObj.pLEditor.GetBxTag(img);
					if (oTag.tag != 'img' || !oTag.params)
						oTag = false;
				}
				else
				{
					var tmpid = Math.random().toString().substring(4);
					pObj.pLEditor.InsertHTML('<img id="' + tmpid + '" src="" />');
					img = pObj.pLEditor.pEditorDocument.getElementById(tmpid);
					img.removeAttribute("id");
				}
				SetAttr(img, "src", src);

				if (!oTag)
					oTag = {tag: 'img', params: {}};

				oTag.params.src = src;

				if (!pObj.pLEditor.bBBCode)
				{
					if (pObj.bSetInStyles)
					{
						img.style.width = pObj.pWidth.value + 'px';
						img.style.height = pObj.pHeight.value + 'px';
						SetAttr(img, "width", '');
						SetAttr(img, "height", '');
					}
					else
					{
						SetAttr(img, "width", pObj.pWidth.value);
						SetAttr(img, "height", pObj.pHeight.value);
						img.style.width = '';
						img.style.height = '';
					}

					oTag.params.align = pObj.pAlign.value;
					oTag.params.title = pObj.pTitle.value;

					SetAttr(img, "align", pObj.pAlign.value);
					SetAttr(img, "title", pObj.pTitle.value);
				}

				pObj.pLEditor.SetBxTag(img, oTag);
			}
		}
	};
}

window.LHEDailogs['Video'] = function(pObj)
{
	var strPath;
	if (pObj.pLEditor.arConfig.bUseMedialib)
		strPath = '<input type="text" size="30" value="" id="lhed_video_path"><input class="lhe-br-but" type="button" value="..." onclick="window.LHED_Video_MLOpen();">';
	else if (pObj.pLEditor.arConfig.bUseFileDialogs)
		strPath = '<input type="text" size="30" value="" id="lhed_video_path"><input class="lhe-br-but" type="button" value="..." onclick="window.LHED_VideoPath_FDOpen();">';
	else
		strPath = '<input type="text" size="33" value="" id="lhed_video_path">';

	var strPreview = pObj.pLEditor.arConfig.bUseFileDialogs ? '<input type="text" size="30" value="" id="lhed_video_prev_path"><input type="button" value="..." style="width: 20px;" onclick="window.LHED_VideoPreview_FDOpen();">' : '<input type="text" size="33" value="" id="lhed_video_prev_path">';

	var sText = '', i;
	for (i = 0; i < 200; i++){sText += 'text ';}

	var str = '<table width="100%">' +
	'<tr>' +
		'<td class="lhe-dialog-label lhe-label-imp">' + BX.message.VideoPath + ':</td>' +
		'<td class="lhe-dialog-param">' + strPath + '</td>' +
	'</tr>';
	if (!pObj.pLEditor.arConfig.bBBCode)
	{
		str +=
	'<tr>' +
		'<td class="lhe-dialog-label">' + BX.message.VideoPreviewPath + ':</td>' +
		'<td class="lhe-dialog-param">' + strPreview + '</td>' +
	'</tr>';
	}
	str +=
	'<tr>' +
		'<td class="lhe-dialog-label lhe-label-imp">' + BX.message.ImageSizing + ':</td>' +
		'<td class="lhe-dialog-param">' +
		'<div class="lhed-img-size-cont"><input type="text" size="4" value="" id="lhed_video_width"> x <input type="text" size="4" value="" id="lhed_video_height"></div></td>' +
	'</tr>';
	if (!pObj.pLEditor.arConfig.bBBCode)
	{
		str +=
	'<tr>' +
		'<td class="lhe-dialog-label"></td>' +
		'<td class="lhe-dialog-param"><input type="checkbox" id="lhed_video_autoplay"><label for="lhed_video_autoplay">' + BX.message.VideoAutoplay + '</label></td>' +
	'</tr>' +
	'<tr>' +
		'<td class="lhe-dialog-label">' + BX.message.VideoVolume + ':</td>' +
		'<td class="lhe-dialog-param">' +
			'<select id="lhed_video_volume">' +
				'<option value="10">10</option><option value="20">20</option>' +
				'<option value="30">30</option><option value="40">40</option>' +
				'<option value="50">50</option><option value="60">60</option>' +
				'<option value="70">70</option><option value="80">80</option>' +
				'<option value="90" selected="selected">90</option><option value="100">100</option>' +
			'</select> %' +
		'</td>' +
	'</tr>';
	}

	window.LHED_Video_SetPath = function(filename, path, site)
	{
		var url, srcInput = BX("lhed_video_path");
		if (typeof filename == 'object') // Using medialibrary
			url = filename.src;
		else // Using file dialog
			url = (path == '/' ? '' : path) + '/' + filename;

		srcInput.value = url;
		if(srcInput.onchange)
			srcInput.onchange();

		pObj.pLEditor.focus(srcInput, true);
	};

	return {
		title: BX.message.VideoProps,
		innerHTML : str,
		width: 500,
		OnLoad: function()
		{
			pObj.pSel = pObj.pLEditor.GetSelectionObject();
			pObj.bNew = true;
			var bxTag = {};

			if (pObj.pSel)
				bxTag = pObj.pLEditor.GetBxTag(pObj.pSel);

			if (pObj.pSel && pObj.pSel.id)
				bxTag = pObj.pLEditor.GetBxTag(pObj.pSel.id);

			if (bxTag.tag == 'video' && bxTag.params)
				pObj.bNew = false;
			else
				pObj.pSel = false;

			pObj.pPath = BX("lhed_video_path");
			pObj.pLEditor.focus(pObj.pPath);
			pObj.pWidth = BX("lhed_video_width");
			pObj.pHeight = BX("lhed_video_height");

			if (!pObj.pLEditor.bBBCode)
			{
				pObj.pPrevPath = BX("lhed_video_prev_path");
				pObj.pVolume = BX("lhed_video_volume");
				pObj.pAutoplay = BX("lhed_video_autoplay");
			}
			else if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode && pObj.pLEditor.pTextarea.selectionStart != undefined)
			{
				pObj._selectionStart = pObj.pLEditor.pTextarea.selectionStart;
				pObj._selectionEnd = pObj.pLEditor.pTextarea.selectionEnd;
			}

			if (!pObj.bNew)
			{
				pObj.arParams = bxTag.params || {};

				var path, prPath, vol, w, h, autoplay;
				if (pObj.arParams.flashvars) //FLV
				{
					path = pObj.arParams.flashvars.file;
					w = pObj.arParams.width || '';
					h = pObj.arParams.height || '';
					prPath = pObj.arParams.flashvars.image || '';
					vol = pObj.arParams.flashvars.volume || '90';
					autoplay = pObj.arParams.flashvars.autostart || false;
				}
				else
				{
					path = pObj.arParams.JSConfig.file;
					w = pObj.arParams.JSConfig.width || '';
					h = pObj.arParams.JSConfig.height || '';
					prPath = pObj.arParams.JSConfig.image || '';
					vol = pObj.arParams.JSConfig.volume || '90';
					autoplay = pObj.arParams.JSConfig.autostart || false;
				}
				pObj.pPath.value = path;
				pObj.pWidth.value = w;
				pObj.pHeight.value = h;

				if (!pObj.pLEditor.bBBCode)
				{
					if (pObj.pPrevPath)
						pObj.pPrevPath.value = prPath;
					pObj.pVolume.value = vol;
					pObj.pAutoplay.checked = autoplay ? true : false;
				}
			}
		},
		OnSave: function()
		{
			var
				path = pObj.pPath.value,
				w = parseInt(pObj.pWidth.value) || 240,
				h = parseInt(pObj.pHeight.value) || 180,
				pVid, ext,
				arVidConf = pObj.pLEditor.arConfig.videoSettings;

			if (path.length  < 1) // Need for showing error
				return;

			if (pObj.pSel)
			{
				pVid = pObj.pSel;
			}
			else
			{
				pObj.videoId = "bx_video_" + Math.round(Math.random() * 100000);

				pObj.pLEditor.InsertHTML('<img id="' + pObj.videoId + '" src="' + pObj.pLEditor.oneGif + '" class="bxed-video" />');

				pVid = pObj.pLEditor.pEditorDocument.getElementById(pObj.videoId);
			}

			if (arVidConf.maxWidth && w && parseInt(w) > parseInt(arVidConf.maxWidth))
				w = arVidConf.maxWidth;
			if (arVidConf.maxHeight && h && parseInt(h) > parseInt(arVidConf.maxHeight))
				h = arVidConf.maxHeight;

			var oVideo = {width: w, height: h};
			if (path.indexOf('http://') != -1 || path.indexOf('.') != -1)
			{
				ext = (path.indexOf('.') != -1) ? path.substr(path.lastIndexOf('.') + 1).toLowerCase() : false;
				if (ext && (ext == 'wmv' || ext == 'wma')) // WMV
				{
					oVideo.JSConfig = {file: path};
					if (!pObj.pLEditor.bBBCode)
					{
						if (pObj.pPrevPath)
							oVideo.JSConfig.image = pObj.pPrevPath.value || '';
						oVideo.JSConfig.volume = pObj.pVolume.value;
						oVideo.JSConfig.autostart = pObj.pAutoplay.checked ? true : false;
						oVideo.JSConfig.width = w;
						oVideo.JSConfig.height = h;
					}
				}
				else
				{
					oVideo.flashvars= {file: path};
					if (!pObj.pLEditor.bBBCode)
					{
						if (pObj.pPrevPath)
							oVideo.flashvars.image = pObj.pPrevPath.value || '';
						oVideo.flashvars.volume = pObj.pVolume.value;
						oVideo.flashvars.autostart = pObj.pAutoplay.checked ? true : false;
					}
				}

				pVid.title= BX.message.Video + ': ' + path;
				pVid.style.width = w + 'px';
				pVid.style.height = h + 'px';
				if (pObj.pPrevPath && pObj.pPrevPath.value.length > 0)
					pVid.style.backgroundImage = 'url(' + pObj.pPrevPath.value + ')';

				oVideo.id = pObj.videoId;
				pVid.id = pObj.pLEditor.SetBxTag(false, {tag: 'video', params: oVideo});
			}
			else
			{
				pObj.pLEditor.InsertHTML('');
			}
		}
	};
}

// Table
window.LHEDailogs['Table'] = function(pObj)
{
	return {
		title: BX.message.InsertTable,
		innerHTML : '<table>' +
			'<tr>' +
				'<td class="lhe-dialog-label lhe-label-imp"><label for="' + pObj.pLEditor.id + 'lhed_table_cols">' + BX.message.TableCols + ':</label></td>' +
				'<td class="lhe-dialog-param"><input type="text" size="4" value="3" id="' + pObj.pLEditor.id + 'lhed_table_cols"></td>' +
				'<td class="lhe-dialog-label lhe-label-imp"><label for="' + pObj.pLEditor.id + 'lhed_table_rows">' + BX.message.TableRows + ':</label></td>' +
				'<td class="lhe-dialog-param"><input type="text" size="4" value="3" id="' + pObj.pLEditor.id + 'lhed_table_rows"></td>' +
			'</tr>' +
			'<tr>' +
				'<td colSpan="4">' +
					'<span>' + BX.message.TableModel + ': </span>' +
					'<div class="lhed-model-cont" id="' + pObj.pLEditor.id + 'lhed_table_model" ><div>' +
				'</td>' +
			'</tr></table>',
		width: 350,
		OnLoad: function(oDialog)
		{
			pObj.pCols = BX(pObj.pLEditor.id + "lhed_table_cols");
			pObj.pRows = BX(pObj.pLEditor.id + "lhed_table_rows");
			pObj.pModelDiv = BX(pObj.pLEditor.id + "lhed_table_model");

			pObj.pLEditor.focus(pObj.pCols, true);

			if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode && pObj.pLEditor.pTextarea.selectionStart != undefined)
			{
				pObj._selectionStart = pObj.pLEditor.pTextarea.selectionStart;
				pObj._selectionEnd = pObj.pLEditor.pTextarea.selectionEnd;
			}

			var BuildModel = function()
			{
				BX.cleanNode(pObj.pModelDiv);
				var
					rows = parseInt(pObj.pRows.value),
					cells = parseInt(pObj.pCols.value);

				if (rows > 0 && cells > 0)
				{
					var tbl = pObj.pModelDiv.appendChild(BX.create("TABLE", {props: {className: "lhe-table-model"}}));
					var i, j, row, cell;
					for(i = 0; i < rows; i++)
					{
						row = tbl.insertRow(-1);
						for(j = 0; j < cells; j++)
							row.insertCell(-1).innerHTML = "&nbsp;";
					}
				}
			};

			pObj.pCols.onkeyup = pObj.pRows.onkeyup = BuildModel;
			BuildModel();
		},
		OnSave: function()
		{
			var
				rows = parseInt(pObj.pRows.value),
				cells = parseInt(pObj.pCols.value),
				t1 = "<", t2 = ">", res = "", cellHTML = "<br _moz_editor_bogus_node=\"on\" />";

			if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode)
			{
				t1 = "[";
				t2 = "]";
				cellHTML = " ";
			}

			if (rows > 0 && cells > 0)
			{
				res = "\n" + t1 + "TABLE" + t2 + "\n";

				var i, j;
				for(i = 0; i < rows; i++)
				{
					res += "\t" + t1 + "TR" + t2 + "\n";
					for(j = 0; j < cells; j++)
						res += "\t\t" + t1 + "TD" + t2 + cellHTML + t1 + "/TD" + t2 + "\n";
					res += "\t" + t1 + "/TR" + t2 + "\n";
				}

				res += t1 + "/TABLE" + t2 + "\n";
			}

			if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode)
			{
				if (pObj._selectionStart != undefined && pObj._selectionEnd != undefined)
				{
					pObj.pLEditor.pTextarea.selectionStart = pObj._selectionStart;
					pObj.pLEditor.pTextarea.selectionEnd = pObj._selectionEnd;
				}
				pObj.pLEditor.WrapWith("", "", res);
			}
			else if (pObj.pLEditor.sEditorMode == 'code' && !pObj.pLEditor.bBBCode)
			{
				// ?
			}
			else // WYSIWYG
			{
				pObj.pLEditor.InsertHTML(res + "</br>");
			}
		}
	};
}

// Ordered and unordered lists for BBCodes
window.LHEDailogs['List'] = function(pObj)
{
	return {
		title: pObj.arParams.bOrdered ? BX.message.OrderedList : BX.message.UnorderedList,
		innerHTML : '<table class="lhe-dialog-list-table"><tr>' +
				'<td>' + BX.message.ListItems + ':</td>' +
			'</tr><tr>' +
				'<td class="lhe-dialog-list-items"><div id="' + pObj.pLEditor.id + 'lhed_list_items"></div></td>' +
			'</tr><tr>' +
				'<td align="right"><a href="javascript:void(0);" title="' + BX.message.AddLITitle + '" id="' + pObj.pLEditor.id + 'lhed_list_more">' + BX.message.AddLI + '</a>' +
			'</tr><table>',
		width: 350,
		OnLoad: function(oDialog)
		{
			if (pObj.pLEditor.sEditorMode == 'code' && pObj.pLEditor.bBBCode && pObj.pLEditor.pTextarea.selectionStart != undefined)
			{
				pObj._selectionStart = pObj.pLEditor.pTextarea.selectionStart;
				pObj._selectionEnd = pObj.pLEditor.pTextarea.selectionEnd;
			}

			pObj.pItemsCont = BX(pObj.pLEditor.id + "lhed_list_items");
			pObj.pMore = BX(pObj.pLEditor.id + "lhed_list_more");

			BX.cleanNode(pObj.pItemsCont);
			pObj.pList = pObj.pItemsCont.appendChild(BX.create(pObj.arParams.bOrdered ? "OL" : "UL"));

			var firstItemText = "";
			if (pObj.prevTextSelection)
				firstItemText = pObj.prevTextSelection;

			var addItem = function(val, pPrev, bFocus, bCheck)
			{
				var pLi = BX.create("LI");
				var pInput = pLi.appendChild(BX.create("INPUT", {props: {type: 'text', value: val || "", size: 35}}));

				if (pPrev && pPrev.nextSibling)
					pObj.pList.insertBefore(pLi, pPrev.nextSibling);
				else
					pObj.pList.appendChild(pLi);

				pInput.onkeyup = function(e)
				{
					if (!e)
						e = window.event;

					if (e.keyCode == 13) // Enter
					{
						addItem("", this.parentNode, true, true);
						return BX.PreventDefault(e);
					}
				}

				pLi.appendChild(BX.create("IMG", {props: {src: pObj.pLEditor.oneGif, className: "lhe-dialog-list-del", title: BX.message.DelListItem}})).onclick = function()
				{
					// del list item
					var pLi = BX.findParent(this, {tagName: 'LI'});
					if (pLi)
						pLi.parentNode.removeChild(pLi);
				};

				if(bFocus !== false)
					pObj.pLEditor.focus(pInput);

				if (bCheck === true)
				{
					var arInp = pObj.pList.getElementsByTagName("INPUT"), i, l = arInp.length;
					for (i = 0; i < l; i++)
						arInp[i].onfocus = (i == l - 1) ? function(){addItem("", false, false, true);} : null;
				}
			};

			addItem(firstItemText, false, firstItemText == "");
			addItem("", false, firstItemText != "");
			addItem("", false, false, true);

			pObj.pMore.onclick = function(){addItem("", false, true, true);};
		},
		OnSave: function()
		{
			var
				res = "",
				arInputs = pObj.pList.getElementsByTagName("INPUT"),
				i, l = arInputs.length;

			if (l == 0)
				return;

			res = "\n[LIST";
			if (pObj.arParams.bOrdered)
				res += "=1";
			res += "]\n";

			var i, j;
			for (i = 0; i < l; i++)
			{
				if (arInputs[i].value != "" || i == 0)
					res += "[*]" + arInputs[i].value + "\n";
			}
			res += "[/LIST]" + "\n";

			if (pObj._selectionStart != undefined && pObj._selectionEnd != undefined)
			{
				pObj.pLEditor.pTextarea.selectionStart = pObj._selectionStart;
				pObj.pLEditor.pTextarea.selectionEnd = pObj._selectionEnd;
			}
			pObj.pLEditor.WrapWith("", "", res);
		}
	};
}



/* End */
;
; /* Start:"a:4:{s:4:"full";s:62:"/bitrix/js/fileman/light_editor/le_controls.js?154412741224518";s:6:"source";s:46:"/bitrix/js/fileman/light_editor/le_controls.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
function LHEButton(oBut, pLEditor)
{
	if (!oBut.name)
		oBut.name = oBut.id;

	if (!oBut.title)
		oBut.title = oBut.name;
	this.disabled = false;

	this.pLEditor = pLEditor;

	this.oBut = oBut;
	if (this.oBut && typeof this.oBut.OnBeforeCreate == 'function')
		this.oBut = this.oBut.OnBeforeCreate(this.pLEditor, this.oBut);

	if(this.oBut)
		this.Create();
}


LHEButton.prototype = {
	Create: function ()
	{
		var _this = this;
		this.pCont = BX.create("DIV", {props: {className: 'lhe-button-cont'}});

		this.pWnd = this.pCont.appendChild(BX.create("IMG", {props: {src: this.oBut.src || this.pLEditor.oneGif, title: this.oBut.title, className: "lhe-button lhe-button-normal", id: "lhe_btn_" + this.oBut.id.toLowerCase()}}));

		if (this.oBut.disableOnCodeView)
			BX.addCustomEvent(this.pLEditor, "OnChangeView", BX.proxy(this.OnChangeView, this));

		if (this.oBut.width)
		{
			this.pCont.style.width = parseInt(this.oBut.width) + 5 + "px";
			this.pWnd.style.width = parseInt(this.oBut.width) + "px";
		}

		this.pWnd.onmouseover = function(e){_this.OnMouseOver(e, this)};
		this.pWnd.onmouseout = function(e){_this.OnMouseOut(e, this)};
		this.pWnd.onmousedown = function(e){_this.OnClick(e, this);};
	},

	OnMouseOver: function (e, pEl)
	{
		if(this.disabled)
			return;
		pEl.className = 'lhe-button lhe-button-over';
	},

	OnMouseOut: function (e, pEl)
	{
		if(this.disabled)
			return;

		if(this.checked)
			pEl.className = 'lhe-button lhe-button-checked';
		else
			pEl.className = 'lhe-button lhe-button-normal';
	},

	OnClick: function (e, pEl)
	{
		if(this.disabled)
			return false;

		var res = false;
		if (this.pLEditor.sEditorMode == 'code' && this.pLEditor.bBBCode && typeof this.oBut.bbHandler == 'function')
		{
			res = this.oBut.bbHandler(this) !== false;
		}
		else
		{
			if(typeof this.oBut.handler == 'function')
				res = this.oBut.handler(this) !== false;

			if(this.pLEditor.sEditorMode != 'code' && !res && this.oBut.cmd)
				res = this.pLEditor.executeCommand(this.oBut.cmd);

			this.pLEditor.SetFocus();
			BX.defer(this.pLEditor.SetFocus, this.pLEditor)();
		}

		return res;
	},

	Check: function (bFlag)
	{
		if(bFlag == this.checked || this.disabled)
			return;

		this.checked = bFlag;
		if(this.checked)
			BX.addClass(this.pWnd, 'lhe-button-checked');
		else
			BX.removeClass(this.pWnd, 'lhe-button-checked');
	},

	Disable: function (bFlag)
	{
		if(bFlag == this.disabled)
			return false;
		this.disabled = bFlag;
		if(bFlag)
			BX.addClass(this.pWnd, 'lhe-button-disabled');
		else
			BX.removeClass(this.pWnd, 'lhe-button-disabled');
	},

	OnChangeView: function()
	{
		if (this.oBut.disableOnCodeView)
			this.Disable(this.pLEditor.sEditorMode == 'code');
	}
}

// Dialog
function LHEDialog(arParams, pLEditor)
{
	this.pSel = arParams.obj || false;
	this.pLEditor = pLEditor;
	this.id = arParams.id;
	this.arParams = arParams;
	this.Create();
};

LHEDialog.prototype = {
	Create: function()
	{
		if (!window.LHEDailogs[this.id] || typeof window.LHEDailogs[this.id] != 'function')
			return;

		var oDialog = window.LHEDailogs[this.id](this);
		if (!oDialog)
			return;

		this.prevTextSelection = "";
		if (this.pLEditor.sEditorMode == 'code')
			this.prevTextSelection = this.pLEditor.GetTextSelection();

		this.pLEditor.SaveSelectionRange();

		if (BX.browser.IsIE() && !this.arParams.bCM && this.pLEditor.sEditorMode != 'code')
		{
			if (this.pLEditor.GetSelectedText(this.pLEditor.oPrevRange) == '')
			{
				this.pLEditor.InsertHTML('<img id="bx_lhe_temp_bogus_node" src="' + this.pLEditor.oneGif + '" _moz_editor_bogus_node="on" style="border: 0px !important;"/>');
				this.pLEditor.oPrevRange = this.pLEditor.GetSelectionRange();
			}
		}

		var arDConfig = {
			title : oDialog.title || this.name || '',
			width: oDialog.width || 500,
			height: 200,
			resizable: false
		};

		if (oDialog.height)
			arDConfig.height = oDialog.height;

		if (oDialog.resizable)
		{
			arDConfig.resizable = true;
			arDConfig.min_width = oDialog.min_width;
			arDConfig.min_height = oDialog.min_height;
			arDConfig.resize_id = oDialog.resize_id;
		}

		window.obLHEDialog = new BX.CDialog(arDConfig);

		var _this = this;
		BX.addCustomEvent(obLHEDialog, 'onWindowUnRegister', function()
		{
			_this.pLEditor.bPopup = false;
			if (obLHEDialog.DIV && obLHEDialog.DIV.parentNode)
				obLHEDialog.DIV.parentNode.removeChild(window.obLHEDialog.DIV);

			if (_this.arParams.bEnterClose !== false)
				BX.unbind(window, "keydown", BX.proxy(_this.OnKeyPress, _this));
		});

		if (this.arParams.bEnterClose !== false)
			BX.bind(window, "keydown", BX.proxy(this.OnKeyPress, this));

		this.pLEditor.bPopup = true;
		obLHEDialog.Show();
		obLHEDialog.SetContent(oDialog.innerHTML);

		if (oDialog.OnLoad && typeof oDialog.OnLoad == 'function')
			oDialog.OnLoad();

		obLHEDialog.oDialog = oDialog;
		obLHEDialog.SetButtons([
			new BX.CWindowButton(
				{
					title: BX.message.DialogSave,
					action: function()
					{
						var res = true;
						if (oDialog.OnSave && typeof oDialog.OnSave == 'function')
						{
							_this.pLEditor.RestoreSelectionRange();
							res = oDialog.OnSave();
						}
						if (res !== false)
							window.obLHEDialog.Close();
					}
				}),
			obLHEDialog.btnCancel
		]);
		BX.addClass(obLHEDialog.PARTS.CONTENT, "lhe-dialog");

		obLHEDialog.adjustSizeEx();
		// Hack for Opera
		setTimeout(function(){obLHEDialog.Move(1, 1);}, 100);
	},

	OnKeyPress: function(e)
	{
		if(!e)
			e = window.event
		if (e.keyCode == 13)
			obLHEDialog.PARAMS.buttons[0].emulate();
	},

	Close: function(floatDiv)
	{
		this.RemoveOverlay();
		if (!floatDiv)
			floatDiv = this.floatDiv;
		if (!floatDiv || !floatDiv.parentNode)
			return;

		this.pLEditor.bDialogOpened = false;
		jsFloatDiv.Close(floatDiv);
		floatDiv.parentNode.removeChild(floatDiv);
		if (window.jsPopup)
			jsPopup.AllowClose();
	},

	CreateOverlay: function()
	{
		var ws = BX.GetWindowScrollSize();
		this.overlay = document.body.appendChild(BX.create("DIV", {props: {id: this.overlay_id, className: "lhe-overlay"}, style: {zIndex: this.zIndex - 5, width: ws.scrollWidth + "px", height: ws.scrollHeight + "px"}}));
		this.overlay.ondrag = BX.False;
		this.overlay.onselectstart = BX.False;
	},

	RemoveOverlay: function()
	{
		if (this.overlay && this.overlay.parentNode)
			this.overlay.parentNode.removeChild(this.overlay);
	}
}

// List
function LHEList(oBut, pLEditor)
{
	if (!oBut.name)
		oBut.name = oBut.id;
	if (!oBut.title)
		oBut.title = oBut.name;
	this.disabled = false;
	this.zIndex = 5000;

	this.pLEditor = pLEditor;
	this.oBut = oBut;
	this.Create();
	this.bRunOnOpen = false;
	if (this.oBut && typeof this.oBut.OnBeforeCreate == 'function')
		this.oBut = this.oBut.OnBeforeCreate(this.pLEditor, this.oBut);

	if (this.oBut)
	{
		if (oBut.OnCreate && typeof oBut.OnCreate == 'function')
			this.bRunOnOpen = true;

		if (this.oBut.disableOnCodeView)
			BX.addCustomEvent(this.pLEditor, "OnChangeView", BX.proxy(this.OnChangeView, this));
	}
	else
	{
		BX.defer(function(){BX.remove(this.pCont);}, this)();
	}
}

LHEList.prototype = {
	Create: function ()
	{
		var _this = this;

		this.pWnd = BX.create("IMG", {props: {src: this.pLEditor.oneGif, title: this.oBut.title, className: "lhe-button lhe-button-normal", id: "lhe_btn_" + this.oBut.id.toLowerCase()}});

		this.pWnd.onmouseover = function(e){_this.OnMouseOver(e, this)};
		this.pWnd.onmouseout = function(e){_this.OnMouseOut(e, this)};
		this.pWnd.onmousedown = function(e){_this.OnClick(e, this)};

		this.pCont = BX.create("DIV", {props: {className: 'lhe-button-cont'}});
		this.pCont.appendChild(this.pWnd);

		this.pValuesCont = BX.create("DIV", {props: {className: "lhe-list-val-cont"}, style: {zIndex: this.zIndex}});

		if (this.oBut && typeof this.oBut.OnAfterCreate == 'function')
			this.oBut.OnAfterCreate(this.pLEditor, this);
	},

	OnChangeView: function()
	{
		if (this.oBut.disableOnCodeView)
			this.Disable(this.pLEditor.sEditorMode == 'code');
	},

	Disable: function (bFlag)
	{
		if(bFlag == this.disabled)
			return false;
		this.disabled = bFlag;
		if(bFlag)
			BX.addClass(this.pWnd, 'lhe-button-disabled');
		else
			BX.removeClass(this.pWnd, 'lhe-button-disabled');
	},

	OnMouseOver: function (e, pEl)
	{
		if(this.disabled)
			return;
		BX.addClass(pEl, 'lhe-button-over');
	},

	OnMouseOut: function (e, pEl)
	{
		if(this.disabled)
			return;

		BX.removeClass(pEl, 'lhe-button-over');
		if(this.checked)
			BX.addClass(pEl, 'lhe-button-checked');

		// if(this.checked)
		// pEl.className = 'lhe-button lhe-button-checked';
		// else
		// pEl.className = 'lhe-button lhe-button-normal';
	},

	OnKeyPress: function(e)
	{
		if(!e) e = window.event
		if(e.keyCode == 27)
			this.Close();
	},

	OnClick: function (e, pEl)
	{
		this.pLEditor.SaveSelectionRange();

		if(this.disabled)
			return false;

		if (this.bOpened)
			return this.Close();

		this.Open();
	},

	Close: function ()
	{
		this.pValuesCont.style.display = 'none';
		this.pLEditor.oTransOverlay.Hide();

		BX.unbind(window, "keypress", BX.proxy(this.OnKeyPress, this));
		BX.unbind(document, 'mousedown', BX.proxy(this.CheckClose, this));

		this.bOpened = false;
	},

	CheckClose: function(e)
	{
		if (!this.bOpened)
			return BX.unbind(document, 'mousedown', BX.proxy(this.CheckClose, this));

		var pEl;
		if (e.target)
			pEl = e.target;
		else if (e.srcElement)
			pEl = e.srcElement;
		if (pEl.nodeType == 3)
			pEl = pEl.parentNode;

		if (!BX.findParent(pEl, {className: 'lhe-colpick-cont'}))
			this.Close();
	},

	Open: function ()
	{
		if (this.bRunOnOpen)
		{
			if (this.oBut.OnCreate && typeof this.oBut.OnCreate == 'function')
				this.oBut.OnCreate(this);
			this.bRunOnOpen = false;
		}

		document.body.appendChild(this.pValuesCont);

		this.pValuesCont.style.display = 'block';
		var
			pOverlay = this.pLEditor.oTransOverlay.Show(),
			pos = BX.align(BX.pos(this.pWnd), parseInt(this.pValuesCont.offsetWidth) || 150, parseInt(this.pValuesCont.offsetHeight) || 200),
			_this = this;

		BX.bind(window, "keypress", BX.proxy(this.OnKeyPress, this));
		pOverlay.onclick = function(){_this.Close()};

		this.pLEditor.oPrevRange = this.pLEditor.GetSelectionRange();
		if (this.oBut.OnOpen && typeof this.oBut.OnOpen == 'function')
			this.oBut.OnOpen(this);

		this.pValuesCont.style.top = pos.top + 'px';
		this.pValuesCont.style.left = pos.left + 'px';
		this.bOpened = true;

		setTimeout(function()
		{
			BX.bind(document, 'mousedown', BX.proxy(_this.CheckClose, _this));
		},100);
	},

	SelectItem: function(bSelect)
	{
		var pItem = this.arItems[this.pSelectedItemId || 0].pWnd;
		if (bSelect)
		{
			pItem.style.border = '1px solid #4B4B6F';
			pItem.style.backgroundColor = '#FFC678';
		}
		else
		{
			pItem.style.border = '';
			pItem.style.backgroundColor = '';
		}
	}
}

function LHETransOverlay(arParams, pLEditor)
{
	this.pLEditor = pLEditor;
	this.id = 'lhe_trans_overlay';
	this.zIndex = arParams.zIndex || 100;
}

LHETransOverlay.prototype =
{
	Create: function ()
	{
		this.bCreated = true;
		this.bShowed = false;
		var ws = BX.GetWindowScrollSize();
		this.pWnd = document.body.appendChild(BX.create("DIV", {props: {id: this.id, className: "lhe-trans-overlay"}, style: {zIndex: this.zIndex, width: ws.scrollWidth + "px", height: ws.scrollHeight + "px"}}));

		this.pWnd.ondrag = BX.False;
		this.pWnd.onselectstart = BX.False;
	},

	Show: function(arParams)
	{
		if (!this.bCreated)
			this.Create();
		this.bShowed = true;
		this.pLEditor.bPopup = true;

		var ws = BX.GetWindowScrollSize();

		this.pWnd.style.display = 'block';
		this.pWnd.style.width = ws.scrollWidth + "px";
		this.pWnd.style.height = ws.scrollHeight + "px";

		if (!arParams)
			arParams = {};

		if (arParams.zIndex)
			this.pWnd.style.zIndex = arParams.zIndex;

		BX.bind(window, "resize", BX.proxy(this.Resize, this));
		return this.pWnd;
	},

	Hide: function ()
	{
		var _this = this;
		setTimeout(function(){_this.pLEditor.bPopup = false;}, 50);
		if (!this.bShowed)
			return;
		this.bShowed = false;
		this.pWnd.style.display = 'none';
		BX.unbind(window, "resize", BX.proxy(this.Resize, this));
		this.pWnd.onclick = null;
	},

	Resize: function ()
	{
		if (this.bCreated)
			this.pWnd.style.width = BX.GetWindowScrollSize().scrollWidth + "px";
	}
}


function LHEColorPicker(oPar, pLEditor)
{
	if (!oPar.name)
		oPar.name = oPar.id;
	if (!oPar.title)
		oPar.title = oPar.name;
	this.disabled = false;
	this.bCreated = false;
	this.bOpened = false;
	this.zIndex = 5000;

	this.pLEditor = pLEditor;

	this.oPar = oPar;
	this.BeforeCreate();
}

LHEColorPicker.prototype = {
	BeforeCreate: function()
	{
		var _this = this;
		this.pWnd = BX.create("IMG", {props: {src: this.pLEditor.oneGif, title: this.oPar.title, className: "lhe-button lhe-button-normal", id: "lhe_btn_" + this.oPar.id.toLowerCase()}});

		this.pWnd.onmouseover = function(e){_this.OnMouseOver(e, this)};
		this.pWnd.onmouseout = function(e){_this.OnMouseOut(e, this)};
		this.pWnd.onmousedown = function(e){_this.OnClick(e, this)};
		this.pCont = BX.create("DIV", {props: {className: 'lhe-button-cont'}});
		this.pCont.appendChild(this.pWnd);

		if (this.oPar && typeof this.oPar.OnBeforeCreate == 'function')
			this.oPar = this.oPar.OnBeforeCreate(this.pLEditor, this.oPar);

		if (this.oPar.disableOnCodeView)
			BX.addCustomEvent(this.pLEditor, "OnChangeView", BX.proxy(this.OnChangeView, this));
	},

	Create: function ()
	{
		var _this = this;
		this.pColCont = document.body.appendChild(BX.create("DIV", {props: {className: "lhe-colpick-cont"}, style: {zIndex: this.zIndex}}));

		var
			arColors = this.pLEditor.arColors,
			row, cell, colorCell,
			tbl = BX.create("TABLE", {props: {className: 'lha-colpic-tbl'}}),
			i, l = arColors.length;

		row = tbl.insertRow(-1);
		cell = row.insertCell(-1);
		cell.colSpan = 8;
		var defBut = cell.appendChild(BX.create("SPAN", {props: {className: 'lha-colpic-def-but'}, text: BX.message.DefaultColor}));
		defBut.onmouseover = function()
		{
			this.className = 'lha-colpic-def-but lha-colpic-def-but-over';
			colorCell.style.backgroundColor = 'transparent';
		};
		defBut.onmouseout = function(){this.className = 'lha-colpic-def-but';};
		defBut.onmousedown = function(e){_this.Select(false);}

		colorCell = row.insertCell(-1);
		colorCell.colSpan = 8;
		colorCell.className = 'lha-color-inp-cell';
		colorCell.style.backgroundColor = arColors[38];

		for(i = 0; i < l; i++)
		{
			if (Math.round(i / 16) == i / 16) // new row
				row = tbl.insertRow(-1);

			cell = row.insertCell(-1);
			cell.innerHTML = '&nbsp;';
			cell.className = 'lha-col-cell';
			cell.style.backgroundColor = arColors[i];
			cell.id = 'lhe_color_id__' + i;

			cell.onmouseover = function (e)
			{
				this.className = 'lha-col-cell lha-col-cell-over';
				colorCell.style.backgroundColor = arColors[this.id.substring('lhe_color_id__'.length)];
			};
			cell.onmouseout = function (e){this.className = 'lha-col-cell';};
			cell.onmousedown = function (e)
			{
				var k = this.id.substring('lhe_color_id__'.length);
				_this.Select(arColors[k]);
			};
		}

		this.pColCont.appendChild(tbl);
		this.bCreated = true;
	},

	OnChangeView: function()
	{
		if (this.oPar.disableOnCodeView)
			this.Disable(this.pLEditor.sEditorMode == 'code');
	},

	Disable: function (bFlag)
	{
		if(bFlag == this.disabled)
			return false;
		this.disabled = bFlag;
		if(bFlag)
			BX.addClass(this.pWnd, 'lhe-button-disabled');
		else
			BX.removeClass(this.pWnd, 'lhe-button-disabled');
	},

	OnClick: function (e, pEl)
	{
		this.pLEditor.SaveSelectionRange();

		if(this.disabled)
			return false;

		if (!this.bCreated)
			this.Create();

		if (this.bOpened)
			return this.Close();

		this.Open();
	},

	Open: function ()
	{
		var
			pOverlay = this.pLEditor.oTransOverlay.Show(),
			pos = BX.align(BX.pos(this.pWnd), 325, 155),
			_this = this;

		this.pLEditor.oPrevRange = this.pLEditor.GetSelectionRange();

		BX.bind(window, "keypress", BX.proxy(this.OnKeyPress, this));
		pOverlay.onclick = function(){_this.Close()};

		this.pColCont.style.display = 'block';
		this.pColCont.style.top = pos.top + 'px';
		this.pColCont.style.left = pos.left + 'px';
		this.bOpened = true;

		setTimeout(function()
		{
			BX.bind(document, 'mousedown', BX.proxy(_this.CheckClose, _this));
		},100);
	},

	Close: function ()
	{
		this.pColCont.style.display = 'none';
		this.pLEditor.oTransOverlay.Hide();
		BX.unbind(window, "keypress", BX.proxy(this.OnKeyPress, this));
		BX.unbind(document, 'mousedown', BX.proxy(this.CheckClose, this));

		this.bOpened = false;
	},

	CheckClose: function(e)
	{
		if (!this.bOpened)
			return BX.unbind(document, 'mousedown', BX.proxy(this.CheckClose, this));

		var pEl;
		if (e.target)
			pEl = e.target;
		else if (e.srcElement)
			pEl = e.srcElement;
		if (pEl.nodeType == 3)
			pEl = pEl.parentNode;

		if (!BX.findParent(pEl, {className: 'lhe-colpick-cont'}))
			this.Close();
	},

	OnMouseOver: function (e, pEl)
	{
		if(this.disabled)
			return;
		pEl.className = 'lhe-button lhe-button-over';
	},

	OnMouseOut: function (e, pEl)
	{
		if(this.disabled)
			return;
		pEl.className = 'lhe-button lhe-button-normal';
	},

	OnKeyPress: function(e)
	{
		if(!e) e = window.event
		if(e.keyCode == 27)
			this.Close();
	},

	Select: function (color)
	{
		this.pLEditor.RestoreSelectionRange();

		if (this.oPar.OnSelect && typeof this.oPar.OnSelect == 'function')
			this.oPar.OnSelect(color, this);

		this.Close();
	}
};

// CONTEXT MENU FOR EDITING AREA
function LHEContextMenu(arParams, pLEditor)
{
	this.zIndex = arParams.zIndex;
	this.pLEditor = pLEditor;
	this.Create();
}

LHEContextMenu.prototype = {
	Create: function()
	{
		this.pref = 'LHE_CM_' + this.pLEditor.id.toUpperCase()+'_';
		this.oDiv = document.body.appendChild(BX.create('DIV', {props: {className: 'lhe-cm', id: this.pref + '_cont'}, style: {zIndex: this.zIndex}, html: '<table><tr><td class="lhepopup"><table id="' + this.pref + '_cont_items"><tr><td></td></tr></table></td></tr></table>'}));

		// Part of logic of JCFloatDiv.Show()   Prevent bogus rerendering window in IE... And SpeedUp first context menu calling
		document.body.appendChild(BX.create('IFRAME', {props: {id: this.pref + '_frame', src: "javascript:void(0)"}, style: {position: 'absolute', zIndex: this.zIndex - 5, left: '-1000px', top: '-1000px', visibility: 'hidden'}}));
		this.menu = new PopupMenu(this.pref + '_cont');
	},

	Show: function(arParams)
	{
		if (!arParams.pElement || !this.FetchAndBuildItems(arParams.pElement))
			return;

		try{this.pLEditor.SelectElement(arParams.pElement);}catch(e){}
		this.pLEditor.oPrevRange = this.pLEditor.GetSelectionRange();
		this.oDiv.style.width = parseInt(this.oDiv.firstChild.offsetWidth) + 'px';

		var
			_this = this,
			w = parseInt(this.oDiv.offsetWidth),
			h = parseInt(this.oDiv.offsetHeight),
			pOverlay = this.pLEditor.oTransOverlay.Show();
		pOverlay.onclick = function(){_this.Close()};
		BX.bind(window, "keypress", BX.proxy(this.OnKeyPress, this));

		arParams.oPos.right = arParams.oPos.left + w;
		arParams.oPos.bottom = arParams.oPos.top;

		this.menu.PopupShow(arParams.oPos);
	},

	Close: function()
	{
		this.menu.PopupHide();
		this.pLEditor.oTransOverlay.Hide();
		BX.unbind(window, "keypress", BX.proxy(this.OnKeyPress, this));
	},

	FetchAndBuildItems: function(pElement)
	{
		var pElementTemp,
			i, k,
			arMenuItems = [],
			arUsed = {},
			strPath, strPath1,
			__bxtagname = false;
		this.arSelectedElement = {};

		//Adding elements
		while(pElement && (pElementTemp = pElement.parentNode) != null)
		{
			if(pElementTemp.nodeType == 1 && pElement.tagName && (strPath = pElement.tagName.toUpperCase()) && strPath != 'TBODY' && !arUsed[strPath])
			{
				strPath1 = strPath;
				if (pElement.getAttribute && (__bxtagname = pElement.getAttribute('__bxtagname')))
					strPath1 = __bxtagname.toUpperCase();

				arUsed[strPath] = pElement;
				if(LHEContMenu[strPath1])
				{
					this.arSelectedElement[strPath1] = pElement;
					if (arMenuItems.length > 0)
						arMenuItems.push('separator');
					for(i = 0, k = LHEContMenu[strPath1].length; i < k; i++)
						arMenuItems.push(LHEContMenu[strPath1][i]);
				}
			}
			else
			{
				pElement = pElementTemp;
				continue;
			}
		}

		if (arMenuItems.length == 0)
			return false;

		//Cleaning menu
		var contTbl = document.getElementById(this.pref + '_cont_items');
		while(contTbl.rows.length>0)
			contTbl.deleteRow(0);
		return this.BuildItems(arMenuItems, contTbl);
	},

	BuildItems: function(arMenuItems, contTbl, parentName)
	{
		var n = arMenuItems.length;
		var _this = this;
		var arSubMenu = {};
		this.subgroup_parent_id = '';
		this.current_opened_id = '';

		var _hide = function()
		{
			var cs = document.getElementById("__curent_submenu");
			if (!cs)
				return;
			_over(cs);
			_this.current_opened_id = '';
			_this.subgroup_parent_id = '';
			cs.style.display = "none";
			cs.id = "";
		};

		var _over = function(cs)
		{
			if (!cs)
				return;
			var t = cs.parentNode.nextSibling;
			t.parentNode.className = '';
		};

		var _refresh = function() {setTimeout(function() {_this.current_opened_id = '';_this.subgroup_parent_id = '';}, 400);}
		var i, row, cell, el_params, _atr, _innerHTML, oItem;

		//Creation menu elements
		for(var i = 0; i < n; i++)
		{
			oItem = arMenuItems[i];
			row = contTbl.insertRow(-1);
			cell = row.insertCell(-1);
			if(oItem == 'separator')
			{
				cell.innerHTML = '<div class="popupseparator"></div>';
			}
			else
			{
				if (oItem.isgroup)
				{
					var c = BX.browser.IsIE() ? 'arrow_ie' : 'arrow';
					cell.innerHTML =
						'<div id="_oSubMenuDiv_' + oItem.id + '" style="position: relative;"></div>'+
							'<table cellpadding="0" cellspacing="0" class="popupitem" id="'+oItem.id+'">'+
							'	<tr>'+
							'		<td class="gutter"></td>'+
							'		<td class="item">' + oItem.name + '</td>' +
							'		<td class="'+c+'"></td>'+
							'	</tr>'+
							'</table>';
					var oTable = cell.childNodes[1];
					var _LOCAL_CACHE = {};
					arSubMenu[oItem.id] = oItem.elements;

					oTable.onmouseover = function(e)
					{
						var pTbl = this;
						pTbl.className = 'popupitem popupitemover';
						_over(document.getElementById("__curent_submenu"));
						setTimeout(function()
						{
							//pTbl.parentNode.className = 'popup_open_cell';
							if (_this.current_opened_id && _this.current_opened_id == _this.subgroup_parent_id)
							{
								_refresh();
								return;
							}
							if (pTbl.className == 'popupitem')
								return;
							_hide();
							_this.current_opened_id = pTbl.id;

							var _oSubMenuDiv = document.getElementById("_oSubMenuDiv_" + pTbl.id);
							var left = parseInt(oTable.offsetWidth) + 1 + 'px';
							var oSubMenuDiv = BX.create('DIV', {props: {className : 'popupmenu'}, style: {position: 'absolute', zIndex: 1500, left: left, top: '-1px'}});

							_oSubMenuDiv.appendChild(oSubMenuDiv);
							oSubMenuDiv.onmouseover = function(){pTbl.parentNode.className = 'popup_open_cell';};

							var contTbl = oSubMenuDiv.appendChild(BX.create('TABLE', {props: {cellPadding:0, cellSpacing:0}}));
							_this.BuildItems(arSubMenu[pTbl.id], contTbl, pTbl.id);

							oSubMenuDiv.style.display = "block";
							oSubMenuDiv.id = "__curent_submenu";
						}, 400);
					};
					oTable.onmouseout = function(e){this.className = 'popupitem';};
					continue;
				}

				_innerHTML =
					'<table class="popupitem" id="lhe_cm__' + oItem.id + '"><tr>' +
						'	<td class="gutter"><div class="lhe-button" id="lhe_btn_' + oItem.id.toLowerCase()+'"></div></td>' +
						'	<td class="item">' + (oItem.name_edit || oItem.name) + '</td>' +
						'</tr></table>';
				cell.innerHTML = _innerHTML;

				var oTable = cell.firstChild;
				oTable.onmouseover = function(e){this.className='popupitem popupitemover';}
				oTable.onmouseout = function(e){this.className = 'popupitem';};
				oTable.onmousedown = function(e){_this.OnClick(this);};
			}
		}

		this.oDiv.style.width = contTbl.parentNode.offsetWidth;
		return true;
	},

	OnClick: function(pEl)
	{
		var oItem = LHEButtons[pEl.id.substring('lhe_cm__'.length)];
		if(!oItem || oItem.disabled)
			return false;
		this.pLEditor.RestoreSelectionRange();

		var res = false;

		if(oItem.handler)
			res = oItem.handler(this) !== false;

		if(!res && oItem.cmd)
		{
			this.pLEditor.executeCommand(oItem.cmd);
			this.pLEditor.SetFocus();
		}

		this.Close();
	},

	OnKeyPress: function(e)
	{
		if(!e) e = window.event

		if(e.keyCode == 27)
			this.Close();
	}
}
/* End */
;
; /* Start:"a:4:{s:4:"full";s:68:"/bitrix/js/fileman/light_editor/le_toolbarbuttons.js?154412741243001";s:6:"source";s:52:"/bitrix/js/fileman/light_editor/le_toolbarbuttons.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
if (!window.LHEButtons)
	LHEButtons = {};

LHEButtons['Source'] = {
	id : 'Source',
	width: 44,
	name : BX.message.Source,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		if (pLEditor.bBBCode && !pLEditor.arConfig.bConvertContentFromBBCodes)
		{
			pBut.id = 'SourceBB';
			pBut.name = pBut.title = BX.message.BBSource;
		}
		pBut.title += ": " + BX.message.Off;
		return pBut;
	},
	handler : function(pBut)
	{
		var bHtml = pBut.pLEditor.sEditorMode == 'html';
		pBut.pWnd.title = pBut.oBut.name + ": " + (bHtml ? BX.message.On : BX.message.Off);
		pBut.pLEditor.SetView(bHtml ? 'code' : 'html');
		pBut.Check(bHtml);
	}
};

// BASE
LHEButtons['Anchor'] = {
	id: 'Anchor',
	name: BX.message.Anchor,
	bBBHide: true,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		if (pLEditor.bBBCode)
			return false;
		return pBut;
	},
	handler: function(pBut)
	{
		pBut.pLEditor.OpenDialog({ id: 'Anchor'});
	},
	parser:
	{
		name: "anchor",
		obj: {
			Parse: function(sName, sContent, pLEditor)
			{
				return sContent.replace(
					/<a(\s[\s\S]*?)(?:>\s*?<\/a)?(?:\/?)?>/ig,
					function(sContent)
					{
						if(sContent.toLowerCase().indexOf("href") > 0)
							return sContent;

						var id = pLEditor.SetBxTag(false, {tag: "anchor", params: {value : sContent}});
						return '<img id="' + id + '" src="' + pLEditor.oneGif + '" class="bxed-anchor" />';
					}
				);
			},
			UnParse: false
		}
	}
};

LHEButtons['CreateLink'] = {
	id : 'CreateLink',
	name : BX.message.CreateLink,
	name_edit : BX.message.EditLink,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	handler : function (pBut)
	{
		var p = (pBut.arSelectedElement && pBut.arSelectedElement['A']) ? pBut.arSelectedElement['A'] : pBut.pLEditor.GetSelectionObject();
		pBut.pLEditor.OpenDialog({id : 'Link', obj: p, bCM: !!pBut.menu});
	},
	parser: {
		name: "a",
		obj: {
			Parse: function(sName, sContent, pLEditor)
			{
				// Link
				return sContent.replace(
					/(<noindex>)*?<a([\s\S]*?(?:.*?[^\?]{1})??)(>[\s\S]*?<\/a>)(<\/noindex>)*/ig,
					function(str, s0, s1, s2, s3)
					{
						var arParams = pLEditor.GetAttributesList(s1), i , val, res = "", bPhp = false;
						if (s0 && s3 && s0.toLowerCase().indexOf('noindex') != -1 && s3.toLowerCase().indexOf('noindex') != -1)
						{
							arParams.noindex = true;
							arParams.rel = "nofollow";
						}

						res = "<a id=\"" + pLEditor.SetBxTag(false, {tag: 'a', params: arParams}) + "\" ";
						for (i in arParams)
						{
							if (typeof arParams[i] == 'string' && i != 'id' && i != 'noindex')
							{
								res += i + '="' + BX.util.htmlspecialchars(arParams[i]) + '" ';
							}
						}
						res += s2;
						return res;
					}
				);
			},
			UnParse: function(bxTag, pNode, pLEditor)
			{
				if (!bxTag.params)
					return '';

				var i, res = '<a ';

				// Only for BBCodes
				if (pLEditor.bBBCode)
				{
					var innerHtml = "";
					for(i = 0; i < pNode.arNodes.length; i++)
						innerHtml += pLEditor._RecursiveGetHTML(pNode.arNodes[i]);

					if (BX.util.trim(innerHtml) == BX.util.trim(bxTag.params.href))
						res = "[url]" + bxTag.params.href + "[/url]";
					else
						res = "[url=" + bxTag.params.href + "]" + innerHtml + "[/url]";

					return res;
				}

				bxTag.params['class'] = pNode.arAttributes['class'] ||'';
				for (i in bxTag.params)
					if (bxTag.params[i] && i != 'noindex')
						res += i + '="' + BX.util.htmlspecialchars(bxTag.params[i]) + '" ';

				res += '>';

				for(i = 0; i < pNode.arNodes.length; i++)
					res += pLEditor._RecursiveGetHTML(pNode.arNodes[i]);

				res += '</a>';

				if (bxTag.params.noindex)
					res = '<noindex>' + res + '</noindex>';

				return res;
			}
		}
	}
};

LHEButtons['DeleteLink'] = {
	id : 'DeleteLink',
	name : BX.message.DeleteLink,
	cmd : 'Unlink',
	disableOnCodeView: true,
	handler : function(pBut)
	{
		var p = (pBut.arSelectedElement && pBut.arSelectedElement['A']) ? pBut.arSelectedElement['A'] : pBut.pLEditor.GetSelectionObject();
		if(p && p.tagName != 'A')
			p = BX.findParent(pBut.pLEditor.GetSelectionObject(), {tagName: 'A'});

		if (BX.browser.IsIE() && !p)
		{
			var oRange = pBut.pLEditor.GetSelectionRange();
			if (pBut.pLEditor.GetSelectedText(oRange) == '')
			{
				pBut.pLEditor.InsertHTML('<img id="bx_lhe_temp_bogus_node" src="' + pBut.pLEditor.oneGif + '" _moz_editor_bogus_node="on" style="border: 0px !important;"/>');
				var bogusImg = pBut.pLEditor.pEditorDocument.getElementById('bx_lhe_temp_bogus_node');
				if (bogusImg)
				{
					p = BX.findParent(bogusImg, {tagName: 'A'});
					bogusImg.parentNode.removeChild(bogusImg);
				}
			}
		}

		if (p)
		{
			if (!BX.browser.IsIE())
				pBut.pLEditor.SelectElement(p);
			pBut.pLEditor.executeCommand('Unlink');
		}
	}
};

LHEButtons['Image'] = {
	id : 'Image',
	name : BX.message.Image,
	name_edit : BX.message.EditImage,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	handler : function (pBut)
	{
		var p = (pBut.arSelectedElement && pBut.arSelectedElement['IMG']) ? pBut.arSelectedElement['IMG'] : pBut.pLEditor.GetSelectionObject();
		if (!p || p.tagName != 'IMG')
			p = false;
		pBut.pLEditor.OpenDialog({id : 'Image', obj: p});
	},
	parser: {
		name: "img",
		obj: {
			Parse: function(sName, sContent, pLEditor)
			{
				// Image
				return sContent.replace(
					/<img([\s\S]*?(?:.*?[^\?]{1})??)>/ig,
					function(str, s1)
					{
						var arParams = pLEditor.GetAttributesList(s1), i , val, res = "", bPhp = false;
						if (arParams && arParams.id)
						{
							var oTag = pLEditor.GetBxTag(arParams.id);
							if (oTag.tag)
								return str;
						}

						res = "<img id=\"" + pLEditor.SetBxTag(false, {tag: 'img', params: arParams}) + "\" ";
						for (i in arParams)
						{
							if (typeof arParams[i] == 'string' && i != 'id')
								res += i + '="' + BX.util.htmlspecialchars(arParams[i]) + '" ';
						}
						res += " />";
						return res;
					}
				);
			},
			UnParse: function(bxTag, pNode, pLEditor)
			{
				if (!bxTag.params)
					return '';

				// width, height
				var
					w = parseInt(pNode.arStyle.width) || parseInt(pNode.arAttributes.width),
					h = parseInt(pNode.arStyle.height) || parseInt(pNode.arAttributes.height);

				if (pLEditor.bBBCode)
				{
					var strSize = (w && h && pLEditor.bBBParseImageSize) ? ' WIDTH=' + w + ' HEIGHT=' + h : '';
					return res = "[IMG" + strSize + "]" + bxTag.params.src + "[/IMG]";
				}

				if (w && !isNaN(w))
					bxTag.params.width = w;
				if (h && !isNaN(h))
					bxTag.params.height = h;

				bxTag.params['class'] = pNode.arAttributes['class'] ||'';

				var i, res = '<img ';
				for (i in bxTag.params)
					if (bxTag.params[i])
						res += i + '="' + BX.util.htmlspecialchars(bxTag.params[i]) + '" ';

				res += ' />';

				return res;
			}
		}
	}
};

// LHEButtons['SpecialChar'] = {
	// id : 'SpecialChar',
	// name : BX.message.SpecialChar,
	// handler : function (pBut) {pBut.pLEditor.OpenDialog({id : 'SpecialChar'});}
// };

LHEButtons['Bold'] =
{
	id : 'Bold',
	name : BX.message.Bold + " (Ctrl + B)",
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	cmd : 'Bold',
	bbHandler: function(pBut)
	{
		pBut.pLEditor.FormatBB({tag: 'B', pBut: pBut});
	}
};

LHEButtons['Italic'] =
{
	id : 'Italic',
	name : BX.message.Italic + " (Ctrl + I)",
	cmd : 'Italic',
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	bbHandler: function(pBut)
	{
		pBut.pLEditor.FormatBB({tag: 'I', pBut: pBut});
	}
};

LHEButtons['Underline'] =
{
	id : 'Underline',
	name : BX.message.Underline + " (Ctrl + U)",
	cmd : 'Underline',
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	bbHandler: function(pBut)
	{
		pBut.pLEditor.FormatBB({tag: 'U', pBut: pBut});
	}
};
LHEButtons['RemoveFormat'] =
{
	id : 'RemoveFormat',
	name : BX.message.RemoveFormat,
	//cmd : 'RemoveFormat',
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	handler : function (pBut)
	{
		pBut.pLEditor.executeCommand('RemoveFormat');

		var
			pElement = pBut.pLEditor.GetSelectionObject(),
			i, arNodes = [];

		if (pElement)
		{
			var arNodes = BX.findChildren(pElement, {tagName: 'del'}, true);
			if (!arNodes || !arNodes.length)
				arNodes = [];

			var pPar = BX.findParent(pElement, {tagName: 'del'});
			if (pPar)
				arNodes.push(pPar);

			if (pElement.nodeName && pElement.nodeName.toLowerCase() == 'del')
				arNodes.push(pElement);
		}

		if (arNodes && arNodes.length > 0)
		{
			for (i = 0; i < arNodes.length; i++)
			{
				arNodes[i].style.textDecoration = "";
				pBut.pLEditor.RidOfNode(arNodes[i], true);
			}
		}
	},
	bbHandler: function(pBut)
	{
		pBut.pLEditor.RemoveFormatBB();
	}
};

LHEButtons['Strike'] = {
	id : 'Strike',
	name : BX.message.Strike,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	handler : function (pBut)
	{
		var
			pElement = pBut.pLEditor.GetSelectionObject(),
			arNodes = [];

		if (pElement && pElement.nodeName)
		{
			if (pElement.nodeName.toLowerCase() == 'body')
			{
				// Body ?
			}
			else
			{
				var arNodes = BX.findChildren(pElement, {tagName: 'del'}, true);
				if (!arNodes || !arNodes.length)
					arNodes = [];

				var pPar = BX.findParent(pElement, {tagName: 'del'});
				if (pPar)
					arNodes.push(pPar);

				if (pElement.nodeName.toLowerCase() == 'del')
					arNodes.push(pElement);
			}
		}

		if (arNodes && arNodes.length > 0)
		{
			for (var i = 0; i < arNodes.length; i++)
			{
				arNodes[i].style.textDecoration = "";
				pBut.pLEditor.RidOfNode(arNodes[i], true);
			}
			pBut.Check(false);
		}
		else
		{
			pBut.pLEditor.WrapSelectionWith("del");
			//this.pMainObj.OnEvent("OnSelectionChange");
		}
	},
	OnSelectionChange: function () // ????
	{
		var
			pElement = this.pMainObj.GetSelectedNode(true),
			bFind = false, st;

		while(!bFind)
		{
			if (!pElement)
				break;

			if (pElement.nodeType == 1 && (BX.style(pElement, 'text-decoration', null) == "line-through" || pElement.nodeName.toLowerCase() == 'strike'))
			{
				bFind = true;
				break;
			}
			else
				pElement = pElement.parentNode;
		}

		pBut.Check(bFind);
	},
	bbHandler: function(pBut)
	{
		pBut.pLEditor.FormatBB({tag: 'S', pBut: pBut});
	}
};

LHEButtons['Quote'] = {
	id : 'Quote',
	name : BX.message.Quote + " (Ctrl + Q)",
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;

		pLEditor.systemCSS += "blockquote.bx-quote {border: 1px solid #C0C0C0!important; background: #fff4ca url(" + pLEditor.imagePath + "font_quote.gif) left top no-repeat; padding: 4px 4px 4px 24px; color: #373737!important;}\n";
		return pBut;
	},
	handler: function(pBut)
	{
		if (pBut.pLEditor.arConfig.bQuoteFromSelection)
		{
			var res;
			if (document.selection && document.selection.createRange)
				res = document.selection.createRange().text;
			else if (window.getSelection)
				res = window.getSelection().toString();

			res = BX.util.htmlspecialchars(res);
			res = res.replace(/\n/g, '<br />');

			var strId = '';
			if (!pBut.pLEditor.bBBCode)
				strId = " id\"=" + pBut.pLEditor.SetBxTag(false, {tag: "quote"}) + "\"";

			if (res && res.length > 0)
				return pBut.pLEditor.InsertHTML('<blockquote class="bx-quote"' + strId + ">" + res + "</blockquote> <br/>");
		}

		// Catch all blockquotes
		var
			arBQ = pBut.pLEditor.pEditorDocument.getElementsByTagName("blockquote"),
			i, l = arBQ.length;

		// Set specific name to nodes
		for (i = 0; i < l; i++)
			arBQ[i].name = "__bx_temp_quote";

		// Create new qoute
		pBut.pLEditor.executeCommand('Indent');

		// Search for created node and try to adjust new style end id
		setTimeout(function(){
			var
				arNewBQ = pBut.pLEditor.pEditorDocument.getElementsByTagName("blockquote"),
				i, l = arNewBQ.length;

			for (i = 0; i < l; i++)
			{
				if (arBQ[i].name == "__bx_temp_quote")
				{
					arBQ[i].removeAttribute("name");
				}
				else
				{
					arBQ[i].className = "bx-quote";
					arBQ[i].id = pBut.pLEditor.SetBxTag(false, {tag: "quote"});
				}
				try{arBQ[i].setAttribute("style", '');}catch(e){}

				if (!arBQ[i].nextSibling)
					arBQ[i].parentNode.appendChild(BX.create("BR", {}, pBut.pLEditor.pEditorDocument));

				if (arBQ[i].previousSibling && arBQ[i].previousSibling.nodeName && arBQ[i].previousSibling.nodeName.toLowerCase() == 'blockquote')
					arBQ[i].parentNode.insertBefore(BX.create("BR", {}, pBut.pLEditor.pEditorDocument), arBQ[i]);
			}
		}, 10);
	},
	bbHandler: function(pBut)
	{
		if (pBut.pLEditor.arConfig.bQuoteFromSelection)
		{
			if (document.selection && document.selection.createRange)
				res = document.selection.createRange().text;
			else if (window.getSelection)
				res = window.getSelection().toString();

			if (res && res.length > 0)
				return pBut.pLEditor.WrapWith('[QUOTE]', '[/QUOTE]', res);
		}

		pBut.pLEditor.FormatBB({tag: 'QUOTE', pBut: pBut});
	},
	parser: {
		name: 'quote',
		obj: {
			Parse: function(sName, sContent, pLEditor)
			{
				sContent = sContent.replace(/\[quote\]/ig, '<blockquote class="bx-quote" id="' + pLEditor.SetBxTag(false, {tag: "quote"}) + '">');
				// Add additional <br> after "quote" in the end of the text
				sContent = sContent.replace(/\[\/quote\]$/ig, '</blockquote><br/>');
				// Add additional <br> between two quotes
				sContent = sContent.replace(/\[\/quote\](<blockquote)/ig, "</blockquote><br/>$1");
				sContent = sContent.replace(/\[\/quote\]/ig, '</blockquote>');

				return sContent;
			},
			UnParse: function(bxTag, pNode, pLEditor)
			{
				if (bxTag.tag == 'quote')
				{
					var i, l = pNode.arNodes.length, res = "[QUOTE]";
					for (i = 0; i < l; i++)
						res += pLEditor._RecursiveGetHTML(pNode.arNodes[i]);
					res += "[/QUOTE]";
					return res;
				}
				return "";
			}
		}
	}
};

LHEButtons['Code'] = {
	id : 'Code',
	name : BX.message.InsertCode,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;

		pLEditor.systemCSS += ".lhe-code{border: 1px solid #C0C0C0!important; white-space: pre!important; padding: 5px!important; display: block;}\n .lhe-code *, .lhe-code{background: #eaeaea!important; color: #000080!important; font-weight: normal!important; line-height: normal!important; text-decoration: none!important; font-size: 11px!important;font-family:Verdana!important;}";
		return pBut;
	},
	handler : function(pBut)
	{
		var arProps = {className: "lhe-code", title: BX.message.CodeDel};
		if (!pBut.pLEditor.bBBCode)
			arProps.id = pBut.pLEditor.SetBxTag(false, {tag: "code"});

		var arEl =  pBut.pLEditor.WrapSelectionWith("pre", {props: arProps});
		if (arEl && arEl.length > 0)
		{
			var
				firstEl = arEl[0],
				lastEl = arEl[arEl.length - 1];

			if (firstEl)
				firstEl.parentNode.insertBefore(BX.create("BR", {}, pBut.pLEditor.pEditorDocument), firstEl);

			if (lastEl && lastEl.parentNode)
			{
				var pBr = BX.create("BR", {}, pBut.pLEditor.pEditorDocument);
				if (lastEl.nextSibling)
					lastEl.parentNode.insertBefore(pBr, lastEl.nextSibling);
				else
					lastEl.parentNode.appendChild(pBr);
			}
		}
		else
		{
			var strId = '';

			if (!pBut.pLEditor.bBBCode)
				strId = "id=\"" + pBut.pLEditor.SetBxTag(false, {tag: "code"}) + "\" ";

			pBut.pLEditor.InsertHTML('<br/><pre ' + strId + 'class="lhe-code" title="' + BX.message.CodeDel + '"><br id="lhe_bogus_code_br"/> </pre> <br/>');
			setTimeout(
				function()
				{
					var br = pBut.pLEditor.pEditorDocument.getElementById('lhe_bogus_code_br');
					if (br)
						pBut.pLEditor.SelectElement(br);
				},
				100
			);
		}
	},
	bbHandler: function(pBut)
	{
		pBut.pLEditor.FormatBB({tag: 'CODE', pBut: pBut});
	},
	parser: {
		name: 'code',
		obj: {
			UnParse: function(bxTag, pNode, pLEditor)
			{
				if (bxTag.tag == 'code')
					return pLEditor.UnParseNodeBB(pNode);
				return "";
			}
		}
	}
};

LHEButtons['InsertCut'] =
{
	id : 'InsertCut',
	name : BX.message.InsertCut,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;

		pLEditor.systemCSS += "img.bxed-cut {margin: 2px; width: 100%; height: 12px; background: transparent url(" + pLEditor.imagePath + "cut.gif) left top repeat-x;}\n";
		return pBut;
	},
	handler: function(pBut)
	{
		pBut.pLEditor.InsertHTML(pBut.pLEditor.GetCutHTML());
	},
	bbHandler: function(pBut)
	{
		// Todo: check if already exist
		pBut.pLEditor.WrapWith('', '', '[CUT]');
	},
	parser: {
		name: 'cut',
		obj: {
			Parse: function(sName, sContent, pLEditor)
			{
				return sContent.replace(/\[CUT\]/ig, pLEditor.GetCutHTML());
			},
			UnParse: function(bxTag, pNode, pLEditor)
			{
				if (bxTag.tag == 'cut')
					return "[CUT]";
				return "";
			}
		}
	}
};
LHEButtons['Translit'] = {id : 'Translit', name : BX.message.Translit, cmd : 'none'};

// Grouped buttons
LHEButtons['JustifyLeft'] =
LHEButtons['Justify'] =
{
	id : 'JustifyLeft_L',
	name : BX.message.ImgAlign + ": " + BX.message.JustifyLeft,
	type: 'List',
	OnAfterCreate: function(pLEditor, pList)
	{
		pList.arJustifyInd = {justifyleft: 0, justifycenter: 1, justifyright: 2, justifyfull: 3};
		pList.arJustify = [
			{id : 'JustifyLeft', name : BX.message.JustifyLeft, cmd : 'JustifyLeft', bb: 'LEFT'},
			{id : 'JustifyCenter', name : BX.message.JustifyCenter, cmd : 'JustifyCenter', bb: 'CENTER'},
			{id : 'JustifyRight', name : BX.message.JustifyRight, cmd : 'JustifyRight', bb: 'RIGHT'},
			{id : 'JustifyFull', name : BX.message.JustifyFull, cmd : 'JustifyFull', bb: 'JUSTIFY'}
		];

		var l = pList.arJustify.length, i;

		// Create popup
		BX.addClass(pList.pValuesCont, "lhe-justify-list");
		pList.pPopupTbl = pList.pValuesCont.appendChild(BX.create("TABLE", {props: {className: 'lhe-smiles-cont lhe-justify-cont '}}));

		for (i = 0; i < l; i++)
		{
			pList.arJustify[i].pIcon = pList.pPopupTbl.insertRow(-1).insertCell(-1).appendChild(BX.create("IMG", {props: {
				id: "lhe_btn_" + pList.arJustify[i].id.toLowerCase(),
				src: pList.pLEditor.oneGif,
				className: "lhe-button",
				title: pList.arJustify[i].name
			}}));

			pList.arJustify[i].pIcon.onmouseover = function(){BX.addClass(this, "lhe-tlbr-just-over");};
			pList.arJustify[i].pIcon.onmouseout = function(){BX.removeClass(this, "lhe-tlbr-just-over");};
			pList.arJustify[i].pIcon.onmousedown = function()
			{
				if(pList.pLEditor.sEditorMode != 'code') // Exec command for WYSIWYG
					pList.pLEditor.SelectRange(pList.pLEditor.oPrevRange);

				var ind = pList.arJustifyInd[this.id.substr("lhe_btn_".length)];
				pList.oBut.SetJustify(pList.arJustify[ind], pList);
			};
		}
	},
	SetJustify: function(Justify, pList)
	{
		// 1. Set icon
		pList.pWnd.id = "lhe_btn_" + Justify.id.toLowerCase() + "_l";
		pList.pWnd.title = BX.message.ImgAlign + ": " + Justify.name;

		// 2. Set selected
		pList.selected = Justify;

		// Exec command for BB codes
		if (pList.pLEditor.sEditorMode == 'code' && pList.pLEditor.bBBCode)
			pList.pLEditor.FormatBB({tag: Justify.bb});
		else if(pList.pLEditor.sEditorMode != 'code') // Exec command for WYSIWYG
		{
			pList.pLEditor.executeCommand(Justify.cmd);
			if (pList.pLEditor.bBBCode)
			{
				setTimeout(function()
				{
					var
						i, node,
						arNodes = [],
						arDiv = pList.pLEditor.pEditorDocument.getElementsByTagName("DIV"),
						arP = pList.pLEditor.pEditorDocument.getElementsByTagName("P");

					for(i = 0; i < arDiv.length; i++)
						arNodes.push(arDiv[i]);
					for(i = 0; i < arP.length; i++)
						arNodes.push(arP[i]);

					for(i = 0; i < arNodes.length; i++)
					{
						node = arNodes[i];
						if (node && node.nodeType == 1 && node.childNodes.length > 0 && node.getAttribute("align"))
							node.innerHTML = node.innerHTML.replace(/<span[^>]*?text-align[^>]*?>((?:\s|\S)*?)<\/span>/ig, "$1");
					}
				}, 100);
			}
		}

		// Close
		if (pList.bOpened)
			pList.Close();
	},
	parser: {
		name: 'align',
		obj:{
			Parse: function(sName, sContent, pLEditor)
			{
				if (BX.browser.IsIE())
					sContent = sContent.replace(/<span[^>]*?text\-align\:((?:\s|\S)*?);display\:block;[^>]*?>((?:\s|\S)*?)<\/span>/ig, "<p align=\"$1\">$2</p>");

				if (!pLEditor.bBBCode)
					return sContent;

				var align, key, arJus = ['left', 'right', 'center', 'justify'];

				for(key in arJus)
				{
					align = arJus[key];
					sContent = sContent.replace(new RegExp(BX.util.preg_quote("\[" + align + "\]"), "ig"), '<div align="' + align + '" id="' + pLEditor.SetBxTag(false, {tag: 'align'}) + '">');
					sContent = sContent.replace(new RegExp(BX.util.preg_quote("\[\/" + align + "\]"), "ig"), '</div>');
				}
				return sContent;
			},
			UnParse: function(bxTag, pNode, pLEditor)
			{
				// Called only for BB codes
				if (bxTag.tag == 'align' && (pNode.arAttributes.align || pNode.arStyle.textAlign))
				{
					var align = pNode.arStyle.textAlign || pNode.arAttributes.align;
					align = align.toUpperCase();
					var i, l = pNode.arNodes.length, res = "[" + align + "]";
					for (i = 0; i < l; i++)
						res += pLEditor._RecursiveGetHTML(pNode.arNodes[i]);
					res += "[/" + align + "]";
					return res;
				}
				return "";
			}
		}
	}
};

LHEButtons['InsertOrderedList'] =
{
	id : 'InsertOrderedList',
	name : BX.message.OrderedList,
	cmd : 'InsertOrderedList',
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	bbHandler: function(pBut)
	{
		pBut.pLEditor.OpenDialog({id: 'List', obj: false, bOrdered: true, bEnterClose: false});
	}
};
LHEButtons['InsertUnorderedList'] =
{
	id : 'InsertUnorderedList',
	name : BX.message.UnorderedList,
	cmd : 'InsertUnorderedList',
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	bbHandler: function(pBut)
	{
		pBut.pLEditor.OpenDialog({ id: 'List', obj: false, bOrdered: false, bEnterClose: false});
	}
};

LHEButtons['Outdent'] = {id : 'Outdent', name : BX.message.Outdent, cmd : 'Outdent', bBBHide: true};
LHEButtons['Indent'] = {id : 'Indent', name : BX.message.Indent, cmd : 'Indent', bBBHide: true};

LHEButtons['Video'] = {
	id: 'Video',
	name: BX.message.InsertVideo,
	name_edit: BX.message.EditVideo,
	handler: function(pBut)
	{
		pBut.pLEditor.OpenDialog({ id: 'Video', obj: false});
	},
	parser:
	{
		name: "video",
		obj:
		{
			Parse: function(sName, sContent, pLEditor)
			{
				// **** Parse WMV ****
				// b1, b3 - quotes
				// b2 - id of the div
				// b4 - javascript config
				var ReplaceWMV = function(str, b1, b2, b3, b4)
				{
					var
						id = b2,
						JSConfig, w, h, prPath, bgimg = '';

					try {eval('JSConfig = ' + b4); } catch (e) { JSConfig = false; }
					if (!id || !JSConfig)
						return '';

					w = (parseInt(JSConfig.width) || 50) + 'px';
					h = (parseInt(JSConfig.height) || 25) + 'px';

					if (JSConfig.image)
						bgimg = 'background-image: url(' + JSConfig.image + ')!important; ';

					return '<img class="bxed-video" id="' + pLEditor.SetBxTag(false, {tag: 'video', params: {id: id, JSConfig: JSConfig}}) + '" src="' + pLEditor.oneGif + '" style="' + bgimg + ' width: ' + w + '; height: ' + h + ';" title="' + BX.message.Video + ': ' + JSConfig.file + '"/>';
				}
				sContent = sContent.replace(/<script.*?silverlight\.js.*?<\/script>\s*?<script.*?wmvplayer\.js.*?<\/script>\s*?<div.*?id\s*?=\s*?("|\')(.*?)\1.*?<\/div>\s*?<script.*?jeroenwijering\.Player\(document\.getElementById\(("|\')\2\3.*?wmvplayer\.xaml.*?({.*?})\).*?<\/script>/ig, ReplaceWMV);

				// **** Parse FLV ****
				var ReplaceFLV = function(str, attr)
				{
					attr = attr.replace(/[\r\n]+/ig, ' ');
					attr = attr.replace(/\s+/ig, ' ');
					attr = BX.util.trim(attr);
					var
						arParams = {},
						arFlashvars = {},
						w, h, id, prPath, bgimg = '';

					attr.replace(/([^\w]??)(\w+?)\s*=\s*("|\')([^\3]+?)\3/ig, function(s, b0, b1, b2, b3)
					{
						b1 = b1.toLowerCase();
						if (b1 == 'src' || b1 == 'type' || b1 == 'allowscriptaccess' || b1 == 'allowfullscreen' || b1 == 'pluginspage' || b1 == 'wmode')
							return '';
						arParams[b1] = b3; return b0;
					});

					if (!arParams.flashvars || !arParams.id)
						return str;

					arParams.flashvars += '&';
					arParams.flashvars.replace(/(\w+?)=((?:\s|\S)*?)&/ig, function(s, name, val) { arFlashvars[name] = val; return ''; });
					w = (parseInt(arParams.width) || 50) + 'px';
					h = (parseInt(arParams.height) || 25) + 'px';
					arParams.flashvars = arFlashvars;

					if (arFlashvars.image)
						bgimg = 'background-image: url(' + arFlashvars.image + ')!important; ';

					return '<img class="bxed-video" id="' + pLEditor.SetBxTag(false, {tag: 'video', params: arParams}) + '" src="' + pLEditor.oneGif + '" style="' + bgimg + ' width: ' + w + '; height: ' + h + ';" title="' + BX.message.Video + ': ' + arParams.flashvars.file + '"/>';
				}

				sContent = sContent.replace(/<embed((?:\s|\S)*?player\/mediaplayer\/player\.swf(?:\s|\S)*?)(?:>\s*?<\/embed)?(?:\/?)?>/ig, ReplaceFLV);

				return sContent;
			},
			UnParse: function(bxTag, pNode, pLEditor)
			{
				if (!bxTag.params)
					return '';

				var
					arParams = bxTag.params, i, str;

				var arVidConf = pLEditor.arConfig.videoSettings;
				if (arVidConf.maxWidth && arParams.width && parseInt(arParams.width) > parseInt(arVidConf.maxWidth))
					arParams.width = arVidConf.maxWidth;
				if (arVidConf.maxHeight && arParams.height && parseInt(arParams.height) > parseInt(arVidConf.maxHeight))
					arParams.height = arVidConf.maxHeight;

				if (arParams['flashvars']) // FLV
				{
					str = '<embed src="/bitrix/components/bitrix/player/mediaplayer/player" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" pluginspage="http:/' + '/www.macromedia.com/go/getflashplayer" ';
					str += 'id="' + arParams.id + '" ';
					if (arVidConf.WMode)
						str += 'WMode="' + arVidConf.WMode + '" ';

					for (i in arParams)
					{
						if (i == 'flashvars')
						{
							if (arVidConf.bufferLength)
								arParams[i].bufferlength = arVidConf.bufferLength;
							if (arVidConf.skin)
								arParams[i].skin = arVidConf.skin;
							if (arVidConf.logo)
								arParams[i].logo = arVidConf.logo;
							str += 'flashvars="';
							for (k in arParams[i])
								str += k + '=' + arParams[i][k] + '&';
							str = str.substring(0, str.length - 1) + '" ';
						}
						else
						{
							str += i + '="' + arParams[i] + '" ';
						}
					}
					str += '></embed>';
				}
				else // WMV
				{

					str = '<script type="text/javascript" src="/bitrix/components/bitrix/player/wmvplayer/silverlight.js" /></script>' +
				'<script type="text/javascript" src="/bitrix/components/bitrix/player/wmvplayer/wmvplayer.js"></script>' +
				'<div id="' + arParams.id + '">WMV Player</div>' +
				'<script type="text/javascript">new jeroenwijering.Player(document.getElementById("' + arParams.id + '"), "/bitrix/components/bitrix/player/wmvplayer/wmvplayer.xaml", {';

					if (arVidConf.bufferLength)
						arParams.JSConfig.bufferlength = arVidConf.bufferLength;
					if (arVidConf.logo)
						arParams.JSConfig.logo = arVidConf.logo;
					if (arVidConf.windowless)
						arParams.JSConfig.windowless = arVidConf.windowless ? true : false;

					for (i in arParams.JSConfig)
						str += i + ': "' + arParams.JSConfig[i] + '", ';
					str = str.substring(0, str.length - 2);

					str += '});</script>';
				}
				return str;
			}
		}
	}
};

LHEButtons['SmileList'] = {
	id : 'SmileList',
	name : BX.message.SmileList,
	bBBShow: true,
	type: 'List',
	OnBeforeCreate: function(pLEditor, pBut)
	{
		if (pLEditor.arConfig.arSmiles.length <= 0)
			return false;
		return pBut;
	},
	OnAfterCreate: function(pLEditor, pList)
	{
		var n = parseInt(pLEditor.arConfig.smileCountInToolbar);
		// Display some smiles just in toolbar for easy access
		if (n > 0)
		{
			var
				arSmiles = pLEditor.arConfig.arSmiles,
				i, l = arSmiles.length,
				smileTable = pList.pWnd.parentNode.appendChild(BX.create("TABLE", {props: {className: "lhe-smiles-tlbr-table"}})),
				r = smileTable.insertRow(-1),
				pImg, oSmile, pSmile, k, arImg = [];

			pList.oSmiles = {};
			for (i = 0; i < n; i++)
			{
				oSmile = arSmiles[i];
				if (typeof oSmile != 'object' || !oSmile.path || !oSmile.code)
					continue;

				k = 'smile_' + i + '_' + pLEditor.id;
				pSmile = r.insertCell(-1).appendChild(BX.create("DIV", {props: {className: 'lhe-tlbr-smile-cont', title: oSmile.name || '', id: k}}));
				pImg = pSmile.appendChild(BX.create("IMG", {props: {src: oSmile.path}}));
				pList.oSmiles[k] = oSmile;

				pSmile.onmousedown = function()
				{
					//pLEditor.oPrevRange = pLEditor.GetSelectionRange();
					pList.oBut.SetSmile(this.id, pList);
				};
				pSmile.onmouseover = function(){BX.addClass(this, "lhe-tlbr-smile-over");};
				pSmile.onmouseout = function(){BX.removeClass(this, "lhe-tlbr-smile-over");};

				arImg.push(pImg);
			}

			BX.addClass(pList.pWnd, "lhe-tlbr-smile-more");
			pList.pWnd.id = "";
			r.insertCell(-1).appendChild(pList.pWnd);
			smileTable.parentNode.style.width = (parseInt(smileTable.offsetWidth) + 16 /*left margin*/) + "px";

			var adjustSmiles = function()
			{
				var i, n = arImg.length;
				for (i = 0; i < n; i++)
				{
					arImg[i].removeAttribute('height');
					arImg[i].style.height = 'auto';
					arImg[i].style.width = 'auto';
				}

				setTimeout(function(){
					for (i = 0; i < n; i++)
					{
						var
							h = arImg[i].offsetHeight,
							w = arImg[i].offsetWidth;

						if (h > 20)
						{
							arImg[i].style.height = "20px";
							arImg[i].height = "20";
							h = 20;
						}

						arImg[i].style.marginTop = Math.round((20 - h) / 2) + "px";

						if (w > 20)
						{
							arImg[i].parentNode.style.width = arImg[i].offsetWidth + "px";
							w = 20;
						}
						arImg[i].style.marginLeft = Math.round((20 - w) / 2) + "px";
						arImg[i].style.visibility = "visible";
					}
					smileTable.parentNode.style.width = (parseInt(smileTable.offsetWidth) + 16 /*left margin*/) + "px";
				}, 10);
			};

			BX.addCustomEvent(pLEditor, 'onShow', function()
			{
				adjustSmiles();
				setTimeout(adjustSmiles, 1000);
			});
		}
	},
	OnCreate: function(pList)
	{
		var
			arSmiles = pList.pLEditor.arConfig.arSmiles,
			l = arSmiles.length, row,
		pImg, pSmile, i, oSmile, k;

		if (l <= 0)
			return;

		pList.pValuesCont.style.width = '100px';
		pList.oSmiles = {};

		var cells = Math.round(Math.sqrt(l * 4 / 3));
		var pTable = pList.pValuesCont.appendChild(BX.create("TABLE", {props: {className: 'lhe-smiles-cont'}}));
		for (i = 0; i < l; i++)
		{
			oSmile = arSmiles[i];
			if (typeof oSmile != 'object' || !oSmile.path || !oSmile.code)
				continue;

			k = 'smile_' + i + '_' + pList.pLEditor.id;
			pSmile = BX.create("DIV", {props: {className: 'lhe-smile-cont', title: oSmile.name || '', id: k}});
			pImg = pSmile.appendChild(BX.create("IMG", {props: {src: oSmile.path, className: 'lhe-smile'}}));

			pImg.onerror = function(){var d = this.parentNode; d.parentNode.removeChild(d);};

			pList.oSmiles[k] = oSmile;

			pSmile.onmousedown = function(){pList.oBut.SetSmile(this.id, pList);};
			pSmile.onmouseover = function(){this.className = 'lhe-smile-cont lhe-smile-cont-over';};
			pSmile.onmouseout = function(){this.className = 'lhe-smile-cont';};

			if (i % cells == 0)
				row = pTable.insertRow(-1);
			row.insertCell(-1).appendChild(pSmile);
		}

		while (row.cells.length < cells)
			row.insertCell(-1);

		if (pTable.offsetWidth > 0)
		{
			pList.pValuesCont.style.width = pTable.offsetWidth + 2 + "px";
		}
		else
		{
			var count = 0;
			// First attempt to adjust smiles
			var ai = setInterval(function(){
				if (pTable.offsetWidth > 0)
				{
					pList.pValuesCont.style.width = pTable.offsetWidth + 2 + "px";
					clearInterval(ai);
				}
				count++;
				if (count > 100)
				{
					clearInterval(ai);
					pList.pValuesCont.style.width = "180px";
				}
			}, 5);
		}

		// Second attempt to adjust smiles
		if (pImg)
			pImg.onload = function()
			{
				pList.pValuesCont.style.width = "";
				setTimeout(function(){pList.pValuesCont.style.width = pTable.offsetWidth + 2 + "px";}, 50);
			};
	},
	SetSmile: function(k, pList)
	{
		//pList.pLEditor.RestoreSelectionRange();
		var oSmile = pList.oSmiles[k];

		if (pList.pLEditor.sEditorMode == 'code') // In BB or in HTML
			pList.pLEditor.WrapWith(false, false, oSmile.code);
		else // WYSIWYG
			pList.pLEditor.InsertHTML('<img id="' + pList.pLEditor.SetBxTag(false, {tag: "smile", params: oSmile}) + '" src="' + oSmile.path + '" title="' + oSmile.name + '"/>');

		if (pList.bOpened)
			pList.Close();
	},
	parser:
	{
		name: "smile",
		obj: {
			Parse: function(sName, sContent, pLEditor)
			{
				// Smiles
				if (pLEditor.sortedSmiles)
				{
					// Cut tags
					var arTags = [];
					sContent = sContent.replace(/\<(?:\s|\S)*?>/ig, function(str)
					{
						arTags.push(str);
						return '#BXTAG' + (arTags.length - 1) + '#';
					});

					var i, l = pLEditor.sortedSmiles.length, smile;
					for (i = 0; i < l; i++)
					{
						smile = pLEditor.sortedSmiles[i];
						if (smile.path && smile.code)
							sContent = sContent.replace(new RegExp(BX.util.preg_quote(smile.code), 'ig'),
							'<img id="' + pLEditor.SetBxTag(false, {tag: "smile", params: smile}) + '" src="' + smile.path + '" title="' + smile.name + '"/>');
					}

					// Set tags back
					if (arTags.length > 0)
						sContent = sContent.replace(/#BXTAG(\d+)#/ig, function(s, num){return arTags[num] || s;});
				}
				return sContent;
			},
			UnParse: function(bxTag, pNode, pLEditor)
			{
				if (!bxTag.params || !bxTag.params.code)
					return '';
				return bxTag.params.code;
			}
		}
	}
};


LHEButtons['HeaderList'] = {
	id : 'HeaderList',
	name : BX.message.HeaderList,
	bBBHide: true,
	type: 'List',
	handler: function() {},
	OnCreate: function(pList)
	{
		var
			pIt, pItem, i, oItem;

		pList.arItems = [
			{value: 'p', name: BX.message.Normal},
			{value: 'h1', name: BX.message.Heading + ' 1'},
			{value: 'h2', name: BX.message.Heading + ' 2'},
			{value: 'h3', name: BX.message.Heading + ' 3'},
			{value: 'h4', name: BX.message.Heading + ' 4'},
			{value: 'h5', name: BX.message.Heading + ' 5'},
			{value: 'h6', name: BX.message.Heading + ' 6'},
			{value: 'pre', name: BX.message.Preformatted}
		];

		var innerCont = BX.create("DIV", {props: {className: 'lhe-header-innercont'}});

		for (i = 0; i < pList.arItems.length; i++)
		{
			oItem = pList.arItems[i];
			if (typeof oItem != 'object' || !oItem.name)
				continue;

			pItem = BX.create("DIV", {props: {className: 'lhe-header-cont', title: oItem.name, id: 'lhe_header__' + i}});
			pItem.appendChild(BX.create(oItem.value.toUpperCase(), {text: oItem.name}));

			pItem.onmousedown = function(){pList.oBut.Select(pList.arItems[this.id.substring('lhe_header__'.length)], pList);};
			pItem.onmouseover = function(){this.className = 'lhe-header-cont lhe-header-cont-over';};
			pItem.onmouseout = function(){this.className = 'lhe-header-cont';};

			oItem.pWnd = innerCont.appendChild(pItem);
		}
		pList.pValuesCont.appendChild(innerCont);
	},
	OnOpen: function(pList)
	{
		var
			frm = pList.pLEditor.queryCommand('FormatBlock'),
			i, v;

		if (pList.pSelectedItemId >= 0)
			pList.SelectItem(false);

		if (!frm)
			frm = 'p';
		for (i = 0; i < pList.arItems.length; i++)
		{
			v = pList.arItems[i];
			if (v.value == frm)
			{
				pList.pSelectedItemId = i;
				pList.SelectItem(true);
			}
		}
	},
	Select: function(oItem, pList)
	{
		pList.pLEditor.SelectRange(pList.pLEditor.oPrevRange);
		pList.pLEditor.executeCommand('FormatBlock', '<' + oItem.value + '>');
		pList.Close();
	}
};

LHEButtons['FontList'] = {
	id : 'FontList',
	name : BX.message.FontList,
	//bBBHide: true,
	type: 'List',
	handler: function() {},
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	OnCreate: function(pList)
	{
		var
			pIt, pItem, i, oItem, font;

		pList.arItems = [];
		for (i in pList.pLEditor.arConfig.arFonts)
		{
			font = pList.pLEditor.arConfig.arFonts[i];
			if (typeof font == 'string')
				pList.arItems.push({value: font, name: font});
		}

		for (i = 0; i < pList.arItems.length; i++)
		{
			oItem = pList.arItems[i];
			if (typeof oItem != 'object' || !oItem.name)
				continue;

			pItem = BX.create("DIV", {props: {className: 'lhe-list-item-cont', title: oItem.name, id: 'lhe_font__' + i}});
			pItem.appendChild(BX.create('SPAN', {props: {className: 'lhe-list-font-span'}, style: {fontFamily: oItem.value}, text: oItem.name}));


			pItem.onmousedown = function(){pList.oBut.Select(pList.arItems[this.id.substring('lhe_font__'.length)], pList);};
			pItem.onmouseover = function(){this.className = 'lhe-list-item-cont lhe-list-item-cont-over';};
			pItem.onmouseout = function(){this.className = 'lhe-list-item-cont';};

			oItem.pWnd = pList.pValuesCont.appendChild(pItem);
		}
	},
	OnOpen: function(pList)
	{
		var
			frm = pList.pLEditor.queryCommand('FontName'),
			i, v;
		if (pList.pSelectedItemId >= 0)
			pList.SelectItem(false);

		if (!frm)
			frm = 'p';
		for (i = 0; i < pList.arItems.length; i++)
		{
			v = pList.arItems[i];
			if (v.value.toLowerCase() == frm.toLowerCase())
			{
				pList.pSelectedItemId = i;
				pList.SelectItem(true);
			}
		}
	},
	Select: function(oItem, pList)
	{
		pList.pLEditor.RestoreSelectionRange();

		if (pList.pLEditor.sEditorMode == 'code')
		{
			if (pList.pLEditor.bBBCode)
				pList.pLEditor.FormatBB({tag: 'FONT', pBut: pList, value: oItem.value});
		}
		else
		{
			pList.pLEditor.executeCommand('FontName', oItem.value);
		}
		pList.Close();
	}
};

LHEButtons['FontSizeList'] = {
	id : 'FontSizeList',
	name : BX.message.FontSizeList,
	type: 'List',
	handler: function() {},
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	OnCreate: function(pList)
	{
		var
			pIt, pItem, i, oItem, fontSize;

		pList.arItems = [];
		for (i in pList.pLEditor.arConfig.arFontSizes)
		{
			fontSize = pList.pLEditor.arConfig.arFontSizes[i];
			if (typeof fontSize == 'string')
				pList.arItems.push({value: parseInt(i), name: fontSize});
		}

		for (i = 0; i < pList.arItems.length; i++)
		{
			oItem = pList.arItems[i];
			if (typeof oItem != 'object' || !oItem.name)
				continue;

			pItem = BX.create("DIV", {props: {className: 'lhe-list-item-cont', title: oItem.name, id: 'lhe_font_size__' + i}});
			pItem.appendChild(BX.create('SPAN', {props: {className: 'lhe-list-font-span'}, style: {fontSize: oItem.name}, text: oItem.name}));

			if (BX.browser.IsIE() && !BX.browser.IsDoctype())
				pItem.style.width = "200px";


			pItem.onmousedown = function(){pList.oBut.Select(pList.arItems[this.id.substring('lhe_font_size__'.length)], pList);};
			pItem.onmouseover = function(){this.className = 'lhe-list-item-cont lhe-list-item-cont-over';};
			pItem.onmouseout = function(){this.className = 'lhe-list-item-cont';};

			oItem.pWnd = pList.pValuesCont.appendChild(pItem);
		}
	},
	OnOpen: function(pList)
	{
		var
			frm = pList.pLEditor.queryCommand('FontSize'),
			i, v;
		if (pList.pSelectedItemId >= 0)
			pList.SelectItem(false);

		if (!frm)
			frm = 'p';
		frm = frm.toString().toLowerCase();
		for (i = 0; i < pList.arItems.length; i++)
		{
			v = pList.arItems[i];
			if (v.value.toString().toLowerCase() == frm)
			{
				pList.pSelectedItemId = i;
				pList.SelectItem(true);
			}
		}
	},
	Select: function(oItem, pList)
	{
		pList.pLEditor.RestoreSelectionRange();
		if (pList.pLEditor.sEditorMode == 'code')
		{
			if (pList.pLEditor.bBBCode)
				pList.pLEditor.FormatBB({tag: 'SIZE', pBut: pList, value: oItem.value});
		}
		else
		{
			pList.pLEditor.executeCommand('FontSize', oItem.value);
		}
		pList.Close();
	}
};

LHEButtons['BackColor'] = {
	id : 'BackColor',
	name : BX.message.BackColor,
	bBBHide: true,
	type: 'Colorpicker',
	OnSelect: function(color, pCol)
	{
		if(BX.browser.IsIE())
		{
			pCol.pLEditor.executeCommand('BackColor', color || '');
		}
		else
		{
			try{
				pCol.pLEditor.pEditorDocument.execCommand("styleWithCSS", false, true);
				if (!color)
					pCol.pLEditor.executeCommand('removeFormat');
				else
					pCol.pLEditor.executeCommand('hilitecolor', color);

				pCol.pLEditor.pEditorDocument.execCommand("styleWithCSS", false, false);
			}catch(e){}
		}
	}
};

LHEButtons['ForeColor'] = {
	id : 'ForeColor',
	name : BX.message.ForeColor,
	type: 'Colorpicker',
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	OnSelect: function(color, pCol)
	{
		if (pCol.pLEditor.sEditorMode == 'code')
		{
			if (pCol.pLEditor.bBBCode)
				pCol.pLEditor.FormatBB({tag: 'COLOR', pBut: pCol, value: color});
		}
		else
		{
			if (!color && !BX.browser.IsIE())
				pCol.pLEditor.executeCommand('removeFormat');
			else
				pCol.pLEditor.executeCommand('ForeColor', color || '');
		}
	}
};

LHEButtons['Table'] = {
	id : 'table',
	name : BX.message.InsertTable,
	OnBeforeCreate: function(pLEditor, pBut)
	{
		// Disable in non BBCode mode in html
		pBut.disableOnCodeView = !pLEditor.bBBCode || pLEditor.arConfig.bConvertContentFromBBCodes;
		return pBut;
	},
	handler : function (pBut)
	{
		pBut.pLEditor.OpenDialog({ id: 'Table'});
	}
};

//CONTEXT MENU
var LHEContMenu = {};
LHEContMenu["A"] = [LHEButtons['CreateLink'], LHEButtons['DeleteLink']];
LHEContMenu["IMG"] = [LHEButtons['Image']];
LHEContMenu["VIDEO"] = [LHEButtons['Video']];
/* End */
;
; /* Start:"a:4:{s:4:"full";s:62:"/bitrix/js/fileman/light_editor/le_core.min.js?154412741251247";s:6:"source";s:42:"/bitrix/js/fileman/light_editor/le_core.js";s:3:"min";s:46:"/bitrix/js/fileman/light_editor/le_core.min.js";s:3:"map";s:46:"/bitrix/js/fileman/light_editor/le_core.map.js";}"*/
function JCLightHTMLEditor(e){this.Init(e)}JCLightHTMLEditor.items={};JCLightHTMLEditor.prototype={Init:function(e){this.id=e.id;JCLightHTMLEditor.items[this.id]=this;var t=this;this.arConfig=e;this.bxTags={};this.bFocused=false;e.timeoutCount=e.timeoutCount||0;this.bPopup=false;this.buttonsIndex={};this.parseAlign=true;this.parseTable=true;this.lastCursorId="bxed-last-cursor";this.bHandleOnPaste=this.arConfig.bHandleOnPaste!==false;this.arBBTags=["p","u","div","table","tr","td","th","img","a","center","left","right","justify"];this._turnOffCssCount=0;if(this.arConfig.arBBTags)this.arBBTags=this.arBBTags.concat(this.arConfig.arBBTags);this.arConfig.width=this.arConfig.width?parseInt(this.arConfig.width)+(this.arConfig.width.indexOf("%")==-1?"px":"%"):"100%";this.arConfig.height=this.arConfig.height?parseInt(this.arConfig.height)+(this.arConfig.height.indexOf("%")==-1?"px":"%"):"100%";this.SetConstants();this.sEditorMode="html";this.toolbarLineCount=1;this.CACHE={};this.arVideos={};this.content=this.arConfig.content;this.oSpecialParsers={};BX.onCustomEvent(window,"LHE_OnBeforeParsersInit",[this]);this.oSpecialParsers.cursor={Parse:function(e,t,i){return t.replace(/#BXCURSOR#/gi,'<span id="'+i.lastCursorId+'"></span>')},UnParse:function(e,t,i){return"#BXCURSOR#"}};if(e.parsers){for(var i in e.parsers){if(e.parsers[i])this.oSpecialParsers[i]=e.parsers[i]}}this.bDialogOpened=false;this.pFrame=BX("bxlhe_frame_"+this.id);if(!this.pFrame){if(e.timeoutCount<100){setTimeout(function(){e.timeoutCount++;t.Init(e)},1)}return}this.pFrame.style.display="block";this.pFrame.style.width=this.arConfig.width;this.pFrame.style.height=this.arConfig.height;this.pFrameTable=this.pFrame.firstChild;this.pButtonsCell=this.pFrameTable.rows[0].cells[0];this.pButtonsCont=this.pButtonsCell.firstChild;this.pEditCont=this.pFrameTable.rows[1].cells[0];if(this.arConfig.height.indexOf("%")==-1){var r=parseInt(this.arConfig.height)-this.toolbarLineCount*27;if(r>0)this.pEditCont.style.height=r+"px"}this.CreateFrame();this.pSourceDiv=this.pEditCont.appendChild(BX.create("DIV",{props:{className:"lha-source-div"}}));this.pTextarea=this.pSourceDiv.appendChild(BX.create("TEXTAREA",{props:{className:"lha-textarea",rows:25,id:this.arConfig.inputId}}));this.pHiddenInput=this.pFrame.appendChild(BX.create("INPUT",{props:{type:"hidden",name:this.arConfig.inputName}}));this.pTextarea.onfocus=function(){t.bTextareaFocus=true};this.pTextarea.onblur=function(){t.bTextareaFocus=false};this.pTextarea.style.fontFamily=this.arConfig.fontFamily;this.pTextarea.style.fontSize=this.arConfig.fontSize;this.pTextarea.style.fontSize=this.arConfig.lineHeight;if(this.pHiddenInput.form){BX.bind(this.pHiddenInput.form,"submit",function(){try{t.SaveContent();t.pHiddenInput.value=t.pTextarea.value=t.pHiddenInput.value.replace(/#BXCURSOR#/gi,"")}catch(e){}})}if(this.arConfig.arSmiles&&this.arConfig.arSmiles.length>0){this.sortedSmiles=[];var s,n,o,a,l,h;for(s=0,n=this.arConfig.arSmiles.length;s<n;s++){o=this.arConfig.arSmiles[s];if(!o["codes"]||o["codes"]==o["code"]){this.sortedSmiles.push(o)}else if(o["codes"].length>0){h=o["codes"].split(" ");for(a=0,l=h.length;a<l;a++)this.sortedSmiles.push({name:o.name,path:o.path,code:h[a]})}}this.sortedSmiles=this.sortedSmiles.sort(function(e,t){return t.code.length-e.code.length})}if(!this.arConfig.bBBCode&&this.arConfig.bConvertContentFromBBCodes)this.arConfig.bBBCode=true;this.bBBCode=this.arConfig.bBBCode;if(this.bBBCode){if(this.InitBBCode&&typeof this.InitBBCode=="function")this.InitBBCode()}this.bBBParseImageSize=this.arConfig.bBBParseImageSize;if(this.arConfig.bResizable){if(this.arConfig.bManualResize){this.pResizer=BX("bxlhe_resize_"+this.id);this.pResizer.title=BX.message.ResizerTitle;if(!this.arConfig.minHeight||parseInt(this.arConfig.minHeight)<=0)this.arConfig.minHeight=100;if(!this.arConfig.maxHeight||parseInt(this.arConfig.maxHeight)<=0)this.arConfig.maxHeight=2e3;this.pResizer.unselectable="on";this.pResizer.ondragstart=function(e){return BX.PreventDefault(e)};this.pResizer.onmousedown=function(){t.InitResizer();return false}}if(this.arConfig.bAutoResize){BX.bind(this.pTextarea,"keydown",BX.proxy(this.AutoResize,this));BX.addCustomEvent(this,"onShow",BX.proxy(this.AutoResize,this))}}this.AddButtons();this.parseAlign=!this.arConfig.bBBCode||!!(this.buttonsIndex["Justify"]||this.buttonsIndex["JustifyLeft"]);this.parseTable=!this.arConfig.bBBCode||!!this.buttonsIndex["Table"];if(!this.parseAlign||!this.parseTable){var d=[];for(var l in this.arBBTags){if(!this.parseAlign&&(this.arBBTags[l]=="center"||this.arBBTags[l]=="left"||this.arBBTags[l]=="right"||this.arBBTags[l]=="justify"))continue;if(!this.parseTable&&(this.arBBTags[l]=="table"||this.arBBTags[l]=="tr"||this.arBBTags[l]=="td"||this.arBBTags[l]=="th"))continue;d.push(this.arBBTags[l])}this.arBBTags=d}this.SetContent(this.content);this.SetEditorContent(this.content);this.oTransOverlay=new LHETransOverlay({zIndex:995},this);BX.onCustomEvent(window,"LHE_OnInit",[this,false]);BX.bind(this.pEditorDocument,"click",BX.proxy(this.OnClick,this));BX.bind(this.pEditorDocument,"mousedown",BX.proxy(this.OnMousedown,this));if(this.arConfig.bSaveOnBlur)BX.bind(document,"mousedown",BX.proxy(this.OnDocMousedown,this));if(this.arConfig.ctrlEnterHandler&&typeof window[this.arConfig.ctrlEnterHandler]=="function")this.ctrlEnterHandler=window[this.arConfig.ctrlEnterHandler];if(BX.browser.IsAndroid()&&/Android\s[1-3].[0-9]/i.test(navigator.userAgent)){this.arConfig.bSetDefaultCodeView=true}if(this.arConfig.bSetDefaultCodeView){if(this.sourseBut)this.sourseBut.oBut.handler(this.sourseBut);else this.SetView("code")}BX.ready(function(){if(t.pFrame.offsetWidth==0&&t.pFrame.offsetWidth==0){t.onShowInterval=setInterval(function(){if(t.pFrame.offsetWidth!=0&&t.pFrame.offsetWidth!=0){BX.onCustomEvent(t,"onShow");clearInterval(t.onShowInterval)}},500)}else{BX.onCustomEvent(t,"onShow")}});this.adjustBodyInterval=1e3;this._AdjustBodyWidth();BX.removeClass(this.pButtonsCont,"lhe-stat-toolbar-cont-preload")},CreateFrame:function(){if(this.iFrame&&this.iFrame.parentNode){this.pEditCont.removeChild(this.iFrame);this.iFrame=null}this.iFrame=this.pEditCont.appendChild(BX.create("IFRAME",{props:{id:"LHE_iframe_"+this.id,className:"lha-iframe",src:"javascript:void(0)",frameborder:0}}));if(this.iFrame.contentDocument&&!BX.browser.IsIE())this.pEditorDocument=this.iFrame.contentDocument;else this.pEditorDocument=this.iFrame.contentWindow.document;this.pEditorWindow=this.iFrame.contentWindow},ReInit:function(e){if(typeof e=="undefined")e="";this.SetContent(e);this.CreateFrame();this.SetEditorContent(this.content);this.SetFocus();BX.onCustomEvent(window,"LHE_OnInit",[this,true])},SetConstants:function(){this.reBlockElements=/^(TITLE|TABLE|SCRIPT|TR|TBODY|H1|H2|H3|H4|H5|H6|ADDRESS|PRE|OL|UL|LI)$/i;this.oneGif=this.arConfig.oneGif;this.imagePath=this.arConfig.imagePath;if(!this.arConfig.fontFamily)this.arConfig.fontFamily="Helvetica, Verdana, Arial, sans-serif";if(!this.arConfig.fontSize)this.arConfig.fontSize="12px";if(!this.arConfig.lineHeight)this.arConfig.lineHeight="16px";this.arColors=["#FF0000","#FFFF00","#00FF00","#00FFFF","#0000FF","#FF00FF","#FFFFFF","#EBEBEB","#E1E1E1","#D7D7D7","#CCCCCC","#C2C2C2","#B7B7B7","#ACACAC","#A0A0A0","#959595","#EE1D24","#FFF100","#00A650","#00AEEF","#2F3192","#ED008C","#898989","#7D7D7D","#707070","#626262","#555","#464646","#363636","#262626","#111","#000000","#F7977A","#FBAD82","#FDC68C","#FFF799","#C6DF9C","#A4D49D","#81CA9D","#7BCDC9","#6CCFF7","#7CA6D8","#8293CA","#8881BE","#A286BD","#BC8CBF","#F49BC1","#F5999D","#F16C4D","#F68E54","#FBAF5A","#FFF467","#ACD372","#7DC473","#39B778","#16BCB4","#00BFF3","#438CCB","#5573B7","#5E5CA7","#855FA8","#A763A9","#EF6EA8","#F16D7E","#EE1D24","#F16522","#F7941D","#FFF100","#8FC63D","#37B44A","#00A650","#00A99E","#00AEEF","#0072BC","#0054A5","#2F3192","#652C91","#91278F","#ED008C","#EE105A","#9D0A0F","#A1410D","#A36209","#ABA000","#588528","#197B30","#007236","#00736A","#0076A4","#004A80","#003370","#1D1363","#450E61","#62055F","#9E005C","#9D0039","#790000","#7B3000","#7C4900","#827A00","#3E6617","#045F20","#005824","#005951","#005B7E","#003562","#002056","#0C004B","#30004A","#4B0048","#7A0045","#7A0026"];this.systemCSS="img.bxed-anchor{background-image: url("+this.imagePath+"lhe_iconkit.gif)!important; background-position: -260px 0!important; height: 20px!important; width: 20px!important;}\n"+"body{font-family:"+this.arConfig.fontFamily+"; font-size: "+this.arConfig.fontSize+"; line-height:"+this.arConfig.lineHeight+"}\n"+"p{padding:0!important; margin: 0!important;}\n"+"span.bxed-noscript{color: #0000a0!important; padding: 2px!important; font-style:italic!important; font-size: 90%!important;}\n"+"span.bxed-noindex{color: #004000!important; padding: 2px!important; font-style:italic!important; font-size: 90%!important;}\n"+"img.bxed-flash{border: 1px solid #B6B6B8!important; background: url("+this.imagePath+"flash.gif) #E2DFDA center center no-repeat !important;}\n"+"table{border: 1px solid #B6B6B8!important; border-collapse: collapse;}\n"+"table td{border: 1px solid #B6B6B8!important; padding: 2px 5px;}\n"+"img.bxed-video{border: 1px solid #B6B6B8!important; background-color: #E2DFDA!important; background-image: url("+this.imagePath+"video.gif); background-position: center center!important; background-repeat:no-repeat!important;}\n"+"img.bxed-hr{padding: 2px!important; width: 100%!important; height: 2px!important;}\n";if(this.arConfig.documentCSS)this.systemCSS+="\n"+this.arConfig.documentCSS;this.tabNbsp="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";this.tabNbspRe1=new RegExp(String.fromCharCode(160)+String.fromCharCode(160)+String.fromCharCode(160)+String.fromCharCode(160)+String.fromCharCode(160)+String.fromCharCode(160),"ig");this.tabNbspRe2=new RegExp(String.fromCharCode(160)+String.fromCharCode(160)+String.fromCharCode(160)+String.fromCharCode(160)+String.fromCharCode(160)+" ","ig")},OnMousedown:function(e){if(!e)e=window.event;this.bFocused=true},OnClick:function(e){this.bFocused=true;this.CheckBr()},OnDblClick:function(e){return},OnContextMenu:function(e,t){return;var i=this,r,s,n;if(!e)e=this.pEditorWindow.event;if(e.pageX||e.pageY){s=e.pageX-this.pEditorDocument.body.scrollLeft;n=e.pageY-this.pEditorDocument.body.scrollTop}else if(e.clientX||e.clientY){s=e.clientX;n=e.clientY}r=this.CACHE["frame_pos"];if(!r)this.CACHE["frame_pos"]=r=BX.pos(this.pEditCont);s+=r.left;n+=r.top;var o;if(e.target)o=e.target;else if(e.srcElement)o=e.srcElement;if(o.nodeType==3)o=o.parentNode;if(!o||!o.nodeName)return;var a=this.oContextMenu.Show({oPos:{left:s,top:n},pElement:o});return BX.PreventDefault(e)},OnKeyDown:function(e){if(!e)e=window.event;BX.onCustomEvent(this,"OnDocumentKeyDown",[e]);var t=e.which||e.keyCode;if(e.ctrlKey&&!e.shiftKey&&!e.altKey){switch(t){case 66:case 98:this.executeCommand("Bold");return BX.PreventDefault(e);case 105:case 73:this.executeCommand("Italic");return BX.PreventDefault(e);case 117:case 85:this.executeCommand("Underline");return BX.PreventDefault(e);case 81:if(this.quoteBut){this.quoteBut.oBut.handler(this.quoteBut);return BX.PreventDefault(e)}}}if(this.bHandleOnPaste&&(e.ctrlKey&&!e.shiftKey&&!e.altKey&&e.keyCode==86||!e.ctrlKey&&e.shiftKey&&!e.altKey&&e.keyCode==45||e.metaKey&&!e.shiftKey&&!e.altKey&&e.keyCode==86)){this.OnPaste()}if(this.bCodeBut&&e.shiftKey&&e.keyCode==46){var i=this.GetSelectionObject();if(i){if(i.className=="lhe-code"){i.parentNode.removeChild(i);return BX.PreventDefault(e)}else if(i.parentNode){var r=BX.findParent(i,{className:"lhe-code"});if(r){r.parentNode.removeChild(r);return BX.PreventDefault(e)}}}}if(t==9&&this.arConfig.bReplaceTabToNbsp){this.InsertHTML(this.tabNbsp);return BX.PreventDefault(e)}if(this.bCodeBut&&e.keyCode==13){if(BX.browser.IsIE()||BX.browser.IsSafari()||BX.browser.IsChrome()){var s=this.GetSelectionObject();if(s){var n=false;if(s&&s.nodeName&&s.nodeName.toLowerCase()=="pre")n=true;if(!n)n=!!BX.findParent(s,{tagName:"pre"});if(n){if(BX.browser.IsIE())this.InsertHTML('<br/><img src="'+this.oneGif+'" height="20" width="1"/>');else if(BX.browser.IsSafari()||BX.browser.IsChrome())this.InsertHTML(" \r\n");return BX.PreventDefault(e)}}}}if((e.keyCode==13||e.keyCode==10)&&e.ctrlKey&&this.ctrlEnterHandler){this.SaveContent();this.ctrlEnterHandler()}if(this.arConfig.bAutoResize&&this.arConfig.bResizable){if(this._resizeTimeout){clearTimeout(this._resizeTimeout);this._resizeTimeout=null}this._resizeTimeout=setTimeout(BX.proxy(this.AutoResize,this),200)}if(this._CheckBrTimeout){clearTimeout(this._CheckBrTimeout);this._CheckBrTimeout=null}this._CheckBrTimeout=setTimeout(BX.proxy(this.CheckBr,this),1e3)},OnDocMousedown:function(e){if(this.bFocused){if(!e)e=window.event;var t;if(e.target)t=e.target;else if(e.srcElement)t=e.srcElement;if(t.nodeType==3)t=t.parentNode;if(!this.bPopup&&!BX.findParent(t,{className:"bxlhe-frame"})){this.SaveContent();this.bFocused=false}}},SetView:function(e){if(this.sEditorMode==e)return;this.SaveContent();if(e=="code"){this.iFrame.style.display="none";this.pSourceDiv.style.display="block";this.SetCodeEditorContent(this.GetContent())}else{this.iFrame.style.display="block";this.pSourceDiv.style.display="none";this.SetEditorContent(this.GetContent());this.CheckBr()}this.sEditorMode=e;BX.onCustomEvent(this,"OnChangeView")},SaveContent:function(){var e=this.sEditorMode=="code"?this.GetCodeEditorContent():this.GetEditorContent();if(this.bBBCode)e=this.OptimizeBB(e);this.SetContent(e);BX.onCustomEvent(this,"OnSaveContent",[e])},SetContent:function(e){this.pHiddenInput.value=this.pTextarea.value=this.content=e},GetContent:function(){return this.content.toString()},SetEditorContent:function(e){if(this.pEditorDocument){e=this.ParseContent(e);if(this.pEditorDocument.designMode){try{this.pEditorDocument.designMode="off"}catch(t){alert("SetEditorContent: designMode='off'")}}this.pEditorDocument.open();this.pEditorDocument.write("<html><head></head><body>"+e+"</body></html>");this.pEditorDocument.close();this.pEditorDocument.body.style.padding="8px";this.pEditorDocument.body.style.margin="0";this.pEditorDocument.body.style.borderWidth="0";this.pEditorDocument.body.style.fontFamily=this.arConfig.fontFamily;this.pEditorDocument.body.style.fontSize=this.arConfig.fontSize;this.pEditorDocument.body.style.lineHeight=this.arConfig.lineHeight;BX.bind(this.pEditorDocument,"keydown",BX.proxy(this.OnKeyDown,this));if(BX.browser.IsIE()){if(this.bHandleOnPaste)BX.bind(this.pEditorDocument.body,"paste",BX.proxy(this.OnPaste,this));this.pEditorDocument.body.contentEditable=true}else if(this.pEditorDocument.designMode){this.pEditorDocument.designMode="on";this._TurnOffStyleWithCSS(true)}if(this.arConfig.bConvertContentFromBBCodes)this.ShutdownBBCode()}},_TurnOffStyleWithCSS:function(e){try{this._turnOffCssCount++;if(this._turnOffCssCount<5&&e!==false)e=true;this.pEditorDocument.execCommand("styleWithCSS",false,false);try{this.pEditorDocument.execCommand("useCSS",false,true)}catch(t){}}catch(t){if(e===true)setTimeout(BX.proxy(this._TurnOffStyleWithCSS,this),500)}},_AdjustBodyWidth:function(){if(!BX.browser.IsChrome()){if(this.pEditorDocument&&this.pEditorDocument.body){var e=this.pEditorDocument.body.innerHTML;if(e!=this.lastEditedBodyHtml){this.adjustBodyInterval=500;var t=this;this.pEditorDocument.body.style.width=null;this.lastEditedBodyHtml=e;setTimeout(function(){var e=BX.GetWindowScrollSize(t.pEditorDocument).scrollWidth-16;if(e>0)t.pEditorDocument.body.style.width=e+"px"},50)}else{this.adjustBodyInterval=5e3}}setTimeout(BX.proxy(this._AdjustBodyWidth,this),this.adjustBodyInterval)}},GetEditorContent:function(){var e=this.UnParseContent();return e},SetCodeEditorContent:function(e){this.pHiddenInput.value=this.pTextarea.value=e},GetCodeEditorContent:function(){return this.pTextarea.value},OptimizeHTML:function(e){var t=0,i=true,r=["b","em","font","h\\d","i","li","ol","p","small","span","strong","u","ul"],s=function(){a--;i=true;return" "},n,o,a,l;while(t++<20&&i){i=false;for(a=0,l=r.length;a<l;a++){o=r[a];n=new RegExp("<"+o+"[^>]*?>\\s*?</"+o+">","ig");e=e.replace(n,s);n=new RegExp("<"+o+"\\s+?[^>]*?/>","ig");e=e.replace(n,s);n=new RegExp("<(("+o+"+?)(?:\\s+?[^>]*?)?)>([\\s\\S]+?)<\\/\\2>\\s*?<\\1>([\\s\\S]+?)<\\/\\2>","ig");e=e.replace(n,function(e,t,r,s,n){i=true;return"<"+t+">"+s+" "+n+"</"+r+">"})}}return e},_RecursiveDomWalker:function(e,t){var i={arAttributes:{},arNodes:[],type:null,text:"",arStyle:{}};switch(e.nodeType){case 9:i.type="document";break;case 1:if(e.tagName.length<=0||e.tagName.substring(0,1)=="/")return;i.text=e.tagName.toLowerCase();if(i.text=="script")break;i.type="element";var r=e.attributes,s,n=r.length;if(e.nodeName.toLowerCase()=="a"&&e.innerHTML==""&&(this.bBBCode||!e.getAttribute("name")))return;for(s=0;s<n;s++){if(r[s].specified||i.text=="input"&&r[s].nodeName.toLowerCase()=="value"){var o=r[s].nodeName.toLowerCase();if(o=="style"){i.arAttributes[o]=e.style.cssText;i.arStyle=e.style;if(i.arStyle.display=="none"){i.type="text";i.text="";break}if(i.arStyle.textAlign&&(i.text=="div"||i.text=="p"||i.text=="span")){var a=i.arStyle.textAlign;BX.util.in_array(i.arStyle.textAlign,["left","right","center","justify"]);{i.arStyle={};i.text="span";i.arAttributes["style"]="text-align:"+a+";display:block;";i.arStyle.textAlign=a;i.arStyle.display="block"}}}else if(o=="src"||o=="href"||o=="width"||o=="height"){i.arAttributes[o]=e.getAttribute(o,2)}else if(!this.bBBCode&&o=="align"&&BX.util.in_array(r[s].nodeValue,["left","right","center","justify"])){i.text="span";i.arAttributes["style"]="text-align:"+r[s].nodeValue+";display:block;";i.arStyle.textAlign=r[s].nodeValue;i.arStyle.display="block"}else{i.arAttributes[o]=r[s].nodeValue}}}break;case 3:i.type="text";var l=e.nodeValue;if(this.arConfig.bReplaceTabToNbsp){l=l.replace(this.tabNbspRe1,"	");l=l.replace(this.tabNbspRe2,"	")}if(!t||t.text!="pre"&&t.arAttributes["class"]!="lhe-code"){l=l.replace(/\n+/g," ");l=l.replace(/ +/g," ")}i.text=l;break}if(i.type!="text"){var h=e.childNodes,d,n=h.length;for(d=0;d<n;d++)i.arNodes.push(this._RecursiveDomWalker(h[d],i))}return i},_RecursiveGetHTML:function(e){if(!e||typeof e!="object"||!e.arAttributes)return"";var t,i="",r=e.arAttributes["id"];if(e.text=="img"&&!r)r=this.SetBxTag(false,{tag:"img",params:{src:e.arAttributes["src"]}});if(r){var s=this.GetBxTag(r);if(s.tag){var n=this.oSpecialParsers[s.tag];if(n&&n.UnParse)return n.UnParse(s,e,this);else if(s.params&&s.params.value)return"\n"+s.params.value+"\n";else return""}}if(e.arAttributes["_moz_editor_bogus_node"])return"";if(this.bBBCode){var o=this.UnParseNodeBB(e);if(o!==false)return o}bFormatted=true;if(e.text.toLowerCase()!="body")i=this.GetNodeHTMLLeft(e);var a=false;var l="";if(typeof e.bFormatted!="undefined")bFormatted=!!e.bFormatted;if(bFormatted&&e.type!="text"){if(this.reBlockElements.test(e.text)&&!(e.oParent&&e.oParent.text&&e.oParent.text.toLowerCase()=="pre")){for(var h=0;h<e.iLevel-3;h++)l+="  ";a=true;i="\r\n"+l+i}}for(var d=0;d<e.arNodes.length;d++)i+=this._RecursiveGetHTML(e.arNodes[d]);if(e.text.toLowerCase()!="body")i+=this.GetNodeHTMLRight(e);if(a)i+="\r\n"+(l==""?"":l.substr(2));return i},GetNodeHTMLLeft:function(e){if(e.type=="text")return BX.util.htmlspecialchars(e.text);var t,i,r;if(e.type=="element"){r="<"+e.text;for(i in e.arAttributes){t=e.arAttributes[i];if(i.substring(0,4).toLowerCase()=="_moz")continue;if(e.text.toUpperCase()=="BR"&&i.toLowerCase()=="type"&&t=="_moz")continue;if(i=="style"){if(t.length>0&&t.indexOf("-moz")!=-1)t=BX.util.trim(t.replace(/-moz.*?;/gi,""));if(e.text=="td")t=BX.util.trim(t.replace(/border-image:\s*none;/gi,""));if(t.length<=0)continue}r+=" "+i+'="'+(e.bDontUseSpecialchars?t:BX.util.htmlspecialchars(t))+'"'}if(e.arNodes.length<=0&&!this.IsPairNode(e.text))return r+" />";return r+">"}return""},GetNodeHTMLRight:function(e){if(e.type=="element"&&(e.arNodes.length>0||this.IsPairNode(e.text)))return"</"+e.text+">";return""},IsPairNode:function(e){if(e.substr(0,1)=="h"||e=="br"||e=="img"||e=="input")return false;return true},executeCommand:function(e,t){this.SetFocus();var i=this.pEditorWindow.document.execCommand(e,false,t);this.SetFocus();if(this.arConfig.bAutoResize&&this.arConfig.bResizable)this.AutoResize();return i},queryCommand:function(e){var t="";if(!this.pEditorDocument.queryCommandEnabled||!this.pEditorDocument.queryCommandValue)return null;if(!this.pEditorDocument.queryCommandEnabled(e))return null;return this.pEditorDocument.queryCommandValue(e)},SetFocus:function(){if(this.sEditorMode!="html")return;BX.focus(this.pEditorWindow.focus?this.pEditorWindow:this.pEditorDocument.body);this.bFocused=true},SetFocusToEnd:function(){this.CheckBr();var e=BX.GetWindowScrollSize(this.pEditorDocument);this.pEditorWindow.scrollTo(0,e.scrollHeight);this.SetFocus();this.SelectElement(this.pEditorDocument.body.lastChild)},SetCursorFF:function(){if(this.sEditorMode!="code"&&!BX.browser.IsIE()){var e=this;try{this.iFrame.blur();this.iFrame.focus();setTimeout(function(){e.iFrame.blur();e.iFrame.focus()},600);setTimeout(function(){e.iFrame.blur();e.iFrame.focus()},1e3)}catch(t){}}},CheckBr:function(){if(this.CheckBrTimeout){clearTimeout(this.CheckBrTimeout);this.CheckBrTimeout=false}var e=this;this.CheckBrTimeout=setTimeout(function(){var t=e.pEditorDocument.body.lastChild;if(t&&t.nodeType==1){var i=t.nodeName.toUpperCase();var r=/^(TITLE|TABLE|SCRIPT|DIV|H1|H2|H3|H4|H5|H6|ADDRESS|PRE|OL|UL|LI|BLOCKQUOTE|FORM|CENTER|)$/i;if(r.test(i))e.pEditorDocument.body.appendChild(e.pEditorDocument.createElement("BR"))}},200)},ParseContent:function(e,t){var i=this;var r=[];e=e.replace(/\[code\]((?:\s|\S)*?)\[\/code\]/gi,function(e,t){var s="";if(!i.bBBCode)s=' id="'+i.SetBxTag(false,{tag:"code"})+'" ';r.push("<pre "+s+'class="lhe-code" title="'+BX.message.CodeDel+'">'+BX.util.htmlspecialchars(t)+"</pre>");return"#BX_CODE"+(r.length-1)+"#"});if(!t)BX.onCustomEvent(this,"OnParseContent");if(this.arConfig.bBBCode)e=this.ParseBB(e);e=e.replace(/(<td[^>]*>)\s*(<\/td>)/gi,'$1<br _moz_editor_bogus_node="on">$2');if(this.arConfig.bReplaceTabToNbsp)e=e.replace(/\t/gi,this.tabNbsp);if(!BX.browser.IsIE()){e=e.replace(/<hr[^>]*>/gi,function(e){return'<img class="bxed-hr" src="'+i.imagePath+'break_page.gif" id="'+i.SetBxTag(false,{tag:"hr",params:{value:e}})+'"/>'})}for(var s in this.oSpecialParsers){if(this.oSpecialParsers[s]&&this.oSpecialParsers[s].Parse)e=this.oSpecialParsers[s].Parse(s,e,this)}if(!t)setTimeout(function(){i.AppendCSS(i.systemCSS);setTimeout(function(){i.pEditorDocument.body.style.fontFamily="";i.pEditorDocument.body.style.fontSize=""},1)},300);if(r.length>0)e=e.replace(/#BX_CODE(\d+)#/gi,function(e,t){return r[t]||e});if(this.bBBCode){e=e.replace(/&amp;#91;/gi,"[");e=e.replace(/&amp;#93;/gi,"]")}e=BX.util.trim(e);if(this.arConfig.bBBCode&&!e.match(/(<br[^>]*>)$/gi))e+="<br/>";return e},UnParseContent:function(){BX.onCustomEvent(this,"OnUnParseContent");var e=this._RecursiveGetHTML(this._RecursiveDomWalker(this.pEditorDocument.body,false));if(this.bBBCode){if(!BX.browser.IsIE())e=e.replace(/\r/gi,"");e=e.replace(/\n/gi,"")}var t=[["#BR#(#TAG_BEGIN#)","$1"],["(#TAG_BEGIN#)(?:#BR#)*?(#TAG_END#)","$1$2"],["(#TAG_BEGIN#)([\\s\\S]*?)#TAG_END#(?:\\n|\\r|\\s)*?#TAG_BEGIN#([\\s\\S]*?)(#TAG_END#)",function(e,t,i,r,s){return t+i+"#BR#"+r+s},true],["^#TAG_BEGIN#",""],["([\\s\\S]*?(\\[\\/\\w+\\])*?)#TAG_BEGIN#([\\s\\S]*?)#TAG_END#([\\s\\S]*?)",function(e,t,i,r,s){if(i&&i.toLowerCase&&i.toLowerCase()=="[/list]")return t+r+"#BR#"+s;return t+"#BR#"+r+"#BR#"+s},true],["#TAG_END#","#BR#"]];var i,r,s=t.length,n;if(this.bBBCode){if(BX.browser.IsOpera())e=e.replace(/(?:#BR#)*?\[\/P\]/gi,"[/P]");for(r=0;r<s;r++){i=t[r][0];i=i.replace(/#TAG_BEGIN#/g,"\\[P\\]");i=i.replace(/#TAG_END#/g,"\\[\\/P\\]");i=i.replace(/\\\\/gi,"\\\\");i=new RegExp(i,"igm");if(t[r][2]===true)while(true){n=e.replace(i,t[r][1]);if(n==e)break;else e=n}else e=e.replace(i,t[r][1])}e=e.replace(/^((?:\s|\S)*?)(?:\n|\r|\s)+$/gi,"$1\n\n");for(r=0;r<s;r++){i=t[r][0];i=i.replace(/#TAG_BEGIN#/g,"\\[DIV\\]");i=i.replace(/#TAG_END#/g,"\\[\\/DIV\\]");i=i.replace(/\\\\/gi,"\\\\");if(t[r][2]===true)while(true){n=e.replace(new RegExp(i,"igm"),t[r][1]);if(n==e)break;else e=n}else e=e.replace(new RegExp(i,"igm"),t[r][1])}e=e.replace(/#BR#/gi,"\n");e=e.replace(/\[DIV]/gi,"");e=BX.util.htmlspecialcharsback(e)}this.__sContent=e;BX.onCustomEvent(this,"OnUnParseContentAfter");e=this.__sContent;return e},InitResizer:function(){this.oTransOverlay.Show();var e=this,t=BX.pos(this.pFrame),i=false;var r=function(r){r=r||window.event;BX.fixEventPageY(r);i=r.pageY-t.top;if(i<e.arConfig.minHeight){i=e.arConfig.minHeight;document.body.style.cursor="not-allowed"}else if(i>e.arConfig.maxHeight){i=e.arConfig.maxHeight;document.body.style.cursor="not-allowed"}else{document.body.style.cursor="n-resize"}e.pFrame.style.height=i+"px";e.ResizeFrame(i)};var s=function(t){if(e.arConfig.autoResizeSaveSize)BX.userOptions.save("fileman","LHESize_"+e.id,"height",i);e.arConfig.height=i;document.body.style.cursor="";if(e.oTransOverlay&&e.oTransOverlay.bShowed)e.oTransOverlay.Hide();BX.unbind(document,"mousemove",r);BX.unbind(document,"mouseup",s)};BX.bind(document,"mousemove",r);BX.bind(document,"mouseup",s)},AutoResize:function(){var e=parseInt(this.arConfig.autoResizeOffset||80),t=parseInt(this.arConfig.autoResizeMaxHeight||0),i=parseInt(this.arConfig.autoResizeMinHeight||50),r,s=this;if(this.autoResizeTimeout)clearTimeout(this.autoResizeTimeout);this.autoResizeTimeout=setTimeout(function(){if(s.sEditorMode=="html"){r=s.pEditorDocument.body.offsetHeight;var n=s.pEditorDocument.body,o=n.lastChild,a=false,l;while(true){if(!o)break;if(o.offsetTop){a=o.offsetTop+(o.offsetHeight||0);r=a+e;break}else{o=o.previousSibling}}var h=BX.GetWindowSize(s.pEditorDocument);if(h.scrollHeight-h.innerHeight>5)r=Math.max(h.scrollHeight+e,r)}else{r=(s.pTextarea.value.split("\n").length+5)*17}if(r>parseInt(s.arConfig.height)){if(BX.browser.IsIOS())t=Infinity;else if(!t||t<10)t=Math.round(BX.GetWindowInnerSize().innerHeight*.9);r=Math.min(r,t);r=Math.max(r,i);s.SmoothResizeFrame(r)}},300)},MousePos:function(e){if(window.event)e=window.event;if(e.pageX||e.pageY){e.realX=e.pageX;e.realY=e.pageY}else if(e.clientX||e.clientY){e.realX=e.clientX+(document.documentElement.scrollLeft||document.body.scrollLeft)-document.documentElement.clientLeft;e.realY=e.clientY+(document.documentElement.scrollTop||document.body.scrollTop)-document.documentElement.clientTop}return e},SmoothResizeFrame:function(e){var t=this,i=parseInt(this.pFrame.offsetHeight),r=0,s=e>i,n=BX.browser.IsIE()?50:50,o=5;if(!s)return;if(this.smoothResizeInterval)clearInterval(this.smoothResizeInterval);this.smoothResizeInterval=setInterval(function(){if(s){i+=Math.round(o*r);if(i>e){clearInterval(t.smoothResizeInterval);if(i>e)i=e}}else{i-=Math.round(o*r);if(i<e){i=e;clearInterval(t.smoothResizeInterval)}}t.pFrame.style.height=i+"px";t.ResizeFrame(i);r++},n)},ResizeFrame:function(e){var t=7,i=this.arConfig.bManualResize?3:0,r=e||parseInt(this.pFrame.offsetHeight),s=this.pFrame.offsetWidth;this.pFrameTable.style.height=r+"px";var n=r-this.buttonsHeight-i;if(n>0){this.pEditCont.style.height=n+"px";this.pTextarea.style.height=n+"px"}this.pTextarea.style.width=s>t?s-t+"px":"auto";this.pButtonsCell.style.height=this.buttonsHeight+"px"},AddButtons:function(){var e,t,i,r,s,n=this.arConfig.toolbarConfig;this.buttonsCount=0;if(!n)n=["Bold","Italic","Underline","Strike","RemoveFormat","InsertHR","Anchor","CreateLink","DeleteLink","Image","Justify","InsertOrderedList","InsertUnorderedList","Outdent","Indent","BackColor","ForeColor","Video","StyleList","HeaderList","FontList","FontSizeList","Table"];if(oBXLEditorUtils.oTune&&oBXLEditorUtils.oTune[this.id]){var o=oBXLEditorUtils.oTune[this.id].ripButtons,a=oBXLEditorUtils.oTune[this.id].buttons;if(o){e=0;while(e<n.length){if(o[n[e]])n=BX.util.deleteFromArray(n,e);else e++}}if(a){for(var l=0,h=a.length;l<h;l++){if(a[l].ind==-1||a[l].ind>=n.length)n.push(a[l].but.id);else n=BX.util.insertIntoArray(n,a[l].ind,a[l].but.id)}}}var d=0,f=0,u=d,c,p=parseInt(this.pButtonsCont.offsetWidth);this.ToolbarStartLine(true);for(e in n){i=n[e];if(typeof i!="string"||!n.hasOwnProperty(e))continue;if(i=="=|="){this.ToolbarNewLine();u=d}else if(LHEButtons[i]){if(this.bBBCode&&LHEButtons[i].bBBHide)continue;this.buttonsIndex[i]=e;c=this.AddButton(LHEButtons[i],i);if(c){u+=parseInt(c.style.width)||23;if(u+f>p&&p>0){p=parseInt(this.pButtonsCont.offsetWidth);if(u+f>p&&p>0){this.ToolbarNewLine();this.pButtonsCont.appendChild(c);u=d}}}}}this.ToolbarEndLine();if(typeof this.arConfig.controlButtonsHeight=="undefined")this.buttonsHeight=this.toolbarLineCount*27;else this.buttonsHeight=parseInt(this.arConfig.controlButtonsHeight||0);this.arConfig.minHeight+=this.buttonsHeight;this.arConfig.maxHeight+=this.buttonsHeight;BX.addCustomEvent(this,"onShow",BX.proxy(this.ResizeFrame,this))},AddButton:function(e,t){if(e.parser&&e.parser.obj)this.oSpecialParsers[e.parser.name]=e.parser.obj;this.buttonsCount++;var i;if(!e.type||!e.type=="button"){if(t=="Code")this.bCodeBut=true;var r=new window.LHEButton(e,this);if(r&&r.oBut){if(t=="Source")this.sourseBut=r;else if(t=="Quote")this.quoteBut=r;i=this.pButtonsCont.appendChild(r.pCont)}}else if(e.type=="Colorpicker"){var s=new window.LHEColorPicker(e,this);i=this.pButtonsCont.appendChild(s.pCont)}else if(e.type=="List"){var n=new window.LHEList(e,this);i=this.pButtonsCont.appendChild(n.pCont)}if(e.parsers){for(var o=0,a=e.parsers.length;o<a;o++)if(e.parsers[o]&&e.parsers[o].obj)this.oSpecialParsers[e.parsers[o].name]=e.parsers[o].obj}return i},AddParser:function(e){if(e&&e.name&&typeof e.obj=="object")this.oSpecialParsers[e.name]=e.obj},ToolbarStartLine:function(e){if(!e&&BX.browser.IsIE())this.pButtonsCont.appendChild(BX.create("IMG",{props:{src:this.oneGif,className:"lhe-line-ie"}}));this.pButtonsCont.appendChild(BX.create("DIV",{props:{className:"lhe-line-begin"}}))},ToolbarEndLine:function(){this.pButtonsCont.appendChild(BX.create("DIV",{props:{className:"lhe-line-end"}}))},ToolbarNewLine:function(){this.toolbarLineCount++;this.ToolbarEndLine();this.ToolbarStartLine()},OpenDialog:function(e){var t=new window.LHEDialog(e,this)},GetSelectionObject:function(){var e,t,i;if(this.pEditorDocument.selection){e=this.pEditorDocument.selection;t=e.createRange();if(e.type=="Control")return t.commonParentElement();return t.parentElement()}else{e=this.pEditorWindow.getSelection();if(!e)return false;var r,s,n=e.rangeCount,o;for(var s=0;s<n;s++){t=e.getRangeAt(s);r=t.startContainer;if(r.nodeType!=3){if(r.nodeType==1&&r.childNodes.length<=0)o=r;else o=r.childNodes[t.startOffset]}else{temp=t.commonAncestorContainer;while(temp&&temp.nodeType==3)temp=temp.parentNode;o=temp}i=s==0?o:BXFindParentElement(i,o)}return i}},GetSelectionObjects:function(){var e;if(this.pEditorDocument.selection){e=this.pEditorDocument.selection;var t=e.createRange();if(e.type=="Control")return t.commonParentElement();return t.parentElement()}else{e=this.pEditorWindow.getSelection();if(!e)return false;var i;var r,s;var n=[];for(var o=0;o<e.rangeCount;o++){i=e.getRangeAt(o);r=i.startContainer;if(r.nodeType!=3){if(r.nodeType==1&&r.childNodes.length<=0)n[n.length]=r;else n[n.length]=r.childNodes[i.startOffset]}else{s=i.commonAncestorContainer;while(s&&s.nodeType==3)s=s.parentNode;n[n.length]=s}}if(n.length>1)return n;return n[0]}},GetSelectionRange:function(e,t){try{var i=e||this.pEditorDocument,r=t||this.pEditorWindow,s,n=this.GetSelection(i,r);if(n){if(i.createRange){if(n.getRangeAt)s=n.getRangeAt(0);else{s=document.createRange();s.setStart(n.anchorNode,n.anchorOffset);s.setEnd(n.focusNode,n.focusOffset)}}else s=n.createRange()}else{s=false}}catch(o){s=false}return s},SelectRange:function(e,t,i){try{if(!e)return;var r=t||this.pEditorDocument,s=i||this.pEditorWindow;this.ClearSelection(r,s);if(r.createRange){var n=s.getSelection();n.removeAllRanges();n.addRange(e)}else{e.select()}}catch(o){}},SelectElement:function(e){try{
var t,i=this.pEditorDocument,r=this.pEditorWindow;if(r.getSelection){var s=r.getSelection();s.selectAllChildren(e);t=s.getRangeAt(0);if(t.selectNode)t.selectNode(e)}else{i.selection.empty();t=i.selection.createRange();t.moveToElementText(e);t.select()}return t}catch(n){}},GetSelectedText:function(e){var t="";if(e.startContainer&&e.endContainer){if(e.startContainer==e.endContainer&&(e.endContainer.nodeType==3||e.endContainer.nodeType==1))t=e.startContainer.textContent.substring(e.startOffset,e.endOffset)}else{if(e.text==e.htmlText)t=e.text}return t||""},ClearSelection:function(e,t){var i=e||this.pEditorDocument,r=t||this.pEditorWindow;if(r.getSelection)r.getSelection().removeAllRanges();else i.selection.empty()},GetSelection:function(e,t){if(!e)e=document;if(!t)t=window;var i=false;if(t.getSelection)i=t.getSelection();else if(e.getSelection)i=e.getSelection();else if(e.selection)i=e.selection;return i},InsertHTML:function(e){try{this.SetFocus();if(BX.browser.IsIE()){var t=this.pEditorDocument.selection.createRange();if(t.pasteHTML){t.pasteHTML(e);t.collapse(false);t.select()}}else if(BX.browser.IsIE11()){this.PasteHtmlAtCaret(e)}else{this.pEditorWindow.document.execCommand("insertHTML",false,e)}}catch(i){}if(this.arConfig.bAutoResize&&this.arConfig.bResizable)this.AutoResize()},PasteHtmlAtCaret:function(e,t){var i=this.pEditorWindow,r=this.pEditorDocument,s,n;if(i.getSelection){s=i.getSelection();if(s.getRangeAt&&s.rangeCount){n=s.getRangeAt(0);n.deleteContents();var o=r.createElement("div");o.innerHTML=e;var a=r.createDocumentFragment(),l,h;while(l=o.firstChild)h=a.appendChild(l);var d=a.firstChild;n.insertNode(a);if(h){n=n.cloneRange();n.setStartAfter(h);if(t)n.setStartBefore(d);else n.collapse(true);s.removeAllRanges();s.addRange(n)}}}else if((s=r.selection)&&s.type!="Control"){var f=s.createRange();f.collapse(true);s.createRange().pasteHTML(e);if(t){n=s.createRange();n.setEndPoint("StartToStart",f);n.select()}}},AppendCSS:function(e){e=BX.util.trim(e);if(e.length<=0)return false;var t=this.pEditorDocument,i=t.getElementsByTagName("HEAD");if(i.length!=1)return false;if(BX.browser.IsIE()){setTimeout(function(){try{if(t.styleSheets.length==0)i[0].appendChild(t.createElement("STYLE"));t.styleSheets[0].cssText+=e}catch(r){}},100)}else{try{var r=t.createElement("STYLE");i[0].appendChild(r);r.appendChild(t.createTextNode(e))}catch(s){}}return true},SetBxTag:function(e,t){var i;if(t.id||e&&e.id)i=t.id||e.id;if(!i)i="bxid_"+Math.round(Math.random()*1e6);else if(this.bxTags[i]&&!t.tag)t.tag=this.bxTags[i].tag;t.id=i;if(e)e.id=t.id;this.bxTags[t.id]=t;return t.id},GetBxTag:function(e){if(e){if(typeof e!="string"&&e.id)e=e.id;if(e&&e.length>0&&this.bxTags[e]&&this.bxTags[e].tag){this.bxTags[e].tag=this.bxTags[e].tag.toLowerCase();return this.bxTags[e]}}return{tag:false}},GetAttributesList:function(e){e=e+" ";var t={},i=[],r=false,s=this;e=e.replace(/<\?.*?\?>/gi,function(e){i.push(e);return"#BXPHP"+(i.length-1)+"#"});e=e.replace(/([^\w]??)(\w+?)=([^\s\'"]+?)(\s)/gi,function(e,r,s,n,o){n=n.replace(/#BXPHP(\d+)#/gi,function(e,t){return i[t]||e});t[s.toLowerCase()]=BX.util.htmlspecialcharsback(n);return r});e=e.replace(/([^\w]??)(\w+?)\s*=\s*("|\')([^\3]*?)\3/gi,function(e,r,s,n,o){o=o.replace(/#BXPHP(\d+)#/gi,function(e,t){return i[t]||e});t[s.toLowerCase()]=BX.util.htmlspecialcharsback(o);return r});return t},RidOfNode:function(e,t){if(!e||e.nodeType!=1)return;var i,r=e.tagName.toLowerCase(),s=["span","strike","del","font","code","div"];if(BX.util.in_array(r,s)){if(t!==true){for(i=e.attributes.length-1;i>=0;i--){if(BX.util.trim(e.getAttribute(e.attributes[i].nodeName.toLowerCase()))!="")return false}}var n=e.childNodes;while(n.length>0)e.parentNode.insertBefore(n[0],e);e.parentNode.removeChild(e);return true}return false},WrapSelectionWith:function(e,t){this.SetFocus();var i,r;if(!e)e="SPAN";var s="FONT",n,o,a,l=[];try{this.pEditorDocument.execCommand("styleWithCSS",false,false)}catch(h){}this.executeCommand("FontName","bitrixtemp");a=this.pEditorDocument.getElementsByTagName(s);for(n=a.length-1;n>=0;n--){if(a[n].getAttribute("face")!="bitrixtemp")continue;o=BX.create(e,t,this.pEditorDocument);l.push(o);while(a[n].firstChild)o.appendChild(a[n].firstChild);a[n].parentNode.insertBefore(o,a[n]);a[n].parentNode.removeChild(a[n])}if(this.arConfig.bAutoResize&&this.arConfig.bResizable)this.AutoResize();return l},SaveSelectionRange:function(){if(this.sEditorMode=="code")this.oPrevRangeText=this.GetSelectionRange(document,window);else this.oPrevRange=this.GetSelectionRange()},RestoreSelectionRange:function(){if(this.sEditorMode=="code")this.IESetCarretPos(this.oPrevRangeText);else if(this.oPrevRange)this.SelectRange(this.oPrevRange)},focus:function(e,t){setTimeout(function(){try{e.focus();if(t)e.select()}catch(i){}},100)},InitBBCode:function(){this.stack=[];var e=this;this.pTextarea.onkeydown=BX.proxy(this.OnKeyDownBB,this);this._GetNodeHTMLLeft=this.GetNodeHTMLLeft;this._GetNodeHTMLRight=this.GetNodeHTMLRight;this.GetNodeHTMLLeft=this.GetNodeHTMLLeftBB;this.GetNodeHTMLRight=this.GetNodeHTMLRightBB},ShutdownBBCode:function(){this.bBBCode=false;this.arConfig.bBBCode=false;this.pTextarea.onkeydown=null;this.GetNodeHTMLLeft=this._GetNodeHTMLLeft;this.GetNodeHTMLRight=this._GetNodeHTMLRight;this.arConfig.bConvertContentFromBBCodes=false},FormatBB:function(e){var t=e.pBut,i=e.value,r=e.tag.toUpperCase(),s=r;if(r=="FONT"||r=="COLOR"||r=="SIZE")r+="="+i;if((!BX.util.in_array(r,this.stack)||this.GetTextSelection())&&!(r=="FONT"&&i=="none")){if(!this.WrapWith("["+r+"]","[/"+s+"]")){this.stack.push(r);if(t&&t.Check)t.Check(true)}}else{var n=false;while(n=this.stack.pop()){this.WrapWith("[/"+n+"]","");if(t&&t.Check)t.Check(false);if(n==r)break}}},GetTextSelection:function(){var e=false;if(typeof this.pTextarea.selectionStart!="undefined"){e=this.pTextarea.value.substr(this.pTextarea.selectionStart,this.pTextarea.selectionEnd-this.pTextarea.selectionStart)}else if(document.selection&&document.selection.createRange){e=document.selection.createRange().text}else if(window.getSelection){e=window.getSelection();e=e.toString()}return e},IESetCarretPos:function(e){if(!e||!BX.browser.IsIE()||e.text.length!=0)return;e.moveStart("character",-this.pTextarea.value.length);var t=e.text.length;var i=this.pTextarea.createTextRange();i.collapse(true);i.moveEnd("character",t);i.moveStart("character",t);i.select()},WrapWith:function(e,t,i){if(!e)e="";if(!t)t="";if(!i)i="";if(e.length<=0&&t.length<=0&&i.length<=0)return true;var r=!!i;var s=this.GetTextSelection();if(!this.bTextareaFocus)this.pTextarea.focus();var n=s?"select":r?"after":"in";if(r)i=e+i+t;else if(s)i=e+s+t;else i=e+t;if(typeof this.pTextarea.selectionStart!="undefined"){var o=this.pTextarea.scrollTop,a=this.pTextarea.selectionStart,l=this.pTextarea.selectionEnd;this.pTextarea.value=this.pTextarea.value.substr(0,a)+i+this.pTextarea.value.substr(l);if(n=="select"){this.pTextarea.selectionStart=a;this.pTextarea.selectionEnd=a+i.length}else if(n=="in"){this.pTextarea.selectionStart=this.pTextarea.selectionEnd=a+e.length}else{this.pTextarea.selectionStart=this.pTextarea.selectionEnd=a+i.length}this.pTextarea.scrollTop=o}else if(document.selection&&document.selection.createRange){var h=document.selection.createRange();var d=h.duplicate();i=i.replace(/\r?\n/g,"\n");h.text=i;h.setEndPoint("StartToStart",d);h.setEndPoint("EndToEnd",d);if(n=="select"){h.collapse(true);i=i.replace(/\r\n/g,"1");h.moveEnd("character",i.length)}else if(n=="in"){h.collapse(false);h.moveEnd("character",e.length);h.collapse(false)}else{h.collapse(false);h.moveEnd("character",i.length);h.collapse(false)}h.select()}else{this.pTextarea.value+=i}return true},ParseBB:function(e){e=BX.util.htmlspecialchars(e);e=e.replace(/[\r\n\s\t]?\[table\][\r\n\s\t]*?\[tr\]/gi,"[TABLE][TR]");e=e.replace(/\[tr\][\r\n\s\t]*?\[td\]/gi,"[TR][TD]");e=e.replace(/\[tr\][\r\n\s\t]*?\[th\]/gi,"[TR][TH]");e=e.replace(/\[\/td\][\r\n\s\t]*?\[td\]/gi,"[/TD][TD]");e=e.replace(/\[\/tr\][\r\n\s\t]*?\[tr\]/gi,"[/TR][TR]");e=e.replace(/\[\/td\][\r\n\s\t]*?\[\/tr\]/gi,"[/TD][/TR]");e=e.replace(/\[\/th\][\r\n\s\t]*?\[\/tr\]/gi,"[/TH][/TR]");e=e.replace(/\[\/tr\][\r\n\s\t]*?\[\/table\][\r\n\s\t]?/gi,"[/TR][/TABLE]");e=e.replace(/[\r\n\s\t]*?\[\/list\]/gi,"[/LIST]");e=e.replace(/[\r\n\s\t]*?\[\*\]?/gi,"[*]");var t=["b","u","i",["s","del"],"table","tr","td","th"],i,r,s,n=t.length,o;for(s=0;s<n;s++){if(typeof t[s]=="object"){i=t[s][0];r=t[s][1]}else{i=r=t[s]}e=e.replace(new RegExp("\\[(\\/?)"+i+"\\]","ig"),"<$1"+r+">")}e=e.replace(/\[url\]((?:\s|\S)*?)\[\/url\]/gi,'<a href="$1">$1</a>');e=e.replace(/\[url\s*=\s*((?:[^\[\]]*?(?:\[[^\]]+?\])*[^\[\]]*?)*)\s*\]((?:\s|\S)*?)\[\/url\]/gi,'<a href="$1">$2</a>');var a=this;e=e.replace(/\[img(?:\s*?width=(\d+)\s*?height=(\d+))?\]((?:\s|\S)*?)\[\/img\]/gi,function(e,t,i,r){var s="";t=parseInt(t);i=parseInt(i);if(t&&i&&a.bBBParseImageSize)s=' width="'+t+'" height="'+i+'"';return'<img  src="'+r+'"'+s+"/>"});s=0;while(e.toLowerCase().indexOf("[color=")!=-1&&e.toLowerCase().indexOf("[/color]")!=-1&&s++<20)e=e.replace(/\[color=((?:\s|\S)*?)\]((?:\s|\S)*?)\[\/color\]/gi,'<font color="$1">$2</font>');s=0;while(e.toLowerCase().indexOf("[list=")!=-1&&e.toLowerCase().indexOf("[/list]")!=-1&&s++<20)e=e.replace(/\[list=1\]((?:\s|\S)*?)\[\/list\]/gi,"<ol>$1</ol>");s=0;while(e.toLowerCase().indexOf("[list")!=-1&&e.toLowerCase().indexOf("[/list]")!=-1&&s++<20)e=e.replace(/\[list\]((?:\s|\S)*?)\[\/list\]/gi,"<ul>$1</ul>");e=e.replace(/\[\*\]/gi,"<li>");s=0;while(e.toLowerCase().indexOf("[font=")!=-1&&e.toLowerCase().indexOf("[/font]")!=-1&&s++<20)e=e.replace(/\[font=((?:\s|\S)*?)\]((?:\s|\S)*?)\[\/font\]/gi,'<font face="$1">$2</font>');s=0;while(e.toLowerCase().indexOf("[size=")!=-1&&e.toLowerCase().indexOf("[/size]")!=-1&&s++<20)e=e.replace(/\[size=((?:\s|\S)*?)\]((?:\s|\S)*?)\[\/size\]/gi,'<font size="$1">$2</font>');e=e.replace(/\n/gi,"<br />");return e},UnParseNodeBB:function(e){if(e.text=="br")return"#BR#";if(e.type=="text")return false;if(e.text=="pre"&&e.arAttributes["class"]=="lhe-code")return"[CODE]"+this.RecGetCodeContent(e)+"[/CODE]";e.bbHide=true;if(e.text=="font"&&e.arAttributes.color){e.bbHide=false;e.text="color";e.bbValue=e.arAttributes.color}else if(e.text=="font"&&e.arAttributes.size){e.bbHide=false;e.text="size";e.bbValue=e.arAttributes.size}else if(e.text=="font"&&e.arAttributes.face){e.bbHide=false;e.text="font";e.bbValue=e.arAttributes.face}else if(e.text=="del"){e.bbHide=false;e.text="s"}else if(e.text=="strong"||e.text=="b"){e.bbHide=false;e.text="b"}else if(e.text=="em"||e.text=="i"){e.bbHide=false;e.text="i"}else if(e.text=="blockquote"){e.bbHide=false;e.text="quote"}else if(e.text=="ol"){e.bbHide=false;e.text="list";e.bbBreakLineRight=true;e.bbValue="1"}else if(e.text=="ul"){e.bbHide=false;e.text="list";e.bbBreakLineRight=true}else if(e.text=="li"){e.bbHide=false;e.text="*";e.bbBreakLine=true;e.bbHideRight=true}else if(e.text=="a"){e.bbHide=false;e.text="url";e.bbValue=e.arAttributes.href}else if(this.parseAlign&&(e.arAttributes.align||e.arStyle.textAlign)&&!BX.util.in_array(e.text.toLowerCase(),["table","tr","td","th"])){var t=e.arStyle.textAlign||e.arAttributes.align;if(BX.util.in_array(t,["left","right","center","justify"])){e.bbHide=false;e.text=t}else{e.bbHide=!BX.util.in_array(e.text,this.arBBTags)}}else if(BX.util.in_array(e.text,this.arBBTags)){e.bbHide=false}return false},RecGetCodeContent:function(e){if(!e||!e.arNodes||!e.arNodes.length)return"";var t="";for(var i=0;i<e.arNodes.length;i++){if(e.arNodes[i].type=="text")t+=e.arNodes[i].text;else if(e.arNodes[i].type=="element"&&e.arNodes[i].text=="br")t+=this.bBBCode?"#BR#":"\n";else if(e.arNodes[i].arNodes)t+=this.RecGetCodeContent(e.arNodes[i])}if(this.bBBCode){if(BX.browser.IsIE())t=t.replace(/\r/gi,"#BR#");else t=t.replace(/\n/gi,"#BR#")}else if(BX.browser.IsIE()){t=t.replace(/\n/gi,"\r\n")}return t},GetNodeHTMLLeftBB:function(e){if(e.type=="text"){var t=BX.util.htmlspecialchars(e.text);t=t.replace(/\[/gi,"&#91;");t=t.replace(/\]/gi,"&#93;");return t}var i="";if(e.bbBreakLine)i+="\n";if(e.type=="element"&&!e.bbHide){i+="["+e.text.toUpperCase();if(e.bbValue)i+="="+e.bbValue;i+="]"}return i},GetNodeHTMLRightBB:function(e){var t="";if(e.bbBreakLineRight)t+="\n";if(e.type=="element"&&(e.arNodes.length>0||this.IsPairNode(e.text))&&!e.bbHide&&!e.bbHideRight)t+="[/"+e.text.toUpperCase()+"]";return t},OptimizeBB:function(e){var t=0,i=true,r=["b","i","u","s","color","font","size","quote"],s=function(){a--;i=true;return" "},n,o,a,l;while(t++<20&&i){i=false;for(a=0,l=r.length;a<l;a++){o=r[a];n=new RegExp("\\["+o+"[^\\]]*?\\]\\s*?\\[/"+o+"\\]","ig");e=e.replace(n,s);if(o!=="quote"){n=new RegExp("\\[(("+o+"+?)(?:\\s+?[^\\]]*?)?)\\]([\\s\\S]+?)\\[\\/\\2\\](\\s*?)\\[\\1\\]([\\s\\S]+?)\\[\\/\\2\\]","ig");e=e.replace(n,function(e,t,r,s,n,o){if(n.indexOf("\n")!=-1)return e;i=true;return"["+t+"]"+s+" "+o+"[/"+r+"]"})}}}e=e.replace(/[\r\n\s\t]*?\[\/list\]/gi,"\n[/LIST]");e=e.replace(/[\r\n\s\t]*?\[\/list\]/gi,"\n[/LIST]");e=e.replace(/\n*$/gi,"");return e},RemoveFormatBB:function(){var e=this.GetTextSelection();if(e){var t=0,i=["b","i","u","s","color","font","size"],r,s=i.length;while(t<30){str1=e;for(r=0;r<s;r++)e=e.replace(new RegExp("\\[("+i[r]+")[^\\]]*?\\]([\\s\\S]*?)\\[/\\1\\]","ig"),"$2");if(e==str1)break;t++}this.WrapWith("","",e)}},OnKeyDownBB:function(e){if(!e)e=window.event;var t=e.which||e.keyCode;if(e.ctrlKey&&!e.shiftKey&&!e.altKey){switch(t){case 66:case 98:this.FormatBB({tag:"B"});return BX.PreventDefault(e);case 105:case 73:this.FormatBB({tag:"I"});return BX.PreventDefault(e);case 117:case 85:this.FormatBB({tag:"U"});return BX.PreventDefault(e);case 81:this.FormatBB({tag:"QUOTE"});return BX.PreventDefault(e)}}if(t==9){this.WrapWith("","","	");return BX.PreventDefault(e)}if((e.keyCode==13||e.keyCode==10)&&e.ctrlKey&&this.ctrlEnterHandler){this.SaveContent();this.ctrlEnterHandler()}},GetCutHTML:function(e){if(this.curCutId){var t=this.pEditorDocument.getElementById(this.curCutId);if(t){t.parentNode.insertBefore(BX.create("BR",{},this.pEditorDocument),t);t.parentNode.removeChild(t)}}this.curCutId=this.SetBxTag(false,{tag:"cut"});return'<img src="'+this.oneGif+'" class="bxed-cut" id="'+this.curCutId+'" title="'+BX.message.CutTitle+'"/>'},OnPaste:function(){if(this.bOnPasteProcessing)return;this.bOnPasteProcessing=true;var e=this;var t=this.pEditorDocument.body.scrollTop;setTimeout(function(){e.bOnPasteProcessing=false;e.InsertHTML('<span style="visibility: hidden;" id="'+e.SetBxTag(false,{tag:"cursor"})+'" ></span>');e.SaveContent();setTimeout(function(){var i=e.GetContent();if(/<\w[^>]*(( class="?MsoNormal"?)|(="mso-))/gi.test(i))i=e.CleanWordText(i);e.SetEditorContent(i);setTimeout(function(){try{var i=e.pEditorDocument.getElementById(e.lastCursorId);if(i&&i.parentNode){var r=i.offsetTop-30;if(r>0){if(t>0&&t+parseInt(e.pFrame.offsetHeight)>r)e.pEditorDocument.body.scrollTop=t;else e.pEditorDocument.body.scrollTop=r}e.SelectElement(i);i.parentNode.removeChild(i);e.SetFocus()}}catch(s){}},100)},100)},100)},CleanWordText:function(e){e=e.replace(/<(P|B|U|I|STRIKE)>&nbsp;<\/\1>/g," ");e=e.replace(/<o:p>([\s\S]*?)<\/o:p>/gi,"$1");e=e.replace(/<span[^>]*display:\s*?none[^>]*>([\s\S]*?)<\/span>/gi,"");e=e.replace(/<!--\[[\s\S]*?\]-->/gi,"");e=e.replace(/<!\[[\s\S]*?\]>/gi,"");e=e.replace(/<\\?\?xml[^>]*>/gi,"");e=e.replace(/<o:p>\s*<\/o:p>/gi,"");e=e.replace(/<\/?[a-z1-9]+:[^>]*>/gi,"");e=e.replace(/<([a-z1-9]+[^>]*) class=([^ |>]*)(.*?>)/gi,"<$1$3");e=e.replace(/<([a-z1-9]+[^>]*) [a-z]+:[a-z]+=([^ |>]*)(.*?>)/gi,"<$1$3");e=e.replace(/&nbsp;/gi," ");e=e.replace(/\s+?/gi," ");e=e.replace(/\s*mso-[^:]+:[^;"]+;?/gi,"");e=e.replace(/\s*margin: 0cm 0cm 0pt\s*;/gi,"");e=e.replace(/\s*margin: 0cm 0cm 0pt\s*"/gi,'"');e=e.replace(/\s*TEXT-INDENT: 0cm\s*;/gi,"");e=e.replace(/\s*TEXT-INDENT: 0cm\s*"/gi,'"');e=e.replace(/\s*TEXT-ALIGN: [^\s;]+;?"/gi,'"');e=e.replace(/\s*PAGE-BREAK-BEFORE: [^\s;]+;?"/gi,'"');e=e.replace(/\s*FONT-VARIANT: [^\s;]+;?"/gi,'"');e=e.replace(/\s*tab-stops:[^;"]*;?/gi,"");e=e.replace(/\s*tab-stops:[^"]*/gi,"");e=e.replace(/<FONT[^>]*>([\s\S]*?)<\/FONT>/gi,"$1");e=e.replace(/\s*face="[^"]*"/gi,"");e=e.replace(/\s*face=[^ >]*/gi,"");e=e.replace(/\s*FONT-FAMILY:[^;"]*;?/gi,"");e=e.replace(/<(\w[^>]*) class=([^ |>]*)([^>]*)/gi,"<$1$3");e=e.replace(/<(\w[^>]*) style="([^\"]*)"([^>]*)/gi,"<$1$3");e=e.replace(/\s*style="\s*"/gi,"");e=e.replace(/<(\w[^>]*) lang=([^ |>]*)([^>]*)/gi,"<$1$3");var t=0;while(e.toLowerCase().indexOf("<span")!=-1&&e.toLowerCase().indexOf("</span>")!=-1&&t++<20)e=e.replace(/<span[^>]*?>([\s\S]*?)<\/span>/gi,"$1");var i,r,s,n=["b","strong","i","u","font","span","strike"];while(true){i=e;for(r in n){s=n[r];e=e.replace(new RegExp("<"+s+"[^>]*?>(\\s*?)<\\/"+s+">","gi"),"$1");e=e.replace(new RegExp("<\\/"+s+"[^>]*?>(\\s*?)<"+s+">","gi"),"$1")}if(i==e)break}e=e.replace(/<(?:[^\s>]+)[^>]*>([\s\n\t\r]*)<\/\1>/g,"$1");e=e.replace(/<(?:[^\s>]+)[^>]*>(\s*)<\/\1>/g,"$1");e=e.replace(/<(?:[^\s>]+)[^>]*>(\s*)<\/\1>/g,"$1");e=e.replace(/<xml[^>]*?(?:>\s*?<\/xml)?(?:\/?)?>/gi,"");e=e.replace(/<meta[^>]*?(?:>\s*?<\/meta)?(?:\/?)?>/gi,"");e=e.replace(/<link[^>]*?(?:>\s*?<\/link)?(?:\/?)?>/gi,"");e=e.replace(/<style[\s\S]*?<\/style>/gi,"");e=e.replace(/<table([\s\S]*?)>/gi,"<table>");e=e.replace(/<tr([\s\S]*?)>/gi,"<tr>");e=e.replace(/(<td[\s\S]*?)width=("|')[\s\S]*?\2([\s\S]*?>)/gi,"$1$3");e=e.replace(/(<td[\s\S]*?)height=("|')[\s\S]*?\2([\s\S]*?>)/gi,"$1$3");e=e.replace(/(<td[\s\S]*?)style=("|')[\s\S]*?\2([\s\S]*?>)/gi,"$1$3");e=e.replace(/(<td[\s\S]*?)valign=("|')[\s\S]*?\2([\s\S]*?>)/gi,"$1$3");e=e.replace(/(<td[\s\S]*?)nowrap=("|')[\s\S]*?\2([\s\S]*?>)/gi,"$1$3");e=e.replace(/(<td[\s\S]*?)nowrap([\s\S]*?>)/gi,"$1$3");e=e.replace(/(<col[\s\S]*?)width=("|')[\s\S]*?\2([\s\S]*?>)/gi,"$1$3");e=e.replace(/(<col[\s\S]*?)style=("|')[\s\S]*?\2([\s\S]*?>)/gi,"$1$3");if(BX.browser.IsOpera())e=e.replace(/REF\s+?_Ref\d+?[\s\S]*?MERGEFORMAT\s([\s\S]*?)\s[\s\S]*?<\/xml>/gi," $1 ");return e}};BXLEditorUtils=function(){this.oTune={};this.setCurrentEditorId("default")};BXLEditorUtils.prototype={setCurrentEditorId:function(e){this.curId=e},prepare:function(){if(!this.oTune[this.curId])this.oTune[this.curId]={buttons:[],ripButtons:{}}},addButton:function(e,t){if(!e||!e.id)return false;if(typeof t=="undefined")t=-1;this.prepare();this.oTune[this.curId].buttons.push({but:e,ind:t});return true},removeButton:function(e){this.prepare();this.oTune[this.curId].ripButtons[e]=true}};oBXLEditorUtils=new BXLEditorUtils;function BXFindParentElement(e,t){var i,r=[],s=[];while((e=e.parentNode)!=null)r[r.length]=e;while((t=t.parentNode)!=null)s[s.length]=t;var n,o=0,a=0;if(r.length<s.length){n=r.length;a=s.length-n}else{n=s.length;o=r.length-n}for(var l=0;l<n-1;l++){if(BXElementEqual(r[l+o],s[l+a]))return r[l+o]}return r[0]}window.BXFindParentByTagName=function(e,t){t=t.toUpperCase();while(e&&(e.nodeType!=1||e.tagName.toUpperCase()!=t))e=e.parentNode;return e};function SetAttr(e,t,i){if(t=="className"&&!BX.browser.IsIE())t="class";if(i.length<=0)e.removeAttribute(t);else e.setAttribute(t,i)}function BXCutNode(e){while(e.childNodes.length>0)e.parentNode.insertBefore(e.childNodes[0],e);e.parentNode.removeChild(e)}
/* End */
;
//# sourceMappingURL=kernel_fileman.map.js