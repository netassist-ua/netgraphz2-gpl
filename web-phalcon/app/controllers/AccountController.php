<?php
use Phalcon\Mvc\View;
use NetAssist\Forms\UserSignupForm;
use NetAssist\Forms\LoginForm;
use NetAssist\Models\Users;

/**
 * Account controller: handles user registration,
 * user database search and checks,
 * login and logout actions.
 */
class AccountController extends ControllerBase {
  /**
   *  Hooks executing before route executed.
   *  Handles sign up policy. Blocks page if open sign up disabled by configuration.
   *  @param \Phalcon\Mvc\Dispatcher  $dispatcher Phalcon MVC application dispatcher instance
   */
  public function beforeExecuteRoute($dispatcher){
    $di = $dispatcher->getDI();
    $config = $di->get('config');
    if($dispatcher->getActionName() == "signup" && !$config->information->openSignUp){
      return false;
    }
  }

  /**
   *  Search user in database by conditions and returns result if any user found
   *  @param array $conditions MongoDB conditions query to search in users collection
   *  @return boolean True if any user found by conditions query
   *
   */
  private function isUserFoundByConditions($conditions){
    if(!is_array($conditions)){
      throw new \Exception("First parameter should be conditions array");
    }
    $user = Users::findFirst(array(
      $conditions
    ));
    return $user != false;
  }

  /**
   *  Check if user with specified user name exists in the user database
   *  @param string $username User name to find
   *  @return bool True if user with such user name exists in database
   */
  private function isUsernameExists($username){
    return $this->isUserFoundByConditions(array(
      "login" => $username
    ));
  }

  /**
   *  Check if user with specified email exists in the user database
   *  @param string $email Email to check out
   *  @return bool True if user with such email address exists in database
   */
  private function isEmailExists($email){
    return $this->isUserFoundByConditions(array(
      "email" => $email
    ));
  }

  /**
   *  Handles user signup (registration) form show and saving
   */
  public function signupAction(){
    //Create a new for instance
    $form = new UserSignupForm();
    //Set form
    $this->view->form = $form;

    //FORM GET
    //If we are not posting a form, just return page with blank form
    if (!$this->request->isPost())
    {
      //no form to validate
      return;
    }

    //FORM SAVE
    //Check if form is valid, otherwise return form with errors
    if ($form->isValid($this->request->getPost()) != false)
    {
      //Create a new user
      $user = new Users();
      $user->setEmptyLoginState();

      //Set fields
      $user->login = $this->request->getPost('username', 'striptags');
      $user->email = $this->request->getPost('email');
      $user->password = $this->security->hash($this->request->getPost('password'));
      //Set view form
      $this->view->form = $form;

      //Check for username and email existance to avoid conflicts
      $saveConflict = false;
      if($this->isUsernameExists($user->name)){
        //Append flash error
        $this->flash->error("User name already exists!");
        //Append error to the username form field
        $this->appendFormFieldError('username', 'Such user name already exists');
        //Set conflicting state
        $saveConflict = true;
      }
      if($this->isEmailExists($user->email)){
        //Append flash error
        $this->flash->error("Email already exists!");
        //Append error to the email address form field
        $this->appendFormFieldError('email', 'Such email already registred!');
        //Set conflicting state
        $saveConflict = true;
      }

      //Set error if we have a conflicting user name or email address
      if ($saveConflict){
        $this->flash->error("Conflict detected");
        return;
      }

      //Try to save a user into database
      if ($user->save()) {
        return $this->response->redirect();
      }

      //Set page errors flash if we have database errors during save operation
      $this->flash->error($user->getMessages());
    }

  }

  /**
   * Performs user login and redirects to the main page.
   * Renders back form in case of login error.
   */
  public function loginAction(){

    //Create a new login form instance
    $form = new LoginForm();
    try {
      if (!$this->request->isPost()) {
        //Try to login using existing session token if we have remember me option
        if ($this->auth->hasRememberMe()) {
          return $this->auth->loginWithRememberMe();
        }
        //Just return form page otherwise
      } else {
        //Check if form is valid
        if ($form->isValid($this->request->getPost()) == false) {
          //Set error messages
          foreach ($form->getMessages() as $message) {
            $this->flash->error($message);
          }
        } else {
          //Check authentication, raise exception in case of authentication error
          $this->auth->check(array(
            'login' => $this->request->getPost('login'),
            'password' => $this->request->getPost('password'),
            'remember' => $this->request->getPost('remember')
          ));
          //Redirect user
          return $this->response->redirect();
        }
      }
    } catch (Exception $e) {
      //Set flash error messages in case of exception
      $this->flash->error($e->getMessage());
    }
    //Set view form
    $this->view->form = $form;
  }

  /**
   * Performs user logging out.
   * Redirects user to the main application page.
   */
  public function logoutAction(){
    //Remove authentication data and token
    $this->auth->remove();
    return $this->response->redirect();
  }
 
}

?>
