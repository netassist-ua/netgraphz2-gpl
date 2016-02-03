package ng_metric

import (
	"collectd.org/api"
	"time"
)

type (
	CollectdMetric struct {
		api.Identifier
		DSName   string
		DataType MetricDataType
		Interval time.Duration
	}
)

func ParseCollectdMetric(str string, dsname string) (Metric, error) {
	id, err := api.ParseIdentifier(str)
	m := CollectdMetric{}
	if err != nil {
		return m, err
	}
	m.Identifier = id
	m.DSName = dsname
	return m, nil
}

func (metric CollectdMetric) GetAppName() string {
	return "Collectd"
}

func (metric CollectdMetric) GetCriterias() map[string]string {
	m := make(map[string]string)
	m["host"] = metric.Host
	m["plugin"] = metric.Plugin
	m["plugin_instance"] = metric.PluginInstance
	m["type"] = metric.Type
	m["type_instance"] = metric.TypeInstance
	return m
}

func (metric CollectdMetric) GetHost() string {
	return metric.Host
}

func (metric CollectdMetric) GetMeasurementName() string {
	return metric.DSName
}

func (metric CollectdMetric) GetDuration() time.Duration {
	return metric.Interval
}

func (metric CollectdMetric) GetType() MetricDataType {
	return metric.DataType
}
