var fs = require("fs");
var path = require("path");
var url = require("url");
var WebSocket = require("ws");
var request = require("request");
var qs = require("qs");
var mime = require("mime");
var async = require("async");
var _ = require("lodash");
var Progress = require("./Progress");
var CFG = require("../config");

function Channel() {
  this.files = [];
  this.progress = new Progress();
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
  }, function(err, res, body) {
    if (err) return console.error(err);

    _.assign(self, _.omit(body, "files"));
    console.log("download url => " + CFG.baseUri + "/" + self.id);

    var ws = new WebSocket(CFG.wsUri + "?" + qs.stringify({
      channel: self.id,
      role: "SENDER"
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
          self.progress.start();
          break;
        case "PROGRESS":
          self.progress.update(msg.progress);
          break;
        case "CLOSE":
          self.progress.stop();
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
  }, function(err, res, body) {
    if (err) return console.error(err);

    _.assign(self, body);

    var req = request(CFG.baseUri + "/d/" + self.id);
    req.on("response", function(res) {
      // TODO handle invalid responses

      var ws = new WebSocket(CFG.wsUri + "?" + qs.stringify({
        channel: self.id,
        role: "RECEIVER"
      }));
      ws.on("message", function(msg) {
        msg = JSON.parse(msg);
        switch (msg.event) {
          case "PROGRESS":
            self.progress.update(msg.progress);
            break;
          case "CLOSE":
            self.progress.stop();
            process.exit();
        }
      });

      self.progress.start();

      var cd = res.headers["content-disposition"]
      var filename = cd.split(";")[1].split("=")[1];
      req.pipe(fs.createWriteStream(filename));
    })
  });
};

module.exports = Channel;