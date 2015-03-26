var test = require("raml2code-fixtures").raml2codeIntegration,
  chai = require('chai'),
  path = require('path');
chai.should();

describe('Must run on raml2code', function () {

  var generator = require("../lib/retrofit-client");
  var codeReference = path.join(__dirname, '../code-reference/');

  var gatitosAPI = function(done){
    test( done, "index.raml", generator, {package: 'org.gex.client', importPojos: 'com.pojos'},
      codeReference +"FixtureAPI.java", "v1/FixtureAPI.java", false)
  };

  it('should generate a retrofit client from RAML file', gatitosAPI );

});
