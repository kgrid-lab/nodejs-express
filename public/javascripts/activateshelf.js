const path = require('path')
const fs = require('fs-extra')
const klawSync = require('klaw-sync')
const yaml = require('js-yaml')

const filterFn = item => {
  const basename = path.basename(item.path)
  return basename === '.' || ( basename[0] !== '.' && basename !='node_modules' )
}

function activateShelf(baseurl, shelf, mode){
    var endpointsObj={}
    var implementationObj = {}
    const files = klawSync(shelf, {nodir: true, filter: filterFn})
    if(mode){
      console.log('Activating the KOs in the shelf of '+shelf +' in DEV mode...')
    }
    var metadataFiles = []
    files.forEach(function(e){
      var file = JSON.parse(JSON.stringify(e))
      if(path.basename(file.path)=='metadata.json'){
        var meta = fs.readJsonSync(file.path)
        if(meta['@type']=='koio:KnowledgeObject'){
          var serviceYaml = path.join(path.dirname(file.path), meta.hasServiceSpecification)
          var serviceObj = yaml.safeLoad(fs.readFileSync(serviceYaml, 'utf8'));
          var implePath = path.dirname(serviceYaml)
          var deploymentObj ={}
          var deploymentYaml = ''
          var id=serviceObj.servers[0].url
          if(id.endsWith('/')){
            id=id.substr(0,id.length-1)
          }
          var arkid='ark:'+id
          console.log('Activating '+arkid+' ...')
          implementationObj[arkid]=implePath
          var pathArray = Object.keys(serviceObj.paths)
          if(pathArray.length>0){
            pathArray.forEach(function(e){
              var key = id+e
              var ep = {}
              var methods = Object.keys(serviceObj.paths[e])
              methods.forEach(function(method){
                ep[method]={}
                ep[method].url=baseurl+id+e
                var artifact = 'src/index.js'
                if(!mode){
                  if(serviceObj.paths[e][method]['x-kgrid-activation']){
                    artifact = serviceObj.paths[e][method]['x-kgrid-activation'].artifact    // Read artifact
                  } else {
                    if(meta.hasDeploymentSpecification) {
                      artifact =  deploymentObj.endpoints[e].artifact
                    }
                  }
                }
                ep[method].artifact=path.join(implePath,artifact)
              })
              endpointsObj[key]=ep
            })
          }
        } else {
          if(!meta.hasImplementation){
            var serviceYaml = path.join(path.dirname(file.path), meta.hasServiceSpecification)
            var serviceObj = yaml.safeLoad(fs.readFileSync(serviceYaml, 'utf8'));
            var implePath = path.dirname(serviceYaml)
            var id=serviceObj.servers[0].url
            if(id.endsWith('/')){
              id=id.substr(0,id.length-1)
            }
            var arkid='ark:'+id
            implementationObj[arkid]=implePath
            var pathArray = Object.keys(serviceObj.paths)
            if(pathArray.length>0){
              pathArray.forEach(function(e){
                var key = id+e
                var ep = {}
                var methods = Object.keys(serviceObj.paths[e])
                methods.forEach(function(method){
                  ep[method]={}
                  ep[method].url=baseurl+id+e
                  var artifact = 'src/index.js'
                  if(!mode){
                    if(serviceObj.paths[e][method]['x-kgrid-activation']){
                      artifact = serviceObj.paths[e][method]['x-kgrid-activation'].artifact    // Read artifact
                    } else {
                      if(meta.hasDeploymentSpecification) {
                        artifact =  deploymentObj.endpoints[e].artifact
                      }
                    }
                  }
                  ep[method].artifact=path.join(implePath,artifact)
                })
                endpointsObj[key]=ep
              })
            }
          }
        }
      }
    })
    var output = {}
    output.endpoints = endpointsObj
    output.implementations = implementationObj
    return output
}

module.exports = activateShelf
