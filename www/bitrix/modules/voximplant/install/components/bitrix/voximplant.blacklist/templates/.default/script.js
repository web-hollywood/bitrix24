BX.namespace("BX.Voximplant.Blacklist");

BX.Voximplant.Blacklist = {
	ajaxUrl: '',
	elements: {
		numbersContainer: null,
		numberInput: null,
		addButton: null,
		settingsForm: null,
		saveSettingsButton: null
	},
	init: function(config)
	{
		var self = this;
		this.ajaxUrl = config.ajaxUrl;
		this.elements.numbersContainer = BX("bl-numbers-container");
		this.elements.numberInput = BX("bl-new-number");
		this.elements.addButton = BX("bl-add-number");
		this.elements.settingsForm = BX("bl-settings-form");
		this.elements.saveSettingsButton = BX("bl-save-settings");

		BX.bind(this.elements.addButton, "click", this.onAddButtonClick.bind(this));
		BX.bind(this.elements.numberInput, "keypress", this.onNumberInputKeyPress.bind(this));
		BX.bind(this.elements.saveSettingsButton, "click", this.saveSettings.bind(this));

		if(BX.type.isArray(config.numbers))
		{
			config.numbers.forEach(function(number)
			{
				self.renderNumber(number);
			})
		}
	},
	saveSettings: function()
	{
		var self = this;
		var formData = new FormData(this.elements.settingsForm);
		formData.append("sessid", BX.bitrix_sessid());
		formData.append("ACTION", "saveSettings");

		BX.addClass(this.elements.saveSettingsButton, "webform-small-button-wait webform-small-button-active");
		BX.ajax({
			url: this.ajaxUrl + "?ACTION=saveSettings",
			method: 'POST',
			dataType: 'json',
			data: formData,
			preparePost: false,
			onsuccess: function(data)
			{
				BX.removeClass(self.elements.saveSettingsButton, "webform-small-button-wait webform-small-button-active");
			}
		});
	},
	renderNumber: function(number)
	{
		var node = BX.create("div", {
			props: {className: "tel-bl-phone"},
			dataset: {id: number.ID, number: number.PHONE_NUMBER},
			children: [
				BX.create("span", {
					props: {className: "tel-bl-phone-text"},
					text: BX.util.htmlspecialchars(number.PHONE_NUMBER)
				}),
				BX.create("span", {
					props: {className: "tel-bl-phone-delete"},
					events: {
						click: this.deleteNumber.bind(this)
					}
				})
			]
		});
		this.elements.numbersContainer.appendChild(node)
	},
	onNumberInputKeyPress: function(e)
	{
		if(e.key === 'Enter')
		{
			var newNumber = this.elements.numberInput.value;
			this.addNumber(newNumber);
		}
	},
	onAddButtonClick: function(e)
	{
		var newNumber = this.elements.numberInput.value;
		this.addNumber(newNumber);
	},
	addNumber: function(newNumber)
	{
		var self = this;

		BX.addClass(this.elements.addButton, "webform-small-button-wait webform-small-button-active");
		BX.ajax({
			url: this.ajaxUrl + "?ACTION=addNumber",
			method: 'POST',
			dataType: 'json',
			data: {
				sessid: BX.bitrix_sessid(),
				ACTION: 'addNumber',
				NUMBER: newNumber
			},
			onsuccess: function(data)
			{
				BX.removeClass(self.elements.addButton, "webform-small-button-wait webform-small-button-active");
				if(data.ERROR)
				{
					if(data.ERROR == 'WRONG_NUMBER')
					{
						BX.Voximplant.alert(BX.message('BLACKLIST_ERROR_TITLE'), BX.message('VI_BLACKLIST_NUMBER_ERROR'));
					}
					else if(data.ERROR == 'NUMBER_ALREADY_EXISTS')
					{
						BX.Voximplant.alert(BX.message('BLACKLIST_ERROR_TITLE'), BX.message('VI_BLACKLIST_NUMBER_ALREADY_EXISTS'));
					}
				}
				else
				{
					self.renderNumber(data.number);
					self.elements.numberInput.value = '';
				}
			}
		});
	},
	deleteNumber: function(e)
	{
		var phoneNode = e.target.parentNode;
		var number = phoneNode.dataset.number;
		if (confirm(BX.message("BLACKLIST_DELETE_CONFIRM")))
		{
			BX.ajax({
				method: 'POST',
				dataType: 'json',
				url: this.ajaxUrl,
				data: {
					sessid: BX.bitrix_sessid(),
					ACTION: 'deleteNumber',
					NUMBER: number
				},
				onsuccess: function(json)
				{
					if (json.success == 'Y')
					{
						BX.remove(phoneNode);
					}
					else if (json.ERROR)
					{
						BX.Voximplant.alert(BX.message('BLACKLIST_ERROR_TITLE'), BX.message('BLACKLIST_DELETE_ERROR'));
					}
				}
			});
		}
	}
};