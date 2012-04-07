LITERAL     [^{}]+
OPERATOR    [\?\/\.;&#+]
PREFIX      \:[1-9](?:[0-9]{1,3})?
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
