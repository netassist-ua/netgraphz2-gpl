var netgraphzdb = require('netgraphzdb');
var configuration = require('./configuration');
var db;

var _init = false;

module.exports = {
  init: function(config) {
      var ng_db_config = configuration.getConfiguration().ng_db;
      db = new netgraphzdb.connection(ng_db_config);
      _init = false;
  },
  getConnection: function(){
    if(!_init){
      this.init();
    }
    return db;
  }

}
