%start root

%%

root
    : program { return $$ = $1; }
    ;

program
    : { $$ = []; }
    | statements { $$ = $1; }
    ;

statements
    : statement { $$ = [$1]; }
    | statements statement { $1.push($2); $$ = $1; }
    ;

statement
    : LITERAL { $$ = new yy.LiteralNode($1); }
    | LBRACE RBRACE { $$ = new yy.ExpressionNode([]); }
    | LBRACE operator variable-list RBRACE
        { $$ = new yy.ExpressionNode($3, $2); }
    ;

operator
    :
    | OPERATOR { $$ = $1; }
    ;

variable-list
    : variable { $$ = [$1]; }
    | variable-list ',' variable { $1.push($3); $$ = $1; }
    ;

variable
    : VARIABLE modifier { $$ = new yy.VariableNode($1, $2); }
    | VARIABLE error '}'
    ;

modifier
    :
    | '*' { $$ = $1; }
    | PREFIX { $$ = $1; }
    ;
