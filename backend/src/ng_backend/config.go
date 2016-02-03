package main

import (
	"bufio"
	"fmt"
	"github.com/spf13/viper"
	"os"
)

func panic_config(err error) {
	if err != nil {
		panic(fmt.Errorf("Cannot read configuration file: %s", err))
	}
}

func init_config(path string) {
	viper.SetConfigType("json")

	viper.SetDefault("daemon", map[string]string{})
	viper.SetDefault("daemon.log_file", "/var/log/ng_backend.log")
	viper.SetDefault("daemon.rpc_port", 8800)

	viper.SetDefault("ng_state", map[string]string{})
	viper.SetDefault("ng_state.cache.ttl", 10000)
	viper.SetDefault("ng_state.icinga.port", 6558)
	viper.SetDefault("ng_state.icinga.host", "localhost")
	viper.SetDefault("ng_state.icinga.use_unix_socket", false)
	viper.SetDefault("ng_state.icinga.unix_socket", "")
	viper.SetDefault("ng_state.icinga.timeout_enabled", true)
	viper.SetDefault("ng_state.icinga.timeout", 5000)

	viper.SetDefault("ng_metric", map[string]string{})
	viper.SetDefault("ng_metric.mem_storage", map[string]string{})

	viper.SetDefault("ng_metric.collectd.host", "0.0.0.0")
	viper.SetDefault("ng_metric.collectd.port", 27015)
	viper.SetDefault("ng_metric.mem_storage.capacity", 10)

	viper.SetDefault("graph", map[string]string{})
	viper.SetDefault("graph.url", "http://neo4j:changed@localhost:7474/")

	f, err := os.Open(path)
	panic_config(err)

	defer f.Close()
	reader := bufio.NewReader(f)

	err = viper.ReadConfig(reader)
	if err != nil {
		panic(fmt.Errorf("Cannot read configuration file: %s", err))
	}
}

func get_daemon_config() *viper.Viper {
	return viper.Sub("daemon")
}

func get_state_config() *viper.Viper {
	return viper.Sub("ng_state")
}

func get_metric_config() *viper.Viper {
	return viper.Sub("ng_metric")
}

func get_graph_config() *viper.Viper {
	return viper.Sub("graph")
}
