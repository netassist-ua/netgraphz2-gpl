var netgraphz = netgraphz || {};
netgraphz.fetcher = (function(ng){
	var module = { };

	var _fetch_json_get = function(url, data, callback){
		$.ajax({
			url: url,
			contentType: 'application/json',
			dataType: "json",
			type: "GET",
			data: data,
			success: function( data, text, jqXHR ){
				var code = jqXHR.status;
				if(code >= 200 && code < 300){
					console.log("[FETCHER] Response received, HTTP code: %s", code);
				}
				else {
					console.error("[FETCHER] Received code: %d", code);
				}
				callback(data, code, null);
			},
			error: function(jqXHR, text, errorThrown){
				var code = jqXHR.statusCode();
				console.error("[FETCHER] Error in AJAX: %s, code: %s", text, code);
				callback(data, code, code.statusText);
			}
		});
	};

	module.fetchStatus = function(callback){
			_fetch_json_get("/Graph/status", {}, callback);
	};

	module.fetchUserParameters = function(callback){
			_fetch_json_get("/Graph/userParams", {}, callback);
	};

  module.fetchAllNodes = function(callback){
		_fetch_json_get("/Graph/fetchAllNodes", {}, callback);
	};

	module.fetchAllLinks = function( callback ){
		_fetch_json_get("/Graph/fetchAllLinks", {}, callback);
	};

	module.fetchNode = function( id, callback ){
		_fetch_json_get("/Nodes/Get/"+id, {}, callback);
	};

	module.fetchFromId = function(id, take, callback){
		_fetch_json_get("/Nodes/GetAllFrom/"+id+"/"+take, {}, callback);
	};

	return module;

})(netgraphz);
