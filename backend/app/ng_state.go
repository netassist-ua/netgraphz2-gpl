package ng_state

import "net"

type (
	HostState struct {
		host_name	string
		state		int
		loss		float32
		rtt		float32
	}
	StateService interface {
		GetHostsStateByName( host_names []string ) []HostState
		GetHostStateByName( host_name string ) HostState
		GetHostsStateByIPv4Address(ip_addresses []net.IP) []HostState
		GetHostStateByIPv4Address(ip_address net.IP) HostState
		GetHostsStateByIPv6Address(ip_addresses []net.IP) []HostState
		GetHostStateByIPv6Address(ip_address net.IP) HostState
		GetAllHostsState( ) []HostState
		GetMonitoredHostCount( ) int32
	}
)
