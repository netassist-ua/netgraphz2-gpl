<?php

namespace NetAssist\Graph\Repositories\GRPC;
use NetAssist\Graph\Repositories\Interfaces\ILinksRepository;
use NetAssist\Graph;
use ng_rpc\StatusRequest as StatusRequest;
use ng_rpc\LinkByIdRequest as LinkByIdRequest;
use ng_rpc\LinksAllRequest as LinksAllRequest;

/**
 *	gRPC binding based NodeRepository interface implementation
 */
class LinksRepository extends BaseGraphRepository implements ILinksRepository {
	/*
	 * Constructor
	 * @param \NetAssist\GRPC\Config $config Configuration
	 * @param \NetAssist\Graph\Adapters\IGraphAdapter $adapter adapter instance
	 */
	function __construct($config, $adapter){
		parent::__construct($config, $adapter);
	}
	/**
	 *   Get count of links in graph
	 *	  @return int Count of links
	 */
	function CountAllLinks(){
		$client = $this->getRPCClient();
		$req = new StatusRequest();
		$req->setTime(time());
		$call = $client->GetStatus($req, array('timeout' => $this->_config->timeout));
		list($reply, $status) = $call->wait();
		return $reply->getNLinks();
	}

	/**
	 *   Fetch all links from graph database
	 *   @param int $last_id Identifier to start from
	 *   @param int $n_take Number of links to take
	 *   @return \NetAssist\Graph\Link[] Links
	 */
	function GetAllByLastId ($last_id, $n_take){
		$client = $this->getRPCClient();
		$req = new LinksAllRequest();
		$req->setLastId($last_id);
		$req->setNTake($n_take);
		$call = $client->GetAllLinks($req, array('timeout' => $this->_config->timeout));
		$links = $call->responses();
		return $this->_adapter->getLinks($links);
	}

	/**
	 *  Get link from database by identifier
	 *  @param int $id Identifier of a link
	 *  @return \NetAssist\Graph\Link Link
	 */
	function GetById( $id ){
		$client = $this->getRPCClient();
		$req = new LinkByIdRequest();
		$req->setLinkId($id);	
		list($resp, $status) = $client->GetLinkById($req, array('timeout' => $this->_config->timeout))->wait();
		return $this->_adapter->getLink($resp);
	}

	/**
	 *  Get bridge links in network graph,
	 *    works for O(n+m)
	 *  @see http://e-maxx.ru/algo/bridge_searching
	 *  @return \NetAssist\Graph\Link[] Links
	 */
	function GetBridges() {
		//not implemeted yet
	}
	
      	
}
?>
