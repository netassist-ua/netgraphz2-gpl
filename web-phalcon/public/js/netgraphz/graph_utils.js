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

    module.get_node_state_text = function(state){
        //TODO: i18n
        return _state_text[state];
    };

    module.get_node_state_from_icinga = function( icinga_state_id ){
        return _icinga_host_states[icinga_state_id];
    };

    return module;
})();
