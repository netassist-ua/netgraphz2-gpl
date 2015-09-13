/*
Graph panel interaction module
*/

var netgraphz = netgraphz || {};
netgraphz.ui = netgraphz.ui || {};

netgraphz.ui.panel = (function(ui, eventBus, tools, utils, jQuery){

  var __interactor;

  function Interactor( user_settings ) {
    var panel_show = false;

    var defaults = {
      node_panel_id: "node_panel",
      fadeTime: 400,
      holdTime: 2400,
      node_panel_close_button_id: "node_panel_close",
      links: []
    };

    var cfg = tools.extend(defaults, user_settings);
    var __publisher;
    var self = this;
    var __shownNode = null;

    var $panel;

    jQuery(function(){
      $panel = jQuery('#' + cfg.node_panel_id);
      var $links_container = $panel.find("#node_links");

      $links_container.on("click", "a", {}, function(e){
          if($(this).data("popup")){
              var w = window.open($(this).attr("href"), $(this).data("popup-name"),
                      "width="+$(this).data("popup-width")+",height="+$(this).data("popup-height"));
              if(typeof w !== undefined){
                  w.focus();
              }
              else {
                 console.log("popup seems to be blocked...");
              }
              e.preventDefault();
              return false;
          }
      });
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

    var make_separator = function(){
        return "<span class='link_separator'> | </span>";
    };

    var make_link = function( link, node ){
        var tag = "<a href='" + utils.format_node_str(link.url, node)+"' title='"+link.title+"' ";
        if(link.type == "popup"){
          tag += "data-popup='true' ";
          if(typeof link.popupSize === "object"){
              tag += "data-popup-width='"+link.popupSize.width+"' ";
              tag += "data-popup-height='"+link.popupSize.height+"' ";
          }
          if(typeof link.popupName === "string"){
              tag += "data-popup-name='"+ utils.format_node_str(link.popupName, node) +"' " ;
          }
          else {
              tag += "data-popup-name='" + link.title + "' " ;
          }
        }
        else {
            tag += "data-popup='false' ";
            if(link.newTab)
              tag += "target='_blank' ";
        }
        tag += ">";
        tag += link.title;
        tag += "</a>";
        return tag;
    };

    this.stopNodePanelTimer = function(){
      if(timer_started){
        clearTimeout(fadeTimer);
      }
      timer_started = false;
    };

    this.startNodePanelTimer = function(){
      fadeTimer = setTimeout(function(){
        $panel.fadeOut(cfg.fadeTime, function(){
          panel_show = false;
        });
        timer_started = false;
      }, cfg.holdTime);
      timer_started = true;
    };

    this.setContent = function(node){
      __shownNode = node;
      $panel.find("#node_name").text(node.name);
      $panel.find("#node_ip").text(node.ip);
      $panel.find("#node_address").text(node.address);
      $panel.find("#node_mac").text(node.mac);
      $panel.find("#node_state").text(utils.get_node_state_text(node.state));
      $panel.find("#node_rtt").text(node.rtt != null ? node.rtt + ' ms' : "?");
      $panel.find("#node_loss").text(node.packet_loss != null ? (parseFloat(node.packet_loss) * 100).toFixed(2) + '%': "?");
      $panel.find("#node_model").text(node.model);
      if(typeof node.duplicates === "undefined" || node.duplicates == null){
        $panel.find("#node_dups").text("?");
      }
      else {
        $panel.find("#node_dups").text(node.duplicates ? "YES!" : "No");
      }
      var $links_container = $panel.find("#node_links");
      $links_container.empty();
      if(typeof cfg.links === "undefined"
          || !Array.isArray(cfg.links)){
          return;
      }
      var l_length = cfg.links.length;
      for( var i = 0; i < l_length; i ++ ){
          var link = cfg.links [ i ];
          $links_container.append(make_link(link, node));
          if( i + 1 < l_length ){
              $links_container.append(make_separator());
          }
      }
    };

    this.showNodePanel = function(node){
      __shownNode = node;
      if(timer_started){
        self.stopNodePanelTimer();
      }
      self.setContent(node);
      if(!panel_show){
        $panel.fadeIn(cfg.fadeTime, function(e){
          panel_show = true;
        });
      };
    };

    this.getShownNode = function( node ){
      return __shownNode;
    };

    this.closeNodePanel = function() {
      $panel.hide();
      panel_show = false;
    };
    return this;
  };


  var attach_events = function(){
    eventBus.subscribe("ui", "node_mouseover", function(topic, e){
      handle_node_select(e.node);
    });

    eventBus.subscribe("ui", "node_select", function(topic, e){
      handle_node_select(e.node);
    });

    eventBus.subscribe("ui", "node_mouseout", function(topic,e){
      __interactor.startNodePanelTimer();
    });

    eventBus.subscribe("store:default", "update_node", function(topic,e){
      var node = __interactor.getShownNode();
      if(node == null || typeof node !== "object") return;
      if(typeof e.node === "undefined"){
        console.error("[BUG] update_node event with undefined node received!");
        return;
      }
      if(e.node.id == node.id)
      __interactor.setContent(e.node);
    });

    eventBus.subscribe("store:default", "update_nodes", function(topic, e){
      var node = __interactor.getShownNode();
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

  var handle_node_select = function(node){
    if(typeof node === "undefined"){
      console.error("Cannot find %s in loaded nodes", node.id);
    }
    __interactor.showNodePanel(node);
  };

  var init = function(settings){
    __publisher = eventBus.registerPublisher("ui.panel");
    __interactor = new Interactor(settings);
    attach_events();
  };

  var exports = {
    init: init
  };

  return exports;

})(netgraphz.ui, netgraphz.eventBus, netgraphz.tools, netgraphz.utils, $);
