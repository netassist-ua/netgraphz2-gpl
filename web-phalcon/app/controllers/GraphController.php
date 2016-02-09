<?php
/*
 *  GraphController
 *  Handles /Graph url requests: getting nodes, finding links, finding nodes.
 */

use Phalcon\Mvc\View;
use NetAssist\Graph;
use NetAssist\Models\Users;
use NetAssist\Models\UserNodes;
use NetAssist\Models\NodePosition;

use \Exception;
use \MongoDate;

class GraphController extends ControllerBase {
	/**
	 * Nodes repository
	 * @var \NetAssist\Graph\Repositories\Interfaces\INodesRepository
	 */
	protected $_nodesRepo;

	/**
	 * Links repository
	 * @var \NetAssist\Graph\Repositories\Interfaces\ILinksRepository
	 */
	protected $_linksRepo;


	public function initialize() {
		$this->_nodesRepo = $this->di->get('graphNodesRepository');
		$this->_linksRepo = $this->di->get('graphLinksRepository');
		parent::initialize();
	}

	/**
	 *
	 *  Returns parameters response JSON array
	 *
	 *  @param boolean $logged_in Is user logged in
	 *  @param boolean $has_positions Checks if user have positions stored
	 *  @param array|null $params
	 *
	 *  @return array Parameters response array
	 */
	private function getParamsResponseJson($logged_in, $has_positions, $params = null, $error = false, $error_message = null){
		if(!isset($params) || $params == null)
			$params = array();
		return array(
			"logged" => $logged_in,
			"positions" => $has_positions,
			"params" => $params,
			"error" => $error,
			"error_message" => $error_message
		);
	}

	/**
	 *
	 * Sends JSON state response to the client
	 *
	 * @param int|boolean $state State number or success-fail value
	 * @param int|null $error_code HTTP error code to send (200 by default)
	 * @param string|null $error Error description to send
	 * @return boolean Result
	 */
	private function sendStateResponse($state, $error_code = 200, $error = null){
		$base = array(
			"state" => $state
		);
		if($error != null){
			$base["error"] = $error;
		}
		return $this->sendJsonResponse($base, $error_code);
	}


	/**
	 * GET /Graph/status
	 * Get application status JSON
	 */
	public function getStatusAction(){
		$this->view->setRenderLevel(View::LEVEL_NO_RENDER);
		$node_count = $this->_nodesRepo->CountAllNodes();
		$link_count = ceil($this->_linksRepo->CountAllLinks() / 2);
		return $this->sendJsonResponse(array(
			"works" => true,
			"counts" => array(
				"nodes" => $node_count,
				"links" => $link_count
			)
		));
	}

	/**
	 * DELETE /Graph/positions
	 * Delete stored use nodes positions
	 */
	public function deletePositionsAction(){
		$this->view->setRenderLevel(View::LEVEL_NO_RENDER);
		$identity = $this->auth->getIdentity();
		if($identity == false){
			return $this->sendStateResponse(false, 417, "Not logged in");
		}
		try {
			$uid = $this->auth->getUserId();
			$user = Users::findById($uid);
			if($user == false){
				return $this->sendStateResponse(false, 417, "Not logged in");
			}
			$u_nodes = UserNodes::findFirst(array(
				array(
					"uid" => $uid
				)
			));
			if($u_nodes != false){
				if($u_nodes->delete() == false){
					return $this->sendStateResponse(false, 500, sprintf("User positions not deleted"));
				}
			}
		}
		catch(Exception $e){
			error_log(sprintf("Error during deleting user positions: %s", addslashes($e->getMessage())), 0);
			return $this->sendStateResponse(false, 500, sprintf("User positions not deleted"));
		}
		return $this->sendStateResponse(true);
	}

	/**
	 * GET   /Graph/userParams
	 * Get logged user parameters JSON
	 */
	public function getUserParametersAction(){
		$this->view->setRenderLevel(View::LEVEL_NO_RENDER);
		try {
			$identity = $this->auth->getIdentity();
			if(!$identity){
				return $this->sendJsonResponse($this->getParamsResponseJson(false, false));
			}
			$uid = $this->auth->getUserId();
			$user = (object)Users::findById($uid);
			$params = property_exists($user, "params") ? $user->params : array();
			if($user == false){
				return $this->sendJsonResponse($this->getParamsResponseJson(false, false));
			}
			$u_nodes = (object)UserNodes::findFirst(array(
				array(
					"uid" => $uid
				)
			));
			if(!$u_nodes || !property_exists($u_nodes, "positions")){
				return $this->sendJsonResponse($this->getParamsResponseJson(true, false));
			}
			return $this->sendJsonResponse($this->getParamsResponseJson(true, true, $params));
		}
		catch (Exception $e){
			error_log(sprintf("Error during fetching user parameters: %s", addslashes($e->getMessage())), 0);
			return $this->sendJsonResponse($this->getParamsResponseJson(true, false, null, true, addslashes($e->getMessage())));
		}
	}


	/**
	 * POST  /Graph/Positions
	 * Save user node positions
	 */
	public function savePositionsAction(){
		$this->view->setRenderLevel(View::LEVEL_NO_RENDER);
		$identity = $this->auth->getIdentity();
		if(!$identity){
			return $this->response->setStatusCode(417, "User is not logged in");
		}
		try {
			$uid = $this->auth->getUserId();
			$m_now = new \MongoDate(time());
			$user = Users::findById($uid);
			if($user == false){
				return $this->response->setStatusCode(403, "User not found");
			}
			$u_nodes = UserNodes::findFirst(array(
				array(
					"uid" => $uid
				)
			));
			if( $u_nodes == false ){
				$u_nodes = new UserNodes(); $u_nodes->uid = $uid;
			}
			$u_nodes->lastModified = $m_now;
			$rawBody = $this->request->getJsonRawBody(true);
			foreach ($rawBody as $pos) {
				$node_id = (int) $pos['id'];
				$position = new NodePosition();
				$position->x = (float)$pos['x'];
				$position->y = (float)$pos['y'];
				$position->node_id = $node_id;
				$u_nodes->positions[$node_id] = $position;
			}
			if($u_nodes->save() == false){
				return $this->sendStateResponse(false, 500, "MongoDB save failure");
			}
		}
		catch(Exception $e){
			error_log(sprintf("Error during saving nodes positions: %s", addslashes($e->getMessage())), 0);
			return $this->sendStateResponse(false, 500, "MongoDB save failure");
		}
		return $this->sendStateResponse(true);
	}
	/*
	 *  GET /Graph/fetchAllLinks
	 *  Fetch all links in graph, returns list of links between nodes
	 *  in JSON format where nodes specified by theirs graph id's
	 **/
	public function fetchAllLinksAction(){
		$this->view->setRenderLevel(View::LEVEL_NO_RENDER);
		$count = $this->_linksRepo->CountAllLinks();
		$links = $this->_linksRepo->GetAllByLastId(0, ($count * 2) + 1);
		$this->sendJsonResponse($links);
	}
}
