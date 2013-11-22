var util = require('util');

module.exports = {
	humanizeBytes: function(bytes) {
		var unit = 1024;
		if (bytes < unit) return bytes + ' B';
		var exp = ~~ (Math.log(bytes) / Math.log(unit));
		var pre = 'KMGTPE'.charAt(exp - 1);
		return util.format('%s %sB', (bytes / Math.pow(unit, exp)).toFixed(1), pre);
	}
};
