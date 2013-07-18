# Temple [![Build Status](https://secure.travis-ci.org/brettstimmerman/temple.png?branch=master)](http://travis-ci.org/brettstimmerman/temple)

A [URI Template](http://www.rfc-editor.org/rfc/rfc6570.txt) processor.

## Installation

Using npm:

```sh
npm install temple
```

To use Temple in the browser, download the client build and include it in your
site (5k gzipped):
[temple-min.js](http://brett.stimmerman.com/temple/temple-min.js).

## Usage

```javascript
var Temple = require('temple');

Temple.expand('/search{?q,page}', {q: 'uri templates', page: 1});
//=> /search?q=uri%20templates&page=1
```

```html
<script src="temple-min.js"></script>

<script>
Temple.expand('{/path}', {path: ['user', 'edit', 6346]});
//=> /user/edit/6346
</script>
```

### Re-usable Templates

```javascript
var tmpl = Temple.compile('/users/show{.format}{?user_id,screen_name}');

tmpl({format: 'json', screen_name: 'bretts'});
//=> /users/show.json?screen_name=bretts

tmpl({format: 'xml', user_id: '15459720'});
//=> /users/show.xml?user_id=15459720
```
