var fs = require("fs");
var path = require("path");
var url = require("url");
var WebSocket = require("ws");
var request = require("request");
var qs = require("qs");
var mime = require("mime");
var async = require("async");
var colors = require("colors");
var sprintf = require("sprintf");
var _ = require("lodash");
var progress = require("./progress");
var C = require("../config");
var U = require("./utility");

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

  request.post(C.apiUri + "/channels", {
    json: self
  }, function(err, res, channel) {
    if (err) return console.error(err);

    _.assign(self, _.omit(channel, "files"));

    var url = C.baseUri + "/" + self.id;
    var filename = channel.downloadFile.name;
    var lytup = "lytup -d " + self.id;
    var curl = "curl -Lo " + filename + " " + url
    var wget = "wget -O " + filename + " " + url;

    console.log("Receive file(s) using:".green);
    console.log(" Lytup => ".grey + lytup.cyan);
    console.log(" Browser => ".grey + url.cyan);
    console.log(" Curl => ".grey + curl.cyan);
    console.log(" Wget => ".grey + wget.cyan);

    var ws = new WebSocket(C.wsUri + "?" + qs.stringify({
      channel: self.id,
      role: global.role
    }));
    ws.on("message", function(msg) {
      // Ignore invalid messages
      try {
        msg = JSON.parse(msg);
      } catch (e) {
        return;
      }
      switch (msg.event) {
        case "UPLOAD":
          var i = 0;
          async.mapSeries(self.files, function(file, cb) {
            var req = request.post(C.baseUri + "/u", function(err, res, body) {
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

          var info = sprintf("sending %s of file(s)",
            U.humanizeBytes(self.progress.total));
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

Channel.prototype.download = function(channelId) {
  var self = this;

  request.get(C.apiUri + "/channels/" + channelId, {
    json: true
  }, function(err, res, channel) {
    if (err) return console.error(err);

    _.assign(self, channel);

    var req = request(C.baseUri + "/d/" + self.id);
    req.on("response", function(res) {
      // TODO handle invalid responses

      var ws = new WebSocket(C.wsUri + "?" + qs.stringify({
        channel: self.id,
        role: global.role
      }));
      ws.on("message", function(msg) {
        // Ignore invalid messages
        try {
          msg = JSON.parse(msg);
        } catch (e) {
          return;
        }
        switch (msg.event) {
          case "PROGRESS":
            progress.update(msg.progress);
            break;
          case "CLOSE":
            progress.stop();
            process.exit();
        }
      });

      var info = sprintf("receiving %s of file(s) %s saving to \"%s\"",
        U.humanizeBytes(self.progress.total), "|".grey, self.downloadFile.name.cyan);
      console.log(info);

      req.pipe(fs.createWriteStream(self.downloadFile.name));
    })
  });
};

module.exports = Channel;