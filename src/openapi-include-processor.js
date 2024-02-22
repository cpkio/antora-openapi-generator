const { execSync } = require('child_process');

module.exports = function () {
  this.includeProcessor(function() {
    this.prepend('>>')

    this.handles(function(target) {
      return (
        (target.startsWith('file:///') || target.startsWith('http://') || target.startsWith('https://')) &&
        (target.endsWith('.json') || target.endsWith('.yaml') || target.endsWith('.yml'))
      )
    })

    this.process( function (doc, reader, target, args) {
      try {
        let opts = {}
        opts['url'] = target
        if (args?.pathendswith) { opts['pathEndsWith'] = args.pathendswith.split(';') }
        if (args?.pathcontains) { opts['pathContains'] = args.pathcontains.split(';') }
        if (args?.headers === 'false') opts['headers'] = false;
        if (args?.parameters === 'false') opts['parameters'] = false;
        if (args?.responses === 'false') opts['responses'] = false;
        if (args?.requestBodies === 'false') opts['requestBodies'] = false;
        if (args?.tags) { opts['tags'] = args.tags.split(';') }
        if (args?.labels) { opts['labels'] = args.labels.split(';') }
        if (args?.operationIds) { opts['operationIds'] = args.operationIds.split(';') }
        if (args?.methods) { opts['methods'] = args.methods.split(';') }
        if (args?.collapsible === 'true') opts['collapsible'] = true;
        if (args?.httpcodes) { opts['httpcodes'] = args.httpcodes.split(';') }
        if (args?.tabbed === 'true') opts['tabbed'] = true;

        const optsString = new Buffer.from(JSON.stringify(opts))

        const encodedOutput = execSync(`node ./lib/openapi-parser.js ${optsString.toString('base64')}`);

        let output = new Buffer.from(encodedOutput.toString(), 'base64');
        const out = JSON.parse(output.toString());
        // console.log(out)
        reader.pushInclude(out, target + '.adoc', target, 1, args)

      } catch (error) {
        return console.error('Error: ', error);
      }
    })

  })
}
