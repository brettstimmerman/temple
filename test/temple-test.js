var assert = require('assert'),
    Temple = require('../lib/temple'),

    vars = {
        // Example variables from RFC 6570.
        count: ['one', 'two', 'three'],
        dom  : ['example', 'com'],
        dub  : 'me/too',
        hello: 'Hello World!',
        half : '50%',
        'var': 'value',
        who  : 'fred',
        base : 'http://example.com/home/',
        path : '/foo/bar',
        list : ['red', 'green', 'blue'],
        keys : {semi: ';', dot: '.', comma: ','},
        v    : 6,
        x    : 1024,
        y    : 768,
        empty: '',
        empty_keys: [],
        undef: null,
    
        // Other variables.
        'true'   : true,
        'false'  : false,
        booleans : [true, false],
        bool_keys: {'true': true, 'false': false},
        pct      : 'hello%20world',
        pct_key  : {'20%': 0.2},
        unicode  : '竜'
    };

function runTests(tests) {
    Temple.Object.each(tests, function (value, key) {
        it('"' + key + '"', function () {
            assert.equal(Temple.expand(key, vars), value);
        });
    });
}

describe('Temple', function () {
    describe('3.2.1. Variable Expansion', function () {
        var tests = {
            '{count}': 'one,two,three',
            '{count*}': 'one,two,three',
            '{/count}': '/one,two,three',
            '{/count*}': '/one/two/three',
            '{;count}': ';count=one,two,three',
            '{;count*}': ';count=one;count=two;count=three',
            '{?count}': '?count=one,two,three',
            '{?count*}': '?count=one&count=two&count=three',
            '{&count}': '&count=one,two,three',
            '{&count*}': '&count=one&count=two&count=three'
        };

        runTests(tests);
    });
    
    describe('3.2.2. Simple String Expansion', function () {
        var tests = {
            '{empty}': '',
            '{undef}': '',
            '{var}': 'value',
            '{hello}': 'Hello%20World%21',
            '{half}': '50%25',
            'O{empty}X': 'OX',
            'O{undef}X': 'OX',
            '{x,y}': '1024,768',
            '{x,hello,y}': '1024,Hello%20World%21,768',
            '?{x,empty}': '?1024,',
            '?{x,undef}': '?1024',
            '?{empty,y}': '?,768',
            '?{undef,y}': '?768',
            '{var:3}': 'val',
            '{var:30}': 'value',
            '{list}': 'red,green,blue',
            '{list*}': 'red,green,blue',
            '{keys}': 'semi,%3B,dot,.,comma,%2C',
            '{keys*}': 'semi=%3B,dot=.,comma=%2C'
        };
        
        runTests(tests);
    });
    
    describe('3.2.3. Reserved Expansion', function () {
        var tests = {
            '{+empty}': '',
            '{+undef}': '',
            '{+var}': 'value',
            '{+hello}': 'Hello%20World!',
            '{+half}': '50%25',

            '{base}index': 'http%3A%2F%2Fexample.com%2Fhome%2Findex',
            '{+base}index': 'http://example.com/home/index',
            'O{+empty}X': 'OX',
            'O{+undef}X': 'OX',

            '{+path}/here': '/foo/bar/here',
            'here?ref={+path}': 'here?ref=/foo/bar',
            'up{+path}{var}/here': 'up/foo/barvalue/here',
            '{+x,hello,y}': '1024,Hello%20World!,768',
            '{+path,x}/here': '/foo/bar,1024/here',

            '{+path:6}/here': '/foo/b/here',
            '{+list}': 'red,green,blue',
            '{+list*}': 'red,green,blue',
            '{+keys}': 'semi,;,dot,.,comma,,',
            '{+keys*}': 'semi=;,dot=.,comma=,'
        };
        
        runTests(tests);
    });
    
    describe('3.2.4. Fragment Expansion', function () {
        var tests = {
            '{#var}': '#value',
            '{#hello}': '#Hello%20World!',
            '{#half}': '#50%25',
            'foo{#empty}': 'foo#',
            'foo{#undef}': 'foo',
            '{#x,hello,y}': '#1024,Hello%20World!,768',
            '{#path,x}/here': '#/foo/bar,1024/here',
            '{#path:6}/here': '#/foo/b/here',
            '{#list}': '#red,green,blue',
            '{#list*}': '#red,green,blue',
            '{#keys}': '#semi,;,dot,.,comma,,',
            '{#keys*}': '#semi=;,dot=.,comma=,'
        };
        
        runTests();
    });
    
    describe('3.2.5. Label Expansion with Dot-Prefix', function () {
        var tests = {
            '{.who}': '.fred',
            '{.who,who}': '.fred.fred',
            '{.half,who}': '.50%25.fred',
            'www{.dom*}': 'www.example.com',
            'X{.var}': 'X.value',
            'X{.empty}': 'X.',
            'X{.undef}': 'X',
            'X{.var:3}': 'X.val',
            'X{.list}': 'X.red,green,blue',
            'X{.list*}': 'X.red.green.blue',
            'X{.keys}': 'X.semi,%3B,dot,.,comma,%2C',
            'X{.keys*}': 'X.semi=%3B.dot=..comma=%2C',
            'X{.empty_keys}': 'X',
            'X{.empty_keys*}': 'X'
        };
        
        runTests(tests);
    });

    describe('3.2.6. Path Segment Expansion', function () {
        var tests = {
            '{/empty}': '/',
            '{/undef}': '',
            '{/who}': '/fred',
            '{/who,who}': '/fred/fred',
            '{/half,who}': '/50%25/fred',
            '{/who,dub}': '/fred/me%2Ftoo',
            '{/var}': '/value',
            '{/var,empty}': '/value/',
            '{/var,undef}': '/value',
            '{/var,x}/here': '/value/1024/here',
            '{/var:1,var}': '/v/value',
            '{/list}': '/red,green,blue',
            '{/list*}': '/red/green/blue',
            '{/list*,path:4}': '/red/green/blue/%2Ffoo',
            '{/keys}': '/semi,%3B,dot,.,comma,%2C',
            '{/keys*}': '/semi=%3B/dot=./comma=%2C'
        };
        
        runTests(tests);
    });

    describe('3.2.7. Path-Style Parameter Expansion', function () {
        var tests = {
            '{;undef}': '',
            '{;who}': ';who=fred',
            '{;half}': ';half=50%25',
            '{;empty}': ';empty',
            '{;v,empty,who}': ';v=6;empty;who=fred',
            '{;v,bar,who}': ';v=6;who=fred',
            '{;x,y}': ';x=1024;y=768',
            '{;x,y,empty}': ';x=1024;y=768;empty',
            '{;x,y,undef}': ';x=1024;y=768',
            '{;hello:5}': ';hello=Hello',
            '{;list}': ';list=red,green,blue',
            '{;list*}': ';list=red;list=green;list=blue',
            '{;keys}': ';keys=semi,%3B,dot,.,comma,%2C',
            '{;keys*}': ';semi=%3B;dot=.;comma=%2C'
        };
    });

    describe('3.2.8. Form-Style Query Expansion', function () {
        var tests = {
            '{?empty}': '?empty=',
            '{?undef}': '',
            '{?who}': '?who=fred',
            '{?half}': '?half=50%25',
            '{?x,y}': '?x=1024&y=768',
            '{?x,y,empty}': '?x=1024&y=768&empty=',
            '{?x,y,undef}': '?x=1024&y=768',
            '{?var:3}': '?var=val',
            '{?list}': '?list=red,green,blue',
            '{?list*}': '?list=red&list=green&list=blue',
            '{?keys}': '?keys=semi,%3B,dot,.,comma,%2C',
            '{?keys*}': '?semi=%3B&dot=.&comma=%2C'
        };
        
        runTests(tests);
    });
    
    describe('3.2.9. Form-Style Query Continuation', function () {
        var tests = {
            '{&empty}': '&empty=',
            '{&undef}': '',
            '{&who}': '&who=fred',
            '{&half}': '&half=50%25',
            '?fixed=yes{&x}': '?fixed=yes&x=1024',
            '{&x,y,empty}': '&x=1024&y=768&empty=',
            '{&x,y,undef}': '&x=1024&y=768',

            '{&var:3}': '&var=val',
            '{&list}': '&list=red,green,blue',
            '{&list*}': '&list=red&list=green&list=blue',
            '{&keys}': '&keys=semi,%3B,dot,.,comma,%2C',
            '{&keys*}': '&semi=%3B&dot=.&comma=%2C'
        };
        
        runTests(tests);
    });
    
    describe('X.1.   Prefix Modifiers and Non-String Values', function () {
        var tests = {
            '{&list:3}': '&list=red,green,blue',
            '{&bool_keys:3}': '&bool_keys=true,true,false,false',
            '{&x:2,y:2}': '&x=10&y=76',

            '{&true}': '&true=true',
            '{&false}': '&false=false',
            '{/booleans*}': '/true/false',
            '{?bool_keys}': '?bool_keys=true,true,false,false',
            '{;bool_keys*}': ';true=true;false=false'
        };
        
        runTests(tests);
    });

    describe('X.2.   Unicode', function () {
        var tests = {
            'http://➡.com/{?unicode}': 'http://➡.com/?unicode=%E7%AB%9C'
        };
        
        runTests(tests);
    });

    describe('X.3.   Percent Encoding', function () {
        var tests = {
            'http%3A%2F%2Fexample.com{?pct}': 'http%3A%2F%2Fexample.com?pct=hello%20world',

            '{?pct_key*}': '?20%25=0.2'
        };
        
        runTests(tests);
    });
    
    describe('X.4.   Miscellany', function () {
        var tests = {
            '': '',
            ',': ',',
            'foo,bar': 'foo,bar',
            '{undef},{undef}': ',',

            'foo\nbar': 'foo%0Abar',
            '<buzz>{who}</buzz>': '%3Cbuzz%3Efred%3C/buzz%3E',
            '^H': '%5EH'
        };
        
        runTests(tests);
    });
    
    describe('X.5.   Exceptions', function () {
        var tests = [
            '{{}',
            '}',
            '{',
            'x{',
            'list}',
            
            '{x*y}',
            '{list*y}',
            
            '{who,}',
            '{,who}',
            '{who:}',
            '{who:0}',
            '{who:12345}',

            '{&bool_keys:3*}',
            '{&bool_keys*:3}'
        ];
        
        Temple.Array.each(tests, function (value) {
            it('"' + value + '"', function () {
                assert.throws(function () {
                    Temple.expand(value, vars);
                });
            });
        });
    });
});
