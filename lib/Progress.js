var os = require("os");
var util = require("util");
var colors = require("colors");
var _ = require("lodash");

var CLEAR_LINE = "\r\033[K";
var SPINNER = "|/-\\";

function Progress() {
  this.percent = "---";
  this.speed = "---";
  this.timer = null;
  this.i = 0; // Spinner position
}

Progress.prototype.start = function() {
  var self = this;
  self.timer = setInterval(function() {
    var out = process.stdout;
    out.write(CLEAR_LINE);
    var status = util.format("transferring %s  |  %s  |  %s",
      SPINNER[self.i], self.percent, self.speed)
    out.write(status);
    if (++self.i === SPINNER.length) self.i = 0;
  }, 100);
}

Progress.prototype.update = function(progress) {
  _.assign(this, progress);
};

Progress.prototype.stop = function() {
  clearInterval(this.timer);
  console.log(os.EOL + "complete");
};

module.exports = Progress;