<?php

namespace NetAssist\Graph\Repositories\NeoClient;

use \NetAssist\Graph\Repositories\Interfaces\INodesRepository as INodesRepository;
use NetAssist\Graph;

/**
* NeoClient based NodesRepository interface implementation
*/
class NodesRepository extends BaseGraphRepository implements INodesRepository {

  const FETCH_ALL_NOREL_QUERY = 'MATCH (n:NetAssistNode) RETURN n';
  const FETCH_ALL_REL_QUERY = 'MATCH (n:NetAssistNode) RETURN *  LIMIT 20';
  const GET_ALL_LIMIT_QUERY = 'MATCH (n:NetAssistNode) RETURN n ORDER BY Id(n) SKIP %d LIMIT %d';
  const GET_ALL_LAST_ID_QUERY = 'MATCH (n:NetAssistNode) WHERE Id(n) > %d RETURN n ORDER BY Id(n) LIMIT %d';
  const COUNT_ALL_NODES_QUERY = 'MATCH (n:NetAssistNode) RETURN count(n)';

  /**
  * Constructor
  * @param \Neoxygen\NeoClient\Client $connection NeoClient client connection instance
  * @param \NetAssist\Graph\Adapters\IGraphAdapter $adapter Adapter instance
  */
  function __construct($connection, $adapter) {
    parent::__construct($connection, $adapter);
  }

  /**
  * Returns count of all present nodes in graph database
  * @return int Count of nodes
  */
  public function CountAllNodes() {
    $this->_connection->sendCypherQuery(self::COUNT_ALL_NODES_QUERY);
    $resp = $this->_connection->getResponse();
    $body = $resp->getBody();
    return intval($body['results'][0]['data'][0]['row'][0]);
  }

  /**
  * Get all nodes with limit
  * @param int $skip Number of nodes to skip
  * @param int $take Number of nodes to get
  * @return \NetAssist\Graph\Node[] Nodes
  */
  function GetAll($skip, $take){
    $query = sprintf(self::GET_ALL_LIMIT_QUERY, $skip, $take);
    $this->_connection->sendCypherQuery($query);
    $resp = $this->_connection->getResponse();
    $body = $resp->getBody();
    return $this->_adapter->getNodes($body['results'][0]['data']);
  }

  /**
  * Get all nodes with limit using last id
  * @param int $last_id Id of last node to start from next
  * @param int $take Number of nodes to get
  * @return \NetAssist\Graph\Node[] Nodes
  */
  function GetAllByLastId($last_id, $take){
    $query = sprintf(self::GET_ALL_LAST_ID_QUERY, $last_id, $take);
    $this->_connection->sendCypherQuery($query);
    $resp = $this->_connection->getResponse();
    $body = $resp->getBody();
    return $this->_adapter->getNodes($body['results'][0]['data']);
  }


  /**
  * Get node by identifier
  * @param int $id Identifier of node
  * @return \NetAssist\Graph\Node Node
  */
  public function GetById( $id ){
    $id = intval($id);
    $query = sprintf('MATCH (n:NetAssistNode) WHERE Id(n)=%d RETURN n', $id);
    $req = $this->_connection->sendCypherQuery($query);
    $resp = $this->_connection->getResponse();
    $body = $resp->getBody();
    $db_nodes = $body['results'][0]['data'][0]['graph']['nodes'];
    if(count($db_nodes) == 0)
        return null;
    return $this->_adapter->getNode($db_nodes[0]);
  }

  /**
  * Fetch all nodes from network
  * @return \NetAssist\Graph\Node[] Nodes
  */
  public function FetchAllNodes() {
    $req = $this->_connection->sendCypherQuery(self::FETCH_ALL_NOREL_QUERY);
    $resp = $this->_connection->getResponse();
    $body = $resp->getBody();
    $db_nodes = $body['results'][0]['data'];
    return $this->_adapter->getNodes($db_nodes);
  }

  /**
  * Get nodes in down state
  * @return \NetAssist\Graph\Node[] Nodes
  */
  public function GetDownNodes() {

  }

  /**
  * Get subgraph from node excluding parents
  * @param int[] $parents_id  Identifier of parents
  * @param int $node_id Identifier of node to start from
  * @return \NetAssist\Graph\Node[] Node specified by graph with all relations et all
  */
  public function GetSubgraphFrom($parents_id, $node_id) {

  }

}

?>
