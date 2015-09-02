var express = require('express');
var router = express.Router();
var graph_db = require('../../db/graph.js');

router.get('/full', function(req, res, next){
    graph_db.getAllGraphTable(function(err, nodes, connections ){
        if(err){
          res.send(err);
        }
        else {
          res.send({
            nodes: nodes,
            connections: connections
          });
        }
    });
});

router.get('/node/:id', function(req, res, next, id){
    
});

router.put('/node', function(req, res, next){
	body = req.body;

});

module.exports = router;
