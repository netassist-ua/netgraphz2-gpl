(function(undefined){
    var _root = this;
    var defaults = {
      'updateInterval': 30000, //Interval to start fetching new nodes data (30 sec by default)
      'partInterval': 1200, //Interval between parts
      'partSize': 30 //Ammount of nodes to fetch by request, should be not too big and not too small
    };
    var settings;
    var inWebWorker = !('document' in _root);

    var _global_timer;
    var _part_timer;
    var _updaterStarted = false;

    var _rotation_start_time = 0;
    var _rotation_end_time = 0;

    var module = {};
    var lastId = 0; //not started yet


    var updater = function(){
        
    };


    if(inWebWorker){
        //load NetGraphz2 modules...
    }
    else {


    }




})
