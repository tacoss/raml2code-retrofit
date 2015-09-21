#commonHelpers = require("../helpers/common").helpers()
utilSchemas = require('raml2code-utils/lib/schemas')
pascalCase = require('pascal-case')
parseResource = require('raml2code-utils/lib/parse-resource')
_ = require('lodash')

generator = {}
#generator.helpers = commonHelpers

generator.template = {'{{fileName}}':require("../tmpl/retrofitClient.hbs")}

customAdapter = (method, methodParsed)->

  formData = _.find(methodParsed.args, (arg) ->
    arg.classType is 'InputStream' or arg.classType is 'TypedFile'
  )

  formEncoded = _.find(methodParsed.args, (arg)->
    arg.kind.indexOf("@Field") > -1 or arg.kind.indexOf("@FormDataParam") > -1
  )

  if formData
    methodParsed.additionalAnnotation = "Multipart"
  if formEncoded
    methodParsed.additionalAnnotation = "FormUrlEncoded"

  mediaType = "application/json"
  if method.body and Object.keys(method.body)[0]
    mediaType = Object.keys(method.body)[0]
  if methodParsed.annotation is "DELETE"
    methodParsed.additionalAnnotation = "Headers({\"Content-type: #{mediaType}\"})"

generator.parser = (data) ->
  parsed = []
  schemas = utilSchemas.loadSchemas(data)

  options =
    annotations :
      path: "@Path"
      query: "@Query"
      body: "@Body"
      multiPart: "@Part"
      form: "@Field"
    mapping :
     'string' : "String"
     'boolean' : "Boolean"
     'number' : "BigDecimal"
     'integer' : "Long"
     'array' : "List"
     'object' : "Map"
     'file' : "TypedFile"
  methodParse = []

  for resource in data.resources
    methodParse.push parseResource(resource, options, schemas, customAdapter)

  methodParse = _.flatten(methodParse)

  methodParsePermuted = []

  for method in methodParse

    method.comments = []
    args = method.args
    method.args = []
    #Find not required arguments
    notReqArgs = _.filter(args, (it)->
      it.required == false
    )

    reqArgs = _.difference(args, notReqArgs)

    method.args = method.args.concat(reqArgs)

    if notReqArgs and notReqArgs.length > 0
      method.args.push({kind:'@QueryMap', classType: 'Map<String, String>', name : 'options' })
      #add comments to interface
      method.comments.push("Use @QueryMap to provide the following optional parameters: ")
      for arg in notReqArgs
        method.comments.push("#{arg.name} it must be parseable to @#{arg.classType} ")
    else
      methodParsePermuted.push method

  model = {}
  model.methods = methodParse
  model.version = if data.version then "/#{data.version}" else ""
  if data.extra
    if data.version
      data.extra.package = "#{data.extra.package}.#{data.version}"
      data.extra.importPojos = "#{data.extra.importPojos}.#{data.version}"
    model.extra = data.extra

  version =  if data.version then "#{data.version}/"  else ""
  model.className = data.title.split(" ").join("")
  model.fileName ="#{version}#{model.className}.java"
  parsed.push model

  parsed

module.exports = generator
