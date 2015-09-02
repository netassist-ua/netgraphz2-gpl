<?php

namespace NetAssist\Graph\Services;
/*
 * Nodes cache service interface
 */
interface INodesCacheService {
    /**
     * Try to get Node from nodes cache
     * @param type $node_id
     * @param type $time_last_change
     * @return \NetAssist\Graph\Node|null Node or null in case of cache miss
     */
    function TryGet( $node_id, $time_last_change );
    /**
     * Save node to the nodes cache
     * @param \NetAssist\Graph\Node $node Node to save in cache
     * @return bool Returns true if node saved successfully, otherwise returns false
     */
    function Save($node);
    
    /**
     * Gets count of cached nodes
     * @return int Number of items in cache
     */
    function GetItemsCount();
}
