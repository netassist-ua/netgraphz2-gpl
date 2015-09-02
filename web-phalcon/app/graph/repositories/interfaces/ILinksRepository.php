<?php
  namespace NetAssist\Graph\Repositories\Interfaces;
  /**
  *   Graph links repository interface
  */
  interface ILinksRepository extends IBaseGraphRepository {
      
      /**
      *   Get count of links in graph
      *	  @return int Count of links
      */
      function CountAllLinks();

      /**
      *   Fetch all links from graph database
      *   @param bool $fetch_full_nodes Fetch all node information if true,
      *   otherwise fetches just id and db_sw_id of node
      *   @return \NetAssist\Graph\Link[] Links
      */
      function FetchAllLinks($fetch_full_nodes=false);

      /**
      *  Get bridge links in network graph,
      *    works for O(n+m)
      *  @see http://e-maxx.ru/algo/bridge_searching
      *  @return \NetAssist\Graph\Link[] Links
      */
      function GetBridges();

      /**
      * Get loaded enough links (>load_theshold)
      * @param int $load_theshold Load theshold in mbps
      * @return \NetAssist\Graph\Link[] Links
      */
      function GetLoaded($load_theshold);
  }
?>
