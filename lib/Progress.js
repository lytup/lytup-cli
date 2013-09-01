var os = require("os");
var util = require("util");
var colors = require("colors");
var _ = require("lodash");

var CLEAR_LINE = "\r\033[K";
var SPINNER = "|/-\\";

function Progress(progress) {
  var self = this;
  _.assign(self, progress);
  self.timer = setInterval(function() {
    var out = process.stdout;
    out.write(CLEAR_LINE);
    var status = util.format("uploading %s  |  %s  |  %s",
        SPINNER[self.i], self.percent, self.speed)
    out.write(status);
    if (++self.i === SPINNER.length) self.i = 0;
  }, 100);
  self.i = 0; // Spinner position
}

Progress.prototype.update = function(progress) {
  _.assign(this, progress);
};

Progress.prototype.close = function() {
  clearInterval(this.timer);
  process.stdout.write(os.EOL);
};

module.exports = Progress;