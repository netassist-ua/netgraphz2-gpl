package main

import (
	"fmt"
	"github.com/sevlyar/go-daemon"
	_ "github.com/spf13/viper"
	"google.golang.org/grpc"
	flag "launchpad.net/gnuflag"
	"log"
	"net"
	graph "ng_graph"
	metric "ng_metric"
	rpc "ng_rpc"
	rpc_server "ng_rpc_server"
	state "ng_state"
	"time"
)

func main() {
	foreground := flag.Bool("f", false, "Run application foreground, don't daemonize")
	config_path := flag.String("config", "config.json", "Configuration file path")
	pid_path := flag.String("pid", "/var/run/ng_backend.pid", "PID file path")
	flag.Parse(false)
	init_config(*config_path)
	d_config := get_daemon_config()
	state_config := get_state_config()
	metric_config := get_metric_config()
	graph_config := get_graph_config()

	if !*foreground {
		cntxt := &daemon.Context{
			PidFileName: *pid_path,
			PidFilePerm: 0644,
			LogFileName: d_config.GetString("log_file"),
			LogFilePerm: 0640,
			WorkDir:     "./",
			Umask:       027,
			Args:        []string{},
		}

		d, err := cntxt.Reborn()
		if err != nil {
			log.Fatalln(err)
		}
		if d != nil {
			return
		}
		defer cntxt.Release()
	}

	log.Println("Starting NetAssist NetGraphz2...")

	log.Printf("Create memory metric storage with capacity of %d records per metric\n", metric_config.GetInt("mem_storage.capacity"))

	metric_store := metric.NewMemoryStorage(metric_config.GetInt("mem_storage.capacity"))
	status_srv := state.NewStatusService(state.NewMemoryStateCache(), time.Duration(state_config.GetInt("cache.ttl"))*time.Millisecond)
	graph_store := graph.NewNeoGraphStorage(graph_config.GetString("url"))

	icinga_config := state.IcingaLiveStatusConfig{}
	icinga_config.HostName = state_config.GetString("icinga.host")
	icinga_config.Port = uint16(state_config.GetInt("icinga.port"))
	icinga_config.UseUnixSocket = state_config.GetBool("icinga.use_unix_socket")
	icinga_config.UnixSocket = state_config.GetString("icinga.unix_socket")
	icinga_config.TimeoutEnable = state_config.GetBool("icinga.timeout_enabled")
	icinga_config.Timeout = time.Duration(state_config.GetInt("icinga.timeout")) * time.Millisecond

	icinga_source := state.NewIcingaLiveStateSource(icinga_config)
	status_srv.AddSource(icinga_source)

	lis, err := net.Listen("tcp", net.JoinHostPort(d_config.GetString("rpc_host"), fmt.Sprintf("%d", d_config.GetInt("rpc_port"))))
	if err != nil {
		log.Printf("failed to listen: %v", err)
	}
	var opts []grpc.ServerOption
	grpcServer := grpc.NewServer(opts...)
	rpc.RegisterBackendServer(grpcServer, rpc_server.NewRPCServer(graph_store, status_srv, metric_store))

	go func() {
		log.Printf("gRPC server starting on %s:%d\n", d_config.GetString("rpc_host"), d_config.GetInt("rpc_port"))
		grpcServer.Serve(lis)
	}()

	log.Printf("Starting collectd listener on %s:%d\n", metric_config.GetString("collectd.host"), metric_config.GetInt("collectd.port"))

	source := metric.NewCollectdMetricSource(metric_config.GetString("collectd.host"), uint16(metric_config.GetInt("collectd.port")))
	source.AddStorage(metric_store)
	log.Println("Collecting collectd metrics")
	source.Collect()
}
