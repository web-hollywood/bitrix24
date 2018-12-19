/**
 * Array.prototype.includes polyfill
 */
(function() {
	'use strict';

	if (typeof Array.prototype.includes !== 'function')
	{
		Array.prototype.includes = function(element)
		{
			var result = this.find(function(currentElement) {
				return currentElement === element;
			});

			return result === element;
		};
	}
})();