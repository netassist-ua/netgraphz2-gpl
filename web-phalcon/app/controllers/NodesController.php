<?php
/*
 *  NodesController
 *  Handles /Nodes requests: getting nodes, finding nodes.
 */

use Phalcon\Mvc\View;
use NetAssist\Graph;
use NetAssist\Models\Users;
use NetAssist\Models\UserNodes;
use NetAssist\Models\NodePosition;

use \Exception;
use \MongoDate;


class NodesController extends ControllerBase {
	/**
	 * Nodes repository
	 * @var \NetAssist\Graph\Repositories\Interfaces\INodesRepository
	 */
	protected $_nodesRepo;

	public function initialize() {
		$this->_nodesRepo = $this->di->get('graphNodesRepository');
		parent::initialize();
	}

	/**
	 *  HTTP GET handler for /nodes/
	 *  Get node by identifier
	 *  @param int $id Identifier of graph node
	 */

	public function getAction($id){
		$id = intval($id);
		$this->view->setRenderLevel(View::LEVEL_NO_RENDER);
		$node = $this->_nodesRepo->GetById($id);
		if($node == null){
			return $this->sendJsonResponse([
				'status' => 'Not found',
				'code' => 404,
				'id' => $id
			], 404);
		}
		$this->sendJsonResponse($node);
	}

	/**
	 *
	 * Appends stored position coordinates (x,y) from user profile to nodes
	 * Return original array if no positions stored or user is not logged in
	 *
	 * @param \NetAssist\Graph\Nodes[] Nodes to append
	 * @return \NetAssist\Graph\Nodes[] Nodes with appended positions
	 */
	private function appendUserPositions($nodes){
		try {
			$identity = $this->auth->getIdentity();
			if(!$identity || $identity == null){
				return $nodes;
			}
			$uid = $this->auth->getUserId();
			$u_nodes = UserNodes::findFirst(array(
				array(
					"uid" => $uid
				)
			));
			if($u_nodes == null){
				return $nodes;
			}
			foreach ($nodes as $node) {
				if(array_key_exists($node->id, $u_nodes->positions)){
					$pos = (object)$u_nodes->positions[$node->id];
					$node->x = $pos->x;
					$node->y = $pos->y;
				}
			}
		}
		catch(Exception $e) {
			error_log(sprintf("Couldn't fetch user graph position, error: %s", addslashes($e->getMessage())), 0);
		}
		return $nodes;
	}


	public function getAllFromIdAction($id, $take) {
		$this->view->setRenderLevel(View::LEVEL_NO_RENDER);
		$id = intval($id);
		$take = intval($take);
		$nodes = $this->_nodesRepo->GetAllByLastId($id, $take);
		$nodes = $this->appendUserPositions($nodes);
		$this->sendJsonResponse($nodes);
	}

	public function countAction(){
		$this->view->setRenderLevel(View::LEVEL_NO_RENDER);
		$count = $this->_nodesRepo->CountAllNodes();
		$this->sendJsonResponse([ "count" => $count ]);
	}

}

?>
