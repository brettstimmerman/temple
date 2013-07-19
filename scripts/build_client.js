var fs   = require('fs'),
    path = require('path');

function stripExports(string) {
    var match = string.match(/\/\/ <browser>([\s\S]*)\/\/ <\/browser>/);
    return (match ? match[1] : string).replace(/^\s*|\s*$/g, '');
}

function bundle(root) {
    var files = [
            'base.js', 'parser.js.client', 'expression.js', 'ast.js',
            'compiler.js'
        ],
        lib = '/lib/temple/',
        out = '';

    files.forEach(function (file) {
        file = fs.readFileSync(path.join(root, lib, file), 'utf-8');
        out += stripExports(file) + '\n\n';
    });

    console.log(out);
}

bundle(process.cwd());
