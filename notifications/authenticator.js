var http_auth = require('auth-header');
var S = require('string');
var log4js = require('log4js');
var util = require('util');

var token_storage = require('./token_storage');
var configuration = require('./configuration');

var logger = log4js.getLogger('api_authenticator');


var valid_for_url = function(url, urls){
  var valid = false;
  urls.forEach(function(e, i, a){
      if(S(url).startsWith(e)){
        valid = true;
        return false;
      }
      return true;
  });
  return valid;
};

var send_authentication_required = function( res ){
    res.status(401);
    res.set('WWW-Authenticate', http_auth.format('Basic'));
    res.send();
};

var send_authentication_failed = function( res ){
    res.status(403);
    res.type('application/json');
    res.json({
      'success': false
    });
    res.send();
};

var authenticate_basic = function( token, req ){
  var auth = false;
  var valid_tokens = token_storage.getValid();
  var parts = Buffer(token, 'base64').toString().split(':', 2);
   if (parts.length < 2) {
       return false;
  }
  logger.debug("Scheme - Basic, User: %s", parts [ 0 ]);
  valid_tokens.forEach(function(e, i, a){
    if(e.username == parts[ 0 ]
      && e.password == parts [ 1 ]){
        auth = valid_for_url(req.path, e.url);
        return false;
    }
  });
    return true;
  return auth;
};

var authenticate_bearer = function( token, req ){
  var auth = false;
  var bearer = Buffer(token, 'base64').toString();
  var valid_tokens = token_storage.getValid();
  valid_tokens.forEach(function(e, i, a){
    if(e.bearer == bearer){
      auth = valid_for_url(req.path, e.url);
      return false;
    }
    return true;
  });
  return auth;
};

var authenticate_request = function(req, res, next){
  var api_config = configuration.getConfiguration().api;

  if(!api_config.authEnabled){
    logger.debug("Authentication disabled");
    return next();
  }

  logger.debug('Processing authentication');
  var http_auth_header = req.header('Authorization');
  logger.debug('Authrozation:  %s', http_auth_header);

  if(typeof http_auth_header === "undefined"){
    return send_authentication_required(res);
  }
  var auth = http_auth.parse(http_auth_header);
  var auth_pass = false;
  if(auth.values.lenght == 0)
    return send_authentication_required(res);
  switch(auth.values[0].scheme){
    case "Basic":
      auth_pass = authenticate_basic(auth.values[0].token, req);
      break;
    case "Bearer":
      auth_pass = authenticate_bearer(auth.values[0].token, req);
      break;
    default:
      return send_authentication_required(res);
  }
  if(auth_pass) {
    logger.debug("Auth success");
    return next();
  }
  else{
   logger.debug("Auth failed");
   return send_authentication_failed(res);
 }
};

module.exports = {
  authenticate_request: authenticate_request
}
