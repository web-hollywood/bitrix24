<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true)
{
	die();
}

use \Bitrix\Main\Localization\Loc;
use \Bitrix\Main\UI\Extension;

Extension::load('ui.buttons');
Extension::load('ui.buttons.icons');
Extension::load('ui.alerts');
Extension::load('ui.progressbar');

\CJSCore::init(array('landing_master'));
\CJSCore::init('loader');
\Bitrix\Main\Page\Asset::getInstance()->addJs(
	'/bitrix/js/landing/utils.js'
);

\Bitrix\Main\Page\Asset::getInstance()->addJs(
	'/bitrix/components/bitrix/landing.site_edit/templates/.default/landing-forms.js'
);

\Bitrix\Landing\Manager::setPageTitle(
	Loc::getMessage('LANDING_TPL_TITLE')
);
$request = \Bitrix\Main\Application::getInstance()->getContext()->getRequest();
$colors = $arResult['COLORS'];
$themeCurr = $arResult['THEME_CURRENT'] ? $arResult['THEME_CURRENT'] : null;
$themeSite = $arResult['THEME_SITE'] ? $arResult['THEME_SITE'] : $arResult['THEME_CURRENT'];
$template = $arResult['TEMPLATE'];

if (!$template)
{
	\showError(Loc::getMessage('LANDING_404_ERROR'));
	return;
}

$createStore = ($arParams['SITE_ID'] <= 0 && $template['TYPE'] == 'STORE');
if ($createStore)
{
	$uriSelect = new \Bitrix\Main\Web\Uri($arResult['CUR_URI']);
	$uriSelect->addParams(array(
		'stepper' => 'store',
		'param' => isset($template['DATA']['parent'])
			? $template['DATA']['parent']
			: $template['ID'],
		'sessid' => bitrix_sessid()
	));
}
else
{
	$uriSelect = new \Bitrix\Main\Web\Uri($arResult['CUR_URI']);
	$uriSelect->addParams(array(
		'action' => 'select',
		'param' => isset($template['DATA']['parent'])
			? $template['DATA']['parent']
			: $template['ID'],
		'sessid' => bitrix_sessid()
	));
}
?>
<div class="landing-template-preview-body">
    <div class="landing-template-preview">
        <div class="preview-container">
            <div class="preview-left">
                <div class="preview-desktop">
                    <div class="preview-desktop-body">
                        <div class="preview-desktop-body-image">
							<?if ($template['URL_PREVIEW']):?>
                            <iframe src="<?= \htmlspecialcharsbx($template['URL_PREVIEW']);?>" class="preview-desktop-body-preview-frame"></iframe>
							<?endif;?>
                        </div>
                        <div class="preview-desktop-body-loader-container"></div>
                    </div>
                </div>
            </div>
            <div class="preview-right">
                <div class="landing-template-preview-info">
                    <div class="pagetitle-wrap">
                        <div class="pagetitle-inner-container">
                            <div class="pagetitle">
							<span id="pagetitle" class="pagetitle-item">
								<?= \htmlspecialcharsbx($template['TITLE']);?>
							</span>
                            </div>
                        </div>
                    </div>

                    <div class="landing-template-preview-description">
                        <p><?= \htmlspecialcharsbx($template['DESCRIPTION']);?></p>
                    </div>

					<?if ($template['URL_PREVIEW']):?>
                    <div class="landing-template-preview-settings">
                        <div class="landing-template-preview-header">
							<?= Loc::getMessage('LANDING_TPL_HEADER_COLOR');?>
                        </div>
						<div class="landing-template-preview-palette" data-name="theme">
							<?foreach ($colors as $code => $color):
								if (!isset($color['base']) || $color['base'] !== true)
								{
									continue;
								}
								?>
                                <div data-value="<?= $code;?>" data-src="<?= \htmlspecialcharsbx($template['URL_PREVIEW']);?><?
								?><?= strpos($template['URL_PREVIEW'], '?') === false ? '?' : '&amp;';?>theme=<?= $code;?>" <?
								?>class="landing-template-preview-palette-item<?= $themeCurr == $code ? ' active' : '';?>" <?
									 ?>style="background-color: <?= $color['color'];?>;"><span></span></div>
							<?endforeach;?>
						</div>
	
						<? // add USE SITE COLOR setting only for adding page in exist site?>
						<? // always ACTIVE by default!?>
						<? if ($arParams['SITE_ID']): ?>
							<div class="landing-template-preview-sitecolor">
								<div class="landing-template-preview-palette-sitecolor" data-name="theme_use_site">
									<div data-value="<?= $themeSite; ?>"
										 data-src="<?= \htmlspecialcharsbx($template['URL_PREVIEW']); ?><?
										 ?><?= strpos($template['URL_PREVIEW'],
											 '?') === false ? '?' : '&amp;'; ?>theme=<?= $themeSite; ?>"
										 class="landing-template-preview-palette-item active landing-template-preview-palette-item-sitecolor"
										 style="background-color: <?= $colors[$themeSite]['color'];?>"><span></span>
									</div>
								</div>
								<div class="landing-template-preview-header landing-template-preview-header-sitecolor">
									&mdash;&nbsp;<?= Loc::getMessage('LANDING_TPL_COLOR_USE_SITE'); ?>
								</div>

							</div>
						<? endif; ?>
					</div>
					<? endif; ?>
                </div>
            </div>
        </div>

        <div class="<?if ($request->get('IFRAME') == 'Y'){?>landing-edit-footer-fixed <?}?>pinable-block">
            <div class="landing-form-footer-container">
			<?
			if ($createStore)
			{
				?>
				<span data-href="<?= $uriSelect->getUri(); ?>" class="ui-btn ui-btn-success landing-template-preview-create"
				   title="<?= Loc::getMessage('LANDING_TPL_BUTTON_CREATE'); ?>">
					<?= Loc::getMessage('LANDING_TPL_BUTTON_CREATE'); ?>
				</span>
				<?
			}
			else
			{
				?>
				<a href="<?= $uriSelect->getUri(); ?>" class="ui-btn ui-btn-success landing-template-preview-create"
				   value="<?= Loc::getMessage('LANDING_TPL_BUTTON_CREATE'); ?>">
					<?= Loc::getMessage('LANDING_TPL_BUTTON_CREATE'); ?>
				</a href="<?= $uriSelect->getUri(); ?>">
				<?
			}
			?>
			<span class="ui-btn ui-btn-md ui-btn-link landing-template-preview-close">
					<?= Loc::getMessage('LANDING_TPL_BUTTON_CANCEL');?>
                </span>
            </div>
        </div>
    </div>
</div>

<?if ($template['URL_PREVIEW']):?>
<script type="text/javascript">
	// Force init template preview layout
	BX.Landing.TemplatePreview.getInstance({
		createStore: <?=($createStore ? 'true' : 'false'); ?>,
		messages: {
			LANDING_LOADER_WAIT: "<?= \CUtil::jsEscape(Loc::getMessage('LANDING_LOADER_WAIT'));?>"
		}
	});

	BX.ready(function(){
		new BX.Landing.SaveBtn(document.querySelector(".landing-template-preview-create"));
	});

</script>
<?endif;?>