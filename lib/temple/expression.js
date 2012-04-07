var Temple = require('./base');

// <browser>

/**
Represents a single template expression.

@class Expression
@constructor
@param {Object} config Configuration object.
**/
function Expression(config) {
    this._op     = Temple.Operator.get(config.op);
    this._encode = Temple.Encoder[this._op.allow];
    this._params = config.params;
}

Temple.Expression = Expression;

Expression.prototype = {
    /**
    Expand the expression for the given variables.
    
    @method expand
    @param {Object} Hash-object of expansion variables.
    @return {String} Expanded expression.
    **/
    expand: function (vars) {
        var filtered = this._filterVars(vars),
            expanded = Temple.Array.map(filtered, this._expand, this).join(this._op.sep);
        
        if (expanded) {
            // Expanded expression.
            return this._op.first + expanded;
        } else if (this._op.first && !this._op.named && filtered.length) {
            // Expression operators with delimiters and unnamed values include
            // only their delimiter when the expression value is empty.
            return this._op.first;
        }
        
        // Empty expression.
        return '';
    },
    
    /**
    Encode the values of an array.
    
    @method _encodeArray
    @param {Array} array Array to encode.
    @param {String} [name] Name for name=value expansion, if applicable.
    @return {Array} Array of encoded values. When encoding name=value pairs,
        array values are arrays representing each name=value pair.
    @protected
    **/
    _encodeArray: function (array, name) {
        return Temple.Array.map(array, function (value) {
            value = this._encode(value);
            return this._op.named ? [name, value] : value;
        }, this);
    },
    
    /**
    Encode the values of an object.
    
    @method _encodeObject
    @param {Object} object The object containing values to encode.
    @return {Array} Array of encoded values. If values were named, items are
        arrays representing each name=value pair.
    **/
    _encodeObject: function (object, name) {
        var encoded = [];
        
        Temple.Object.each(object, function (val, key) {
            if (Temple.Array.isArray(val)) {
                encoded = encoded.concat(this._encodeArray(val, key));
            } else {
                encoded.push([Temple.Encoder.varname(key), this._encode(val)]);
            }
        }, this);
        
        return encoded;
    },
    
    /**
    Expand a variable.
    
    @method _expand
    @param {Object} spec Hash-object describing the variable to expand.
    @return {String} The expanded value.
    **/
    _expand: function (spec) {
        var expanded,
            maxLength;
        
        // Apply the explode modifier if present.
        if (spec.explode) {
            return this._explode(spec.name, spec.value);
        }
        
        switch (typeof spec.value) {
        case 'boolean':
        case 'number':
        case 'string':
            // Encode simple values.
            
            // Ensure we have a string.
            expanded = '' + spec.value;
            
            // Apply the prefix modifier if present.
            if (spec.prefix) {
                maxLength = parseInt(spec.prefix, 10);

                if (maxLength < expanded.length) {
                    expanded = expanded.substring(0, maxLength);
                }
            }
            
            expanded = this._encode(expanded);
            break;
            
        default:
            // Stringify and encode composite values.
            expanded = this._stringify(spec.value);
        }
        
        if (this._op.named) {
            return spec.name + (expanded ? '=' + expanded : this._op.ifemp);
        }
        
        return expanded;
    },
    
    /**
    Explode a composite expansion value.
    
    @param {String} name The expansion name.
    @value {Array|Object} value The composite value to explode.
    return {String} The exploded expansion value.
    @protected
    **/
    _explode: function (name, value) {
        if ('string' === typeof value) {
            throw new Error('Invalid explode modifier for string value: ' +
                value);
        }
        
        var encoded = Array.isArray(value) ?
            this._encodeArray(value, name) :
            this._encodeObject(value, name);
            
        return Temple.Array.map(encoded, function (p) {
            return Array.isArray(p) ? p.join('=') : p;
        }, this).join(this._op.sep);
    },
    
    /**
    Filter the given expansion variables, removing any that unusable or not
    not needed for this expression.
    
    @method _filterVars
    @param {Array} vars Array of expansion variables to filter.
    @return {Array} Filtered expansion variables.
    @protected
    **/
    _filterVars: function (vars) {
        var value;
        
        return Temple.Array.filter(this._params, function (param) {
            // Look up the variable value.
            param.value = value = vars[param.name];
            
            // Remove undefined and null values.
            if (value === undefined || value === null) {
                return false;
            }
            
            // Remove empty arrays.
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            
            if (typeof value === 'object') {
                // Keep objects with at least one defined value.
                return Temple.Object.some(value, function (val, key) {
                    return val !== undefined && val !== null;
                });
            }
            
            // Keep everything else.
            return true;
        });
    },
    
    /**
    Stringify the given composite value, encoding it in the process. Arrays
    are stringified by joining the values with a comma (","). Objects are
    stringified by joining keys and values together with a comma.
    
    @method _stringify
    @param {Mixed} value The value to stringify.
    @return {String} The encoded string.
    @protected
    **/
    _stringify: function (value) {
        var parts = [];
        
        if (typeof value === 'object') {
            if (Temple.Array.isArray(value)) {
                return Temple.Array.map(value, this._encode).join(',');
            }
            
            Temple.Object.each(value, function (val, key) {
                parts.push(Temple.Array.map([key, val], this._encode).join(','));
            }, this);
            
            return parts.join(',');
        }
        
        return this._encode(value);
    }
};

// </browser>
