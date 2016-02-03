/*
   Graph panel interaction module
   */

var netgraphz = netgraphz || {};
netgraphz.ui = netgraphz.ui || {};

netgraphz.ui.linkPanel = (function(ui, eventBus, tools, utils, store, jQuery){

	var __interactor;

	function Interactor( user_settings, container_id ) {
		var panel_show = false;


		var defaults = {
			fadeTime: 400,
			holdTime: 2400,
		};

		var cfg = tools.extend(defaults, user_settings);
		var __publisher;
		var self = this;
		var __shownLink = null;

		var $panel;

		jQuery(function(){
			$panel = jQuery('#link_panel');

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
			$panel.find(".link_tx").text(tools.dataRateBpsFormat(metric_rx.values[0].value * 8));
			$panel.find(".link_rx").text(tools.dataRateBpsFormat(metrix_tx.values[0].value * 8));
			$panel.find(".link_capacity").text(tools.dataRateBpsFormat(link.capacity / (1000 * 1000)));
		};


		this.showLinkPanel = function(link, link_scr_pos){
			__shownLink = link;
			if(timer_started){
				self.stopLinkPanelTimer();
			}
			self.setContent(link);

			if(!panel_show){
				$panel.fadeIn(cfg.fadeTime, function(e){
					panel_show = true;
				});
			};
		};

		this.getShownLink = function(){
			return __shownLink;
		};

		this.closeLinkPanel = function() {
			$panel.hide();
			panel_show = false;
		};
		return this;
	};

	var mouseover_link_timer = null;

	var attach_events = function(){
		eventBus.subscribe("ui", "edge_mouseover", function(topic, e){
			if(mouseover_link_timer != null) {
				clearTimeout(mouseover_link_timer);
			}
			var fn = function(){
				mouseover_link_timer = null;
				handle_link_info(e.link, e.rendererPosition);

			}
			if(__interactor.getShownLink() == null){
				fn();
			}

			mouseover_link_timer = setTimeout(fn, 900);
		});

		eventBus.subscribe("ui", "edge_select", function(topic, e){
			handle_link_info(e.link, e.rendererPosition);
			__interactor.setSelectedLink(e.link);
			__interactor.stopLinkPanelTimer();
		});

		eventBus.subscribe("ui", "edge_unselect", function(topie, e){
			var selected = __interactor.getSelectedLink();
			var shown = __interactor.getShownLink();
			__interactor.setSelectedLink(null);
			if(selected != null && shown != null && selected.id == shown.id){
				__interactor.startLinkPanelTimer();
			}
		});

		eventBus.subscribe("ui", "edge_mouseout", function(topic,e){
			if(mouseover_link_timer != null) {
				clearTimeout(mouseover_link_timer);
			}
			var selected = __interactor.getSelectedLink();
			var shown = __interactor.getShownLink();
			if( (selected != null && e.link.id != selected.id) ||
					(shown != null && e.link.id == shown.id )){
				__interactor.startLinkPanelTimer();
			}
		});

		eventBus.subscribe("store:default", "update_link", function(topic,e){
			var link = __interactor.getShownLink();
			var selected = __interactor.getSelectedLink();	
			if(link == null || typeof link !== "object") return;
			if(typeof e.link === "undefined"){
				console.error("[BUG] update_link event with undefined link received!");
				return;
			}	
			if(selected != null && e.link.id == selected.id )
				__interactor.setSelectedLink(e.link);
			if(e.link.id == link.id)
				__interactor.setContent(e.link);
		});

		eventBus.subscribe("store:default", "update_links", function(topic, e){
			var link = __interactor.getShownLink();
			var selected = __interactor.getSelectedLink();	
			if(link == null || typeof link !== "object") return;
			if(typeof e.links === "undefined" || !Array.isArray(e.links)){
				console.error("[BUG] update_links event with undefined or non-array links received!");
				return;
			}
			e.links.forEach(function(el,i,a){
				if(typeof el !== "object"){
					console.error("[BUG] update_links event with non-object in links array");
					return true;
				}
				if(selected != null && el.id == selected.id )
					__interactor.setSelectedLink(e.link);
				if(el.id == link.id){
					__interactor.setContent(el);
					return false;
				}
				else {
					return true;
				}
			});
		});
	};

	var handle_link_info = function(link, rendererPosition){
		if(typeof link === "undefined"){
			console.error("Cannot find %s in loaded links", link.id);
		}
		__interactor.showLinkPanel(link, rendererPosition);
	};

	var init = function(settings, container_id){
		__publisher = eventBus.registerPublisher("ui.link_panel");
		__interactor = new Interactor(settings, container_id);
		attach_events();
	};

	var exports = {
		init: init
	};

	return exports;

})(netgraphz.ui, netgraphz.eventBus, netgraphz.tools, netgraphz.utils, netgraphz.store, $);
