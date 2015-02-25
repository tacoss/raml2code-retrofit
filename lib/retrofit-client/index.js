var arrayFromMask, customAdapter, generator, parseResource, pascalCase, resolveArrayByMask, utilSchemas, _;

utilSchemas = require('raml2code-utils/lib/schemas');

pascalCase = require('pascal-case');

parseResource = require('raml2code-utils/lib/parse-resource');

_ = require('lodash');

generator = {};

generator.template = require("../tmpl/retrofitClient.hbs");

customAdapter = function(method, methodParsed) {
  var formData, formEncoded, mediaType;
  formData = _.find(methodParsed.args, function(arg) {
    return arg.classType === 'InputStream' || arg.classType === 'TypedFile';
  });
  formEncoded = _.find(methodParsed.args, function(arg) {
    return arg.kind.indexOf("@Field") > -1 || arg.kind.indexOf("@FormDataParam") > -1;
  });
  if (formData) {
    methodParsed.additionalAnnotation = "Multipart";
  }
  if (formEncoded) {
    methodParsed.additionalAnnotation = "FormUrlEncoded";
  }
  mediaType = "application/json";
  if (method.body && Object.keys(method.body)[0]) {
    mediaType = Object.keys(method.body)[0];
  }
  if (methodParsed.annotation === "DELETE") {
    return methodParsed.additionalAnnotation = "Headers({\"Content-type: " + mediaType + "\"})";
  }
};

generator.parser = function(data) {
  var arg, d, method, methodParse, methodParsePermuted, model, name, newArgs, notReqArgs, options, parsed, permutations, permuted, reqArgs, resource, result, schemas, shallowMethod, version, _i, _j, _k, _len, _len1, _len2, _ref;
  parsed = [];
  schemas = utilSchemas.loadSchemas(data);
  options = {
    annotations: {
      path: "@Path",
      query: "@Query",
      body: "@Body",
      multiPart: "@Part",
      form: "@Field"
    },
    mapping: {
      'string': "String",
      'boolean': "Boolean",
      'number': "BigDecimal",
      'integer': "Long",
      'array': "List",
      'object': "Map",
      'file': "TypedFile"
    }
  };
  methodParse = [];
  _ref = data.resources;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    resource = _ref[_i];
    methodParse.push(parseResource(resource, options, schemas, customAdapter));
  }
  methodParse = _.flatten(methodParse);
  methodParsePermuted = [];
  for (_j = 0, _len1 = methodParse.length; _j < _len1; _j++) {
    method = methodParse[_j];
    notReqArgs = _.filter(method.args, function(it) {
      return it.required === false;
    });
    if (notReqArgs && notReqArgs.length > 0) {
      reqArgs = _.difference(method.args, notReqArgs);
      permutations = (Math.pow(2, notReqArgs.length)) - 1;
      while (permutations >= 0) {
        shallowMethod = _.cloneDeep(method);
        d = arrayFromMask(permutations);
        permuted = resolveArrayByMask(d, notReqArgs);
        name = shallowMethod.name;
        for (_k = 0, _len2 = permuted.length; _k < _len2; _k++) {
          arg = permuted[_k];
          name = name + ("And" + (pascalCase(arg.name)));
        }
        newArgs = reqArgs.concat(permuted);
        shallowMethod.args = newArgs;
        shallowMethod.name = name;
        methodParsePermuted.push(shallowMethod);
        permutations--;
      }
    } else {
      methodParsePermuted.push(method);
    }
  }
  model = {};
  model.methods = methodParsePermuted;
  model.version = data.version;
  if (data.extra) {
    data.extra["package"] = "" + data.extra["package"] + "." + data.version;
    data.extra.importPojos = "" + data.extra.importPojos + "." + data.version;
    model.extra = data.extra;
  }
  result = {};
  version = data.version ? "" + data.version + "/" : "";
  model.className = data.title.split(" ").join("");
  result["" + version + model.className + ".java"] = model;
  parsed.push(result);
  return parsed;
};

arrayFromMask = function(nMask) {
  var aFromMask, nShifted;
  if (nMask > 0x7fffffff || nMask < -0x80000000) {
    throw new TypeError("arrayFromMask - out of range");
  }
  nShifted = nMask;
  aFromMask = [];
  while (nShifted) {
    aFromMask.push(Boolean(nShifted & 1));
    nShifted >>>= 1;
  }
  return aFromMask;
};

resolveArrayByMask = function(mask, array) {
  var i, j, res;
  res = [];
  i = array.length - 1;
  j = 0;
  while (i >= 0) {
    if (mask[j]) {
      res.push(array[i]);
    }
    i--;
    j++;
  }
  return res;
};

module.exports = generator;
