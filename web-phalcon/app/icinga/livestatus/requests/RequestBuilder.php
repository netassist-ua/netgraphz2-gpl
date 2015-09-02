<?php
namespace NetAssist\Icinga\LiveStatus\Requests;
use \NetAssist\Icinga\LiveStatus\OutputType;
use \NetAssist\Icinga\LiveStatus\Queries;
use \NetAssist\Icinga\LiveStatus\ResponseHeadersMode;

/**
* LiveStatus request builder
**/
class RequestBuilder {

  /**
  * @var \NetAssist\Icinga\LiveStatus\Requests\RequestMethod Method
  **/
  protected $_method;

  /**
  * @var string Query table
  **/
  protected $_table;

  /**
  * @var \NetAssist\Icinga\LiveStatus\OutputType Output data format
  **/
  protected $_outputFormat;

  /**
  * @var string Command to send Icina2
  **/
  protected $_command;

  /**
  * @var \NetAssist\Icinga\LiveStatus\Queries\Criteria[] Criteria array to restrict query
  **/
  protected $_criteria_array;

  /**
  * @var \NetAssist\Icinga\LiveStatus\Queries\Stat\StatCriteria[] Stat criteria array to collect statistics
  **/
  protected $_stat_array;

  /**
  * @var string[]|null Columns to fetch
  **/
  protected $_columns;

  /**
  * @var bool Keep connection after response (keepalive)
  **/
  protected $_keepalive;

  /**
  * @var int|null Limit output
  **/
  protected $_limit;

  /**
  * @var bool|null Set's to print column headers in response
  **/
  protected $_columnHeaders;

  /**
  * @var string|null AuthUser
  **/
  protected $_authUser;

  /**
  * @var \NetAssist\Icinga\LiveStatus\ResponseHeadersMode|null Headers mode
  **/
  protected $_responseHeaderMode;

  /**
  * Set columns to be fetched into results
  * @param string[] $columns Names of columns in array
  * @return \NetAssist\Icinga\LiveStatus\Requests\RequestBuilder Instance
  **/
  public function setColumns($columns){
    $this->_columns = $columns;
    return $this;
  }


  /**
  * Set response headers mode
  * @param \NetAssist\Icinga\LiveStatus\ResponseHeadersMode $responseHeaderMode mode
  * @return \NetAssist\Icinga\LiveStatus\Requests\RequestBuilder Instance
  **/
  public function setResponseHeaderMode($responseHeaderMode){
    $this->_responseHeaderMode = $responseHeaderMode;
    return $this;
  }

  /**
  * Set user for authentication
  * @param string $authUser User name to be authenticated
  * @return \NetAssist\Icinga\LiveStatus\Requests\RequestBuilder Instance
  **/
  public function setAuthUser($authUser){
    $this->_authUser = $authUser;
    return $this;
  }

  /**
  * Set column headers
  * @param bool $columnHeaders Show column headers
  * @return \NetAssist\Icinga\LiveStatus\Requests\RequestBuilder Instance
  **/
  public function setColumnHeaders($columnHeaders){
    $this->_columnHeaders = $columnHeaders;
    return $this;
  }

  /**
  * Set output limit
  * @param int $limit Number of row to fetch
  * @return \NetAssist\Icinga\LiveStatus\Requests\RequestBuilder Instance
  **/
  public function setLimit($limit){
    $this->_limit = $limit;
    return $this;
  }

  /**
  * Sets if connection should keep after response
  * @param bool $keepalive Keep connection
  * @return \NetAssist\Icinga\LiveStatus\Requests\RequestBuilder Instance
  **/
  public function setKeepalive($keepalive){
    $this->_keepalive = $keepalive;
    return $this;
  }

  /**
  * Sets request method
  * @param \NetAssist\Icinga\LiveStatus\Requests\RequestMethod $requestMethod Request type - GET or COMMAND
  * @return \NetAssist\Icinga\LiveStatus\Requests\RequestBuilder Instance
  **/
  public function setRequestMethod( $requestMethod ){
    $this->_method = $requestMethod;
    return $this;
  }

  /**
  * Sets query table (for GET request)
  * @param string $table Table to query
  * @return \NetAssist\Icinga\LiveStatus\Requests\RequestBuilder Instance
  **/
  public function setQueryTable( $table ){
    $this->_table = $table;
    return $this;
  }

  /**
  * Push criteria into array
  * @param \NetAssist\Icinga\LiveStatus\Critera Criteria
  * @return \NetAssist\Icinga\LiveStatus\Requests\RequestBuilder Instance
  **/
  public function pushCriteria( $criteria ){
    array_push($this->_criteria_array, $criteria);
    return $this;
  }

  /**
  * Sets output response data format
  * @param \NetAssist\Icinga\LiveStatus\OutputType $output_format Output format to use
  * @return \NetAssist\Icinga\LiveStatus\Requests\RequestBuilder Instance
  **/
  public function setOutputType( $output_format ) {
    $this->_outputFormat = $output_format;
    return $this;
  }

  /**
  * Sets command and argument string for COMMAND request type
  * @param string $command Command to send Icinga2
  * @return \NetAssist\Icinga\LiveStatus\Requests\RequestBuilder Instance
  **/
  public function setCommand($command) {
    $this->_command = $command;
    return $this;
  }

  /**
  * Constructor
  **/
  public function __construct(){
    $this->_criteria_array = [];
    $this->_stat_array = [];
    $this->_method = RequestMethod::GET;
    $this->_table = "hosts";
    $this->_outputFormat = OutputType::JSON;
    $this->_responseHeadersMode = ResponseHeadersMode::FIXED16;
    $this->_columns = null;
    $this->_keepalive = false;
  }

  /**
  * Builds query according to specified parameters
  * @return string Query
  **/
  public function build(){
    $str = "";
    if( $this->_method == RequestMethod::COMMAND ){
      $str .= sprintf("COMMAND %s \n", $this->_command);
    }
    else {
      $str .= sprintf("GET %s \n", $this->_table);
      foreach ($this->_criteria_array as $c) {
        $str .= strval($c);
        $str .= "\n";
      }
      if($this->_columns != null){
        $str .= "Columns: ";
        foreach ($this->_columns as $col) {
          $str .= $col;
          $str .= " ";
        }
        $str .= "\n";
      }
      foreach ($this->_stat_array as $stat) {
        $str .= strval($stat);
        $str .= "\n";
      }
    }
    $str .= sprintf("OutputFormat: %s \n", strval($this->_outputFormat));
    if($this->_keepalive)
      $str .= "KeepAlive: on \n";
    if($this->_limit != null)
      $str .= sprintf("Limit: %d \n", $this->_limit);
    if($this->_columnHeaders != null)
      $str .= sprintf("ColumnHeaders: %s \n", $this->_columnHeaders ? "on" : "off" );
    $str .= sprintf("ResponseHeader: %s \n", $this->_responseHeaderMode);
    $str .= "\n";
    return $str;
  }
}
