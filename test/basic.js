var test = require('tape')
var fs = require('fs')
var importer = require('../')
var OsmMem = require('osm-p2p-mem')

test('ways before nodes', function (t) {
  var xml = fs.createReadStream('./test/ways_first.xml')

  var osm = OsmMem()

  var pending = 7

  importer(osm, xml, function (err) {
    t.error(err)
    var rs = osm.kv.createReadStream()
    rs.on('data', function () {
      if(!--pending) t.end()
    })
  })
})

test('smaller.xml', function (t) {
  var xml = fs.createReadStream('./test/smaller.xml')

  var osm = OsmMem()

  importer(osm, xml, function (err) {
    t.error(err)
    t.end()
  })
})
