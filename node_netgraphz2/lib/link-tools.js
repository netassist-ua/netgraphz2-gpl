module.exports = {

    apiLinkToGraphLink: function(link, include_id){
        if(typeof include_id === "undefined"){
          include_id = true;
        }
        var ng_node = {
            _start: link.startNode,
            _end: link.endNode,
            port_id: link.src_port_id,
            ref_port_id: link.dst_port_id,
            speed: link.speed,
            db_sw_id: link.startNode_origin_db_id,
            db_ref_sw_id: link.endNode_origin_db_id,
            commment: link.comment,
            type: link.type,
            link_quality: link.link_quality,
            wavelength_nm: link.wavelength_nm,
            distance_m: link.distance_m
        };
        if(include_id){
          ng_node._id = link.id;
        }
        return ng_node;
    },

    graphLinkToApiLink: function(ng_link){
        return {
          id: ng_link._id,
          startNode: ng_link._start,
          endNode: ng_link._end,
          src_port_id: ng_link.port_id,
          dst_port_id: ng_link.ref_port_id,
          speed: ng_link.speed,
          startNode_origin_db_id: ng_link.db_sw_id,
          endNode_origin_db_id: ng_link.db_ref_sw_id,
          comment: ng_link.comment,
          type: ng_link.type,
          link_quality: ng_link.link_quality,
          wavelength_nm: ng_link.wavelength_nm,
          distance_m: ng_link.distance_m
        };
    },
};
