<?php
  namespace NetAssist\Graph\Repositories\Interfaces;

  /**
  *  Graph Nodes repository interface
  */
  interface INodesRepository extends IBaseGraphRepository{
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

  }
?>
