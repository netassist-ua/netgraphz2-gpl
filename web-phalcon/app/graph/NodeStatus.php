<?php
  namespace NetAssist\Graph;

 /**
 *  Represents aspect of status
 * @property_read \NetAssist\Graph\NodeState $state State of node
 * @property_read string $name Name of host
 **/
  class NodeStatus {
      /**
      * @var \NetAssist\Graph\NodeState State
      **/
      protected $_state;

      /**
      * @var string Name of host
      **/
      protected $_name;

      /**
      * @var float Packet loss (from 0 to 1)
      **/
      protected $_packet_loss;

      /**
      * @var float average RTT in milliseconds
      **/
      protected $_avg_rtt_ms;

      /**
      * @var bool Duplicates
      **/
      protected $_dup;

      //TODO: add other fields

      /**
      * Constructor
      * @param \NetAssist\Graph\NodeState $state state
      * @param string $name Host name
      * @param float $artt Average RTT
      * @param float $packet_loss Packet loss (from 0 to 1)
      **/
      public function __construct($name, $state, $artt=null, $packet_loss = 0, $dup = false){
        $this->_state = $state;
        $this->_name = $name;
        $this->_avg_rtt_ms = $artt;
        $this->_packet_loss = $packet_loss;
        $this->_dup = $dup;
      }

      /**
      * __get() magic method
      **/
      public function __get($property) {
        switch($property){
          case "state":
            return $this->_state;
          case "name":
            return $this->_name;
          case "packet_loss":
            return $this->_packet_loss;
          case "avg_rtt_ms":
            return $this->_avg_rtt_ms;
          case "dup":
            return $this->_dup;
          default:
            if(property_exists($this, $property))
                  return $this->$property;
            else return null;
        }
      }
  }
