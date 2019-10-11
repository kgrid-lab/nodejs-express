var express = require('express');
var router = express.Router();
const kosController = require('../controllers/kos')

/* GET KOs listing, KO and Implementation. */
router.get('/', kosController.all);
router.get('/:naan/:name', kosController.kobyid);
// router.get('/:naan/:name/:version', kosController.impbyid);

/* Retrieve the KO's service specification */
router.get('/:naan/:name/service', kosController.servicebyid);

/* Import a KO */
router.post('/', function(req, res, next) {
  res.send('Importing a packaged KO to the shelf');
});

/* Import a list of KOs */
router.post('/manifest', function(req, res, next) {
  res.send('Importing packaged KOs listed in a manifest file to the shelf ');
});

module.exports = router;
