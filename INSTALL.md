NetAssist network graph
========================

Monitoring network map using graph representation of network equipment.
Creates visual network graph with status of each node taken from external source (right now, Icinga)
Also show channel load on edges, link capacities and graph bridges.

Installation
-------------

Installation instructions provided in user manual (docs directory of repository)
For now only one way to add nodes - adding via Neo4j RESTful API.

### Icinga2

Once you done adding your hosts, start Icinga configuration generator located in /icinga_config_generator.
It will easily create basic hosts definitions from your graph using DFS.

Install notifications configurations:

Add user _netgraphz2_notify_all to usefronrs configuration or use other name, changing notificator configuration file
Copy notifications configuration file from /notificator/icinga_samples and change it how you wish

Icinga2 notifications works through out the command pipe: Icinga runs command, starts script which sends data to notificator node.js server that perrforms handling and spreads notification to all connected users (operators)
 
