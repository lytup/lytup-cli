var os = require('os');
var fs = require('fs');
var path = require('path');
var url = require('url');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var WebSocket = require('ws');
var request = require('request');
var mime = require('mime');
var async = require('async');
var colors = require('colors');
var sprintf = require('sprintf');
var _ = require('lodash');
var Config = require('../config');
logger = Config.logger;
var Util = require('./util');

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

        var ws = new WebSocket(Config.WS_URI + '/' + self.id);
        ws.on('message', function(msg) {
            // Ignore invalid messages
            // try {
            msg = JSON.parse(msg);
            // } catch (e) {
            //   return;
            // }
            switch (msg.event) {
                case 'OPEN':
                    var i = 0;
                    async.mapSeries(self.files, function(file, cb) {
                        var req = request.post(Config.BASE_URI + '/u', function(err, res, body) {
                            if (err) self.emit('error', err);
                            else cb(null, body);
                        });
                        var form = req.form();
                        form.append('channel', self.id);
                        form.append('lastFile', (++i === self.files.length).toString());
                        form.append('file', fs.createReadStream(file.path));
                    }, function(err, result) {
                        if (err) self.emit('error', err);
                    });
                    self.emit('open')
                    break;
                case 'PROGRESS':
                    self.emit('progress', msg);
                    break;
                case 'CLOSE':
                    self.emit('close', msg);
            }
        });
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
        self.emit('create');

        var ws = new WebSocket(Config.WS_URI + '/' + self.id);

        ws.on('message', function(msg) {
            // Ignore invalid messages
            // try {
            msg = JSON.parse(msg);
            // } catch (e) {
            // return;
            // }
            switch (msg.event) {
                case 'OPEN':
                    self.emit('open');
                    break;
                case 'PROGRESS':
                    self.emit('progress', msg);
                    break;
                case 'CLOSE':
                    self.emit('close', msg);
            }
        });

        var req = request(Config.BASE_URI + '/d/' + self.id);
        var info = sprintf('Receiving %s of files %s saving to \'%s\'',
            Util.humanizeBytes(self.progress.total), '|'.grey, self.downloadFile.name.cyan);
        console.log(info.green);
        req.pipe(fs.createWriteStream(self.downloadFile.name));
    });
};

module.exports = Channel;