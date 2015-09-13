var netgraphz = netgraphz || {};

netgraphz.tools = (function(){
  var module = {};

  module.extend = function (a, b, deep_extend) {
    var c = {}
    if(typeof deep_extend === "undefined"){
      deep_extend = false;
    }
    for (var key in a) {
      if (b.hasOwnProperty(key)){
        if(deep_extend && typeof b[key] === "object" && !Array.isArray(b[key])) {
          c[key] = module.extend(a[key], b[key], true);
        }
        else {
          c[key] = b[key];
        }
      }
      else {
        c[key] = a[key];
      }
    }
    return c;
  };

  return module;
})();
