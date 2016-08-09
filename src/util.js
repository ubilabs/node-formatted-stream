/* eslint-disable no-underscore-dangle */
import stream from 'stream';

const _mapFunction = new WeakMap(),
  _inputStream = new WeakMap();

/**
 * Array.map for streams.
 **/
export class StreamMap extends stream.Transform {
  /**
   * Create an instance of the StreamMap class.
   * @param {Function} mapFunction Map function which will be applied
   *                               to each item in the stream
   * @param {Object} inputStream The stream on which the mapFunction will
   *                             be applied to
   **/
  constructor(mapFunction, inputStream) {
    super({objectMode: true});
    _mapFunction.set(this, mapFunction);
    _inputStream.set(this, inputStream);

    inputStream.on('data', data => this.push(data));
  }

  /**
   * Automatically called by stream.Transform for
   * every item written to this stream.
   * Applies the map function and pushes the result.
   * @param {Object} data Data written to the stream
   * @param {string} encoding Encoding, if data is a String
   * @param {Function} done Callback function
   **/
  _transform(data, encoding, done) {
    const mapFunction = _mapFunction.get(this),
      inputStream = _inputStream.get(this);

    inputStream.write(mapFunction ? mapFunction(data) : data);
    done();
  }

  /**
   * Automatically called by stream.Transform when no more items will be
   * written to this stream.
   * Simply passed on to the inputStream.
   * @param {Function} done Callback function
   **/
  _flush(done) {
    const inputStream = _inputStream.get(this);
    inputStream.on('end', done);
    inputStream.end();
  }
}
