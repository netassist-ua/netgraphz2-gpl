package ng_metric

import "time"

type (
	MetricStorage interface {
		AddMetricValue(m Metric, val MetricValue) error
		DeleteMetricValue(val MetricValue) bool
		GetLastMetricValue(m Metric) (MetricValue, error)
		GetLastMetricValues(m Metric, n_skip int, n_get int) ([]MetricValue, error)
		GetMetricValueByTimeRange(m Metric, since time.Time, duration time.Duration) ([]MetricValue, error)
		GetAllMetrics() ([]Metric, error)
		GetMetricByName(name string) (Metric, error)
		GetMetricsByHost(host_name string) ([]Metric, error)

		CountValues(m Metric) (int64, error)
		CountMetrics() int32
		GetName() string
		GetFullName() string
		IsMemory() bool
		IsLimited() bool
		Flush() bool
	}
)
