<?php
namespace NetAssist\GRPC;


class Config {
	public $host;
	public $port;
	public $grpcOptions;
	public $timeout;

	public function __construct(){
		$this->grpcOptions = array();

	}
}


?>
