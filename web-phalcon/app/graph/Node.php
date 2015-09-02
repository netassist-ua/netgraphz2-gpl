<?php
  namespace NetAssist\Graph;

  /**
  * Represents graph node
  * @property_read int $id Identifier of record in graph database
  */
  class Node implements \JsonSerializable  {
      /**
      * @var int Graph node identifier
      */
      private $_id;

      /**
      * @var string Short name of node
      */
      public $name;

      /**
      * @var string|null IP address of node
      */
      public $ip;

      /**
      * @var string|null Hardware device model of node
      */
      public $model;

      /**
      * @var string|null Physical localtion of device
      */
      public $addr;

      /**
      * @var string|null MAC address of device
      */
      public $mac;

      /**
      * @var int SQL (Alter) Database identifier
      */
      public $db_id;

      /**
      * @var array Links of device
       */
      public $links;

      /**
       * @var int Last change (for caching purposes)
       */
      public $last_cache_date;

      /**
       * @var string Comment for the node
       */
      public $comment;

      /**
       * @var int Number of ports
       */
      public $ports_number;

      /**
       * @var string|null Host name in Icinga2 monitoring system
       */
      public $icinga_name;

      /**
      * @var \NetAssist\Graph\NodeStatus|null Node status
      */
      public $status;

      /**
      * Performs JSON serialzation preparation
      * @return array Repsentation of object for JSON serializer
      */

      public function jsonSerialize()
      {
        return [
                'id' => $this->_id,
        				'address' => $this->addr,
                'db_id' => $this->db_id,
                'name' => $this->name,
                'ip' => $this->ip,
                'mac' => $this->mac,
                'model' => $this->model,
                'comment' => $this->comment,
                'port_number' => $this->ports_number,
                'icinga_name' => $this->icinga_name,
                'state'=> isset($this->status) ? $this->status->state : NodeState::STATE_UKNOWN,
                'rtt' => isset($this->status) ? $this->status->avg_rtt_ms : null,
                'packet_loss' => isset($this->status) ? $this->status->packet_loss : null,
                'duplicates' => isset($this->status) ? $this->status->dup : null
          ];
      }

      /**
      * Construtor
      * @param int $id Graph database identifier of node
      */
      function __construct($id) {
          $this->_id = $id;
          $this->links = array();
      }

      public function __isset($property) {
          if($property == "id"){
              return true;
          }
          return isset($this->$property);
      }
      public function __get($name) {
          if($name == "id"){
              return $this->_id;
          }
          if(property_exists($this, $name)){
                  return $this->$name;
          }
      }

  }
?>
