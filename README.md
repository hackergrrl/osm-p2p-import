# osm-p2p-db-importer

> Node.JS module *and* command line utility for importing OSM XML into an
> [osm-p2p-db](https://github.com/digidem/osm-p2p-db).

## Usage

```js
var importer = require('osm-p2p-import')
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
indexes generated
```

## API

```js
var importer = require('osm-p2p-import')
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
```


## XML Formatting

Anything that would be an acceptable upload to OSM v0.6's `POST
/api/0.6/changeset/:id/upload` should work here.

## Install

With [npm](https://npmjs.org/) installed, run

### Module
```
$ npm install osm-p2p-db-importer
```

### Command Line Utility
```
$ npm install --global osm-p2p-db-importer
```

## License

ISC
