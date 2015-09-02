<?php
namespace NetAssist\Graph\Adapters;
use NetAssist\Graph;
use \NetAssist\Utils\Types\IntUtils;
use \NetAssist\Utils\Types\StringUtils;

/*
 * Adapter for processing NeoClient response results
 */
class NeoClientAdapter implements IGraphAdapter {
    /**
    * @param array|mixed $response_data_node Node representation from response of client
    * @return \NetAssist\Graph\Node Node
    */
    public function getNode($response_data_node){

        $np = $response_data_node['properties'];
        $node = new \NetAssist\Graph\Node(intval($response_data_node['id']));
        $node->db_id = IntUtils::TryGetIntArrKeyOrNull('db_sw_id', $np);
        $node->name = $np['name'];
        $node->model = StringUtils::TryGetStrArrKeyOrEmpty('model', $np);
        $node->icinga_name = StringUtils::TryGetStrArrKeyOrEmpty('icinga_name', $np);
        $node->ip = StringUtils::TryGetStrArrKeyOrEmpty('ip_address', $np);
        $node->mac = StringUtils::TryGetStrArrKeyOrNull('mac_address', $np);
        $node->comment = StringUtils::TryGetStrArrKeyOrEmpty('comment', $np);
        $node->ports_number = IntUtils::TryGetIntArrKeyOrNull('num_ports', $np);
		    $node->addr = StringUtils::TryGetStrArrKeyOrEmpty("address", $np);
        return $node;
    }

    /**
    * @param array|mixed $response_data_nodes Nodes representation from response of client
    * @return \NetAssist\Graph\Node[] Array of nodes
    */
    public function getNodes($response_data_nodes){
        $nodes = array();
        foreach ($response_data_nodes as $response_node) {
            array_push($nodes, $this->getNode($response_node['graph']['nodes'][0]));
        }
        return $nodes;
    }

    /**
    * @param array|mixed $resp_data_link_rel Link representation from response of client
    * @param array|mixed $resp_node_start Start node data from response
    * @param array|mixed $resp_node_end End node data from response
    * @param bool $use_node_data Uses other node data except identifiers
    * @return \NetAssist\Graph\Link Link
    */
    public function getLink($resp_data_link_rel, $resp_node_start,
                            $resp_node_end, $use_node_data=false) {
          $lp = $resp_data_link_rel['properties'];
          $link = new \NetAssist\Graph\Link(intval($resp_data_link_rel['id']));
          $link->comment = StringUtils::TryGetStrArrKeyOrEmpty('comment', $lp);
          $link->link_speed = IntUtils::TryGetIntArrKeyOrNull('speed', $lp);
          $link->src_port = IntUtils::TryGetIntArrKeyOrNull('port_id', $lp);
          $link->dst_port = IntUtils::TryGetIntArrKeyOrNull('ref_port_id', $lp);
           if($use_node_data){
              $link->src_node = $this->getNode($resp_node_start);
              $link->dst_node = $this->getNode($resp_node_end);
          }
          else {
                $link->src_node = new \NetAssist\Graph\Node(intval($resp_data_link_rel['startNode']));
                $link->src_node->db_id = IntUtils::TryGetIntArrKeyOrNull('db_sw_id', $lp);
                $link->dst_node = new \NetAssist\Graph\Node(intval($resp_data_link_rel['endNode']));
                $link->dst_node->db_id = IntUtils::TryGetIntArrKeyOrNull('db_ref_sw_id', $lp);
          }
          return $link;
    }

    /**
    * @param array|mixed $resp_data_links  Links representation from response of client
    * @param bool $use_node_data Uses other node data except identifiers
    * @return \NetAssist\Graph\Link[] Array of links
    */
    public function getLinks($resp_data_links,  $use_node_data=false){
      $links = array();
      foreach ($resp_data_links as $response_data_link) {
          $link_resp_rels = $response_data_link['graph']['relationships'];
          $link_resp_nodes = $response_data_link['graph']['nodes']; //two nodes
          foreach ($link_resp_rels as $link_resp_rel) {
              array_push($links, $this->getLink($link_resp_rel, $link_resp_nodes[1],
                        $link_resp_nodes[0], $use_node_data));
          }
      }
      return $links;
    }

}

?>
