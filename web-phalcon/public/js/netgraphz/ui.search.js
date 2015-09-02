var netgraphz = netgraphz || {};
netgraphz.ui = netgraphz.ui || {};
netgraphz.ui.search = (function(ui, store, eventBus, tools, jQuery){

  var exports = {};

  var default_instance = null;

  var defaults = {
    enabled: true,
    searchInputId: "search"
  };

  var SearchField = function(settings){

    var searchInput = null;
    var self = this;

    this.focus = function(){
      searchInput.focus();
    };

    var attach_events = function(){
    };

    var init = function(){
      searchInput = jQuery("#"+settings.searchInputId);
      searchInput.autocomplete({
        source: function( request, response ) {
          response(store.getDefaultStorage().searchNodesByName(request.term).map(
            function(node){
              return {
                label: node.name,
                value: node.name,
                id: node.id
              }
            }));
        },
        select: function(e, u){
            console.log("[ui.search] Selected: %s - %s", u.item.value, u.item.id);
            ui.select_node(u.item.id);
        }
      });
      attach_events();
    };

    jQuery(function(){
      init();
    });
  };

  var attach_events = function(){
    eventBus.subscribe("ui", "window_keydown", function(topic, e){
      var domEvent = e.domEvent;
      if( domEvent.keyCode == 191 ){
        default_instance.focus();
      }
    });
  };

  exports.SearchField = SearchField;

  exports.init = function(config) {
    var settings = tools.extend(defaults, config);
    default_instance = new SearchField(settings);
    attach_events();
  };

  exports.getDefaultInstance = function(){
    return default_instance;
  };

  return exports;
})(
  netgraphz.ui,
  netgraphz.store,
  netgraphz.eventBus,
  netgraphz.tools,
  $);
