var util = require('util');
var link_tools = require('./link-tools');

module.exports = function(db){
  var _export = {};
  _export.getById = function(link_id, callback){
    db.readRelationship(link_id, function(error, result){
      if(error){
        callback(null, util.format('Failed to get link by id, error %s', error));
        return;
      }
      callback(link_tools.graphLinkToApiLink(result), null);
    });
  };

  _export.getFromByNodeId = function(node_id, callback){
    var query = 'MATCH (n:NetAssistNode)-[l:LINKS_TO]->(m:NetAssistNode) WHERE Id(n)={n_id} RETURN l,Id(m)';
    db.cypherQuery(query, { n_id: node_id }, function(error, result){
      if(error){
        callback(null, util.format('Failed to get links from node: %s', error));
        return;
      }
      var links = [];
      result.data.forEach(function(e, i, a){
        var endNode = parseInt(e[1]);
        var link = e[0];
        link._end = endNode;
        link._start = node_id;
        links.push(link_tools.graphLinkToApiLink(link));
      });
      callback(links, null);
    });
  };


  _export.getToByNodeId = function(node_id, callback){
    var query = 'MATCH (n:NetAssistNode)-[l:LINKS_TO]->(m:NetAssistNode) WHERE Id(m)={m_id} RETURN Id(n),l';
    db.cypherQuery(query, { m_id: node_id }, function(error, result){
      if(error){
        callback(null, util.format('Failed to get links from node: %s', error));
        return;
      }
      var links = [];
      result.data.forEach(function(e, i, a){
        var startNode = parseInt(e[0]);
        var link = e[1];
        link._start = startNode;
        link._end = node_id;
        links.push(link_tools.graphLinkToApiLink(link));
      });
      callback(links, null);
    });
  };

  var getByNodeDbId = function(node_id, direction, callback){
    var queryFrom = 'MATCH (n:NetAssistNode)-[l:LINKS_TO]->(m:NetAssistNode) WHERE n.db_sw_id={db_id} RETURN Id(n),l,Id(m)';
    var queryTo = 'MATCH (n:NetAssistNode)-[l:LINKS_TO]->(m:NetAssistNode) WHERE m.db_sw_id={db_id} RETURN Id(n),l,Id(m)';
    var query;
    switch(direction) {
      case 0: //from
      query = queryFrom;
      break;
      case 1: //to
      query = queryTo;
      break;
      default:
      query = queryFrom;
      break;
    }
    db.cypherQuery(query, { db_id: node_db_id }, function(error, result){
      if(error){
        callback(null, util.format('Failed to get links from node: %s', error));
        return;
      }
      var links = [];
      result.data.forEach(function(e, i, a){
        var startNode = parseInt(e[0]);
        var endNode = parseInt(e[2]);
        var link = e[1];
        link._start = startNode;
        link._end = node_id;
        links.push(link_tools.graphLinkToApiLink(link));
      });
      callback(links, null);
    });
  }

  _export.getFromByDbId = function(node_db_id, callback){
    getByNodeDbId(node_db_id, 0, callback);
  };

  _export.getToByDbId = function(node_db_id, callback){
    getByNodeDbId(node_db_id, 1, callback);
  };

  _export.insert = function(link, callback){
    var graph_link = link_tools.apiLinkToGraphLink(link, false);
    var root = graph_link._start;
    var other = graph_link._end;
    delete graph_link._start;
    delete graph_link._end;
    db.insertRelationship(root, other, 'LINKS_TO', graph_link, function(error, link){
      if(error){
        callback(null, util.format("Error while inserting link: %s", error));
        return;
      }
      callback(link_tools.graphLinkToApiLink(link), null);
    });
  };

  _export.update = function(link, callback){
    var graph_link = link_tools.apiLinkToGraphLink(link, false);
    db.updateRelationship(link.id, graph_link, function(error, link){
      if(error){
        callback(null, util.format("Error while updating link: %s", error));
        return;
      }
      if( link === false ){
        callback(null, null);
      }
      else {
        callback(link_tools.graphLinkToApiLink(link), null);
      }
    });
  };
  _export.delete = function(link_id, callback){
    db.deleteRelationship(link_id, function(error, result){
      if(error){
        callback(null, util.format("Error while deleting link: %s", error));
        return;
      }
      if(result === false) {
        callback({
          success: false
        }, null)
      }
      else {
        callback({
          success: true,
          link: graphLinkToApiLink(result)
        }, null);
      }
    });
  };

  return _export;
}
