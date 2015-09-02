<?php

namespace NetAssist\Graph\Services;

/**
*  Interface of hosts status information services
*  Used to abstract  hosts status queris to external monitoring services
**/
interface IHostStatusService {
	/**
	* Queries external monitoring service for host status
	* @param string $host_name External service host name
	* @return \NetAssist\Graph\NodeStatus|null Status of host
	**/

	function GetHostStatusByName( $host_name );

	/**
	* Queries external monitoring service for host status
	* @param string $ip IP address
	* @return \NetAssist\Graph\NodeStatus|null Status of host
	**/

	function GetHostStatusByIP( $ip );

	/**
	* Queries external monitoring service for host status
	* @param string[] $host_names External service host names array
	* @return \NetAssist\Graph\NodeStatus[] Status of hosts
	**/

	function GetHostsStatusByNames( $host_names );

	/**
	* Queries external monitoring service for host status
	* @param string[] $ip_array IP address
	* @return \NetAssist\Graph\NodeStatus|null Status of hosts
	**/

	function GetHostsStatusByIP( $ip_array );
}
