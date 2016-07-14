<?php

namespace NetAssist\Controllers;

use Phalcon\Mvc\View;
use NetAssist\Graph;
use NetAssist\Models\Users;
use NetAssist\Models\UserNodes;
use NetAssist\Models\NodePosition;

/**
 *  Graph controller
 *  Handles /Graph url requests: getting nodes, finding links, finding nodes.
 */
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

  /**
   *  Peforms graph controller initialization
   */
  public function initialize() {
    //resolve nodes repository from DI container
    $this->_nodesRepo = $this->di->get('graphNodesRepository');
    //resolve links repository from DI container
    $this->_linksRepo = $this->di->get('graphLinksRepository');
    //initialize base netgraphz2 controller
    parent::initialize();
  }

  /**
   *  Returns parameters response JSON array.
   *
   *  @param boolean      $logged_in          Is user logged in.
   *  @param boolean      $has_positions      Checks if user have positions stored.
   *  @param array|null   $parameters         User parameters associative array.
   *  @param boolean      $error              Flag that application encounted an error.
   *  @param string|null  $error_message      Application error message.
   *  @return array Parameters response array.
   */
  private function getParamsResponseJson($logged_in, $has_positions, $parameters = null, $error = false, $error_message = null){
    if(!isset($parameters) || $parameters == null)
      $parameters = array();
    return array(
      "logged" => $logged_in,
      "positions" => $has_positions,
      "params" => $parameters,
      "error" => $error,
      "error_message" => $error_message
    );
  }

  /**
   * Sends JSON state response to the client, sets HTTP error code.
   *
   * JSON format:
   * `{  
   *    state:  $state,
   *    error:  $error
   *  }`
   *
   * @param int|boolean $state State number or success-fail value
   * @param int|null $error_code HTTP error code to send (200 by default)
   * @param string|null $error Error description to send
   * @return void 
   */
  private function sendStateResponse($state, $error_code = 200, $error = null){
    $base = array(
      "state" => $state
    );
    //set an error if we have any
    if($error != null){
      $base["error"] = $error;
    }
    return $this->sendJsonResponse($base, $error_code);
  }


  /**
   * GET /Graph/status
   *
   * Get application status JSON containing status of application and counts of nodes, links.
   * JSON format: 
   * `{ 
   *    works: true/false,
   *    counts: {
   *        nodes: n_nodes,
   *        links: n_links
   *    }
   *  }`
   * @return void
   */
  public function getStatusAction(){
    //disable view rendering
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);
    //get nodes count
    $node_count = $this->_nodesRepo->CountAllNodes();
    //get links count
    $link_count = ceil($this->_linksRepo->CountAllLinks() / 2);
    //send JSON status response
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
   * Delete stored use nodes positions.
   * Renders JSON boolean (`{true}`/`{false}`) result representing if position delete request executed successfuly.
   *
   * Sets HTTP error code in case of internal errors.
   *
   * *  417 - User is not logged in, application should redirect user to the login page
   * *  500 - Internal server error 
   */
  public function deletePositionsAction(){
    //disable view rendering, we rendering JSON instead of HTML
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);

    //get logged user information
    $identity = $this->auth->getIdentity();
    if($identity == false){
      //user is not logged in, render JSON false, set HTTP 417
      return $this->sendStateResponse(false, 417, "Not logged in");
    }
    try {
      //get user identifier
      $uid = $this->auth->getUserId();
      $user = Users::findById($uid);

      if($user == false){
        //user is not logged in, render http 417
        return $this->sendStateResponse(false, 417, "Not logged in");
      }
      
      //get user nodes positioning record
      $u_nodes = UserNodes::findFirst(array(
        array(
          "uid" => $uid
        )
      ));
      
      //delete user nodes positioning record
      //check if we have saved positioning
      if($u_nodes != false) {
        if($u_nodes->delete() == false) {
          //we have an error deleting positions, render http 500
          return $this->sendStateResponse(false, 500, sprintf("User positions not deleted"));
        }
      }

    }
    catch(Exception $e) {
      //we have exception, render error reponse with http 500
      error_log(sprintf("Error during deleting user positions: %s", addslashes($e->getMessage())), 0);
      return $this->sendStateResponse(false, 500, sprintf("User positions not deleted"));
    }

    //all done, render success status
    return $this->sendStateResponse(true);
  }

  /**
   * GET /Graph/userParams
   * Get logged user parameters JSON
   */
  public function getUserParametersAction(){
    $logged_in = false;
    //disable view rendering, we rendering JSON instead of HTML
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);
    try {
      //get user identity
      $identity = $this->auth->getIdentity();
      if(!$identity){
        //user is not logged in, so no saved positions available
        return $this->sendJsonResponse($this->getParamsResponseJson($logged_in, false));
      }

      //get user identifier
      $uid = $this->auth->getUserId();
      //get user data record
      $user = (object)Users::findById($uid);
      //get user parameters from the record object if we have one, otherwise send an empty array
      $params = property_exists($user, "params") ? $user->params : array();

      if($user == false){
        //can't find user, so user (probably?, bug?) is not logged in. Send information about it.
        return $this->sendJsonResponse($this->getParamsResponseJson($logged_in, false));
      }
      $logged_in = true;

      //try to get user positions record
      $u_nodes = (object)UserNodes::findFirst(array(
        array(
          "uid" => $uid
        )
      ));

      //check if we have saved positions
      if(!$u_nodes || !property_exists($u_nodes, "positions")){
        //no positions saved
        //send JSON response: tell that user logged in, but have no stored positions
        return $this->sendJsonResponse($this->getParamsResponseJson($logged_in, false, $params));
      }

      //user is logged in
      return $this->sendJsonResponse($this->getParamsResponseJson($logged_in, true, $params));
    }
    catch (Exception $e){
      //we have an exception, log error
      error_log(sprintf("Error during fetching user parameters: %s", addslashes($e->getMessage())), 0);
      //send response containing error, so application should warn user
      return $this->sendJsonResponse($this->getParamsResponseJson($logged_in, false, null, true, addslashes($e->getMessage())));
    }
  }


  /**
   * POST  /Graph/Positions
   * Save user node positions
   */
  public function savePositionsAction(){
    //disable view rendering, we rendering JSON instead of HTML
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);

    //Get user identity
    $identity = $this->auth->getIdentity();
    if(!$identity){
      //If user is not logged in, send HTTP 417
      return $this->response->setStatusCode(417, "User is not logged in");
    }
    try {
      //get user identitiy
      $uid = $this->auth->getUserId();

      //get MongoDate object for current time
      $m_now = new \MongoDate(time());

      //fetch user record
      $user = Users::findById($uid);
      if($user == false){
        //user record not found, send HTTP 403
        return $this->response->setStatusCode(403, "User not found");
      }

      //fetch user saved nodes positions
      $u_nodes = UserNodes::findFirst(array(
        array(
          "uid" => $uid
        )
      ));
      if( $u_nodes == false ){
        //nothing exists yet, add new
        $u_nodes = new UserNodes(); 
        $u_nodes->uid = $uid;
      }

      //update modification time
      $u_nodes->lastModified = $m_now;

      //read JSON from request data
      $rawBody = $this->request->getJsonRawBody(true);
      //iterate over expected array
      foreach ($rawBody as $pos) {
        //save node position
        $node_id = (int) $pos['id'];
        $position = new NodePosition();
        //save coordinates
        $position->x = (float)$pos['x'];
        $position->y = (float)$pos['y'];
        $position->node_id = $node_id;
        $u_nodes->positions[$node_id] = $position;
      }

      //save data to the database
      if($u_nodes->save() == false){
        //we have an error, send http 500
        return $this->sendStateResponse(false, 500, "MongoDB save failure");
      }
    }
    catch(Exception $e){
      //we have an exception error, send http 500, log error
      error_log(sprintf("Error during saving nodes positions: %s", addslashes($e->getMessage())), 0);
      return $this->sendStateResponse(false, 500, "MongoDB save failure");
    }
    //success
    return $this->sendStateResponse(true);
  }

  /*
   *  GET /Graph/fetchAllLinks
   *  Fetch all links in graph (whole), returns list of links between nodes
   *  in JSON format where nodes specified by theirs graph id's.
   *
   *  Renders array of \NetAssist\Graph\Link into JSON and sends response to the client.
  */
  public function fetchAllLinksAction(){
    //disable view rendering, we render JSON instead
    $this->view->setRenderLevel(View::LEVEL_NO_RENDER);

    //get all available links from repository, first estimate count
    $count = $this->_linksRepo->CountAllLinks();
    $links = $this->_linksRepo->GetAllByLastId(0, ($count * 2) + 1);

    //serialize links as JSON
    $this->sendJsonResponse($links);
  }
}
