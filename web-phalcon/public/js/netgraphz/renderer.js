/*
Cytoscape.js netgraphz graph rendering module
Contains add/remove/render functions for graph visual perspective
*/
var netgraphz = netgraphz || { };
netgraphz.renderer = (function(store, eventBus, tools){

	var Renderer = function (name, cfg) {
		//Default configuration

		var _this = this;
		var _double_tap_timer;
		var _double_tap_target;

		var _cy_selected;
		var show_node_id; //currently visible node information (contains pure id - int)

		var publisher = eventBus.registerPublisher("renderer" + ":" + name);

		var layout_started = false;

		var cy; //cytoscape instance
		var _layout;

		var state_classes = {
			'-1': 'node_uknown',
			0: 'node_down',
			1: 'node_up',
			2: 'node_loss'
		};

		var _cy_follow_node = function(cyNode, animate){
			var pos = cyNode.position();
			if(typeof animate === "undefined"){
				animate = true;
			}
			if(animate){
				cy.animate({
					center: {
						eles: cyNode
					},
					zoom: cfg.zoomNodeLevel
				},
				{
					duration: cfg.animationTime
				});
			}
			else {
				cy.center(cyNode);
				cy.zoom({
					level: cfg.zoomNodeLevel,
					position: pos
				});
			}
		};

		var attach_events = function () {
			cy.$('node').on('tap', function(e){
				if(_double_tap_target != undefined && _double_tap_target == e.cyTarget)
				{
					_cy_follow_node(e.cyTarget);
					_double_tap_target = undefined;
					clearTimeout(_double_tap_timer);
				}
				var ele = e.cyTarget;
				_double_tap_target = e.cyTarget;
				_double_tap_timer = setTimeout(function(){
					_double_tap_target = undefined;
				}, cfg.doubleTapTime);
				return false;
			});
			cy.edges().on('select', function(e){
					console.log(e.cyTarget.id());
			});
			cy.nodes().on('select', function(e){
				console.debug(e.cyTarget.id());
				if(typeof _cy_selected !== "undefined"){
					_cy_selected.unselect(); //bug override
				}
				_cy_selected = e.cyTarget;
				publisher.emit("node_select", {
						cyEvent: e,
						date: new Date(),
						ttl: 4
				});
			});
			cy.nodes().on('unselect', function(e){
					publisher.emit("node_unselect", {
							cyEvent: e,
							date: new Date(),
							ttl: 4
					});
			});
			cy.$('node').on('mouseover', function(e){
				publisher.emit("node_mouseover", {
						cyEvent: e,
						date: new Date()
				});
			});
			cy.$('node').on('mouseout', function(e){
				publisher.emit("node_mouseout", {
						cyEvent: e,
						date: new Date()
				});
			});
		};

		this.startLayout = function() {
			if( typeof cy === undefined )
			return;
			if(layout_started)
			return;
			_layout.run();
			layout_started = true;
		};

		this.stopLayout = function() {
			if( typeof cy === undefined )
			return;
			if(!layout_started)
			return;
			_layout.stop();
		};

		this.resetZoomAndCenter = function(){
			cy.reset();
		};


		var _load_nodes = function( nodes ) {
			nodes_collection = nodes;
			nodes_by_id = {};
			nodes.forEach(function(e, i, a){
				if(e.state == STATE_NODE_DOWN || e.state == STATE_NODE_WARN){
					_tab_stop_queue.push(e.id);
				}
				nodes_by_id['n' + e.id] = e;
			});

		};

		var _update_node_status = function(n){
			var cy_node = cy.nodes("#n"+n.id);
			cy_node.removeClass("node_unknown");
			cy_node.removeClass("node_down");
			cy_node.removeClass("node_up");
			cy_node.removeClass("node_loss");
			var classes = state_classes[-1];
			if(n.hasOwnProperty('state'))
			classes = state_classes[n.state];
			cy_node.addClass(classes);
		};


		this.update_batch_nodes = function(nodes){
			cy.startBatch();
			nodes.forEach(function(e, i, a){
				_this.update_node(e)
			});
			cy.endBatch();
		};

		this.update_node = function(node){
			var prevNode = store.getDefaultStorage().getNodeById(node.id);
			var requires_update = (!prevNode) || node.state !== prevNode.state;
			if( !requires_update ){
				return;
			}
			_update_node_status(node);
		};

		this.select_node = function(id){
			var cyNode = cy.nodes("#n"+id);
			_cy_follow_node(cyNode,true);
			cyNode.select();
		};

		/*
		Initial graph rendering
		*/
		this.render_graph = function (nodes, edges) {
			var ex_links = {};
			var nodes_by_id = {};
			//I don't give a f*ck why the need it

			var g = [];

			R = cfg.initialRadius;

			nodes.forEach(function(n, i, a){
				nodes_by_id[n.id] = n;
				var classes = state_classes[-1];
				if(n.hasOwnProperty('state'))
				classes = state_classes[n.state];
				g.push({
					group: 'nodes',
					data: {
						id: 'n' + n.id,
						name: n.name
					},
					classes: classes,
					position: {
						x: R * Math.cos(2 * Math.PI / nodes.length * i),
						y: R * Math.sin(2 * Math.PI / nodes.length * i)
					}
				});
			});

			edges.forEach(function(e, i, a){
				if (ex_links[[e.src.id, e.dst.id]] || ex_links[[e.dst.id, e.src.id]])
				return true;
				if (nodes_by_id[e.src.id] && nodes_by_id[e.dst.id]) {
					ex_links[[e.src.id, e.dst.id]] = true;
					g.push({
						group: 'edges',
						data: {
							id: 'e' + e.id,
							source: 'n' + e.src.id,
							target: 'n' + e.dst.id
						}
					});
				}
			});
			var c = document.getElementById(cfg.container_id);
			cy = cytoscape({
				container: c,
				motionBlur: false,
				zoomingEnabled: true,
				userZoomingEnabled: true,
				elements: g,
				selectionType: 'single',
				style: [
					{
						selector: ':selected',
						style: {
							'border-width': 3,
							'border-color': '#333'
						}
					},
					{
						selector: 'node',
						style: {
							//'background-color': 'red',
							'content': 'data(name)',
							'width': '8px',
							'height': '8px',
							'font-size': '5px',
							'min-zoomed-font-size': '4px'
						}
					},
					{
						'selector': 'edge',
						'style': {
							'curve-style': 'rectangle',
							'width': '2px',
						}
					},
					{
						selector: 'node.node_unknown',
						style: {
							'background-color': cfg.state_palette[-1]
						}
					},
					{
						selector: 'node.node_down',
						style: {
							'background-color': cfg.state_palette[0]
						}
					},
					{
						selector: 'node.node_up',
						style: {
							'background-color': cfg.state_palette[1]
						}
					},
					{
						selector: 'node.node_loss',
						style: {
							'background-color': cfg.state_palette[2]
						}
					}]
				});
				_layout = cy.makeLayout(cfg.layout);
				_layout.run();
				_layout.on('layoutstop', function(e){
					layout_started = false;
				});
				setTimeout(function(){
					_layout.stop();
				}, cfg.layout.maxSimulatingTime);
				layout_started = true;
				attach_events();
			};

		};

		var defaults = {
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
		};

		var exports = {};
		var default_renderer = null;

		var init =  function(settings){
			var cfg = tools.extend(defaults, settings, true)
			default_renderer = new Renderer("default", cfg);
			attach_events();
		};

		var getDefaultRenderer = function(){
			return default_renderer;
		};

		var attach_events = function(){
			eventBus.subscribe("store:default", "before_update_node", function(topic, e){
					var node = e.node;
					getDefaultRenderer().update_node(node);
			});
			eventBus.subscribe("store:default", "before_update_nodes", function(topic, e){
					var nodes = e.nodes;
					getDefaultRenderer().update_batch_nodes(nodes);
			});
		};


		exports.init = init;
		exports.getDefaultRenderer = getDefaultRenderer;

		return exports;

	})(netgraphz.store, netgraphz.eventBus, netgraphz.tools);
