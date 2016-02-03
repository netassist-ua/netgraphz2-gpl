var netgraphz = netgraphz || {};
(function(ng){
    var load_cancel = false;
    fetchLevel = 0;
    var nodes = [];
    var links = [];
    var user_params = [];

    var start_netgraphz = function(){
        ng.store.init();
        ng.store.getDefaultStorage().loadAll(nodes, links); // fill graph
        ng.communication.init(ng.settings.communication); //init communcation channel
        ng.communication.getDefaultChannel().start();
        console.log("Initializing UI...");
        ng.ui.init();
        console.log("UI.Panel...");
        ng.ui.panel.init(ng.settings.ui.node_panel, ng.settings.renderer.container_id);
	console.log("UI.Link Panel...");
	ng.ui.linkPanel.init(ng.settings.ui.link_panel, ng.settings.renderer.container_id);
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
        if(!params.positions){
          console.log("No saved positions. Starting layout...");
          ng.renderer.getDefaultRenderer().startLayout();
          setTimeout(function(){
              ng.renderer.getDefaultRenderer().stopLayout();
          }, ng.settings.renderer.layout.maxSimulatingTime);
        }
        console.log("Starting automatic update...");
        ng.updater.start();
    };

    var start_sequence = function(){
      fetchLevel ++;
      if(fetchLevel == 3){
          console.log("Loading graph...");
          start_netgraphz();
      }
      else {
          console.log("Awaiting links...");
      }
    };

    console.log("Fetching data...");

    ng.fetcher.fetchUserParameters(function(data, code, error){
      if(load_cancel)
        return;
      if(error){
        console.error("Failed to fetch user data, http code: %s", code);
        console.error("Error: %s", JSON.stringify(error));
        alert("Error while user data, refresh page. If problem persists, contact administrator.")
        load_cancel = true;
        return;
      }
      console.log("User parameters loading completed");
      params = data;
      if(params.error){
          console.error("Error while getting user parameters: %s", params.error_message);
          alert("Error while fetching user parameters, nodes will be simulated from initial positions. \n" +
                "Contact to your system administrator to fix the problem. \n"  + (
                "error_message" in params ? params.error_message : "No error message provided from server." ``) );
      }
      start_sequence();
    });


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
        nodes = data;
        start_sequence();
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
      links = data;
      start_sequence();
    });

})(netgraphz);
