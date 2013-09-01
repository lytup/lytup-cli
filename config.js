var config = {};
var env = process.env.NODE_ENV;

if (env === "development") {
  config.baseUri = "http://localhost:8080",
  config.wsUri = "ws://localhost:8080/ws"
  config.apiUri = config.baseUri + "/api"
} else if (env === "production") {
  config.baseUri = "http://lytup:8080",
  config.wsUri = "ws://lytup:8080/ws"
  config.apiUri = config.baseUri + "/api"
}

module.exports = config;