
var RequestExecutor = function (method, options)
{
	this.method = method;
	this.options = options;
};

RequestExecutor.prototype = {
	__proto__: RequestExecutor.prototype,
	call: function ()
	{
		this.abortCurrentRequest();
		this.currentAnswer = null;
		BX.rest.callMethod(this.method, this.options, null, this.onRequestCreate.bind(this))
			.then(res => this.__internalHandler(res, false))
			.catch(res => this.__internalHandler(res, false));
	},
	callNext: function ()
	{
		if (this.hasNext())
		{
			this.abortCurrentRequest();
			this.currentAnswer.next()
				.then((res) => this.__internalHandler(res, true))
				.catch((res) => this.__internalHandler(res, true));
		}
	},
	abortCurrentRequest:function(){
		if(this.currentAjaxObject != null)
		{
			this.currentAjaxObject.abort();
		}
	},
	onRequestCreate:function(ajax){
		this.currentAjaxObject = ajax;
	},
	hasNext: function ()
	{
		return (this.currentAnswer != null && typeof this.currentAnswer.answer.next != "undefined");
	},
	getNextCount: function ()
	{
		if (this.hasNext())
		{
			return this.currentAnswer.answer.total - this.currentAnswer.answer.next > 50
				? 50
				: this.currentAnswer.answer.total - this.currentAnswer.answer.next;
		}

		return null;
	},
	getNext: function ()
	{
		if (this.hasNext())
		{
			return this.currentAnswer.answer.next;
		}
		return null;
	},
	__internalHandler: function (ajaxAnswer, loadMore)
	{
		let result = ajaxAnswer.answer.result;
		this.currentAnswer = ajaxAnswer;
		if (typeof this.handler == "function")
		{
			this.handler(result, loadMore)
		}
	},
	currentAnswer: null,
	handler: null
};