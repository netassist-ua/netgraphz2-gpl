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
            _this.applyLayoutChanges();
            _this.spreadNodes();
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
      this.nodesByteArray[j + 8] = ( 0.3 + nodes[i].degree(false) ) * nodes[i].height() * nodes[i].width();
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
      j++;
    }
    nodes.updateCompoundBounds(); // because the way this layout sets positions is buggy for some reason; ref #878

    if( this.config.fit ){
      this.cy.fit( config.padding );
    }
  };

  var get_rotation_matrix = function( angle ){
    //Clockwise
    return [ 
      [Math.cos(angle), -Math.sin(angle)],
      [Math.sin(angle), Math.cos(angle)]
    ];
  };

  var odd_even = function( i ){
    return i%2 == 0 ? 1 : -1;
  };

  var sign = function ( x ){
    if( Math.abs( x ) <= 10e-6 ){
      return 0;
    }
    return Math.round(x / Math.abs(x));
  }

  var _spread_dfs = function(root, node, vector, visited){
    var x = vector[ 0 ];
    var y = vector[ 1 ];
    var edges = node.connectedEdges();
    visited[ node.id() ] = true;
    for( var i = 0; i < edges.length; i ++ ) {
      var r_edge = edges[ i ];
      var r_node = edge_get_other_node(r_edge, node);
      if(r_node.id() == root.id()){ continue;
      }
      if(visited[r_node.id()]){
        continue;
      }
      r_node.position("x", r_node.position("x") + x);
      r_node.position("y", r_node.position("y") + y);
      console.log("[spread_dfs] %s (%s,%s)", r_node.data("name"), r_node.position("x"), r_node.position("y"));
      _spread_dfs(root, r_node, vector, visited); 
    }
  };

  var debug_print_vector = function( v ){
    console.log("x = %s, y = %s", v[0], v[1]);
  };

  var abs = function(x){
    return Math.abs(x);
  };

  var vector_norm = function( a ){ 
      return Math.sqrt(a[0]*a[0] + a[1]*a[1]);
  };

  var vector_scalar_product = function( a, b ) { 
      return a[0]*b[0]+a[1]*b[1]; 
  };

  var vector_angle = function( a, b ) {
      var prod = vector_scalar_product(a,b);
      var norm_prod = vector_norm(a)*vector_norm(b);
      var cos = prod/norm_prod;
      if( cos < 0 ){ 
        cos = Math.max(-1, cos);
      }
      else {
        cos = Math.min(1, cos);
      }
      return Math.acos(cos); 
  };

  var sort_by_degree = function( node, edges ) {
    return edges.sort(function(a,b){
      var node_a = a.target().id() == node.id() ? a.source() : a.target();
      var node_b = b.target().id() == node.id() ? b.source() : b.target();
      var metric_a = node_a.degree(false);
      var metric_b = node_b.degree(false);
      if (metric_a > metric_b) {
        return -1;
      }
      if (metric_a < metric_b) {
        return 1;
      }
      return 0;
    });
  };


  var vector_product_z = function( a, b ) {
      return a[0]*b[1]-b[0]*a[1];
  }

  var angle_by_index = function(index, count){
      return  (2 * Math.PI / count) * index; 
  }; 

  var get_index_usage = function(base_index, i, used_indexes){
      var r_used = base_index + i in used_indexes;
      var l_used = i > base_index ? true : base_index - i in used_indexes;
      return [l_used, r_used];
  }

  var get_close_index_by_base = function(base_index, count, used_indexes) {
      var index = base_index;
      var i = 0; 
      var usage = get_index_usage(base_index, i, used_indexes); 
      while ( usage[0] && usage[1] ){
        i++;
        usage = get_index_usage(base_index, i, used_indexes);
      }

      return !usage[1] ? base_index + i : base_index - i;
  };

  var edge_get_other_node = function( edge, src_node ){
    return edge.target().id() == src_node.id() ? edge.source() : edge.target();
  };

  Supervisor.prototype.spreadNodes = function(){
    var nodes = this.cy.nodes();
    for( var i = 0; i<nodes.length; i++){
      var node = nodes[ i ];
      if(node.degree(false) <= 2) continue;
      //take a look on children
      console.debug("Looking for children for node %s", node.data("name"));

      var x1 = node.position("x");
      var y1 = node.position("y");
      var elements = this.cy.elements();
      var count = node.connectedEdges().length;
      var sorted_edges = sort_by_degree(node, node.connectedEdges()); 

      if( count == 0 ) continue;
      var base_node = edge_get_other_node(sorted_edges[0], node); 
      var base_vector = [base_node.position("x") - x1, base_node.position("y") - y1];
      var base_vector_norm = vector_norm(base_vector);
      base_vector = [base_vector[ 0 ]/base_vector_norm, base_vector[ 1 ]/base_vector_norm];
      
      var used_indexes = {};

      for (var j = 0; j < count; j++) {
        var r_edge = sorted_edges[j];
        var r_node = edge_get_other_node(r_edge, node);
        var longation = 1 + (0.0025*count) + (0.0025) * r_node.degree(false);
        //var longation = 1;
        if( r_node.id() == node.id()){
          continue;
        }

        var x2 = r_node.position("x");
        var y2 = r_node.position("y");

        var v = [ x2 - x1, y2 - y1 ]; 
        var d = vector_norm( v );
        var dir_angle = vector_angle(base_vector, v);

        var base_index = Math.round(count * dir_angle / (2 * Math.PI));
        var rotation_dir = sign(vector_product_z(base_vector, v));
        base_index =  rotation_dir < 0 ? (count - 1) - base_index : base_index;

        var index = get_close_index_by_base(base_index, count, used_indexes);
        console.log("spreading %s" , r_node.data("name"));
        console.log("new index = %s", index);
        used_indexes [ index ] = true;
        var angle =  angle_by_index( index, count );
        console.log("angular diff = %s degrees", (180 / Math.PI) * Math.abs(dir_angle - angle));
        
        var m = get_rotation_matrix(angle); 
        var rotated = [ m[0][0] * base_vector[0]  + m[0][1] * base_vector[1] , m[1][0] * base_vector[0] + m[1][1] * base_vector[1] ];
        rotated = [d * longation * rotated[0], d * longation * rotated[1]];

        r_node.position("x", x1 + rotated[0]);
        r_node.position("y", y1 + rotated[1]);

        if( r_node.degree(false) > 1) {
          var shift_vector = [ rotated[0] - (x2 - x1) , rotated[1] - (y2 - y1) ];
          debug_print_vector(shift_vector);
          debug_print_vector(rotated);
          debug_print_vector([x2, y2]);
          _spread_dfs(node, r_node, shift_vector, {}); 
        }

      }
    }
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
