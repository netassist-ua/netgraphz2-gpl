package ng_metric

import (
	"errors"
	"fmt"
	"log"
	"math"
	"reflect"
	"sort"
	"strings"
	"time"
)

const (
	METRIC_GAUGE    MetricDataType = 0
	METRIC_DERIVE   MetricDataType = 1
	METRIC_COUNTER  MetricDataType = 2
	METRIC_ABSOLUTE MetricDataType = 3
)

type (
	MetricDataType int16

	//Metric data interface
	Metric interface {
		//Returns metric application name
		GetAppName() string
		//Returns host metric belnogs to
		GetHost() string
		//Returns map of string measurement criterias parameters
		GetCriterias() map[string]string
		//Returns measurement series name
		//In most cases it measurement series name which describes source of information
		GetMeasurementName() string
		//Returns metric data type
		GetType() MetricDataType
		//Get metric duraiton
		GetDuration() time.Duration
	}

	MetricValue struct {
		Name      string
		Time      time.Time
		Kind      MetricDataType
		ValueType reflect.Type
		Value     interface{}
	}
)

func GetMetricString(metric Metric) string {
	criterias := metric.GetCriterias()
	criteriasKeys := make([]string, len(criterias))
	i := 0
	for key := range criterias {
		criteriasKeys[i] = key
		i++
	}
	sort.Strings(criteriasKeys)
	tokens := make([]string, len(criterias)+1)
	app_name := metric.GetAppName()
	name := metric.GetMeasurementName()
	tokens[0] = fmt.Sprintf("%s/%s", app_name, name)
	i = 1
	for _, key := range criteriasKeys {
		val, _ := criterias[key]
		tokens[i] = fmt.Sprintf("%s=%s", key, val)
		i++
	}
	return strings.Join(tokens, ";")
}

func DeriveMetricValues(values []MetricValue, non_negative bool) ([]MetricValue, error) {
	if len(values) < 2 {
		return []MetricValue{}, errors.New("Size of values vector should be at least 2")
	}
	var (
		prev_value MetricValue = values[0]
		curr_value MetricValue
	)
	derives := make([]MetricValue, len(values)-1)
	for i := 1; i < len(values); i++ {
		curr_value = values[i]

		//delta's
		delta_t := prev_value.Time.Sub(curr_value.Time)
		var delta_val float64
		if prev_value.Name != curr_value.Name {
			return derives, fmt.Errorf("Cannot dervie metric from different series. %s != %s", prev_value.Name, curr_value.Name)
		}
		if reflect.TypeOf(prev_value.Value) != reflect.TypeOf(curr_value.Value) {
			return derives, errors.New("Inconsistant types detected")
		}
		switch t := prev_value.Value.(type) {
		default:
			log.Printf("Unsupported value type for DeriveMetricValue %T", t)
			return derives, errors.New(fmt.Sprintf("Unsupported value type for derivation %T", t))
		case int:
			delta_val = math.Abs(float64(curr_value.Value.(int) - prev_value.Value.(int)))
		case float32:
			delta_val = math.Abs(float64(curr_value.Value.(float32) - prev_value.Value.(float32)))
		case float64:
			delta_val = math.Abs(float64(curr_value.Value.(float64) - prev_value.Value.(float64)))
		case int32:
			delta_val = math.Abs(float64(curr_value.Value.(int32) - prev_value.Value.(int32)))
		case int64:
			delta_val = math.Abs(float64(curr_value.Value.(int64) - prev_value.Value.(int64)))
		case uint:
			delta_val = math.Abs(float64(curr_value.Value.(uint) - prev_value.Value.(uint)))
		case uint32:
			delta_val = math.Abs(float64(curr_value.Value.(uint32) - prev_value.Value.(uint32)))
		case uint64:
			delta_val = math.Abs(float64(curr_value.Value.(uint64) - prev_value.Value.(uint64)))
		}

		if delta_t < 5*time.Second {
			return derives, errors.New("Time delta should be at least 5 seconds")
		}
		mval := MetricValue{}

		//set derivative metric value
		mval.Kind = METRIC_DERIVE
		mval.Time = curr_value.Time
		mval.Value = int64(delta_val) / int64(delta_t.Seconds())
		mval.ValueType = reflect.TypeOf(int64(0))
		//non negative values mode
		if non_negative && mval.Value.(int64) < 0 {
			mval.Value = int64(0)
		}

		//set derives value
		derives[i-1] = mval

		//prev_value for next step in current value
		prev_value = values[i]
	}
	return derives, nil
}
