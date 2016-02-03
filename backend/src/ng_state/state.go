package ng_state

import (
	"net"
	"time"
)

const (
	STATE_UNREACH NetworkState = 2
	STATE_DOWN    NetworkState = 1
	STATE_UP      NetworkState = 0
)

const (
	E_STATE_UP       EffectiveHostState = 0
	E_STATE_DOWN     EffectiveHostState = 1
	E_STATE_WARNING  EffectiveHostState = 2
	E_STATE_UNKNOWN  EffectiveHostState = 3
	E_STATE_FLAPPING EffectiveHostState = 4
)

const (
	STATE_TYPE_SOFT StateType = 0
	STATE_TYPE_HARD StateType = 1
)

type (
	StateType          int16
	NetworkState       int16
	EffectiveHostState int16
	HostState          struct {
		Type                StateType
		State               NetworkState
		HardState           NetworkState
		EffectiveState      EffectiveHostState
		Loss                float32
		RTT                 float32
		Time                time.Time
		Source              string
		HostName            string
		Output              string
		NumServices         int32
		NumServicesCritical int32
		NumServicesWarning  int32
		NumServicesPending  int32
		NumServicesOk       int32
		NumServicesUnknown  int32
		IsExecuting         bool
		IsFlapping          bool
		IsReachable         bool
		IsHardState         bool
		IP                  net.IP
		IP6                 net.IP
		Name                string
		Label               string
		Notes               string
		IsDuplicate         bool
		HasBeenChecked      bool
	}
)
