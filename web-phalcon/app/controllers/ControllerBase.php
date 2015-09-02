<?php

use Phalcon\Mvc\Controller;

class ControllerBase extends Controller
{
  /**
  * Host status service
  * Used to determine host status (up/down/loss)
  * @var \NetAssist\Graph\Services\IHostStatusService
  */
  protected $_hostStatusService;

  public function initialize(){
      $this->_hostStatusService = $this->di->get('hostStatusService');
  }

  public function beforeExecuteRoute($dispatcher)
  {
        $di = $dispatcher->getDI();
        $config = $di->get('config');
        $this->tag->setTitle(sprintf("[%s] NetGraphz2", $config->information->companyName));
  }

  protected function sendJsonResponse($json, $code = 200){
      $this->response->setStatusCode($code);
      $this->response->setJsonContent($json);
      $this->response->setContentType('application/json');
      $this->response->send();
  }


  protected function getIcingaStatus( $nodes )
  {
    $names = array();
    foreach ($nodes as $node) {
      if($node->icinga_name != null){
        array_push($names, $node->icinga_name);
        $hostsByIcinga[$node->icinga_name] = $node;
      }
    }
    try {
      $status_array = $this->_hostStatusService->GetHostsStatusByNames($names);
      foreach($status_array as $status){
        $hostsByIcinga[$status->name]->status = $status;
      }
    }
    catch(Exception $e) {
      error_log(sprintf("Error during connecting LiveStatus: %s", addslashes($e->getMessage())), 0);
    }
    return $nodes;
  }

}
