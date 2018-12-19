<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();
?>
<span style="display: inline-block;width: <?= $arResult['avatarSize'] ?>px;height: <?= $arResult['avatarSize'] ?>px;border-radius: 50%;vertical-align: middle;background: url(<?= htmlspecialcharsbx($arResult['image']['src']) ?>); background-size: <?= $arResult['avatarSize'] ?>px <?= $arResult['avatarSize'] ?>px;"></span>