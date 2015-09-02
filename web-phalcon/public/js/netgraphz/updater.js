/*
* NetGraphz updater module
* Depends from:
*   fetcher, settings
*/

var netgraphz = netgraphz || {};

netgraphz.updater = (function(store, fetcher, settings){
    var _global_timer;
    var _part_timer;
    var _updaterStarted = false;

    var _rotation_start_time = 0;
    var _rotation_end_time = 0;

    var module = {};
    var lastId = 0; //not started yet


    /*
    * Start fetching next part of graph nodes collection
    */
    var updatePartStart = function(){
        fetcher.fetchFromId(lastId, settings.partSize, function(nodes, code, error){
            if(error){
                //should be restarted, but we don't mind
                _part_timer = setTimeout(updatePartStart, 35000);
                console.error("[updater] Error during fetch of nodes block by autoupdater");
                console.error("[updater] Retry after 35 s");
                return;
            }
            var size = nodes.length;
            if(size > 0){
              lastId = Math.max(lastId, nodes[ size - 1].id);
              store.getDefaultStorage().updateNodes(nodes);
            }
            if( size < settings.partSize ){
              //update cycle finished, next step
              _rotation_end_time = new Date().getTime();
              var waitTime = 0;
              var delta = _rotation_end_time - _rotation_start_time;
              if( delta > settings.updateInterval ){
                  console.warn("Graph update took to long %d > %d", delta, settings.updateInterval);
              }
              else {
                waitTime = settings.updateInterval - delta;
              }
              lastId = 0;
              _global_timer = setTimeout(updateCallback, waitTime);
            }
            else {
                _part_timer = setTimeout(updatePartStart, settings.partInterval);
            }
        });
    };

    var updateCallback = function(){
        _rotation_start_time = new Date().getTime();
        _part_timer = setTimeout(updatePartStart, settings.partInterval);
    };

    module.start = function(){
      if(_updaterStarted){
        return;
      }
      lastId = 0;
      _updaterStarted = true;
      _global_timer = setTimeout(updateCallback, settings.updateInterval);
    };

    module.stop = function(){
      if(!_updaterStarted){
        return;
      }
      lastId = 0;
      _updaterStarted = false;
      clearTimeout(_global_timer);
    };

    return module
})(netgraphz.store, netgraphz.fetcher, netgraphz.settings.updater);
