var netgraphz = netgraphz || {};

netgraphz.eventBus = (function(){
  var exports = {};

  var Publisher = function(name){
      var _name = name;

      this.emit = function(event_name, data){
          PubSub.publish(_name + '.' + event_name, data);
      };

      this.emitSync = function(event_name, data){
        PubSub.publishSync(_name + '.' + event_name, data);
      };
  }

  exports.registerPublisher = function(name){
      return new Publisher(name);
  };

  exports.subscribe = function(topic){
    var cb = null;
    if( typeof arguments[1] === "string" ){
       var event_name = arguments[1];
       topic = topic + '.' + event_name;
       cb = arguments[2];
    }
    else {
        cb = arguments[1];
    }
    return PubSub.subscribe(topic, cb);
  };

  exports.unsubscribe = function(subscriber){
      PubSub.unsubscribe(subscriber);
  }

  return exports;
})();
