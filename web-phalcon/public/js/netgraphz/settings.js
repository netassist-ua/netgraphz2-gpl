/*
 * NetGraphz2 settings
 */

var netgraphz =  netgraphz || {};
netgraphz.settings = (function(){
  return {
    'init': {
      'node_part_size': 10,
      'node_part_retry_wait': 1000,
      'node_part_retry_times': 5
    },
    'communication': {
      'remote_url': 'http://127.0.0.1:3433', //URL of notifications server
    },
    'updater': { //Updater settings
      'updateInterval': 30000, //Interval to start fetching new nodes data (30 sec by default)
      'partInterval': 1200, //Interval between parts
      'partSize': 30 //Ammount of nodes to fetch by request, should be not too big and not too small
    },
    'default_state_source': null,
    'renderer': {
      'container_id': 'mynet', //container id
      'layout_time': 6500, //stop after this time
      'initialRadius': 100, //radius for initial circle
      'doubleTapTime': 400, //400 ms
      'zoomNodeLevel': 2.75, //zoom level on node selection
      'animationTime': 1000, //animation time during navigation
      'autoResizeContainer': true, //automatically resize container to fill page
      'effective_state_palette': {
        0: "#86D95D", //up
        1: "#FC766D", //down
        2: "#F0DE78", //warning
        3: "#CCD5ED", //unknown
        4: "#70C5CF", //flapping
      },
      'default_node_color': '#8C8B76',
      'layout': {
        'name': 'forceAtlas2',
        'animate': true, // whether to show the layout as it's running
        'refresh': 1, // number of ticks per frame; higher is faster but more jerky
        'ungrabifyWhileSimulating': true, // so you can't drag nodes during layout
        'fit': true, // on every layout reposition of nodes, fit the viewport
        'maxSimulatingTime': 12000,
        'padding': 30, // padding around the simulation
        'boundingBox': undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        'useWebWorker': true, //tries to use WebWorker to achive better performance
        'linLogMode': false,
        'outboundAttractionDistribution': false,
        'adjustSizes': true,
        'spreadAfterStop': true,
        'edgeWeightInfluence': 0,
        'scalingRatio': 4.0,
        'strongGravityMode': false,
        'gravity': 0.95,
        'slowDown': 0.23,
        'infinite': true
      }
    },
    'ui': { //UI settings
      'node_cxt_links': [
      {
        'content': 'test',
        'url': 'http://test.netgraphz2/{name}'
      }
      ],
      'node_panel': { //node panel
        'node_panel_id': 'node_panel', //id of node panel
        'node_panel_close_button_id': 'node_panel_close', //close button element Id
        'fadeTime': 400, //time to fade out node panel, ms
        'holdTime': 2400, //time to hold panel on screen, ms
        'waitTime': 900, //time to wait before showing up panel on node mouse hover, ms
        'links': [
        {
          'title': 'Icinga',
          'url': '/cgi-bin/icinga2-classicui/extinfo.cgi?type=1&host={icinga_name}',
          'type': 'link', //link or popup
          'newTab': true //open in new tab
        },
        {
          'title': 'ping',
          'url': '/cgi-bin/ping?address={ip}',
          'type': 'popup', //link or popup
          'popupSize': { //size of popup
            'width': 300,
            'height': 400,
          },
          'popupName': "fping {ip}"
        }
        ]
      },
      'link_panel': {
        'link_panel_id': 'link_panel', //id of node panel
        'link_panel_close_button_id': 'link_panel_close', //close button element Id
        'fadeTime': 200, //time to fade out node panel, ms
        'holdTime': 400, //time to hold panel on screen, ms
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
      }
    }
  };
})();
