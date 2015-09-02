<?php
/*
*  GraphController
*  Handles /Graph url requests: getting nodes, finding links, finding nodes.
*/

use Phalcon\Mvc\View;
use NetAssist\Graph;

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

  /*
  *   GET /Graph/fetchAllNodes
  *   Fetch all nodes in graph, returns list of nodes with parameters in JSON
  */

  public function fetchAllNodesAction(){
    $hostsByIcinga = array();
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);
    $nodes = $this->_nodesRepo->FetchAllNodes(false); 
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
