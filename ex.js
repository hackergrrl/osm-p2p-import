var importer = require('./')
var fs = require('fs')
var OsmP2P = require('osm-p2p')

var xml = fs.createReadStream('./test/smaller.xml')

var osm = OsmP2P('./ex.db')

importer(osm, xml, function (err) {
  console.log('written to ex.db', err)
})
