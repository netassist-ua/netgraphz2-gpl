var netgraphz = netgraphz || {};
netgraphz.store = (function(core, eventBus){

  var exports = { };

  var Store = function(name) {
    _nodesById = { };
    _links = [];
    _publisher = eventBus.registerPublisher("store:"+name);

    this.loadAll = function( nodes, links ){
      nodes.forEach(function(e, i, a) {
        if(typeof e.id !== "undefined"){
          _nodesById[ e.id ] = e;
        }
      });
      _links = links;
      _publisher.emit("load", { nodes: nodes, links: links });
    };

    this.getWarningNodes = function(){
      var nodes = [ ];
      Object.keys(_nodesById).forEach(function(k, i, a){
        var e = _nodesById[ k ];
        if(e.state == core.node_state.STATE_NODE_WARN)
        nodes.push(e);
      });
      return nodes;
    };

    this.getDownNodes = function(){
      var nodes = [ ];
      Object.keys(_nodesById).forEach(function(k, i, a){
        var e = _nodesById[ k ];
        if(e.state == core.node_state.STATE_NODE_DOWN)
        nodes.push(e);
      });
      return nodes;
    };


    this.getNodeById = function( nodeId ){
      return _nodesById[ nodeId ];
    };

    this.searchNodesByName = function( name ){
      var results = [];
      Object.keys(_nodesById).forEach(function(k, i, a){
        var node = _nodesById[ k ];
        if( typeof node.name !== "string" ){
          return true;
        }
        if( node.name.search( name ) != -1){
          results.push( node );
        }
        return true;
      });
      return results;
    };

    this.updateNode = function( node ) {
      if( typeof node.id === "undefined"){
        console.error("updateNode called with undefined id");
        return;
      }
      var exists = node.id in _nodesById;

      if(exists){
        _publisher.emitSync("before_update_node", {
          node: node,
          date: new Date()
        });
      }
      else {
        _publisher.emitSync("before_add_node", {
          node: node,
          date: new Date()
        });
      }
      _nodesById[ node.id ] = node;

      if(exists){
        _publisher.emit("update_node", {
          node: node,
          date: new Date()
        });
      }
      else{
        _publisher.emit("add_node", {
          node: node,
          date: new Date()
        });
      }
    };


    this.updateNodes = function( nodes ){
      _publisher.emitSync("before_update_nodes", {
        nodes: nodes,
        date: new Date()
      });
      nodes.forEach(function(e, i, a){
        if(typeof e.id === "undefined"){
          console.error("updateNodes called for node with undefined id");
          return true;
        }
        _nodesById[ e.id ] = e;
        return true;
      });
      _publisher.emit("update_nodes", {
        nodes: nodes,
        date: new Date()
      });
    };
  };

  var default_storage = null;

  exports.init = function(){
    default_storage = new Store("default");
  };

  exports.getDefaultStorage = function(){
    return default_storage;
  };

  return exports;
})(netgraphz.core, netgraphz.eventBus);
