var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    // Assuming you have a way to get the current light status
    // For demonstration, it's set to false by default
    res.render('index', { lightStatus: false });
});

module.exports = router;