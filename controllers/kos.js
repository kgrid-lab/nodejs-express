const fs = require('fs-extra')
const path = require('path')

const kosController = {
  all (req, res, next) {
    var kobjects = Object.keys(req.app.locals.kobjects)
    var kolist={}
    kobjects.forEach(function(e){
      var id = e.split('/')
      var naan = id[1]
      var name= id[2]
      var key = 'ark:/'+naan+'/'+name
      if(!kolist[key]){
        kolist[key]=req.app.locals.kobjects[e]
      }
    })
    res.send(kolist);
  },
  kobyid (req, res, next) {
    var kobjects = Object.keys(req.app.locals.kobjects)
    var key = 'ark:/'+req.params.naan+"/"+req.params.name
    var output={}
    output[key]= req.app.locals.kobjects[key]
    res.send(output);
  },
  servicebyid (req, res, next){
    var key = 'ark:/'+req.params.naan+"/"+req.params.name
    if(req.app.locals.kobjects[key]){
      var version = req.app.locals.kobjects[key].default
      if(Object.keys(req.query).length>0){
        version = req.query.version || version
      }
      var fileName = ''
      if(req.app.locals.kobjects[key][version]) {
        var serviceYaml = path.join(req.app.locals.kobjects[key][version],'service.yaml')
        if(fs.existsSync(serviceYaml)){
          fileName = serviceYaml
          res.sendFile(fileName, function (err) {
            if (err) {
              next(err)
            } else {
              console.log('Sent:', fileName)
            }
          })
        }else
        {
          res.send('Not found')
        }
      }else {
        res.send('Invalid version')
      }
    }else {
      res.send('Invalid ARK ID')
    }
  }
}

module.exports = kosController
