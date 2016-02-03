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
	 *   @param int $last_id Identifier to start from
	 *   @param int $n_take Number of links to take
	 *   @return \NetAssist\Graph\Link[] Links
	 */
	function GetAllByLastId ($last_id, $n_take);

	/**
	 *  Get link from database by identifier
	 *  @param int $id Identifier of a link
	 *  @return \NetAssist\Graph\Link Link
	 */
	function GetById( $id );

	/**
	 *  Get bridge links in network graph,
	 *    works for O(n+m)
	 *  @see http://e-maxx.ru/algo/bridge_searching
	 *  @return \NetAssist\Graph\Link[] Links
	 */
	function GetBridges();
}
?>
