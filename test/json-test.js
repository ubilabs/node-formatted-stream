/* eslint-disable max-nested-callbacks */
import {expect} from 'chai';
import stream from 'stream';
import json from '../src/components/json';

describe('The JSON component', () => {
  it('should export a `createReadStream` function', () => {
    expect(json.createReadStream).to.be.a('function');
  });

  it('should export a `createWriteStream` function', () => {
    expect(json.createWriteStream).to.be.a('function');
  });

  describe('.createReadStream', () => {
    it('should return a transform stream', () => {
      expect(json.createReadStream({})).to.be.instanceof(stream.Transform);
    });

    it('should push objects when lines are written', done => {
      const jsonStream = json.createReadStream({}),
        expectedResult = {key1: 'value1', key2: 'value2'};

      jsonStream.on('data', data => expect(data).to.deep.equal(expectedResult));
      jsonStream.on('end', done);

      jsonStream.write('[{"key1": "value1", "key2": "value2"}]');
      jsonStream.end();
    });
  });

  describe('.createWriteStream', () => {
    it('should return a transform stream', () => {
      expect(json.createWriteStream({})).to.be.instanceof(stream.Transform);
    });

    it('should push lines when objects are written', done => {
      const jsonStream = json.createWriteStream({}),
        object = {key1: 'value1', key2: 'value2'};

      let resultBuffer = '';

      jsonStream.on('data', data => resultBuffer += data);
      jsonStream.on('end', () => {
        expect(JSON.parse(resultBuffer)).to.deep.equal([object]);
        done();
      });

      jsonStream.write(object);
      jsonStream.end();
    });
  });
});
