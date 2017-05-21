var importer = require('./')
var fs = require('fs')

var xml = fs.createReadStream('./6.xml')

importer('/tmp/osm-p2p-ex', xml, function (err) {
  console.log('done', err)
})
