var netgraphz = netgraphz || {};

netgraphz.status = (function(fetcher, $){
  fetcher.fetchStatus(function(data, code, error){
    if(error){
      console.error("Failed to fetch status data, http code: %s", code);
      console.error("Error: %s", JSON.stringify(error));
      return;
    }
    console.log("Status data loaded");
    $(function(){
      $("#status_nodes_count").text(data.counts.nodes);
      $("#status_links_count").text(data.counts.links);
    });
  });

  return {};
})(netgraphz.fetcher, $);
