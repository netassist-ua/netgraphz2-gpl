var netgraphz = netgraphz || {};
netgraphz.ui = netgraphz.ui || {};
netgraphz.ui.status_legend = (function(ui, tools, $){

  var exports = {};

  var defaults = {
    "-1": "#000000", //no data
    0: "#86D95D", //up
    1: "#FC766D", //down
    2: "#F0DE78", //warning
    3: "#CCD5ED", //unknown
    4: "#70C5CF", //flapping
  };

  var getBgColor = function(color){
    return {
      "background-color": color
    }
  };

  var parse_rgb_color = function(color_string){
    var rgb = color_string.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return [parseInt(rgb[1], 10), parseInt(rgb[2], 10), parseInt(rgb[3], 10)];
  };

  var setCssColor = function(jqElement){
    var rgb = parse_rgb_color(jqElement.css("background-color"));
    rgb[0] = 255 - rgb[0];
    rgb[1] = 255 - rgb[1];
    rgb[2] = 255 - rgb[2];
    if((rgb[0] + rgb[1] + rgb[1])/3 >= 110){
      jqElement.css({
        color: "white"
      });
    }
    else {
      jqElement.css({
        color: "rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")"
      });
    }
  };


  exports.init = function(config) {
    var settings = tools.extend(defaults, config);
    $(".status_up").css(getBgColor(config[0]));
    $(".status_down").css(getBgColor(config[1]));
    $(".status_warn").css(getBgColor(config[2]));
    $(".status_unknown").css(getBgColor(config[3]));
    $(".status_flap").css(getBgColor(config[4]));
    $(".status_nodata").css(getBgColor(config[-1]));
    setCssColor($(".status_up"));
    setCssColor($(".status_down"));
    setCssColor($(".status_warn"));
    setCssColor($(".status_unknown"));
    setCssColor($(".status_flap")); 
    setCssColor($(".status_nodata")); 
  };

  return exports;
})(
  netgraphz.ui,
  netgraphz.tools,
  $);
