package ng_rpc_server

import (
	"github.com/golang/protobuf/proto"
	"golang.org/x/net/context"
	_ "google.golang.org/grpc/grpclog"
	"log"
	graph "ng_graph"
	metric "ng_metric"
	rpc "ng_rpc"
	state "ng_state"
)

type RPCServer struct {
	store      graph.GraphStorage
	status_srv state.IStatusService
	metric_srv metric.MetricStorage
}

func NewRPCServer(store graph.GraphStorage, status_srv state.IStatusService, metric_srv metric.MetricStorage) *RPCServer {
	srv := &RPCServer{}
	srv.store = store
	srv.status_srv = status_srv
	srv.metric_srv = metric_srv
	return srv
}

func (s *RPCServer) fetch_last_metrics(host_name string, n_get uint32) (map[string][]metric.MetricValue, error) {
	last_metric_values := make(map[string][]metric.MetricValue)
	if n_get > 0 {
		metrics, err := s.metric_srv.GetMetricsByHost(host_name)
		if err != nil {
			return nil, err
		}
		for _, m := range metrics {
			var m_values []metric.MetricValue
			if m.GetType() == metric.METRIC_DERIVE {
				n_get++
			}
			m_values, err = s.metric_srv.GetLastMetricValues(m, 0, int(n_get+1))
			if err != nil {
				log.Printf("Cannot fetch metric values: %s. Continue to other metric...\n", err)
				continue
			}
			if m.GetType() == metric.METRIC_DERIVE {
				m_values, err = metric.DeriveMetricValues(m_values, true)
				if err != nil {
					log.Printf("Cannot derive metric values: %s. Continue other metrics...\n", err)
					continue
				}
			}
			last_metric_values[metric.GetMetricString(m)] = m_values
		}
	}
	return last_metric_values, nil
}

func (s *RPCServer) GetNodeById(ctx context.Context, req *rpc.NodeByIdRequest) (*rpc.Node, error) {
	states := []state.HostState{}
	node, err := s.store.GetNodeById(int64(req.GetNodeId()))
	if err != nil {
		return nil, err
	}
	if req.GetIncludeState() {
		states, err = s.status_srv.GetHostStatusByName(node.IcingaName)
		if err != nil {
			return nil, err
		}
	}
	last_metric_values, err := s.fetch_last_metrics(node.Name, uint32(req.GetIncludeMetrics()))
	if err != nil {
		return nil, err
	}
	return host_to_rpc(&node, states, last_metric_values), nil
}

func (s *RPCServer) GetLinkById(ctx context.Context, req *rpc.LinkByIdRequest) (*rpc.Link, error) {
	link, err := s.store.GetLinkById(int64(req.GetLinkId()))
	if err != nil {
		return &rpc.Link{}, err
	}
	return link_to_rpc(&link), nil
}

func (s *RPCServer) GetAllNodes(req *rpc.NodesAllRequest, stream rpc.Backend_GetAllNodesServer) error {
	hosts, err := s.store.GetAllNodesFrom(int64(req.GetLastId()), int32(req.GetNTake()))
	host_names := []string{}
	states := make(map[string][]state.HostState)
	if err != nil {
		log.Printf("Error during fetching nodes: %v \n", err)
		return err
	}
	for _, host := range hosts {
		host_names = append(host_names, host.IcingaName)
	}
	if req.GetIncludeState() {
		states, err = s.status_srv.GetHostsStatusByName(host_names)
		if err != nil {
			log.Printf("Cannot fetch host state: %v\n", err)
		}
	}
	if len(hosts) > 0 {
		for _, host := range hosts {
			last_metric_values, err := s.fetch_last_metrics(host.Name, uint32(req.GetIncludeLastMetrics()))
			if err != nil {
				log.Printf("Cannot fetch host metrics: %v\n", err)
			}
			st, st_found := states[host.IcingaName]
			if !st_found {
				st = []state.HostState{}
			}
			stream.Send(host_to_rpc(&host, st, last_metric_values))
		}
	}
	return nil
}

func (s *RPCServer) GetAllLinks(req *rpc.LinksAllRequest, stream rpc.Backend_GetAllLinksServer) error {
	links, err := s.store.GetAllLinksFrom(int64(req.GetLastId()), int32(req.GetNTake()))
	if err != nil {
		log.Printf("Cannot get links: %v\n", err)
		return err
	}
	if len(links) > 0 {
		for _, link := range links {
			stream.Send(link_to_rpc(&link))
		}
	}
	return nil
}

func (s *RPCServer) GetStatus(ctx context.Context, req *rpc.StatusRequest) (*rpc.StatusResponse, error) {
	response := &rpc.StatusResponse{}
	n_metrics := s.metric_srv.CountMetrics()
	response.NMetrics = proto.Int32(n_metrics)

	n_links, err := s.store.GetLinksCount()
	response.NLinks = proto.Int32(n_links)
	if err != nil {
		return response, err
	}

	n_nodes, err := s.store.GetNodesCount()
	log.Printf("Links: %d, Nodes: %d\n", n_links, n_nodes)
	response.NNodes = proto.Int32(n_nodes)
	if err != nil {
		return response, err
	}
	return response, nil
}

func (s *RPCServer) GetAllMetrics(req *rpc.AllMetricsRequest, stream rpc.Backend_GetAllMetricsServer) error {
	metrics, err := s.metric_srv.GetAllMetrics()
	if err != nil {
		log.Printf("Cannot get all available metrics: %v\n", err)
		return err
	}
	var n_skip_counter int64 = 0
	var n_take_counter int64 = 0
	for _, m := range metrics {
		if n_skip_counter < req.GetNSkip() {
			n_skip_counter++
			continue
		}
		if req.GetNTake() >= 0 && n_take_counter == req.GetNTake() {
			break
		}
		out := &rpc.Metric{}
		count, err := s.metric_srv.CountValues(m)
		if err != nil {
			log.Printf("Cannot get metrics count: %v\n", err)
			continue
		}
		last_value, err := s.metric_srv.GetLastMetricValue(m)
		if err != nil {
			log.Printf("Cannot get last metric value: %v\n", err)
			continue
		}
		out.Name = proto.String(metric.GetMetricString(m))
		out.Kind = rpc.Metric_Kind(m.GetType()).Enum()
		out.NRecords = proto.Int64(count)
		out.TimeLastRecord = proto.Int64(last_value.Time.Unix())
		stream.Send(out)
		n_take_counter++
	}
	return nil
}
