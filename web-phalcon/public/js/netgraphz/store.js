/*
 *	NetGraphz2 node and links storage
 */
var netgraphz = netgraphz || {};
netgraphz.store = (function(core, eventBus, utils){

	var exports = { };

	var Store = function(name) {
		_nodesById = { };
		_linksById = { };
		_links = [];
		_metrics_links = {};
		_metrics = {};
		_publisher = eventBus.registerPublisher("store:"+name);

		/*
		 * Peforms initial loading of nodes and links to the storage
		 * @param {Node[]} nodes - List of nodes to load
		 * @param {Link[]} links - List of links to load
		 */
		this.loadAll = function( nodes, links ){
			nodes.forEach(function(e, i, a) {
				if(typeof e.id !== "undefined"){
					_nodesById[ e.id ] = e;
					saveMetricsOfNode(e);
				}
			});
			links.forEach(function(e, i, a) {
				if(typeof e.id !== "undefined"){
					_linksById[ e.id ] = e;
				}
			});
			_links = links;
			_publisher.emit("load", { nodes: nodes, links: links });
		};


		/*
		 * Save node metrics to the storage
		 * @param {Node} Node to save metrics
		 */
		var saveMetricsOfNode = function( node ){
			if(Array.isArray(node.metrics)){
				for ( var i=0; i<node.metrics.length; i++ ){
					name = node.metrics[i].name;
					values = node.metrics[i].values;
					_metrics[name] = values;
				}
			} 

		}	
		
		this.getLinkIdByMetricString = function(metric_name){
			return _metrics_links[metric_name];
		}

		this.getMetricValues = function(metric_name){
			if( !_metrics.hasOwnProperty(metric_name) ){
				return [];
			}
			return _metrics[metric_name];
		}

		/*
		 * Get nodes in warning state
		 * @return {Node[]} Nodes
		 */
		this.getWarningNodes = function(){
			var nodes = [ ];
			Object.keys(_nodesById).forEach(function(k, i, a){
				var e = _nodesById[ k ];
				var ef_state = utils.get_node_pref_effective_state(e);
				if(ef_state == core.node_state.STATE_NODE_WARN)
					nodes.push(e);
			});
			return nodes;
		};

		/*
		 * Get nodes in down state 
		 * @return {Node[]} - Nodes
		 */
		this.getDownNodes = function(){
			var nodes = [ ];
			Object.keys(_nodesById).forEach(function(k, i, a){
				var e = _nodesById[ k ];
				var ef_state = utils.get_node_pref_effective_state(e);
				if(ef_state == core.node_state.STATE_NODE_DOWN)
					nodes.push(e);
			});
			return nodes;
		};


		/*
		 * Get link by id
		 * @param {number} linkId - Link identifier
		 * @return {Link} Link object
		 */
		this.getLinkById = function( linkId ){
			return _linksById[ linkId ];
		};

		/*
		 * Get node by id
		 * @param {number} nodeId - Node identifier
		 * @return {Node} Node object
		 */
		this.getNodeById = function( nodeId ){
			return _nodesById[ nodeId ];
		};

		/*
		 * Search nodes by name
		 * @param {string} name - Name pattern to search
		 * @return {Node[]} Resulting nodes
		 */
		this.searchNodesByName = function( name ){
			//@var Node[]
			var results = [];
			Object.keys(_nodesById).forEach(function(k, i, a){
				var node = _nodesById[ k ];
				if( typeof node.name !== "string" ){
					return true;
				}
				if( node.name.search( name ) != -1){
					results.push( node );
				}
				return true;
			});
			return results;
		};

		/*
		 * Updates storage node 
		 * @param {Node} node - Node object
		 */
		this.updateNode = function( node ) {
			if( typeof node.id === "undefined"){
				console.error("updateNode called with undefined id");
				return;
			}
			var exists = node.id in _nodesById;

			if(exists){
				_publisher.emitSync("before_update_node", {
					node: node,
					date: new Date()
				});
			}
			else {
				_publisher.emitSync("before_add_node", {
					node: node,
					date: new Date()
				});
			}
			_nodesById[ node.id ] = node;
			saveMetricsOfNode(node);

			if(exists){
				_publisher.emit("update_node", {
					node: node,
					date: new Date()
				});
			}
			else{
				_publisher.emit("add_node", {
					node: node,
					date: new Date()
				});
			}
		};

		/*
		 * Updates several nodes in the storage
		 * @param {Node[]} - List of nodes to update
		 */
		this.updateNodes = function( nodes ){
			_publisher.emitSync("before_update_nodes", {
				nodes: nodes,
				date: new Date()
			});
			nodes.forEach(function(e, i, a){
				if(typeof e.id === "undefined"){
					console.error("updateNodes called for node with undefined id");
					return true;
				}
				_nodesById[ e.id ] = e;
				saveMetricsOfNode(e);
				return true;
			});
			_publisher.emit("update_nodes", {
				nodes: nodes,
				date: new Date()
			});
		};
	};

	var default_storage = null;

	exports.init = function(){
		default_storage = new Store("default");
	};

	exports.getDefaultStorage = function(){
		return default_storage;
	};

	return exports;
})(netgraphz.core, netgraphz.eventBus, netgraphz.utils);
