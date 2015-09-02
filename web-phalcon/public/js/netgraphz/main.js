var netgraphz = netgraphz || {};
(function(ng){
    var load_cancel = false;
    fetchLevel = 0;
    var nodes = [];
    var links = [];

    var start_netgraphz = function(){
        ng.store.init();
        ng.store.getDefaultStorage().loadAll(nodes, links); // fill graph
        ng.communication.init(ng.settings.communication); //init communcation channel
        ng.communication.getDefaultChannel().start();
        console.log("Initializing UI...");
        ng.ui.init();
        console.log("UI.Panel...");
        ng.ui.panel.init(ng.settings.ui.node_panel);
        console.log("UI TabStop...");
        ng.ui.tabStop.init(ng.settings.ui.tabStop);
        console.log("UI notifications...");
        ng.ui.notifications.init(ng.settings.ui.notifications);
        console.log("Initializing renderer...");
        ng.renderer.init(ng.settings.renderer);
        console.log("Initializing search...");
        ng.ui.search.init(ng.settings.ui.search);
        console.log("Rendering graph...");
        ng.renderer.getDefaultRenderer().render_graph(nodes,links);
        console.log("Starting automatic update...");
        ng.updater.start();
    }

    console.log("Fetching data...");

    ng.fetcher.fetchAllNodes(function(data, code, error){
        if(load_cancel)
          return;
        if(error){
          console.error("Failed to fetch nodes graph data, http code: %s", code);
          console.error("Error: %s", JSON.stringify(error));
          alert("Error while fetching graph data, refresh page. If problem persists, contact administrator.")
          load_cancel = true;
          return;
        }
        console.log("Nodes loading completed");
        fetchLevel ++;
        nodes = data;
        if(fetchLevel == 2){
            console.log("Loading graph...");
            start_netgraphz();
        }
        else {
            console.log("Awaiting links...");
        }
    });

    ng.fetcher.fetchAllLinks(function( data, code, error ){
      if(load_cancel)
        return;
      if(error && error != "OK"){
        console.error("Failed to fetch links graph data, http code: %s", code);
        console.error("Error: %s", JSON.stringify(error));
        alert("Error while fetching graph data, refresh page. If problem persists, contact administrator.")
        load_cancel = true;
        return;
      }
      console.log("Links loading completed");
      fetchLevel ++;
      links = data;
      if(fetchLevel == 2){
          console.log("Loading graph...");
          start_netgraphz();
      }
      else {
          console.log("Awaiting nodes...");
      }
    });

})(netgraphz);
