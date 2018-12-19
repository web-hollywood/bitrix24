<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetTitle("e-Orders");

if (SITE_TEMPLATE_ID == "bitrix24"):
	$html = '<div class="sidebar-buttons"><a href="#SITE_DIR#services/requests/my.php" class="sidebar-button">
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

		<tr><td align="center"><a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=VISITOR_ACCESS_#SITE_ID#"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Pass for visitor" alt="Pass for visitor" src="#SITE_DIR#images/en/requests/card.png" /></a>
		<br />

		<br />
		<a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=VISITOR_ACCESS_#SITE_ID#">Pass for
			<br />
			visitor</a></td>
		<td align="center"><a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=COURIER_DELIVERY_#SITE_ID#"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Courier delivery" alt="Courier delivery" src="#SITE_DIR#images/en/requests/package.jpg" /></a>
		<br />

		<br />
		<a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=COURIER_DELIVERY_#SITE_ID#">Courier
			<br />
			delivery</a></td><td align="center"><a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=BUSINESS_CARD_#SITE_ID#"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Cards" alt="Cards" src="#SITE_DIR#images/en/requests/viscard.png" /></a>
		<br />

		<br />
		<a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=BUSINESS_CARD_#SITE_ID#">Cards<br /></a></td><td align="center"><a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=OFFICE_SUPPLIES_#SITE_ID#"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Office supplies" alt="Office supplies" src="#SITE_DIR#images/en/requests/kanstov.jpg" /></a>
		<br />

		<br />
		<a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=OFFICE_SUPPLIES_#SITE_ID#">Office
			<br />
			supplies</a></td><td align="center"><a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=CONSUMABLES_#SITE_ID#"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Supplies and accessories for equipment" alt="Supplies and accessories for equipment" src="#SITE_DIR#images/en/requests/printer.jpg" /></a>
		<br />

		<br />
		<a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=CONSUMABLES_#SITE_ID#">Supplies and accessories
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

		<tr><td align="center"><a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=IT_TROUBLESHOOTING_#SITE_ID#"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Computers, equipment, networks" alt="Computers, equipment, networks" src="#SITE_DIR#images/en/requests/computer.jpg" /></a>
		<br />

		<br />
		<a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=IT_TROUBLESHOOTING_#SITE_ID#">Computers, equipment,
			<br />
			networks</a> </td><td align="center"><a href="/services/requests/form.php?WEB_FORM_ID=ADM_TROUBLESHOOTING_#SITE_ID#"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Maintenance services" alt="Maintenance services" src="#SITE_DIR#images/en/requests/tool.jpg" /></a>
		<br />

		<br />
		<a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=ADM_TROUBLESHOOTING_#SITE_ID#">Maintenance
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

		<tr><td align="center"><a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=DRIVER_SERVICES_#SITE_ID#"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Driver service" alt="Driver service" src="#SITE_DIR#images/en/requests/car_driver.jpg" /></a>
		<br />

		<br />
		<a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=DRIVER_SERVICES_#SITE_ID#">Driver
			<br />
			service</a>
		<br />
		</td><td align="center">
		<p align="center"><a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=HR_REQUEST_#SITE_ID#"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Staff recruitment" alt="Staff recruitment" src="#SITE_DIR#images/en/requests/person.jpg" /></a>
			<br />

			<br />
			<a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=HR_REQUEST_#SITE_ID#">Staff
			<br />
			recruitment</a> </p>
		</td><td align="center"><a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=WORK_SITE_#SITE_ID#"><img hspace="5" height="70" border="0" width="70" vspace="5" title="Workplace arrangement" alt="Workplace arrangement" src="#SITE_DIR#images/en/requests/office.jpg" /></a>
		<br />

		<br />
		<a href="#SITE_DIR#services/requests/form.php?WEB_FORM_ID=WORK_SITE_#SITE_ID#">Workplace
			<br />
			arrangement</a></td><td></td><td></td><td></td></tr>
	</tbody>
</table>
<?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>
