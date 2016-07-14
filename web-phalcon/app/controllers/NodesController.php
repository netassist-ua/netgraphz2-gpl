<?php

namespace NetAssist\Controllers;

use Phalcon\Mvc\View;
use NetAssist\Graph;
use NetAssist\Models\Users;
use NetAssist\Models\UserNodes;
use NetAssist\Models\NodePosition;

use \Exception;
use \MongoDate;

/**
 *  Nodes controller.
 *  Handles /Nodes requests: getting nodes, finding nodes.
 */
class NodesController extends ControllerBase {
  /**
   * Nodes repository
   * @var \NetAssist\Graph\Repositories\Interfaces\INodesRepository
   */
  protected $_nodesRepo;

  /**
   *  Initialize controller
   */
  public function initialize() {
    $this->_nodesRepo = $this->di->get('graphNodesRepository');
    parent::initialize();
  }

  /**
   *  HTTP GET handler for /Nodes/Get/
   *  Get a graph node by identifier.
   *
   *  Renders \NetAssist\Graph\Node into JSON or sends JSON status response with HTTP status code.
   *
   *  @param int $id Identifier of graph node to render
   */
  public function getAction($id){
    $id = intval($id);

    //disable view rendering, we render JSON 
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);

    //get node from repository by identifier
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
   * Appends stored position coordinates (x,y) from user profile to nodes.
   * Return original array if no positions stored or user is not logged in.
   *
   * @param \NetAssist\Graph\Nodes[] Nodes to append
   * @return \NetAssist\Graph\Nodes[] Nodes with appended positions
   */
  private function appendUserPositions($nodes){
    try {
      //get user identity information
      $identity = $this->auth->getIdentity();
      if(!$identity || $identity == null){
        //if user is not logged in
        return $nodes;
      }

      //get user identifier
      $uid = $this->auth->getUserId();

      //get users saved nodes positions
      $u_nodes = UserNodes::findFirst(array(
        array(
          "uid" => $uid
        )
      ));
      if($u_nodes == null){
        //nothing found, return nodes
        return $nodes;
      }

      //read nodes positions
      foreach ($nodes as $node) {
        if(array_key_exists($node->id, $u_nodes->positions)){
          $pos = (object)$u_nodes->positions[$node->id];
          $node->x = $pos->x;
          $node->y = $pos->y;
        }
      }
    }
    catch(Exception $e) {
      //log an exception error
      error_log(sprintf("Couldn't fetch user graph position, error: %s", addslashes($e->getMessage())), 0);
    }
    return $nodes;
  }

  /**
   *  Handles HTTP GET /Nodes/GetAllFrom/ requests.
   *  Get requested ammount of graph links since specified identifier.
   *
   *  Renders array of \NetAssist\Graph\Nodes into JSON.
   *  @param int  $id   Identifier to start fetching from
   *  @param int  $take Ammount of links to get
   */
  public function getAllFromIdAction($id, $take) {
    //disable view rendering, we render JSON 
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);

    $id = intval($id);
    $take = intval($take);

    //get nodes from repository
    $nodes = $this->_nodesRepo->GetAllByLastId($id, $take);

    //append positions
    $nodes = $this->appendUserPositions($nodes);

    //send nodes as JSON
    $this->sendJsonResponse($nodes);
  }
  /**
   *  Handles HTTP GET  /Nodes/Count requests.
   *  Get available nodes count.
   *
   *  Renders JSON response in following format:
   *  `{
   *      count: count
   *   }`
   */
  public function countAction(){
    //disable view rendering, we render JSON 
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);

    //get count from repository
    $count = $this->_nodesRepo->CountAllNodes();

    $this->sendJsonResponse([ "count" => $count ]);
  }

}

?>
