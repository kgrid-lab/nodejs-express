var express = require('express');
var router = express.Router();
var path = require('path')
const activateShelf = require('../public/javascripts/activateshelf')

/* GET home page. POST and PUT are just example routes*/
router.get('/', function(req, res, next) {
  res.render('index', { title: 'KGrid Activator' });
});

router.post('/', function (req, res) {
  res.send('[TBD] Got a POST request')
})

router.put('/', function (req, res) {
  res.send('[TBD] Got a PUT request')
})

/* INFO will retrun the shelf location, the endpoints array and the KO list map */
router.get('/info', function(req, res, next) {
  var output = {}
  output.shelf=req.app.locals.shelf
  output.endpoints=req.app.locals.endpoints
  output.kobjects=req.app.locals.kobjects
  res.send(output);
});

router.get('/health', function(req, res, next) {
  var output = {}
  output.shelf=req.app.locals.shelf
  output.endpoints=req.app.locals.endpoints
  res.send(output);
});

router.get('/activate', function(req, res, next) {
  req.app.locals.endpoints={}
  req.app.locals.kobjects={}
  var obj = activateShelf(req.protocol+'://'+req.get('host'), req.app.locals.shelf, req.app.locals)
  obj = activateShelf('.', './node_modules/@kgrid', req.app.locals)
  var output = {}
  output.endpoints={}
  output.kobjects={}
  for(var key in req.app.locals.endpoints) {
    output.endpoints[key] = req.app.locals.endpoints[key]
  }
  for(var key in req.app.locals.kobjects) {
    output.kobjects[key] = req.app.locals.kobjects[key]
  }
  res.send(output);
});

router.post('/:naan/:name/:ep', function(req, res, next) {
  var kokey = 'ark:/'+req.params.naan+"/"+req.params.name
  if(req.app.locals.kobjects[kokey]){
    var version = req.app.locals.kobjects[kokey].default
    if(Object.keys(req.query).length>0){
      version = req.query.version || version
    }
    if(req.app.locals.kobjects[kokey][version]) {
      var key = '/'+req.params.naan+"/"+req.params.name+'/'+req.params.ep
      if(req.app.locals.endpoints[key][version].post){
        var srcjs = req.app.locals.endpoints[key][version].post.artifact
        var func = require(srcjs)
        var output = {}
        output.ko="ark:/"+req.params.naan+"/"+req.params.name
        output.version = version
        output.default= version == req.app.locals.kobjects[kokey].default
        if(func.constructor.name === "AsyncFunction"){
          func(req.body).then(function(data){
              output.result = data
              res.send(output);
          })
        } else {
          output.result = func(req.body)
          res.send(output);
        }
      }else {
        res.send('Operation Method is not available for this endpoint')
      }
    } else {
      res.send('Invalid version')
    }
  } else {
    res.send('Invalid ARK ID')
  }
});

module.exports = router;
