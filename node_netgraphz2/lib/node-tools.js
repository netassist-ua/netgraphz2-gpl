module.exports = {
  apiNodeToGraphNode: function(ng_node, include_id){
    if(typeof include_id === "undefined"){
        include_id = true;
    }
    var graph_node = {
      name: ng_node.name,
      model: ng_node.model,
      mac_address: ng_node.mac,
      db_sw_id: ng_node.origin_db_id,
      num_ports: ng_node.num_ports,
      serial: ng_node.serial,
      net_id: ng_node.net_id,
      ip_address: ng_node.ip,
      mac_address: ng_node.mac,
      address: ng_node.address,
      comment: ng_node.comment,
      icinga_name: ng_node.icinga_name,
      loc_id: ng_node.loc_id,
      manage_vlan_id: ng_node.manage_vid
    };
    if(include_id)
      graph_node._id = ng_node.id;
    return graph_node;
  },
  graphNodeToApiNode: function(graph_node) {
      return {
          id: graph_node._id,
          name: graph_node.name,
          dns: graph_node.dns_name,
          mode: graph_node.model,
          origin_db_id: graph_node.db_id,
          serial: graph_node.serial,
          net_id: graph_node.net_id,
          ip: graph_node.ip_address,
          mac: graph_node.mac_address,
          address: graph_node.address,
          comment: graph_node.comment,
          icinga_name: graph_node.icinga_name,
          loc_id: graph_node.loc_id,
          manage_vid: graph_node.manage_vlan_id
      };
  }

}
