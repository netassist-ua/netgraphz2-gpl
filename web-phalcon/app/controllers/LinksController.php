<?php
namespace NetAssist\Controllers;
use Phalcon\Mvc\View;
use NetAssist\Graph;

/**
*  Links controller
*  Handles /Links/ requests: getting links, tracing links.
*/
class LinksController extends ControllerBase {
  /**
  * Nodes repository
  * @var \NetAssist\Graph\Repositories\Interfaces\INodesRepository
  */
  protected $_linksRepo;

  /**
   *  Initializes controller.
   */
  public function initialize() {
    //resolve links repository from DI container
    $this->_linksRepo = $this->di->get('graphLinksRepository');
    parent::initialize();
  }

  /**
  *  Handles HTTP GET /Links/Get/ requests.
  *  Get graph link by identifier.
  *
  *  Renders \NetAssist\Graph\Link into JSON or sends JSON state response (with HTTP code) in case of error.
  *  @param int $id Identifier of graph node
  */
  public function getAction($id){
    $id = intval($id);

    //disable view rendering, we render JSON
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);

    //get link from repository by id
    $link = $this->_linksRepo->GetById($id);

    if($link == null){
      //if node not found, send HTTP 404 and JSON response
      return $this->sendJsonResponse([
        'status' => 'Not found',
        'code' => 404,
        'id' => $id
      ], 404);
    }

    //send link as JSON
    $this->sendJsonResponse($link);
  }

  /**
   *  Handles HTTP GET /Links/GetAllFrom/ requests.
   *  Get requested ammount of graph links since specified identifier.
   *
   *  Renders array of \NetAssist\Graph\Link into JSON.
   *  @param int  $id   Identifier to start fetching from
   *  @param int  $take Ammount of links to get
   */
  public function getAllFromIdAction($id, $take) {
    //disable view rendering, we render JSON
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);

    $id = intval($id);
    $take = intval($take);

    //get $take links from specific identifier $id
    $links = $this->_linksRepo->GetAllByLastId($id, $take);

    //send links as JSON
    $this->sendJsonResponse($links);
  }

  /**
   *  Handles HTTP GET  /Links/Count requests.
   *  Get available links count.
   *
   *  Renders JSON response in following format:
   *  `{
   *      count: count
   *   }`
   */
  public function countAction(){
    //disable view rendering, we render JSON
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);

    //get links count
    $count = $this->_linksRepo->CountAllLinks();

    $this->sendJsonResponse([ "count" => $count ]);
  }

}

?>
