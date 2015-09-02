<?php
namespace NetAssist\Icinga\LiveStatus;

/**
* Icinga 2 the MKLiveStatus client for NetAssist NetGraphz
**/
class Client {

  /**
  * @var \NetAssist\Graph\Icinga\LiveStatusConfig LiveStatus configuration
  **/
  protected $_config;

  /**
  * @var bool Sets if socket is already connected to the endpoint
  **/
  protected $_connected;

  /**
  * @var resource LiveStatus communication stream socket client
  **/
  protected $_socket_client;

  /**
  * @var bool Set's if request was sent before
  **/
  protected $_request_sent;

  /**
  * Constructor
  * @param \NetAssist\Icinga\Config $config Configuration
  **/
  function __construct($config) {
    $this->_connected = false;
    $this->_config = $config;
    $this->_request_sent = false;
  }

  function __destruct(){
    $this->_closeSocketConnection();
  }

  /**
  * Establish socket connection
  **/
  protected function _establishSocketConnection(){
    if($this->_config->use_unix_socket){
      $this->_socket_client =
      stream_socket_client(sprintf("unix://%s", $this->_config->unix_socket_path));
    }
    else {
      $this->_socket_client =
      stream_socket_client(sprintf("tcp://%s:%d", $this->_config->host, $this->_config->port));
      stream_set_timeout($this->_socket_client, 2);
    }
    if($this->_socket_client == false){
      fclose($this->_socket_client);
      throw new \RuntimeException("Cannot connect to LiveStatus server using configuration provided");
    }
    $this->_connected = true;
  }

  /**
  * Close socket connection
  **/
  protected function _closeSocketConnection(){
    if($this->_connected){
      fclose($this->_socket_client);
      //stream_socket_shutdown($this->_socket_client,  STREAM_SHUT_RDWR);
    }
    $this->_connected = false;
  }

  /**
  * Read response data from socket
  * @param int $length Size of response to read
  * @return string Raw response body
  **/
  protected function _read_response_body( $length ){
    $offset = 0;
    $data = "";

    while ($offset < $length) {
      if( false === ($recv_data = fread($this->_socket_client, $length - $offset))){
        throw new \RuntimeException(
          "Problem reading from socket stream"
        );
    }

    $recv_len = strlen($recv_data);
    $offset += $recv_len;
    $data .= $recv_data;

    if($recv_len == 0 ){
      break;
    }
  }

  return $data;
}

/**
* Sends request to remote host
* @param \NetAssist\Icinga\LiveStatus\Requests\RequestBuilder $request_builder Request
**/
public function sendRequest( $request_builder ){
  if(!$this->_connected)
    $this->_establishSocketConnection();
  $req = $request_builder->setResponseHeaderMode(ResponseHeadersMode::FIXED16)->build();
  fwrite($this->_socket_client, $req);
  fwrite($this->_socket_client, "\n");
  $this->_request_sent = true;
}

/**
* Get response from client
* @return \NetAssist\Icinga\LiveStatus\Response|null Response or null in case of error
**/
public function getResponse() {
  if(!$this->_request_sent)
  return null;
  $this->_request_sent = false; //reset value
  $h = $this->_read_response_body(16); //fixed16
  $code = intval(substr($h, 0, 3));
  $length = intval(trim(substr($h, 4, 11)));
  $body = $this->_read_response_body($length);
  if(!$this->_config->keepAlive){
    $this->_closeSocketConnection();
  }
  return new Response($code, $body);
}

}
