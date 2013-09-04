var os = require("os");
var util = require("util");
var colors = require("colors");
var _ = require("lodash");

var CLEAR_LINE = "\r\033[K";
var SPINNER = "|/-\\";

function Progress(progress) {
  _.assign(this, progress);
  this.i = 0; // Spinner position
}

Progress.prototype.start = function(info) {
  console.log(info);
  var self = this;
  self.timer = setInterval(function() {
    self.display();
  }, 100);
}

Progress.prototype.display = function() {
  var out = process.stdout;
  out.write(CLEAR_LINE);
  var status = util.format(" %s %s %s %s %s",
    SPINNER[this.i].blue, "|".grey, this.percent, "|".grey, this.speed)
  out.write(status);
  if (++this.i === SPINNER.length) this.i = 0;
};

Progress.prototype.update = function(progress) {
  _.assign(this, progress);
};

Progress.prototype.stop = function() {
  clearInterval(this.timer);
  this.display();
  process.stdout.write(os.EOL + "complete".green + os.EOL);
};

module.exports = Progress;