var sprintf = require("sprintf");

var utility = {
  humanizeBytes: function(bytes) {
    var unit = 1024;
    if (bytes < unit) return bytes + " B";
    var exp = ~~ (Math.log(bytes) / Math.log(unit));
    var pre = "KMGTPE".charAt(exp - 1);
    return sprintf("%s %sB", (bytes / Math.pow(unit, exp)).toFixed(1), pre);
  }
}

module.exports = utility;