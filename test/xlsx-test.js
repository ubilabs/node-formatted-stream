/* eslint-disable max-nested-callbacks */
import {expect} from 'chai';
import stream from 'stream';
import xlsx from '../src/components/xlsx';
import fs from 'fs';
import path from 'path';

describe('The XLSX component', () => {
  it('should export a `createReadStream` function', () => {
    expect(xlsx.createReadStream).to.be.a('function');
  });

  it('should export a `createWriteStream` function', () => {
    expect(xlsx.createWriteStream).to.be.a('function');
  });

  describe('.createReadStream', () => {
    it('should return a transform stream', () => {
      expect(xlsx.createReadStream({})).to.be.instanceof(stream.Transform);
    });

    it('should push objects when lines are written', done => {
      const xlsxStream = xlsx.createReadStream({}),
        expectedResult = {key1: 'value1', key2: 'value2'},
        testFilePath = path.join(__dirname, 'misc/testobject.xlsx');

      xlsxStream.on('data', data => expect(data).to.deep.equal(expectedResult));
      xlsxStream.on('end', done);
      fs.createReadStream(testFilePath).pipe(xlsxStream);
    });

    it('should transform objects if `options.transform` is set', done => {
      const expectedResult = {newkey: 'newvalue'},
        xlsxStream = xlsx.createReadStream({
          transform: () => expectedResult
        }),
        testFilePath = path.join(__dirname, 'misc/testobject.xlsx');

      xlsxStream.on('data', data => expect(data).to.deep.equal(expectedResult));
      xlsxStream.on('end', done);
      fs.createReadStream(testFilePath).pipe(xlsxStream);
    });
  });

  describe('.createWriteStream', () => {
    it('should return a transform stream', () => {
      expect(xlsx.createWriteStream({})).to.be.instanceof(stream.Transform);
    });

    it('should push lines when objects are written', done => {
      const xlsxStream = xlsx.createWriteStream({}),
        xlsxReadStream = xlsx.createReadStream({}),
        object = {key1: 'value1', key2: 'value2'};

      xlsxReadStream.on('end', done);
      xlsxReadStream.on('data', data => expect(data).to.deep.equal(object));

      xlsxStream.pipe(xlsxReadStream);
      xlsxStream.write(object);
      xlsxStream.end();
    });

    it('should transform lines if `options.transform` is set', done => {
      const expectedResult = {newkey: 'newvalue'},
        xlsxStream = xlsx.createWriteStream({
          transform: () => expectedResult
        }),
        xlsxReadStream = xlsx.createReadStream({}),
        object = {key1: 'value1', key2: 'value2'};

      xlsxReadStream.on('end', done);
      xlsxReadStream.on('data', data =>
        expect(data).to.deep.equal(expectedResult));

      xlsxStream.pipe(xlsxReadStream);
      xlsxStream.write(object);
      xlsxStream.end();
    });
  });
});
