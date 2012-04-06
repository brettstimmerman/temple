LITERAL     [^{]+
OPERATOR    [\?\/\.;&#+]
PREFIX      \:\d+
VARIABLE    [a-zA-Z0-9_]+

%s expression

%%

'{'                     { this.begin('expression'); return 'LBRACE'; }
'}'                     { this.popState(); return 'RBRACE'; }
<expression>{VARIABLE}  { return 'VARIABLE'; }
<expression>{OPERATOR}  { return 'OPERATOR'; }
<expression>{PREFIX}    { return 'PREFIX'; }
<expression>'*'         { return '*'; }
<expression>','         { return ','; }
{LITERAL}               { return 'LITERAL'; }

%%
