var Temple = require('./base');

// <browser>

Temple.AST = {
    ExpressionNode: function (params, op) {
        this.type   = 'expression';
        this.op     = op;
        this.params = params;
    },
    
    LiteralNode: function (value) {
        this.type  = 'literal';
        this.value = value;
    },
    
    VariableNode: function (name, modifier) {
        this.type = 'variable';
        this.name = name;
        
        if ('*' === modifier) {
            this.explode = true;
        } else {
            this.prefix = modifier && modifier.slice(1);
        }
    }
};

// </browser>
