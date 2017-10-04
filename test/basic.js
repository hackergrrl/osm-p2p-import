var test = require('tape')
var fs = require('fs')
var importer = require('../')
var OsmMem = require('osm-p2p-mem')

test('smaller.xml', function (t) {
  var xml = fs.createReadStream('./test/smaller.xml')

  var osm = OsmMem()

  importer(osm, xml, function (err) {
    t.error(err)
    t.end()
  })
})
