;(function()
{
	BX.namespace("BX.Voximplant");

	var instances = {};

	BX.Voximplant.rentPhone = function (params)
	{
		this.id = params.id;
		this.publicFolder = params.publicFolder;
		this.selectPlaceholder = params.selectPlaceholder;
		this.numbersPlaceholder = params.numbersPlaceholder;
		this.verifiedAddressesPlaceholder = params.verifiedAddressesPlaceholder;
		this.location = params.location;
		this.canRent = params.canRent;
		this.iframe = params.iframe;

		this.country = false;
		this.countryTypes = {};
		this.countryStates = {};
		this.countryRegion = {};
		this.countryRegionNumbers = {};
		this.countryVerifiedAddresses = {};
		this.countryRegionNumberCount = 0;

		this.currentCountry = '';
		this.currentCountryState = '';
		this.currentCountryCategory = '';
		this.currentCountryRegion = '';
		this.currentNumber = '';
		this.currentAddressVerification = null;
		this.phoneNumberInstallationPrice = 0;
		this.phoneNumberMonthPrice = 0;
		this.phoneNumberFullPrice = 0;
		this.phoneNumberCurrency = 'RUR';
		this.nodes = {
			rentButton: BX('vi_rent_options'),
			container: BX('vi_rent_options_div')
		};

		this.init();
	};

	BX.Voximplant.rentPhone.create = function(params)
	{
		var instance = new BX.Voximplant.rentPhone(params);
		instances[params.id] = instance;
		return instance;
	};

	BX.Voximplant.rentPhone.getInstance = function(id)
	{
		return instances[id];
	};

	BX.Voximplant.rentPhone.prototype.init = function ()
	{
		this.getCountry();
		BX.bind(this.nodes.rentButton, 'click', this._onRentButtonClick.bind(this));
	};

	BX.Voximplant.rentPhone.prototype._onRentButtonClick = function (e)
	{
		//statistics
		BX.ajax({
			url: '/bitrix/components/bitrix/voximplant.config.rent/ajax.php?action=showRentForm',
			method: 'POST',
			data: {
				sessid: BX.bitrix_sessid(),
				ACTION: 'rentNumber'
			}
		});

		if (!this.canRent)
		{
			BX.Voximplant.showLicensePopup('numbers');
			return;
		}

		if (this.nodes.container.style.display === 'none')
		{
			BX.removeClass(this.nodes.rentButton, 'webform-button-create');
			this.nodes.container.style.removeProperty('display');
		}
		else
		{
			BX.addClass(this.nodes.rentButton, 'webform-button-create');
			this.nodes.container.style.display = 'none';
		}
		e.preventDefault();
		e.stopPropagation();
	};

	BX.Voximplant.rentPhone.prototype.getCountry = function ()
	{
		var self = this;
		if (this.blockAjax)
			return true;

		if (!this.country)
		{
			this.blockAjax = true;
			BX.showWait(this.nodes.container);
			BX.ajax({
				url: '/bitrix/components/bitrix/voximplant.config.rent/ajax.php?VI_GET_COUNTRY',
				method: 'POST',
				dataType: 'json',
				timeout: 60,
				data: {'VI_GET_COUNTRY': 'Y', 'VI_AJAX_CALL': 'Y', 'sessid': BX.bitrix_sessid()},
				onsuccess: BX.delegate(function (data)
				{
					BX.closeWait(self.nodes.container);
					self.blockAjax = false;
					if (data.ERROR == '')
					{
						self.country = {};
						for (var countryCode in data.RESULT)
						{
							self.country[countryCode] = data.RESULT[countryCode];
							self.countryTypes[countryCode] = data.RESULT[countryCode].CATEGORIES;
						}

						self.drawSelectBox('country');
					}
					else
					{
						BX.Voximplant.alert(BX.message('VI_CONFIG_RENT_ERROR_TITLE'), BX.message('VI_CONFIG_RENT_AJAX_ERROR'));
					}
				}, this),
				onfailure: function ()
				{
					BX.closeWait(self.nodes.container);
					self.blockAjax = false;
				}
			});
		}
		else
		{
			this.drawSelectBox('country');
		}
	};

	BX.Voximplant.rentPhone.prototype.getCountryCategoryParams = function ()
	{
		var count = 0;
		var hasGeographic = false;
		var defaultType = '';

		for (var countryType in this.countryTypes[this.currentCountry])
		{
			if (defaultType == '')
			{
				defaultType = countryType;
			}
			if (countryType == 'GEOGRAPHIC')
			{
				hasGeographic = true;
			}
			count++;
		}

		if (hasGeographic)
		{
			defaultType = 'GEOGRAPHIC';
		}

		return {'TYPE': defaultType, 'COUNT': count}
	};

	BX.Voximplant.rentPhone.prototype.getCountryRegionParams = function ()
	{
		var count = 0;
		var defaultRegion = '';
		var defaultRegionCount = 0;

		for (var regionId in this.countryRegion[this.currentCountry][this.currentCountryCategory][this.currentCountryState])
		{
			if (defaultRegion == '')
			{
				defaultRegion = this.countryRegion[this.currentCountry][this.currentCountryCategory][this.currentCountryState][regionId].REGION_ID;
				defaultRegionCount = this.countryRegion[this.currentCountry][this.currentCountryCategory][this.currentCountryState][regionId].PHONE_COUNT;
			}
			count++;
		}

		return {'REGION_ID': defaultRegion, 'REGION_COUNT': defaultRegionCount, 'COUNT': count}
	};

	BX.Voximplant.rentPhone.prototype.getState = function ()
	{
		var self = this;
		this.drawSelectBox('country');
		this.drawSelectBox('countryCategory');
		if (this.currentCountry !== '-' && this.currentCountryCategory !== '-' && (!this.countryStates[this.currentCountry] || !this.countryStates[this.currentCountry][this.currentCountryCategory]))
		{
			var ajaxCurrentCountry = this.currentCountry;
			var ajaxCurrentCountryCategory = this.currentCountryCategory;
			BX.showWait(this.nodes.container);
			BX.ajax({
				url: '/bitrix/components/bitrix/voximplant.config.rent/ajax.php?VI_GET_STATE',
				method: 'POST',
				dataType: 'json',
				timeout: 60,
				data: {
					'VI_GET_STATE': 'Y',
					'COUNTRY_CODE': this.currentCountry,
					'COUNTRY_CATEGORY': this.currentCountryCategory,
					'VI_AJAX_CALL': 'Y', 'sessid': BX.bitrix_sessid()
				},
				onsuccess: BX.delegate(function (data)
				{
					BX.closeWait(self.nodes.container);
					if (data.ERROR == '')
					{
						if (!self.countryStates[self.currentCountry])
							self.countryStates[self.currentCountry] = {};

						if (!self.countryStates[self.currentCountry][self.currentCountryCategory])
							self.countryStates[self.currentCountry][self.currentCountryCategory] = {};

						for (var countryStateCode in data.RESULT)
						{
							self.countryStates[self.currentCountry][self.currentCountryCategory][countryStateCode] = data.RESULT[countryStateCode];
						}
						if (ajaxCurrentCountry === self.currentCountry && ajaxCurrentCountryCategory === self.currentCountryCategory)
							self.drawSelectBox('state');
					}
					else
					{
						BX.Voximplant.alert(BX.message('VI_CONFIG_RENT_ERROR_TITLE'), BX.message('VI_CONFIG_RENT_AJAX_ERROR'));
					}
				}, this)
			});
		}
		else
		{
			this.drawSelectBox('state');
		}
	};

	BX.Voximplant.rentPhone.prototype.getCountryCategory = function ()
	{
		var params = this.getCountryCategoryParams();
		if (params.COUNT > 1)
		{
			this.drawSelectBox('countryCategory');
		}
		else if (params.TYPE != '')
		{
			this.currentCountryCategory = params.TYPE;
			this.drawSelectBox('country');
			this.getState();
		}
	};

	BX.Voximplant.rentPhone.prototype.getRegion = function ()
	{
		var self = this;
		this.drawSelectBox('country');
		this.drawSelectBox('countryCategory');
		if (this.country[this.currentCountry]['CATEGORIES'][this.currentCountryCategory].COUNTRY_HAS_STATES === true)
			this.drawSelectBox('state');

		BX.showWait(this.nodes.container);
		if (this.currentCountry != '-' && this.currentCountryState != '-' && this.currentCountryCategory != '-' && (!this.countryRegion[this.currentCountry] || !this.countryRegion[this.currentCountry][this.currentCountryCategory] || !this.countryRegion[this.currentCountry][this.currentCountryCategory][this.currentCountryState]))
		{
			var ajaxCurrentCountry = this.currentCountry;
			var ajaxCurrentCountryCategory = this.currentCountryCategory;
			var ajaxCurrentCountryState = this.currentCountryState;
			BX.showWait(this.nodes.container);
			BX.ajax({
				url: '/bitrix/components/bitrix/voximplant.config.rent/ajax.php?VI_GET_REGION',
				method: 'POST',
				dataType: 'json',
				timeout: 60,
				data: {
					'VI_GET_REGION': 'Y',
					'COUNTRY_CODE': this.currentCountry,
					'COUNTRY_CATEGORY': this.currentCountryCategory,
					'COUNTRY_STATE': this.currentCountryState,
					'VI_AJAX_CALL': 'Y',
					'sessid': BX.bitrix_sessid()
				},
				onsuccess: BX.delegate(function (data)
				{
					BX.closeWait(self.nodes.container);
					if (data.ERROR == '')
					{
						if (!self.countryRegion[self.currentCountry])
							self.countryRegion[self.currentCountry] = {};

						if (!self.countryRegion[self.currentCountry][self.currentCountryCategory])
							self.countryRegion[self.currentCountry][self.currentCountryCategory] = {};

						if (!self.countryRegion[self.currentCountry][self.currentCountryCategory][self.currentCountryState])
							self.countryRegion[self.currentCountry][self.currentCountryCategory][self.currentCountryState] = {};

						for (var countryRegionCode in data.RESULT)
						{
							self.countryRegion[self.currentCountry][self.currentCountryCategory][self.currentCountryState][countryRegionCode] = data.RESULT[countryRegionCode];
						}
						if (ajaxCurrentCountry === self.currentCountry && ajaxCurrentCountryState === self.currentCountryState && ajaxCurrentCountryCategory === self.currentCountryCategory)
							self.drawSelectBox('region');
					}
					else
					{
						BX.Voximplant.alert(BX.message('VI_CONFIG_RENT_ERROR_TITLE'), BX.message('VI_CONFIG_RENT_AJAX_ERROR'));
					}
				}, this)
			});
		}
		else
		{
			this.drawSelectBox('region');
		}
	};

	BX.Voximplant.rentPhone.prototype.getVerifiedAddresses = function ()
	{
		var self = this;
		var currentRegionParameters = this.getCurrentRegionParameters();

		if (!currentRegionParameters)
		{
			this.drawNumberBox();
			return;
		}

		if (currentRegionParameters && currentRegionParameters.REGULATION_ADDRESS_TYPE != '')
		{
			BX.showWait(this.nodes.container);
			BX.ajax({
				url: '/bitrix/components/bitrix/voximplant.config.rent/ajax.php?VI_GET_VERIFIED_ADDRESSES',
				method: 'POST',
				dataType: 'json',
				timeout: 60,
				data: {
					'VI_GET_VERIFIED_ADDRESSES': 'Y',
					'COUNTRY_CODE': self.currentCountry,
					'COUNTRY_REGION': currentRegionParameters.REGION_CODE,
					'COUNTRY_CATEGORY': self.currentCountryCategory,
					'VI_AJAX_CALL': 'Y',
					'sessid': BX.bitrix_sessid()
				},
				onsuccess: function (data)
				{
					BX.closeWait(self.nodes.container);
					if (data.ERROR == '')
					{
						self.countryRegion[self.currentCountry][self.currentCountryCategory][self.currentCountryState][self.currentCountryRegion].addressVerification = data.RESULT;
						self.drawVerifiedAddresses();
					}
					else
					{
						BX.Voximplant.alert(BX.message('VI_CONFIG_RENT_ERROR_TITLE'), BX.message('VI_CONFIG_RENT_AJAX_ERROR'));
					}
				}
			});
		}
		else
		{
			self.getNumbers();
		}
	};

	BX.Voximplant.rentPhone.prototype.getNumbers = function ()
	{
		var self = this;

		if (this.currentCountryRegion == '-' || this.currentCountryRegion == '')
			return false;


		BX.showWait(this.nodes.container);
		if (
			this.country[this.currentCountry].CAN_LIST_PHONES && (
				!this.countryRegionNumbers[this.currentCountry]
				|| !this.countryRegionNumbers[this.currentCountry][this.currentCountryCategory]
				|| !this.countryRegionNumbers[this.currentCountry][this.currentCountryCategory][this.currentCountryState]
				|| !this.countryRegionNumbers[this.currentCountry][this.currentCountryCategory][this.currentCountryState][this.currentCountryRegion]
			))
		{
			BX.ajax({
				url: '/bitrix/components/bitrix/voximplant.config.rent/ajax.php?VI_GET_PHONE_NUMBERS',
				method: 'POST',
				dataType: 'json',
				timeout: 60,
				data: {
					'VI_GET_PHONE_NUMBERS': 'Y',
					'COUNTRY_CODE': this.currentCountry,
					'COUNTRY_REGION': this.currentCountryRegion,
					'COUNTRY_CATEGORY': this.currentCountryCategory,
					'VI_AJAX_CALL': 'Y',
					'sessid': BX.bitrix_sessid()
				},
				onsuccess: BX.delegate(function (data)
				{
					BX.closeWait(self.nodes.container);
					if (data.ERROR == '')
					{
						if (!self.countryRegionNumbers[self.currentCountry])
							self.countryRegionNumbers[self.currentCountry] = {};

						if (!self.countryRegionNumbers[self.currentCountry][self.currentCountryCategory])
							self.countryRegionNumbers[self.currentCountry][self.currentCountryCategory] = {};

						if (!self.countryRegionNumbers[self.currentCountry][self.currentCountryCategory][self.currentCountryState])
							self.countryRegionNumbers[self.currentCountry][self.currentCountryCategory][self.currentCountryState] = {};

						if (!self.countryRegionNumbers[self.currentCountry][self.currentCountryCategory][self.currentCountryState][self.currentCountryRegion])
							self.countryRegionNumbers[self.currentCountry][self.currentCountryCategory][self.currentCountryState][self.currentCountryRegion] = {};

						for (var number in data.RESULT)
						{
							self.countryRegionNumbers[self.currentCountry][self.currentCountryCategory][self.currentCountryState][self.currentCountryRegion][number] = data.RESULT[number];
						}
						self.drawNumberBox();
					}
					else
					{
						BX.Voximplant.alert(BX.message('VI_CONFIG_RENT_ERROR_TITLE'), BX.message('VI_CONFIG_RENT_AJAX_ERROR'));
					}
				}, this)
			});
		}
		else
		{
			this.drawNumberBox();
		}
	};

	BX.Voximplant.rentPhone.prototype.drawSelectBox = function (name)
	{
		var self = this;
		BX.closeWait(this.nodes.container);
		if (name == 'state')
		{
			if (this.currentCountry == '-' || this.currentCountryCategory == '-')
			{
				return false;
			}
			else if (this.country[this.currentCountry]['CATEGORIES'][this.currentCountryCategory].COUNTRY_HAS_STATES !== true)
			{
				this.currentCountryState = "";
				this.getRegion();
				return false;
			}
		}
		else if (name == 'countryCategory')
		{
			var params = this.getCountryCategoryParams();
			if (params.COUNT <= 1)
			{
				return false;
			}
		}
		else if (name == 'region')
		{
			if (this.currentCountryState == '-')
			{
				return false;
			}
			this.countryRegionNumberCount = 0;

			var params = this.getCountryRegionParams();
			if (params.COUNT == 1)
			{
				this.currentCountryRegion = params.REGION_ID;
				this.countryRegionNumberCount = params.REGION_COUNT;
				this.verifiedAddressesPlaceholder.innerHTML = '';
				this.numbersPlaceholder.innerHTML = '';
				this.currentNumber = "";
				this.getVerifiedAddresses();
				return false;
			}
			else if (params.COUNT == 0)
			{
				this.currentCountryRegion = 0;
				this.getVerifiedAddresses();
				return false;
			}
		}
		var items = [];
		if (name === 'country')
		{
			items.push(
				BX.create("option", {
					attrs: {'value': '-'},
					style: {'color': '#888888'},
					html: BX.message('VI_CONFIG_RENT_COUNTRY')
				})
			);
			for (var countryCode in this.country)
			{
				var attrs = {'value': countryCode};
				if (this.currentCountry === countryCode)
					attrs['selected'] = 'true';

				items.push(
					BX.create("option", {attrs: attrs, html: this.country[countryCode].COUNTRY_NAME})
				);
			}
			this.selectPlaceholder.innerHTML = '';
		}
		else if (name === 'countryCategory')
		{
			items.push(
				BX.create("option", {
					attrs: {'value': '-'},
					style: {'color': '#888888'},
					html: BX.message('VI_CONFIG_RENT_PHONE_NUMBER')
				})
			);
			for (var countryType in this.countryTypes[this.currentCountry])
			{
				if (countryType === 'MOSCOW495')
					continue;

				var attrs = {'value': countryType};
				if (this.currentCountryCategory === countryType)
					attrs['selected'] = 'true';

				var localization = this.countryTypes[this.currentCountry][countryType].PHONE_TYPE;
				if (BX.message['VI_CONFIG_RENT_' + localization])
				{
					localization = BX.message('VI_CONFIG_RENT_' + localization);
				}

				items.push(
					BX.create("option", {attrs: attrs, html: localization})
				);
			}
		}
		else if (name === 'state')
		{
			items.push(
				BX.create("option", {
					attrs: {'value': '-'},
					style: {'color': '#888888'},
					html: BX.message('VI_CONFIG_RENT_STATE')
				})
			);
			for (var countryStateCode in this.countryStates[this.currentCountry][this.currentCountryCategory])
			{
				var attrs = {'value': countryStateCode};
				if (this.currentCountryState == countryStateCode)
					attrs['selected'] = 'true';

				items.push(
					BX.create("option", {
						attrs: attrs,
						html: this.countryStates[this.currentCountry][this.currentCountryCategory][countryStateCode]
					})
				);
			}
		}
		else if (name === 'region')
		{
			items.push(
				BX.create("option", {
					attrs: {'value': '-'},
					style: {'color': '#888888'},
					html: BX.message(this.currentCountryCategory == 'TOLLFREE' ? 'VI_CONFIG_RENT_CATEGORY' : 'VI_CONFIG_RENT_REGION')
				})
			);

			if (this.currentCountry === 'RU')
			{
				var customSortForRu = [1, 15, 2];
				for (var i = 0; i < customSortForRu.length; i++)
				{
					if (!this.countryRegion[this.currentCountry][this.currentCountryCategory][this.currentCountryState][customSortForRu[i]])
						continue;

					items.push(
						BX.create("option", {
							attrs: {
								'value': this.countryRegion[this.currentCountry][this.currentCountryCategory][this.currentCountryState][customSortForRu[i]].REGION_ID,
								'data-count': this.countryRegion[this.currentCountry][this.currentCountryCategory][this.currentCountryState][customSortForRu[i]].PHONE_COUNT
							},
							html: this.countryRegion[this.currentCountry][this.currentCountryCategory][this.currentCountryState][customSortForRu[i]].REGION_NAME
						})
					);
					this.countryRegion[this.currentCountry][this.currentCountryCategory][this.currentCountryState][customSortForRu[i]].HIDE = true;
				}
			}
			var arRegion = BX.util.objectSort(this.countryRegion[this.currentCountry][this.currentCountryCategory][this.currentCountryState], 'REGION_NAME', 'asc');
			for (var i = 0; i < arRegion.length; i++)
			{
				if (arRegion[i].HIDE)
					continue;

				items.push(
					BX.create("option", {
						attrs: {'value': arRegion[i].REGION_ID, 'data-count': arRegion[i].PHONE_COUNT},
						html: arRegion[i].REGION_NAME
					})
				);
			}
		}

		var selectBox = BX.create("div", {
			props: {className: "tel-set-item-select-wrap"},
			children: [
				BX.create("select", {
					props: {className: "tel-set-item-select"},
					events: {
						change: function (e)
						{
							if (name == 'country')
							{
								self.currentCountry = this.options[this.selectedIndex].value;
								self.currentCountryCategory = '-';
								self.currentCountryState = '-';
								self.currentCountryRegion = '-';
								self.verifiedAddressesPlaceholder.innerHTML = '';
								self.numbersPlaceholder.innerHTML = '';
								self.currentNumber = "";
								self.getCountry();
								self.getCountryCategory();
							}
							else if (name == 'countryCategory')
							{
								self.currentCountryCategory = this.options[this.selectedIndex].value;
								self.currentCountryState = '-';
								self.currentCountryRegion = '-';
								self.verifiedAddressesPlaceholder.innerHTML = '';
								self.numbersPlaceholder.innerHTML = '';
								self.currentNumber = "";
								self.getState();
							}
							else if (name == 'state')
							{
								self.currentCountryState = this.options[this.selectedIndex].value;
								self.currentCountryRegion = '-';
								self.verifiedAddressesPlaceholder.innerHTML = '';
								self.numbersPlaceholder.innerHTML = '';
								self.currentNumber = "";
								self.getRegion();
							}
							else if (name == 'region')
							{
								self.currentCountryRegion = this.options[this.selectedIndex].value;
								self.countryRegionNumberCount = this.options[this.selectedIndex].getAttribute('data-count');
								self.verifiedAddressesPlaceholder.innerHTML = '';
								self.numbersPlaceholder.innerHTML = '';
								self.currentNumber = "";
								self.getVerifiedAddresses();
							}
						}
					},
					children: items
				})
			]
		});
		this.selectPlaceholder.appendChild(selectBox);

	};

	BX.Voximplant.rentPhone.prototype.getCurrentRegionParameters = function ()
	{
		if (this.countryRegion[this.currentCountry]
			&& this.countryRegion[this.currentCountry][this.currentCountryCategory]
			&& this.countryRegion[this.currentCountry][this.currentCountryCategory][this.currentCountryState]
			&& this.countryRegion[this.currentCountry][this.currentCountryCategory][this.currentCountryState][this.currentCountryRegion]
		)
			return this.countryRegion[this.currentCountry][this.currentCountryCategory][this.currentCountryState][this.currentCountryRegion];
		else
			return null;
	};

	BX.Voximplant.rentPhone.prototype.drawVerifiedAddresses = function ()
	{
		var self = this;
		var verifiedAddressesElement;
		var inputElements = [];
		var currentRegionParameters = this.getCurrentRegionParameters();
		var priceHtml = '';
		if (!currentRegionParameters || !currentRegionParameters.addressVerification)
			return false;

		var uploadUrl = (function ()
		{
			var uploadUrl;
			var parameters;
			var currentRegionParameters = self.getCurrentRegionParameters();

			parameters = {
				'SHOW_UPLOAD_IFRAME': 'Y',
				'UPLOAD_COUNTRY_CODE': self.currentCountry,
				'UPLOAD_ADDRESS_TYPE': (currentRegionParameters ? currentRegionParameters.REGULATION_ADDRESS_TYPE : ''),
				'UPLOAD_PHONE_CATEGORY': self.currentCountryCategory,
				'UPLOAD_REGION_CODE': (currentRegionParameters ? currentRegionParameters.REGION_CODE : ''),
				'IFRAME': this.iframe === true ? 'Y' : 'N'
			};
			return self.publicFolder + 'configs.php?' + BX.ajax.prepareData(parameters);
		})();

		this.setPriceFields();
		if (this.phoneNumberInstallationPrice > 0)
			priceHtml = BX.message('VI_CONFIG_RENT_INSTALLATION_PRICE') + ': <strong>' + BX.message('VI_CONFIG_RENT_FEE_' + this.phoneNumberCurrency).replace('#MONEY#', this.phoneNumberInstallationPrice) + '</strong><br>';

		if (this.phoneNumberMonthPrice > 0)
			priceHtml = priceHtml + BX.message('VI_CONFIG_RENT_MONTH_PRICE') + ': <strong>' + BX.message('VI_CONFIG_RENT_FEE_' + this.phoneNumberCurrency).replace('#MONEY#', this.phoneNumberMonthPrice) + '</strong>';


		this.verifiedAddressesPlaceholder.innerHTML = '';
		if (currentRegionParameters.addressVerification.VERIFICATIONS_AVAILABLE && BX.type.isArray(currentRegionParameters.addressVerification.VERIFIED_ADDRESS) && currentRegionParameters.addressVerification.VERIFIED_ADDRESS.length > 0)
		{
			currentRegionParameters.addressVerification.VERIFIED_ADDRESS.map(function (address)
			{
				var inputElement;

				inputElement = BX.create('div', {
					props: {className: 'tel-set-list-nums-wrap'}, children: [
						BX.create('span', {
							props: {className: 'tel-set-list-item'}, children: [
								BX.create('input', {
									attrs: {
										type: 'radio',
										value: address.ID,
										name: 'verified-address-id',
										id: 'verified-address-id-' + address.ID
									},
									props: {className: 'tel-set-list-item-radio'},
									events: {
										change: function (e)
										{
											self.currentAddressVerification = e.currentTarget.value;
										}
									}
								}),
								BX.create('label', {
									attrs: {for: 'verified-address-id-' + address.ID},
									props: {className: 'tel-set-list-item-num'},
									text: self.formatVerifiedAddress(address)
								})
							]
						})
					]
				});

				inputElements.push(inputElement);
			});

			verifiedAddressesElement = BX.create('div', {
				props: {className: 'tel-set-list-nums'}, children: [
					BX.create('div', {
						props: {className: 'tel-set-list-nums-title'},
						html: BX.message('VI_CONFIG_SELECT_ADDRESS_1') + ' <span class="webform-button-ajax"><a href="' + uploadUrl + '">' + BX.message('VI_CONFIG_SELECT_ADDRESS_2') + '</a></span>'
					}),
					BX.create('div', {props: {className: 'tel-set-separate'}}),
					BX.create('div', {children: inputElements})
				]
			});

			this.getNumbers();
		}
		else if (currentRegionParameters.addressVerification.VERIFICATIONS_PENDING > 0)
		{
			//todo: should we inform client of pending verifications?
		}
		else
		{
			verifiedAddressesElement = BX.create('div', {
				children: [
					BX.create('div', {props: {className: "tel-set-separate"}}),
					BX.create('div', {
						props: {className: "tel-set-list-nums-title"},
						html: BX.message('VI_CONFIG_ADDRESS_VERIFICATION_REQUIRED')
					}),
					BX.create('div', {props: {className: "tel-set-separate"}}),
					BX.create("div", {
						attrs: {style: 'line-height: 33px'},
						props: {className: "tel-set-amount-text"},
						html: priceHtml
					}),
					BX.create("div", {
						props: {className: "tel-set-amount-block"}, children: [
							BX.create("div", {
								props: {className: "webform-button webform-button-create"},
								html: '<span class="webform-button-left"></span><span class="webform-button-text">' + BX.message('VI_CONFIG_UPLOAD_ADDRESS_VERIFICATION') + '</span><span class="webform-button-right"></span>',
								events: {
									click: function (e)
									{
										document.location.href = uploadUrl;
									}
								}
							})
						]
					})
				]
			});
		}
		this.verifiedAddressesPlaceholder.appendChild(verifiedAddressesElement);
	};

	BX.Voximplant.rentPhone.prototype.drawNumberBox = function ()
	{
		var self = this;
		var priceHtml = '';

		BX.closeWait(this.nodes.container);
		if (this.currentCountryRegion == '-' || this.currentCountryCategory == '' || this.currentCountryCategory == '-')
		{
			return false;
		}
		this.setPriceFields();
		if (this.phoneNumberInstallationPrice > 0)
			priceHtml = BX.message('VI_CONFIG_RENT_INSTALLATION_PRICE') + ': <strong>' + BX.message('VI_CONFIG_RENT_FEE_' + this.phoneNumberCurrency).replace('#MONEY#', this.phoneNumberInstallationPrice) + '</strong><br>';

		if (this.phoneNumberMonthPrice > 0)
			priceHtml = priceHtml + BX.message('VI_CONFIG_RENT_MONTH_PRICE') + ': <strong>' + BX.message('VI_CONFIG_RENT_FEE_' + this.phoneNumberCurrency).replace('#MONEY#', this.phoneNumberMonthPrice) + '</strong>';

		var specialHeader = null;
		var specialHeaderText = '';
		if (this.currentCountry === 'RU')
		{
			if (this.currentCountryCategory === 'TOLLFREE')
			{
				specialHeaderText = BX.message('VI_CONFIG_RENT_RU_TOLLFREE_2');
				specialHeaderText = specialHeaderText.replace('#LINK1_START#', '<a href="' + BX.message('VI_CONFIG_RENT_RU_TOLLFREE_LINK') + '" target="_blank">');
				specialHeaderText = specialHeaderText.replace('#LINK1_END#', '</a>');
				specialHeaderText = specialHeaderText.replace('#LINK2_START#', '<a href="' + BX.message('VI_CONFIG_RENT_TARIFF_LINK') + '" target="_blank">');
				specialHeaderText = specialHeaderText.replace('#LINK2_END#', '</a>');
			}
			else if (this.currentCountryCategory === 'TOLLFREE804')
			{
				specialHeaderText = BX.message('VI_CONFIG_RENT_RU_TOLLFREE804_2');
				specialHeaderText = specialHeaderText.replace('#LINK1_START#', '<a href="' + BX.message('VI_CONFIG_RENT_RU_TOLLFREE804_LINK') + '" target="_blank">');
				specialHeaderText = specialHeaderText.replace('#LINK1_END#', '</a>');
				specialHeaderText = specialHeaderText.replace('#LINK2_START#', '<a href="' + BX.message('VI_CONFIG_RENT_TARIFF_LINK') + '" target="_blank">');
				specialHeaderText = specialHeaderText.replace('#LINK2_END#', '</a>');
			}
		}
		else if (this.currentCountryCategory === 'TOLLFREE')
		{
			specialHeaderText = BX.message('VI_CONFIG_RENT_TEXT_TOLLFREE_2');
			specialHeaderText = specialHeaderText.replace('#LINK1_START#', '<a href="' + BX.message('VI_CONFIG_RENT_TARIFF_LINK') + '" target="_blank">');
			specialHeaderText = specialHeaderText.replace('#LINK1_END#', '</a>');
		}

		var requiredVerification = false;
		if (this.country[this.currentCountry]['CATEGORIES'][this.currentCountryCategory].REQUIRED_VERIFICATION)
		{
			var requiredVerificationText = BX.message('VI_CONFIG_RENT_TEXT_REQUIRE_VERIFICATION_2');
			requiredVerificationText = requiredVerificationText.replace('#URL_START#', '<a href="' + this.publicFolder + 'configs.php" target="_blank">');
			requiredVerificationText = requiredVerificationText.replace('#URL_END#', '</a>');

			if (specialHeaderText)
			{
				specialHeaderText = specialHeaderText + '<br><br>' + requiredVerificationText;
			}
			else
			{
				specialHeaderText = requiredVerificationText;
			}
			requiredVerification = true;
		}


		if (specialHeaderText != '')
		{
			specialHeader = BX.create("div", {
				children: [
					BX.create("div", {props: {className: "tel-set-list-special-header"}, html: specialHeaderText})
				]
			});
		}

		if (this.countryRegionNumbers[this.currentCountry]
			&& this.countryRegionNumbers[this.currentCountry][this.currentCountryCategory]
			&& this.countryRegionNumbers[this.currentCountry][this.currentCountryCategory][this.currentCountryState]
			&& this.countryRegionNumbers[this.currentCountry][this.currentCountryCategory][this.currentCountryState][this.currentCountryRegion])
		{
			var phoneList = [];
			var phoneListObj = this.countryRegionNumbers[this.currentCountry][this.currentCountryCategory][this.currentCountryState][this.currentCountryRegion];

			for (var phoneId in phoneListObj)
			{
				this.phoneNumberFullPrice = parseFloat(phoneListObj[phoneId].FULL_PRICE);
				this.phoneNumberMonthPrice = parseFloat(phoneListObj[phoneId].MONTH_PRICE);
				this.phoneNumberInstallationPrice = parseFloat(phoneListObj[phoneId].INSTALLATION_PRICE);
				this.phoneNumberCurrency = phoneListObj[phoneId].CURRENCY;

				priceHtml = '';
				if (this.phoneNumberInstallationPrice > 0)
					priceHtml = BX.message('VI_CONFIG_RENT_INSTALLATION_PRICE') + ': <strong>' + BX.message('VI_CONFIG_RENT_FEE_' + this.phoneNumberCurrency).replace('#MONEY#', this.phoneNumberInstallationPrice) + '</strong><br>';

				if (this.phoneNumberMonthPrice > 0)
					priceHtml = priceHtml + BX.message('VI_CONFIG_RENT_MONTH_PRICE') + ': <strong>' + BX.message('VI_CONFIG_RENT_FEE_' + this.phoneNumberCurrency).replace('#MONEY#', this.phoneNumberMonthPrice) + '</strong>';

				var phoneName = '+' + phoneId;
				if (this.currentCountry === 'RU' && (this.currentCountryCategory === 'TOLLFREE' || this.currentCountryCategory === 'TOLLFREE804'))
				{
					phoneName = '8' + phoneName.substr(2);
				}

				phoneList.push(
					BX.create("span", {
						props: {className: "tel-set-list-item"},
						children: [
							BX.create("input", {
								attrs: {
									id: 'phone' + phoneId, name: 'tel-set-list-item', value: phoneId, type: 'radio',
									'data-country-code': phoneListObj[phoneId].COUNTRY_CODE,
									'data-region-id': phoneListObj[phoneId].REGION_ID,
									'data-phone-number': phoneListObj[phoneId].PHONE_NUMBER
								},
								props: {className: "tel-set-list-item-radio"},
								events: {
									click: function (e)
									{
										self.currentCountry = this.getAttribute('data-country-code');
										self.currentCountryRegion = this.getAttribute('data-region-id');
										self.currentNumber = this.getAttribute('data-phone-number');
									},
									change: function (e)
									{
										self.currentCountry = this.getAttribute('data-country-code');
										self.currentCountryRegion = this.getAttribute('data-region-id');
										self.currentNumber = this.getAttribute('data-phone-number');
									}
								}
							}),
							BX.create("label", {
								attrs: {'for': 'phone' + phoneId},
								props: {className: "tel-set-list-item-num"},
								html: phoneName
							})
						]
					})
				);
			}

			var phoneBox = BX.create("div", {
				children: [
					BX.create("div", {
						props: {className: "tel-set-list-nums"}, children: [
							specialHeader,
							BX.create("div", {
								props: {className: "tel-set-list-nums-title"},
								html: BX.message('VI_CONFIG_RENT_LIST_PHONES')
							}),
							BX.create("div", {props: {className: "tel-set-separate"}}),
							phoneList.length > 0 ? BX.create("div", {
								props: {className: "tel-set-list-nums-wrap"},
								children: phoneList
							}) : BX.create("div", {
								props: {className: "tel-set-list-nums-title"},
								attrs: {style: 'margin:0'},
								html: BX.message('VI_CONFIG_RENT_NO_PHONES')
							})
						]
					}),
					BX.create("div", {props: {className: "tel-set-separate"}}),
					BX.create("div", {
						attrs: {style: 'line-height: 33px'},
						props: {className: "tel-set-amount-text"},
						html: phoneList.length > 0 ? priceHtml : ''
					}),
					BX.create("div", {
						props: {className: "tel-set-amount-block"}, children: [
							BX.create("div", {
								props: {className: "webform-button webform-button-create"},
								html: '<span class="webform-button-left"></span><span class="webform-button-text">' + (requiredVerification ? BX.message('VI_CONFIG_RESERVE_BTN') : BX.message('VI_CONFIG_RENT_BTN')) + '</span><span class="webform-button-right"></span>',
								events: {
									click: function (e)
									{
										self.attachPhone();
									}
								}
							})
						]
					})
				]
			});
		}
		else if (this.countryRegionNumberCount > 0)
		{
			var phoneBox = BX.create("div", {
				children: [
					specialHeader,
					BX.create("div", {props: {className: "tel-set-separate"}}),
					BX.create("div", {
						props: {className: "tel-set-list-nums-title"},
						html: BX.message('VI_CONFIG_RENT_WITHOUT_CHOICE')
					}),
					BX.create("div", {props: {className: "tel-set-separate"}}),
					BX.create("div", {
						attrs: {style: 'line-height: 33px'},
						props: {className: "tel-set-amount-text"},
						html: priceHtml
					}),
					BX.create("div", {
						props: {className: "tel-set-amount-block"}, children: [
							BX.create("div", {
								props: {className: "webform-button webform-button-create"},
								html: '<span class="webform-button-left"></span><span class="webform-button-text">' + (requiredVerification ? BX.message('VI_CONFIG_RESERVE_BTN') : BX.message('VI_CONFIG_RENT_BTN')) + '</span><span class="webform-button-right"></span>',
								events: {
									click: function (e)
									{
										self.attachPhone();
									}
								}
							})
						]
					})
				]
			});
		}
		else
		{
			var phoneBox = BX.create("div", {
				children: [
					BX.create("div", {
						props: {className: "tel-set-list-nums"}, children: [
							specialHeader,
							BX.create("div", {
								props: {className: "tel-set-list-nums-title"},
								html: BX.message('VI_CONFIG_RENT_LIST_PHONES')
							}),
							BX.create("div", {props: {className: "tel-set-separate"}}),
							BX.create("div", {
								props: {className: "tel-set-list-nums-title"},
								attrs: {style: 'margin:0'},
								html: BX.message('VI_CONFIG_RENT_NO_PHONES')
							})
						]
					}),
					BX.create("div", {props: {className: "tel-set-separate"}})
				]
			});
		}

		this.verifiedAddressesPlaceholder.innerHTML = '';
		this.numbersPlaceholder.innerHTML = '';
		this.numbersPlaceholder.appendChild(phoneBox);
	};

	BX.Voximplant.rentPhone.prototype.attachPhone = function (type)
	{
		var self = this;
		if (this.blockAjax)
			return true;

		if (!(this.currentCountry && this.currentCountryCategory))
		{
			BX.Voximplant.alert(BX.message('VI_CONFIG_RENT_ERROR_TITLE'), BX.message('VI_CONFIG_RENT_AJAX_ERROR_2'));
			return false;
		}
		if (!(this.currentCountry && this.currentCountryRegion))
		{
			BX.Voximplant.alert(BX.message('VI_CONFIG_RENT_ERROR_TITLE'), BX.message('VI_CONFIG_RENT_AJAX_NUMBER'));
			return false;
		}
		if (this.country[this.currentCountry].CAN_LIST_PHONES && this.currentNumber == "")
		{
			BX.Voximplant.alert(BX.message('VI_CONFIG_RENT_ERROR_TITLE'), BX.message('VI_CONFIG_RENT_AJAX_NUMBER'));
			return false;
		}

		var currentRegionParameters = this.getCurrentRegionParameters();
		if (currentRegionParameters && currentRegionParameters.IS_NEED_REGULATION_ADDRESS && !this.currentAddressVerification)
		{
			BX.Voximplant.alert(BX.message('VI_CONFIG_RENT_ERROR_TITLE'), BX.message('VI_CONFIG_SELECT_ADDRESS_ERROR'));
			return false;
		}

		var priceLabel = BX.message('VI_CONFIG_RENT_FEE_' + this.phoneNumberCurrency).replace('#MONEY#', this.phoneNumberMonthPrice);
		if (!confirm(BX.message('VI_CONFIG_RENT_WARN').replace('#MONEY#', priceLabel)))
		{
			return false;
		}

		var count = 1;
		var number = "";
		if (this.currentNumber != "")
		{
			count = 0;
			number = this.currentNumber;
		}

		BX.showWait(this.nodes.container);
		this.blockAjax = true;
		BX.ajax({
			url: '/bitrix/components/bitrix/voximplant.config.rent/ajax.php?action=rentNumber',
			method: 'POST',
			dataType: 'json',
			timeout: 60,
			data: {
				'VI_RENT_NUMBER': 'Y',
				'PRE_MONEY_CHECK': this.phoneNumberFullPrice,
				'CURRENT_NUMBER': number,
				'REGION_ID': this.currentCountryRegion,
				'COUNTRY_CODE': this.currentCountry,
				'COUNTRY_STATE': this.currentCountryState,
				'COUNTRY_CATEGORY': this.currentCountryCategory,
				'ADDRESS_VERIFICATION': this.currentAddressVerification,
				'VI_AJAX_CALL': 'Y',
				'sessid': BX.bitrix_sessid()
			},
			onsuccess: BX.delegate(function (answer)
			{
				BX.closeWait(self.nodes.container);
				self.blockAjax = false;
				if (answer.SUCCESS == 'Y' && BX.type.isArray(answer.DATA))
				{
					var link = self.publicFolder + 'edit.php?ID=' + answer.DATA[0]['ID'] + '&NEW=Y';
					if (this.iframe === true)
					{
						link += '&IFRAME=Y';
					}

					location.href = link;
				}
				else
				{
					var error = BX.type.isArray(answer.ERRORS) ? answer.ERRORS[0] : {};

					if (error.MESSAGE)
					{
						BX.Voximplant.alert(BX.message('VI_CONFIG_RENT_ERROR_TITLE'), error.MESSAGE);
					}
					else if (error.CODE == 'ATTACHED')
					{
						BX.Voximplant.alert(BX.message('VI_CONFIG_RENT_ERROR_TITLE'), BX.message('VI_CONFIG_RENT_WAS_ATTACHED'));
					}
					else if (error.CODE == 'NOT_VERIFIED')
					{
						BX.Voximplant.alert(BX.message('VI_CONFIG_RENT_ERROR_TITLE'), BX.message('VI_CONFIG_RENT_NOT_VERIFIED'));
					}
					else if (error.CODE == 'NO_MONEY')
					{
						BX.Voximplant.alert(BX.message('VI_CONFIG_RENT_ERROR_TITLE'), BX.message('VI_CONFIG_RENT_MONEY_LOW'));
					}
					else if (error.CODE == 'LIMIT_REACHED')
					{
						BX.Voximplant.showLicensePopup('numbers');
					}
					else
					{
						BX.Voximplant.alert(BX.message('VI_CONFIG_RENT_ERROR_TITLE'), BX.message('VI_CONFIG_RENT_AJAX_ERROR_2'));
					}
				}

			}, this),
			onfailure: function ()
			{
				BX.closeWait(self.nodes.container);
				self.blockAjax = false;
			}
		});
	};

	BX.Voximplant.rentPhone.prototype.unlinkPhone = function (id)
	{
		var self = this;
		if (this.blockAjax)
			return true;

		if (!confirm(BX.message('VI_CONFIG_RENT_PHONE_DELETE_CONFIRM')))
		{
			return false;
		}
		BX.showWait(this.nodes.container);

		this.blockAjax = true;
		BX.ajax({
			url: '/bitrix/components/bitrix/voximplant.config.rent/ajax.php?VI_UNLINK_NUMBER',
			method: 'POST',
			dataType: 'json',
			timeout: 60,
			data: {'VI_UNLINK_NUMBER': 'Y', 'NUMBER_ID': id, 'VI_AJAX_CALL': 'Y', 'sessid': BX.bitrix_sessid()},
			onsuccess: function (data)
			{
				BX.closeWait(self.nodes.container);
				self.blockAjax = false;
				if (data.ERROR == '')
				{
					BX('phone-confing-unlink-' + id).style.display = 'none';
					BX('phone-confing-link-' + id).style.display = 'inline-block';
				}
			},
			onfailure: function ()
			{
				BX.closeWait(self.nodes.container);
				self.blockAjax = false;
			}
		});
	};

	BX.Voximplant.rentPhone.prototype.cancelUnlinkPhone = function (id)
	{
		var self = this;
		if (this.blockAjax)
			return true;

		BX.showWait(this.nodes.container);

		this.blockAjax = true;
		BX.ajax({
			url: '/bitrix/components/bitrix/voximplant.config.rent/ajax.php?VI_CANCEL_UNLINK_NUMBER',
			method: 'POST',
			dataType: 'json',
			timeout: 60,
			data: {'VI_CANCEL_UNLINK_NUMBER': 'Y', 'NUMBER_ID': id, 'VI_AJAX_CALL': 'Y', 'sessid': BX.bitrix_sessid()},
			onsuccess: function (data)
			{
				BX.closeWait(self.nodes.container);
				self.blockAjax = false;
				if (data.ERROR == '')
				{
					BX('phone-confing-unlink-' + id).style.display = 'inline-block';
					BX('phone-confing-link-' + id).style.display = 'none';
				}
			},
			onfailure: function ()
			{
				BX.closeWait(self.nodes.container);
				self.blockAjax = false;
			}
		});
	};

	BX.Voximplant.rentPhone.prototype.setPriceFields = function ()
	{
		this.phoneNumberFullPrice = 0;
		if (parseFloat(this.country[this.currentCountry]['CATEGORIES'][this.currentCountryCategory].FULL_PRICE) > 0)
			this.phoneNumberFullPrice = parseFloat(this.country[this.currentCountry]['CATEGORIES'][this.currentCountryCategory].FULL_PRICE);

		this.phoneNumberMonthPrice = 0;
		if (parseFloat(this.country[this.currentCountry]['CATEGORIES'][this.currentCountryCategory].MONTH_PRICE) > 0)
			this.phoneNumberMonthPrice = parseFloat(this.country[this.currentCountry]['CATEGORIES'][this.currentCountryCategory].MONTH_PRICE);

		this.phoneNumberInstallationPrice = 0;
		if (parseFloat(this.country[this.currentCountry]['CATEGORIES'][this.currentCountryCategory].INSTALLATION_PRICE) > 0)
			this.phoneNumberInstallationPrice = parseFloat(this.country[this.currentCountry]['CATEGORIES'][this.currentCountryCategory].INSTALLATION_PRICE);

		this.phoneNumberCurrency = 'RUR';
		if (this.country[this.currentCountry]['CATEGORIES'][this.currentCountryCategory].CURRENCY)
			this.phoneNumberCurrency = this.country[this.currentCountry]['CATEGORIES'][this.currentCountryCategory].CURRENCY;
	};

	BX.Voximplant.rentPhone.prototype.drawOnPlaceholder = function (children)
	{
		this.placeholder.innerHTML = '';
		BX.adjust(this.placeholder, {children: children});
	};

	BX.Voximplant.rentPhone.prototype.formatVerifiedAddress = function (address)
	{
		var result = '';
		var field;
		var addressFields = ['ZIP_CODE', 'COUNTRY', 'CITY', 'STREET', 'BUILDING_NUMBER'];

		if (address.BUILDING_LETTER)
			address.BUILDING_NUMBER += '-' + address.BUILDING_LETTER;

		var first = true;
		addressFields.forEach(function (field)
		{
			if (address[field])
			{
				result += (first ? '' : ', ') + address[field];
				first = false;
			}
		});

		return result;
	};
})();