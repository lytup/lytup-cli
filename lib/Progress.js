var os = require("os");
var sprintf = require("sprintf");
var colors = require("colors");
var S = require("string");

var CLEAR_LINE = "\r\033[K";
var XFERRED_CHAR = "#";
var PENDING_CHAR = " ";
var BAR_LEN = 20;

exports.update = function(progress) {
  var out = process.stdout;
  out.write(CLEAR_LINE);
  var x = S(XFERRED_CHAR).repeat(~~(progress.xferred / progress.total * BAR_LEN)).s;
  var p = S(PENDING_CHAR).repeat(BAR_LEN - x.length).s;
  var bar = x.blue + p;
  var status = sprintf("[%s] %5s %s %11s", bar, progress.percent, "|".grey, progress.speed);
  out.write(status);
};

exports.stop = function() {
  console.log(os.EOL + "complete".green);
};