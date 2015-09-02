var netgraphz = netgraphz || { };
netgraphz.core = (function(){
  var exports = {};
  exports.build = Object.freeze({
    version: "1.0.2-rc3"
  });
  exports.node_state = Object.freeze({
    STATE_NODE_UNKNOWN: -1,
    STATE_NODE_DOWN: 0,
    STATE_NODE_UP: 1,
    STATE_NODE_WARN: 2,
    STATE_NODE_UNREACHABLE: 3
  });

  return exports;

})();
