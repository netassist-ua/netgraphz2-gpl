#!/usr/bin/env nodejs

var http = require('http');
var nconf = require('nconf');
var arg_parser = require('minimist');

nconf.file({file: 'config.json'});
nconf.argv().env();
nconf.defaults({
	'notifier-http': {
		'host': 'localhost',
		'port': 3434,
		'use_basic_auth': true,
	},
	'auth': {
			'username': 'tomoe.yamanaka',
			'password': 'oith9peJ'
	}
});

var notification = {
	type: process.env.NOTIFICATIONTYPE,
	host: {
		alias: process.env.HOSTALIAS,
		name: process.env.HOSTNAME,
		address: process.env.HOSTADDRESS,
	},
	name: process.env.SERVICENAME,
	state: process.env.SERVICESTATE,
	date_long: process.env.LONGDATETIME,
	output: process.env.HOSTOUTPUT,
	author: process.env.NOTIFICATIONAUTHORNAME,
	comment: process.env.NOTIFICATIONCOMMENT,
	display_name: process.env.SERVICEDISPLAYNAME,
	latency: process.env.SERVICELATENCY,
	last_state: process.env.SERVICELASTSTATE,
	state_type: process.env.SERVICESTATETYPE,
	state_id: process.env.SERVICESTATEID,
	execution_time: process.env.EXECUTIONTIME,
	duration: process.env.DURATIONSEC,
	last_check: process.env.LASTCHECK,
	downtime_depth: process.env.DOWNTIMEDEPTH,
	check_source: process.env.CHECKSOURCE,
	last_state: process.env.LASTSTATE,
	last_state_id: process.env.LASTSTATEID,
	last_state_type: process.env.LASTSTATETYPE,
	last_state_change: process.env.LASTSTATECHANGE,
	perfdata: process.env.PERFDATA,
	user: {
		email: process.env.USEREMAIL,
		name: process.env.USERNAME
	},
	check_attempt: process.env.CHECKATTEMPT,
	max_check_attempts: process.env.MAXCHECKATTEMPTS,
	check_command: process.env.CHECKCOMMAND,

};
var notification_str = JSON.stringify(notification);

var client_options = {
	hostname: nconf.get('notifier-http:host'),
	port: nconf.get('notifier-http:port'),
	path: '/api/icinga/notify_service',
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Content-Length': notification_str.length
	}
};

var auth_enabled = nconf.get('notifier-http:use_basic_auth');
if(auth_enabled){
	client_options.auth = nconf.get('auth:username') + ':' + nconf.get('auth:password');
}

var req = http.request(client_options, function(res){
	console.log("Response");
	console.log("Status code: %d", res.statusCode);
	res.setEncoding('utf8');
	res.on('data', function( chuck ) {
		console.log('Data received: %s', chuck);
	});
});
req.on( 'error', function(e) {
	console.log('Error on request: %s', e);
	process.exit(1);
});

req.write(notification_str);
req.end();
