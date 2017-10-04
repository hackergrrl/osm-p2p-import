# osm-p2p-import

> Node.JS module *and* command line utility for importing OSM XML into an
> [osm-p2p-db](https://github.com/digidem/osm-p2p-db).

## CLI Usage

```
USAGE: osm-p2p-import DBDIR [XMLFILE]

  Import OSM XML into an osm-p2p-db located at DBDIR. XMLFILE is a file
  containing OSM XML. If not specified, OSM XML is read from standard input.
```

## Module Usage

```js
var importer = require('osm-p2p-import')
var OsmP2P = require('osm-p2p')
var fs = require('fs')

var xml = fs.createReadStream('./hawaii.xml')

var osm = OsmP2P('./fun.db')

importer(osm, xml, function (err) {
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

### importer(osm, xmlStream[, opts], done)

- `osm`: osm-p2p-db instance
- `xmlStream`: a readable stream of OSM XML data.
- `opts`: options object. Currently accepts `slow: true|false`.
- `done`: a callback function, receiving an error `err` or `null`.

## XML Formatting

Anything that would be an acceptable upload to OSM v0.6's `POST
/api/0.6/changeset/:id/upload` should work here.

## Install

With [npm](https://npmjs.org/) installed, run

### Module
```
$ npm install osm-p2p-import
```

### Command Line Utility
```
$ npm install --global osm-p2p-import
```

## License

ISC
