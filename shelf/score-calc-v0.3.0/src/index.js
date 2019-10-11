const find = require('lodash/find');
const chdRiskCoefficients = require('./coefficients.json');
const betaCoefficients = require('./beta.json')

function score(inputs){
  // Extract proper coefficients
  var coefficients = riskCoefficients(inputs.risk.toLowerCase(), inputs.gender.toLowerCase()).coefficients
  // Step 1
  var s0_chd = survivalprob(coefficients.chd, inputs.age)
  var s0_10_chd = survivalprob(coefficients.chd, inputs.age+10)
  var s0_nonchd = survivalprob(coefficients.nonchd, inputs.age)
  var s0_10_nonchd = survivalprob(coefficients.nonchd, inputs.age+10)
  // Step 2
  var w_chd = weightedsum(inputs.cholesterol, inputs.sbp, inputs.smoker,betaCoefficients.chd)
  var w_nonchd = weightedsum(inputs.cholesterol, inputs.sbp, inputs.smoker,betaCoefficients.nonchd)
  // Step 3
  var s_age_chd = Math.pow(s0_chd, Math.exp(w_chd))
  var s_age10_chd = Math.pow(s0_10_chd, Math.exp(w_chd))
  var s_age_nonchd = Math.pow(s0_nonchd, Math.exp(w_nonchd))
  var s_age10_nonchd = Math.pow(s0_10_nonchd, Math.exp(w_nonchd))
  // Step 4
  var s10_chd = s_age10_chd/s_age_chd
  var s10_nonchd = s_age10_nonchd/s_age_nonchd
  // Step 5
  var risk10_chd = 1-s10_chd
  var risk10_nonchd = 1-s10_nonchd
  // Step 6
  var cvdrisk10 = risk10_chd+risk10_nonchd
  // Construct Output
  var result={}
  result.cvdrisk = {}
  result.cvdrisk.total= cvdrisk10
  result.cvdrisk.chd = risk10_chd
  result.cvdrisk.nonchd = risk10_nonchd

  return result
}

function riskCoefficients(risk, gender) {
    return find(chdRiskCoefficients, { 'risk': risk, "gender":gender});
}

function survivalprob(coeff, age) {
  var s = Math.exp((-1)*Math.exp(coeff.alpha)*Math.pow((age-20),coeff.p))
  return s
}

function weightedsum(cholesterol, sbp, smoker,beta){
  var w =0
  w= w+beta.cholesterol*(cholesterol-6)
  w=w+beta.sbp*(sbp-120)
  if(smoker){
    w=w+beta.smoker
  }
  return w;
}

module.exports=score
