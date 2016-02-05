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
	module.make_link = function( link, obj ){
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
	 * Returns separator between links
	 * @return {string} Link separator
	 */
	module.make_separator = function(){
		return "<span class='link_separator'> | </span>";
	};

	/*
	 * Attach events to the links container of panel
	 * @param {jQuery} $container - jQuery object of container
	 */
	module.attach_link_events = function($container){
		$container.on("click", "a", {}, function(e){
			if($(this).data("popup")){
				var w = window.open($(this).attr("href"), 
						$(this).data("popup-name"),
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
	};

	/*
	 * Format string replacing tags to the object properties
	 * @param {string} str - String to replace tags
	 * @param {object} obj - Object to obtain properties
	 * @return {string} Formatted string
	 */
	module.format_prop_str = function( str, obj ){
		if( typeof obj !== "object"){
			console.error("utils.format_node_str - called with non-object param");
			return str;
		}
		var o_regexp = /.*?[^\\]?(\{(\w+[^\\]?(?:\.\w+)*)\})/g;
		var o_matches = null;
		while( (o_matches = o_regexp.exec(str)) != null){
			//scan each tag avoiding screening symbols
			if( o_matches.length < 3 ){
				console.debug("Match with length < 2, skipping. BUG?!");
				continue;
			}
			var tag = o_matches[ 2 ];
			var i_regexp = /(\w+)[^\\]?(?:\.(\w+))*/g;
			var i_matches = null;
			var prop_val = obj;
			while( (i_matches = i_regexp.exec(tag)) != null ){
				if( typeof prop_val !== "object" ){
					console.debug("Cannot find subproperty of object, skipping");
					break;
				}
				if( i_matches.length < 2 ){
					console.debug("Match with length < 2, skipping. BUG?!");
					continue;
				}
				prop_val = prop_val[i_matches[1]];
			}
			str = str.replace('{'+tag+'}', prop_val.toString());
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
