;(function(){

	BX.namespace('BX.DocumentGenerator');

	BX.DocumentGenerator.Placeholders = {
		popupCopyMessage: null
	};

	BX.DocumentGenerator.Placeholders.Copy = function (link, placeholder)
	{
		var message;
		if(BX.clipboard.copy('{' + placeholder + '}'))
		{
			message = BX.message('DOCGEN_PLACEHOLDERS_COPY_PLACEHOLDER');
		}
		else
		{
			message = BX.message('DOCGEN_PLACEHOLDERS_COPY_PLACEHOLDER');
		}
		BX.DocumentGenerator.Placeholders.showCopyLinkPopup(link, message);
	};

	BX.DocumentGenerator.Placeholders.showCopyLinkPopup = function(node, message) 
	{
		if(this.popupCopyMessage)
		{
			return;
		}

		this.popupCopyMessage = new BX.PopupWindow('crm-popup-copy-link', node, {
			className: 'crm-popup-copy-link',
			bindPosition: {
				position: 'top'
			},
			offsetLeft: 30,
			darkMode: true,
			angle: true,
			content: message
		});

		this.popupCopyMessage.show();

		setTimeout(function() {
			BX.hide(BX(this.popupCopyMessage.uniquePopupId));
		}.bind(this), 2000);

		setTimeout(function() {
			this.popupCopyMessage.destroy();
			this.popupCopyMessage = null;
		}.bind(this), 2200)
	};

})(window);