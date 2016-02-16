var netgraphz = netgraphz || {};
(function(ng){
	var load_cancel = false;
	fetchLevel = 0;
	var nodes = [];
	var links = [];
	var user_params = [];
	
	var n_links = 0;
	var n_nodes = 0;


	var last_id = 0;
	var last_retry_time = 0;

	var start_netgraphz = function(){
		ng.store.init();
		ng.store.getDefaultStorage().loadAll(nodes, links); // fill graph
		ng.communication.init(ng.settings.communication); //init communcation channel
		ng.communication.getDefaultChannel().start();
		console.log("Initializing UI...");
		ng.ui.init(params.logged);
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

	var update_sequence = function(){
		fetchLevel ++;
		switch(fetchLevel){
			case 1:
				console.log("Fetching user parameters...");
				start_fetch_user_params();
				break;
		       	case 2:
				console.log("Fetching nodes...");
				start_fetch_nodes();
				break;
			case 3:
				console.log("Fetching links...");
				start_fetch_links();
				break;
			default:
				console.log("Everything is read to go. Loading graph...");
				start_netgraphz();
				break;
		}
	};


	console.log("NetGraphz2 starting up...");
        $(function(){
          netgraphz.ui.status_legend.init(netgraphz.settings.renderer.effective_state_palette);
        });
	ng.status.attachStatusFetchComplete(function(data){
		console.log("Status received from server");
		console.log("Nodes: %d, Links: %d", data.counts.nodes, data.counts.links);
		n_nodes = data.counts.nodes;
		n_links = data.counts.links;	
		update_sequence();
	});
	ng.status.attachStatusFetchFail(function(code, error){
		console.error("Server failure. Stopping loading");
		alert("Cannot fetch server status. ERROR_SERVER_FAILURE. Check backend proccess or contact to your administrator");
		load_cancel = true;
	});

	var start_fetch_user_params = function(){
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
			update_sequence();
		});
	}

	var fetch_part = function(){
		ng.fetcher.fetchFromId(last_id, ng.settings.init.node_part_size, function(p_nodes, code, error){
			if( error ){
				console.error("Error during fetch of the part");
				if( ++ last_retry_time == ng.settings.init.node_retry_times){
					console.error("No more retries left... Exiting");
					load_cancel = true;
					alert("Cannot fetch nodes. Retries exceed. Contact your administrator.");
					return;
				}
				console.log("Retrying fetch nodes from same part");
				setTimeout(fetch_part, ng.settings.init.node_part_retry_wait);
				return;
			}
			last_retry_time = 0;
			nodes = nodes.concat(p_nodes);
			$("#waiter").find(".wait_percents").text((Math.ceil(nodes.length/n_nodes * 100)).toString() + '%');
			if( p_nodes.length > 0 ){
              			last_id = Math.max(last_id, p_nodes[ p_nodes.length - 1].id);
			}
			if(p_nodes.length < ng.settings.init.node_part_size){
				console.log("Seems like nodes are ready ...");
				update_sequence();
				return;
			}
			setTimeout(fetch_part, 0);
		});
	}

	var start_fetch_nodes = function(){
		setTimeout(fetch_part, 0);
	};

	var start_fetch_links = function(){	
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
			update_sequence();
		});
	};

})(netgraphz);
