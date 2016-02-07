/*
   Graph panel interaction module
   */

var netgraphz = netgraphz || {};
netgraphz.ui = netgraphz.ui || {};

netgraphz.ui.linkPanel = (function(ui, eventBus, tools, utils, store, jQuery){

	var __interactor;
	var defaults = {
		fadeTime: 200,
		holdTime: 500,
		waitTime: 1200,
		links: []
	};
	var cfg = defaults;
	var mouseover_timer = null;

	function Interactor(container_id ) {
		var panel_show = false;


		var __publisher;
		var self = this;
		var __shownLink = null;
		var __selectedLink = null;
		var $links_container;
		var $panel;

		jQuery(function(){
			$panel = jQuery('#link_panel');
			$links_container = jQuery('#edge_links');
			utils.attach_link_events($links_container);
			$panel.on('mouseover', function(){
				self.stopLinkPanelTimer();
			});

			$panel.on('mouseout', function(){
				self.startLinkPanelTimer();
			});
			jQuery("#link_panel_close").click(function(e){
				self.closeLinkPanel();
				e.preventDefault();
				$(this).blur();
			});
		});

		var fadeTimer;
		var timer_started = false;

		this.stopLinkPanelTimer = function(){
			if(timer_started){
				clearTimeout(fadeTimer);
			}
			timer_started = false;
		};

		this.startLinkPanelTimer = function(){
			fadeTimer = setTimeout(function(){
				if(__selectedLink != null){
					self.setContent(__selectedLink);
				}
				else {
					$panel.fadeOut(cfg.fadeTime, function(){
						panel_show = false;
						__shownLink = null;
						__selectedLink = null;
					});
				}
				timer_started = false;
			}, cfg.holdTime);
			timer_started = true;
		};


		this.setContent = function(link){
			__shownLink = link;
			$link_capacity_block = $panel.find(".link_capacity_block");
			$link_load_block = $panel.find(".link_load_block");
			$src_port_block = $panel.find(".src_port_block");
			$dst_port_block = $panel.find(".dst_port_block");
			$links_block = $panel.find(".links_block");
			
			//reset visibility
			
			$link_capacity_block.hide();
			$link_load_block.hide();
			$src_port_block.hide();
			$dst_port_block.hide();
			$links_block.hide();

			if( (typeof link.rx_octets === "string" || typeof link.tx_octets === "string") 
					&& (link.rx_octets != "" || link.tx_octets != "") ){
				var rx_metrics = store.getDefaultStorage().getMetricValues(link.rx_octets);
				var tx_metrics = store.getDefaultStorage().getMetricValues(link.tx_octets);
				var rx_load_text = "unknown";
				var tx_load_text = "unknown";
				var rx_values = store.getDefaultStorage().getMetricValues(link.rx_octets);
				var tx_values = store.getDefaultStorage().getMetricValues(link.tx_octets);
				if(Array.isArray(rx_values) && rx_values.length > 0){
						rx_load_text = tools.dataRateBpsFormat(rx_values[0].value * 8, 2);
						$link_load_block.show();
				}
				if(Array.isArray(tx_values) && tx_values.length > 0){
						tx_load_text = tools.dataRateBpsFormat(tx_values[0].value * 8, 2);
						$link_load_block.show();
				}
				$link_load_block.find(".link_rx").text(rx_load_text);
				$link_load_block.find(".link_tx").text(tx_load_text);
			}

			if(typeof link.link_speed === "number" && link.link_speed > 0){
				$link_capacity_block.show();
				$link_capacity_block.find(".link_capacity")
					.text(tools.dataRateBpsFormat(link.link_speed * (1000 * 1000)));
				var duplex = true;
				if( typeof link.duplex === "boolean" ){
					duplex = link.duplex;
				}
				$link_capacity_block.find(".link_duplex").text(duplex ? "Yes" : "No");

			}
			$panel.find(".src_name").text(link.src.node.name);
			$panel.find(".dst_name").text(link.dst.node.name);
			if(typeof link.src.port_id === "number" && link.src.port_id > 0){
				$src_port_block.show();
				$src_port_block.find(".src_port").text(link.src.port_id);	
			}
			if(typeof link.dst.port_id === "number" && link.dst.port_id > 0){
				$dst_port_block.show();
				$dst_port_block.find(".dst_port").text(link.dst.port_id);	
			}

			var l_length = cfg.links.length;
			if( l_length > 0 ){
				$links_block.show();
			}
			for( var i = 0; i < l_length; i ++ ){
				var ex_link = cfg.links [ i ];
				$links_container.append(utils.make_link(ex_link, link));
				if( i + 1 < l_length ){
					$links_container.append(utils.make_separator());
				}
			}
			//set size
		
		};


		this.showLinkPanel = function(link, position){
			__shownLink = link;
			if(timer_started){
				self.stopLinkPanelTimer();
			}
			self.setContent(link);

			$panel.css ({
				'position': 'fixed',
				'right': null,
				'bottom': null,
				'top': utils.getPixelsOrUndefined(position.y),
				'left': utils.getPixelsOrUndefined(position.x)
			});
			if(!panel_show){
				$panel.fadeIn(cfg.fadeTime, function(e){
					panel_show = true;
					$panel.css({
						"height": utils.getPixelsOrUndefined($panel.children(".panel-heading").outerHeight()
							       	+ $panel.children(".panel-body").outerHeight())
					});
				});
			};
		};

		this.getShownLink = function(){
			return __shownLink;
		};

		this.getSelectedLink = function(){
			return __selectedLink;
		}

		this.setSelectedLink = function(link){
			__selectedLink = link;
		}

		this.closeLinkPanel = function() {
			$panel.hide();
			panel_show = false;
			__selectedLink = null;
		};

		return this;
	};

	var stop_mouse_timer = function(){
		if( mouseover_timer != null){
			clearTimeout(mouseover_timer);
			mouseover_timer = null;
		}

	}

	var attach_events = function(){
		eventBus.subscribe("ui", "edge_mouseover", function(topic, e){
			if(__interactor.getSelectedLink() != null){
				return;
			}
			stop_mouse_timer();
			mouseover_timer = setTimeout(function(){	
				handle_link_info(e.link, e.rendererPosition);
			}, cfg.waitTime);
		});

		eventBus.subscribe("ui", "edge_tap", function(topic, e){
			stop_mouse_timer();
			handle_link_info(e.link, e.rendererPosition);
			__interactor.setSelectedLink(e.link);
		});

		eventBus.subscribe("ui", "edge_unselect", function(topie, e){
			var shown = __interactor.getShownLink();
			if(e.link.id == shown.id){
				__interactor.startLinkPanelTimer();
				__interactor.setSelectedLink(null);
			}
		});

		eventBus.subscribe("ui", "edge_mouseout", function(topic,e){
			stop_mouse_timer();		
			if(__interactor.getSelectedLink() != null ){
				return;
			}
			var shown = __interactor.getShownLink();
			if( shown != null && e.link.id == shown.id ){
				__interactor.startLinkPanelTimer();
			}
		});
	};

	var handle_link_info = function(link, position){
		if(typeof link === "undefined"){
			console.error("Cannot find %s in loaded links", link.id);
		}
		__interactor.showLinkPanel(link, position);
	};

	var init = function(settings, container_id){
		cfg = tools.extend(defaults, settings);
		__publisher = eventBus.registerPublisher("ui.link_panel");
		__interactor = new Interactor(container_id);
		attach_events();
	};

	var exports = {
		init: init
	};

	return exports;

})(netgraphz.ui, netgraphz.eventBus, netgraphz.tools, netgraphz.utils, netgraphz.store, $);
