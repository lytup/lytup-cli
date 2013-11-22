var winston = require('winston');

var config = {},
	env = process.env.LYTUP_ENV;

config.BASE_URI = 'http://lytup.com',
config.WS_URI = 'ws://lytup.com/ws'
config.API_URI = config.BASE_URI + '/api'

if (env === 'dev') {
	config.BASE_URI = 'http://localhost:8080',
	config.WS_URI = 'ws://localhost:8080/ws'
	config.API_URI = config.BASE_URI + '/api'
} else if (env === 'qa') {
	config.BASE_URI = 'http://qa.lytup.com',
	config.WS_URI = 'ws://qa.lytup.com/ws'
	config.API_URI = config.BASE_URI + '/api'
}

// Logging
config.logger = new winston.Logger({
	transports: [
		new winston.transports.Console({
			colorize: true,
			prettyPrint: true
		})
	]
});

module.exports = config;