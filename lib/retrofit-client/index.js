var customAdapter, generator, parseResource, pascalCase, utilSchemas, _;

utilSchemas = require('raml2code-utils/lib/schemas');

pascalCase = require('pascal-case');

parseResource = require('raml2code-utils/lib/parse-resource');

_ = require('lodash');

generator = {};

generator.template = {
  '{{fileName}}': require("../tmpl/retrofitClient.hbs")
};

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
  var arg, args, method, methodParse, methodParsePermuted, model, notReqArgs, options, parsed, reqArgs, resource, schemas, version, _i, _j, _k, _len, _len1, _len2, _ref;
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
    method.comments = [];
    args = method.args;
    method.args = [];
    notReqArgs = _.filter(args, function(it) {
      return it.required === false;
    });
    reqArgs = _.difference(args, notReqArgs);
    method.args = method.args.concat(reqArgs);
    if (notReqArgs && notReqArgs.length > 0) {
      method.args.push({
        kind: '@QueryMap',
        classType: 'Map<String, String>',
        name: 'options'
      });
      method.comments.push("Use @QueryMap to provide the following optional parameters: ");
      for (_k = 0, _len2 = notReqArgs.length; _k < _len2; _k++) {
        arg = notReqArgs[_k];
        method.comments.push("" + arg.name + " it must be parseable to @" + arg.classType + " ");
      }
    } else {
      methodParsePermuted.push(method);
    }
  }
  model = {};
  model.methods = methodParse;
  model.version = data.version ? "/" + data.version : "";
  if (data.extra) {
    if (data.version) {
      data.extra["package"] = "" + data.extra["package"]; + "." + data.version;
      data.extra.importPojos = "" + data.extra.importPojos + "." + data.version;
    }
    model.extra = data.extra;
  }
  version = data.version ? "" + data.version + "/" : "";
  model.className = data.title.split(" ").join("");
  model.fileName = "" + version + model.className + ".java";
  parsed.push(model);
  return parsed;
};

module.exports = generator;
