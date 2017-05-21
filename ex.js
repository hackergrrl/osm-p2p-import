var importer = require('./')
var fs = require('fs')

var xml = fs.createReadStream('./smaller.xml')

importer('/tmp/osm-p2p-ex', xml, function (err) {
  console.log('done', err)
})
