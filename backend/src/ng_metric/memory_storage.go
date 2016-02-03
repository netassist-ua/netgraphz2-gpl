package ng_metric

import (
	ring "container/ring"
	"errors"
	"fmt"
	uuid "github.com/pborman/uuid"
	"log"
	"sync"
	"time"
)

type (
	MemoryMetricRing struct {
		r *ring.Ring
		m Metric
		sync.RWMutex
	}

	MemoryMetricStorage struct {
		capacity   int
		uid        uuid.UUID
		rings      map[string]*MemoryMetricRing
		host_rings map[string]map[string]*MemoryMetricRing
		sync.RWMutex
	}
)

func newMemoryMetricRing(metric Metric, capacity int) *MemoryMetricRing {
	m := &MemoryMetricRing{}
	m.r = ring.New(capacity)
	m.m = metric
	return m
}

func NewMemoryStorage(capacity int) *MemoryMetricStorage {
	m := &MemoryMetricStorage{}
	m.capacity = capacity
	m.rings = make(map[string]*MemoryMetricRing)
	m.host_rings = make(map[string]map[string]*MemoryMetricRing)
	m.uid = uuid.NewRandom()
	return m
}

func (self *MemoryMetricStorage) GetMetricByName(name string) (Metric, error) {
	self.RLock()
	defer self.RUnlock()
	ring, found := self.rings[name]
	if !found {
		return nil, errors.New("Cannot find metric")
	}
	ring.RLock()
	defer ring.RUnlock()
	return ring.m, nil
}

func (self *MemoryMetricStorage) GetAllMetrics() ([]Metric, error) {
	self.RLock()
	defer self.RUnlock()
	metrics := make([]Metric, len(self.rings))
	i := 0
	for key := range self.rings {
		self.rings[key].RLock()
		metrics[i] = self.rings[key].m
		self.rings[key].RUnlock()
		i++
	}
	return metrics, nil
}

func (self *MemoryMetricStorage) CountMetrics() int32 {
	self.RLock()
	defer self.RUnlock()
	return int32(len(self.rings))
}

func (self *MemoryMetricStorage) AddMetricValue(m Metric, val MetricValue) error {
	self.RLock()
	host := m.GetHost()
	mr, found := self.rings[GetMetricString(m)]
	hr, host_found := self.host_rings[host]
	self.RUnlock()
	if !found {
		self.Lock()
		mr = newMemoryMetricRing(m, self.capacity)
		self.rings[GetMetricString(m)] = mr
		self.Unlock()
	}
	if !host_found {
		self.Lock()
		host_entry := make(map[string]*MemoryMetricRing)
		host_entry[GetMetricString(m)] = mr
		self.host_rings[host] = host_entry
		self.Unlock()
	} else {
		self.Lock()
		hr[GetMetricString(m)] = mr
		self.Unlock()
	}
	mr.Lock()
	if found {
		mr.r = mr.r.Next()
	}
	mr.r.Value = val
	mr.Unlock()
	return nil
}

func (self *MemoryMetricStorage) DeleteMetricValue(val MetricValue) bool {
	//TODO: Implement DeleteMetricValue
	log.Println("DeleteMetricValue for MemoryMetricStorage is not implemented yet")
	return false
}

func (self *MemoryMetricStorage) GetLastMetricValue(m Metric) (MetricValue, error) {
	metrics, err := self.GetLastMetricValues(m, 0, 1)
	if err != nil || len(metrics) == 0 {
		return MetricValue{}, err
	}
	return metrics[0], nil
}

func (self *MemoryMetricStorage) GetMetricValueByTimeRange(m Metric, since time.Time, duration time.Duration) ([]MetricValue, error) {
	end := since.Add(duration)
	res := []MetricValue{}
	if since.Before(time.Now()) {
		return nil, errors.New("Time start should be before current time")
	}
	self.RLock()
	mr, found := self.rings[GetMetricString(m)]
	self.RUnlock()
	if !found {
		return res, nil //Metric not found, return nothing
	}
	mr.RLock()
	defer mr.RUnlock()
	r := mr.r
	for i := 0; i < self.capacity; i++ {
		metricValue, valid := r.Value.(MetricValue)
		if !valid {
			res = res[:i]
			break
		}
		if metricValue.Time.Before(since) {
			break
		}
		if metricValue.Time.After(since) && metricValue.Time.Before(end) {
			res = append(res, metricValue)
		}
		r = r.Prev()
	}
	return res, nil
}

func (self *MemoryMetricStorage) CountValues(m Metric) (int64, error) {
	self.RLock()
	mr, found := self.rings[GetMetricString(m)]
	self.RUnlock()
	if !found {
		return 0, errors.New("Cannot find metric")
	}
	mr.RLock()
	r := mr.r
	defer mr.RUnlock()
	var counter int64 = 0
	for r.Value != nil && counter < int64(self.capacity) {
		counter++
		r = r.Prev()
	}
	return counter, nil
}

func (self *MemoryMetricStorage) GetLastMetricValues(m Metric, n_skip int, n_get int) ([]MetricValue, error) {
	res := make([]MetricValue, n_get)
	self.RLock()
	mr, found := self.rings[GetMetricString(m)]
	self.RUnlock()
	if !found {
		return []MetricValue{}, nil
	}
	mr.RLock()
	defer mr.RUnlock()
	r := mr.r
	for i := 0; i < n_skip; i++ {
		r = r.Prev()
	}
	last_time := time.Now()
	if value, valid := r.Value.(MetricValue); valid {
		last_time = value.Time
	}
	for i := 0; i < n_get; i++ {
		value, valid := r.Value.(MetricValue)
		if !valid || value.Time.After(last_time) {
			res = res[:i]
			break
		}
		res[i] = value
		last_time = value.Time
		r = r.Prev()
	}
	return res, nil
}

func (self *MemoryMetricStorage) GetMetricsByHost(host_name string) ([]Metric, error) {
	self.RLock()
	defer self.RUnlock()
	host_map, found := self.host_rings[host_name]
	if !found {
		return []Metric{}, nil
	}
	metrics := make([]Metric, len(host_map))
	i := 0
	for key := range host_map {
		ring, _ := host_map[key]
		ring.RLock()
		metrics[i] = ring.m
		ring.RUnlock()
		i++
	}
	return metrics, nil
}

func (self *MemoryMetricStorage) GetName() string {
	return "MemoryMetricStorage"
}

func (self *MemoryMetricStorage) IsMemory() bool {
	return true
}

func (self *MemoryMetricStorage) IsLimited() bool {
	return true
}

func (self *MemoryMetricStorage) Flush() bool {
	return true
}

func (self *MemoryMetricStorage) GetFullName() string {
	return fmt.Sprintf("%s:%s", self.GetName(), self.uid.String())
}
