package ng_rpc_server

import "net"

func ipv4_to_uint32(ip net.IP) uint32 {
	var uip uint32 = 0
	ip = ip.To4()
	if len(ip) < 4 {
		return 0
	}
	uip = uint32(ip[3])
	uip = uip | uint32(ip[0])<<24
	uip = uip | uint32(ip[1])<<16
	uip = uip | uint32(ip[2])<<8
	return uip
}
