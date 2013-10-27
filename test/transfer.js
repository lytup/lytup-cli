var os = require('os');
var fs = require('fs');
var path = require('path');
var request = require('request');
var should = require('should');
var Channel = require('../lib').Channel;

describe('Channel', function() {
	describe('#upload', function() {
		it('should successfully upload a file', function(done) {
			// var channel = new Channel();
			// var file = [path.join(__dirname, 'fixture', 'node-v0.10.21.pkg')];
			
			// channel.upload(file);

			// channel.on('error', function(err) {
			// 	throw err;
			// });

			// channel.on('created')
			// // Download file
			// setTimeout(function() {
			// 	request('http://localhost:8080/d/' + channel.id)
			// 		.pipe(fs.createWriteStream(path.join(os.tmpdir(), 'test')));
			// }, 1000);
		});
	});
});