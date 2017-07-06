var osm2Obj = require('osm2json')
var collect = require('collect-stream')
var hex2dec = require('./lib/hex2dec.js')
var randomBytes = require('randombytes')
var hyperlog = require('hyperlog')
var lexint = require('lexicographic-integer')
var hash = require('hyperlog/lib/hash')
var messages = require('hyperlog/lib/messages')
var encoder = require('hyperlog/lib/encode')
var cuid = require('cuid')
var path = require('path')
var through = require('through2')
var eos = require('end-of-stream')

var ID = '!!id'
var CHANGES = '!changes!'
var NODES = '!nodes!'
var HEADS = '!heads!'
var LOGS = '!logs!'

module.exports = function (osmDir, xmlStream, done) {
  var level = require('level')
  var db = level(path.join(osmDir, 'log'))
  importToLevel(db, xmlStream, done)
}

module.exports.toLevel = importToLevel

function importToLevel (db, xmlStream, done) {
  var seq = 1

  var id = cuid()
  var batch = []
  var idToP2pId = {}

  var pending = []

  var t = through.obj(write, flush)
  var r = xmlStream
    .pipe(osm2Obj({coerceIds: false}))
    .pipe(t)

  t.on('finish', function () {
    done()
  })

  // insert new hyperlog id + insert
  batch.push({type: 'put', key: ID, value: id})

	function write (change, enc, next) {
    if (change.type !== 'node' && change.type !== 'way' && change.type !== 'relation') return next()

    idToP2pId[change.id] = hex2dec(randomBytes(8).toString('hex'))
    if (!isSatisfiable(change)) {
      pending.push(change)
      return next()
    }

    writeChange(change)
    next()
  }

  function flush (fin) {
    pending.forEach(writeChange)

    db.batch(batch, function (err) {
      if (err) return fin(err)
      db.close(fin)
    })
  }

  function writeChange (change) {
    var kv = batchMap(change)

    // Convert into raw leveldb hyperlog format
    kvToLevel(batch, kv)
  }

  function kvToLevel (batch, kvEntry) {
    // TODO build base node object
    var node = constructInitialNode(kvEntry, {
      log: id
    })
    node.key = hash([], node.value)
    node.change = seq // TODO global change #
    node.seq = seq  // TODO global seq #
    seq++

    var entry = {
      change: node.change,
      node: node.key,
      links: '',
      log: id,
      seq: node.seq
    }

    batch.push({type: 'put', key: CHANGES + lexint.pack(node.change, 'hex'), value: node.key})
    batch.push({type: 'put', key: NODES + node.key, value: messages.Node.encode(node)})
    batch.push({type: 'put', key: HEADS + node.key, value: node.key})
    batch.push({type: 'put', key: LOGS + id + '!' + lexint.pack(node.seq, 'hex'), value: messages.Entry.encode(entry)})

    return batch
  }

  function isSatisfiable (change) {
    var res = true

    ;(change.nodes || []).forEach(function (id, idx) {
      if (!idToP2pId[id]) res = false
    })
    ;(change.members || []).forEach(function (ref, idx) {
      if (!idToP2pId[ref.ref]) res = false
    })

    return res
  }

  /**
  * Turn a changeset operation into a osm-p2p-db batch operation
  */
  function batchMap (change) {
    var op = {
      type: change.action === 'delete' ? 'del' : 'put',
      key: change.id,
      value: {}
    }
    if (change.action !== 'create' && change.version) {
      op.links = change.version.split(/\s*,\s*/).filter(Boolean)
    }
    Object.keys(change).forEach(function (prop) {
      if (SKIP_PROPS.indexOf(prop) > -1) return
      op.value[prop === 'nodes' ? 'refs' : prop] = change[prop]
    })
    op.value.timestamp = new Date().toISOString()

    var key = idToP2pId[change.id]

    ;(change.nodes || []).forEach(function (id, idx) {
      op.value.refs[idx] = idToP2pId[id]
      // console.log('fixed ref mapping', id, 'to', op.value.refs[idx])
    })
    ;(change.members || []).forEach(function (ref, idx) {
      ref.ref = idToP2pId[ref.ref]
      op.value.members[idx] = ref
      // console.log('fixed member mapping', ref.ref, 'to', op.value.members[idx])
    })

    // filter out nulls
    if (op.value.refs) op.value.refs = op.value.refs.filter(function (id) { return !!id })
    if (op.value.members) op.value.members = op.value.members.filter(function (ref) { return !!ref.ref })

    return {
      k: key,
      v: op.value
    }
  }
}

var SKIP_PROPS = ['action', 'id', 'version', 'ifUnused', 'old_id']


function constructInitialNode (doc, opts) {
  var links = []
  if (!Array.isArray(links)) links = [links]
  links = links.map(toKey)

  // console.log(JSON.stringify(doc))

  var encodedValue = encoder.encode(doc, opts.valueEncoding || 'json')
  return {
    log: opts.log || self.id,
    key: null,
    identity: null,
    signature: null,
    value: encodedValue,
    links: links
  }
}

// Consumes either a string or a hyperlog node and returns its key.
var toKey = function (link) {
  return typeof link !== 'string' ? link.key : link
}
