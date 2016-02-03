var configuration = require("./configuration");
var fs = require('fs');
var path = require('path');
var _tokens = [];

module.exports = {
  init: function( ){
    var api_config = configuration.getConfiguration().api;
    var tokensPath = path.resolve(__dirname, api_config.authTokensPath)
    var fileTokenContents = fs.readFileSync(tokensPath);
    _tokens = JSON.parse(fileTokenContents);
  },
  getValid: function(){
    return _tokens;
  }
};
