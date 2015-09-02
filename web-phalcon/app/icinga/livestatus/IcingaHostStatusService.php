<?php

namespace NetAssist\Icinga\LiveStatus;
use NetAssist\Graph\Services\IHostStatusService;
use NetAssist\Graph\NodeState;
use NetAssist\Graph\NodeStatus;
use NetAssist\Icinga\LiveStatus\Queries\Condition;
use NetAssist\Icinga\LiveStatus\Queries\Expression;
use NetAssist\Icinga\LiveStatus\Queries\Filter;
use NetAssist\Icinga\LiveStatus\Queries\FilterSet;
use NetAssist\Icinga\LiveStatus\Requests\RequestBuilder;
use NetAssist\Icinga\LiveStatus\Requests\RequestMethod;

/**
*   Icinga2 hosts status service. Uses livestatus to query host status.
**/

class IcingaHostStatusService implements IHostStatusService {
  const COLUMNS = ['host_name', 'hard_state', 'perf_data', 'plugin_output'];
  const PERF_DATA_REGEXP = "/^rta=([0-9]+\.?[0-9]*)ms;([0-9]+\.?[0-9]*);([0-9]+\.?[0-9]*);([0-9]+\.?[0-9]*) pl=([0-9]+)%;([0-9]+);([0-9]+);([0-9]+)$/";
  const DUP_REGEX = "/^PING WARNING - DUPLICATES FOUND! .*$/";
  /**
  * @var \NetAssist\Icinga\LiveStatus\Client Client instance
  **/
  private $_client;

  /**
  * Constructor
  * @param \NetAssist\Icinga\Config $config Configuration
  **/
  function __construct($client) {
    $this->_client = $client;
  }

  /**
  * GET LiveStatus hosts state by sending OR query of different criteria values
  * @param string $field Field to query
  * @param array $value Values to get
  * @return \NetAssist\Graph\NodeStatus[] Status of hosts
  **/
  protected function _get_hosts_status_by_field($field, $values){
    $filter_set = new FilterSet(Expression::EXP_OR);
    foreach($values as $value){
        $filter_set->pushCriteria(new Filter($field, $value));
    }
    $builder = new RequestBuilder();
    $builder->setRequestMethod(RequestMethod::GET)
          ->setOutputType(OutputType::JSON)
          ->setQueryTable("hosts")
          ->setColumns(self::COLUMNS)
          ->pushCriteria($filter_set);
    $this->_client->sendRequest($builder);
    $response =  $this->_client->getResponse();
    $json = json_decode($response->body);
    $arr = [];
    foreach ($json as $json_item) {
      array_push($arr, $this->_parse_json_host_item($json_item));
    }
    return $arr;
  }

  /**
  * Parse json array row from LiveStatus output
  * @param array $item JSON row array
  * @return \NetAssist\Graph\NodeStatus Status of host
  **/
  protected function _parse_json_host_item($item){
      $host_name = $item[ 0 ];
      $hard_state = new HardState(intval($item[ 1 ]));
      $perf_data = $item[ 2 ];
      $output = $item[ 3 ];
      $state = NodeState::STATE_UKNOWN;
      if($hard_state == HardState::UP){
        $state = NodeState::STATE_UP;
      }
      else {
        $state = NodeState::STATE_DOWN;
      }
      $matches = []; //array for matches
      if(preg_match(self::PERF_DATA_REGEXP, $perf_data, $matches)){
          $rtt = floatval($matches[1]);
          $loss = intval($matches[5])/100.0;
          if($hard_state == HardState::UP && $loss > 0){
              $state = NodeState::STATE_LOSS;
          }
          else {
              //TODO: Add scheduled downtime, etc.
          }
          $matches = [];
          $dup = false;

          if(preg_match(self::DUP_REGEX, $output, $matches)){
              $dup = true;
              $state = NodeState::STATE_LOSS;
          }
          $status = new NodeStatus($host_name, $state, $rtt, $loss, $dup);
      }
      else {
          $status = new NodeStatus($host_name, $state);
      }
      return $status;
  }
  /**
  * Queries external monitoring service for host status
  * @param string $host_name External service host name
  * @return \NetAssist\Graph\NodeStatus|null Status of host
  **/

  function GetHostStatusByName( $host_name ) {
    return $this->GetHostsStatusByNames([$host_name])[0];
  }


  /**
  * Queries external monitoring service for host status
  * @param string $ip IP address
  * @return \NetAssist\Graph\NodeStatus|null Status of host
  **/

  function GetHostStatusByIP( $ip ){
    return $this->GetHostsStatusByIP([$ip]);
  }

  /**
  * Queries external monitoring service for host status
  * @param string[] $host_names External service host names array
  * @return \NetAssist\Graph\NodeStatus[] Status of hosts
  **/

  function GetHostsStatusByNames( $host_names ){
      return $this->_get_hosts_status_by_field('host_name', $host_names);
  }

  /**
  * Queries external monitoring service for host status
  * @param string[] $ip_array IP address
  * @return \NetAssist\Graph\NodeStatus|null Status of hosts
  **/

  function GetHostsStatusByIP( $ip_array ){
     $arr4 =  $this->_get_hosts_status_by_field('address', $ip_array);
     $arr6 =  $this->_get_hosts_status_by_field('address6', $ip_array);
     return array_merge($arr4, $arr6);
  }
}
