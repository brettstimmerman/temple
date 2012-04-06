CLIENT  = release/temple-min.js
GRAMMAR = src/temple.y
LEXER   = src/temple.l
PARSER  = lib/temple/parser.js

all: parser client

parser:
		@jison $(GRAMMAR) $(LEXER) -m commonjs
		@mv temple.js $(PARSER)

clean:
		rm -f $(PARSER) $(PARSER).client $(CLIENT)

client:
		@jison $(GRAMMAR) $(LEXER) -m js
		@mv temple.js $(PARSER).client
		@node scripts/build_client.js | uglifyjs > $(CLIENT)

size: client
		@cat $(CLIENT) | wc -c
		@gzip -c6 $(CLIENT) | wc -c
		@make clean

lint:
		@jshint .

test:
		@mocha -R spec

.PHONY: test
