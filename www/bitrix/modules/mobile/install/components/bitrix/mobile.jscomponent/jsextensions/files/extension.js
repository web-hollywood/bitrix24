(function ()
{
	include("MediaConverter");
	window.FileProcessing = {
		promiseList: {},
		resize: function (taskId, params)
		{
			return new Promise((resolve, reject) =>
			{
				this.promiseList[taskId] = (event, data) =>
				{
					if (event == "onSuccess")
					{
						if(data.path.indexOf("file://") == -1){
							data.path = "file://"+data.path;
						}
						resolve(data.path);
					}
					else
					{
						reject();
					}
				};

				MediaConverter.resize(taskId, params);
			});
		},
		cancel: function ()
		{

		},
		init: function ()
		{
			if(window.MediaConverter)
			{
				MediaConverter.setListener((event, data) =>
				{
					if (this.promiseList[data.id])
					{
						this.promiseList[data.id](event, data);
						delete this.promiseList[data.id];
					}
				});
			}
		},
	};

	FileProcessing.init();

	/** *********
	 * Consts
	 *********** */
	BX.FileConst = {
		READ_MODE: {
			STRING: "readAsText",
			BIN_STRING: "readAsBinaryString",
			DATA_URL: "readAsDataURL"
		}
	};

	/** *********
	 * Events
	 *********** */

	BX.FileUploadEvents = {
		FILE_CREATED: "onfilecreated",
		FILE_CREATED_FAILED: "onerrorfilecreate",
		FILE_UPLOAD_PROGRESS: "onprogress",
		FILE_UPLOAD_START: "onloadstart",
		FILE_UPLOAD_FAILED: "onfileuploadfailed",
		FILE_READ_ERROR: "onfilereaderror",
		ALL_TASK_COMPLETED: "oncomplete",
		TASK_TOKEN_DEFINED: "ontasktokendefined",
		TASK_STARTED_FAILED: "onloadstartfailed",
		TASK_CREATED: "ontaskcreated",
		TASK_CANCELLED: "ontaskcancelled",
		TASK_NOT_FOUND: "ontasknotfound"
	};

	/**
	 * @readonly
	 * @typedef {string} Events
	 * @enum {Events}
	 */
	let TaskEventConsts = BX.FileUploadEvents;

	BX.FileError = function (code, mess)
	{
		this.code = code;
		this.mess = mess;
	};

	/**
	 *
	 * @param {String} path
	 * @param {Function} action
	 * @returns {Promise}
	 */
	let resolveLocalFileSystemURL = (path, action) =>
	{
		return new Promise((resolve, reject) =>
			{
				window.resolveLocalFileSystemURL(path, entry => action(entry, resolve, reject), err => reject(err))
			}
		)
	};

	/** *********
	 * Utils
	 *********** */

	BX.FileUtils = {
		getFileEntry: (filePath) =>
		{
			if (filePath.indexOf("file://") < 0)
			{
				filePath = "file://" + filePath;
			}
			return resolveLocalFileSystemURL(filePath, (entry, resolve, reject) =>
			{
				if (entry.isFile)
				{
					resolve(entry);
				}
				else
				{
					reject(new FileError(100))
				}

			});
		},
		getFile: (filePath) =>
		{
			return new Promise((resolve, reject) =>
				BX.FileUtils.getFileEntry(filePath)
					.then(entry => entry.file(file => resolve(file)))
					.catch(e => reject(e))
			)
		},
		readFile: (file, readMode) =>
		{
			return new Promise((resolve, reject) =>
			{

				if (file instanceof File)
				{
					let reader = new FileReader();
					let mode = (readMode)
						? readMode
						: "readAsText";
					reader.onloadend = _ => resolve(reader.result);
					reader.onerror = e => reject({"Error reading": reader});
					reader[mode](file);
				}
				else
				{
					reject(new BX.FileError(102, "Parameter 'file' is not instance of 'File'"));
				}

			})
		},
		readFileEntry: (fileEntry, readMode) =>
		{
			return new Promise((resolve, reject) =>
			{
				if (fileEntry instanceof FileEntry)
				{
					fileEntry.file(
						file =>
						{
							BX.FileUtils.readFile(file, readMode)
								.then(result => resolve(result))
								.catch(e => reject(e))
						}
					)
				}
				else
				{
					reject(new BX.FileError(102, "Parameter 'file' is not instance of 'File'"));
				}
			})
		},
		readFileByPath: (url, readMode) =>
		{
			return new Promise((finalResolve, finalReject) =>
			{
				BX.FileUtils.getFileEntry(url)
					.then(
						fileEntry => BX.FileUtils.readFileEntry(fileEntry, readMode)
							.then(result => finalResolve(result))
							.catch(e => finalReject(e))
					)
					.catch(e => finalReject(e))
				;
			});
		},
		readDir: (path) =>
		{
			return resolveLocalFileSystemURL(path, (fileSystem, resolve, reject) =>
			{
				fileSystem.createReader().readEntries(entries => resolve(entries), err => reject(err));
			});
		},
		fileForReading: (path) =>
		{
			return new Promise((resolve, reject) =>
			{
				BX.FileUtils.getFile(path)
					.then(file =>
					{
						let fileEntry = new BX.File(file);
						fileEntry.originalPath = path;
						resolve(fileEntry);
					})
					.catch(e => reject(e))
			})
		}
	};

	/** *********
	 * File
	 *********** */
	BX.File = function (file)
	{
		this.init(file);
	};
	BX.File.toBXUrl = (path) =>
	{
		return "bx" + path;
	};
	BX.File.prototype = {
		readOffset: 0,
		init: function (file)
		{
			this.file = file;
			this.readOffset = 0;
			this.chunk = file.size;
			this.readMode = "readAsBinaryString";
		},
		getChunkSize: function ()
		{
			return this.chunk && this.chunk < this.file.size
				? Math.round(this.chunk)
				: this.file.size;
		},
		getSize: function ()
		{
			return this.file.size;
		},
		getType: function ()
		{
			return this.file.type;
		},
		getName: function ()
		{
			return this.file.name;
		},
		readNext: function ()
		{
			return new Promise((resolve, reject) =>
			{
				if (this.isEOF())
				{
					reject(new FileError(101))
				}
				else
				{
					let nextOffset = this.readOffset + this.chunk;
					let fileRange = this.file.slice(this.readOffset, nextOffset);
					BX.FileUtils.readFile(fileRange, this.readMode)
						.then(content =>
						{
							this.readOffset = nextOffset;
							resolve({content: content, start: fileRange.start, end: fileRange.end});
						})
						.catch(e => reject(e))
				}

			});
		},
		isEOF: function ()
		{
			return (this.readOffset >= this.file.size);
		},
		reset: function ()
		{
			this.readOffset = 0;
		}
	};

	/** *********
	 * Uploader
	 *********** */


	BX.FileDataSender = function (config)
	{
		this.config = config;
	};

	BX.FileDataSender.prototype = {
		start: function ()
		{
			return new Promise((resolve, reject) =>
			{
				"use strict";

				let config = this.config;
				let xhr = new XMLHTTPRequest(true);
				xhr.open("POST", config["url"]);

				if (config.headers)
				{
					Object.keys(config.headers).forEach(
						headerName => xhr.setRequestHeader(headerName, config.headers[headerName]))
				}
				if (config.timeout)
				{
					xhr.timeout = config.timeout;
				}

				if (config["onUploadProgress"])
				{
					if (Application.getPlatform() == "android")
					{
						xhr.upload = {};
					}
					xhr.upload.onprogress = config["onUploadProgress"];
				}

				xhr.onerror = e => reject({error: e});
				xhr.onload = () =>
				{
					var isSuccess = BX.ajax.xhrSuccess(xhr);
					if (isSuccess)
					{
						try
						{
							var json = BX.parseJSON(xhr.responseText);
							resolve(json);
						}
						catch (e)
						{
							reject({error: e});
						}
					}
					else
					{
						reject({error: {message: "XMLHTTPRequest error status " + xhr.status}});
					}
				};

				xhr.send(config["data"]);
				this.config = config = null;

			});
		},

	};

	/**
	 * @param config
	 * @returns {BX.FileDataSender}
	 */
	BX.FileDataSender.create = function (config)
	{
		return new BX.FileDataSender(config);
	};

	/**
	 *
	 * @param {Object} fileData
	 * @param defaultChunk
	 * @constructor
	 */
	BX.FileUploadTask = function (fileData, defaultChunk)
	{

		if (fileData)
		{
			this.applyData(fileData);
		}

		this.chunkSize = defaultChunk;
		this.fileEntry = null;
		this.listener = _ => null;
		this.token = null;
		this.status = Statuses.PENDING;
		this.lastEventData = {event: TaskEventConsts.TASK_CREATED, data: {}}
	};

	BX.FileUploadTask.Statuses = {
		PENDING: 0,
		PROGRESS: 1,
		DONE: 2,
		CANCELLED: 3,
		FAILED: 4,
	};

	/**
	 * @readonly
	 * @typedef {number} TaskStatus
	 * @enum {TaskStatus}
	 */

	let Statuses = BX.FileUploadTask.Statuses;

	BX.FileUploadTask.prototype = {
		progress: {byteSent: 0, percent: 0},
		/**
		 * @type {TaskStatus}
		 */
		status: Statuses.PROGRESS,
		lastEventData: {},
		wasProcessed: false,
		beforeCommitAction: null,
		afterCommitAction: null,
		beforeInitAction: null,
		applyData: function (fileData)
		{
			this.id = fileData.taskId || "";
			this.fileData = fileData;
		},
		start: function ()
		{
			this.status = Statuses.PROGRESS;
			this.status =
				this.startTime = (new Date()).getTime();
			this.initFileData().then(() =>
			{
				if (!this.fileEntry.folderId)
				{
					this.status = Statuses.FAILED;
					this.callListener(TaskEventConsts.TASK_STARTED_FAILED, {
						error: {code: 4, message: "The property 'folderId' is not set"}
					});
					return;
				}
				else
				{
					this.callListener(TaskEventConsts.FILE_UPLOAD_START, {});
					this.onNext();
				}
			}).catch(e =>
			{
				this.status = Statuses.FAILED;
				this.callListener(TaskEventConsts.TASK_STARTED_FAILED, {
					error: {code: 0, message: "Unknown error", error: e}
				});
			});
		},
		cancel: function ()
		{
			this.callListener(TaskEventConsts.TASK_CANCELLED, {});
			this.status = Statuses.CANCELLED;
		},
		isCancelled: function ()
		{
			return this.status == Statuses.CANCELLED;
		},
		isFinalStatus: function ()
		{
			return (
				this.status == Statuses.CANCELLED
				|| this.status == Statuses.DONE
				|| this.status == Statuses.FAILED
			)
		},
		initFileData: function ()
		{
			return new Promise((resolve, reject) =>
			{

				let readError = (e) =>
				{
					this.status = Statuses.FAILED;
					this.callListener(TaskEventConsts.FILE_READ_ERROR, {error: e});
					reject();
				};

				if (this.fileData)
				{
					this.beforeInit()
						.then(() =>
							{
								let url = null;
								if (this.fileData.url.startsWith("file://"))
								{
									url = this.fileData.url;
								}
								else
								{
									url = "file://" + this.fileData.url;
								}

								return BX.FileUtils.fileForReading(url)
									.then(entry =>
									{
										entry.params = this.fileData.params;
										entry.folderId = this.fileData.folderId;
										entry.chunk = this.fileData.chunk || this.chunkSize;
										this.fileEntry = entry;
										resolve();
									})
									.catch(e => readError(e));
							}
						);
				}
				else
				{
					readError()
				}
			});
		},
		commit: function ()
		{
			return new Promise(resolve =>
			{
				this.uploadPreview().then(previewData =>
					{
						let body = "";
						let headers = {};
						if (previewData)
						{

							// let comp = BX.utils.parseUrl(this.fileData.previewUrl);
							// console.error(comp);
							let previewName = "preview_" + this.fileEntry.getName() + ".jpg";
							let boundary = "FormUploaderBoundary";
							headers = {"Content-Type": "multipart/form-data; boundary=" + boundary};
							body = "--" + boundary + "\r\n" +
								"Content-Disposition: form-data; name=\"previewFile\"; filename=\"" + previewName + "\"\r\n" +
								"Content-Type: image/jpeg\r\n\r\n" + previewData + "\r\n\r\n" +
								"--" + boundary + "--";
						}

						BX.ajax({
							method: "POST",
							dataType: "json",
							prepareData: false,
							headers: headers,
							data: body,
							uploadBinary: true,
							url: "/bitrix/services/main/ajax.php?action=disk.api.file.createByContent&filename="
							+ this.fileEntry.getName()
							+ "&folderId=" + this.fileEntry.folderId
							+ "&contentId=" + this.token
							+ "&generateUniqueName=Y"
						}).then((res) =>
						{
							this.endTime = (new Date()).getTime();
							console.info("Task execution time:", (this.endTime - this.startTime) / 1000, this.fileEntry);
							this.status = Statuses.DONE;
							this.callListener(TaskEventConsts.FILE_CREATED, {result: res});
							resolve();

						}).catch(error =>
						{
							this.status = Statuses.FAILED;
							this.callListener(TaskEventConsts.FILE_CREATED_FAILED, {error: error});
							resolve();
						});
					}
				);
			});
		},

		onNext: function ()
		{
			if (!this.isCancelled())
			{
				this.fileEntry.readNext()
					.then(data =>
					{
						this.currentChunk = data;
						this.sendChunk(data);
					})
					.catch(e =>
					{
						this.currentChunk = null;
						if (e.code === 101) //eof
						{
							this.beforeCommit()
								.then(() => this.commit())
								.then(() => this.afterCommit())

						}
						else
						{
							this.status =
								this.callListener(TaskEventConsts.FILE_UPLOAD_FAILED, {error: e})
						}
					})
			}
			else
			{
				this.currentChunk = null;
			}

		},
		callAction: function (actionName)
		{
			return new Promise(resolve =>
			{
				if (typeof this[actionName] == "function" && this.hasOwnProperty(actionName))
				{
					let promise = this[actionName](this);
					if (promise instanceof Promise)
					{
						promise.then(() => resolve(), () => resolve());
					}
					else
					{
						resolve();
					}
				}
				else
				{
					resolve();
				}
			});
		},
		beforeInit: function ()
		{
			return this.callAction("beforeInitAction");
		},
		beforeCommit: function ()
		{
			return this.callAction("beforeCommitAction");
		},
		afterCommit: function ()
		{
			return this.callAction("afterCommitAction");
		},
		sendChunk: function (data)
		{
			let url = "/bitrix/services/main/ajax.php?action=disk.api.content.upload&filename="
				+ this.fileEntry.getName()
				+ (this.token ? "&token=" + this.token : "");

			let headers = {
				"Content-Type": this.fileEntry.getType(),
				"Content-Range": "bytes " + data.start + "-" + (data.end - 1) + "/" + this.fileEntry.getSize()
			};

			let config = {
				headers: headers,
				onUploadProgress: (e) =>
				{
					let currentTotalSent = data.start + e.loaded;
					this.progress.byteSent = currentTotalSent;
					this.progress.percent = Math.round((currentTotalSent / this.fileEntry.getSize()) * 100);
					this.callListener(TaskEventConsts.FILE_UPLOAD_PROGRESS, {
						percent: Math.round((currentTotalSent / this.fileEntry.getSize()) * 100),
						byteSent: currentTotalSent,
						byteTotal: this.fileEntry.getSize(),
					});
				},
				data: data.content,
				url: url
			};

			let error = e =>
			{
				this.status = Statuses.FAILED;
				let error = {};
				if (e.xhr)
				{
					error = {
						message: "Ajax request error",
						code: 0
					}
				}
				else
				{
					error = e;
				}

				this.callListener(TaskEventConsts.FILE_CREATED_FAILED, {error: error})
			};

			BX.FileDataSender.create(config).start()
				.then(res =>
				{
					if (!res.status || res.status !== "success")
					{
						error({code: 0, message: "wrong response", response: res});
					}
					else
					{
						if (res.data.token && this.token == null)
						{
							this.token = res.data.token;

							this.callListener(TaskEventConsts.TASK_TOKEN_DEFINED, {token: this.token});
						}

						this.onNext();
					}
				})
				.catch(data =>
				{
					if (data.error.code && data.error.code == -2 && data.error.code == 0) //offline
					{
						console.warn("Wait for online....");
						let sendChuckWhenOnline = () =>
						{
							BX.removeCustomEvent("online", sendChuckWhenOnline);
							this.sendChunk(this.currentChunk);
						};
						BX.addCustomEvent("online", sendChuckWhenOnline);
					}
					else
					{
						error(data);
					}
				});
		},
		uploadPreview: function ()
		{
			return new Promise((resolve) =>
			{
				if (this.fileData.previewUrl)
				{
					BX.FileUtils.readFileByPath(this.fileData.previewUrl, "readAsBinaryString")
						.then(result => resolve(result), () => resolve())
				}
				else
				{
					resolve();
				}
			})
		},
		/**
		 *
		 * @param {Events} event
		 * @param data
		 */
		callListener: function (event, data)
		{
			if (!this.isCancelled())
			{
				if (data && !data.file && this.fileEntry)
				{
					data.file = {
						params: this.fileEntry.params,
						folderId: this.fileEntry.folderId,
					};
				}
				this.lastEventData = {event: event, data: data};
				this.listener(event, data, this);
			}
		}
	};

	BX.FileUploader = function (listener, options)
	{

		/**
		 * file data format:
		 *   url - path to file
		 *   name - name of file
		 *   type - type of file (jpeg, png, pdf and etc.)
		 */


		let uploaderOptions = options || {};
		this.chunk = uploaderOptions.chunk || null;
		this.listener = listener;
		this.queue = [];
	};

	BX.FileUploader.prototype = {
		/**
		 * @param taskId
		 * @returns {BX.FileUploadTask}
		 */
		getTask: function (taskId)
		{
			let tasks = this.queue.filter(task => task.id === taskId);
			if (tasks.length > 0)
			{
				return tasks[0];
			}
			return null;
		},
		/**
		 * @param fileData
		 * @config {string} url path to file
		 * @config {string} name - name of file
		 * @config {string} taskId - task id
		 * @config {string} folderId - folder id
		 * @config {any} params object
		 */
		addTaskFromData: function (fileData)
		{
			if (!fileData.taskId)
			{
				console.error("Add task error: 'taskId' must be defined");
				return;
			}

			let task = new BX.FileUploadTask(fileData, this.chunk);
			this.addTask(task);
		},
		/**
		 * @param taskId
		 */
		cancelTask: function (taskId)
		{
			/**
			 * @type {BX.FileUploadTask}
			 */
			let task = this.queue.find(queueItem => queueItem.id == taskId);

			if (task)
			{
				task.cancel();
			}

		},
		/**
		 * @param {BX.FileUploadTask} taskEntry
		 */
		addTask: function (taskEntry)
		{
			taskEntry.status = Statuses.PENDING;
			taskEntry.listener = (event, data, task) => this.onTaskEvent(event, data, task);
			this.onTaskCreated(taskEntry)
		},
		onTaskEvent: function (event, data, task)
		{
			if (this.listener)
			{
				this.listener(event, data, task);
			}
			this.attemptToStartNextTask();
		},
		onTaskCreated: function (task)
		{
			this.onTaskEvent(TaskEventConsts.TASK_CREATED, {}, task);
			this.queue.push(task);
			this.attemptToStartNextTask();
		},
		attemptToStartNextTask: function ()
		{
			let inProgressTasks = this.queue.filter(queueTask =>
				queueTask.status === Statuses.PROGRESS);
			if (inProgressTasks.length <= 10)
			{
				let pendingTasks = this.queue.filter(queueTask =>
					queueTask.status === Statuses.PENDING);
				if (pendingTasks.length > 0)
				{
					pendingTasks[0].start();
				}
			}
		}
	};
})();