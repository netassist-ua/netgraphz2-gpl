/**
 * Sigma's ForceAtlas2 layout adapter for Cytoscape.js
 */


;(function($$){ 'use strict';

    // default layout options
    var defaults = {
        refresh: 1, // number of ticks per frame; higher is faster but more jerky
        maxSimulationTime: 5000, // max length in ms to run the layout
        // layout event callbacks
        ready: function(){}, // on layoutready
        stop: function(){}, // on layoutstop

      //TODO: Delete support of computation in UI thread, IE and other old crap must die
	useWebWorker: true, //tries to use WebWorker to achive better performance

	linLogMode: false,
        outboundAttractionDistribution: false,
        adjustSizes: false,
        edgeWeightInfluence: 0,
        scalingRatio: 1,
        strongGravityMode: false,
        gravity: 1,
        slowDown: 1,
        spreadAfterStop: true,
        barnesHutOptimize: false,
        barnesHutTheta: 0.5,
        infinite: false
    };

    // constructor
    // options : object containing layout options
    function ForceAtlas2Layout( options ){
      var opts = this.options = {};
      for( var i in defaults ){ opts[i] = defaults[i]; }
      for( var i in options ){ opts[i] = options[i]; }
    }

    // called on continuous layouts to stop them before they finish
    ForceAtlas2Layout.prototype.stop = function(){
        if(this.supervisor){
          this.manuallyStopped = true;
          this.stopForceAtlas2();
        }
        return this; // chaining
    };

    /**
     * Interface
     * ----------
     */
    ForceAtlas2Layout.prototype.run = function() {
      var layout = this
      var options = this.options;
      var cy = options.cy;
      var config = {
        useWebWorker: options.useWebWorker, //tries to use WebWorker to achive better performance
        linLogMode: options.linLogMode,
        outboundAttractionDistribution: options.outboundAttractionDistribution,
        adjustSizes: options.adjustSizes,
        edgeWeightInfluence: options.edgeWeightInfluence,
        scalingRatio: options.scalingRatio,
        strongGravityMode: options.strongGravityMode,
        gravity: options.gravity,
        slowDown: options.slowDown,
        spreadAfterStop: options.spreadAfterStop,
        barnesHutTheta: options.barnesHutTheta,
        barnesHutOptimize: options.barnesHutOptimize
      };

      // Create supervisor if undefined
      if (!this.supervisor)
        this.supervisor = new window.forceAtlas2.Supervisor(this.options.cy, config);

      // Configuration provided?
      if (config)
        this.supervisor.configure(config);


      if( !options.infinite ){
            setTimeout(function(){
                if( !layout.manuallyStopped ){
                    supervisor.stop();
                }
      }, options.maxSimulationTime);
    }

      // Start algorithm
      this.supervisor.start();


      return this;
    };

    ForceAtlas2Layout.prototype.stopForceAtlas2 = function() {
      if (!this.supervisor)
        return this;

      // Pause algorithm
      this.supervisor.stop();

      this.trigger({
        type: 'layoutstop',
        layout: this
      });

      return this;
    };

    ForceAtlas2Layout.prototype.killForceAtlas2 = function() {
      if (!this.supervisor)
        return this;

      // Stop Algorithm
      this.supervisor.stop();

      // Kill Worker
      this.supervisor.killWorker();

      // Kill supervisor
      this.supervisor = null;

      return this;
    };

    ForceAtlas2Layout.prototype.isForceAtlas2Running = function() {
      return this.supervisor && this.supervisor.running;
    };

    // register the layout
    $$('layout', 'forceAtlas2', ForceAtlas2Layout);

})(cytoscape);
