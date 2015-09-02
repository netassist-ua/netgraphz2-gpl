var express = require('express');
var router = express.Router();


var graph = require("./api/graph");


router.use('/graph', graph)

module.exports = router;
