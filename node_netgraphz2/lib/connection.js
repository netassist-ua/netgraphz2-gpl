var neo4j = require('node-neo4j');
var extend = require('extend');
var util = require('util');

function Connection( settings ){
	var defaults = {
		'host': 'localhost',
		'port': 7474,
		'useAuth': false,
		'auth': {
			'login': 'neo4j',
			'password': 'password'
		}
	};

	var config = extend(true, defaults, settings);
	var db = null;
	var url = "";
	if(config.useAuth){
		 url = util.format('http://%s:%s@%s:%s', config.auth.login, config.auth.password, config.host, config.port);
	}
	 else {
		 url = util.format('http://%s:%s', config.host, config.port)
	}

	db = new neo4j(url);

	this.nodes = require("./nodes")(db);
	this.links = require("./links")(db);


};

module.exports = Connection;
