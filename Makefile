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
		rm -f $(PARSER) $(PARSER).client release/*

client: parser-client
		@node scripts/build_client.js > $(CLIENT)
		@$(UGLIFY) $(CLIENT) -o $(CLIENT_MIN)

size: client
		@cat $(CLIENT_MIN) | wc -c
		@gzip -c6 $(CLIENT_MIN) | wc -c

lint:
		@$(JSHINT) --show-non-errors **/*.js

test:
		@$(MOCHA)

.PHONY: test
