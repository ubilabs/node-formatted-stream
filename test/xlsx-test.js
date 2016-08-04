import {expect} from 'chai';
import stream from 'stream';
import xlsx from '../src/components/xlsx';

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
  });

  describe('.createWriteStream', () => {
    it('should return a transform stream', () => {
      expect(xlsx.createWriteStream({})).to.be.instanceof(stream.Transform);
    });
  });
});
