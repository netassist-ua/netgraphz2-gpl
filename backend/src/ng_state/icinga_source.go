package ng_state

import (
	"errors"
	"fmt"
	livestatus "github.com/netassist-ua/go-livestatus"
	"net"
	"regexp"
	"strconv"
	"time"
)

//Provides interface of state Icinga2 MKLiveStatus state source
type IcingaStateSource struct {
	config IcingaLiveStatusConfig
	l      *livestatus.Livestatus
}

var pack_loss_r *regexp.Regexp
var duplicate_r *regexp.Regexp

func init() {
	pack_loss_r = regexp.MustCompile(`^rta=([0-9]+\.?[0-9]*)ms;([0-9]+\.?[0-9]*);([0-9]+\.?[0-9]*);([0-9]+\.?[0-9]*) pl=([0-9]+)%;([0-9]+);([0-9]+);([0-9]+)$`)
	duplicate_r = regexp.MustCompile(`^PING WARNING - DUPLICATES FOUND! .*$`)
}

func NewIcingaLiveStateSource(config IcingaLiveStatusConfig) *IcingaStateSource {
	m := new(IcingaStateSource)
	m.config = config
	m.l = config.GetLiveStatusConnection()
	return m
}

func getRTTPacketLossFromPerfdata(perf_data string) (rtt float32, loss float32, dup bool, err error) {
	rtt = 0
	loss = 0
	dup = false
	var (
		b_rtt  float64
		b_loss float64
	)
	matches := pack_loss_r.FindStringSubmatch(perf_data)
	if len(matches) != 9 {
		err = errors.New("Perfdata string does not match regular expression")
		return
	}
	d_matches := duplicate_r.FindStringSubmatch(perf_data)
	if len(d_matches) > 0 {
		dup = true
	}
	if b_rtt, err = strconv.ParseFloat(matches[1], 32); err != nil {
		return
	}
	if b_loss, err = strconv.ParseFloat(matches[5], 32); err != nil {
		return
	}
	rtt = float32(b_rtt)
	loss = float32(b_loss)
	return
}

func icinga_state_to_effective_state(state int16, has_been_checked bool, is_flapping bool, num_services_crit int32, num_services_warn int32) EffectiveHostState {
	if !has_been_checked {
		return E_STATE_UNKNOWN
	}
	if is_flapping {
		return E_STATE_FLAPPING
	}
	if (NetworkState(state) != STATE_DOWN) && (num_services_crit > 0 || num_services_warn > 0) {
		return E_STATE_WARNING
	}
	return EffectiveHostState(state)
}

func icinga_state_to_netstate(state int16) NetworkState {
	return NetworkState(state) //no action required
}

func get_rec_err_strval(rec livestatus.Record, field string, in_err error) (value string, err error) {
	var parse_err error
	err = in_err
	if value, parse_err = rec.GetString(field); parse_err != nil {
		err = parse_err
	}
	return
}

func get_rec_err_intval(rec livestatus.Record, field string, in_err error) (value int64, err error) {
	var parse_err error
	err = in_err
	if value, parse_err = rec.GetInt(field); parse_err != nil {
		err = parse_err
	}
	return
}

func get_rec_err_boolval(rec livestatus.Record, field string, in_err error) (value bool, err error) {
	var parse_err error
	err = in_err
	if value, parse_err = rec.GetBool(field); parse_err != nil {
		err = parse_err
	}
	return
}

func dispatchLivestatusHostsResponse(resp *livestatus.Response, sourceName string) ([]HostState, error) {
	var (
		states     []HostState
		s          HostState
		last_error error = nil
	)
	for _, r := range resp.Records {
		var (
			num_services         int64
			num_services_crit    int64
			num_services_warn    int64
			num_services_ok      int64
			num_services_unknown int64
			num_services_pending int64
			state                int64
			hard_state           int64
			host_name            string
			name                 string
			has_been_checked     bool
			is_flapping          bool
			is_executing         bool
			is_reachable         bool
			duplicate            bool
			label                string
			address              string
			address6             string
			notes                string
			perf_data            string
			plugin_output        string
			rtt                  float32
			loss                 float32
			state_type           int64
			last_check           int64
			err                  error = nil
		)

		notes, last_error = get_rec_err_strval(r, "notes", last_error)
		host_name, last_error = get_rec_err_strval(r, "host_name", last_error)
		address, last_error = get_rec_err_strval(r, "address", last_error)
		address6, last_error = get_rec_err_strval(r, "address6", last_error)
		perf_data, last_error = get_rec_err_strval(r, "perf_data", last_error)
		label, last_error = get_rec_err_strval(r, "display_name", last_error)
		name, last_error = get_rec_err_strval(r, "name", last_error)
		plugin_output, last_error = get_rec_err_strval(r, "plugin_output", last_error)
		is_flapping, last_error = get_rec_err_boolval(r, "is_flapping", last_error)
		is_executing, last_error = get_rec_err_boolval(r, "is_executing", last_error)
		is_reachable, last_error = get_rec_err_boolval(r, "is_reachable", last_error)
		has_been_checked, last_error = get_rec_err_boolval(r, "has_been_checked", last_error)
		state_type, last_error = get_rec_err_intval(r, "state_type", last_error)
		state, last_error = get_rec_err_intval(r, "state", last_error)
		hard_state, last_error = get_rec_err_intval(r, "hard_state", last_error)
		num_services, last_error = get_rec_err_intval(r, "num_services", last_error)
		num_services_ok, last_error = get_rec_err_intval(r, "num_services_ok", last_error)
		num_services_crit, last_error = get_rec_err_intval(r, "num_services_crit", last_error)
		num_services_warn, last_error = get_rec_err_intval(r, "num_services_warn", last_error)
		num_services_pending, last_error = get_rec_err_intval(r, "num_services_pending", last_error)
		num_services_unknown, last_error = get_rec_err_intval(r, "num_services_unknown", last_error)
		last_check, last_error = get_rec_err_intval(r, "last_check", last_error)
		if rtt, loss, duplicate, err = getRTTPacketLossFromPerfdata(perf_data); err != nil {
			last_error = err
		}

		s.HostName = host_name
		s.Name = name
		s.Label = label
		s.Source = sourceName
		s.HasBeenChecked = has_been_checked
		s.State = icinga_state_to_netstate(int16(state))
		s.EffectiveState = icinga_state_to_effective_state(int16(state), has_been_checked, is_flapping, int32(num_services_crit), int32(num_services_warn))
		s.HardState = icinga_state_to_netstate(int16(hard_state))
		s.Loss = loss
		s.RTT = rtt
		s.Time = time.Unix(last_check, 0)
		s.Notes = notes
		s.IP = net.ParseIP(address)
		s.IP6 = net.ParseIP(address6)
		s.Output = plugin_output
		s.IsFlapping = is_flapping
		s.IsExecuting = is_executing
		s.IsReachable = is_reachable
		s.NumServices = int32(num_services)
		s.NumServicesOk = int32(num_services_ok)
		s.NumServicesWarning = int32(num_services_warn)
		s.NumServicesCritical = int32(num_services_crit)
		s.NumServicesPending = int32(num_services_pending)
		s.NumServicesUnknown = int32(num_services_unknown)
		s.Type = StateType(state_type)
		s.IsDuplicate = duplicate
		states = append(states, s)
	}
	return states, nil
}

func (self *IcingaStateSource) execQuery(query *livestatus.Query) (*livestatus.Response, error) {
	if self.config.TimeoutEnable {
		return query.ExecTimeout(self.config.Timeout)
	}
	return query.Exec()
}

func (self *IcingaStateSource) getHostsTableStateQuery() *livestatus.Query {
	q := self.l.Query("hosts")
	q.Columns("host_name", "name", "last_check", "display_name", "notes", "address", "address6", "has_been_checked", "num_services", "num_services_crit", "num_services_warn", "num_services_pending", "num_services_ok", "num_services_unknown", "state", "hard_state", "state_type", "perf_data", "plugin_output", "is_flapping", "is_executing")
	return q
}

func (self *IcingaStateSource) GetHostStateByName(host_name string) (HostState, error) {
	states, err := self.GetHostsStateByName([]string{host_name})
	if len(states) == 0 {
		return HostState{}, errors.New("Host not found")
	}
	if err != nil {
		return HostState{}, err
	}
	return states[0], nil
}

func (self *IcingaStateSource) GetHostsStateByName(host_names []string) ([]HostState, error) {
	if len(host_names) == 0 {
		return []HostState{}, nil
	}
	q := self.getHostsTableStateQuery()
	for _, host := range host_names {
		q.Filter(fmt.Sprintf("host_name = %s", host))
	}
	if len(host_names) > 1 {
		q.Or(len(host_names))
	}
	resp, err := self.execQuery(q)
	if err != nil {
		return []HostState{}, err
	}
	return dispatchLivestatusHostsResponse(resp, self.GetFullName())
}

func (self *IcingaStateSource) GetHostsStateByIP(ip_addresses []net.IP) ([]HostState, error) {
	if len(ip_addresses) == 0 {
		return []HostState{}, nil
	}
	q := self.getHostsTableStateQuery()
	for _, ip := range ip_addresses {
		if len(ip) == net.IPv6len {
			q.Filter(fmt.Sprintf("address6 = %s", ip.String()))
		} else {
			q.Filter(fmt.Sprintf("address = %s", ip.String()))
		}
	}
	if len(ip_addresses) > 1 {
		q.Or(len(ip_addresses))
	}
	resp, err := self.execQuery(q)
	if err != nil {
		return []HostState{}, err
	}
	return dispatchLivestatusHostsResponse(resp, self.GetFullName())
}

func (self *IcingaStateSource) GetHostStateByIP(ip_address net.IP) (HostState, error) {
	states, err := self.GetHostsStateByIP([]net.IP{ip_address})
	if len(states) == 0 {
		return HostState{}, errors.New("Host not found")
	}
	if err != nil {
		return HostState{}, err
	}
	return states[0], nil
}

func (self *IcingaStateSource) GetAllHostsState() ([]HostState, error) {
	q := self.getHostsTableStateQuery()
	resp, err := self.execQuery(q)
	if err != nil {
		return []HostState{}, err
	}
	return dispatchLivestatusHostsResponse(resp, self.GetFullName())
}

func (self *IcingaStateSource) InMemory() bool {
	return false
}

func (self *IcingaStateSource) InExternal() bool {
	return true
}

func (self *IcingaStateSource) GetSourceName() string {
	return "Icinga2MKLiveStatus"
}

func (self *IcingaStateSource) GetFullName() string {
	if self.config.UseUnixSocket {
		return fmt.Sprintf("%s:%s", self.GetSourceName(), self.config.UnixSocket)
	}
	return fmt.Sprintf("%s@%s:%d", self.GetSourceName(), self.config.HostName, self.config.Port)
}
