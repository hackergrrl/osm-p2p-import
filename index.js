var osm2Obj = require('osm2json')
var collect = require('collect-stream')
var hex2dec = require('./hex2dec.js')
var randomBytes = require('randombytes')
var hyperlog = require('hyperlog')
var lexint = require('lexicographic-integer')
var hash = require('hyperlog/lib/hash')
var messages = require('hyperlog/lib/messages')
var encoder = require('hyperlog/lib/encode')

var ID = '!!id'
var CHANGES = '!changes!'
var NODES = '!nodes!'
var HEADS = '!heads!'
var LOGS = '!logss!'

module.exports = function (osmDir, xmlStream, done) {
  var seq = 0

  var r = xmlStream.pipe(osm2Obj({coerceIds: false}))
  collect(r, function (err, changes) {
    // TODO generate changeset + id
    // ...

    // Convert OSM data into hyperkv batch format
    var byId = {}
    changes.forEach(function (change) {
      byId[change.id] = change
    })
    var kvBatch = changes.map(batchMap)
    // console.log(kvBatch)

    // TODO generate a new hyperlog id + insert

    // Convert into raw leveldb hyperlog format
    var levelBatch = kvBatch.reduce(kvToLevel, [])
    console.log(levelBatch)
  })

  function kvToLevel (batch, kvEntry) {
    // TODO build base node object
    var node = constructInitialNode(kvEntry, {
      log: 'deadbeef'  // TODO log id
    })
    node.key = hash([], node.value)
    node.change = seq // TODO global change #
    node.seq = seq  // TODO global seq #
    seq++
    console.log(node)

    // batch.push({type: 'put', key: CHANGES + lexint.pack(node.change, 'hex'), value: node.key})
    batch.push({type: 'put', key: NODES + node.key, value: messages.Node.encode(node)})
    // batch.push({type: 'put', key: HEADS + node.key, value: node.key})
    // batch.push({type: 'put', key: dag.logs.key(node.log, node.seq), value: messages.Entry.encode(log)})

    return batch
  }
}

var SKIP_PROPS = ['action', 'id', 'version', 'ifUnused', 'old_id']

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

  var key = hex2dec(randomBytes(8).toString('hex'))

  return {
    k: key,
    v: op.value
  }
}

function constructInitialNode (doc, opts) {
  var links = []
  if (!Array.isArray(links)) links = [links]
  links = links.map(toKey)

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


// {\"k\":\"2930144206448845073\",\"v\":{\"type\":\"node\",\"lon\":-75.31402823300216,\"lat\":-0.48280370256946364,\"changeset\":\"3229550849285059436\"}}"}

