<?php
namespace NetAssist\Graph\Repositories\NeoClient;
use \NetAssist\Graph\Repositories\Interfaces\IBaseGraphRepository as IBaseGraphRepository;

/**
*  NeoClient implementation of BaseGraphRepository
*/
class BaseGraphRepository implements IBaseGraphRepository {
  /**
  * NeoClient library client instance
  * @var \Neoxygen\NeoClient\Client
  */
  protected $_connection;
  
  /**
   * Graph adapter
   * @var \NetAssist\Graph\Adapters\IGraphAdapter
   */
  protected $_adapter;

  /**
  * Constructor
  * @param \Neoxygen\NeoClient\Client $connection NeoClient client connection instance
  * @param \NetAssist\Graph\Adapters\IGraphAdapter $adapter adapter instance
  */
  function __construct($connection, $adapter) {
    $this->_connection  = $connection;
    $this->_adapter = $adapter;
  }
  
  /**
  * Returns graph database engine version and revision
  * @return string Engine version
  */
  public function GetDatabaseVersion() {
       return $this->_connection->getVersion();
  }

}

?>
