<?php
namespace NetAssist\Graph\Adapters;
use \NetAssist\Graph;

/**
*   Interface for reposenting request results arrays
*      as Graph entities
*/
interface IGraphAdapter {
    /**
    * @param array|mixed $response_data_node Node representation from response of client
    * @return \NetAssist\Graph\Node Node
    */
    function getNode($response_data_node);

    /**
    * @param array|mixed $response_data_nodes Nodes representation from response of client
    * @return \NetAssist\Graph\Node[] Array of nodes
    */
    function getNodes($response_data_nodes);

    /**
    * @param array|mixed $resp_data_link Link representation from response of client
    * @param array|mixed $resp_node_start Start node data from response
    * @param array|mixed $resp_node_end End node data from response
    * @param bool $use_node_data Uses other node data except identifiers
    * @return \NetAssist\Graph\Link Link
    */
    function getLink($resp_data_link, $resp_node_start, $resp_node_end,
                     $use_node_data=false);

    /**
    * @param array|mixed $resp_data_links  Links representation from response of client
    * @param bool $use_node_data Uses other node data except identifiers
    * @return \NetAssist\Graph\Link[] Array of links
    */
    function getLinks($resp_data_links, $use_node_data=false);
}


?>
