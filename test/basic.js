var test = require('tape')
var importer = require('../')
var fs = require('fs')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var memdb = require('memdb')

test('smaller.xml', function (t) {
  var xml = fs.createReadStream('./test/smaller.xml')
  rimraf.sync('/tmp/osm-p2p-ex')
  mkdirp.sync('/tmp/osm-p2p-ex')

  importer('/tmp/osm-p2p-ex', xml, function (err) {
    t.error(err)
    t.end()
  })
})

test('smaller.xml: memdb', function (t) {
  var xml = fs.createReadStream('./test/smaller.xml')

  importer.toLevel(memdb(), xml, function (err) {
    t.error(err)
    t.end()
  })
})
