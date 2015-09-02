/**
*	Socket connection handler
*	Each socket checked by authentication
*/

var _io;

var log4js = require('log4js');
var logger = log4js.getLogger('client_dispatcher');

var set_sock_handers = function( socket ) {
	socket.on("auth", function() {
	});
	socket.on("stat_subscribe", function(msg) {
	});
}


var accept = function(socket){
		logger.info('Client connected [%s]', socket.id);
		set_sock_handers(socket);
}

var init = function(io){
	io.on('connection', accept);
	_io = io;
};


module.exports = {
  accept: accept,
	notifyAllClients: function(notification){
		logger.debug("Emitting notification to all connected clients");	
		_io.emit('message', notification);
	},
	notifyByEmail: function(email, notification){
			logger.debug("STUB");
	},
	init: init
};
