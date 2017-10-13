var osm2Obj = require('osm2json')
var through = require('through2')

module.exports = function (osm, xml, opts, cb) {
  if (opts && !cb && typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  var pending = []

  var t = through.obj(write, flush)
  var r = xml
    .pipe(osm2Obj({coerceIds: false}))
    .pipe(t)

  t.once('finish', cb)
  
  var ids = {}

  function hasDanglingRefs (elm) {
    if (elm.type === 'way') {
      return elm.nodes.filter(danglingNodeRef).length === 0
      function danglingNodeRef (ref) {
        return !!ids[ref]
      }
    }
    else if (elm.type === 'relation') {
      return elm.members.filter(danglingMemberRef).length === 0
      function danglingMemberRef (member) {
        return !!ids[member.ref]
      }
    }
    else return false
  }

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
    if (hasDanglingRefs(change)) {
      pending.push(change)
      return next()
    }

    processChange(change, next)
  }

  function flush (cb) {
    next(null)
    function next (err) {
      if (err) return cb(err)
      if (pending.length === 0) return cb()
      var change = pending.shift()
      processChange(change, next)
    }
  }

  function processChange (change, cb) {
    change = replaceIds(change)
    var cid = change.id
    delete change.id
    osm.create(change, function (err, id, node) {
      ids[cid] = id
      if (err) throw err
      cb()
    })
  }
}
