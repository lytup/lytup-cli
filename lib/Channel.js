var fs = require("fs");
var path = require("path");
var url = require("url");
var util = require("util");
var WebSocket = require("ws");
var request = require("request");
var qs = require("qs");
var mime = require("mime");
var async = require("async");
var colors = require("colors");
var _ = require("lodash");
var progress = require("./progress");
var CFG = require("../config");
var UTIL = require("./util");

function Channel() {
  this.files = [];
}

Channel.prototype.upload = function(files) {
  var self = this;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    self.files.push({
      name: path.basename(file),
      size: fs.statSync(file).size,
      type: mime.lookup(file),
      path: file
    });
  }

  request.post(CFG.apiUri + "/channels", {
    json: self
  }, function(err, res, channel) {
    if (err) return console.error(err);

    _.assign(self, _.omit(channel, "files"));

    var url = CFG.baseUri + "/" + self.id;
    console.log("download url %s %s", "=>".grey, url.cyan);

    var ws = new WebSocket(CFG.wsUri + "?" + qs.stringify({
      channel: self.id,
      role: global.role
    }));
    ws.on("message", function(msg) {
      msg = JSON.parse(msg);
      switch (msg.event) {
        case "UPLOAD":
          var i = 0;
          async.mapSeries(self.files, function(file, cb) {
            var req = request.post(CFG.baseUri + "/u", function(err, res, body) {
              if (err) return cb(err);
              else cb(null, body);
            });
            var form = req.form();
            form.append("channel", self.id);
            form.append("lastFile", (++i === self.files.length).toString());
            form.append("file", fs.createReadStream(file.path));
          }, function(err, result) {
            if (err) return console.error(err);
          });

          var info = util.format("sending %s of file(s)",
            UTIL.humanizeBytes(self.progress.total));
          console.log(info);

          break;
        case "PROGRESS":
          progress.update(msg.progress);
          break;
        case "CLOSE":
          progress.stop();
          process.exit();
      }
    });
  });
}

Channel.prototype.download = function(uri) {
  var self = this;
  var channelId = url.parse(uri).pathname.substr(1);

  request.get(CFG.apiUri + "/channels/" + channelId, {
    json: true
  }, function(err, res, channel) {
    if (err) return console.error(err);

    _.assign(self, channel);

    var req = request(CFG.baseUri + "/d/" + self.id);
    req.on("response", function(res) {
      // TODO handle invalid responses

      var ws = new WebSocket(CFG.wsUri + "?" + qs.stringify({
        channel: self.id,
        role: global.role
      }));
      ws.on("message", function(msg) {
        msg = JSON.parse(msg);
        switch (msg.event) {
          case "PROGRESS":
            progress.update(msg.progress);
            break;
          case "CLOSE":
            progress.stop();
            process.exit();
        }
      });

      var cd = res.headers["content-disposition"]
      var filename = cd.split(";")[1].split("=")[1];
      var info = util.format("receiving %s of file(s) %s saving to \"%s\"",
        UTIL.humanizeBytes(self.progress.total), "|".grey, filename.cyan);
      console.log(info);

      req.pipe(fs.createWriteStream(filename));
    })
  });
};

module.exports = Channel;