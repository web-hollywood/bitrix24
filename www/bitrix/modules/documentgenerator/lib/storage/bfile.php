<?php

namespace Bitrix\DocumentGenerator\Storage;

use Bitrix\DocumentGenerator\Driver;
use Bitrix\Main\Error;
use Bitrix\Main\IO\Path;
use Bitrix\Main\Entity\AddResult;

class BFile extends File
{
	/**
	 * Try to read content. Returns string on success, false on failure.
	 *
	 * @param mixed $fileId
	 * @return false|string
	 */
	public function read($fileId)
	{
		if(intval($fileId) > 0)
		{
			$path = \CFile::getPath($fileId);
			if($path)
			{
				return parent::read($path);
			}
			else
			{
				echo 'file '.$fileId.' not found';
			}
		}
		else
		{
			echo 'file id '.$fileId.' is not integer';
		}

		return false;
	}

	/**
	 * Save $content. Returns true on success, false on failure.
	 *
	 * @param string $content
	 * @param array $options
	 * @return AddResult
	 */
	public function write($content, array $options = [])
	{
		$result = parent::write($content, $options);
		if($result->isSuccess())
		{
			$filePath = $result->getId();
			$contentType = false;
			if(isset($options['contentType']))
			{
				$contentType = $options['contentType'];
			}
			$fileDescription = \CFile::MakeFileArray($filePath, $contentType);
			if($fileDescription)
			{
				$fileId = \CFile::SaveFile($fileDescription, Driver::MODULE_ID);
				parent::delete($filePath);
				$result->setId($fileId);
			}
			else
			{
				$result->addError(new Error('Cant get file description from '.$filePath));
			}
		}

		return $result;
	}

	/**
	 * @param int $fileId
	 * @param string $fileName
	 * @return bool
	 */
	public function download($fileId, $fileName = '')
	{
		if(intval($fileId) > 0)
		{
			$fileDescription = \CFile::GetFileArray($fileId);
			$options = [];
			if($fileName)
			{
				$options['attachment_name'] = $this->correctFileName($fileName);
			}
			\CFile::ViewByUser($fileDescription, $options);
			return true;
		}
		else
		{
			echo 'file id '.$fileId.' is not integer';
		}

		return false;
	}

	/**
	 * @param mixed $fileId
	 * @return bool
	 */
	public function delete($fileId)
	{
		if(intval($fileId) > 0)
		{
			\CFile::Delete($fileId);
		}

		return true;
	}

	/**
	 * @param int $fileId
	 * @return false|int
	 */
	public function getModificationTime($fileId)
	{
		if(intval($fileId) > 0)
		{
			$file = \CFile::GetByID($fileId)->Fetch();
			if($file)
			{
				return intval(MakeTimeStamp($file["TIMESTAMP_X"]));
			}
		}

		return false;
	}

	/**
	 * @param array $file
	 * @return AddResult
	 */
	public function upload(array $file)
	{
		$result = new AddResult();
		$fileId = \CFile::saveFile($file, Driver::MODULE_ID, true, true);
		if($fileId > 0)
		{
			$result->setId($fileId);
		}
		else
		{
			$result->addError(new Error('Cant save file to b_file'));
		}

		return $result;
	}

	/**
	 * @param mixed $fileId
	 * @return false|int
	 */
	public function getSize($fileId)
	{
		if(intval($fileId) > 0)
		{
			$file = \CFile::GetByID($fileId)->Fetch();
			if($file)
			{
				return $file['FILE_SIZE'];
			}
			else
			{
				echo 'file '.$fileId.' not found';
			}
		}
		else
		{
			echo 'file id '.$fileId.' is not integer';
		}

		return false;
	}

	/**
	 * @param string $fileName
	 * @return string
	 */
	protected function correctFileName($fileName)
	{
		$fileName = Path::replaceInvalidFilename($fileName, function(){
			return '_';
		});

		$correctedFileName = preg_replace('~\x{00a0}~siu', ' ', $fileName);
		if($correctedFileName !== null)
		{
			$fileName = $correctedFileName;
		}

		return $fileName;
	}
}