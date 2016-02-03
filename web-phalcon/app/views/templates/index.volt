{# templates/index.volt #}
{{ get_doctype() }}
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  {{ stylesheet_link("css/bootstrap.min.css") }}
  {{ stylesheet_link("css/bootstrap-theme.min.css") }}
  {{ stylesheet_link("css/netgraphz-bootstrap.css") }}
  {{ stylesheet_link("css/jquery-ui/jquery-ui.min.css") }}
  {{ stylesheet_link("css/toastr.min.css") }}
  {{ stylesheet_link("css/jquery-ui/jquery-ui.structure.min.css") }}
  {{ stylesheet_link("css/jquery-ui/jquery-ui.theme.min.css") }}

  {{ javascriptInclude("js/pubsub.js") }}
  {{ javascriptInclude("js/mediator.min.js") }}
  {{ javascriptInclude("js/jquery.min.js") }}
  {{ javascriptInclude("js/jquery-ui/jquery-ui.min.js") }}
  {{ javascriptInclude("js/jsrender.min.js") }}
  {{ javascriptInclude("js/bootstrap.min.js") }}
  {{ javascriptInclude("js/socket.io.js") }}
  {{ javascriptInclude("js/desktop-notify-min.js") }}
  {{ javascriptInclude("js/toastr.min.js") }}

  {{ javascriptInclude("js/netgraphz/fetcher.js") }}
  {{ javascriptInclude("js/netgraphz/status.js") }}
  {% block head %}{% endblock %}
  {{ get_title() }}
</head>
<body>
  <header class="navbar navbar-default navbar-fixed-top">
    <div class="container-fluid">
      <div class="navbar-header">
        <a href="#" class="navbar-brand">{{ config.information.companyName }}</a>
      </div>
      <nav id="bs-navbar" class="collapse navbar-collapse">
        <div class="navbar-left">
          <ul class="navbar-nav nav">
            <li>
              <a href="/" title="View">Graph</a>
            </li>
            <li>
              <a href="#" title="Summary">Summary</a>
            </li>
            <li>
              <a href="{{config.information.icingaUrl}}">Icinga2 classic</a>
            </li>
            <li>
              <a href="#" title="About">About</a>
            </li>
          </ul>
        </div>
        <div class="navbar-right">
          <ul class="navbar-nav nav navbar-counts">
          <li>
            <p id="node_count" class="text-primary">Nodes: </p>
            <p id="links_count" class="text-primary">Links: </p>
          </li>
          <li>
             <span class="label label-success" id="status_nodes_count">?</span>
             <br>
             <span class="label label-success" id="status_links_count">?</span>
          </li>
          </ul>
          {% if auth.getIdentity() == null %}
            {{ link_to("Account/Login", "Login", "class": "btn btn-default navbar-btn") }}
          {% else %}
            <p class="navbar-text">Logged as {{auth.getName()}}</p>
            {{ link_to("Account/Logout", "Logout", "class": "btn btn-default navbar-btn") }}
          {% endif %}
        </div>
      </nav>

    </div>
  </header>
  <div class="container">
    {% block page_header %}{% endblock %}
    {{ content() }}
    {% block content %} {% endblock %}
  </div>
  <footer>

  </footer>
</body>
</html>
