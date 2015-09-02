NetAssist network graph
========================

Network graph RESTful API
------------------

Used to to add/update/remove nodes and links via HTTP request

* Platform: node.js
* Framework: express

Runs on port specified in configuration file (by default 3110) as HTTP server.
Uses JSON as request response data format.
You have to send JSON request specified below to manipulate graph.

Usage
-------

### Nodes

#### Node JSON object

Nodes are represented as JSON objects.

Example:
```javascript
{
	"id": 2, //id of node
	"name": "Henkuaile-1", //name of host
	"origin_db_id": 243, //origin database id
	"ip": "93.78.206.90", //ip
	"mac": "fc:f8:ae:5e:5d:da", //mac
	"dns": "srv1.henkuaile.cn", //dns host name
	"icinga_name": "henkuaile.cn", //name in icinga (null)
	"snmp_monitored": true, //is host monitored by SNMP
	"snmp_generic_objects": ["iface_eth0", "iface_eth1"], //generic SNMP objects nams
	"snmp_graphics": {  //SNMP graphics parameters
		[
			"id": 400,
			"object_id": "1.3.6.1.2.1.2.1.1", //OID
			"intervals": ["5m", "1h", "1d", "1y"], //Intervals
			"description" "Interface eth1 traffic",	//Description
			"method": "traffic_avg" //Method of collection: (traffic_avg,pps_av,errors_avg)
		]
	}
}
```

#### Get node

* URL: /api/graph/node/:id
    **OR**
  URL: /api/graph/node/by-origin-db-id/:origin-id
* Request body:
	Leave empty
* Params:
    + :id - integer - Identifier of node in graph database
    + :origin-id - identifier of node from import origin database (aka sw_id)
* Method: **GET**
* Returns: HTTP Code 200 and node, in other cases - error code

Response example:

Success:
> HTTP Code 200
```javascript
	{
		"node": {
			"id": 2,
			// ...
			// Node JSON, see above
			// ...
		},
		"time": 1437557069
	}
```
Error:
> HTTP Code 404

```javascript
{
	"code": "NODE_NOT_FOUND",
	"message": "Not Found",
	"id": 2,
	"time": 1437557069
}
```


#### Create new node

* URL: /api/graph/node/
* Params:
	no URL params
* Request body:
```javascript
	{
		"name": "my-core-10g"
		// ...
		// Node JSON without id, see above
		// ...
	}
```
* Method: **PUT**
* Returns: HTTP Code 200 and node id, in other cases - error code

Method accepts node represenation without id and links properties.
If JSON incorrect, returns 400 error (Bad Request)

Response example:

Success:
> HTTP Code 201
```javascript
	{
		"id": 145,
		"time": 1437557069
	}
```
Error:
> HTTP Code 400
```javascript
	{
		"code": "NODE_JSON_ERROR",
		"message": "Bad node JSON on line ...",
		"time": 1437557069
	}
```

#### Update node

* URL: /api/graph/node/:id \
    **OR** \
   URL: /api/graph/node/by-origin-db-id/:origin-id
* Params:
    + :id - Graph database identifer of node
	+ :origin-id - identifier of node from import origin database (aka sw_id)  
* Request body:
	```javascript
	{
		"name": "my-core-10g-1"
		// ...
		// Node JSON, see above
		// ...
	}
	```
* Method: **POST**
* Returns HTTP Code 200, in other cases - error code

Response example:

Success:
> HTTP Code 200
```javascript
	{
		"id": 243,
		"time": 1437557069
	}
```
Error:
> HTTP Code 404
```javascript
	{
		"id": 243,
		"time": 1437557069,
		"code": "NODE_NOT_FOUND",
		"message": "Node not found by identifier"
	}
```

#### Delete node

* URL: /api/graph/node/:id \
    **OR**
  URL: /api/graph/node/by-origin-db-id/:origin-id
* Params:
	+ :id - identifier of node in Netgraphz database  
	+ :origin-id - identifier of node from import origin database (aka sw_id)
* Request body:
    Leave empty
* Method: **DELETE**
* Returns: HTTP Code 200 and node id, in other cases - error code

Response example:

Success:
> HTTP Code 200
```javascript
	{
		"id": 431,
		"time": 1437557069
	}
```
Error:
> HTTP Code 404
```javascript
{
	"code": "NODE_NOT_FOUND",
	"message": "Not Found",
	"id": 431,
	"time": 1437557069
}
```

#### Get nodes count
* URL: /api/graph/node/count
* Params:
	no URL params
* Request body:
	Leave empty
* Method: **GET**
* Returns: HTTP Code 200 and node in, in other cases - error code

Response example:

Success:
> HTTP Code 200
```javascript
	{
		"count": 345,
		"time": 1437557069
	}
```
Error:
> HTTP Code 503
```javascript
{
	"code": "GRAPH_DB_CONNECTION_ERROR",
	"message": "Cannot connect to graph database",
	"time": 1437557069
}
```

### Links

#### Link JSON format

Here is example of Link JSON:

```javascript
	{
			"id": 5412, //id of link
			"startNode": 4123, //id of starting node
			"endNode": 4312, //id of end node
			"src_port_id": 3, //source port number
			"dst_port_id": 5, //destination port number
			"speed": 100, //speed of link in mbps
		  "startNode_origin_db_id": 12, //origin database id of starting node
			"endNode_origin_db_id": 11, //origin database id of end node
			"comment": "Some comments", //comments about link
		    "type": 0,  //type of link (optional)
		    "link_quality": 8, // Link quality grade 1-10 (optional)
		    "wavelength_nm": 1310, //Wavelength in nm (optional)
		    "distance_m": 1000 // Distance of link in meters (optional)
	}
```

#### Types of link
* 0 - Single mode fiber
* 1 - Multi mode fiber
* 2 - Passive optical
* 3 - Wireless optical (Free space optics)
* 4 - Copper
* 5 - High bandwidth radio (802.11/NV2/Nstream)
* 6 - Low bandwidth radio
* 7 - ADSL
* 8 - Other (worse)
* -1 - Other (better)

#### Get link

* URL: /api/graph/link/:id
* Params:
	:id - integer - Database identifier of link
* Request body:
	Leave empty
* Method: **GET**
* Returns: HTTP Code 200 and link, in other cases - error code

Response example:

Success:
>HTTP Code 200
```javascript
	{
		"link": {
				// ...
				// Link JSON representation
				// ..
		},
		"time": 1437557069
	}
```
Error:
> HTTP Code 404
```javascript
	{
		"code": "LINK_NOT_FOUND",
		"message": "Link not found",
		"time": 1437557069
	}
```



#### Get links from node
* URL: /api/graph/link/from_node/:id \
	**OR** \
	URL: /api/graph/link/from_node/by-origin-db-id/:origin-id
* Params:
	+ :id - integer - Database identifier of node
	+ :origin-id - integer - Import origin database identifier of node
* Request body:
	Leave empty
* Method: **GET**
* Returns: HTTP Code 200 and found links, in other cases - error code

Response example:

Success:
> HTTP Code 200
```javascript
	{
		"node_id": 431,
		"origin_db_node_id": 221,
		"links": [
				{
					// ...
					// Link JSON representation
					// ..
				},
				{
					//...//
				},
				//...//
		],
		"time": 1437557069
	}
```
Error:
> HTTP Code 404
```javascript
	{
		"code": "NODE_NOT_FOUND",
		"message": "Node not found",
		"time": 1437557069
	}
```

#### Get links to node
* URL: /api/graph/link/to_node/:id
	OR
	URL: /api/graph/link/to_node/by-origin-db-id/:origin-id
* Params:
	+ :id - integer - Database identifier of node
	+ :origin-id - integer - Import origin database identifier of node
* Request body:
	Leave empty
* Method: **GET**
* Returns: HTTP Code 200 and found links, in other cases - error code

Response example:

Success:
> HTTP Code 200
```javascript
	{
		"node_id": 431,
		"origin_db_node_id": 221,
		"links": [
				{
					// ...
					// Link JSON representation
					// ..
				},
				{
					//...//
				},
				//...//
		],
		"time": 1437557069
	}
```
Error:
> HTTP Code 404
```javascript
	{
		"code": "NODE_NOT_FOUND",
		"message": "Node not found",
		"time": 1437557069
	}
```

#### Create link

* URL: /api/graph/link/
* Params:
	no URL params
* Request body:
```javascript
	{
		"startNode": 4000,
		"endNode": 4001,
		"speed": 40000, //40GE
		// ...
		// Link JSON without id, see above
		// ...
	}
```
* Method: **PUT**
* Returns: HTTP Code 200 and node id, in other cases - error code

Method accepts link represenation without id.
If JSON incorrect, returns 400 error (Bad Request)

Response example:

Success:
> HTTP Code 201
```javascript
	{
		"id": 421,
		"time": 1437557069
	}
```
Error:
> HTTP Code 400
```javascript
	{
		"code": "LINK_JSON_ERROR",
		"message": "Bad link JSON on line 2...",
		"time": 1437557069
	}
```


#### Update link


* URL: /api/graph/link/:id
* Params:
    + :id - Graph database identifer of node
* Request body:
	```javascript
	{
		"startNode": 4000,
		"endNode": 4001,
		"speed": 40000, //40GE
		// ...
		// Link JSON without id, see above
		// ...
	}
	```
* Method: **POST**
* Returns HTTP Code 200, in other cases - error code

Response example:

Success:
> HTTP Code 200
```javascript
	{
		"id": 413,
		"time": 1437557069
	}
```
Error:
> HTTP Code 404
```javascript
	{
		"id": 243,
		"time": 1437557069,
		"code": "LINK_NOT_FOUND",
		"message": "Link not found by identifier"
	}
```

#### Delete link


* URL: /api/graph/link/:id
* Params:
	+ :id - identifier of link in Netgraphz database  
* Request body:
    Leave empty
* Method: **DELETE**
* Returns: HTTP Code 200 and node id, in other cases - error code

Response example:

Success:
> HTTP Code 200
```javascript
	{
		"id": 5142,
		"time": 1437557069
	}
```
Error:
> HTTP Code 404
```javascript
{
	"code": "LINK_NOT_FOUND",
	"message": "Not Found",
	"id": 5412,
	"time": 1437557069
}
```

### Common

#### API Response codes
* NOT_AUTHORIZED - client not authorized yet
* NOT_ALLOWED - no permissions to do this API call
* NODE_NOT_FOUND - node not found
* NODE_JSON_ERROR - error during parsing Node object
* GRAPH_DB_CONNECTION_ERROR  - error during connecting to graph database
* GRAPH_LOCKED - graph database locked, try again after some time
* LINK_NOT_FOUND - link not found
* LINK_JSON_ERROR - error during parsing Link object
* INTERNAL_ERROR - internal error of NetGraphz2
* SUCCESS - success operation (might appear sometimes)

#### Authentication
Place your API key in **Authorization** HTTP header, API server can also check IP. API authentication configuration is placed in <DIR>/config/auth_api.json.

#### UPDATE FROM ORIGIN

Done by sending POST request to **/api/graph/rebuild**.
Uses configuration from **<DIR>/config/origin.json**.
Request body should be:
```javascript
    {
        "rebuildType": 0 //0 - update | 1 - full rebuild
    }
```
You should receive HTTP 200 OK response with such kind of content
```javascript
    {
        "status": "SUCCESS",
        "message": "Database started to rebuild from origin",
        "time": 1437572903
    }
```
Or error code 5xx with JSON error message.

After your request, databases will be locked (UI will be blocked as well) and database start rebuilding by update. This process requires a lot of comparsions to be performed between origin SQL DB and graph database, so it will take huge ammount of time.

    WARNING:
    You will lose your nodes metadata during full database rebuild !

#### Flush database (DANGEROUS!)
Done by sending POST request to **/api/graph/flush**. Request body should be empty. Never do this operation, unless you know what you do!

Source directories
-------------------

* app.js - Application entry point of node.js
* /routes/ - RESTful API controllers
* /config/ - Configuration files
* /db/ - Database related functions

Startup
--------
Startup is done by
> nodejs ./bin/www \
**OR** \
> nodejs app.js

Application will listen port specified in configuration file or by PORT env.
