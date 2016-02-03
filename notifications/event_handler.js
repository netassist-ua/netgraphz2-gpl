var config = require(__base + 'configuration');
var dispatcher = require(__base + 'dispatcher');
var database = require(__base + 'database');

var log4js = require('log4js');
var logger = log4js.getLogger('EventHandler');
var rateLogger = log4js.getLogger('RateLimit');

//Rate limit timer
//@var {number}
var _ratelimit_timer = null;

//Rate limit throttling timer
//@var {number}
var _ratelimit_throttle_timer = null;

//Current ratelimit request counter
//@var {number}
var _ratelimit_req_curr = 0;


/* @typedef AggEventObj
 * @type {object}
 * @property {object[]} events - Aggreated events
 * @property {number} timer - Aggreation timer identifier
 * @property {number} type - Aggregation type {0 - host, 1 - service }
 * @property {number} agg_state_id - Aggregation state id
 * @property {number} agg_last_state_id - Aggregation previous state id 
 */

/* Aggreation event topics
 * @var {object<string, AggEventObj>}
 */

var _agg_event_topics = {};

//Event processing queue
//@var {object[]}
var _queue = [];

var NOTIFICATION_HOST = 0;
var NOTIFICATION_SERVICE = 1;


/*
 * Process aggregated events
 * @param {string} agg_topic - Aggregational topic
 * @param {AggEventObj} agg_obj - Aggregated events object
 */
var _agg_event_process = function(agg_topic, agg_obj ){
	if( agg_obj.events.length == 1 ){
		if(!_notification_rate_limited(agg_obj.events[ 0 ], agg_obj.type)){
			switch(agg_obj.type){
				case NOTIFICATION_HOST:
					_process_host_notification(agg_obj.events[0]);
					break;
				case NOTIFICATION_SERVICE:
					_process_service_notification(agg_obj.events[0]);
					break;
				default:
					logger.warn("Unknown aggreated event type. Not processing");
					break;
			}
		}
		agg_obj.events = [];
		return true;
	}
	if( agg_obj.events.length == 0 ){
		logger.warn("Nothing aggregate anymore. Stopping timers");
		clearInterval(agg_obj.timer);
		delete _agg_event_topics[agg_topic];
		return true;
	}
	logger.info("Processing aggregate event %s...", agg_topic);
	switch(agg_obj.type){
		case NOTIFICATION_HOST:
			var host_names = [];
			for( var i = 0; i < agg_obj.events.length; i++ ){
				host_names.push(agg_obj.events[ i ].name);
			}
			var agg_body = {
				isAggregated: true,
				agg_type: NOTIFICATION_HOST,
				agg_state_id: agg_obj.agg_state_id,
				agg_last_state_id: agg_obj.agg_last_state_id,
			        agg_user: agg_obj.agg_user,
				agg_user_email: agg_obj.agg_user_email,
				host_names: host_names
			}
			if(!_notification_rate_limited(agg_body, NOTIFICATION_HOST)){
				_process_host_notification(agg_body);
			}
			break;
		case NOTIFICATION_SERVICE:
			var service_names = [];
			var host_names = [];
			for( var i = 0; i < agg_obj.events.length; i++ ){
				host_names.push(agg_obj.events[ i ].host.name);
				service_names.push(agg_obj.events[ i ].name);	
			}
			var agg_body = {
				isAggregated: true,
				agg_type: NOTIFICATION_HOST,
				agg_state_id: agg_obj.agg_state_id,
				agg_last_state_id: agg_obj.agg_last_state_id,
				host_names: host_names,
			        agg_user: agg_obj.agg_user,
				agg_user_email: agg_obj.agg_user_email,
				service_names: service_names
			}
			if(!_notification_rate_limited(agg_body, NOTIFICATION_SERVICE)){
				_process_service_notification(agg_body);
			}
			break;

	}
	agg_obj.events = [];
};

/**
 *	Timer event callback of rate limiter
 *	Performs queue processing
 *	@function
 *
 */
var _ratelimit_throttle_timer_callback = function(){
	rateLogger.debug("Processing throttled events...");
	var nProc = 0;
	//process notifications in queue
	while( nProc < config.getConfiguration().api.rateLimit.rate && _queue.length > 0){
		var notification = _queue.shift();
		switch(notification.type){
			case NOTIFICATION_HOST:
				_process_host_notification(notification.body);
				break;
			case NOTIFICATION_SERVICE:
				_process_service_notification(notification.body);
				break;
			default:
				break;
		}
		nProc++;
		_ratelimit_req_curr--;
	}
	//is anything left to process?
	if( nProc < config.getConfiguration().api.rateLimit.rate ){
		_ratelimit_req_curr = 0;
		_ratelimit_stop_throttle_timer();
		_ratelimit_start_timer();
	}
};

/*
 * Rate limit timer callback
 * @function
 */
var _ratelimit_timer_callback = function(){
	_ratelimit_req_curr = 0; //drop the counter to zero
};

/*
 * Starts up rate limiter throttle timer
 * @function
 */
var _ratelimit_start_throttle_timer = function() { 
	rateLogger.info("Starting rate limit throttle timer");
	_ratelimit_throttle_timer = setInterval(_ratelimit_throttle_timer_callback, config.getConfiguration().api.rateLimit.time);	
};

/*
 *  Stop rate limit throttling timer
 *  @function
 */
var _ratelimit_stop_throttle_timer = function(){
	rateLogger.debug("Stopping rate limit throttle timer");
	clearInterval(_ratelimit_throttle_timer);
	_ratelimit_throttle_timer = null;
};

/**
 * Start up rate limit flush timer
 * @function
 */
var _ratelimit_start_timer = function(){
	rateLogger.debug("Starting drop counter timer");
	_ratelimit_timer = setInterval(_ratelimit_timer_callback, config.getConfiguration().api.rateLimit.time);
};

/**
 * Stop rate limit flush timer
 * @function
 */
var _ratelimit_stop_timer = function(){
	rateLogger.debug("Stopping drop counter timer");
	clearInterval(_ratelimit_timer);
	_ratelimit_timer = null;
};


/**
 * Notifications processing
 */

/**
 * Handle single node fetch response from database for notification
 * Dispatches node data, packs node information and send to clients
 *
 * @function
 * @param {object} node NetGraphz2 node
 * @param {object} body Notification body
 * @param {string} error Error string, null if no error
 * @param {number} type Notification type
 * @param {function} callback Handler callback on success
 * @param {function} error_callback Handler callback on error
 */
var _handle_database_node_response = function( node, body, error, type, callback, error_callback ){
	if( error ){
		if(typeof error_callback === "function")
			error_callback(error);
		return;
	}
	if( node == null ){
		logger.debug("%j", body);
		logger.warn("Node: %s not found in database", body.name);
		if(typeof callback === "function")
			callback(null);
		return false;
	}
	logger.debug("Node with id %d successfully fetched from database", node.id);
	var notification = {
			aggreated: false,
			type: 0, //icinga notification, default value
			icinga_type: type,
			node: node,
			icinga: body
	};
	if(body.user.name == config.getConfiguration().api.icinga.broadcast_user)
		dispatcher.notifyAllClients(notification);
	else
		dispatcher.notifyByEmail(body.user.email);
	if( typeof callback === "function")
		callback(node);
};

var _handle_database_agg_nodes_response = function (nodes_id, body, error, type, callback, error_callback){
	if( error ){
		if(typeof error_callback === "function")
			error_callback(error);
		return;
	}
	if( typeof nodes_id === "undefined" || !Array.isArray(nodes_id) ){
		logger.warn("Database return wrong response. Maybe %j not found in database", body.host_names);
		if(typeof callback === "function")
			callback(null);
		return false;
	} 
	var notification = {
		aggregated: true,
		type: 0, //icinga notification
		icinga_type: 2,  //aggregated notification
		agg_type: type, //aggregation type
		agg_state_id: body.agg_state_id,
		agg_last_state_id: body.agg_last_state_id,
		agg_user: body.agg_user,
		agg_user_email: body.agg_user_email,
		service_names: body.service_names,
		host_names: body.host_names,
		nodes_id: nodes_id
	};
	if(body.agg_user == config.getConfiguration().api.icinga.broadcast_user)
		dispatcher.notifyAllClients(notification);
	else
		dispatcher.notifyByEmail(body.agg_user_email);
	if( typeof callback === "function")
		callback(node);

};

/**
 * Process Icinga2 host notification
 * @param {object} body Notification body
 * @param {function} callback Callback fn(node|nodes)
 * @param {function} error_callback Error fn(error_message)
 */
var _process_host_notification = function(body, callback, error_callback){
	logger.debug("Processing host notification started");
	if(body.isAggregated){
		logger.debug("Process aggreated notification. Querying database.");
		database.getConnection().nodes.getIdsByIcingaNames(body.host_names, function( ids, error ){
			logger.debug("Database response fetched for aggregated notification");
			_handle_database_agg_nodes_response(ids, body, error, NOTIFICATION_HOST, callback, error_callback);
		});
	}
	else{
		logger.debug("Process simple notification. Querying database.");
		database.getConnection().nodes.getByIcingaName(body.name, function( node, error ) {
			logger.debug("Database response fetched for simple notification");
			_handle_database_node_response(node, body, error, NOTIFICATION_HOST, callback, error_callback);
		});	
	}
};


/**
 * Process Icinga2 service notification
 * @param {object} body - Notification body
 */
var _process_service_notification = function(body, callback, error_callback){
	if(body.isAggregated){
		database.getConnection().nodes.getIdsByIcingaNames(body.host_names, function(ids, error){
			_handle_database_agg_nodes_response(ids, body, error, NOTIFICATION_SERVICE, callback, error_callback);
		});
	}
	else
		database.getConnection().nodes.getByIcingaName(body.host.name, function( node, error ) {
			_handle_database_node_response(node, body, error, NOTIFICATION_SERVICE, callback, error_callback);
		});
};


/**
 * Check's if notification rate limit reached, increase counter 
 * Puts notification in queue
 *
 * @param {object} body - Notification object
 * @param {number} type	- Notification type
 * @returns {boolean} true if limit is reached and notification put in queue
 */
var _notification_rate_limited = function(body, type){
	//check rate
	if(!config.getConfiguration().api.rateLimit.enabled)
		return false;
	if(++ _ratelimit_req_curr >= config.getConfiguration().api.rateLimit.rate){
		if( config.getConfiguration().api.rateLimit.overrate == "drop" ){
			//just drop the event
			logger.info("Rate limit, event dropped");
			return true;
		}
		rateLogger.info("Maximal rate exceed, event queued");
		//put in queue
		_queue.push({
			body: body,
			type: type
		});
		if(_ratelimit_timer != null){
			_ratelimit_stop_timer();
		}
		if(_ratelimit_throttle_timer == null){
			_ratelimit_start_throttle_timer();
		}
		return true;
	}		
	return false;
};

/**
 * Get aggregation topic
 * @param {object} body - Notification object
 * @param {number} type	- Notification type
 * @return {string} Aggregational event topic
 */
var _get_aggregate_topic = function(body, type){
	str_type = (type == NOTIFICATION_HOST) ? "host" : "service";
	str_state = body.state_id;
	str_last_state = body.last_state_id;
	str_user = body.user.name;
	return str_type + "/" + str_state + "/" + str_last_state + "/" + str_user;
};


/*
 *  Aggregate events
 *
 *  @param {object} body - Event body
 *  @param {number} type - Event type { 0 - host, 1 - service }
 *  @return {boolean} True if event passed into aggregation
 */
var _aggregate_event = function(body, type){
	logger.debug("_aggregate_event called");
	if( !config.getConfiguration().api.aggregation.enabled )
		return false;
	var agg_topic = _get_aggregate_topic(body, type);
	if (agg_topic in _agg_event_topics) {
		var obj = _agg_event_topics[ agg_topic ];
		obj.events.push(body);
	}
	else {
		var obj = {
			events: [ body ],
			agg_state_id: body.state_id,
			agg_last_state_id: body.last_state_id,
			agg_user: body.user.name,
			agg_user_email: body.user.email,
			type: type,
			timer: setInterval(function() {
				_agg_event_process(agg_topic, obj);
			}, config.getConfiguration().api.aggregation.time)
		};
		_agg_event_topics[agg_topic] = obj;
	}	
	return true;
};


/**
 * Handle Icinga2 host notification
 * @function
 * @param {object} body Notification body (variables)
 *
 */
var handle_host_notification = function(body){
	if(_aggregate_event(body, NOTIFICATION_HOST)){
		return;
	}
	if(!_notification_rate_limited(body, NOTIFICATION_HOST)){
		logger.debug("Processing notification with normal rate");
		_process_host_notification(body);
	}
};


/**
 * Handle Icinga2 service notification
 * @function
 * @param {object} body Notification body (variables)
 */
var handle_service_notification = function(body) {
	if(_aggregate_event(body, NOTIFICATION_SERVICE)){
		return;
	}
	if(!_notification_rate_limited(body, NOTIFICATION_SERVICE)){
		logger.debug("Processing notification with normal rate");
		_process_service_notification(body);
	}
};

module.exports = { 
	init: function(){
		if( config.getConfiguration().api.rateLimit.enabled )
			_ratelimit_start_timer();
	},
	handle_host_notification: handle_host_notification,
	handle_service_notification: handle_service_notification
};
