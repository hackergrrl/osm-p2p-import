# osm-p2p-db-importer

> Fast imports from OSM XML into a fresh [osm-p2p-db](https://github.com/digidem/osm-p2p-db)

This is useful if you have a very large OSM dataset that would otherwise be too
slow to insert directly into `osm-p2p-db`.

## How much faster?

`smaller.xml`: 1.4mb
- osm-p2p-server: 10.5s
- osm-p2p-db-importer: 7.3s

`6.xml`: 18mb
- osm-p2p-server: 720+ seconds (stopped recording)
- osm-p2p-db-importer: 73.3s

## How does it work?

A fresh import is a special case that lets us make a key assumption:

1. No historic data (no data in the import is an earlier revision of other data)

There is a *lot* of cost in ensuring consistency across the layers of
`osm-p2p-*`, which can be potentially skipped if we know we don't need to worry
about inconsistent data coming in.

This module skips multiple layers, accepting OSM XML data and generating LevelDB
batch operations directly, without the `osm-p2p-db`, `hyperkv`, and `hyperlog`
layers of processing in between. This isn't very stable in the long-term (since
the things under the blankets of these modules may change), but for now it makes
for some very quick data insertions into a fresh DB.

## Usage

```js
var importer = require('osm-p2p-db-importer')
var fs = require('fs')

var xml = fs.createReadStream('./hawaii.xml')

var dbPath = '/tmp/osm-p2p-ex'

importer(dbPath, xml, function (err) {
  console.log(err ? err : 'import done!')

  // OPTIONAL: wait for indexes to be generated
  var osmdb = require('osm-p2p')
  var osm = osmdb(dbPath)
  osm.ready(function () {
    console.log('indexes generated')
  })
})
```

outputs

```
done!
```

## API

```js
var importer = require('osm-p2p-db-importer')
```

### importer(osmDir, xmlStream, opts, done)

- `osmDir`: path to a directory where the `osm-p2p-db` will be located.
- `xmlStream`: a readable stream of OSM XML data.
- `opts`: options object. Currently accepts `slow: true|false`.
- `done`: a callback function, receiving an error `err` or `null`.

### importer.toLevel(db, xmlStream, done)

Like the above, except operating on a user-specified LevelUP instance, `db`.
This is useful if you aren't using a filesystem-backed LevelDOWN as your
back-end.

## CLI Usage

```
USAGE: osm-p2p-db-importer [--slow] DBDIR [XMLFILE]

  Import OSM XML into an osm-p2p-db located at DBDIR. XMLFILE is a file
  containing OSM XML. If not specified, OSM XML is read from standard input.

  --slow, -s: skip fragile optimizations; import using the normal osm-p2p-db
              process.
```


## XML Formatting

Anything that would be an acceptable upload to OSM v0.6's `POST
/api/0.6/changeset/:id/upload` should work here.

## Caveat: Changeset ID

Note that this module doesn't create a changeset for you. You will need to
create one first, an ensure your XML has that changeset set.

## Install

With [npm](https://npmjs.org/) installed, run

### As a Library
```
$ npm install osm-p2p-db-importer
```

### As a Command Line Utility
```
$ npm install --global osm-p2p-db-importer
```

## License

ISC

