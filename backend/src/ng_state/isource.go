package ng_state

import "net"

type (
	IStateSource interface {
		GetHostsStateByName(host_names []string) ([]HostState, error)
		GetHostStateByName(host_name string) (HostState, error)

		GetHostsStateByIP(ip_addresses []net.IP) ([]HostState, error)
		GetHostStateByIP(ip_address net.IP) (HostState, error)

		GetAllHostsState() ([]HostState, error)

		InMemory() bool
		InExternal() bool
		GetSourceName() string
		GetFullName() string
	}
)
