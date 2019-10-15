const path = require('path')
const fs = require('fs-extra')
const klawSync = require('klaw-sync')
const yaml = require('js-yaml')

const filterFn = item => {
  const basename = path.basename(item.path)
  return basename === '.' || ( basename[0] !== '.' && basename !='node_modules' )
}

function activateShelf(baseurl, shelf, applocals){
    var endpointsObj={}
    var koObj = {}
    var mode = applocals.devMode
    const files = klawSync(shelf, {nodir: true, filter: filterFn})
    if(mode){
      console.log('Activating the KOs in the shelf of '+shelf +' in DEV mode...')
    }
    files.forEach(function(e){
      var file = JSON.parse(JSON.stringify(e))
      if(path.basename(file.path)=='service.yaml'){
        var serviceYaml = file.path
        var serviceObj = yaml.safeLoad(fs.readFileSync(file.path, 'utf8'));
        var implePath = path.dirname(serviceYaml)
        var id=serviceObj.servers[0].url
        if(id.endsWith('/')){  id=id.substr(0,id.length-1) }
        var arkid='ark:'+id
        var meta = {}
        var version = ''
        if(fs.existsSync(path.join(path.dirname(file.path),'metadata.json'))){
          meta = fs.readJsonSync(path.join(path.dirname(file.path),'metadata.json'))
          version=meta.version
        }
        var shouldRegister = true
        if(!koObj[arkid]){
          koObj[arkid]={}
        }
        if(applocals.kobjects[arkid]){
          if(applocals.kobjects[arkid][version]){
            if(applocals.settings.overwriteExistingEndpoints){
              console.log('[Warning] '+arkid+' '+version+': The previously activated endpoints will be overwritten.')
            } else {
              console.log('[Warning] '+arkid+' '+version+': The endpoints have been previously activated. Ignoring the current KO.')
              shouldRegister = false
            }
          }else {
          }
        }
        if(shouldRegister){
          console.log('[INFO]    '+arkid+' '+version+': Activating ...')
          koObj[arkid][version]=implePath
        }
        var pathArray = Object.keys(serviceObj.paths)
        if(pathArray.length>0){
          pathArray.forEach(function(e){
            var key = id+e
            var ep = {}
            ep.arkid = arkid
            var methods = Object.keys(serviceObj.paths[e])
            methods.forEach(function(method){
              ep[method]={}
              ep[method].url=baseurl+id+e
              if(serviceObj.paths[e][method]['x-kgrid-activation']){
                artifact = serviceObj.paths[e][method]['x-kgrid-activation'].artifact    // Read artifact
              }
              ep[method].artifact=path.join(implePath,artifact)
            })
            if(!endpointsObj[key]){
              endpointsObj[key] ={}
            }
            endpointsObj[key][version]=ep
          })
        }
      }
    })
    for(var key in endpointsObj) {
      // output.endpoints[key] = obj.endpoints[key]
      if(!applocals.endpoints[key]){
        applocals.endpoints[key]={}
      }
      for(var k in endpointsObj[key]) {
        applocals.endpoints[key][k] = endpointsObj[key][k]
      }
    }
    for(var key in koObj) {
      // output.kobjects[key] = obj.kobjects[key]
      if(!applocals.kobjects[key]){
        applocals.kobjects[key]={}
        applocals.kobjects[key].default=''
      }
      for(var k in koObj[key]) {
        applocals.kobjects[key][k] = koObj[key][k]
        applocals.kobjects[key].default=k
      }
    }
    var output = {}
    output.endpoints = endpointsObj
    output.kobjects = koObj
    return output
}

module.exports = activateShelf
