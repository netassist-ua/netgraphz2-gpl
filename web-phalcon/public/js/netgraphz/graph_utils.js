netgraphz.utils = (function(cfg){

	var _state_text =  {
		1: "Down!",
		0: "Up",
		2: "Warning",
		3: "Flapping",
		4: "Unknown",
		5: "Unreachable",
	};
	var _icinga_host_states = {
		0: 0, // up
		1: 1, // down
		2: 5 // Unreachable
	};

	var module = {};

	module.formatDate = function( date ){
		day = date.getDate() < 10 ? "0"+date.getDate() : date.getDate().toString();
		month = date.getMonth() < 9 ? "0"+(date.getMonth() + 1) : (date.getMonth() + 1).toString();
		year = date.getFullYear();
		hours = date.getHours() < 10 ? "0"+date.getHours() : date.getHours().toString();
		minutes = date.getMinutes() < 10 ? "0"+date.getMinutes() : date.getMinutes().toString();
		seconds = date.getSeconds() < 10 ? "0"+date.getSeconds() : date.getSeconds().toString();
		return day + "." + month + "." + year + " " + hours + ":" + minutes + ":" + seconds;
	}


	module.get_node_pref_effective_state = function(n){
		var effective_state;
		if( typeof n.status === "undefined" 
				|| !Array.isArray(n.status)
				|| n.status.length == 0 )
			return null;
		max_time = 0;
		max_time_index = 0;
		for( var i = 0; i < n.status.length; i++){
			if( n.status[ i ].time > max_time ){
				max_time = n.status[ i ].time;
				max_time_index = i;
			}
		}
		if( typeof cfg.default_state_source === "undefined" 
				|| cfg.default_state_source == null ){
			return n.status[ max_time_index ].effective_state;
		}
		for( var i = 0; i < n.status.length; i++){
			if(n.status[ i ].source == cfg.default_state_source ){
				return n.status[ i ].effective_state; 
			}	
		}
		return n.status[ max_time_index ].effective_state;
	};

	/*
	 * Create link based on link parameters and object properties
	 *
	 * @param {object} link - Link parameters object
	 * @param {object} obj - Object to obtain properties
	 * @return {string} Link
	 */
	var make_link = function( link, obj ){
		var tag = "<a href='" + module.format_prop_str(link.url, obj)+"' title='"+link.title+"' ";
		if(link.type == "popup"){
			tag += "data-popup='true' ";
			if(typeof link.popupSize === "object"){
				tag += "data-popup-width='"+link.popupSize.width+"' ";
				tag += "data-popup-height='"+link.popupSize.height+"' ";
			}
			if(typeof link.popupName === "string"){
				tag += "data-popup-name='"+ module.format_prop_str(link.popupName, obj) +"' " ;
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
		tag += module.format_prop_str(link.title, obj);
		tag += "</a>";
		return tag;
	};

	/*
	 * Format string replacing tags to the object properties
	 * @param {string} str - String to replace tags
	 * @param {object} obj - Object to obtain properties
	 * @return {string} Formatted string
	 */
	module.format_prop_str = function( str, obj ){
		if( typeof node !== "object"){
			console.error("utils.format_node_str - called with non-object [node] param");
			return str;
		}
		var regex = new RegExp("^.*\{(.+)\}.*$");
		var r = regex.exec(str);
		if( typeof r === "undefined" || r == null){
			return str;
		}
		var len = r.length;
		for( var i = 1; i < len; i++){
			if(!node.hasOwnProperty(r[i])){
				console.error("utils.format_node_str - property "+r[i]+" not found in [node] object");
				continue;
			}
			str = str.replace('{'+r[i]+'}', node[r[i]]);
		}
		return str;
	};

	module.get_node_state_text = function(state){
		//TODO: i18n
		return _state_text[state];
	};

	/*
	 * Maps Icinga2 state to effective state
	 * @param {number} icinga_state_id - Icinga2 state id
	 * @return {number} Effective state
	 */
	module.get_node_state_from_icinga = function( icinga_state_id ){
		return _icinga_host_states[icinga_state_id];
	};

	module.getPixelsOrUndefined = function( value ){
		if(value == null || isNaN(value)) return undefined;
		return value + "px";
	};
	return module;
})(netgraphz.settings);
