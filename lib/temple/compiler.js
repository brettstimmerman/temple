var temple = require('./parser').parser,
    Temple = require('./base');

// <browser>

Temple.Parser    = temple;
Temple.Parser.yy = Temple.AST;

/**
Compile the given URI Template string into a function. The function takes a
single hash-object argument containing variables to expand the template into a
URI.

@method compile
@param {String} string URI Template.
@return {Function} Expansion function.
**/
Temple.compile = function (string) {
    var statements = Temple.Parser.parse(string);
    
    return function (vars) {
        var uri = '';

        Temple.Array.each(statements, function (statement) {
            switch (statement.type) {
            case 'literal':
                uri += Temple.Encoder.literal(statement.value);
                break;

            case 'expression':
                uri += (new Temple.Expression(statement)).expand(vars);
                break;
            }
        });
        
        return uri;
    };
};

/**
Compile and expand a URI Template for the given variables.

@method expand
@param {String} string A URI Template.
@param {Object} vars Hash-object containing expansion variables.
@return {String} Expanded URI.
**/
Temple.expand = function (string, vars) {
    return (Temple.compile(string))(vars);
};

// </browser>
