<?php
use Phalcon\Mvc\View;
use NetAssist\Forms\UserSignupForm;
use NetAssist\Models\Users;
/*
* Signup controller, user registration
*
*/
class SignupController extends ControllerBase {
  public function beforeExecuteRoute($dispatcher){
    $di = $dispatcher->getDI();
    $config = $di->get('config');
    if(!$config->information->openSignUp){
      return false;
    }

  }

  public function indexAction(){
    $form = new UserSignupForm();
    $this->view->form = $form;
    if (!$this->request->isPost())
    {
      return;
    }
    if ($form->isValid($this->request->getPost()) != false)
    {
      $user = new Users();
      $user->name = $this->request->getPost('username', 'striptags');
      $user->email = $this->request->getPost('email');
      $user->password = $this->security->hash($this->request->getPost('password'));
      $this->view->form = $form;
      $existing = Users::findFirst(
      array(
        array(
          "name" => $user->name
        )
      )
    );
    if($existing != null){
      $this->flash->error("User name already exists!");
      $username_msg = $this->view->form->getMessagesFor('username');
      $username_msg->appendMessage(new \Phalcon\Validation\Message("User name already exists!"));
      return;
    }
    if ($user->save()) {
      return $this->response->redirect();
    }
    $this->flash->error($user->getMessages());
  }
}

}

?>
