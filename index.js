var osm2Obj = require('osm2json')
var through = require('through2')

module.exports = function (osm, xml, opts, cb) {
  if (opts && !cb && typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  var t = through.obj(write)
  var r = xml
    .pipe(osm2Obj({coerceIds: false}))
    .pipe(t)

  t.once('finish', cb)
  
  var ids = {}

  function replaceIds (elm) {
    if (elm.nodes) {
      elm.refs = elm.nodes.map(function (id) {
        return ids[id]
      })
        .filter(function (id) {
          return !!id
        })
      delete elm.nodes
    }

    if (elm.members) {
      elm.members = elm.members.map(function (member) {
        if (!ids[member.ref]) member.ref = ids[member.ref]
        return member
      })
        .filter(function (member) {
          return !!member.ref
        })
    }

    return elm
  }

	function write (change, enc, next) {
    change = replaceIds(change)
    var cid = change.id
    delete change.id
    // console.log('elm', change)
    osm.create(change, function (err, id, node) {
      ids[cid] = id
      // console.log('wrote', node.key)
      if (err) throw err
      next()
    })
  }
}
