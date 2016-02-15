var netgraphz = netgraphz || {};
netgraphz.fetcher = (function(ng){
	var module = { };

	var _fetch_json = function( url, method, data, callback ){
		var xhr = new XMLHttpRequest();
	       	xhr.onreadystatechange = function(){ 
			if(xhr.readyState == 4){
				if(xhr.response == null) {
					console.error("[FETCHER] Received code: %d. Empty response.", xhr.status);	
					callback(null, xhr.status, xhr.statusText);
					return;
				}
				if(xhr.status >= 200 && xhr.status < 300){
					console.log("[FETCHER] Response received, HTTP code: %s", xhr.status);
				}
				else {
					console.error("[FETCHER] Received code: %d", xhr.status);
				}
				if( xhr.response == "")	
					callback({}, xhr.status, "Server retuned empty response");
				else 
					callback(JSON.parse(xhr.response), xhr.status, null);
				//callback(xhr.response, xhr.status, null);
			}			
		};
		xhr.onerror = function(){	
			console.error("[FETCHER] Error in AJAX: %s, code: %s", xhr.statusText, xhr.status);
			callback(xhr.response, xhr.status, true);
		};
		//xhr.responseType = "json";
		xhr.overrideMimeType("application/json");
		xhr.open(method, url, true); //async json get request
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(data);	
	};

	var _fetch_json_delete = function(url, data, callback) {
		_fetch_json(url, "DELETE", data, callback);
	};

	var _fetch_json_get = function(url, data, callback){
		_fetch_json(url, "GET", data, callback);
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
