// var sprintf = require("sprintf");
var util = require('util'),
	colors = require('colors'),
	S = require('string'),
	Util = require('./util');

var TRNASFERRED_CHAR = '|';
var PENDING_CHAR = ' ';
var BAR_LEN = 20;

var out = process.stdout;

exports.display = function(progress) {
	// var out = process.stdout;
	var x = S(TRNASFERRED_CHAR).repeat(~~(progress.transferred / progress.total * BAR_LEN)).s;
	var p = S(PENDING_CHAR).repeat(BAR_LEN - x.length).s;
	var bar = x + p;
	// var status = sprintf("[%s] %4s %s %s %11s %s %12s", bar, progress.percent,
	// 	"|".grey, progress.speed, "|".grey, progress.eta);
	var info = util.format('[%s] %s %s %s of %s (%s) %s %s', bar, progress.percent,
		'|'.grey, Util.humanizeBytes(progress.transferred), Util.humanizeBytes(progress.total),
		progress.speed, '|'.grey, progress.eta);
	out.clearLine();
	out.cursorTo(0);
	out.write(info);
};