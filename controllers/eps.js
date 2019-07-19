const fs = require('fs-extra')
const path = require('path')

const epsController = {
  all (req, res, next) {
    res.send(req.app.locals.endpoints);
  },
  epbyid (req, res, next) {
    var key = '/'+req.params.naan+"/"+req.params.name+'/'+ req.params.version+'/'+req.params.ep
    var output = {}
    output[key]= req.app.locals.endpoints[key]
    res.send(output);
  },
}

module.exports = epsController
