//User interface interaction module

var netgraphz = netgraphz || {};
netgraphz.ui = (function(utils, store, settings, renderer, eventBus, fetcher, $){
  var _publisher = eventBus.registerPublisher("ui");
  var exports = {};
  var $cbFollow;
  var $cbMute;
  var $btnLayoutStart;
  var $btnLayoutStop;
  var $btnResetZoom;
  var $btnPositionSave;
  var $btnPositionReset;
  var logged_in = false;


  var plugin_core_context_menu_cmds = [];

  var saveNodePositions = function(){
    var pos = renderer.getDefaultRenderer().dumpNodesPositions();
    $.ajax({
      url: "/Graph/positions",
      contentType: "application/json",
      type: "POST",
      data: JSON.stringify(pos),
      success: function( data, text, jqXHR ){
        var code = jqXHR.status;
        if(code >= 200 && code < 300){
          console.log("[Positions] Response received, HTTP code: %s", code);
        }
        else {
          console.error("[Positions] Received code: %d", code);
        }
        console.log("Positions save success");
        alert("Positions saved successfully");
      },
      error: function(jqXHR, text, errorThrown){
        var code = jqXHR.statusCode();
        console.error("[FETCHER] Error in AJAX: %s, code: %s", text, code);
        console.error("Failed to save positions");
        alert("Failed to save positions. Try again later!");
      }
    });
  };

  var clearPositions = function(){
    $.ajax({
      url: "/Graph/positions",
      contentType: "application/json",
      type: "DELETE",
      data: {},
      success: function( data, text, jqXHR ){
        var code = jqXHR.status;
        if(code >= 200 && code < 300){
          console.log("[Positions] Response received, HTTP code: %s", code);
        }
        else {
          console.error("[Positions] Received code: %d", code);
        }
        console.log("Positions delete success");
        alert("Positions cleared successfully");
      },
      error: function(jqXHR, text, errorThrown){
        var code = jqXHR.statusCode();
        console.error("[FETCHER] Error in AJAX: %s, code: %s", text, code);
        console.error("Failed to delete positions");
        alert("Failed to delete positions. Try again later!");
      }
    });
  };

  /*
   * Handle node UI event in default handling way
   * @param {string} topic - Event topic
   * @param {object} e - Event object
   * @param {string} retopic - Resending topic
   */
  var dispatch_node_event = function(topic, e, retopic){
    var regex = new RegExp("n([0-9]+)");
    var matches = regex.exec(e.cyEvent.cyTarget.id());
    if(matches == null || matches.length < 2){
      console.error("Cannot parse node id: %s", e.node_id);
      return;
    }
    var id = parseInt(matches[1]);
    var node = store.getDefaultStorage().getNodeById(id);
    if(typeof node === "undefined"){
      console.error("Node not found in storage, id: %s", id);
      return;
    }
    _publisher.emit(retopic,
        {
          node: node, 
          position: e.cyEvent.cyPosition,
          rendererPosition: e.cyEvent.cyRenderedPosition,
          date: new Date()
        });
  }; 
  var dispatch_link_event = function(topic, e, retopic){
    link_id = e.cyEvent.cyTarget.data('real_id');
    if(typeof link_id === "undefined"){
      console.error("Cannot find link id of edge, BUG?!");
      return false; 
    }
    var link = store.getDefaultStorage().getLinkById(link_id);
    if( typeof link == "undefined"){
      console.error("Link not found in storage, id: %s", link_id);
      return false;
    }
    _publisher.emit(retopic, 
        {			
          link: link,
          position: e.cyEvent.cyPosition,
          rendererPosition: e.cyEvent.cyRenderedPosition,
          data: new Date()
        });
  };

  /*
   * Attach event handlers to UI events
   */
  var attach_events = function(){
    eventBus.subscribe("renderer:default", "node_select", function(topic, e){
      dispatch_node_event(topic, e, "node_select");
    });
    eventBus.subscribe("renderer:default", "node_mouseover", function(topic, e){
      dispatch_node_event(topic, e, "node_mouseover");
    });
    eventBus.subscribe("renderer:default", "node_mouseout", function(topic, e){
      dispatch_node_event(topic, e, "node_mouseout");
    });
    eventBus.subscribe("renderer:default", "node_unselect", function(topic, e){
      dispatch_node_event(topic, e, "node_unselect");
    });
    eventBus.subscribe("renderer:default", "edge_mouseover", function(topic, e){
      dispatch_link_event(topic, e, "edge_mouseover");
    });
    eventBus.subscribe("renderer:default", "edge_mouseout", function(topic, e){
      dispatch_link_event(topic, e, "edge_mouseout");
    });
    eventBus.subscribe("renderer:default", "edge_select", function(topic, e){
      dispatch_link_event(topic, e, "edge_select");
    });
    eventBus.subscribe("renderer:default", "edge_unselect", function(topic, e){
      dispatch_link_event(topic, e, "edge_unselect");
    });
    eventBus.subscribe("renderer:default", "edge_tap", function(topic, e){
      dispatch_link_event(topic, e, "edge_tap");
    });
    eventBus.subscribe("renderer:default", "prerender", function(topic, e){
      var core_commands = [
      {
        content: "Reset zoom",
        select: function(){
          renderer.getDefaultRenderer().resetZoomAndCenter();
        }
      },
      {
        content: "Layout start",
        select: function(){
          renderer.getDefaultRenderer().startLayout();
        }
      },
        {
          content: "Layout stop",
          select: function(){
            renderer.getDefaultRenderer().stopLayout();
          }
        }];
      for( var i=0; i<plugin_core_context_menu_cmds.length; i++){
        core_commands.push(plugin_core_context_menu_cmds[i]);
      }
      if( logged_in ){
        core_commands.push({
          content: "Save positions",
          select: function(){
            saveNodePositions();
          }
        });
        core_commands.push({
          content: "Clear positions",
          select: function(){ 
            clearPositions();
          }
        });
      }
      var node_commands = [];
      if( Array.isArray(settings.node_cxt_links) ){
        for( var i=0; i<settings.node_cxt_links.length; i++){
          var url = settings.node_cxt_links[i].url;
          node_commands.push({
            content: settings.node_cxt_links[i].content,
            select: function(e){
                  var id = e.data('real_id');
                  var node = store.getDefaultStorage().getNodeById(id);
                  var redirectWindow = window.open(utils.format_prop_str(url, node), '_blank');
                  redirectWindow.location;
            }
          });
        }
      }
      renderer.getDefaultRenderer().init_context_menu(core_commands, node_commands);
    });
    $(function(){
      $(window).keyup(function(e){
        _publisher.emitSync("window_keyup", {
          domEvent: e,
          time: new Date()
        });
      });
      $("div#waiter").hide();
      $(window).resize(function(e){
        _publisher.emitSync("window_resize", {
          domEvent: e,
          time: new Date()
        });
      });
      $(window).keydown(function(e){
        _publisher.emitSync("window_keydown", {
          domEvent: e,
          time: new Date()
        });
      });
      $cbFollow = $("#graph_follownodes");
      $cbMute = $("#mute_sound");
      $btnLayoutStart = $("#graph_layoutstart");
      $btnLayoutStop = $("#graph_layoutstop");
      $btnResetZoom = $("#graph_resetzoom");
      $btnPositionSave = $("#pos_save");
      $btnPositionReset = $("#pos_clear");

      $btnPositionSave.click(function(e){
        e.preventDefault();
        saveNodePositions(); 
        $(this).blur();
      }) ;
      $btnPositionReset.click(function(e){
        e.preventDefault();
        clearPositions();
        $(this).blur();
      });
      $btnResetZoom.click(function(e){
        e.preventDefault();
        renderer.getDefaultRenderer().resetZoomAndCenter();
        $(this).blur();
      });
      $btnLayoutStart.click(function(e){
        e.preventDefault();
        renderer.getDefaultRenderer().startLayout();
        $(this).blur();
      });
      $btnLayoutStop.click(function(e){
        e.preventDefault();
        renderer.getDefaultRenderer().stopLayout();
        $(this).blur();
      });

    });
  };


  /**
   * Add core context menu command
   * @param {object} command - Command to add into core renderer context menu
   */
  exports.addCoreContextMenuCommand = function( command ){
    if(typeof command === "object"){
      plugin_core_context_menu_cmds.push(command);
    }
  };

  /**
   * Save node positions
   *
   */
  exports.saveNodePositions = function(){
    saveNodePositions();
  }

  /**
   * Clear save positions
   */
  exports.clearPositions = function(){
    clearPositions();
  }

  /*
   * Returns if automatic node follow node enabled
   * @return {boolean} Node follow mode status
   */
  exports.isFollowEnabled = function(){
    return $cbFollow.is(":checked");
  };

  /*
   * Returns status mute option
   * @return {boolean} Mute option status
   */
  exports.isSoundMuted = function(){
    return $cbMute.is(":checked");
  }

  /*
   * Selects node on graph
   * @param {number} id - Node identifier
   */
  exports.select_node = function(id){
    var node = store.getDefaultStorage().getNodeById(id);
    if( typeof node === "undefined") {
      console.error("Call selectNode() with id: %s  - not found", id);
      return;
    }
    renderer.getDefaultRenderer().select_node(id);
    _publisher.emit("node_select", {
      node: node,
      time: new Date()
    });
  };

  /*
   * Initialize UI
   */
  exports.init = function(log_in){
    if( typeof log_in === "boolean" )
      logged_in = log_in;
    attach_events();
  };

  return exports;
})(netgraphz.utils, netgraphz.store, netgraphz.settings.ui, netgraphz.renderer, netgraphz.eventBus, netgraphz.fetcher, $);
