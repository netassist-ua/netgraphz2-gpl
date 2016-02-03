package ng_state

import "net"

type (
	IStatusService interface {
		GetHostsStatusByName(host_names []string) (map[string][]HostState, error)
		GetHostStatusByName(host_name string) ([]HostState, error)

		GetHostsStatusByIP(ip_addresses []net.IP) (map[IPBinString][]HostState, error)
		GetHostStatusByIP(ip_address net.IP) ([]HostState, error)

		AddSource(source IStateSource)
	}
)
