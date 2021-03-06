CLIENT     = release/temple.js
CLIENT_MIN = release/temple-min.js
GRAMMAR    = src/temple.y
LEXER      = src/temple.l
PARSER     = lib/temple/parser.js

JISON  = node_modules/.bin/jison
JSHINT = node_modules/.bin/jshint
MOCHA  = node_modules/.bin/mocha
UGLIFY = node_modules/.bin/uglifyjs

all: parser client

parser:
		@$(JISON) $(GRAMMAR) $(LEXER) -m commonjs
		@mv temple.js $(PARSER)

parser-client:
		@$(JISON) $(GRAMMAR) $(LEXER) -m js
		@mv temple.js $(PARSER).client

clean:
		rm -rf release
		rm -rf index.js
		rm -rf $(PARSER)
		rm -rf $(PARSER).client

client: parser-client
		@mkdir -p release
		@node scripts/build_client.js > $(CLIENT)
		@$(UGLIFY) $(CLIENT) -o $(CLIENT_MIN)

size: client
		@cat $(CLIENT_MIN) | wc -c
		@gzip -c6 $(CLIENT_MIN) | wc -c

lint:
		@$(JSHINT) --show-non-errors **/*.js

test: parser
		@$(MOCHA) --reporter spec

bower: client
		@cp $(CLIENT) index.js

.PHONY: test
