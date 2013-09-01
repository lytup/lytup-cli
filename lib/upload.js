var fs = require("fs");
var request = require("request");
var WebSocket = require("ws");
var qs = require("qs");
var cfg = require("./config");

var channel = {
  active: false,
  files: [{
    name: "android.dmg",
    size: 379877697
  }]
}

var file = "/Users/vr/Downloads/android.dmg";

request.post(cfg.API_URI + "/channels", {
  json: channel
}, function(err, res, body) {
  if (err) return console.error(err);
  channel = body;
  console.log(channel.id);
  var ws = new WebSocket(cfg.WS_URI + "?" + qs.stringify({
    channel: channel.id,
    role: "SENDER"
  }));
  ws.on("open", function() {
    console.log("open");
  });
  ws.on("message", function(msg) {
    msg = JSON.parse(msg);
    switch (msg.event) {
      case "UPLOAD":
        var req = request.post(BASE_URI + "/u", function(err, res, body) {
          if (err) return console.error(err);
          console.log(body);
        });
        var form = req.form();
        form.append("channel", channel.id);
        form.append("firstFile", "true");
        form.append("lastFile", "true");
        form.append("file", fs.createReadStream(file));

        form.on("data", function(data) {
          console.log(data.length);
        });
    }
  });
  // TODO Merge channel fields
});