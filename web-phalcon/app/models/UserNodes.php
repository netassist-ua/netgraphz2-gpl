<?php
namespace NetAssist\Models;

use Phalcon\Mvc\Collection;

class UserNodes extends Collection {
    /**
    * @var \MongoId Object identifier
    */
    public $_id;

    /**
    * @var \MongoDate Last modified date
    */
    public $lastModified;

    /**
    *   @var \MongoId User identifier
    */
    public $uid;

    /**
    *   @var \NetAssist\Models\NodePosition[] User node positions
    */
    public $positions;



    public function beforeSave()
    {
      if(isset($this->uid) == 0)
        return false;
    }

    public function getSource()
    {
      return "ng_user_nodes";
    }

}
