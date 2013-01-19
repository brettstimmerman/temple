// <browser>

var Temple = {};

Temple.VERSION = '0.0.3';

/*
Operator table from RFC 6570, Appendix A, Implementation Hints.

.------------------------------------------------------------------.
|          NUL     +      .       /       ;      ?      &      #   |
|------------------------------------------------------------------|
| first |  ""     ""     "."     "/"     ";"    "?"    "&"    "#"  |
| sep   |  ","    ","    "."     "/"     ";"    "&"    "&"    ","  |
| named | false  false  false   false   true   true   true   false |
| ifemp |  ""     ""     ""      ""      ""     "="    "="    ""   |
| allow |   U     U+R     U       U       U      U      U     U+R  |
`------------------------------------------------------------------'

first:  String to append to the result first if any of the expression's
        variables are defined.

sep:    Separator to append to the result before any second (or subsequent)
        defined variable expansion.
        
named:  A boolean for whether or not the expansion includes the variable or
        key name when no explode modifier is given.
        
ifemp:  String to append to the name if the corresponding value is empty.

allow:  What characters to allow unencoded within the value expansion.
        'U' means any character not in the unreserved list will be encoded.
        'U+R' means any character not in the unreserved or reserved lists will
        be encoded.
*/

Temple.Operator = {
    /**
    Returns the operator configuration for the given operator name.
    
    @method get
    @param {String} Operator name.
    @return {Object} Operator configuration.
    **/
    get: function (op) {
        return this[op] || this['default'];
    },
    
    // Simple string expansion
    'default': {
        first: '',
        sep  : ',',
        named: false,
        ifemp: '',
        allow: 'U'
    },
    
    // Reserved expansion
    '+': {
        first: '',
        sep  : ',',
        named: false,
        ifemp: '',
        allow: 'U+R'
    },
    
    // Label expansion with dot-prefix
    '.': {
        first : '.',
        sep   : '.',
        named : false,
        ifemp : '',
        allow : 'U'
    },
    
    // Path segment expansion
    '/': {
        first: '/',
        sep  : '/',
        named: false,
        ifemp: '',
        allow: 'U'
    },
    
    // Path-style parameter expansion
    ';': {
        first: ';',
        sep  : ';',
        named: true,
        ifemp: '',
        allow: 'U'
    },
    
    // Form-style query expansion
    '?': {
        first: '?',
        sep  : '&',
        named: true,
        ifemp: '=',
        allow: 'U'
    },
    
    // Form-style query continuation
    '&': {
        first: '&',
        sep  : '&',
        named: true,
        ifemp: '=',
        allow: 'U'
    },
    
    // Fragment expansion
    '#': {
        first : '#',
        sep   : ',',
        named : false,
        ifemp : '',
        allow : 'U+R'
    }
};

(function () {
var Aproto = Array.prototype,

    // Regular expressions used for encoding expansion values.
    re  = {
        // Match characters not in the unreserved list.
        U: /[^\w~.\-]/g,
        
        // Match characters not in the ureserved or reserved lists.
        UR: /[^\w.~:\/\?#\[\]@!\$&'()*+,;=\-]/g,
        
        // Match invalid URI characters, and "%" characters not part of a
        // percent-encoded character. Percent-encoding detection can produce
        // false positives.
        L: /[\x01-\x1A]|[ "'<>\\\^`{|}]|%(?![a-fA-F0-9]{2})/g
    };

// Escape additional URI characters per RFC 3986: !, ', (, ), *
function _encodeURIComponent(str) {
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27')
        .replace(/\(/g, '%27').replace(/\)/g, '%28').replace(/\*/, '%2A');
}

/**
URL-encode portions of a value that match a regular expression. Optionally
avoid double-encoding of already URL-encoded values. Non-string values are
coerced to string before encoding.

@method encode
@param {Mixed} value The value to encode.
@param {RegExp} re Regular expression used for matching.
@param {Boolean} [decode] Whether or not to decode the string first, to
    prevent double-encoding. Default is false.
@return {String} The URI encoded string.
**/
function encode(value, re, decode) {
    var string = '' + value,
        m;
    
    if (decode && /\%/.test(string)) {
        try {
            string = decodeURIComponent(string);
        } catch (e) {}
    }
    
    return (function next(start) {
        if (m = re.exec(string)) {
            return string.slice(start, m.index) + _encodeURIComponent(m[0]) +
                next(m.index + 1);
        }
        
        return string.substring(start);
    }(0));
}

Temple.Encoder = {
    varname   : encodeURIComponent,
    literal   : function (value) { return encode(value, re.L);        },
    unreserved: function (value) { return encode(value, re.U,  true); },
    reserved  : function (value) { return encode(value, re.UR, true); }
};

// Shorthand aliases.
Temple.Encoder.L      = Temple.Encoder.literal;
Temple.Encoder.U      = Temple.Encoder.unreserved;
Temple.Encoder['U+R'] = Temple.Encoder.reserved;

Temple.Array = {
    each: Aproto.forEach ? function (array, fn, thisObj) {
        array.forEach(fn, thisObj);
    } : function (array, fn, thisObj) {
        var i, len;
        
        for (i = 0, len = (array && array.length) || 0; i < len; ++i) {
            if (array[i] !== undefined) {
                fn.call(thisObj, array[i], i, array);
            }
        }
    },
    
    filter: Aproto.filter ? function (array, fn, thisObj) {
        return array.filter(fn, thisObj);
    } : function (array, fn, thisObj) {
        var results = [];
            
        Temple.Array.each(array, function (item, index) {
            if (fn.call(thisObj, item, index, array)) {
                results.push(item);
            }
        });
        
        return results;
    },
    
    isArray: Array.isArray ? Array.isArray : function (o) {
        return Object.prototype.toString.call(o) === '[object Array]';
    },
    
    map: Aproto.map ? function (array, fn, thisObj) {
        return array.map(fn, thisObj);
    } : function (array, fn, thisObj) {
        var results = array.concat();
        
        Temple.Array.each(array, function (item, index) {
            results = fn.call(thisObj, item, index, array);
        }, thisObj);
        
        return results;
    }
};

Temple.Object = {
    each: function (o, fn, thisObj) {
        var key;
        
        for (key in o) {
            if (o.hasOwnProperty(key)) {
                fn.call(thisObj, o[key], key, o);
            }
        }
    },
    
    some: function (o, fn, thisObj) {
        var key;
        
        for (key in o) {
            if (o.hasOwnProperty(key) && fn.call(thisObj, o[key], key, o)) {
                return true;
            }
        }
        
        return false;
    }
};

}());

// </browser>

module.exports = Temple;
