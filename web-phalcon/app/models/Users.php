<?php
namespace NetAssist\Models;

use Phalcon\Mvc\Collection;
use Phalcon\Mvc\Model\Validator\Email as EmailValidator;

/**
* MongoDB users documents model
*/
class Users extends Collection {

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
?>
