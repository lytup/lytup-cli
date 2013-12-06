var os = require('os'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    WebSocket = require('ws'),
    request = require('request'),
    mime = require('mime'),
    async = require('async'),
    colors = require('colors'),
    S = require('string'),
    AdmZip = require('adm-zip'),
    _ = require('lodash'),
    Config = require('../config'),
    logger = Config.logger,
    Util = require('./util');

var TRNASFERRED_CHAR = '|';
var PENDING_CHAR = ' ';
var BAR_LEN = 20;

var out = process.stdout;

function Channel() {
    this.files = [];
}
util.inherits(Channel, EventEmitter);

Channel.prototype.upload = function(files) {
    var self = this;

    if (!files.length) self.emit('error', new Error('no files selected'))

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        self.files.push({
            name: path.basename(file),
            size: fs.statSync(file).size,
            type: mime.lookup(file),
            path: file
        });
    }

    request.post(Config.API_URI + '/channels', {
        json: self
    }, function(err, res, channel) {
        if (err) self.emit('error', err);
        _.assign(self, _.omit(channel, 'files'));

        self.emit('create');
        self.on('open', self._submit);
        self._connect();
    });
}

Channel.prototype.download = function(id) {
    var self = this;

    request.get(Config.API_URI + '/channels/' + id, {
        json: true
    }, function(err, res, channel) {
        if (err) self.emit('error', err);
        if (res.statusCode === 404) self.emit('error', new Error(channel));
        _.assign(self, channel);

        self.emit('get');
        self._connect();

        var file = self.downloadFile.name;
        var req = request(Config.BASE_URI + '/d/' + self.code);

        req.on('end', function() {
            if (self.files.length > 1) {
                var zip = new AdmZip(file);
                zip.extractAllTo(self.code);
                fs.unlink(file);
            }
        });

        req.pipe(fs.createWriteStream(file));
    });
};

Channel.prototype.displayProgress = function(close) {
    var x = S(TRNASFERRED_CHAR).repeat(~~(this.transferred / this.total * BAR_LEN)).s;
    var p = S(PENDING_CHAR).repeat(BAR_LEN - x.length).s;
    var bar = x + p;
    var info = util.format('[%s] %s %s %s of %s %s %s %s', bar, this.percent,
        '|'.grey, Util.humanizeBytes(this.transferred), Util.humanizeBytes(this.total),
        '|'.grey, this.speed, '|'.grey, this.eta);
    out.clearLine();
    out.cursorTo(0);
    out.write(info);

    if (close) console.log(os.EOL + ('\u2714 ' + this.status).green);
};

Channel.prototype._connect = function() {
    var self = this;
    var ws = new WebSocket(Config.WS_URI + '/' + self.code);

    ws.on('message', function(msg) {
        // Ignore invalid messages
        // try {
        msg = JSON.parse(msg);
        // } catch (e) {
        // return;
        // }
        self.emit(msg.event, msg);
    });
};

Channel.prototype._submit = function() {
    var self = this;
    var i = 0;

    async.mapSeries(self.files, function(file, cb) {
        var req = request.post(Config.BASE_URI + '/u', function(err, res, body) {
            if (err) self.emit('error', err);
            else cb(null, body);
        });
        var form = req.form();
        form.append('code', self.code);
        form.append('lastFile', (++i === self.files.length).toString());
        form.append('file', fs.createReadStream(file.path));
    }, function(err, result) {
        if (err) self.emit('error', err);
    });
};

module.exports = Channel;