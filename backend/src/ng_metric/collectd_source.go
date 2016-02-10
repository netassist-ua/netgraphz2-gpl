package ng_metric

import (
	"collectd.org/api"
	"collectd.org/network"
	_ "log"
	"net"
	"reflect"
	"strconv"
	"sync"
)

type (
	CollectdMetricSource struct {
		storages      []MetricStorage
		server        *network.Server
		writer        *CollectdMetricWriter
		started       bool
		mutex         sync.Mutex
		filter_enable bool
		filter_types  []string
	}
	CollectdMetricWriter struct {
		source *CollectdMetricSource
	}
)

func (w CollectdMetricWriter) Write(vl api.ValueList) error {
	w.source.mutex.Lock()
	defer w.source.mutex.Unlock()
	metrics := make([]CollectdMetric, len(vl.Values))
	metricValues := make([]MetricValue, len(vl.Values))
	for i, val := range vl.Values {
		metrics[i].Identifier = vl.Identifier
		metrics[i].Interval = vl.Interval
		metrics[i].DSName = vl.DSName(i)
		metricValues[i].Time = vl.Time
		metricValues[i].Name = metrics[i].DSName
		switch val.Type() {
		case "derive":
			metrics[i].DataType = METRIC_DERIVE
			v := val.(api.Derive)
			metricValues[i].Value = int64(v)
			metricValues[i].ValueType = reflect.TypeOf(int64(v))
		case "gauge":
			metrics[i].DataType = METRIC_GAUGE
			v := val.(api.Gauge)
			metricValues[i].Value = float64(v)
			metricValues[i].ValueType = reflect.TypeOf(float64(v))
		case "counter":
			metrics[i].DataType = METRIC_COUNTER
			v := val.(api.Counter)
			metricValues[i].Value = uint64(v)
			metricValues[i].ValueType = reflect.TypeOf(uint64(v))
		default:
			metrics[i].DataType = METRIC_ABSOLUTE
		}
		metricValues[i].Kind = metrics[i].DataType
	}
	for _, s := range w.source.storages {
		for i := 0; i < len(vl.Values); i++ {
			if w.source.filter_enable {
				for _, filter_type := range w.source.filter_types {
					if filter_type == metrics[i].Type {
						s.AddMetricValue(metrics[i], metricValues[i])
					}
					break
				}
			} else {
				s.AddMetricValue(metrics[i], metricValues[i])
			}
		}
	}
	return nil
}

func NewCollectdMetricSource(listen_host string, listen_port uint16, filter_enable bool, filter_types []string) *CollectdMetricSource {
	source := &CollectdMetricSource{}
	source.writer = &CollectdMetricWriter{}
	source.writer.source = source
	source.filter_enable = filter_enable
	source.filter_types = filter_types
	source.server = &network.Server{
		Addr:   net.JoinHostPort(listen_host, strconv.FormatUint(uint64(listen_port), 10)),
		Writer: source.writer,
	}
	source.started = false
	return source
}

func (self *CollectdMetricSource) AddStorage(store MetricStorage) bool {
	self.mutex.Lock()
	self.storages = append(self.storages, store)
	defer self.mutex.Unlock()
	return true
}

func (self *CollectdMetricSource) FlushToStorage() bool {
	return true
}

func (self *CollectdMetricSource) Collect() error {
	self.mutex.Lock()
	self.started = true
	self.mutex.Unlock()
	return self.server.ListenAndWrite()
}
