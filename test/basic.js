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

test('ways before nodes', function (t) {
  var xml = fs.createReadStream('./test/ways_first.xml')

  var osm = OsmMem()

  importer(osm, xml, function (err) {
    t.error(err)
    osm.ready(function () {
      osm.query([[-85,85],[-85,85]], function (err, res) {
        t.error(err)
        t.equal(5, res.length)
        t.end()
      })
    })
  })
})
