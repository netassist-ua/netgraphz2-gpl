namespace php shared

struct NetGraphzServiceInfo {
	1: required string name
	2: required i64 uptime 
	3: required string version
	4: required string hostname
}

service NetGraphzService {
  NetGraphzServiceInfo getServiceInfo() 
}
