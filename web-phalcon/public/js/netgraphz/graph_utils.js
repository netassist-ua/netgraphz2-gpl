netgraphz.utils = (function(){

    var _state_text =  {
          '-1': "Unknown",
          0: "Down!",
          1: "Up",
          2: "Warning",
          3: "Unreachable"
    };
    var _icinga_host_states = {
        0: 1, // up
        1: 0, // down
        2: 3 // Unreachable
    };

    var module = {};

    module.format_node_str = function( str, node ){
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

    module.get_node_state_from_icinga = function( icinga_state_id ){
        return _icinga_host_states[icinga_state_id];
    };

    return module;
})();
