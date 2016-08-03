/* eslint-disable no-unused-expressions, max-nested-callbacks */
import {expect} from 'chai';
import {default as index} from '../src/index.js';

describe('index', () => {
  it('should export a `guessFormat` function', () => {
    expect(index.guessFormat).to.be.a('function');
  });

  it('should export a `getKnownFormats` function', () => {
    expect(index.getKnownFormats).to.be.a('function');
  });

  it('should export a `from` function', () => {
    expect(index.from).to.be.a('function');
  });

  it('should export a `to` function', () => {
    expect(index.to).to.be.be.a('function');
  });

  describe('.guessFormat', () => {
    it('should return \'csv\' for csv files', () => {
      const format = index.guessFormat('/home/data/myfile.csv');
      expect(format).to.equal('csv');
    });

    it('should return \'xlsx\' for xlsx files', () => {
      const format = index.guessFormat('myfile.xlsx');
      expect(format).to.equal('xlsx');
    });

    it('should return \'json\' for json files', () => {
      const format = index.guessFormat('./data.json');
      expect(format).to.equal('json');
    });
  });

  describe('.getKnownFormats', () => {
    it('should list \'csv\', \'xlsx\', and \'json\'', () => {
      const knownFormats = index.getKnownFormats(),
        expectedKnownFormats = [
          'csv',
          'xlsx',
          'json'
        ];

      expectedKnownFormats.forEach(format => {
        expect(knownFormats.includes(format)).to.be.true;
      });
    });
  });

  describe('.from', () => {
    it('should throw an exception when passing an unknown format', () => {
      expect(() => {
        const stream = // eslint-disable-line no-unused-vars
          index.from('some invalid format');
      }).to.throw('Unsupported format: some invalid format');
    });
  });

  describe('.to', () => {
    it('should throw an exception when passing an unknown format', () => {
      expect(() => {
        const stream = // eslint-disable-line no-unused-vars
          index.to('some invalid format');
      }).to.throw('Unsupported format: some invalid format');
    });
  });
});
