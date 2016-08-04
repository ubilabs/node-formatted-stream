/* eslint-disable max-nested-callbacks */
import {expect} from 'chai';
import stream from 'stream';
import csv from '../src/components/csv';

describe('The CSV component', () => {
  it('should export a `createReadStream` function', () => {
    expect(csv.createReadStream).to.be.a('function');
  });

  it('should export a `createWriteStream` function', () => {
    expect(csv.createWriteStream).to.be.a('function');
  });

  describe('.createReadStream', () => {
    it('should return a transform stream', () => {
      expect(csv.createReadStream({})).to.be.instanceof(stream.Transform);
    });

    it('should push objects when lines are written', done => {
      const csvStream = csv.createReadStream({}),
        expectedResult = {key1: 'value1', key2: 'value2'};

      csvStream.on('data', data => expect(data).to.deep.equal(expectedResult));
      csvStream.on('end', done);

      csvStream.write('key1,key2');
      csvStream.write('value1,value2');
      csvStream.write('value1,value2');
      csvStream.end();
    });
  });

  describe('.createWriteStream', () => {
    it('should return a transform stream', () => {
      expect(csv.createWriteStream({})).to.be.instanceof(stream.Transform);
    });

    it('should write a header when objects are written', done => {
      const csvStream = csv.createWriteStream({}),
        object = {key1: 'value1', key2: 'value2'};

      let counter = 0;

      csvStream.on('end', done);
      csvStream.on('data', data => {
        if (counter === 0) {
          expect(data.toString()).to.equal('key1,key2');
        }

        counter++;
      });

      csvStream.write(object);
      csvStream.end();
    });

    it('should write lines when objects are written', done => {
      const csvStream = csv.createWriteStream({}),
        object = {key1: 'value1', key2: 'value2'};

      let counter = 0;

      csvStream.on('end', done);
      csvStream.on('data', data => {
        if (counter > 0) {
          expect(data.toString()).to.equal('\nvalue1,value2');
        }

        counter++;
      });

      csvStream.write(object);
      csvStream.write(object);
      csvStream.end();
    });
  });
});
