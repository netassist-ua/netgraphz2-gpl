<?php
namespace NetAssist\Forms;
use Phalcon\Forms\Form;
use Phalcon\Forms\Element\Text;
use Phalcon\Forms\Element\Password;
use Phalcon\Forms\Element\Hidden;
use Phalcon\Forms\Element\Submit;
use Phalcon\Forms\Element\Check;
use Phalcon\Validation\Validator\PresenceOf;
use Phalcon\Validation\Validator\Identical;

/**
* Login form
*/
class LoginForm extends Form {

  public function initialize(){
      //username
      $username = new Text('login');
      $username->setLabel('Login');
      $username->addValidator(new PresenceOf(
          array(
            "message" => "Login required"
          )
      ));
      $username->setAttributes(array(
          'id' => 'login-username',
          'class' => 'form-control',
          'placeholder' => 'username'
      ));
      $this->add($username);

      //password
      $password = new Password('password');
      $password->setLabel('Password');
      $password->addValidator(new PresenceOf(
          array(
              "message" => "Password required"
          )
      ));
      $password->setAttributes(array(
          'id' => 'login-password',
          'class' => 'form-control',
          'placeholder' => 'password'
      ));
      $password->clear();
      $this->add($password);

      //remember me
      $remember = new Check('remember', array(
          "value" => '1',
          "id" => "login-remember"
      ));
      $remember->setLabel('Remember me');
      $this->add($remember);

      //CSRF
      $csrf = new Hidden('csrf');
      $csrf->addValidator(
             new Identical([
             $this->security->checkToken() => 1,
             'message' => 'This request was aborted because it appears to be forged'
      ]));
      $this->add($csrf);

      //Submit
      $this->add(new Submit('Sign In', array(
          'class' => 'btn btn-success',
          'id' => 'btn-login'
      )));
  }

}
