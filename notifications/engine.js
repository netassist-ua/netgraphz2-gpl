var dispatcher = require("./dispatcher");
var database = require("./database");
var token_storage = require("./token_storage");
var configuration = require("./configuration");
var api_app = require('./notifications_api');

var socket_io = require('socket.io');
var log4js = require("log4js");
var fs = require('fs');

var logger = log4js.getLogger("engine");

var db;
var io;
var api_server;
var started = false;


var api_listen_callback = function(){
    logger.info("API server started on %s:%d", api_server.address().address, api_server.address().port);
};

var start_api = function( api_config ){
    logger.info("API authentication tokens loaded");
    if(api_config.listenAll){
        api_server = api_app.listen(api_config.port, api_listen_callback);
    }
    else {
        api_server = api_app.listen(api_config.port, api_config.address, api_listen_callback);
    }
};

var start_io = function( io_config ){
  io = socket_io();
  io.listen(io_config.port);
  dispatcher.init(io);
};

var start = function( ){
  if(started)
    throw new Error("Engine has already started");

  logger.info("Initializing configuration...");
  configuration.init();
  var config = configuration.getConfiguration();
  logger.debug("Configuration: %j", config);
  logger.info("Initializing graph database connector...");
  database.init();
  logger.info("Initializing token storage...")
  token_storage.init();
  logger.info("Initializing socket.io server...");
  start_io(config.io);
  logger.info("Initializing notificator API...");
  start_api(config.api);
  started = true;
};

var stop = function( ){
  //TODO: Implement client emit on exit
};

module.exports = {
  start: start,
  stop: stop
};
