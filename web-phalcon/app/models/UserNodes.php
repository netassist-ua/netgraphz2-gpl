<?php
namespace NetAssist\Models;

use Phalcon\Mvc\Collection;

class UserNodes extends Collection {
    public function beforeSave()
    {
      if(strlen($this->uid) == 0)
        return false;
    }

}
?>
