var log4js = require('log4js');
var logger = log4js.getLogger('Icinga scripts API');

var configuration = require(__base + 'configuration');
var dispatcher = require(__base + 'dispatcher');
var database = require(__base + 'database');

var _rate_limit_timer = null;
var _rate_limit_req_limit = 1000;
var _rate_limit_req_curr = 0;

var express = require('express');
var router = express.Router();


router.post('/notify_host', function(req, res, next){
	var nbody = req.body;
	var icinga_config = configuration.getConfiguration().api.icinga;
	var node = database.getConnection().nodes
						.getByIcingaName(nbody.name, function( node, error ) {
								if( error ){
									res.status(500);
									res.json({
											"error": error
									});
									return res.end();
								}
								if( node == null ){
									res.status(404);
									res.json({
										"success": false,
										"error": "Cannot find node by name"
									});
									return res.end();
								}
								logger.debug("Node received: %j", node);
								var notification = {
										type: 0, //icinga notification
										icinga_type: 0, //host notification
										node: node,
										icinga: nbody
								};
								if(nbody.user.name == icinga_config.broadcast_user)
									dispatcher.notifyAllClients(notification);
								else
									dispatcher.notifyByEmail(nbody.user.email);
								res.status(200);
								res.json({
									"success": true
								});
								return res.end();
						});
});


router.post('/notify_service', function(req, res, next){
	var nbody = req.body;
	var icinga_config = configuration.getConfiguration().api.icinga;
	var node = database.getConnection().nodes
						.getByIcingaName(nbody.host.name, function( node, error ) {
								if( error ){
									res.status(500);
									res.json({
											"error": error
									});
									return res.end();
								}
								if( node == null ){
									res.status(404);
									res.json({
										"success": false,
										"error": "Cannot find node by name"
									});
									return res.end();
								}
								logger.debug("Node received: %j", node);
								var notification = {
										type: 0, //icinga notification
										icinga_type: 1, //service notification
										node: node,
										icinga: nbody
								};
								if(nbody.user.name == icinga_config.broadcast_user)
									dispatcher.notifyAllClients(notification);
								else
									dispatcher.notifyByEmail(nbody.user.email);
								res.status(200);
								res.json({
									"success": true
								});
								return res.end();
						});
});



module.exports = router;
