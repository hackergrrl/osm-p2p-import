#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var args = require('minimist')(process.argv, {boolean: ['s','slow']})
var mkdirp = require('mkdirp')
var importer = require('../')

if (args.h || args.help) {
  return exit(0)
}

console.log(args._)

if (args._.length < 3) {
  return exit(0)
}

mkdirp.sync(args._[2])

var xml
if (args._.length === 4) xml = fs.createReadStream(args._[3])
else if (args._.length === 3) xml = process.stdin
else return exit(0)

var opts = {}
opts.slow = args.s || args.slow || false

importer(args._[2], xml, opts, function (err) {
  if (err) throw err
})

function exit (code) {
  fs.createReadStream(path.join(__dirname, 'USAGE')).pipe(process.stdout)
  process.stdout.on('end', function () {
    process.exit(code)
  })
}
