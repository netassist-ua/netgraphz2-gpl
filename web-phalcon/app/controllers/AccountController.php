<?php
use Phalcon\Mvc\View;
use NetAssist\Forms\UserSignupForm;
use NetAssist\Forms\LoginForm;
use NetAssist\Models\Users;
/*
* Signup controller: user registration
*
*/
class AccountController extends ControllerBase {
  public function beforeExecuteRoute($dispatcher){
    $di = $dispatcher->getDI();
    $config = $di->get('config');
    if(!$config->information->openSignUp){
      return false;
    }
  }

  private function isUserFoundByConditions($conditions){
    if(!is_array($conditions)){
      throw new \Exception("First parameter should be conditions array");
    }
    $user = Users::findFirst(array(
      $conditions
    ));
    return $user != false;
  }

  private function getUserByLogin($username){
    return Users::findFirst(array(
      array(
        "name" => $username
      )
    ));
  }

  private function isUsernameExists($username){
    return $this->isUserFoundByConditions(array(
      "name" => $username
    ));
  }

  private function isEmailExists($email){
    return $this->isUserFoundByConditions(array(
      "email" => $email
    ));
  }

  public function signupAction(){
    $form = new UserSignupForm();
    $this->view->form = $form;
    if (!$this->request->isPost())
    {
      //no form to validate
      return;
    }
    if ($form->isValid($this->request->getPost()) != false)
    {
      $user = new Users();
      $user->setEmptyLoginState();
      $user->login = $this->request->getPost('username', 'striptags');
      $user->email = $this->request->getPost('email');
      $user->password = $this->security->hash($this->request->getPost('password'));
      $this->view->form = $form;
      $saveConflict = false;
      if($this->isUsernameExists($user->name)){
        $this->flash->error("User name already exists!");
        $this->appendFormFieldError('username', 'Such user name already exists');
        $saveConflict = true;
      }
      if($this->isEmailExists($user->email)){
        $this->flash->error("Email already exists!");
        $this->appendFormFieldError('email', 'Such email already registred!');
        $saveConflict = true;
      }
      if ($saveConflict){
        $this->flash->error("Conflict detected");
        return;
      }
      if ($user->save()) {
        return $this->response->redirect();
      }
      $this->flash->error($user->getMessages());
    }
  }

  /**
  * Performs user login
  */
  public function loginAction(){
    $form = new LoginForm();
    try {
        if (!$this->request->isPost()) {
            if ($this->auth->hasRememberMe()) {
                return $this->auth->loginWithRememberMe();
            }
        } else {
            if ($form->isValid($this->request->getPost()) == false) {
                foreach ($form->getMessages() as $message) {
                    $this->flash->error($message);
                }
            } else {
                $this->auth->check(array(
                    'login' => $this->request->getPost('login'),
                    'password' => $this->request->getPost('password'),
                    'remember' => $this->request->getPost('remember')
                ));
                return $this->response->redirect();
            }
        }
    } catch (Exception $e) {
        $this->flash->error($e->getMessage());
    }
    $this->view->form = $form;
  }

  /**
  * Performs user logging out
  */
  public function logoutAction(){
    $this->auth->remove();
    return $this->response->redirect();
  }


}

?>
