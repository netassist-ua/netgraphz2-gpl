/*
* NetGraphz2 settings
*/

var netgraphz =  netgraphz || {};
netgraphz.settings = (function(){
  return {
    'communication': {
      'remote_url': 'http://netgraphz.naic.29632.as:3433', //URL of notifications server
    },
    'updater': { //Updater settings
      'updateInterval': 30000, //Interval to start fetching new nodes data (30 sec by default)
      'partInterval': 1200, //Interval between parts
      'partSize': 30 //Ammount of nodes to fetch by request, should be not too big and not too small
    },
    'renderer': {
      'container_id': 'mynet', //container id
      'layout_time': 5500, //stop after this time
      'initialRadius': 200, //radius for initial circle
      'doubleTapTime': 400, //400 ms
      'zoomNodeLevel': 1.75, //zoom level on node selection
      'animationTime': 1000, //animation time during navigation
      'autoResizeContainer': true, //automatically resize container to fill page
      'state_palette': {
        '-1': "#8C8B76", //unknown
        0: "#FC766D", //down
        1: "#86D95D", //up,
        2: "#F0DE78" //loss
      },
      'layout': {
        'name': 'forceAtlas2',
        'animate': true, // whether to show the layout as it's running
        'refresh': 1, // number of ticks per frame; higher is faster but more jerky
        'ungrabifyWhileSimulating': true, // so you can't drag nodes during layout
        'fit': true, // on every layout reposition of nodes, fit the viewport
        'maxSimulatingTime': 6000,
        'padding': 30, // padding around the simulation
        'boundingBox': undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        'useWebWorker': true, //tries to use WebWorker to achive better performance
        'linLogMode': false,
        'outboundAttractionDistribution': false,
        'adjustSizes': true,
        'spreadAfterStop': true,
        'edgeWeightInfluence': 0,
        'scalingRatio': 4.5,
        'strongGravityMode': false,
        'gravity': 1,
        'slowDown': 0.1,
        'infinite': true
      }
    },
    'ui': { //UI settings
      'node_panel': { //node panel
        'node_panel_id': 'node_panel', //id of node panel
        'node_panel_close_button_id': 'node_panel_close', //close button element Id
        'fadeTime': 400, //time to fade out node panel, ms
        'holdTime': 2400 //time to hold panel on screen, ms
      },
      'tabStop': {
        'enabled': true
      },
      'notifications': {
        'tryUseDesktop': true,
        'showTime': 900,
        'sounds': {
          'info': '/sounds/KDE-Sys-App-Message.ogg',
          'warning': '/sounds/KDE-Sys-Warning.ogg',
          'error': '/sounds/KDE-Sys-App-Error.ogg',
          'ok': '/sounds/KDE-Sys-App-Positive.ogg'
        },
        'toastr': {
          'closeButton': true,
          'debug': false,
          'newestOnTop': false,
          'progressBar': false,
          'positionClass': 'toast-bottom-left',
          'preventDuplicates': false,
          'onclick': null,
          'hideDuration': 1000,
          'timeOut': 5000,
          'extendedTimeOut': 1000,
          'showEasing': 'swing',
          'hideEasing': 'linear',
          'showMethod': 'fadeIn',
          'hideMethod': 'fadeOut'
        }
      },
      'search': {
        'enabled': true,
        'searchInputId': "node-name-search"
      },
      'loading_bar_id': 'waiter',
      'layoutStartButtonId': 'graph_layoutstart',
      'layoutStopButtonId': 'graph_layoutstop',
      'viewPortResetButtonId': 'graph_resetzoom',
      'followProblemNodesCheckboxId': 'graph_follownodes'
    }
  };
})();
