/*
*	Node.js application entry point
*/

//set global base for require
global.__base = __dirname + '/';
var engine = require("./engine");
var log4js = require("log4js");
var logger = log4js.getLogger("main");


engine.start();

logger.info("Starting NetGraphz2 notifications server...");
