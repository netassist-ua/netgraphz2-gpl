package ng_state

import "net"

type IPBinString string

func IPToBinString(ip net.IP) IPBinString {
	return IPBinString(string(ip[:]))
}

func BinStringToIP(binstring string) net.IP {
	return []byte(binstring)
}
