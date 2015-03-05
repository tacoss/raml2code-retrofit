var test = require("raml2code-fixtures").raml2codeIntegration,
   chai = require('chai');
chai.should();

describe('Must run on raml2code', function () {

  var generator = require("../lib/retrofit-client");

  var gatitosAPI = function(done){
    test( done, "index.raml", generator, {package: 'org.gex.client', importPojos: 'com.pojos'},
      "java/retrofit-client/FixtureAPI.java", "v1/FixtureAPI.java")
  };

  it('should generate a retrofit client from RAML file', gatitosAPI );

});
