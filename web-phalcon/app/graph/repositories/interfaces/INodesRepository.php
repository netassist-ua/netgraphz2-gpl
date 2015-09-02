<?php
  namespace NetAssist\Graph\Repositories\Interfaces;

  /**
  *  Graph Nodes repository interface
  */
  interface INodesRepository extends IBaseGraphRepository{
      /**
      * Fetch all nodes from network
      * @return \NetAssist\Graph\Node[] Nodes
      */
      function FetchAllNodes();


      /**
      * Get all nodes with limit
      * @param int $skip Number of nodes to skip
      * @param int $take Number of nodes to get
      * @return \NetAssist\Graph\Node[] Nodes
      */
      function GetAll($skip, $take);

      /**
      * Get all nodes with limit using last id
      * @param int $last_id Id of last node to start from next
      * @param int $take Number of nodes to get
      * @return \NetAssist\Graph\Node[] Nodes
      */
      function GetAllByLastId($last_id, $take);

      /**
      * Get node by identifier
      * @param int $id Identifier of node
      * @return \NetAssist\Graph\Node Node
      */
      function GetById( $id );

      /**
       * Returns count of all present nodes in graph database
       * @return int Count of nodes
       */
      function CountAllNodes();

      /**
      * Get nodes in down state
      * @return \NetAssist\Graph\Node[] Nodes
      */
      function GetDownNodes();

      /**
      * Get subgraph from node excluding parents
      * @param int[] $parents_id  Identifier of parents
      * @param int $node_id Identifier of node to start from
      * @return \NetAssist\Graph\Node[] Node specified by graph with all relations et all
      */
      function GetSubgraphFrom($parents_id, $node_id);
  }
?>
