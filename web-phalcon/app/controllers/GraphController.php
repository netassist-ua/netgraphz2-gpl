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

  private function sendStateReponse(bool $state, int $error_code, string $error){
      $base = array(
          "state" => $state
      );
      if(isset($error)){
          $base["error"] = $error;
      }
      if(isset($error_code)){
          $base["error_code"] = $error_code;
      }
      else {
        $error_code = 200;
      }
      $this->sendJsonResponse($base, $error_code);
      return $state;
  }

  private function appendUserPositions($nodes){
      $identity = $this->auth->getIdentity();
      if(!$identity || $identity == null){
          return $nodes;
      }
      $uid = $this->auth->getUserId();
      $u_nodes = UserNodes::findFirst(array(
        array(
            "userId" => $uid
        )
      ));
      if($u_nodes == null){
          return $nodes;
      }
      try {
        foreach ($nodes as $node) {
            if(array_key_exists($node->id, $u_nodes->positions)){
              $pos = (object)$u_nodes->positions[$node->id];
              $node->x = $pos->x;
              $node->y = $pos->y;
            }
        }
      }
      catch(Exception $e) {

      }
      return $nodes;
  }

  /**
  * GET /Graph/status
  *
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
  *
  */
  public function deletePositionsAction(){
      $this->view->setRenderLevel(View::LEVEL_NO_RENDER);
      $identity = $this->auth->getIdentity();
      if(!$identity){
          return $this->sendStateReponse(false, 417, "Not logged in");
      }
      $uid = $this->auth->getUserId();
      $m_now = new \MongoDate(time());
      $user = Users::findById($uid);
      if($user != false){
          return $this->sendStateReponse(false, 417, "Not logged in");
      }
      $u_nodes = UserNodes::findFirst(array(
          array(
              "userId" => $uid
          )
      ));
      if($u_nodes != false){
          if($u_nodes->delete() == false){
              return $this->sendStateReponse(false, 500, sprintf("User positions not deleted"));
          }
      }
      return $this->sendStateReponse(true);
  }

  /**
  * GET   /Graph/userParams
  */
  public function getUserParametersAction(){
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);
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
            "userId" => $uid
        )
    ));
    if(!$u_nodes || !property_exists($u_nodes, "positions")){
        return $this->sendJsonResponse($this->getParamsResponseJson(true, false));
    }
    return $this->sendJsonResponse($this->getParamsResponseJson(true, true, $params));
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
  private function getParamsResponseJson($logged_in, $has_positions, $params = null){
      if(!isset($params) || $params == null)
        $params = array();
      return array(
          "logged" => $logged_in,
          "positions" => $has_positions,
          "params" => $params
      );
  }



  /**
  * POST  /Graph/Positions
  */
  public function savePositionsAction(){
      $this->view->setRenderLevel(View::LEVEL_NO_RENDER);
      $identity = $this->auth->getIdentity();
      if(!$identity){
        return $this->response->setStatusCode(417, "User is not logged in");
      }
      $uid = $this->auth->getUserId();
      $m_now = new \MongoDate(time());
      $user = Users::findById($uid);
      if($user == false){
        return $this->response->setStatusCode(403, "User not found");
      }
      $u_nodes = UserNodes::findFirst(array(
        array(
            "userId" => $uid
          )
      ));
      if( $u_nodes == false ){
          $u_nodes = new UserNodes();
          $u_nodes->userId = $uid;
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
      $u_nodes->save();
      return $this->sendStateReponse(true);
  }

  /*
  *   GET /Graph/fetchAllNodes
  *   Fetch all nodes in graph, returns list of nodes with parameters in JSON
  */
  public function fetchAllNodesAction(){
    $hostsByIcinga = array();
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);
    $nodes = $this->_nodesRepo->FetchAllNodes(false);
    $nodes = $this->appendUserPositions($nodes);
    $nodes = $this->getIcingaStatus($nodes);
    $this->sendJsonResponse($nodes);
  }

  /*
  *   GET /Graph/fetchAllLinks
  *   Fetch all links in graph, returns list of links between nodes
  *   in JSON format where nodes specified by theirs graph id's
  */
  public function fetchAllLinksAction(){
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);
    $links = $this->_linksRepo->FetchAllLinks();
    $this->sendJsonResponse($links);
  }


}
