var test = require("raml2code-fixtures").runSimpleTest;

describe('RAML to Retrofit client ', function () {

  var generator = require('../lib/retrofit-client');
  var extra = {package: 'org.gex.client', importPojos: 'com.pojos'};


  it("Should generate a Retrofit client from RAML file",
    test("index.raml", generator, extra, "java/retrofit-client/FixtureAPI.java", "v1/FixtureAPI.java", false ));

});
