BX.namespace("BX.Voximplant");

BX.Voximplant.BackupLine = {
	init: function(ajaxUrl)
	{
		var button = BX('backup_number_btn');
		BX.bind(button, 'click', function() {
			var node = BX.create('SPAN', {props : {className : "wait"}});
			BX.addClass(button, "webform-small-button-wait webform-small-button-active");
			this.appendChild(node);
			BX.ajax({
				method: 'POST',
				url: ajaxUrl + "?action=saveBackupNumber",
				data: {
					ACTION: 'saveBackupNumber',
					BACKUP_NUMBER: BX('vi-backup-number').value,
					BACKUP_LINE: BX('vi-backup-line').value,
					sessid : BX.bitrix_sessid()
				},
				dataType: 'json',
				onsuccess: function()
				{
					BX.removeClass(button, "webform-small-button-wait webform-small-button-active");
					BX.remove(node);
				},
				onfailure: function()
				{
					BX.removeClass(button, "webform-small-button-wait webform-small-button-active");
					BX.remove(node);
				}
			});
			return false;
		});

		BX.bind(BX('vi-backup-number'), 'input', function(e)
		{
			var node = e.target;
			node.value = node.value.replace(/[^\d+]/g, '');
			e.preventDefault();
		});
	}
};