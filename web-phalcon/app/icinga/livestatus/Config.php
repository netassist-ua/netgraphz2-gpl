<?php

namespace NetAssist\Icinga\LiveStatus;

  /**
  *  Icinga 2 monitoring binding
  *  Live status client configuration
  **/

  class Config {

    /**
    * @var string Host address of LiveStatus
    **/
    public $host;

    /**
    * @var int Port of LiveStatus
    **/
    public $port;

    /**
    * @var bool Use aunthorization
    **/
    public $use_auth;

    /**
    * @var string Authorization user
    **/
    public $auth_user;

    /**
    * @var bool User Unix socket
    **/
    public $use_unix_socket;

    /**
    * @var bool KeepAlive
    **/
    public $keepAlive;

    /**
    * @var bool use Unix socket
    */
    public $unix_socket_path;

    /**
    *  Constructor
    *
    **/
    public function __construct(){
      $this->use_unix_socket = false;
      $this->keepAlive = false;

    }

  }

?>
