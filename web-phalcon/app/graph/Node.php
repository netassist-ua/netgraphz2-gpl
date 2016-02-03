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
       * @var string|null IPv6 address of node
       */
      public $ip6;

      /**
      * @var string|null Hardware device model of node
      */
      public $model;

      /**
      * @var string|null Physical localtion of device
      */
      public $address;

      /**
      * @var string|null MAC address of device
      */
      public $mac_address;

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
      * @var \NetAssist\Graph\NodeStatus[] Node status
      */
      public $status;

      /**
       * @var \NetAssist\Graph\NodeMetric[]  Node metrics
       */
      public $metrics;

      /**
      * @var int Predefined x coordinate
      */
      public $x;

      /**
      * @var int Predefined y coordinate
      */
      public $y;

      /**
      * Performs JSON serialzation preparation
      * @return array Repsentation of object for JSON serializer
      */

      public function jsonSerialize()
      {
        return [
                'id' => $this->_id,
  		'address' => $this->address,
                'db_id' => $this->db_id,
                'name' => $this->name,
                'ip' => $this->ip,
                'mac' => $this->mac_address,
                'model' => $this->model,
                'comment' => $this->comment,
                'port_number' => $this->ports_number,
		'icinga_name' => $this->icinga_name,
		'status' => $this->status,
		'metrics' => $this->metrics,
		'ip6' => $this->ip6,
                'x' => isset($this->x) ? $this->x : null,
                'y' => isset($this->y) ? $this->y : null
          ];
      }

      /**
      * Construtor
      * @param int $id Graph database identifier of node
      */
      function __construct($id) {
          $this->_id = $id;
	  $this->links = array();
	  $this->status = array();
	  $this->metrics = array();
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
