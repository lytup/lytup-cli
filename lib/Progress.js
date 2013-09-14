var sprintf = require("sprintf");
var colors = require("colors");
var S = require("string");

var XFERRED_CHAR = "#";
var PENDING_CHAR = " ";
var BAR_LEN = 30;

exports.update = function(progress) {
  var out = process.stdout;
  var x = S(XFERRED_CHAR).repeat(~~(progress.xferred / progress.total * BAR_LEN)).s;
  var p = S(PENDING_CHAR).repeat(BAR_LEN - x.length).s;
  var bar = x.green + p;
  var status = sprintf("[%s] %4s %s %11s", bar, progress.percent, "|".grey, progress.speed);
  out.clearLine();
  out.cursorTo(0);
  out.write(status);
};