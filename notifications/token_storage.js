var configuration = require("./configuration");
var fs = require('fs');
var _tokens = [];

module.exports = {
  init: function( ){
    var api_config = configuration.getConfiguration().api;
    var fileTokenContents = fs.readFileSync(api_config.authTokensPath);
    _tokens = JSON.parse(fileTokenContents);
  },
  getValid: function(){
    return _tokens;
  }
};
