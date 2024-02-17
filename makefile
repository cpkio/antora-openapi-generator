default:
	tsc
	md dist
	copy build\index.js+src\loader.js /B dist\openapi-parser.js
	copy src\openapi-include-processor.js dist
	copy src\openapi-parser.css dist
