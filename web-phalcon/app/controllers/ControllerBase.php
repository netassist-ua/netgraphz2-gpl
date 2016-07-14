<?php

namespace NetAssist\Controllers;
use Phalcon\Mvc\Controller;

/**
 *  Base NetGraphz2 controller.
 *  Contains methods used by all controllers as common.
 */
class ControllerBase extends Controller
{
  /**
   * Appends error message to the form field.
   *
   * @param string $field Name of form field
   * @param string $error_message Message to append
   * @param \Phalcon\Forms\Form|null $form Form to append, use current view form if null
   * @return void
   */
  public function appendFormFieldError($field, $error_message, $form=null){
    if($form == null){
      //set current view form if other one wasn't provided as function parameter
      $form = $this->view->form;
    }
    //get messages for field
    $msg_group = $form->getMessagesFor($field);
    //append message
    $msg_group->appendMessage(new \Phalcon\Validation\Message($error_message));
  }

  /**
   *  Initializes NetGraphz2 base controller parameters like title, etc.
   *  @return void 
   */
  public function initialize(){
    //get configuration
    $config = $this->di->get('config');
    //set page title
    $this->tag->setTitle(sprintf("[%s] %s", $config->information->companyName, $config->information->siteName));
  }

  /**
   *  Executes before executing any route.
   *
   *  Check user stored identity information, 'remember me' option and login user back if session expired.
   *  @param \Phalcon\Mvc\Dispatcher $dispatcher Phalcon application dispatcher instance.
   *  @return void
   */
  public function beforeExecuteRoute($dispatcher)
  {
    //get stored identity information
    $identity = $this->auth->getIdentity();
    if (!is_array($identity) &&
      $this->cookies->has('RMT') &&
      $this->cookies->has('RMU')) {

      //reauthenticate user if we have remeber me option enabled
      $this->auth->loginWithRememberMe();

      return false;
    }
  }

  /**
   *  Register user login data for current session.
   *  @param \NetAssist\Models\Users $user User to set authentication
   *  @return void
   */
  protected function _registerSession($user)
  {
    $this->session->set(
      'auth',
      array(
        'id'   => $user->_id,
        'name' => $user->login
      )
    );
  }

  /**
   *  Send JSON response with HTTP status code.
   *  @param mixed $json Object or array to be sent in JSON response
   *  @param int $code HTTP status code to be sent
   *  @return void
   */
  protected function sendJsonResponse($json, $code = 200){
    //set HTTP status code
    $this->response->setStatusCode($code);
    //serialize JSON and send as result
    $this->response->setJsonContent($json);
    //set header content type
    $this->response->setContentType('application/json');
    //finish and send response to the client
    $this->response->send();
  }

}

