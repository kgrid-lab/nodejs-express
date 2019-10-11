var path = require('path')
var bmi = require('../../../ri-bmicalc/v2/src/index')

async function process(inputs){
  var bmiinput = {}
  var name = inputs.name;
  bmiinput.height=inputs.height
  bmiinput.weight=inputs.weight
  var bmiresult = bmi(bmiinput).toFixed(2)
  return "Welcome to Knowledge Grid, " + name + ". Your BMI is: "+bmiresult;
}

module.exports = process
