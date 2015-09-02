<?php
namespace NetAssist\Graph\Repositories\NeoClient;
use NetAssist\Graph\Repositories\Interfaces\ILinksRepository as ILinksRepository;
use NetAssist\Graph;


class LinksRepository extends BaseGraphRepository implements ILinksRepository {
    const FETCH_ALL_QUERY = 'MATCH (n:NetAssistNode)-[r:LINKS_TO]->(c:NetAssistNode) RETURN r';
    const FETCH_ALL_QUERY_FAST = 'MATCH (n:NetAssistNode)-[r:LINKS_TO]->(c:NetAssistNode) RETURN '
            . 'Id(n),Id(c),Id(r),r.speed,r.comment,r.db_sw_id,r.db_ref_sw_id,r.port_id,r.ref_port_id';
    const COUNT_ALL_LINKS_QUERY  = 'MATCH (n:NetAssistNode)-[r:LINKS_TO]->(c:NetAssistNode) RETURN count(r)';
    /**
    * Constructor
    * @param \Neoxygen\NeoClient\Client $connection NeoClient client connection instance
    * @param \NetAssist\Graph\Adapters\IGraphAdapter $adapter Adapter instance
    */
    function __construct($connection, $adapter){
        parent::__construct($connection, $adapter);
    }


    public function FetchAllLinks($fetch_full_nodes=false) {
       $connection = $this->_connection;
       $resp = $connection->sendCypherQuery(self::FETCH_ALL_QUERY);
       $resp = $connection->getResponse();
       $body = $resp->getBody();
       return $this->_adapter->getLinks($body['results'][0]['data'],
               $fetch_full_nodes);
    }

    public function GetLoaded($load_theshold) {

    }

    public function GetBridges() {

    }


    public function CountAllLinks() { 
    	$resp = $this->_connection->sendCypherQuery(self::COUNT_ALL_LINKS_QUERY);
	$resp = $this->_connection->getResponse();
	$body = $resp->getBody();
	return intval($body['results'][0]['data'][0]['row'][0]);	
    }

}



?>
