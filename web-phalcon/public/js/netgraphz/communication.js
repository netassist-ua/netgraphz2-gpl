var netgraphz = netgraphz || {};
netgraphz.communication = (function(core, tools, eventBus, store, fetcher, ui, notifications, utils, io){
	var exports = {};

	var Channel = function(settings) {
		var socket = undefined;
		var MSG_TYPE_ICINGA_NOTIFICATION = 0;
		var MSG_TYPE_SYSTEM = 1;
		var MSG_TYPE_USER = 2;
		var MSG_TYPE_STAT_UPDATE = 3;

		var MSG_LEVEL_INFO = 1;
		var MSG_LEVEL_WARN = 2;
		var MSG_LEVEL_ERROR = 3;
		var MSG_LEVEL_CRITICAL = 4;


		var handleMessage = function( message ) {
			switch(message.type){
				case MSG_TYPE_ICINGA_NOTIFICATION:
				return handleIcingaNotification(message);
				case MSG_TYPE_SYSTEM:
				return handleSystemMessage(message);
				case MSG_TYPE_USER:
				return handleUserMessage(message);
				case MSG_TYPE_STAT_UPDATE:
				return handleStatUpdate(message);
				default:
				console.log("Unknown message type received from remote socket: msg_type=%d", message.type);
				return false; //uknown message type
			}
		};

		/*
		*	Handles system status message (Icinga, Graph)
		*/
		var handleSystemMessage = function( message ) {
			var icon = "ICON_DEFAULT"
			var sound = "SND_NOTIFY";
			switch( message.level ){
				case MSG_LEVEL_INFO:
				break;
				case MSG_LEVEL_WARN:
				break;
				case MSG_LEVEL_ERROR:
				break;
				case MSG_LEVEL_CRITICAL:
				console.error("Error in NetGraphz2: %s", message.content);
				break;
			}
		};

		/*
		*	Handles user message (private message, chat, alarm)
		*/
		var handleUserMessage = function( message ) {
			//TODO: Implement handler
		};

		/*
		*	Handles Icinga2 notification in JSON representation
		*	Performs graph update (color change calls to renderer)
		*/
		var handleIcingaNotification = function(message){
			switch(message.icinga_type){
				case 0:
				handleIcingaHostNotification(message);
				break;
				case 1:
				handleIcingaServiceNotification(message);
				break;
			}
		};

		var performNodeUpdate = function(node_id, problem){
			fetcher.fetchNode(node_id, function(node, code, error){
				if(error){
					console.error("[communication, bug] Cannot fetch new node state from server!");
					return;
				}
				store.getDefaultStorage().updateNode(node);
				if( problem && ui.isFollowEnabled() ){
					ui.select_node(node.id);
				}
			});
		};

		/*
			Host notification handler
		*/
		var handleIcingaHostNotification = function(message){
			if(typeof message.node === "undefined" && typeof message.node.id === "undefined"){
				return;
			}
			var state = utils.get_node_state_from_icinga(message.icinga.state_id);
			var problem = (state == core.node_state.STATE_NODE_WARN || state == core.node_state.STATE_NODE_DOWN);
			performNodeUpdate(message.node.id, problem);

			switch(state){
				case core.node_state.STATE_NODE_UP:
				notifications.sendSuccess(
					"Graph node goes up",
					"Node: " + message.node.name);
				break;
				case core.node_state.STATE_NODE_WARN:
				notifications.sendWarning(
					"Graph node has some problems!",
					"Node: " + message.node.name
				);
				break;
				case core.node_state.STATE_NODE_DOWN:
				notifications.sendError(
					"Graph node goes DOWN!",
					"Node: " + message.node.name
				);
				break;
				case core.node_state.STATE_NODE_UNREACHABLE:
				notifications.send(
					"Graph node unreachable",
					"Node: " + message.node.name
				);
				break;
				default:
				console.log("[communcation, bug?] Unknown node state %s action", message.icinga.state_id);
				break;
			}
		};

		var handleIcingaServiceNotification = function(message){
			  var service_state = parseInt(message.icinga.state_id);
				var problem = service_state == 1 || service_state == 2;
				performNodeUpdate(message.node.id, problem);
				switch(service_state){
						case 0:
						notifications.sendSuccess("Node service goes up",
							"Service: " + message.icinga.name + "\n" +
							"Node: " + message.icinga.host.name + "\n" +
							"Output: "+ message.icinga.output
						);
						break;
						case 1:
						notifications.sendWarning("Node service WARNING",
							"Service: " + message.icinga.name + "\n" +
							"Node: " + message.icinga.host.name + "\n" +
							"Output: "+ message.icinga.output
						);
						break;
						case 2:
						notifications.sendError("Node service CRITICAL!",
							"Service: " + message.icinga.name + "\n" +
							"Node: " + message.icinga.host.name + "\n" +
							"Output: "+ message.icinga.output
						);
						break;
						case 3:
						notifications.send("Node service state unknown!",
							"Service: " + message.icinga.name + "\n" +
							"Node: " + message.icinga.host.name + "\n"
						);
						break;
						default:
							console.log("[communcation, bug?] Unknown service state %s on node %s", message.icinga.state_id, message.icinga.host.name)
							break;
				}
		};

		/*
		* 	Handles statistics update message
		*	Message caused by SNMP data traffic collector updates
		*/
		var handleStatUpdate = function(message){
		};

		var bindEvents = function(){
			if(socket == undefined)
			throw new Error("Socket is not initialized yet");

			socket.on('connect', function(){
				console.log("Successfully connected to: %s", settings.remote_url);
			});
			socket.on('message', function(data){
				handleMessage(data);
			});
			socket.on('disconnect', function(){
				console.error("Disconnected from: %s. Notifications disabled!", settings.remote_url);
			});

		};

		this.emit = function(topic, data) {
			socket.emit(topic, data);
		};

		this.start = function( ){
			socket = io(settings.remote_url);
			bindEvents();
		};

		this.stop = function( ){
			socket.close();
		};
	};

	var default_channel = null;

	var _defaults = {
		'remote_url': 'http://localhost:3333'
	};

	exports.Channel = Channel;

	exports.init = function(config){
		settings = tools.extend(_defaults, config);
		default_channel = new Channel(settings);
	};

	exports.getDefaultChannel = function(){
		return default_channel;
	};

	return exports;

})(netgraphz.core,
	netgraphz.tools,
	netgraphz.eventBus,
	netgraphz.store,
	netgraphz.fetcher,
	netgraphz.ui,
	netgraphz.ui.notifications,
	netgraphz.utils,
	io);
