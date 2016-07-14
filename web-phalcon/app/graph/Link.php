<?php
namespace NetAssist\Graph;

/**
 *  Represents graph link between nodes
 *  @property-read int $id Identifier of record in graph database
 */
class Link implements \JsonSerializable {
  /**
   *  @var int Identifier record in database
   */
  private $_id;

  /**
   *  @var string Comment for link
   */
  public $comment;

  /**
   * @var \NetAssist\Graph\Node Source node
   */
  public $src_node;

  /** @var int Source port number */
  public $src_port;

  /** @var \NetAssist\Graph\Node Destination node */
  public $dst_node;

  /** @var int Destination port number */
  public $dst_port;

  /** @var int Link speed in mbps */
  public $link_speed;

  /** @var string RX Octets metric for weather map**/
  public $rx_octets_metric;

  /** @var string TX Octets metric for weather map**/
  public $tx_octets_metric;

  public function __get($property){
    if($property == "id")
      return $this->_id;
    if(property_exists($this, $property))
      return $this->_property;
  }

  /**
   * Performs JSON serialzation preparation
   * @return array Repsentation of object for JSON serializer
   */
  public function jsonSerialize() {
    return [
      'id' => $this->_id,
      'comment' => $this->comment,
      'src' => [
        'id' => $this->src_node->id,
        'db_sw_id' => $this->src_node->db_id,
        'port_id' => $this->src_port
      ],
      'dst' => [
        'id' => $this->dst_node->id,
        'db_sw_id' => $this->dst_node->db_id,
        'port_id' => $this->dst_port,
      ],
      'link_speed' => $this->link_speed,
      'rx_octets' => $this->rx_octets_metric,
      'tx_octets' => $this->tx_octets_metric
    ];
  }

  /**
   * Constructor
   * @param int Identifier of link in database
   */
  function __construct($id){
    $this->_id = $id;
  }

}
?>
