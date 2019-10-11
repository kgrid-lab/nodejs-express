var express = require('express');
var router = express.Router();
var path = require('path')
const activateShelf = require('../public/javascripts/activateshelf')

/* GET home page. POST and PUT are just example routes*/
router.get('/', function(req, res, next) {
  res.render('index', { title: 'KGrid Activator' });
});

router.post('/', function (req, res) {
  res.send('Got a POST request')
})

router.put('/', function (req, res) {
  res.send('Got a PUT request')
})

/* INFO will retrun the shelf location, the endpoints array and the KO list map */
router.get('/info', function(req, res, next) {
  var output = {}
  output.shelf=req.app.locals.shelf
  output.endpoints=req.app.locals.endpoints
  output.implementations=req.app.locals.implementations
  res.send(output);
});

router.get('/health', function(req, res, next) {
  var output = {}
  output.shelf=req.app.locals.shelf
  output.endpoints=req.app.locals.endpoints
  res.send(output);
});

router.get('/activate', function(req, res, next) {
  var obj = activateShelf(req.protocol+'://'+req.get('host'), req.app.locals.shelf, req.app.locals.devMode)
  var output = {}
  output.endpoints={}
  output.implementations={}
  for(var key in obj.endpoints) {
    output.endpoints[key] = obj.endpoints[key]
    req.app.locals.endpoints[key] = obj.endpoints[key]
  }
  for(var key in obj.implementations) {
    output.implementations[key] = obj.implementations[key]
    req.app.locals.implementations[key] = obj.implementations[key]
  }

  obj = activateShelf('.', './node_modules/@kgrid', req.app.locals.devMode)

  for(var key in obj.endpoints) {
    output.endpoints[key] = obj.endpoints[key]
    req.app.locals.endpoints[key] = obj.endpoints[key]
  }
  for(var key in obj.implementations) {
    output.implementations[key] = obj.implementations[key]
    req.app.locals.implementations[key] = obj.implementations[key]
  }
  res.send(output);
});

router.post('/:naan/:name/:version/:ep', function(req, res, next) {
  var key = '/'+req.params.naan+"/"+req.params.name+'/'+ req.params.version+'/'+req.params.ep
  var srcjs = req.app.locals.endpoints[key].post.artifact
  var func = require(srcjs)
  var output = {}
  output.ko="ark:/"+req.params.naan+"/"+req.params.name
  output.input = req.body
  if(req.params.version){
    output.ko=output.ko +"/"+req.params.version
  }
  // res.send(func)
  if(func.constructor.name === "AsyncFunction"){
    func(req.body).then(function(data){
        output.result = data
        res.send(output);
    })
  } else {
    output.result = func(req.body)
    res.send(output);
  }
});

router.post('/:naan/:name/:ep', function(req, res, next) {
  var key = '/'+req.params.naan+"/"+req.params.name+'/'+req.params.ep
  var srcjs = req.app.locals.endpoints[key].post.artifact
  var func = require(srcjs)
  var output = {}
  output.ko="ark:/"+req.params.naan+"/"+req.params.name
  output.input = req.body
  if(func.constructor.name === "AsyncFunction"){
    func(req.body).then(function(data){
        output.result = data
        res.send(output);
    })
  } else {
    output.result = func(req.body)
    res.send(output);
  }
});

module.exports = router;
