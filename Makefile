CLIENT     = release/temple.js
CLIENT_MIN = release/temple-min.js
GRAMMAR    = src/temple.y
LEXER      = src/temple.l
PARSER     = lib/temple/parser.js

all: parser client

parser:
		@jison $(GRAMMAR) $(LEXER) -m commonjs
		@mv temple.js $(PARSER)

parser-client:
		@jison $(GRAMMAR) $(LEXER) -m js
		@mv temple.js $(PARSER).client

clean:
		rm -f $(PARSER) $(PARSER).client release/*

client: parser-client
		@node scripts/build_client.js > $(CLIENT)
		@cat $(CLIENT) | uglifyjs > $(CLIENT_MIN)

size: client
		@cat $(CLIENT_MIN) | wc -c
		@gzip -c6 $(CLIENT_MIN) | wc -c

lint:
		@jshint .

test:
		@mocha

.PHONY: test
