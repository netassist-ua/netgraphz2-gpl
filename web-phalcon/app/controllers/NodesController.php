<?php
/*
*  NodesController
*  Handles /Nodes requests: getting nodes, finding nodes.
*/

use Phalcon\Mvc\View;
use NetAssist\Graph;


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
    try {
      $status = $this->_hostStatusService->GetHostStatusByName($node->icinga_name);
      $node->status = $status;
    }
    catch(Exception $e) {
      error_log(sprintf("Error during connecting LiveStatus: %s", addslashes($e->getMessage())), 0);
    }
    $this->sendJsonResponse($node);
  }

  public function getAllFromIdAction($id, $take) {
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);
    $id = intval($id);
    $take = intval($take);
    $nodes = $this->_nodesRepo->GetAllByLastId($id, $take);
    $nodes = $this->getIcingaStatus($nodes);
    $this->sendJsonResponse($nodes);
  }

  public function getAllAction($skip, $take){
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);
    $skip = intval($skip);
    $take = intval($take);
    $nodes = $this->_nodesRepo->GetAll($skip, $take);
    $nodes = $this->getIcingaStatus($nodes);
    $this->sendJsonResponse($nodes);
  }


  public function countAction(){
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);
    $count = $this->_nodesRepo->CountAllNodes();
    $this->sendJsonResponse([ "count" => $count ]);
  }

}

?>
