var express = require('express');
var router = express.Router();


var icinga = require("./api/icinga");


router.use('/icinga', icinga)

module.exports = router;
