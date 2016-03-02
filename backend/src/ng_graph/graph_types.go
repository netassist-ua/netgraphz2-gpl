package ng_graph

import "net"

const (
	LINK_FIBER           LinkType = 0
	LINK_FIBER_TRANSPORT LinkType = 1
	LINK_COPPER          LinkType = 2
	LINK_RADIO_WB        LinkType = 3
	LINK_RADIO_80211_5   LinkType = 4
	LINK_RADIO_80211_2   LinkType = 5
	LINK_RADIO_LB        LinkType = 6
	LINK_GSM             LinkType = 7
	LINK_X25             LinkType = 8
	LINK_POWERLINE       LinkType = 9
)

const (
	NODE_SWITCH          NodeType = 0
	NODE_SERVER          NodeType = 1
	NODE_ROUTER          NodeType = 2
	NODE_TRANSPORT       NodeType = 3
	NODE_WIRELESS_AP     NodeType = 4
	NODE_WIRELESS_BRIDGE NodeType = 5
	NODE_OTHER           NodeType = 6
)

type (
	//LinkType
	LinkType int16
	NodeType int16

	//Host
	Host struct {
		Id               int64
		DBImportSwitchId int32
		Name             string
		IcingaName       string
		IP               net.IP
		IP6              net.IP
		MACAddress       string
		Address          string
		Comment          string
		Model            string
		Serial           string
		NumPorts         uint16
		Type             NodeType
	}

	//Link
	Link struct {
		Id          int64
		SrcImportId int32
		DstImportId int32
		SrcPort     uint16
		DstPort     uint16
		SrcNodeId   int64
		DstNodeId   int64

		CapacityMbit int64
		Quality      int32
		Type         LinkType
		Comment      string

		RXOctetsMetric string
		TXOctetsMetric string
	}
)
