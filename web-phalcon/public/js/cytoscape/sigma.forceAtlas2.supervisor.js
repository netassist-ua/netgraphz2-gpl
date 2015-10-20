window.forceAtlas2 = window.forceAtlas2 || {}

;(function($) {
  'use strict';


  /**
  * Sigma ForceAtlas2.5 Supervisor
  * =============================
  *
  * Author: Guillaume Plique (Yomguithereal)
  * Version: 0.1
  */
  var _root = window;

  /**
  * Feature detection
  * ------------------
  */
  var webWorkers = 'Worker' in _root;

  /**
  * Supervisor Object
  * ------------------
  */
  function Supervisor(cy, options, bb) {
    var _this = this,
    workerFn = window.forceAtlas2.getForceAtlas2Worker();

    var SPREAD_IDLE = 0;
    var SPREAD_START = 1;
    var SPREAD_SENT = 2;
    var SPREAD_FINISH = 3;

    options = options || {};

    // _root URL Polyfill
    _root.URL = _root.URL || _root.webkitURL;

    this.cy = cy;
    this.ppn = 10;
    this.ppe = 3;
    this.bb = bb;
    this.config = {};
    this.shouldUseWorker =
    options.worker === false ? false : true && webWorkers;
    this.workerUrl = options.workerUrl;

    // State
    this.started = false;
    this.running = false;
    this.spread_state = SPREAD_IDLE;

    // Web worker or classic DOM events?
    if (this.shouldUseWorker) {
      if (!this.workerUrl) {
        var blob = this.makeBlob(workerFn);
        this.worker = new Worker(URL.createObjectURL(blob));
      }
      else {
        this.worker = new Worker(this.workerUrl);
      }

      // Post Message Polyfill
      this.worker.postMessage =
      this.worker.webkitPostMessage || this.worker.postMessage;
    }
    else {

      // TODO: do we crush?
      eval(workerFn);
    }

    // Worker message receiver
    var msgName = (this.worker) ? 'message' : 'newCoords';
    (this.worker || document).addEventListener(msgName, function(e) {

      // Retrieving data
      _this.nodesByteArray = new Float32Array(e.data.nodes);

      // If ForceAtlas2 is running, we act accordingly
      if (_this.running) {

        // Applying layout
        _this.applyLayoutChanges();

        // Send data back to worker and loop
        _this.sendByteArrayToWorker();

        // Rendering graph
        //_this.sigInst.refresh();
      }
      else {
        switch(_this.spread_state){
          case SPREAD_IDLE:
          break;
          case SPREAD_START:
          _this.sendByteArrayToWorker('spread');
          _this.spread_state = SPREAD_SENT;
          break;
          case SPREAD_SENT:
          console.log("new received");
          _this.applyLayoutChanges();
          _this.spread_state = SPREAD_FINISH;
          break;
        }
      }
    });

    // Filling byteArrays
    this.graphToByteArrays();

  }

  Supervisor.prototype.makeBlob = function(workerFn) {
    var blob;

    try {
      blob = new Blob([workerFn], {type: 'application/javascript'});
    }
    catch (e) {
      _root.BlobBuilder = _root.BlobBuilder ||
      _root.WebKitBlobBuilder ||
      _root.MozBlobBuilder;

      blob = new BlobBuilder();
      blob.append(workerFn);
      blob = blob.getBlob();
    }

    return blob;
  };
  Supervisor.prototype.makeAdjecencyList = function () {
    this.adjList = { };
    var nodes = this.cy.nodes();
    for( var i = 0; i < nodes.length; i ++ ) {
        var node = nodes [ i ];
        this.adjList[ node.id() ] = [ ];
        var edges = node.connectedEdges();
        for( var j = 0; j < edges.length; j ++ ){
            
        }
    }
  };


  Supervisor.prototype.graphToByteArrays = function() {
    var nodes = this.cy.nodes(),
    edges = this.cy.edges(),
    nbytes = nodes.length * this.ppn,
    ebytes = edges.length * this.ppe,
    nIndex = {},
    i,
    j,
    l;

    // Allocating Byte arrays with correct nb of bytes
    this.nodesByteArray = new Float32Array(nbytes);
    this.edgesByteArray = new Float32Array(ebytes);

    // Iterate through nodes
    for (i = j = 0, l = nodes.length; i < l; i++) {

      // Populating index
      nIndex[nodes[i].id()] = j;

      // Populating byte array
      this.nodesByteArray[j] = nodes[i].position().x;
      this.nodesByteArray[j + 1] = nodes[i].position().y;
      this.nodesByteArray[j + 2] = 0;
      this.nodesByteArray[j + 3] = 0;
      this.nodesByteArray[j + 4] = 0;
      this.nodesByteArray[j + 5] = 0;
      this.nodesByteArray[j + 6] = 1 + nodes[i].degree(false);
      this.nodesByteArray[j + 7] = 1;
      this.nodesByteArray[j + 8] = parseInt(nodes[i].size("height")) * parseInt(nodes[i].size("width"));
      this.nodesByteArray[j + 9] = 0;
      j += this.ppn;
    }

    // Iterate through edges
    for (i = j = 0, l = edges.length; i < l; i++) {
      this.edgesByteArray[j] = nIndex[edges[i].source().id()];
      this.edgesByteArray[j + 1] = nIndex[edges[i].target().id()];
      this.edgesByteArray[j + 2] = parseInt(edges[i].style().width) || 0;
      j += this.ppe;
    }
  };

  // TODO: make a better send function
  Supervisor.prototype.applyLayoutChanges = function() {
    var nodes = this.cy.nodes(),
    j = 0,
    realIndex;

    var x = { min: Infinity, max: -Infinity };
    var y = { min: Infinity, max: -Infinity };

    for( var i = 0, l=this.nodesByteArray.length; i < l; i+= this.ppn ){

      x.min = Math.min( x.min, this.nodesByteArray[i] || 0 );
      x.max = Math.max( x.max, this.nodesByteArray[i] || 0 );

      y.min = Math.min( y.min, this.nodesByteArray[i + 1] || 0 );
      y.max = Math.max( y.max, this.nodesByteArray[i + 1] || 0 );
    }

    // Moving nodes
    for (var i = 0, l = this.nodesByteArray.length; i < l; i += this.ppn) {
      nodes[j].position("x",  this.nodesByteArray[i]);
      nodes[j].position("y", this.nodesByteArray[i+1]);
      /*nodes[j].position("x", this.bb.x1 + this.nodesByteArray[i] - x.min);
      this.nodesByteArray[i] = this.bb.x1 + this.nodesByteArray[i] - x.min;
      nodes[j].position("y", this.bb.y1 + this.nodesByteArray[i + 1] - y.min);
      this.nodesByteArray[i+1] = this.bb.y1 + this.nodesByteArray[i + 1] - y.min;
      */
      j++;
    }
    nodes.updateCompoundBounds(); // because the way this layout sets positions is buggy for some reason; ref #878

    if( this.config.fit ){
      this.cy.fit( config.padding );
    }
  };

  Supervisor.prototype.sendAdjecencyList = function(action){
    var content = {
      action: action || 'loop',
      adj: true,
      adjList: this.adjList
    };
  };

  Supervisor.prototype.sendByteArrayToWorker = function(action) {
    var content = {
      action: action || 'loop',
      nodes: this.nodesByteArray.buffer
    };

    var buffers = [this.nodesByteArray.buffer];

    if (action === 'start') {
      content.config = this.config || {};
      content.edges = this.edgesByteArray.buffer;
      buffers.push(this.edgesByteArray.buffer);
    }

    if (this.shouldUseWorker)
    this.worker.postMessage(content, buffers);
    else
    _root.postMessage(content, '*');
  };

  Supervisor.prototype.start = function() {
    if (this.running)
    return;

    this.running = true;
    this.spread_state = 0;
    this.graphToByteArrays();
    if (!this.started) {
      // Sending init message to worker
      this.sendByteArrayToWorker('start');
      this.started = true;
    }
    else {
      this.sendByteArrayToWorker();
    }
  };

  Supervisor.prototype.stop = function() {
    if (!this.running)
    return;
    this.running = false;
    if(this.config.spreadAfterStop){
      this.spread_state = 1;
    }
  };

  // TODO: kill polyfill when worker is not true worker
  Supervisor.prototype.killWorker = function() {
    this.worker && this.worker.terminate();
  };

  Supervisor.prototype.configure = function(config) {

    // Setting configuration
    this.config = config;

    if (!this.started)
    return;

    var data = {action: 'config', config: this.config};

    if (this.shouldUseWorker)
    this.worker.postMessage(data);
    else
    _root.postMessage(data, '*');
  };

  this.Supervisor = Supervisor;

}).call(window.forceAtlas2);
