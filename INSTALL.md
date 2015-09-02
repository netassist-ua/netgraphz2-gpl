NetAssist network graph
========================

Monitoring network map using graph representation of network equipment.
Creates visual network graph with status of each node taken from external source (right now, Icinga)
Also show channel load on edges, link capacities and graph bridges.

Installation
-------------

1)	Install following dependencies
2)	RUN install.sh	from scripts folder
3)	install.sh will ask you about installation folder, provide you configuration sections for Apache2 and nginx
4)	Open web-browser and follow http://[hostname]/negraphz2 in case of default options installation
5)	Login as administrative user netgraphzadmin with password you've specified in installer script before  

### Icinga2

Once you done adding your hosts, start Icinga configuration generator located in /icinga_config_generator.
It will easily create basic hosts definitions from your graph using DFS.

Install notifications configurations:

Add user _netgraphz2_notify_all to usefronrs configuration or use other name, changing notificator configuration file
Copy notifications configuration file from /notificator/icinga_samples and change it how you wish

Icinga2 notifications works through out the command pipe: Icinga runs command, starts script which sends data to notificator node.js server that perrforms handling and spreads notification to all connected users (operators)
 
