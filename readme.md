# OpenAPI documentation generator for Antora

This is an extension for Antora, which generates documentation based on
Swagger (OpenAPI) specification files.

This is pre-alpha software. Still, it generates valid sample JSONs for
sample request bodies and server responses, supports `allOf` and `oneOf`
quantifiers.

This extension does not support circular references (serializing such
specification to dereferenced data structure seems to be not possible in
`@readme/openapi-parser`, still thinking about a workaround).

## Requirements

`@readme/openapi-parser` should be in `package.json` of your Antora playbook, then `npm install`:
`package.json`:
```json
{
  "dependencies": {
    "@readme/openapi-parser": "^2.5.0"
  }
}
```

Optional: `@asciidoctor/tabs` extension in playbook:
`package.json`:
```json
{
  "dependencies": {
    "@asciidoctor/tabs": "^1.0.0-beta.6"
  }
}
```
`playbook.yml`:
```yaml
asciidoc:
  extensions:
  - '@asciidoctor/tabs'
```

## How to build

1. `npm install typescript -g`

2. `make -i -B` (to ignore `tsc` errors)

3. Get all the files in `\dist`.

Manually: `tsc` to compile `.ts` to `.js` file in `\build`, then append
`src\loader.js` to it. Rename result to `openapi-parser.js`.

## Install

Let's suppose your Antora playbook folder contains `./extensions` folder
where all of your playbook extensions reside.

* Copy `dist\openapi-include-processor.js` to your Antora playbook extensions folder.

* Copy `dist\openapi-parser.js` to your Antora playbook extensions folder.

* In your Antora playbook copy of `openapi-include-processor.js` change line
  starting with `const encodedOutput`: change `./lib/openapi-parser.js` to
  `./extensions/openapi-parser.js`.

* Merge `openapi-parser.css` to your Antora-UI or add it to supplemental UI
  (UI modifying instructions is not in scope of this repo). Without this
  HTTP-verbs like `GET`, `POST`, PUT` before endpoints will not look like expected.

## How to use

Extension filters out endpoints from top to bottom: endpoint — operation
(verb) — tags|operationId|etc. So, if the endpoint is filtered out on earlier stages,
it will not be shown.

Example: `include::http://example.com/swagger.json[pathcontains="string1", operationId="string2]`.
If endpoint path does not contain `string1`, it will not be in the
output, event if it has requested `operationId`.

In the same way, if you set `responses="false"`, it does not matter what
`httpcodes` you want to see: no responses table = no response codes.

### Get Full Specification

`include::http://example.com/swagger.json[]`
`include::http://example.com/swagger.yaml[]`
`include::file:///path/to/file/swagger.json[]`

### Options List

`include::http://example.com/swagger.json[pathendswith="string1;string2"]` — show only endpoints that end with `string1` or `string2`

`include::http://example.com/swagger.json[pathcontains="string1;string2"]` — show only endpoints that contain `string1` or `string2`

`include::http://example.com/swagger.json[headers="true|false"]` — show endpoint `summary` as section header

`include::http://example.com/swagger.json[parameters="true|false"]` — show endpoint parameters tables

`include::http://example.com/swagger.json[responses="true|false"]` — show responses

`include::http://example.com/swagger.json[requestBodies="true|false"]` — show request body

`include::http://example.com/swagger.json[tags="string1;string2"]` — show only endpoints tagged with `string1` or `string2`

`include::http://example.com/swagger.json[labels="string1;string2"]` — label resulting endpoints with `string1` and `string2` labels (`.tag` CSS class)

`include::http://example.com/swagger.json[operationIds="string1;string2"]` — show only enpoints with id's `string1` or `string2`

`include::http://example.com/swagger.json[methods="string1;string2"]` — show only methods of `string1` or `string2`, where `string` is of `get|post|put|delete|options|head|patch|trace`

`include::http://example.com/swagger.json[collapsible="true|false"]` — render endpoint description inside `[%colapsible]` block

`include::http://example.com/swagger.json[httpcodes="num1;num2"]` — show only responses with HTTP-codes of number `num1`, `num2` etc

`include::http://example.com/swagger.json[tabbed="true|false"]` — experimental, requires `@asciidoctor/tabs` extension in playbook

