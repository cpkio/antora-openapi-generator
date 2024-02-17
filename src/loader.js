const argsString = process?.argv[2];
if (argsString) {
    try {
        const buf = new Buffer.from(argsString, 'base64');
        const args = JSON.parse(buf.toString());
        if (args) { options = args; };
    }
    catch (error) {
        console.error('Arguments parsing error: ', error.message);
    }
}

if (options.url) {
  const OpenAPI = require('@readme/openapi-parser');
  const parser = new OpenAPI();
  const api = parser.dereference(
    options.url,
    { dereference: { circular: false } },
    (err, result) => {
      if (err) {
        console.error(`'openapi-parser' error: ${err}`);
      }
      else {
        const paths = new Paths('paths', result.paths);
        const asciidoc = new Buffer.from(
            JSON.stringify(
              paths.toString().split('\n').map( (line) => line.trimEnd() )
            ) 
        )
        // const asciidoc = new Buffer.from( paths.toString() )
        console.log(asciidoc.toString('base64'));
      }
  });
}
else
{
  console.error('No valid URL provided')
}

