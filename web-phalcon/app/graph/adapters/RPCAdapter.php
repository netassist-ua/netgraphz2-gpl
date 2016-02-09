<?php
namespace NetAssist\Graph\Adapters;
use \NetAssist\Graph;
use \DateTime;
use \ng_rpc\MetricVal\Kind;

class RPCAdapter implements IGraphAdapter {
	/**
	 * Converts node metric value object to NetAssist node metric value
	 * @param \ng_rpc\MetricVal $rpc_node_metric_val gRPC metric value
	 * @return \NetAssist\Graph\NodeMetricValue NetAssist node metric value
	 */
	public function getNodeMetricValue( $rpc_node_metric_val ){
		$metric_value = new \NetAssist\Graph\NodeMetricValue();
		$metric_value->name = $rpc_node_metric_val->getName();
		$metric_value->type = $rpc_node_metric_val->getType();
		$metric_value->kind = $rpc_node_metric_val->getKind();
		$metric_value->time->setTimestamp($rpc_node_metric_val->getTime());
		switch($rpc_node_metric_val->getKind()){
		case Kind::GAUGE:
			$metric_value->value = $rpc_node_metric_val->getGaugeValue();
			break;
		case Kind::DERIVE:
			$metric_value->value = $rpc_node_metric_val->getDeriveValue();
			break;
		case Kind::COUNTER:
			$metric_value->value = $rpc_node_metric_val->getCounterValue();
			break;
		case Kind::OTHER:
			$metric_value->value = $rpc_node_metric_val->getOtherValue();
			break;
		default:
			$metric_value->value = null;
			break;
		}
		return $metric_value;
	}


	/**
	 * Converts gRPC status object to NetAssist node status
	 * @param \ng_rpc\NodeStatus $rpc_node_status gRPC Node status
	 * @return \NetAssist\Graph\NodeStatus Status
	 */
	public function getNodeStatus( $rpc_node_status ){
		$status = new \NetAssist\Graph\NodeStatus($rpc_node_status->getState(), $rpc_node_status->getHardState(), $rpc_node_status->getDescriptiveState() );
		$status->avg_rtt_ms = $rpc_node_status->getRtt();
		$status->packet_loss = $rpc_node_status->getLoss();
		$status->dup = $rpc_node_status->getIsDuplicate();
		$status->source = $rpc_node_status->getSource();
		$status->time->setTimestamp($rpc_node_status->getTime());
		$status->is_flapping = $rpc_node_status->getIsFlapping();
		$status->is_hard_state = $rpc_node_status->getIsHardState();
		$status->is_reachable = $rpc_node_status->getIsReachable();
		$status->is_executing = $rpc_node_status->getIsExecuting();
		$status->has_been_checked = $rpc_node_status->getHasBeenChecked();
		$status->notes = $rpc_node_status->getNotes();
		$status->num_services = $rpc_node_status->getNumServices();
		$status->num_services_ok = $rpc_node_status->getNumServicesOk();
		$status->num_services_pending = $rpc_node_status->getNumServicesPending();
		$status->num_services_unknown = $rpc_node_status->getNumServicesUnknown();
		$status->num_services_warning = $rpc_node_status->getNumServicesWarning();
		$status->num_services_critical = $rpc_node_status->getNumServicesCritical();
		$status->output = $rpc_node_status->getOutput();
		return $status;
	}

	/**
	 * Converts gRPC node object to NetAssist node
	 * @param \ng_rpc\Node $rpc_node gRPC Node object
	 * @return \NetAssist\Graph\Node Node
	 */
	public function getNode( $rpc_node ){
		$node = new \NetAssist\Graph\Node($rpc_node->getId($rpc_node->GetId()));
		$node->db_id = $rpc_node->getDbId();
		$node->name = $rpc_node->getName();
		$node->model = $rpc_node->getModel();
		$node->serial = $rpc_node->getSerial();
		$node->icinga_name = $rpc_node->getIcingaName();
		$node->ip = long2ip($rpc_node->getIp4());
		if($rpc_node->hasIp6()){
			$node->ip6 = inet_ntop($rpc_node->getIp6());
		}
		$node->mac_address = $rpc_node->getMacAddress();
		$node->comment = $rpc_node->getComment();
		$node->ports_number = $rpc_node->getNumPorts();
		$node->address = $rpc_node->getAddress();
		$states = $rpc_node->getStatesList();
		foreach ($states as $state) {
			$node->status[] = $this->getNodeStatus($state);
		}
		$rpc_metrics = $rpc_node->getLastMetricValuesList();
		foreach ($rpc_metrics as $rpc_metric){
			$metric = new \NetAssist\Graph\NodeMetric(); 
			$metric->name = $rpc_metric->getKey();
			$metric->values = array();
			$rpc_values = $rpc_metric->getValue()->getValuesList();
			foreach( $rpc_values as $rpc_value ){
				$metric->values[] = $this->getNodeMetricValue($rpc_value);
			}
			$node->metrics[] = $metric;
		}
		return $node;
	}
    
 	/**
	* @param \ng_rpc\Link $rpc_link Link representation from response of client
	* @param \ng_rpc\Node|null $startNode Start node data from response
	* @param \ng_rpc\Node|null $endNode End node data from response
	* @param bool $use_node_data Uses other node data except identifiers
	* @return \NetAssist\Graph\Link Link
	*/
	public function getLink($rpc_link, $startNode = null, $endNode = null, $use_node_data=false) {
		$link = new \NetAssist\Graph\Link($rpc_link->getId());
		$link->comment = $rpc_link->getComment();
	      	$link->link_speed = $rpc_link->getCapacityMbit();
		$link->src_port = $rpc_link->getSrcSwPort();
		$link->dst_port = $rpc_link->getDstSwPort();
		$link->comment = $rpc_link->getComment();
		$link->rx_octets_metric = $rpc_link->getRxOctetsMetric();
		$link->tx_octets_metric = $rpc_link->getTxOctetsMetric();
		if($use_node_data){
			$link->src_node = $this->getNode($startNode);
	    		$link->dst_node = $this->getNode($endNode);
		}
		else {
		      $link->src_node = new \NetAssist\Graph\Node($rpc_link->getStartNodeId());
		      $link->src_node->db_id = $rpc_link->getDbStartId();
		      $link->dst_node = new \NetAssist\Graph\Node($rpc_link->getEndNodeId());
		      $link->dst_node->db_id = $rpc_link->getDbEndId(); 
		}
		return $link;
	}
    
	/**
	* @param \ng_rpc\Link[] $rpc_links Links representation from response of client
	* @param bool $use_node_data Uses other node data except identifiers
	* @return \NetAssist\Graph\Link[] Array of links
	*/
	public function getLinks($rpc_links, $use_node_data = false){
		$out_links = array();
		foreach( $rpc_links as $rpc_link ){
			$out_links[] = $this->getLink($rpc_link);
		}
		return $out_links;
	}

	/**
	* @param \ng_rpc\Node[] $rpc_nodes Nodes representation from response of client
	* @return \NetAssist\Graph\Node[] Array of nodes
	*/
	public function getNodes($rpc_nodes){
		$out_nodes = array();
		foreach ($rpc_nodes as $rpc_node) {
			$out_nodes[] = $this->getNode($rpc_node);
		}
		return $out_nodes;
	}
}


?>
