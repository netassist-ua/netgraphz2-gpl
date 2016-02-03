package ng_state

import (
	"net"
	"sync"
	"time"
)

type (
	//Cache map key base structure
	hostMapKey struct {
		source string
	}
	//Cache key by host name
	hostNameMapKey struct {
		hostMapKey
		host_name string
	}
	//Cache key by host IP address
	ipMapKey struct {
		hostMapKey
		ip IPBinString
	}

	//Memory state cache
	MemoryStateCache struct {
		name_mutex sync.RWMutex
		ip_mutex   sync.RWMutex
		src_mutex  sync.RWMutex

		name_map    map[hostNameMapKey]*CacheRecord
		ip_map      map[ipMapKey]*CacheRecord
		src_map     map[string]bool
		last_update time.Time
	}
)

func NewMemoryStateCache() *MemoryStateCache {
	cache := &MemoryStateCache{}
	cache.name_mutex = sync.RWMutex{}
	cache.ip_mutex = sync.RWMutex{}
	cache.src_mutex = sync.RWMutex{}
	cache.name_map = make(map[hostNameMapKey]*CacheRecord)
	cache.ip_map = make(map[ipMapKey]*CacheRecord)
	cache.src_map = make(map[string]bool)
	cache.last_update = time.Now()
	return cache
}

//Get hash key by host name
func getNameMapKey(host_name string, source string) hostNameMapKey {
	key := hostNameMapKey{}
	key.source = source
	key.host_name = host_name
	return key
}

//Get hash key by IP address
func getIPMapKey(ip net.IP, source string) ipMapKey {
	key := ipMapKey{}
	key.source = source
	key.ip = IPToBinString(ip)
	return key
}

//Add or update state record by host name
func (c *MemoryStateCache) AddUpdate(state HostState, timestamp time.Time) CacheRecord {
	c.src_mutex.Lock()
	c.src_map[state.Source] = true
	c.src_mutex.Unlock()

	c.last_update = time.Now()
	key_name := getNameMapKey(state.HostName, state.Source)

	c.name_mutex.Lock()
	c.ip_mutex.Lock()

	r, found := c.name_map[key_name]
	defer c.name_mutex.Unlock()
	defer c.ip_mutex.Unlock()

	if found {
		r.State = state
		r.Time = timestamp
		return *r
	}
	r = &CacheRecord{}
	r.State = state
	r.Time = timestamp

	c.name_map[key_name] = r

	if state.IP != nil {
		key_ip := getIPMapKey(state.IP, state.Source)
		c.ip_map[key_ip] = r
	}
	if state.IP6 != nil {
		key_ip6 := getIPMapKey(state.IP6, state.Source)
		c.ip_map[key_ip6] = r
	}
	return *r
}

//Get cache record by name
func (c *MemoryStateCache) GetByName(host_name string, source string) (CacheRecord, bool) {
	key := getNameMapKey(host_name, source)
	c.name_mutex.RLock()
	defer c.name_mutex.RUnlock()
	r, found := c.name_map[key]
	if !found {
		return CacheRecord{}, false
	}
	return *r, found
}

//Get cache record by IP
func (c *MemoryStateCache) GetByIP(ip net.IP, source string) (CacheRecord, bool) {
	key := getIPMapKey(ip, source)
	c.ip_mutex.RLock()
	r, found := c.ip_map[key]
	defer c.ip_mutex.RUnlock()
	if !found {
		return CacheRecord{}, false
	}
	return *r, found
}

func (c *MemoryStateCache) RemoveByName(host_name string, source string) bool {
	key := getNameMapKey(host_name, source)
	c.name_mutex.Lock()
	c.ip_mutex.Lock()
	defer c.name_mutex.RUnlock()
	defer c.ip_mutex.RUnlock()
	r, found := c.name_map[key]
	if !found {
		return false
	}
	delete(c.name_map, key)
	if r.State.IP != nil {
		delete(c.ip_map, getIPMapKey(r.State.IP, source))
	}
	if r.State.IP6 != nil {
		delete(c.ip_map, getIPMapKey(r.State.IP6, source))
	}
	return true
}

func (c *MemoryStateCache) RemoveByIP(ip net.IP, source string) bool {
	key := getIPMapKey(ip, source)
	c.name_mutex.Lock()
	c.ip_mutex.Lock()
	defer c.name_mutex.RUnlock()
	defer c.ip_mutex.RUnlock()
	r, found := c.ip_map[key]
	if !found {
		return false
	}
	delete(c.ip_map, key)
	delete(c.name_map, getNameMapKey(r.State.HostName, source))
	if r.State.IP6 != nil {
		delete(c.ip_map, getIPMapKey(r.State.IP6, source))
	}
	return true
}

func (c *MemoryStateCache) RemoveAllByName(host_name string) int {
	var counter int = 0
	for source := range c.src_map {
		b := c.RemoveByName(host_name, source)
		if b {
			counter++
		}
	}
	return counter
}

func (c *MemoryStateCache) RemoveAllByIP(ip net.IP) int {
	var counter int = 0
	for source := range c.src_map {
		b := c.RemoveByIP(ip, source)
		if b {
			counter++
		}
	}
	return counter
}
