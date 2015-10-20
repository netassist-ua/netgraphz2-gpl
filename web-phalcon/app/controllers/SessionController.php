<?php
  use Phalcon\Mvc\View;
  use NetAssist\Models\Users;

  class SessionController extends ControllerBase {

    public function startAction(){
      if ($this->request->isPost()){
        $login = $this->request->getPost('login');
        $password = $this->request->getPost('password');
        $user = Users::findFirst(
          array(
            'conditions' => array(
                'login' => $login,
                'active' => true
            )
          )
        );
        if ($user != false) {
            if($this->security->checkHash($password, $user->password)){
            $this->_registerSession($user);
            $this->flash->success('Welcome');
            $this->dispatcher->forward(
              array(
                'controller' => 'index',
                'action' => 'index'
              )
            );
          }
        }
        $this->flash->error('Wrong email/password');
      }
      return $this->dispatcher->forward(
        array(
            'controller' => 'session',
            'action' => 'index'
        )
      );
    }

    public function indexAction(){

    }

  }
?>
