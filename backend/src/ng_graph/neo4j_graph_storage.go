package ng_graph

import (
	"database/sql"
	"errors"
	"fmt"
	_ "gopkg.in/cq.v1"
	"gopkg.in/cq.v1/types"
	"log"
	"log/syslog"
	"net"
)

var error_logger *log.Logger

type (
	NeoGraphStorage struct {
		url string
	}
)

const (
	CYPHER_NODE_BY_ID    = "MATCH (n:NetAssistNode) WHERE Id(n)={0} RETURN n"
	CYPHER_NODE_FROM_ID  = "MATCH (n:NetAssistNode) WHERE Id(n) > {0} RETURN Id(n), n ORDER BY Id(n) LIMIT {1}"
	CYPHER_NODES_COUNT   = "MATCH (n:NetAssistNode) RETURN count(n)"
	CYPHER_LINK_BY_ID    = "MATCH (n:NetAssistNode)-[r:LINKS_TO]->(c:NetAssistNode) WHERE Id(r)={0} RETURN r"
	CYPHER_LINKS_FROM_ID = "MATCH (n:NetAssistNode)-[r:LINKS_TO]->(c:NetAssistNode) WHERE Id(r) > {0} RETURN Id(r), Id(n), Id(c), r LIMIT {1}"
	CYPHER_LINKS_COUNT   = "MATCH (n:NetAssistNode)-[r:LINKS_TO]->(c:NetAssistNode) RETURN count(r)"
)

func NewNeoGraphStorage(url string) *NeoGraphStorage {
	m := &NeoGraphStorage{}
	m.url = url
	return m
}

func init() {
	error_logger, _ = syslog.NewLogger(syslog.LOG_DAEMON, 0)
}

func read_int64_prop(properties map[string]types.CypherValue, prop string, default_value int64) int64 {
	c_value, found := properties[prop]
	if !found {
		return default_value
	}
	switch c_value.Type {
	case types.CypherInt:
		return int64(c_value.Val.(int))
	case types.CypherInt64:
		return c_value.Val.(int64)
	default:
		return default_value
	}
}

func read_string_prop(properties map[string]types.CypherValue, prop string) string {
	c_value, found := properties[prop]
	if !found {
		return ""
	}
	if c_value.Type != types.CypherString {
		return ""
	}
	return c_value.Val.(string)
}

func read_link_row(id int64, r *types.Relationship, src_node_id int64, dst_node_id int64) Link {
	link := Link{}
	link.Id = id
	link.SrcNodeId = src_node_id
	link.DstNodeId = dst_node_id
	var (
		src_port  int64
		dst_port  int64
		src_db_id int64
		dst_db_id int64
		speed     int64
		quality   int64
		link_type int64
		comment   string
		rx_metric string
		tx_metric string
	)
	src_port = read_int64_prop(r.Properties, "port_id", 0)
	dst_port = read_int64_prop(r.Properties, "ref_port_id", 1)
	src_db_id = read_int64_prop(r.Properties, "db_sw_id", 0)
	dst_db_id = read_int64_prop(r.Properties, "db_ref_sw_id", 0)
	speed = read_int64_prop(r.Properties, "speed", 0)
	link_type = read_int64_prop(r.Properties, "link_type", 0)
	quality = read_int64_prop(r.Properties, "quality", 0)
	comment = read_string_prop(r.Properties, "comment")
	rx_metric = read_string_prop(r.Properties, "rx_metric")
	tx_metric = read_string_prop(r.Properties, "tx_metric")

	//link fill
	link.Quality = int32(quality)
	link.SrcImportId = int32(src_db_id)
	link.DstImportId = int32(dst_db_id)
	link.SrcPort = uint16(src_port)
	link.DstPort = uint16(dst_port)
	link.CapacityMbit = speed
	link.Comment = comment
	link.Type = LinkType(link_type)
	link.RXOctetsMetric = rx_metric
	link.TXOctetsMetric = tx_metric
	return link
}

func read_host_row(id int64, n *types.Node) Host {
	host := Host{}
	host.Id = id
	var (
		sw_id       int64
		name        string
		icinga_name string
		address     string
		ip_address  string
		ip6_address string
		mac_address string
		comment     string
		model       string
		serial      string
		num_ports   int64
	)
	sw_id = read_int64_prop(n.Properties, "db_sw_id", -1)
	num_ports = read_int64_prop(n.Properties, "num_ports", -1)
	name = read_string_prop(n.Properties, "name")
	icinga_name = read_string_prop(n.Properties, "icinga_name")
	address = read_string_prop(n.Properties, "address")
	ip_address = read_string_prop(n.Properties, "ip_address")
	ip6_address = read_string_prop(n.Properties, "ip6_address")
	mac_address = read_string_prop(n.Properties, "mac_address")
	comment = read_string_prop(n.Properties, "comment")
	model = read_string_prop(n.Properties, "model")
	serial = read_string_prop(n.Properties, "serial")
	//fill host
	host.DBImportSwitchId = int32(sw_id)
	host.Name = name
	host.IcingaName = icinga_name
	host.IP = net.ParseIP(ip_address)
	host.IP6 = net.ParseIP(ip6_address)
	host.Address = address
	host.MACAddress = mac_address
	host.Comment = comment
	host.Model = model
	host.Serial = serial
	host.NumPorts = uint16(num_ports)
	return host
}

func (s *NeoGraphStorage) openConnection() (*sql.DB, error) {
	db, err := sql.Open("neo4j-cypher", s.url)
	if err != nil {
		error_logger.Printf("Cannot open database connection: %s", err)
	}
	return db, err
}

func (s *NeoGraphStorage) GetNodeById(id int64) (Host, error) {
	db, err := s.openConnection()
	if err != nil {
		return Host{}, err
	}
	defer db.Close()
	smtm, err := db.Prepare(CYPHER_NODE_BY_ID)
	if err != nil {
		return Host{}, err
	}
	rows, err := smtm.Query(id)
	if err != nil {
		return Host{}, err
	}
	defer rows.Close()
	var neo4j_node types.Node
	if !rows.Next() {
		return Host{}, errors.New("Node not found")
	}
	if err := rows.Scan(&neo4j_node); err != nil {
		error_logger.Printf(fmt.Sprintf("Cannot read node. Error: %s", err))
		return Host{}, err
	}
	return read_host_row(id, &neo4j_node), nil
}

func (s *NeoGraphStorage) GetLinkById(id int64) (Link, error) {
	db, err := s.openConnection()
	if err != nil {
		return Link{}, err
	}
	defer db.Close()
	smtm, err := db.Prepare(CYPHER_LINK_BY_ID)
	if err != nil {
		return Link{}, err
	}
	rows, err := smtm.Query(id)
	if err != nil {
		return Link{}, err
	}
	defer rows.Close()
	var (
		neo4j_rel     types.Relationship
		start_node_id int64
		end_node_id   int64
	)
	if !rows.Next() {
		return Link{}, errors.New("Link not found")
	}
	if err := rows.Scan(&start_node_id, &end_node_id, &neo4j_rel); err != nil {
		error_logger.Printf(fmt.Sprintf("Cannot read link. Error: %s", err))
		return Link{}, err
	}
	return read_link_row(id, &neo4j_rel, start_node_id, end_node_id), nil
}

func (s *NeoGraphStorage) GetAllLinksFrom(from_id int64, n_take int32) ([]Link, error) {
	links := []Link{}
	db, err := s.openConnection()
	if err != nil {
		return links, err
	}
	defer db.Close()
	smtm, err := db.Prepare(CYPHER_LINKS_FROM_ID)
	if err != nil {
		return links, err
	}
	rows, err := smtm.Query(from_id, n_take)
	if err != nil {
		return links, err
	}
	defer rows.Close()
	var (
		neo4j_rel     types.Relationship
		id            int64
		start_node_id int64
		end_node_id   int64
	)
	for rows.Next() {
		if err := rows.Scan(&id, &start_node_id, &end_node_id, &neo4j_rel); err != nil {
			error_logger.Printf(fmt.Sprintf("Cannot read node. Error: %s", err))
			return links, err
		}
		links = append(links, read_link_row(id, &neo4j_rel, start_node_id, end_node_id))
	}
	return links, nil

}

func (s *NeoGraphStorage) GetAllNodesFrom(from_id int64, n_take int32) ([]Host, error) {
	nodes := []Host{}
	db, err := s.openConnection()
	if err != nil {
		return nodes, err
	}
	defer db.Close()
	smtm, err := db.Prepare(CYPHER_NODE_FROM_ID)
	if err != nil {
		return nodes, err
	}
	rows, err := smtm.Query(from_id, n_take)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return nodes, err
	}
	defer rows.Close()
	var neo4j_node types.Node
	var id int64
	for rows.Next() {
		if err := rows.Scan(&id, &neo4j_node); err != nil {
			error_logger.Printf(fmt.Sprintf("Cannot read node. Error: %s", err))
			return nodes, err
		}
		nodes = append(nodes, read_host_row(id, &neo4j_node))
	}
	return nodes, nil
}

func (s *NeoGraphStorage) queryInt32Noparam(query string) (int32, error) {
	db, err := s.openConnection()
	defer db.Close()
	if err != nil {
		return 0, err
	}
	smtm, err := db.Prepare(CYPHER_NODES_COUNT)
	if err != nil {
		return 0, err
	}
	rows, err := smtm.Query()
	if err != nil {
		return 0, err
	}
	defer rows.Close()
	var value int32
	if !rows.Next() {
		return 0, errors.New("No rows")
	}
	if err := rows.Scan(&value); err != nil {
		return value, err
	}
	return value, nil
}

func (s *NeoGraphStorage) GetNodesCount() (int32, error) {
	return s.queryInt32Noparam(CYPHER_NODES_COUNT)
}

func (s *NeoGraphStorage) GetLinksCount() (int32, error) {
	return s.queryInt32Noparam(CYPHER_LINKS_COUNT)
}
