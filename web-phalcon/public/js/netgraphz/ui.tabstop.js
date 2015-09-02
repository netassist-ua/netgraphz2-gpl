var netgraphz = netgraphz || {};
netgraphz.ui = netgraphz.ui || {};
netgraphz.ui.tabStop =  (function(ui, eventBus, tools, store, core, $){
  var defaults = {
    'enabled': true
  };
  var _tab_stop_queue = [];
  var _tab_stop = 0;
  var settings = defaults;

  var exports = {};

  var module = {};

  var handle_node_update = function(node){
    var index = -1;
    _tab_stop_queue.forEach(function(e,i,a){
        if( e.id == node.id ) index = i;
        return index == -1;
    });
    var problem = (node.state == core.node_state.STATE_NODE_DOWN || node.state == core.node_state.STATE_NODE_WARN);
    if(problem){
        if(index == -1)
          _tab_stop_queue.push(node); //add into queue
    }
    else {
        if(index > -1)
          _tab_stop_queue.splice(index,1); //remove one
    }
  };

  var attach_events = function(){
    eventBus.subscribe("ui", "window_keydown", function(topic, e){
      var domEvent = e.domEvent;
      if(domEvent.keyCode == 9){
        domEvent.preventDefault();
        if(domEvent.shiftKey){
          _handle_tab_bkwd_switch();
        }
        else {
          _handle_tab_fwd_switch();
        }
      }
    });
    eventBus.subscribe("store:default", "update_nodes", function(topic, e){
        e.nodes.forEach(function(n, i, a){
          handle_node_update(n);
        });
    });
    eventBus.subscribe("store:default", "update_node", function(topic, e){
        handle_node_update(e.node);
    });
  };

  var _handle_tab_fwd_switch = function () {
    if(_tab_stop_queue.length == 0){
      console.log("Tab stop queue is empty, exiting");
      return;
    }
    if(_tab_stop < _tab_stop_queue.length - 1){
      var id = _tab_stop_queue[_tab_stop].id;
      ui.select_node(id);
      if(_tab_stop + 1 == _tab_stop_queue.length){
        _tab_stop = 0;
      }
      else {
        _tab_stop ++;
      }
    }
    else {
      _tab_stop = 0;
      _handle_tab_fwd_switch();
    }
  };

  var _handle_tab_bkwd_switch = function(){
    if(_tab_stop_queue.length == 0){
      console.log("Tab stop queue is empty, exiting");
      return;
    }
    if(_tab_stop > 0){
      var id = _tab_stop_queue[_tab_stop].id;
      ui.select_node(id);
      if(_tab_stop - 1 < 0){
        _tab_stop = _tab_stop_queue.length - 1;
      }
      else {
        _tab_stop --;
      }
    }
    else {
      _tab_stop = _tab_stop_queue.length - 1;
      _handle_tab_bkwd_switch();
    }
  };

  module.init = function(config){
    settings = tools.extend(defaults, config);
    if(settings.enabled){
      _tab_stop_queue = store.getDefaultStorage().getDownNodes()
      .concat(store.getDefaultStorage().getWarningNodes());
      attach_events();
    }
  };

  module.stop = function(){
    console.log("UI.tabstop: stop not implemented");
  };

  return module;

})(netgraphz.ui, netgraphz.eventBus, netgraphz.tools, netgraphz.store, netgraphz.core, $);
