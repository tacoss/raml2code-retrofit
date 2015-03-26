var test = require("raml2code-fixtures").runSimpleTest,
  path = require('path');

describe('RAML to Retrofit client ', function () {

  var generator = require('../lib/retrofit-client');
  var codeReference = path.join(__dirname, '../code-reference/');
  var extra = {package: 'org.gex.client', importPojos: 'com.pojos'};


  it("Should generate a Retrofit client from RAML file",
    test("index.raml", generator, extra,  codeReference + "FixtureAPI.java", "v1/FixtureAPI.java", false ));

});
