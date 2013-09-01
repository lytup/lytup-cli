var config = {};
var env = process.env.LYTUP_ENV;

config.baseUri = "http://lytup.com",
config.wsUri = "ws://lytup.com/ws"
config.apiUri = config.baseUri + "/api"

if (env === "dev") {
    config.baseUri = "http://localhost:8080",
    config.wsUri = "ws://localhost:8080/ws"
    config.apiUri = config.baseUri + "/api"
}

module.exports = config;