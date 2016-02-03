package ng_metric

type (
	MetricSource interface {
		AddStorage(store MetricStorage) bool
		FlushToStorage() bool
		Collect() error
	}
)
