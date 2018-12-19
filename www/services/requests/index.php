<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetTitle("e-Orders");

if (SITE_TEMPLATE_ID == "bitrix24"):
	$html = '<div class="sidebar-buttons"><a href="/services/requests/my.php" class="sidebar-button">
			<span class="sidebar-button-top"><span class="corner left"></span><span class="corner right"></span></span>
			<span class="sidebar-button-content"><span class="sidebar-button-content-inner"><i class="sidebar-button-create"></i><b>My Orders</b></span></span>
			<span class="sidebar-button-bottom"><span class="corner left"></span><span class="corner right"></span></span></a></div>';
	$APPLICATION->AddViewContent("sidebar", $html);
endif?>
<p>Select the required order type and fill in the order form.</p>
<table cellspacing="0" cellpadding="3" border="0" width="100%">
	<tbody>
		<tr><td colspan="6"><b>Request for supplies and services</b>
		<br />

		<br />
		</td></tr>

		<tr><td align="center"><a href="/services/requests/form.php?WEB_FORM_ID=VISITOR_ACCESS_s1"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Pass for visitor" alt="Pass for visitor" src="/images/en/requests/card.png" /></a>
		<br />

		<br />
		<a href="/services/requests/form.php?WEB_FORM_ID=VISITOR_ACCESS_s1">Pass for
			<br />
			visitor</a></td>
		<td align="center"><a href="/services/requests/form.php?WEB_FORM_ID=COURIER_DELIVERY_s1"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Courier delivery" alt="Courier delivery" src="/images/en/requests/package.jpg" /></a>
		<br />

		<br />
		<a href="/services/requests/form.php?WEB_FORM_ID=COURIER_DELIVERY_s1">Courier
			<br />
			delivery</a></td><td align="center"><a href="/services/requests/form.php?WEB_FORM_ID=BUSINESS_CARD_s1"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Cards" alt="Cards" src="/images/en/requests/viscard.png" /></a>
		<br />

		<br />
		<a href="/services/requests/form.php?WEB_FORM_ID=BUSINESS_CARD_s1">Cards<br /></a></td><td align="center"><a href="/services/requests/form.php?WEB_FORM_ID=OFFICE_SUPPLIES_s1"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Office supplies" alt="Office supplies" src="/images/en/requests/kanstov.jpg" /></a>
		<br />

		<br />
		<a href="/services/requests/form.php?WEB_FORM_ID=OFFICE_SUPPLIES_s1">Office
			<br />
			supplies</a></td><td align="center"><a href="/services/requests/form.php?WEB_FORM_ID=CONSUMABLES_s1"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Supplies and accessories for equipment" alt="Supplies and accessories for equipment" src="/images/en/requests/printer.jpg" /></a>
		<br />

		<br />
		<a href="/services/requests/form.php?WEB_FORM_ID=CONSUMABLES_s1">Supplies and accessories
			<br />
			for equipment</a> </td><td align="center">
		<br />
		</td></tr>

		<tr><td colspan="6">
		<br />

		<br />
		</td></tr>

		<tr><td colspan="6"><b>Resolve problems</b>
		<br />

		<br />
		</td></tr>

		<tr><td align="center"><a href="/services/requests/form.php?WEB_FORM_ID=IT_TROUBLESHOOTING_s1"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Computers, equipment, networks" alt="Computers, equipment, networks" src="/images/en/requests/computer.jpg" /></a>
		<br />

		<br />
		<a href="/services/requests/form.php?WEB_FORM_ID=IT_TROUBLESHOOTING_s1">Computers, equipment,
			<br />
			networks</a> </td><td align="center"><a href="/services/requests/form.php?WEB_FORM_ID=ADM_TROUBLESHOOTING_s1"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Maintenance services" alt="Maintenance services" src="/images/en/requests/tool.jpg" /></a>
		<br />

		<br />
		<a href="/services/requests/form.php?WEB_FORM_ID=ADM_TROUBLESHOOTING_s1">Maintenance
			<br />
			services</a> </td><td align="center">
		<br />
		</td><td align="center">
		<br />
		</td><td></td><td></td></tr>

		<tr><td colspan="6">
		<br />

		<br />
		</td></tr>

		<tr><td colspan="6"><b>Administrative services</b>
		<br />

		<br />
		</td></tr>

		<tr><td align="center"><a href="/services/requests/form.php?WEB_FORM_ID=DRIVER_SERVICES_s1"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Driver service" alt="Driver service" src="/images/en/requests/car_driver.jpg" /></a>
		<br />

		<br />
		<a href="/services/requests/form.php?WEB_FORM_ID=DRIVER_SERVICES_s1">Driver
			<br />
			service</a>
		<br />
		</td><td align="center">
		<p align="center"><a href="/services/requests/form.php?WEB_FORM_ID=HR_REQUEST_s1"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Staff recruitment" alt="Staff recruitment" src="/images/en/requests/person.jpg" /></a>
			<br />

			<br />
			<a href="/services/requests/form.php?WEB_FORM_ID=HR_REQUEST_s1">Staff
			<br />
			recruitment</a> </p>
		</td><td align="center"><a href="/services/requests/form.php?WEB_FORM_ID=WORK_SITE_s1"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Workplace arrangement" alt="Workplace arrangement" src="/images/en/requests/office.jpg" /></a>
		<br />

		<br />
		<a href="/services/requests/form.php?WEB_FORM_ID=WORK_SITE_s1">Workplace
			<br />
			arrangement</a></td><td></td><td></td><td></td></tr>
	</tbody>
</table>
<?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>
