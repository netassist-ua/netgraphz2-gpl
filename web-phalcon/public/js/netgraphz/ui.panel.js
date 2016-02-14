/*
   Graph panel interaction module
   */

var netgraphz = netgraphz || {};
netgraphz.ui = netgraphz.ui || {};

netgraphz.ui.panel = (function(ui, eventBus, tools, utils, jQuery){

  var __interactor;


  var defaults = {
    node_panel_id: "node_panel",
    fadeTime: 400,
    holdTime: 2400,
    waitTime: 900,
    node_panel_close_button_id: "node_panel_close",
    links: [],
    leftPosition: {
      left: 20,
      right: null,
      top: null,
      bottom: 10

    },
    rightPosition: { 
      right: 20,
      left: null,
      top: null,
      bottom: 10 
    }
  };
  var cfg = defaults;


  function Interactor( container_id ) {
    var panel_show = false;
    var __publisher;
    var self = this;
    var __shownNode = null;
    var __selectedNode = null;

    var $panel;

    jQuery(function(){
      $panel = jQuery('#' + cfg.node_panel_id);
      var $links_container = $panel.find("#node_links");
      utils.attach_link_events($links_container);
      $panel.on('mouseover', function(){
        self.stopNodePanelTimer();
      });

      $panel.on('mouseout', function(){
        self.startNodePanelTimer();
      });
      jQuery("#"+ cfg.node_panel_close_button_id).click(function(e){
        self.closeNodePanel();
        e.preventDefault();
        $(this).blur();
      });
    });

    var fadeTimer;
    var timer_started = false;


    this.stopNodePanelTimer = function(){
      if(timer_started){
        clearTimeout(fadeTimer);
      }
      timer_started = false;
    };

    this.startNodePanelTimer = function(){
      fadeTimer = setTimeout(function(){
        if(__selectedNode != null){
          self.setContent(__selectedNode);
        }
        else {
          $panel.fadeOut(cfg.fadeTime, function(){
            panel_show = false;
            __shownNode = null;
            __selectedNode = null;
          });
        }
        timer_started = false;
      }, cfg.holdTime);
      timer_started = true;
    };

    this.setSelectedNode = function(node){
      __selectedNode = node;
    }

    this.setContent = function(node){
      __shownNode = node;
      $panel.find("#node_name").text(node.name);
      $panel.find("#node_ip").text(node.ip);
      $panel.find("#node_address").text(node.address);
      $panel.find("#node_mac").text(node.mac);
      $panel.find("#node_model").text(node.model);


      var node_mon_data = [];
      for( var i = 0; i < node.status.length; i++){
        var date = new Date(node.status[i].time * 1000);
        var mon = {
          source: node.status.length == 1 ? "" : node.status[i].source,
          loss: Math.round(node.status[i].loss).toString(),
          rtt: node.status[i].rtt.toFixed(3).toString(),
          time: utils.formatDate(date),
          state: utils.get_node_state_text(node.status[i].effective_state),
          dup: node.status[i].dup ? "(DUP!)" : "" 
        }
        node_mon_data.push(mon);
      }

      $panel.find("#monitoring_sources").html(
          $("#mon_source_template").render(node_mon_data)
          );

      var $links_container = $panel.find("#node_links");
      $links_container.empty();
      if(typeof cfg.links === "undefined"
          || !Array.isArray(cfg.links)){
        return;
      }
      var l_length = cfg.links.length;
      for( var i = 0; i < l_length; i ++ ){
        var link = cfg.links [ i ];
        $links_container.append(utils.make_link(link, node));
        if( i + 1 < l_length ){
          $links_container.append(utils.make_separator());
        }
      }
    };


    this.showNodePanel = function(node, node_scr_pos){
      __shownNode = node;
      if(timer_started){
        self.stopNodePanelTimer();
      }
      self.setContent(node);


      //recalculate position
      var panel_width = $panel.width();
      var panel_height = $panel.height();

      var inner_width = $(window).width();
      var inner_height = $(window).height();

      var container_position = $("#"+container_id).position(); 

      var pref = cfg.rightPosition; //default position
      var x_left  =  !isNaN(pref.left)  && pref.left != null ? pref.left : inner_width - pref.right - panel_width;
      var x_right =  !isNaN(pref.right) && pref.right != null ? inner_width - pref.right :  inner_width - pref.right;

      var y_top    = !isNaN(pref.top) && pref.top != null ? pref.top : inner_height - pref.bottom - panel_height;
      var y_bottom = !isNaN(pref.bottom) && pref.bottom != null ? inner_height - pref.bottom : pref.top + panel_height;


      if(typeof node_scr_pos !== "undefined"){
        var x_pos = node_scr_pos.x + container_position.left;
        var y_pos = node_scr_pos.y + container_position.top;
        var x_cond = x_pos >= x_left - 40 && x_pos <= x_right + 20;
        var y_cond = y_pos >= y_top  - 40 && y_pos <= y_bottom + 20;
        if( x_cond && y_cond ) pref = cfg.leftPosition;
      }

      $panel.css({
        "top": "",
        "left": "",
        "right": "",
        "left": ""
      });

      $panel.css({
        "top": utils.getPixelsOrUndefined(pref.top),
        "left": utils.getPixelsOrUndefined(pref.left),
        "right": utils.getPixelsOrUndefined(pref.right),
        "left": utils.getPixelsOrUndefined(pref.left) 
      });

      if(!panel_show){
        $panel.fadeIn(cfg.fadeTime, function(e){
          panel_show = true;
        });
      };
    };

    this.getShownNode = function(){
      return __shownNode;
    };

    this.getSelectedNode = function(){
      return __selectedNode;
    };

    this.closeNodePanel = function() {
      $panel.hide();
      panel_show = false;
    };
    return this;
  };

  var mouseover_node_timer = null;

  var attach_events = function(){
    eventBus.subscribe("ui", "node_mouseover", function(topic, e){
      if( ui.isNodePanelDisabled() ){
        return;
      }
      if(mouseover_node_timer != null) {
        clearTimeout(mouseover_node_timer);
      }
      var fn = function(){
        mouseover_node_timer = null;
        handle_node_info(e.node, e.rendererPosition);

      }

      if(__interactor.getShownNode() == null){
        fn();
      }

      mouseover_node_timer = setTimeout(fn, cfg.waitTime);
    });

    eventBus.subscribe("ui", "node_select", function(topic, e){
      handle_node_info(e.node, e.rendererPosition);
      __interactor.setSelectedNode(e.node);
      __interactor.stopNodePanelTimer();
    });

    eventBus.subscribe("ui", "node_unselect", function(topie, e){
      var selected = __interactor.getSelectedNode();
      var shown = __interactor.getShownNode();
      __interactor.setSelectedNode(null);
      if(selected != null && shown != null && selected.id == shown.id){
        __interactor.startNodePanelTimer();
      }
    });

    eventBus.subscribe("ui", "node_mouseout", function(topic,e){
      if(ui.isNodePanelDisabled()){
        return;
      }
      if(mouseover_node_timer != null) {
        clearTimeout(mouseover_node_timer);
      }
      var selected = __interactor.getSelectedNode();
      var shown = __interactor.getShownNode();
      if( (selected != null && e.node.id != selected.id) ||
          (shown != null && e.node.id == shown.id )){
        __interactor.startNodePanelTimer();
      }
    });

    eventBus.subscribe("store:default", "update_node", function(topic,e){
      var node = __interactor.getShownNode();
      var selected = __interactor.getSelectedNode();	
      if(node == null || typeof node !== "object") return;
      if(typeof e.node === "undefined"){
        console.error("[BUG] update_node event with undefined node received!");
        return;
      }	
      if(selected != null && e.node.id == selected.id )
        __interactor.setSelectedNode(e.node);
      if(e.node.id == node.id)
        __interactor.setContent(e.node);
    });

    eventBus.subscribe("store:default", "update_nodes", function(topic, e){
      var node = __interactor.getShownNode();
      var selected = __interactor.getSelectedNode();	
      if(node == null || typeof node !== "object") return;
      if(typeof e.nodes === "undefined" || !Array.isArray(e.nodes)){
        console.error("[BUG] update_nodes event with undefined or non-array nodes received!");
        return;
      }
      e.nodes.forEach(function(el,i,a){
        if(typeof el !== "object"){
          console.error("[BUG] update_nodes event with non-object in nodes array");
          return true;
        }
        if(selected != null && el.id == selected.id )
          __interactor.setSelectedNode(e.node);
        if(el.id == node.id){
          __interactor.setContent(el);
          return false;
        }
        else {
          return true;
        }
      });
    });
  };

  var handle_node_info = function(node, rendererPosition){
    if(typeof node === "undefined"){
      console.error("Cannot find %s in loaded nodes", node.id);
    }
    __interactor.showNodePanel(node, rendererPosition);
  };

  var init = function(settings, container_id){
    cfg = tools.extend(defaults, settings);
    __publisher = eventBus.registerPublisher("ui.panel");
    __interactor = new Interactor(container_id);
    attach_events();
  };

  var exports = {
    init: init
  };

  return exports;

})(netgraphz.ui, netgraphz.eventBus, netgraphz.tools, netgraphz.utils, $);
