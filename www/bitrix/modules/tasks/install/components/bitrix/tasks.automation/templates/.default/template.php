<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();
/** @var array $arResult */

if (\Bitrix\Tasks\Integration\Bizproc\Document\Task::isProjectTask($arResult['DOCUMENT_TYPE']))
{
	$titleView = GetMessage('TASKS_AUTOMATION_CMP_TITLE_VIEW');
	$titleEdit = GetMessage('TASKS_AUTOMATION_CMP_TITLE_TASK_EDIT');
}
elseif (\Bitrix\Tasks\Integration\Bizproc\Document\Task::isPlanTask($arResult['DOCUMENT_TYPE']))
{
	$titleView = GetMessage('TASKS_AUTOMATION_CMP_TITLE_VIEW_PLAN');
	$titleEdit = GetMessage('TASKS_AUTOMATION_CMP_TITLE_TASK_EDIT_PLAN');
}
else
{
	$titleView = GetMessage('TASKS_AUTOMATION_CMP_TITLE_VIEW_STATUSES');
	$titleEdit = GetMessage('TASKS_AUTOMATION_CMP_TITLE_TASK_EDIT_STATUSES');
}

if ($arResult['TASK_CAPTION'])
{
	$titleView = GetMessage('TASKS_AUTOMATION_CMP_TITLE_TASK_VIEW', array('#TITLE#' => $arResult['TASK_CAPTION']));
}

global $APPLICATION;
\CUtil::initJSCore('tasks_integration_socialnetwork');
?>
<div class="tasks-automation">
	<? $APPLICATION->IncludeComponent('bitrix:bizproc.automation', '', [
			'DOCUMENT_TYPE' => ['tasks', \Bitrix\Tasks\Integration\Bizproc\Document\Task::class, $arResult['DOCUMENT_TYPE']],
			'DOCUMENT_ID' => $arResult['TASK_ID'] ?: null,
			'TITLE_VIEW' => $titleView,
			'TITLE_EDIT' => $titleEdit,
			'MARKETPLACE_ROBOT_CATEGORY' => 'tasks_bots',
			'MARKETPLACE_TRIGGER_PLACEMENT' => 'TASKS_ROBOT_TRIGGERS',
	], $this); ?>
</div>
<script>
	BX.ready(function()
	{
		var viewType = '<?=CUtil::JSEscape($arResult['VIEW_TYPE'])?>';
		var toolbarNode = document.querySelector('[data-role="automation-base-toolbar"]');
		if (!toolbarNode)
		{
			return;
		}

		var selectorNode = BX.create('button', {
			attrs: {className: 'ui-btn ui-btn-light-border ui-btn-dropdown tasks-automation-group-selector'},
			text: '<?=CUtil::JSEscape($arResult['GROUPS_SELECTOR']['CAPTION'])?>'
		});

		if (viewType === 'plan')
		{
			selectorNode.textContent = '<?=GetMessageJS('TASKS_AUTOMATION_CMP_SELECTOR_ITEM_PLAN')?>';
		}
		else if (viewType === 'personal')
		{
			selectorNode.textContent = '<?=GetMessageJS('TASKS_AUTOMATION_CMP_SELECTOR_ITEM_PERSONAL')?>';
		}

		toolbarNode.insertBefore(selectorNode, toolbarNode.firstChild);

		var menu = null;
		var groups = <?=\Bitrix\Main\Web\Json::encode($arResult['GROUPS_SELECTOR']['GROUPS'])?>;
		var currentGroupId = <?= (int)$arResult['PROJECT_ID']?>;

		BX.bind(selectorNode, 'click', function(event)
		{
			if (menu === null)
			{
				var projectMenuItems = [];

				var clickHandler = function (e, item)
				{
					menu.close();
					if (item.id === currentGroupId && viewType === 'project')
					{
						return;
					}

					// top.BX.onCustomEvent(top.window, 'BX.Kanban.ChangeGroup', [item.id, currentGroupId]);

					selectorNode.innerHTML = item.text;
					window.location.href = BX.util.add_url_param(window.location.href, {project_id: item.id, view: 'project'});
				};

				// fill menu array
				for (var i = 0, c = groups.length; i < c; i++)
				{
					projectMenuItems.push({
						id: parseInt(groups[i]["id"]),
						text: BX.util.htmlspecialchars(groups[i]["text"]),
						class: 'menu-popup-item-none',
						onclick: BX.delegate(clickHandler, this)
					});

				}
				//select new group
				if (groups.length > 0)
				{
					projectMenuItems.push({delimiter: true});
					projectMenuItems.push({
						id: "new",
						text: '<?=GetMessageJS('TASKS_AUTOMATION_CMP_CHOOSE_GROUP')?>',
						onclick: function ()
						{
							var selector = new BX.Tasks.Integration.Socialnetwork.NetworkSelector({
								scope: BX.proxy_context,
								id: "group-selector",
								mode: "group",
								query: false,
								useSearch: true,
								useAdd: false,
								parent: this,
								popupOffsetTop: 5,
								popupOffsetLeft: 40
							});
							selector.bindEvent("item-selected", function (data)
							{
								clickHandler(null, {
									id: data.id,
									text: data.nameFormatted.length > 50
										? data.nameFormatted.substring(0, 50) + "..."
										: data.nameFormatted
								});
								selector.close();
							});
							selector.open();
						}
					});
				}
				// create menu
				menu = BX.PopupMenu.create(
					'tasks-automation-view-selector-' + BX.util.getRandomString(),
					selectorNode,
					[
						{
							text: '<?=GetMessageJS('TASKS_AUTOMATION_CMP_SELECTOR_ITEM_PROJECTS')?>',
							items: projectMenuItems
						},
						{
							text: '<?=GetMessageJS('TASKS_AUTOMATION_CMP_SELECTOR_ITEM_PLAN')?>',
							onclick: function(e, item)
							{
								menu.close();
								selectorNode.textContent = item.text;
								window.location.href = BX.util.add_url_param(window.location.href, {view: 'plan'});
							}
						},
						{
							text: '<?=GetMessageJS('TASKS_AUTOMATION_CMP_SELECTOR_ITEM_PERSONAL')?>',
							onclick: function(e, item)
							{
								menu.close();
								selectorNode.textContent = item.text;
								window.location.href = BX.util.add_url_param(window.location.href, {view: 'personal'});
							}
						}
					],
					{
						autoHide: true,
						closeByEsc: true
					}
				);
			}
			menu.popupWindow.show();
		});
	});
</script>