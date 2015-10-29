<?php
namespace NetAssist\Models;

use Phalcon\Mvc\Collection;
use Phalcon\Mvc\Model\Validator\Email as EmailValidator;

/**
* MongoDB users documents model
*/
class Users extends Collection {
  /**
  * @var  \MongoId Object identifier
  */
  public $_id;

  /**
  * @var string User login
  */
  public $login;

  /**
  * @var string Hashed user password
  */
  public $password;

  /**
  * @var string User email
  */
  public $email;

  /**
  * @var MongoDate Last user login
  */
  public $lastLoginDate;

  /**
  * @var MongoDate Failed login attempt window start
  */
  public $failedLoginWindowStartDate;

  /**
  * @var MongoDate Last failed login attempt date
  */
  public $failedLoginLastDate;

  /**
  * @var int Failed login attempts
  */
  public $failedLoginAttempts;

  /**
  * @var bool Fail login temporary block
  */
  public $failedLoginBlock;

  /**
  * @var bool User blocked flag
  */
  public $blocked;

  /**
  * @var bool User inactive inactive
  */
  public $inactive;

  /**
  * @var \NetAssist\Models\AuthToken[] Authentication tokens
  */
  public $tokens;


  /**
  *   Set's empty login state (not blocked, not logged before)
  **/
  public function setEmptyLoginState(){
    $this->lastLoginDate =  null;
    $this->failedLoginLastDate = null;
    $this->failedLoginBlock = false;
    $this->blocked = false;
    $this->inactive = false;
    $this->tokens = array();
  }

  public function initialize(){
  }

  /**
  * Performs validation before saving user into MongoDB
  * @return bool Validation result
  */
  public function validation()
  {
    $this->validate(new EmailValidator(array(
      'field' => 'email'
    )));
    if ($this->validationHasFailed() == true) {
      return false;
    }

    return true;
  }

  /**
  * Returns MongoDB collection name for users
  * @return string Collection name
  */
  public function getSource()
  {
    return "ng_users";
  }

}
