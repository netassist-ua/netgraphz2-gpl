NetGraphz2 - NetAssist network graph project
============================================

OpenSource monitoring network map using graph representation of network equipment.
Creates visual network graph with status of each node taken from Icinga.
Also planned to implement visualization of channel load on edges, link capacities and graph bridges.

Dependencies
-------------

* Icinga2 (as monitoring data source) + MKLiveStatus
* PHP 5.6 (for web-interface)
* PHP Phalcon >= 2.0 (for web-interface)
* Python 2 >= 2.7.3  (for utilities)
* Py2neo >= 2.0 (connector to neo4j)
* neo4j >= 2.2.3 (main database)
* node.js >= 0.10.2 (for monitoring callback server)


Structure
-------

* /web-phalcon - Web-Interface based on PHP Phalcon framework
* /api - Node.js express RESTful HTTP API for NetGraphz2 
* /notifications - Node.js socket.io service to notificate browsers about state changes in Icinga monitoring system
* /snmp_collector - Python SNMP traffic statistics data collection tool (in development)
* /node_netgraphz2 - Shared library for Node.js to work with neo4j database
* /icinga - Icinga 2 sample configuration and scripts
* /docs - Documentation


