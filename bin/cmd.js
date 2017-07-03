#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var args = require('minimist')(process.argv)
var mkdirp = require('mkdirp')
var importer = require('../')

if (args.h || args.help) {
  return exit(0)
}

if (args._.length !== 4) {
  return exit(0)
}

mkdirp.sync(args._[3])

var xml = fs.createReadStream(args._[2])

importer(args._[3], xml, function (err) {
  if (err) throw err
  console.log('done')
})

function exit (code) {
  fs.createReadStream(path.join(__dirname, 'USAGE')).pipe(process.stdout)
  process.stdout.on('end', function () {
    process.exit(code)
  })
}
