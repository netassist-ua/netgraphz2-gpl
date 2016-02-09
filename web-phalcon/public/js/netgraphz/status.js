var netgraphz = netgraphz || {};

netgraphz.status = (function(fetcher, $){
	var n_nodes = 0;
	var n_lins = 0; 

	var module = {};

	var is_complete = false;
	var is_success = false;
	var is_failed = false;


	var status_obj = {};
	var fail_code = null;
	var fail_error = null;

	var success_handlers = [];
	var fail_handlers = [];

	module.attachStatusFetchComplete = function( handler ){
		if(typeof handler === "function" ){
			success_handlers.push(handler);
		}
		else return false;
		if(is_complete && is_success){
			setTimeout(function(){handler(status_obj)}, 0);
		}
		return true;
	}

	module.attachStatusFetchFail = function( handler ){
		if (typeof handler === "function"){
			fail_handlers.push(handler);
		}	
		else return false;
		if ( is_complete && is_failed ){
			setTimeout(function(){handler(fail_code, fail_error)}, 0);
		}
		return true;
	}

	fetcher.fetchStatus(function(data, code, error){
		is_complete = true;
		if(error){
			is_failed = true;
			console.error("Failed to fetch status data, http code: %s", code);
			console.error("Error: %s", JSON.stringify(error));
			for( var i = 0; i < fail_handlers.length; i++){
				fail_handlers[i](code, error);
			}
			return;
		}
		is_success = true;
		status_obj = data;
		for (var i = 0; i < success_handlers.length; i++){
			success_handlers[i](data);	
		}
		$(function(){
			$("#status_nodes_count").text(data.counts.nodes);
			$("#status_links_count").text(data.counts.links);
		});
	});
	return module;
})(netgraphz.fetcher, $);
