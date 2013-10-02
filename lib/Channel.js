var os = require("os");
var fs = require("fs");
var path = require("path");
var url = require("url");
var WebSocket = require("ws");
var request = require("request");
var mime = require("mime");
var async = require("async");
var colors = require("colors");
var sprintf = require("sprintf");
var _ = require("lodash");
var progress = require("./progress");
var Config = require("../config");
var Util = require("./utility");

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

  request.post(Config.API_URI + "/channels", {
    json: self
  }, function(err, res, channel) {
    if (err) return console.error(err);
    _.assign(self, _.omit(channel, "files"));

    var uri = Config.BASE_URI + "/" + self.id;
    var filename = channel.downloadFile.name;
    var lytup = "lytup -d " + self.id;
    var curl = "curl -Lo \"" + filename + "\" " + uri
    var wget = "wget -O \"" + filename + "\" " + uri;

    console.log("Excecute " + lytup.cyan + " to receive files");

    console.log("Alternate options:".grey.bold);
    console.log("- Browser => ".grey + uri.cyan);
    console.log("- Curl => ".grey + curl.cyan);
    console.log("- Wget => ".grey + wget.cyan);

    var ws = new WebSocket(Config.WS_URI + "/" + self.id);
    ws.on("message", function(msg) {
      // Ignore invalid messages
      // try {
      msg = JSON.parse(msg);
      // } catch (e) {
      //   return;
      // }
      switch (msg.event) {
        case "OPEN":
          var i = 0;
          async.mapSeries(self.files, function(file, cb) {
            var req = request.post(Config.BASE_URI + "/u", function(err, res, body) {
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

          var info = sprintf("Sending %s of files", Util.humanizeBytes(self.progress.total));
          console.log(info.green);

          break;
        case "PROGRESS":
          progress.update(msg.progress);
          break;
        case "CLOSE":
          console.log(os.EOL + msg.text.blue);
          process.exit();
      }
    });
  });
}

Channel.prototype.download = function(channelId) {
  var self = this;

  request.get(Config.API_URI + "/channels/" + channelId, {
    json: true
  }, function(err, res, channel) {
    if (err) return console.error(res);
    if (res.statusCode === 404) {
      console.log(channel.red);
      process.exit();
    }
    _.assign(self, channel);

    var ws = new WebSocket(Config.WS_URI + "/" + self.id);
    ws.on("message", function(msg) {
      // Ignore invalid messages
      // try {
      msg = JSON.parse(msg);
      // } catch (e) {
      // return;
      // }
      switch (msg.event) {
        case "PROGRESS":
          progress.update(msg.progress);
          break;
        case "CLOSE":
          console.log(os.EOL + msg.text.blue);
          process.exit();
      }
    });

    var req = request(Config.BASE_URI + "/d/" + self.id);
    var info = sprintf("Receiving %s of files %s saving to \"%s\"",
      Util.humanizeBytes(self.progress.total), "|".grey, self.downloadFile.name.cyan);
    console.log(info.green);
    req.pipe(fs.createWriteStream(self.downloadFile.name));
  });
};

module.exports = Channel;