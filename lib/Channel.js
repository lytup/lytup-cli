var fs = require("fs");
var path = require("path");
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
}

Channel.prototype.upload = function(files) {
  var self = this;
  var progress;

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
    _.assign(self, _.omit(body, "files"));
    console.log("download uri: " + CFG.baseUri + "/" + self.id);
    if (err) return console.error(err);

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
          progress = new Progress(self.progress);
          break;
        case "PROGRESS":
          progress.update(msg.progress);
          break;
        case "CLOSE":
          progress.close();
          process.exit();
      }
    });
  });
}

Channel.prototype.download = function(uri) {
  console.log("download");
};

module.exports = Channel;