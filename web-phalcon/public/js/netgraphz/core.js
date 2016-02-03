/*
 * @typedef MetricValue
 * @type {object}
 * @param {string} name - Series name
 * @param {string} type - Metric object type
 * @param {number} kind - Kind of metric {0 - gauge, 1 - derive, 2 - counter, 3 - absolute value}
 * @param {object} value - Value of metric 
 * @param {number} time - Unix timestamp of metric value
 */


/*
 * @typedef Metric
 * @type {object}
 * @param {string} name - Metric name
 * @param {MetricValue[]} values - Metric values
 */


/*
 * @typedef NodeStatus
 * @type {object}
 * @property {string} source - Source name
 * @property {boolean} dup - Duplicate of ping detected
 * @property {number} effective_state - Effective (extended) of node
 * @property {number} hard_state - Hard state of node {0 - up, 1 - down, 2 - unreachable}
 * @property {boolean} is_executing - Is executing
 * @property {boolean} is_flapping - Is node flapping
 * @property {boolean} is_hard_state - Is node in hard state
 * @property {boolean} is_reachable - Is node reachable
 * @property {number} loss - Packet loss
 * @property {string} notes - Notes
 * @property {number} num_services - Number of services
 * @property {number} num_services_critical - Number of services in critical state
 * @property {number} num_services_ok - Number of service in OK state
 * @property {number} num_services_pending - Number of services in pending check
 * @property {number} num_services_unknown - Number of services in unknown state
 * @property {number} num_services_warning - Number of services in warning state
 * @property {string} output - Output from check plugin of monitoring source
 * @property {number} rtt - RTT
 * @property {number} state - State of node {0 - up, 1 - down, 2 - unreachable}
 * @property {number} time - Unix timestamp
 */

/*
 * @typedef Node
 * @type {object}
 * @property {number} id - Identifier of node
 * @property {number} db_id - Database identifier of exported node
 * @property {string} address - Node location address
 * @property {string} comment - Node comment
 * @property {string} ip - IPv4 Address of the node
 * @property {string} ip6 - IPv6 Address of the node
 * @property {string} name - Name
 * @property {string} model - Hardware model name
 * @property {string} serial - Hardware serial number
 * @property {number} x - X coordinate of saved position
 * @property {number} y - Y coordinate of saved position
 * @property {number} port_number - Number of ports for switch or router
 * @property {string} mac - MAC Address of management interface
 * @property {NodeStatus[]} status - Collection of status records from sources
 * @property {Metric[]} metrics - Metrics of node
 */

/*
 * @typeof LinkConnection
 * @type {object}
 * @property {number} id - Identifier of connection node
 * @property {number} db_sw_id - Identifier of import node id
 * @property {number} port_id - Number port number on connected node
 */

/*
 * @typedef Link
 * @type {object}
 * @property {number} id - Identifier of link
 * @property {number} link_speed - Speed of link mbps
 * @property {number} db_sw_id - Import database link identifier
 * @property {string} rx_octets - RX octets link metric
 * @property {string} tx_octets - TX octets link metric
 * @property {string} oper_status - Operational status link metric
 * @property {string} comment - Link comment
 * @property {LinkConnection} src - Source link connection
 * @property {LinkConnection} dst - Destination link connection
 */

var netgraphz = netgraphz || { };
netgraphz.core = (function(){
  var exports = {};
  exports.build = Object.freeze({
    version: "2.0.1a"
  });
  exports.node_state = Object.freeze({
    STATE_NODE_DOWN: 1,
    STATE_NODE_UP: 0,
    STATE_NODE_WARN: 2,
    STATE_NODE_UNKNOWN: 3,
    STATE_NODE_FLAP: 4
  });



  return exports;

})();
