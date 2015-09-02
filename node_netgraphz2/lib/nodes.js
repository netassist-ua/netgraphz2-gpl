var node_tools = require("./node-tools");
var util = require("util");
/*
Nodes insertion, update, delete (CRUD)
*/

module.exports = function(db){
  _export = {};
  _export.getById = function(nodeId, callback){
    db.readNode(nodeId, function(error, node){
      if(error) {
        callback(null, util.format("Internal client error: %s", error));i
        return;
      }
      callback(node, null);
    });
  };

  _export.getByDbId = function(db_id, callback){
    db.cypherQuery('MATCH (n:NetAssistNode) WHERE n.db_sw_id = {origin_id} RETURN n',
    {origin_id: db_id}, function(error, result){
      if(error){
        callback(null, util.format("Failed to get node by database id: %s", error));
        return;
      }
      if(result.data.length == 0 ){
        callback(null, null);
        return;
      }
      callback(node_tools.graphNodeToApiNode(result.data[0]), null);
    });
  };

  _export.insert = function(ng_node, callback){
    var graph_node = node_tools.apiNodeToGraphNode(ng_node, false);
    db.insertNode(graph_node, ['NetAssistNode'], function(error, g_node){
      if(error){
        callback(null, util.format("Internal client error: %s. Failed to insert node.", error));
        return;
      }
      callback({
        success: true,
        node: node_tools.graphNodeToApiNode(g_node)
      }, null);
    });
  };

  _export.getByIcingaName = function(icinga_name, callback){
    db.cypherQuery('MATCH (n:NetAssistNode) WHERE n.icinga_name = {ic_name} RETURN n',
    {ic_name: icinga_name}, function(error, result){
      if(error){
        callback(null, util.format("Error during cypher request: %s", error));
        return;
      }
	  if(result.data[0] !== undefined)
      	callback(node_tools.graphNodeToApiNode(result.data[0]), null);
	  else 
		callback(null, null);
    });
  };

  _export.update =  function(ng_node, callback){
    var graph_node = node_tools.apiNodeToGraphNode(ng_node, false);
    db.updateNode(ng_node.id, graph_node, function(error, g_node){
      if(error){
        callback(null, util.format("Internal client error: %s. Failed to update node.", error));
        return;
      }
      callback({
        success: true,
        node: node_tools.graphNodeToApiNode(g_node)
      }, null);
    });
  };

  _export.delete = function(node_id, callback, include_relationships){
    if(include_relationships === undefined)
    include_relationships = false;
    if(include_relationships){
      db.cypherQuery('MATCH (n:NetAssistNode)-[r:LINKS_TO]-() WHERE Id(n)={id} DELETE n,r ',
      { id: node_id }, function(err, result){
        if(err){
          callback(null, "Error, cannot delete node");
          return;
        }
        callback(result, null);
      });
    }
    else {
      db.deleteNode(node_id, function(err, node){
        if(err){
          callback(null, "Error, cannot delete node");
          return;
        }
        if(node === false)
        {
          callback({
            success: false
          });
        }
        else {
          callback({
            success: true,
            node: node_tools.graphNodeToApiNode(node)
          }, null);
        }
      });
    }
  };
  return _export;
};
