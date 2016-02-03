<?php
namespace NetAssist\Graph\Repositories\GRPC;
use \NetAssist\Graph\Repositories\Interfaces\IBaseGraphRepository as IBaseGraphRepository;
use \ng_rpc\BackendClient as BackendClient;

class BaseGraphRepository implements IBaseGraphRepository {

	/*
	 * gRPC configuration
	 * @var \NetAssist\GRPC\Config
	 */
	protected $_config;
       
	/**
	* Graph adapter
	* @var \NetAssist\Graph\Adapters\IGraphAdapter
	*/
	protected $_adapter;


	/*
	 * Constructor
	 * @param \NetAssist\GRPC\Config $config Configuration
	 */
	function __construct($config, $adapter){
		$this->_config = $config;
		$this->_adapter = $adapter;
 	}

	/*
	 * Get gRPC client instance
	 * @return \ng_rpc\BackendClient
	 */
	protected function getRPCClient(){
		$host_port = sprintf("%s:%d", $this->_config->host, $this->_config->port);
		$client = new BackendClient($host_port, $this->_config->grpcOptions);
		return $client;
	}

	/**
	 * Returns gRPC API version
	 * @return string gRPC binding version 
	 */
	public function GetDatabaseVersion(){
		return "1.0";
	}
}
?>
