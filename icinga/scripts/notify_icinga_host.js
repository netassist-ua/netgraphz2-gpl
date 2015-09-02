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
	alias: process.env.HOSTALIAS,
	name: process.env.HOSTNAME,
	address: process.env.HOSTADDRESS,
	state: process.env.HOSTSTATE,
	state_id: process.env.HOSTSTATEID,
	state_type: process.env.HOSTSTATETYPE,
	check_attempt: process.env.CHECKATTEMPT,
	max_check_attempts: process.env.MAXCHECKATTEMPTS,
	last_state: process.env.LASTSTATE,
	last_state_id: process.env.LASTSTATEID,
	last_state_type: process.env.LASTSTATETYPE,
	last_state_change: process.env.LASTSTATECHANGE,
	downtime_depth: process.env.DOWNTIMEDEPTH,
	duration: process.env.DURATIONSEC,
	latency: process.env.LATENCY,
	execution_time: process.env.EXECUTIONTIME,
	perfdata: process.env.PERFDATA,
	last_check: process.env.LASTCHECK,
	check_source: process.env.CHECKSOURCE,
	num_services: process.env.NUMSERVICES,
	num_services_ok: process.env.NUMSERVICESOK,
	num_services_warning: process.env.NUMSERVICESWARNING,
	num_services_unknown: process.env.NUMSERVICEUNKNOWN,
	num_services_critical: process.env.NUMSERVICESCRITICAL,
	date_long: process.env.LONGDATETIME,
	output: process.env.HOSTOUTPUT,
	author: process.env.NOTIFICATIONAUTHORNAME,
	comment: process.env.NOTIFICATIONCOMMENT,
	display_name: process.env.HOSTDISPLAYNAME,
	user: {
		 email: process.env.USEREMAIL,
		 name: process.env.USERNAME
	 }
};
var notification_str = JSON.stringify(notification);

var client_options = {
	hostname: nconf.get('notifier-http:host'),
	port: nconf.get('notifier-http:port'),
	path: '/api/icinga/notify_host',
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
