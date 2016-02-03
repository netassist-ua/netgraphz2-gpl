package ng_state

import (
	"fmt"
	livestatus "github.com/vbatoufflet/go-livestatus"
	"time"
)

//MKLiveStatus configuration
type IcingaLiveStatusConfig struct {
	//Host name to connect
	HostName string
	//Port to connect in case of TCP mode
	Port uint16
	//Use Unix socket mode (default - TCP)
	UseUnixSocket bool
	//Unix Socket path for unix socket mode
	UnixSocket string
	//Enable request timeout
	TimeoutEnable bool
	//Timeout to wait for response from server
	Timeout time.Duration
}

func (self *IcingaLiveStatusConfig) GetLiveStatusConnection() *livestatus.Livestatus {
	if self.UseUnixSocket {
		return livestatus.NewLivestatus("unix", self.UnixSocket)
	} else {
		return livestatus.NewLivestatus("tcp", fmt.Sprintf("%s:%d", self.HostName, self.Port))
	}
}
