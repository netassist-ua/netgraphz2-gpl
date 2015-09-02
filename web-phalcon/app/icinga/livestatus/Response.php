<?php
  namespace NetAssist\Icinga\LiveStatus;

  /**
  * Represents LiveStatus response
  * @property_read int $code Status code
  * @property_read string $body Response raw body
  **/
  class Response {
    /**
    * @var int Status code
    **/
    protected $_code;

    /**
    * @var string Raw body
    **/
    protected $_body;


    /**
    * __get magic method
    * @param string $property Name of property accessed
    * @return mixed Accessed property or null
    **/
    public function __get($property) {
        switch($property){
          case "code":
            return $this->_code;
          case "body":
            return $this->_body;
           default:
            if(property_exists($this, $property))
                   return $this->$property;
            else return null;
        }
    }

    /**
    * Constructor
    * @param int $code Status code
    * @param string $body Response raw body
    **/

    public function __construct($code, $body){
        $this->_code = $code;
        $this->_body = $body;
    }


  }
