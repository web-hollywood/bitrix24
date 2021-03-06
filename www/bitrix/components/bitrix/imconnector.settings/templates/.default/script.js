(function(window){
	window.updateImconnectorSettings = function(settingsReload)
	{
		var node = BX.showWait('imconnector_settings');
		BX.ajax.post(
			settingsReload,
		{},
		function(result){
			document.getElementById('imconnector_settings').innerHTML = result;
			BX.closeWait(node);
		}
		);
	};

	window.accordeon = function(element)
	{
		var accordionItems = new Array();
		var divs = document.getElementsByTagName( 'div' );
		for ( var i = 0; i < divs.length; i++ ) {
			if ( divs[i].className == 'imconnector-step-item' || divs[i].className == 'imconnector-step-item imconnector-step-item-show' ) accordionItems.push( divs[i] );
		}
		for ( var i = 0; i < accordionItems.length; i++ ) {
			accordionItems[i].className = 'imconnector-step-item imconnector-step-item-hide';
		}
		var accordeonHeight = element.lastElementChild.offsetHeight + 38;
		var thisHeight 		= element.offsetHeight;

		if (accordeonHeight != thisHeight) {
			element.style.height = accordeonHeight + 'px';
			element.className = 'imconnector-step-item';
		} else {
			element.style.height = accordeonHeight + 'px';
			element.className = 'imconnector-step-item';
		}
	};

	window.popupShow = function(idForm)
	{
		var popupShowTrue = new BX.PopupWindow('uid' + idForm, null, {
			closeIcon: { right : '5px', top : '5px'},
			titleBar: BX.message('IMCONNECTOR_COMPONENT_SETTINGS_CONFIRM_DISABLE_TITLE'),
			closeByEsc : true,
			autoHide : true,
			content: '<p class=\"imconnector-popup-text\">' + BX.message('IMCONNECTOR_COMPONENT_SETTINGS_CONFIRM_DISABLE') + '</p>',
			overlay: {
				backgroundColor: 'black', opacity: '80'
			},
			buttons: [
				new BX.PopupWindowButton({
					text: BX.message('IMCONNECTOR_COMPONENT_SETTINGS_CONFIRM_DISABLE_BUTTON_OK'),
					className : 'popup-window-button-accept',
					events:{
						click: function(){
							BX.submit(BX('form_delete_' + idForm));
							this.popupWindow.close();
						}
					}
				}),
				new BX.PopupWindowButton({
					text: BX.message('IMCONNECTOR_COMPONENT_SETTINGS_CONFIRM_DISABLE_BUTTON_CANCEL'),
					className : 'popup-window-button-link',
					events:{
						click: function(){this.popupWindow.close()}
					}
				})
			]
		});
		popupShowTrue.show();
	};

	window.showHideImconnectors = function(element)
	{
		var elementShow 	= element.lastElementChild.getAttribute('id'),
			txt 			= document.getElementById(elementShow),
			txtcons 		= document.getElementById(elementShow).innerHTML,
			elementWrapper	= element.parentNode,
			elementWrapperHasClass = elementWrapper.getAttribute('class');

		if (elementWrapperHasClass == 'imconnector-item') {
			txt.innerHTML = BX.message('IMCONNECTOR_COMPONENT_SETTINGS_COLLAPSE');
			elementWrapper.setAttribute('class', 'imconnector-item imconnector-item-show');
		} else {
			txt.innerHTML = BX.message('IMCONNECTOR_COMPONENT_SETTINGS_DEPLOY');
			elementWrapper.setAttribute('class', 'imconnector-item');
		}
	};

	window.copyImconnector = function(element)
	{
		this.element = element;
		var elementAttr = element.getAttribute('for');
		var copyInput = document.getElementById(elementAttr);
		copyInput.select();
		try {
			var successful = document.execCommand('copy'),
				msg = successful ? BX.message('IMCONNECTOR_COMPONENT_SETTINGS_COPIED_TO_CLIPBOARD') : 'unsuccessful';
			alert(msg);
		} catch (err) {
			alert(BX.message('IMCONNECTOR_COMPONENT_SETTINGS_FAILED_TO_COPY'));
		}
	};

	window.copyToClipboard = function() //new method with same function, as in method upper, but without using extra elements on page
	{
		var input = document.createElement('input');
		input.value = this.dataset.text;
		document.body.appendChild(input);
		input.select();

		try {
			var result = document.execCommand("copy"),
				message = result ? BX.message('IMCONNECTOR_COMPONENT_SETTINGS_COPIED_TO_CLIPBOARD') : BX.message('IMCONNECTOR_COMPONENT_SETTINGS_FAILED_TO_COPY');
		} catch (e) {
			message = BX.message('IMCONNECTOR_COMPONENT_SETTINGS_FAILED_TO_COPY');
		}

		alert(message);
		document.body.removeChild(input);

		return false;
	};

	window.addPreloader = function () {
		var preloader = BX.create("div", {
			props: {
				className: "side-panel-overlay side-panel-overlay-open",
				style : "position: fixed; background-color: rgba(255, 255, 255, .7);"
			},
			children: [
				BX.create("div", {
					props: {
						className: "side-panel-default-loader-container"
					},
					html:
					'<svg class="side-panel-default-loader-circular" viewBox="25 25 50 50">' +
					'<circle ' +
					'class="side-panel-default-loader-path" ' +
					'cx="50" cy="50" r="20" fill="none" stroke-miterlimit="10"' +
					'/>' +
					'</svg>'
				})
			]
		});
		document.body.appendChild(preloader);
	};
})(window);