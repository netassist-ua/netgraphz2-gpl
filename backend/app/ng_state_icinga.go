package ng_state

import "./livestatus"

type IcinaLiveStatusConfig struct {
  Hostname string
  Port  uint16
  UseUnixSocket bool
  UnixSocket string
}


type icingaStatusService struct {
  config IcingaLiveStatusConfig
}


func NewIcingaLiveStatusService(IcingaLiveStatusConfig config) *icingaStatusService {
  m := new(icingaStatusService)
  m.config = config
  return m;
}

func (self * IcingaLiveStatusConfig) GetHostsStateByName( host_names []string ) []HostState {

}
