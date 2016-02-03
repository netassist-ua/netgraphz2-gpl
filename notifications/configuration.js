var nconf = require("nconf");
var _conf = {};
var _defaults = {
  'notificator': {
      'port': 3433
  },
    "host": "localhost",
    'netgraphzdb': {
    "port": 7474,
    "useAuth": true,
    "auth": {
        "login": "neo4j",
        "password": "changed"
    }
  },
  'api': {
    'authEnabled': false,
    'authTokensPath': 'auth_tokens.json',
    'listenAll': false,
    'port': 3434,
    "aggregation": {
	"time": 100,
    },
    "rateLimit": {
	"rate": 10,
	"time": 200
    },
    'address': '127.0.0.1',
    'icinga': {
        'broadcast_user': '_netgraphz2_notify_all'
    }
  }
};


module.exports = {
  init: function(){
    nconf.file({file: 'config.json'});
    nconf.argv().env();
    nconf.defaults(_defaults);
    _conf = {
      ng_db: nconf.get('netgraphzdb'),
      io: nconf.get('notificator'),
      api: nconf.get('api')
    };
  },
  getConfiguration: function(){
      return _conf;
  }
};
