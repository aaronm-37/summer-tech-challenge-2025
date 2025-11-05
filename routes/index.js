var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  // Return a small JSON welcome to avoid needing a view engine in the template
  res.json({
    message: 'LocPay Tech Challenge - Express template',
    available_routes: ['/operations', '/receivers']
  });
});

module.exports = router;
