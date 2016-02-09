{% extends "templates/index.volt" %}
{% block head %}
{{ stylesheet_link("css/graph.css") }}
{{ javascriptInclude("js/netgraphz/tools.js") }}
{{ javascriptInclude("js/arbor.js")}}
{{ javascriptInclude("js/cytoscape.js") }}
{{ javascriptInclude("js/cytoscape-arbor.js")}}
{{ javascriptInclude("js/cytoscape.layout.forceAtlas2.js") }}
{{ javascriptInclude("js/cytoscape/sigma.forceAtlas2.worker.js") }}
{{ javascriptInclude("js/cytoscape/sigma.forceAtlas2.supervisor.js") }}
{{ javascriptInclude("js/netgraphz/core.js") }}
{{ javascriptInclude("js/netgraphz/settings.js") }}
{{ javascriptInclude("js/netgraphz/graph_utils.js") }}
{{ javascriptInclude("js/netgraphz/eventbus.js") }}
{{ javascriptInclude("js/netgraphz/store.js") }}
{{ javascriptInclude("js/netgraphz/updater.js") }}
{{ javascriptInclude("js/netgraphz/renderer.js") }}
{{ javascriptInclude("js/netgraphz/ui.js") }}
{{ javascriptInclude("js/netgraphz/ui.panel.js") }}
{{ javascriptInclude("js/netgraphz/ui.link_panel.js") }}
{{ javascriptInclude("js/netgraphz/ui.tabstop.js") }}
{{ javascriptInclude("js/netgraphz/ui.search.js") }}
{{ javascriptInclude("js/netgraphz/ui.notifications.js")}}
{{ javascriptInclude("js/netgraphz/communication.js") }}
{{ javascriptInclude("js/netgraphz/main.js") }}
{% endblock %}


{%block page_header%}
<div class="page-header">
    <div class="toolstrip">
      <div class="toolstrip-left">
        <button id="graph_resetzoom" type="button" class="btn btn-default">Reset zoom</button>
		    <button id="graph_layoutstart" type="button" class="btn btn-default">Layout start</button>
		    <button id="graph_layoutstop" type="button" class="btn btn-default">Layout stop</button>
        {% if auth.getIdentity() != null %}
        <button id="pos_save" type="button" class="btn btn-default">Save positions</button>
        <button id="pos_clear" type="button" class="btn btn-default">Clear positions</button>
        {% endif %}
        <label class="checkbox-inline"><input type="checkbox" id="graph_follownodes" value="">Follow problems</label>
	<label class="checkbox-inline"><input type="checkbox" id="mute_sound" value="">Mute sound</label>
      </div>
      <div class="toolstrip-right">
        <span class="label label-primary">Node search by name: </span>
        <input type="text" id="node-name-search">
      </div>
      <div style="clear: both"></div>
    </div>
</div>
{% endblock %}

{%block content%}

<div id="waiter">
  <img src="/img/waiter.gif" alt="waiter"/>
  <br />
  <label>Loading graph nodes:</label> <span class="wait_percents">0%</span>
</div>
<div class="graph-container">
  <div id="mynet">
  </div>
  {{ include_raw("graph/node_panel.volt") }}
  {{ include_raw("graph/link_panel.volt") }}
</div>
{% endblock %}
