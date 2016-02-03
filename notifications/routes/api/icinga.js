var log4js = require('log4js');
var logger = log4js.getLogger('Icinga scripts API');

var dispatcher = require(__base + 'dispatcher');
var database = require(__base + 'database');
var handler = require(__base + 'event_handler');

var init = false;

var _rate_limit_timer = null;
var _rate_limit_req_limit = 1000;
var _rate_limit_req_curr = 0;

var express = require('express');
var router = express.Router();


router.post('/notify_host', function(req, res, next){
	if(!init){
		handler.init();
		init = true;
	}
	if(typeof req.body === "object"){
		handler.handle_host_notification(req.body);
		res.status(200);
		return res.end();
	}
	else {
		res.status(500);
		logger.error("Host notification request with empty or unknown body detected");
		return res.end();
	}
});


router.post('/notify_service', function(req, res, next){
	if(!init){
		handler.init();
		init = true;
	}
	if(typeof req.body === "object"){
		handler.handle_service_notification(req.body);
		res.status(200);
		return res.end();
	}
	else {
		res.status(500);
		logger.error("Service notification request with empty or unknown body detected");
		return res.end();
	}
});



module.exports = router;
