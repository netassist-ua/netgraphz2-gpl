<?php

namespace NetAssist\Graph\Repositories\GRPC;
use NetAssist\Graph\Repositories\Interfaces\INodesRepository as INodesRepository;
use NetAssist\Graph;
use ng_rpc\StatusRequest as StatusRequest;
use ng_rpc\NodeByIdRequest as NodeByIdRequest;
use ng_rpc\NodesAllRequest as NodesAllRequest;

/**
 *	gRPC binding based NodeRepository interface implementation
 */
class NodesRepository extends BaseGraphRepository implements INodesRepository {
	/*
	 * Constructor
	 * @param \NetAssist\GRPC\Config $config Configuration
	 * @param \NetAssist\Graph\Adapters\IGraphAdapter $adapter adapter instance
	 */
	function __construct($config, $adapter){
		parent::__construct($config, $adapter);
	}
	
      	/**
  	* Returns count of all present nodes in graph database
  	* @return int Count of nodes
  	*/
	public function CountAllNodes() {
		$client = $this->getRPCClient();
		$req = new StatusRequest();
		$req->setTime(time());
		list($resp, $status) = $client->GetStatus($req, array('timeout' => $this->_config->timeout))->wait();
		return $resp->getNNodes();
	}

	/**
	* Get all nodes with limit using last id
	* @param int $last_id Id of last node to start from next
	* @param int $take Number of nodes to get
	* @return \NetAssist\Graph\Node[] Nodes
	*/
	function GetAllByLastId($last_id, $take){
		$client = $this->getRPCClient();
		$req = new NodesAllRequest();
		$req->setLastId($last_id);
		$req->setNTake($take);
		$req->setIncludeState(true);
		$req->setIncludeLastMetrics(3);
		$call = $client->GetAllNodes($req, array('timeout' => $this->_config->timeout));
		$nodes = $call->responses();
		return $this->_adapter->getNodes($nodes);
	}

	/**
	* Get node by identifier
	* @param int $id Identifier of node
	* @return \NetAssist\Graph\Node Node
	*/
	function GetById( $id ) {
		$client = $this->getRPCClient();
		$req = new NodeByIdRequest();
		$req->setNodeId($id);	
		$req->setIncludeState(true);
		$req->setIncludeMetrics(3);
		list($resp, $status) = $client->GetNodeById($req, array('timeout' => $this->_config->timeout))->wait();
		if( $resp == null ){
			return null;
		}
		return $this->_adapter->getNode($resp);
	}

}
?>
