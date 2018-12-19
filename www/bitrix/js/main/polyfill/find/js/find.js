/**
 * Array.prototype.find polyfill
 */
;(function() {
	'use strict';

	if (typeof Array.prototype.find !== 'function')
	{
		Array.prototype.find = function(predicate, thisArg)
		{
			if (this === null)
			{
				throw new TypeError('Cannot read property \'find\' of null');
			}

			if (typeof predicate !== 'function')
			{
				throw new TypeError(typeof predicate + ' is not a function');
			}

			var arrLength = this.length;

			for (var i = 0; i < arrLength; i++)
			{
				if (predicate.call(thisArg, this[i], i, this))
				{
					return this[i];
				}
			}
		};
	}
})();