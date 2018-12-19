<?php
namespace Bitrix\Bizproc\Automation\Engine;

use Bitrix\Bizproc\WorkflowInstanceTable;
use Bitrix\Bizproc\Automation\Target\BaseTarget;
use Bitrix\Main\InvalidOperationException;
use Bitrix\Main\Localization\Loc;

Loc::loadMessages(__FILE__);

class Runtime
{
	protected $target;
	protected static $startedTemplates = [];

	public function setTarget(BaseTarget $target)
	{
		$this->target = $target;
		return $this;
	}

	/**
	 * @return BaseTarget
	 * @throws InvalidOperationException
	 */
	public function getTarget()
	{
		if ($this->target === null)
		{
			throw new InvalidOperationException('Target must be set by setTarget method.');
		}

		return $this->target;
	}

	protected function getWorkflowInstanceIds()
	{
		$documentType = $this->getTarget()->getDocumentType();
		$documentId = $this->getTarget()->getDocumentId();
		$ids = WorkflowInstanceTable::getList(array(
			'select' => array('ID'),
			'filter' => array(
				'=STATE.MODULE_ID'             => $documentType[0],
				'=STATE.ENTITY'                => $documentType[1],
				'=STATE.DOCUMENT_ID'           => $documentId,
				'=STATE.TEMPLATE.DOCUMENT_TYPE' => $documentType[2],
				'=STATE.TEMPLATE.AUTO_EXECUTE' => \CBPDocumentEventType::Automation
			)
		))->fetchAll();

		return array_column($ids, 'ID');
	}

	protected function runTemplates($documentStatus)
	{
		$template = new Template($this->getTarget()->getDocumentType(), $documentStatus);

		if ($template->getId() > 0)
		{
			$errors = array();
			$trigger = $this->getTarget()->getAppliedTrigger();

			if (!$template->isExternalModified() && !$trigger && !$template->getRobots())
			{
				return false;
			}

			$documentType = $this->getTarget()->getDocumentType();
			$documentId = $this->getTarget()->getDocumentId();

			$this->setStarted($documentType[2], $documentId, $documentStatus);
			$workflowId = \CBPDocument::startWorkflow(
				$template->getId(),
				[$documentType[0], $documentType[1], $documentId],
				array(
					\CBPDocument::PARAM_TAGRET_USER => null, //Started by System
					\CBPDocument::PARAM_USE_FORCED_TRACKING => !$template->isExternalModified(),
					\CBPDocument::PARAM_IGNORE_SIMULTANEOUS_PROCESSES_LIMIT => true,
					\CBPDocument::PARAM_DOCUMENT_TYPE => $documentType,
				),
				$errors
			);

			if (!$errors && $trigger && $workflowId)
			{
				$this->writeTriggerTracking($workflowId, $trigger);
			}
		}
		return true;
	}

	protected function writeTriggerTracking($workflowId, $trigger)
	{
		$runtime = \CBPRuntime::getRuntime();
		$runtime->startRuntime();

		/** @var \CBPTrackingService $trackingService */
		$trackingService = $runtime->getService('TrackingService');

		$trackingService->write(
			$workflowId,
			\CBPTrackingType::Trigger,
			'APPLIED_TRIGGER',
			\CBPActivityExecutionStatus::Closed,
			\CBPActivityExecutionResult::Succeeded,
			'',
			$trigger['ID']
		);
	}

	protected function stopTemplates()
	{
		$errors = [];
		$instanceIds = $this->getWorkflowInstanceIds();
		$documentType = $this->getTarget()->getDocumentType();
		$documentId = [$documentType[0], $documentType[1], $this->getTarget()->getDocumentId()];
		foreach ($instanceIds as $instanceId)
		{
			\CBPDocument::terminateWorkflow(
				$instanceId,
				$documentId,
				$errors,
				Loc::getMessage('BIZPROC_AUTOMATION_TEMPLATE_TERMINATED')
			);
		}
	}

	/**
	 * Document creation handler.
	 * @throws InvalidOperationException
	 * @return void
	 */
	public function onDocumentAdd()
	{
		$status = $this->getTarget()->getDocumentStatus();
		$documentType = $this->getTarget()->getDocumentType()[2];
		$documentId = $this->getTarget()->getDocumentId();

		if ($status && !$this->isStarted($documentType, $documentId, $status))
		{
			$this->runTemplates($status);
		}
	}

	/**
	 * Document status changed handler.
	 * @throws InvalidOperationException
	 * @return void
	 */
	public function onDocumentStatusChanged()
	{
		$status = $this->getTarget()->getDocumentStatus();
		$documentType = $this->getTarget()->getDocumentType()[2];
		$documentId = $this->getTarget()->getDocumentId();

		if ($status && !$this->isStarted($documentType, $documentId, $status))
		{
			$this->stopTemplates();
			$this->runTemplates($status);
		}
	}

	/**
	 * Document moving handler.
	 * @return void
	 */
	public function onDocumentMove()
	{
		$this->stopTemplates();
	}

	private function setStarted($documentType, $documentId, $status)
	{
		$key = $documentType .'_'. $documentId;
		static::$startedTemplates[$key] = (string) $status;
		return $this;
	}

	private function isStarted($documentType, $documentId, $status)
	{
		$key = $documentType .'_'. $documentId;
		return (
			isset(static::$startedTemplates[$key])
			&& (string) $status === static::$startedTemplates[$key]
		);
	}
}