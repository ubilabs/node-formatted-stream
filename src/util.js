/* eslint-disable no-underscore-dangle */
import stream from 'stream';

const _mapFunction = new WeakMap(),
  _streamObject = new WeakMap();

export class StreamMap extends stream.Transform {
  constructor(mapFunction, streamObject) {
    super({objectMode: true});
    _mapFunction.set(this, mapFunction);
    _streamObject.set(this, streamObject);

    streamObject.on('data', data => this.push(data));
  }

  _transform(data, encoding, done) {
    const mapFunction = _mapFunction.get(this),
      streamObject = _streamObject.get(this);

    streamObject.write(mapFunction ? mapFunction(data) : data);
    done();
  }

  _flush(done) {
    const streamObject = _streamObject.get(this);
    streamObject.on('end', done);
    streamObject.end();
  }
}
