<?php
namespace NetAssist\Graph {
  use Neoxygen\NeoClient\ClientBuilder;

  class ConnectionBuilder {
    private $_dbConfig;
    private $_connectionBuilder;

    function __construct( ) {
      $config = include(APP_PATH . "/app/config/config.php");
      $_dbConfig = $config["graph"];
      $this->_connectionBuilder = ClientBuilder::create()
      ->addConnection('default', $_dbConfig['scheme'], $_dbConfig['host'],
      $_dbConfig['port'], $_dbConfig['auth'], $_dbConfig['username'],
      $_dbConfig['password']);
      $this->_connectionBuilder->setAutoFormatResponse(false);
    }

    public function buildConnection() {
      return $this->_connectionBuilder->build();
    }

  }
}
?>
