package ng_graph

type (
	GraphStorage interface {
		GetNodeById(id int64) (Host, error)
		GetAllNodesFrom(from_id int64, n_take int32) ([]Host, error)
		GetLinkById(id int64) (Link, error)
		GetAllLinksFrom(from_id int64, n_take int32) ([]Link, error)
		GetNodesCount() (int32, error)
		GetLinksCount() (int32, error)
	}
)
