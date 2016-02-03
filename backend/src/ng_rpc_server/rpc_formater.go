package ng_rpc_server

import (
	"bytes"
	"encoding/binary"
	"errors"
	"github.com/golang/protobuf/proto"
	"log"
	graph "ng_graph"
	metric "ng_metric"
	rpc "ng_rpc"
	state "ng_state"
)

func metric_value_to_rpc(m metric.MetricValue) (rpc_val *rpc.MetricVal, err error) {
	rpc_val = &rpc.MetricVal{
		Time: proto.Uint64(uint64(m.Time.Unix())),
		Kind: rpc.MetricVal_Kind(m.Kind + 1).Enum(),
		Name: proto.String(m.Name),
		Type: proto.String("host"),
	}
	err = nil
	defer func() {
		if r := recover(); r != nil {
			switch x := r.(type) {
			case string:
				err = errors.New(x)
			case error:
				err = x
			default:
				err = errors.New("Unknown panic")
			}
			log.Printf("Recover metric_value_to_rpc from error: %v\n", err)
		}
	}()
	switch m.Kind {
	case metric.METRIC_GAUGE:
		rpc_val.GaugeValue = proto.Float32(float32(m.Value.(float64)))
	case metric.METRIC_COUNTER:
		rpc_val.CounterValue = proto.Uint64(m.Value.(uint64))
	case metric.METRIC_DERIVE:
		rpc_val.DeriveValue = proto.Int64(m.Value.(int64))
	default:
		buffer := &bytes.Buffer{}
		err := binary.Write(buffer, binary.LittleEndian, m.Value)
		if err != nil {
			log.Printf("Cannot serialize data: %s\n", err)
		} else {
			rpc_val.OtherValue = buffer.Bytes()
		}
	}
	return
}

func host_to_rpc(host *graph.Host, states []state.HostState, metrics map[string][]metric.MetricValue) *rpc.Node {
	node := &rpc.Node{
		Id:         proto.Int32(int32(host.Id)),
		Name:       proto.String(host.Name),
		Address:    proto.String(host.Address),
		Model:      proto.String(host.Model),
		MacAddress: proto.String(host.MACAddress),
		Comment:    proto.String(host.Comment),
		Serial:     proto.String(host.Serial),
		Ip4:        proto.Uint32(ipv4_to_uint32(host.IP)),
		Ip6:        []byte(host.IP6.To16()),
		DbId:       proto.Int32(int32(host.DBImportSwitchId)),
		IcingaName: proto.String(host.IcingaName),
	}
	if len(states) > 0 {
		node.States = make([]*rpc.NodeState, len(states))
		for index, s := range states {
			n_state := &rpc.NodeState{
				Rtt:                 proto.Float32(s.RTT),
				Loss:                proto.Float32(s.Loss),
				State:               rpc.NodeState_State(s.State).Enum(),
				HardState:           rpc.NodeState_State(s.HardState).Enum(),
				DescriptiveState:    rpc.NodeState_DescState(s.EffectiveState).Enum(),
				IsHardState:         proto.Bool(s.IsHardState),
				IsFlapping:          proto.Bool(s.IsFlapping),
				IsReachable:         proto.Bool(s.IsReachable),
				IsExecuting:         proto.Bool(s.IsExecuting),
				Time:                proto.Uint64(uint64(s.Time.Unix())),
				Source:              proto.String(s.Source),
				Output:              proto.String(s.Output),
				NumServices:         proto.Int32(s.NumServices),
				NumServicesOk:       proto.Int32(s.NumServicesOk),
				NumServicesCritical: proto.Int32(s.NumServicesCritical),
				NumServicesWarning:  proto.Int32(s.NumServicesWarning),
				NumServicesPending:  proto.Int32(s.NumServicesPending),
				NumServicesUnknown:  proto.Int32(s.NumServicesUnknown),
				Notes:               proto.String(s.Notes),
				HasBeenChecked:      proto.Bool(s.HasBeenChecked),
				IsDuplicate:         proto.Bool(s.IsDuplicate),
			}
			node.States[index] = n_state
		}
	}
	node.LastMetricValues = make(map[string]*rpc.MetricValCollection)
	for key := range metrics {
		values, _ := metrics[key]
		if len(values) == 0 {
			continue
		}
		collection := &rpc.MetricValCollection{}
		collection.Name = proto.String(key)
		collection.Values = make([]*rpc.MetricVal, len(values))
		for index, value := range values {
			collection.Values[index], _ = metric_value_to_rpc(value)
		}
		node.LastMetricValues[key] = collection
	}
	return node
}

func link_to_rpc(link *graph.Link) *rpc.Link {
	return &rpc.Link{
		Id:             proto.Int32(int32(link.Id)),
		StartNodeId:    proto.Int32(int32(link.SrcNodeId)),
		EndNodeId:      proto.Int32(int32(link.DstNodeId)),
		DbStartId:      proto.Int32(int32(link.SrcImportId)),
		DbEndId:        proto.Int32(int32(link.DstImportId)),
		Quality:        proto.Int32(int32(link.Quality)),
		SrcSwPort:      proto.Int32(int32(link.SrcPort)),
		DstSwPort:      proto.Int32(int32(link.DstPort)),
		Comment:        proto.String(link.Comment),
		Type:           rpc.Link_LinkType(link.Type).Enum(),
		CapacityMbit:   proto.Int32(int32(link.CapacityMbit)),
		RxOctetsMetric: proto.String(link.RXOctetsMetric),
		TxOctetsMetric: proto.String(link.TXOctetsMetric),
	}
}
