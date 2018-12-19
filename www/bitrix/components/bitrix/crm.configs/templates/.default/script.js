BX.CrmConfigClass = (function ()
{
	var CrmConfigClass = function (parameters)
	{
		this.randomString = parameters.randomString;
		this.tabs = parameters.tabs;
		this.numeratorQuote = document.querySelector('.js-numerator-quote');
		if (this.numeratorQuote)
		{
			this.numeratorQuote.dataset.type = parameters.numeratorQuoteType;
			this.numeratorQuote.dataset.id = parameters.numeratorQuoteId;
		}
		BX.bind(this.numeratorQuote, 'click', BX.delegate(this.onNumeratorClick, this, ''));
		this.numeratorInvoice = document.querySelector('.js-numerator-invoice');
		if (this.numeratorInvoice)
		{
			this.numeratorInvoice.dataset.type = parameters.numeratorInvoiceType;
			this.numeratorInvoice.dataset.id = parameters.numeratorInvoiceId;
		}
		BX.bind(this.numeratorInvoice, 'click', BX.delegate(this.onNumeratorClick, this, ''));
	};

	CrmConfigClass.prototype.onNumeratorClick = function (event)
	{
		event.stopPropagation();
		event.preventDefault();
		var target = event.currentTarget;
		var urlNumEdit = BX.util.add_url_param("/bitrix/components/bitrix/main.numerator.edit/slider.php",
			{
				NUMERATOR_TYPE: target.dataset.type,
				IS_HIDE_NUMERATOR_NAME: 1,
				IS_HIDE_IS_DIRECT_NUMERATION: 1
			});
		if (target.dataset.id)
		{
			urlNumEdit = BX.util.add_url_param(urlNumEdit, {ID: target.dataset.id});
		}
		BX.SidePanel.Instance.open(urlNumEdit, {width: 480});
	};

	CrmConfigClass.prototype.selectTab = function(tabId)
	{
		var div = BX('tab_content_'+tabId);
		if(!div) return;
		if(div.className == 'view-report-wrapper-inner active')
			return;

		for (var i = 0, cnt = this.tabs.length; i < cnt; i++)
		{
			var content = BX('tab_content_'+this.tabs[i]);
			if(content && content.className == 'view-report-wrapper-inner active')
			{
				this.showTab(this.tabs[i], false);
				content.className = 'view-report-wrapper-inner';
				break;
			}
		}

		this.showTab(tabId, true);
		div.className = 'view-report-wrapper-inner active';
	};

	CrmConfigClass.prototype.showTab = function(tabId, on)
	{
		var sel = (on? 'sidebar-tab-active':'');
		BX('tab_'+tabId).className = 'sidebar-tab '+sel;
	};

	return CrmConfigClass;
})();