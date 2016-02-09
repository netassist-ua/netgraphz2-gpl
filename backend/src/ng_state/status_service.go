package ng_state

import (
	"errors"
	"log"
	"net"
	"sync"
	"time"
)

type StatusService struct {
	sources   []IStateSource
	cache     IStateCache
	cache_ttl time.Duration
	src_mutex sync.RWMutex
}

func NewStatusService(cache IStateCache, cache_ttl time.Duration) *StatusService {
	srv := &StatusService{}
	srv.cache = cache
	srv.cache_ttl = cache_ttl
	srv.src_mutex = sync.RWMutex{}
	return srv
}

func (s *StatusService) AddSource(source IStateSource) {
	s.src_mutex.Lock()
	s.sources = append(s.sources, source)
	defer s.src_mutex.Unlock()
}

func (s *StatusService) get_source_by_name(source_name string) IStateSource {
	s.src_mutex.RLock()
	defer s.src_mutex.RUnlock()
	for _, src := range s.sources {
		if src.GetFullName() == source_name {
			return src
		}
	}
	return nil
}

/*
	Push state list into hostname map
*/

func states_to_name_map(m map[string][]HostState, states []HostState) {
	for _, state := range states {
		_, found := m[state.HostName]
		if !found {
			m[state.HostName] = []HostState{}
		}
		m[state.HostName] = append(m[state.HostName], state)
	}
}

/*
	Push state list into ip map
*/
func states_to_ip_map(m map[IPBinString][]HostState, states []HostState) {
	for _, state := range states {
		if state.IP != nil {
			_, found := m[IPToBinString(state.IP)]
			if !found {
				m[IPToBinString(state.IP)] = []HostState{}
			}
			m[IPToBinString(state.IP)] = append(m[IPToBinString(state.IP)], state)
		}
		if state.IP6 != nil {
			_, found := m[IPToBinString(state.IP6)]
			if !found {
				m[IPToBinString(state.IP6)] = []HostState{}
			}
			m[IPToBinString(state.IP6)] = append(m[IPToBinString(state.IP6)], state)
		}
	}

}

func (s *StatusService) fetch_cache_name_map(m map[string][]HostState, host_names []string, source string) (count int32, last_error error) {
	count = 0
	src := s.get_source_by_name(source)
	if src == nil {
		log.Println("[bug?] cannot find source %s in service in fetch_cache_name_map", source)
		last_error = errors.New("source not found")
		return
	}
	states, err := src.GetHostsStateByName(host_names)
	if err != nil {
		last_error = err
		return
	}
	if states != nil {
		count = int32(len(states))
		s.put_states_cache(states)
		states_to_name_map(m, states)
	}
	return
}

func (s *StatusService) fetch_cache_ip_map(m map[IPBinString][]HostState, ip_addrs []net.IP, source string) (count int32, last_error error) {
	count = 0
	src := s.get_source_by_name(source)
	if src == nil {
		log.Println("[bug?] cannot find source %s in service in fetch_cache_ip_map", source)
		last_error = errors.New("source not found")
		return
	}
	states, err := src.GetHostsStateByIP(ip_addrs)
	if err != nil {
		last_error = err
		return
	}
	if states != nil {
		count = int32(len(states))
		s.put_states_cache(states)
		states_to_ip_map(m, states)
	}
	return
}

/*
	Push state list to the cache
*/
func (s *StatusService) put_states_cache(states []HostState) {
	for _, state := range states {
		s.cache.AddUpdate(state, time.Now())
	}
}

func (s *StatusService) GetHostsStatusByName(host_names []string) (map[string][]HostState, error) {
	var last_error error = nil
	m := make(map[string][]HostState)
	s.src_mutex.RLock()
	defer s.src_mutex.RUnlock()
	for _, src := range s.sources {
		cache_missed := []string{}
		cache_expired := []HostState{}
		cache_expired_hostnames := []string{}
		cache_found := []HostState{}
		for _, host_name := range host_names {
			cache_rec, found := s.cache.GetByName(host_name, src.GetFullName())
			if !found {
				cache_missed = append(cache_missed, host_name)
				continue
			}
			if time.Now().Sub(cache_rec.Time) > s.cache_ttl {
				cache_expired = append(cache_expired, cache_rec.State)
				cache_expired_hostnames = append(cache_expired_hostnames, cache_rec.State.HostName)
				continue
			}
			cache_found = append(cache_found, cache_rec.State)
		}
		states_to_name_map(m, cache_found)
		if _, err := s.fetch_cache_name_map(m, cache_expired_hostnames, src.GetFullName()); err != nil {
			last_error = err
			states_to_name_map(m, cache_expired)
		}
		if _, err := s.fetch_cache_name_map(m, cache_missed, src.GetFullName()); err != nil {
			last_error = err
		}
	}
	return m, last_error
}

func (s *StatusService) GetHostStatusByName(host_name string) ([]HostState, error) {
	status, err := s.GetHostsStatusByName([]string{host_name})
	if err != nil {
		return []HostState{}, err
	}
	if len(status) == 0 {
		return []HostState{}, errors.New("Status not found")
	}
	states, _ := status[host_name]
	return states, nil
}

func (s *StatusService) GetHostsStatusByIP(ip_addresses []net.IP) (map[IPBinString][]HostState, error) {
	var last_error error = nil
	m := make(map[IPBinString][]HostState)
	s.src_mutex.RLock()
	defer s.src_mutex.RUnlock()
	for _, src := range s.sources {
		cache_missed := []net.IP{}
		cache_expired := []HostState{}
		cache_expired_ip := []net.IP{}
		cache_found := []HostState{}
		for _, ip := range ip_addresses {
			cache_rec, found := s.cache.GetByIP(ip, src.GetFullName())
			if !found {
				cache_missed = append(cache_missed, ip)
				continue
			}
			if time.Now().Sub(cache_rec.Time) > s.cache_ttl {
				cache_expired = append(cache_expired, cache_rec.State)
				if cache_rec.State.IP != nil {
					cache_expired_ip = append(cache_expired_ip, cache_rec.State.IP)
				}
				if cache_rec.State.IP6 != nil {
					cache_expired_ip = append(cache_expired_ip, cache_rec.State.IP6)
				}
				continue
			}
			cache_found = append(cache_found, cache_rec.State)
		}
		states_to_ip_map(m, cache_found)
		if _, err := s.fetch_cache_ip_map(m, cache_expired_ip, src.GetFullName()); err != nil {
			last_error = err
			states_to_ip_map(m, cache_expired)
		}
		if _, err := s.fetch_cache_ip_map(m, cache_missed, src.GetFullName()); err != nil {
			last_error = err
		}
	}
	return m, last_error
}

func (s *StatusService) GetHostStatusByIP(ip_address net.IP) ([]HostState, error) {
	status, err := s.GetHostsStatusByIP([]net.IP{ip_address})
	if err != nil {
		return []HostState{}, err
	}
	if len(status) == 0 {
		return []HostState{}, errors.New("Status not found")
	}
	states, _ := status[IPToBinString(ip_address)]
	return states, nil
}
