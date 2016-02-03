<script id="mon_source_template" type="text/x-jsrender">
	 <div>
		<span class="mon_source_title"> {{>source}} </span><br /> 
	  	<label>RTT: </label> <span class="node_rtt">{{>rtt}} ms {{>dup}}</span><br />
          	<label>Packet loss: </label> <span class="node_loss">{{>loss}} %</span> <br />
          	<label>State: </label> <span class="node_state">{{>state}}</span> <br />
		<label>Time: </label> <span class="node_time">{{>time}}</span><br />
	  </div>
</script>


<div id="node_panel" style="display: none" class="panel panel-info">
  <div class="panel-heading">
    <div class="btn-group pull-right">
       <a href="#" id="node_panel_close" class="btn btn-default btn-sm">x</a>
   </div>
    <h3 class="panel-title">Information</h3>
  </div>
  <div class="panel-body">
    <div class="info-container">
          <label>Name: </label> <span id="node_name"></span> <br />
          <label>Model: </label> <span id="node_model"></span> <br />
          <label>IP: </label> <span id="node_ip"></span> <br />
          <label>MAC: </label> <span id="node_mac"></span>  <br />
          <label>Address: </label> <span id="node_address"></span> <br />
	  <div id="monitoring_sources">
	  </div>
          <label>Links: </label>
          <div id="node_links">
          </div>
    </div>
  </div>
</div>
