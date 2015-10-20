/**
 *
 *  bool        Boolean, one byte
 *  byte        Signed byte
 *  i16         Signed 16-bit integer
 *  i32         Signed 32-bit integer
 *  i64         Signed 64-bit integer
 *  double      64-bit floating point value
 *  string      String
 *  binary      Blob (byte array)
 *  map<t1,t2>  Map from one type to another
 *  list<t1>    Ordered list of one type
 *  set<t1>     Set of unique elements of one type
 *
 */

include "shared.thrift"

namespace cpp NetGraphz2
namespace java NetGraphz2 
namespace php NetAssist

struct GraphStatusResponse {
	1: required i64 last_status_update
	2: required i64 last_metrics_update
	3: optional i32 nodes_count
	4: optional i32 links_count
	5: required i64 daemon_uptime
	6: required bool icinga_alive
	7: required bool graph_alive
}

enum HostState { 
	UP = 0,
	DOWN = 1,
	WARNING = 2,
	UNREACHABLE = 3,
	UNKNOWN = 4
}



struct HostStatus { 
	1: required i64 host_id
	2: required HostState state
	3: optional i64 last_update_timestamp
	4: optional i32 num_services
	5: optional i32 num_services_ok
	6: optional i32 num_services_down
	7: optional i32 num_services_warning
	8: optional double rtt
	9: optional double loss
} 

struct Host { 
	1: required i64 id
	2: optional i64 db_import_id
	3: required string name
	4: optional string icinga_name
	5: optional string ip_address
	6: optional string ip6_address
	7: optional string mac_address
	8: optional string address
	9: optional double longtitude
	10: optional double latitude
	11: optional string model
	12: optional string revision
	13: optional string comment
	14: optional i32 net_id
	16: optional i16 vlan_id
	18: optional i32 location_id
	19: optional i64 last_sync_time  
	20: optional HostStatus status
}

/**
 * Structs can also be exceptions, if they are nasty.
 */
exception InvalidOperation {
  1: i32 what,
  2: string why
}

service Backend extends shared.NetGraphzService { 
	GraphStatusResponse GetStatus( )
	
	list< Host > GetAllHosts() 
} 


