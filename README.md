# osm-p2p-db-importer

> Fast imports from OSM XML into a fresh [osm-p2p-db](https://github.com/digidem/osm-p2p-db)

This is useful if you have a very large OSM dataset that would otherwise be too
slow to insert directly into `osm-p2p-db`.

## Usage

```js
var importer = require('osm-p2p-db-importer')
var fs = require('fs')

var xml = fs.createReadStream('./hawaii.xml')

importer('/tmp/osm-p2p-ex', xml, function (err) {
  console.log(err ? err : 'done!')
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

### importer(osmDir, xmlStream, done)

- `osmDir`: path to a directory where the `osm-p2p-db` will be located.
- `xmlStream`: a readable stream of OSM XML data.
- `done`: a callback function, receiving an error `err` or `null`.

## XML Formatting

Anything that would be an acceptable upload to OSM v0.6's `POST
/api/0.6/changeset/:id/upload` should work here.

## Caveat: Changeset ID

Note that this module doesn't create a changeset for you. You will need to
create one first, an ensure your XML has that changeset set.

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install osm-p2p-db-importer
```

## License

ISC

