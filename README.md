# node-formatted-stream

A universal wrapper around file format parsers.  
Currently supports in- and output in CSV and JSON format.

## Usage

Install formatted-stream:

```sh
npm install formatted-stream --save
```

Include and use in your code:

#### ES5

```js
const fs = require('fs'),
  formattedStream = require('formatted-stream').default,
  parser = formattedStream.from('json'),
  writer = formattedStream.to('csv');

parser.pipe(writer);
writer.pipe(fs.createWriteStream('out.csv'));
fs.createReadStream('in.json').pipe(parser);
```

#### ES6

```js
import fs from 'fs';
import formattedStream from 'formatted-stream';

const parser = formattedStream.from('json'),
  writer = formattedStream.to('csv');

parser.pipe(writer);
writer.pipe(fs.createWriteStream('out.csv'));
fs.createReadStream('in.json').pipe(parser);
```

## API Documentation

### .from(format, options)

```js
const parser = formattedStream.from('csv', {
  transform: function(data) { return data; },
  csv: {headers: false},
  json: [true]
});
```

#### transform

Type `Function`. A transformation function which is applied to each object before `.on('data')` is triggered.  
Default is `function(data) { return data; }`.

#### csv

Type `Object`. An options object which will be passed to the CSV parser. See [fast-csv](https://www.npmjs.com/package/fast-csv) for more information.  
Default is `{}`.

#### json

Type `Array`. An options array which will be passed to the JSON parser. See [JSONStream](https://www.npmjs.com/package/JSONStream) for more information.  
Default is `[]`.

### .to(format, options)

```js
const writer = formattedStream.to('json', {
  transform: function(data) { return data; },
  csv: {headers: false},
  json: {
    open: '[\n',
    sep: '\n,\n',
    close: '\n]\n'
  }
});
```

#### transform

Type `Function`. A transformation function which is applied to each object before `.on('data')` is triggered.  
Default is `function(data) { return data; }`.

#### csv

Type `Object`. An options object which will be passed to the CSV writer. See [fast-csv](https://www.npmjs.com/package/fast-csv) for more information.  
Default is `{}`.

#### json

Type `Object`. An options object which will be passed to the JSON writer. You can set the fields `open`, `sep`, and `close`. See [JSONStream](https://www.npmjs.com/package/JSONStream) for more information.  
Default is `{}`.
