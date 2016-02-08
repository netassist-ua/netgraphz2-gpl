/*
   Cytoscape.js netgraphz graph rendering module
Contains add/remove/render functions for graph visual perspective
*/
var netgraphz = netgraphz || { };
netgraphz.renderer = (function(store, eventBus, tools, utils){

	var Renderer = function (name, cfg) {
		//Default configuration

		var _this = this;
		var _double_tap_timer;
		var _double_tap_target;
		var _SHIFT_HOLD = false;

		var _cy_selected;
		var show_node_id; //currently visible node information (contains pure id - int)

		var publisher = eventBus.registerPublisher("renderer" + ":" + name);

		var layout_started = false;

		var cy; //cytoscape instance
		var _layout;


		var state_classes = {
			0: 'node_up',
			1: 'node_down',
			2: 'node_warn',
			3: 'node_unknown',
			4: 'node_flap'
		};

		/*
		 *	Zoom and pan to node
		 *	@param {object} cyNode - Cytoscape.js target node object
		 *	@param {boolean} [animate=true] - Animate node transition
		 */
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

		/*
		 *	Get css style of the edge according to the link load and parameters
		 *	@param {number} rx_rate - RX rate in bps
		 *	@param {number} tx_rate - TX rate in bps
		 *	@param {number} capacity - number of bits per second channel capable to transfer
		 *	@param {boolean} [duplex=true] - Check if channel is duplex or simplex (default - true)
		 *	@return {object.<string, string>} CSS style of color and edge line
		 */
		var get_edge_color_class = function(rx_rate, tx_rate, capacity, duplex){
			if( typeof duplex === "undefined" ){
				duplex = true;
			}
			if (capacity == 0 || (tx_rate == -1 && rx_rate == -1)){
				return {
					'line-color': '#C0C0C0',
					'source-arrow-color': '#C0C0C0',
			 		'target-arrow-color': '#C0C0C0'
				};
			}

			var rx_load = rx_rate/capacity;
			var tx_load = tx_rate/capacity;

			rx_load = Math.min(1,rx_load); 
			tx_load = Math.min(1,tx_load);

			var load = !duplex ? (rx_rate + tx_rate)/capacity : Math.max(rx_load, tx_load)
			
			var line_h = Math.round(100 * (1-load));
			
			var t_r = Math.round(100 * (1-tx_load));

			var r_r = Math.round(100 * (1-rx_load));

			var line = tools.hsvToRgb(line_h, 100, 85);
			var t = tools.hsvToRgb(t_r, 100, 85);
			var r = tools.hsvToRgb(r_r, 100, 85);

			return {
				'line-color': 'rgb('+line[0]+','+line[1]+','+line[2]+')',
				'source-arrow-color': 'rgb('+r[0]+','+r[1]+','+r[2]+')',
			 	'target-arrow-color': 'rgb('+t[0]+','+t[1]+','+t[2]+')',
		        };
		}

		/*
		 * Attach events to the renderer
		 */
		var attach_events = function () {
			document.addEventListener('visibilitychange', function(){
				cy.boxSelectionEnabled(false); //drop selection
				cy.clearQueue(); //workaround on slowdown of page after page inactivity...
				_SHIFT_HOLD = false;
			});
			
			eventBus.subscribe("ui", "window_keydown", function(topic, e){
				switch(e.domEvent.keyCode){
					case 17:
					cy.boxSelectionEnabled(true);	
					break;
					case 16:
					_SHIFT_HOLD = true;
					break;
					default:
					return;
				}
			});
			eventBus.subscribe("ui", "window_keyup", function(topic, e){
				switch(e.domEvent.keyCode){
					case 17:
					cy.boxSelectionEnabled(false);	
					break;
					case 16:
					_SHIFT_HOLD = false;
					break;
					default:
					return;
				}
			});
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
			cy.edges().on('mouseover', function(e){
				_publish_renderer_event('edge_mouseover', e);
			});
			cy.edges().on('mouseout', function(e){
				_publish_renderer_event('edge_mouseout', e);
			});
			cy.edges().on('tap', function(e){
				_publish_renderer_event('edge_tap', e);
			});
			cy.edges().on('select', function(e) {
				_publish_renderer_event('edge_select', e);
			});
			cy.edges().on('unselect', function(e){
				_publish_renderer_event('edge_unselect', e);
			});
			cy.nodes().on('unselect', function(e){
				if(_SHIFT_HOLD && cy.boxSelectionEnabled()){
					e.cyTarget.select();	
				}
				_publish_renderer_event('node_unselect', e);
			});

			cy.nodes().on('select', function(e){
				if(typeof _cy_selected !== "undefined"){
					//_cy_selected.unselect(); //bug override
				}
				_cy_selected = e.cyTarget;
				_publish_renderer_event('node_select', e);
			});
			cy.$('node').on('mouseover', function(e){
				e.cyTarget.addClass("mouseover");
				_publish_renderer_event('node_mouseover', e);
			});
			cy.$('node').on('mouseout', function(e){
				e.cyTarget.removeClass("mouseover");
				_publish_renderer_event('node_mouseout', e);
			});
		};

		/*
		 * Publish renderer event with default parameters to subscribers 
		 * @param {string} name - Event name
		 * @param {object} event_obj - Event content to publish
		 */
		var _publish_renderer_event = function( name, event_obj ){
			publisher.emit(name, {
				cyEvent: event_obj,
				date: new Date(),
				ttl: 4
			});
		};

		/*
		 * Update node status (color, css class)
		 * @param {Node} n - Node
		 */
		var _update_node_status = function(n){
			var cy_node = cy.nodes("#n"+n.id);
			cy_node.removeClass("node_unknown");
			cy_node.removeClass("node_down");
			cy_node.removeClass("node_up");
			cy_node.removeClass("node_loss");
			cy_node.removeClass("node_flap");
			var ef_state = utils.get_node_pref_effective_state(n);
			if(ef_state != null){
				classes = state_classes[ef_state];
				if( typeof classes === "string" )
					cy_node.addClass(classes);
			}
			cy.forceRender();
		};

		/*
		 * Update links status css style
		 * @param {Node} node - Node to update links from
		 */
		var _update_node_links_status = function( node ){
			var cy_node = cy.nodes("#n"+node.id);
			var edges = cy_node.connectedEdges();
			for( var i=0; i<edges.length; i++){
				var link_id = edges[ i ].data('real_id');
				var link = store.getDefaultStorage().getLinkById(link_id);
				if( typeof link === "undefined"){
					console.error("Link not found in storge. BUG?!");
					continue;
				}
				if( (link.rx_octets == "" && link.tx_octets == "") || !link.link_speed){
					continue;
				}
				edges[ i ].css(_prepare_edge_style(link));
				cy.forceRender();
			}
		};


		/*
		 * Returns edge CSS style for the NetGraphz2 link object
		 * @param {Link} e - Link object
		 * @return {object.<string, string>} CSS style object
		 */
		var _prepare_edge_style = function( e ){
				var rx_load = -1;
				var tx_load = -1;
				var capacity = e.link_speed || 0;
				var duplex = true;
				if( typeof e.duplex === "boolean" ){
					duplex = e.duplex;
				}


				if(e.rx_octets != "" ){
					var values = store.getDefaultStorage().getMetricValues(e.rx_octets);
					if(Array.isArray(values) && values.length > 0){
						rx_load = values[0].value * 8/ (1000*1000);
					}
				}
				if( e.tx_octets != ""){
					var values = store.getDefaultStorage().getMetricValues(e.tx_octets);
					if(Array.isArray(values) && values.length > 0){
						tx_load = values[0].value * 8 / (1000*1000);
					}
				}
			return get_edge_color_class(rx_load, tx_load, capacity, duplex)		
		};

		/*
		 * Starts graph layout
		 */
		this.startLayout = function() {
			if( typeof cy === undefined )
			return;
			if(layout_started)
			return;
			_layout.run();
			layout_started = true;
		};

		/*
		 * Stops graph layout
		 */
		this.stopLayout = function() {
			if( typeof cy === undefined )
			return;
			if(!layout_started)
			return;
			_layout.stop();
		};

		/*
		 * Reset zoom and restore position to the center
		 */
		this.resetZoomAndCenter = function(){
			cy.reset();
		};

		/*
		 * Performs renderer dump of current nodes positions
		 * @return {object}
		 */
		this.dumpNodesPositions = function(){
				var nodes = cy.nodes();
				var length = nodes.length;
				var positions = [];
				for( var i = 0; i < length; i++){
						var node = nodes[ i ];
						var n_id = node.id();
						var pos = {
							id: parseInt(n_id.substring(1, n_id.length)),
							x: node.position().x,
							y: node.position().y
						}
						positions.push(pos);
				}
				return positions;
		};

		/*
		 * Perform update renderer view of node list
		 * @param {Node[]} - List of nodes to update view
		 */
		this.update_batch_nodes = function(nodes){
			cy.startBatch();
			nodes.forEach(function(e, i, a){
				_this.update_node(e)
			});
			cy.endBatch();
		};

		/*
		 * Perform update renderer view of nodes
		 */
		this.update_node = function(node){
			_update_node_links_status(node);
			var prevNode = store.getDefaultStorage().getNodeById(node.id);
			var requires_update = (!prevNode) || utils.get_node_pref_effective_state(node) !== utils.get_node_pref_effective_state(prevNode);
			if( !requires_update ){
				return;
			}
			_update_node_status(node);
		};


		/*
		 * 	Selects node by identifier
		 * 	
		 * 	@param {number} id Node identifier 
		 * 	@param {boolean} keep_selection Keep old selections (false by default)
		 */
		this.select_node = function(id, keep_selection){
			if( typeof keep_selection === "undefined" )
				keep_selection = false;	
			var cyNode = cy.nodes("#n"+id);
			_cy_follow_node(cyNode, true);
			if(!keep_selection){
				//drop selection
				cy.nodes(":selected").unselect();
			}
			cyNode.select();
		};

		/*
		* 	Initial graph rendering
		* 	
		* 	@param {Node[]} nodes Nodes
		* 	@param {Link[]} edges Edges
		*
		*/
		this.render_graph = function (nodes, edges) {
			var ex_links = {};
			var nodes_by_id = {};
			//I don't give a f*ck why the need it

			var g = [];

			R = cfg.initialRadius;

			nodes.forEach(function(n, i, a){
				nodes_by_id[n.id] = n;
				var classes = "";
				var ef_state = utils.get_node_pref_effective_state(n);
				if( ef_state != null ){
					classes = state_classes[ef_state];
				}
				g.push({
					group: 'nodes',
					data: {
						id: 'n' + n.id,
						name: n.name
					},
					classes: classes,
					position: {
						x: typeof n.x == undefined || n.x == null ?  R * Math.cos(2 * Math.PI / nodes.length * i ) : parseFloat(n.x),
						y: typeof n.y == undefined || n.y == null ?  R * Math.sin(2 * Math.PI / nodes.length * i ) : parseFloat(n.y)
					}
				});
			});

			edges.forEach(function(e, i, a){
				if (ex_links[[e.src.id, e.dst.id]] || ex_links[[e.dst.id, e.src.id]])
				return true;
				if (nodes_by_id[e.src.id] && nodes_by_id[e.dst.id]) {
					var label = typeof e.link_speed === "number" ?  tools.dataRateBpsFormat(e.link_speed * (1000 * 1000)) : "";
					ex_links[[e.src.id, e.dst.id]] = true;
					g.push({
						group: 'edges',
						data: {
							id: 'e' + e.id,
							speed: label,
							source: 'n' + e.src.id,
							target: 'n' + e.dst.id,
							style: _prepare_edge_style(e),
							real_id: e.id
						}
					});
				}
			});

			//make it more colorful
			setTimeout( function(){
				var edges = cy.edges();
				for ( var i = 0; i < edges.length; i++ ){
					edges[i].css(edges[i].data('style'));
				}
			}, 1000);


			var c = document.getElementById(cfg.container_id);
			cy = cytoscape({
				container: c,
				motionBlur: false,
				zoomingEnabled: true,
				userZoomingEnabled: true,
				elements: g,
				selectionType: 'single',
				layout: {
					name: 'preset'
				},
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
							'content': 'data(name)',
							'background-color': cfg.default_node_color, 
							'width': '10px',
							'height': '10px',
							'font-size': '5px',
						}
					},
					{
						'selector': 'edge',
						'style': {
							'curve-style': 'segments',
							'width': '4px',
							'background-color': '#ccc',
							'font-size': '4px',
							'content': 'data(speed)'
						}
					},
					{
						selector: 'node.mouseover',
						style: {
							'text-background-opacity': 1,
						        'text-background-color': '#ccc',
						        'text-background-shape': 'roundrectangle',
						        'text-border-color': '#000',
						        'text-border-width': 1,
						 	'text-border-opacity': 1,
							'z-index': 40
						}
					},
					{
						selector: 'node.node_unknown',
						style: {
							'background-color': cfg.effective_state_palette[3]
						}
					},
					{
						selector: 'node.node_down',
						style: {
							'background-color': cfg.effective_state_palette[1]
						}
					},
					{
						selector: 'node.node_up',
						style: {
							'background-color': cfg.effective_state_palette[0]
						}
					},
					{
						selector: 'node.node_warn',
						style: {
							'background-color': cfg.effective_state_palette[2]
						}
					},
					{
						selector: 'node.node_flap',
						style: {
							'background-color': cfg.effective_state_palette[4]
						}
					}]
				});
				cy.forceRender();
				//var arbor_layout = { name: 'arbor', maxSimulationTime: 12000, friction: 0.43, gravity: true, repulsion: 4600, stiffness: 450, infinite: true };
			//	_layout = cy.makeLayout(arbor_layout);
				_layout = cy.makeLayout(cfg.layout);
				_layout.on('layoutstop', function(e){
					layout_started = false;
				});
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
			'effective_state_palette': {
        			0: "#86D95D", //up
				1: "#FC766D", //down
				2: "#F0DE78", //warning
				3: "#CCD5ED", //unknown
				4: "#70C5CF", //flapping
			      },
		       'default_node_color': '#8C8B76',
		       'default_state_source': null,
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

})(netgraphz.store, netgraphz.eventBus, netgraphz.tools, netgraphz.utils);
