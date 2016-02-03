<?php
/*
*  LinksController
*  Handles /Links requests: getting nodes, tracing links.
*/

use Phalcon\Mvc\View;
use NetAssist\Graph;


class LinksController extends ControllerBase {
  /**
  * Nodes repository
  * @var \NetAssist\Graph\Repositories\Interfaces\INodesRepository
  */
  protected $_linksRepo;

  public function initialize() {
    $this->_linksRepo = $this->di->get('graphLinksRepository');
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
    $node = $this->_linksRepo->GetById($id);
    if($node == null){
      return $this->sendJsonResponse([
        'status' => 'Not found',
        'code' => 404,
        'id' => $id
      ], 404);
    }
    $this->sendJsonResponse($node);
  }

  public function getAllFromIdAction($id, $take) {
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);
    $id = intval($id);
    $take = intval($take);
    $nodes = $this->_linksRepo->GetAllByLastId($id, $take);
    $this->sendJsonResponse($nodes);
  }


  public function countAction(){
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);
    $count = $this->_linksRepo->CountAllLinks();
    $this->sendJsonResponse([ "count" => $count ]);
  }

}

?>
