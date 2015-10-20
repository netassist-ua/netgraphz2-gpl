{% extends "templates/index.volt" %}
{% block head %}
{{ stylesheet_link("css/graph.css") }}
{{ javascriptInclude("js/cytoscape.js") }}
{{ javascriptInclude("js/cytoscape.layout.forceAtlas2.js") }}
{{ javascriptInclude("js/cytoscape/sigma.forceAtlas2.worker.js") }}
{{ javascriptInclude("js/cytoscape/sigma.forceAtlas2.supervisor.js") }}
{{ javascriptInclude("js/netgraphz/core.js") }}
{{ javascriptInclude("js/netgraphz/settings.js") }}
{{ javascriptInclude("js/netgraphz/graph_utils.js") }}
{{ javascriptInclude("js/netgraphz/tools.js") }}
{{ javascriptInclude("js/netgraphz/eventbus.js") }}
{{ javascriptInclude("js/netgraphz/store.js") }}
{{ javascriptInclude("js/netgraphz/fetcher.js") }}
{{ javascriptInclude("js/netgraphz/updater.js") }}
{{ javascriptInclude("js/netgraphz/renderer.js") }}
{{ javascriptInclude("js/netgraphz/ui.js") }}
{{ javascriptInclude("js/netgraphz/ui.panel.js") }}
{{ javascriptInclude("js/netgraphz/ui.tabstop.js") }}
{{ javascriptInclude("js/netgraphz/ui.search.js") }}
{{ javascriptInclude("js/netgraphz/ui.notifications.js")}}
{{ javascriptInclude("js/netgraphz/communication.js") }}
{{ javascriptInclude("js/netgraphz/main.js") }}
{% endblock %}


{%block page_header%}
<div class="page-header">
    <h3>{{config.information.companyName}} network graph</h3>
    <div class="netgraphz-statusstrip">
      <p id="node_count" class="text-primary">Nodes: <span class="label label-success"><?php echo $node_count ?></span></p>
      <p id="links_count" class="text-primary">Links: <span class="label label-success"><?php echo $link_count ?></span></p>
    </div>
    <div class="toolstrip">
      <div class="toolstrip-left">
        <button id="graph_resetzoom" type="button" class="btn btn-default">Reset zoom</button>
		    <button id="graph_layoutstart" type="button" class="btn btn-default">Layout start</button>
		    <button id="graph_layoutstop" type="button" class="btn btn-default">Layout stop</button>
        <label class="checkbox-inline"><input type="checkbox" id="graph_follownodes" value="">Follow problematic nodes</label>
      </div>
      <div class="toolstrip-right">
        <span class="label label-primary">Node search by name: </span>
        <input type="text" id="node-name-search">
      </div>
    </div>
</div>
{% endblock %}

{%block content%}

<div id="waiter">
  <img src="/img/waiter.gif" alt="waiter"/>
</div>
<div class="graph-container">
  <div id="mynet">
  </div>
  {{ partial("graph/node_panel") }}
</div>
{% endblock %}
