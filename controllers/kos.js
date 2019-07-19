const fs = require('fs-extra')
const path = require('path')

const kosController = {
  all (req, res, next) {
    var implementations = Object.keys(req.app.locals.implementations)
    var kolist={}
    implementations.forEach(function(e){
      var id = e.split('/')
      var naan = id[1]
      var name= id[2]
      var key = 'ark:/'+naan+'/'+name
      if(!kolist[key]){
        kolist[key]=path.dirname(req.app.locals.implementations[e])
      }
    })
    res.send(kolist);
  },
  kobyid (req, res, next) {
    var implementations = Object.keys(req.app.locals.implementations)
    var key = 'ark:/'+req.params.naan+"/"+req.params.name
    var output={}
    if(Object.keys(req.query).length>0){
        output.ext= req.query.format || 'json'
    }
    implementations.forEach(function(e){
      var id = e.split('/')
      var naan = id[1]
      var name= id[2]
      if(key == 'ark:/'+naan+'/'+name){
        output[key]=fs.readJsonSync(path.join(path.dirname(req.app.locals.implementations[e]),'metadata.json'))
      }
    })
    res.send(output);
  },
  impbyid (req, res, next) {
    var key = 'ark:/'+req.params.naan+"/"+req.params.name+'/'+ req.params.version
    var output = {}
    output[key]=fs.readJsonSync(path.join(req.app.locals.implementations[key],'metadata.json'))
    res.send(output);
  },
  servicebyid (req, res, next){
    var key = 'ark:/'+req.params.naan+"/"+req.params.name+'/'+ req.params.version
    var fileName = ''
    var meta = fs.readJsonSync(path.join(req.app.locals.implementations[key],'metadata.json'))
    var serviceYaml = path.join(path.dirname(req.app.locals.implementations[key]), meta.hasServiceSpecification)
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
  }
}

module.exports = kosController
