<?php
namespace NetAssist\Models;

/**
* Represents authentication token
*/
class AuthToken {
    /**
    * @var MongoDate Creation date
    */
    public $createDate;

    /**
    * @var string Salt
    */
    public $salt;

    /**
    * @var string Email used in auth token
    */
    public $email;

    /**
    * @var string Token value
    */
    public $value;

    /**
    * @var string IP address gained token
    */
    public $ip;

    /**
    * @var string UserAgent gained token
    */
    public $userAgent;
}
