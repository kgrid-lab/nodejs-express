var express = require('express');
var router = express.Router();
const epsController = require('../controllers/eps')

/* GET KOs listing, KO and Implementation. */
router.get('/', epsController.all);
router.get('/:naan/:name/:version/:ep', epsController.epbyid);

module.exports = router;
