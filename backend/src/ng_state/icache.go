package ng_state

import (
	"net"
	"time"
)

type (
	IStateCache interface {
		//add or update
		AddUpdate(state HostState, timestamp time.Time) CacheRecord
		//get
		GetByName(host_name string, source string) (CacheRecord, bool)
		GetByIP(ip net.IP, source string) (CacheRecord, bool)
		//remove
		RemoveByName(host_name string, source string) bool
		RemoveByIP(ip net.IP, source string) bool
		//remove all
		RemoveAllByName(host_name string) int
		RemoveAllByIP(ip net.IP) int
	}

	CacheRecord struct {
		State HostState
		Time  time.Time
	}
)
