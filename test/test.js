//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();


chai.use(chaiHttp);

describe('POST /activate', () => {
    it('it should return the endpoint URL', (done) => {
      let input = {
      	"arkid":"ark:/99999/cp4mc9723sd",
        "version":"v0.2.0",
        "default":true,
      	"endpoint":"dosingrecommendation",
        "entry":"recommendation.js",
      	"artifact":['https://kgrid-lab.github.io/testobj/99999-cp4mc9723sd-v0.2.0.zip'
          ]
      }
      chai.request(server)
          .post('/activate')
          .send(input)
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
    });
    it('not found at resource URL', (done) => {
      let input = {
        "arkid":"ark:/99999/cp4mc9723s",
        "version":"v0.2.0",
        "default":true,
      	"endpoint":"dosingrecommendation",
        "entry":"recommendation.js",
      	"artifact":['https://github.com/kgrid-objects/cpic-collection/releases/download/2.0.0/99999-cp4mc9723sd-0.2.0.zip'
          ]
      }
      chai.request(server)
          .post('/deployments')
          .send(input)
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
    });
    it('missing Resource URL', (done) => {
      let input = {
      	"arkid":"ark:/hello/world",
      	"endpoint":"welcome",
        "entry":"recommendation.js"
      }
      chai.request(server)
          .post('/deployments')
          .send(input)
          .end((err, res) => {
            res.should.have.status(400);
            done();
          });
    });
});

/*
  * Test the /POST /:naan/:name/:/ep route
  */

  // describe('POST /endpoint', () => {
  //     it('it should return the response', (done) => {
  //       let input = {
  //         "CYP2D6": {
  //           "diplotype": "*1/*1",
  //           "phenotype": "Ultrarapid metabolizer"
  //         }
  //       }
  //       chai.request(server)
  //           .post('/99999/cp4mc9723sd/dosingrecommendation')
  //           .send(input)
  //           .end((err, res) => {
  //                 res.should.have.status(200);
  //
  //             done();
  //           });
  //     });
  // });
  //
  // describe('POST /version/endpoint', () => {
  //     it('it should return the response', (done) => {
  //       let input = {
  //         "CYP2D6": {
  //           "diplotype": "*1/*1",
  //           "phenotype": "Ultrarapid metabolizer"
  //         }
  //       }
  //       chai.request(server)
  //           .post('/99999/cp4mc9723sd/v0.2.0/dosingrecommendation')
  //           .send(input)
  //           .end((err, res) => {
  //                 res.should.have.status(200);
  //
  //             done();
  //           });
  //     });
  // });
/*
  * Test the /GET route
  */
describe('GET /', () => {
      it('it should GET the home view', (done) => {
        chai.request(server)
            .get('/')
            .end((err, res) => {
                  res.should.have.status(200);
              done();
            });
      });
    });
