/* eslint-disable no-underscore-dangle */
import Excel from 'exceljs';
import stream from 'stream';

const writerWorkbookOptions = [
  'creator',
  'lastModifiedBy',
  'created',
  'modified'
];

class XLSXParser extends stream.Transform {
  /**
   * Creates an XLSXParser instance.
   * A transform stream which turns XLSX file lines into objects
   * @param {Object} options XLSXParser options
   * @param {Function} transform an Optional transformation function which will
                                 be applied to each row before it is pushed
   **/
  constructor(options, transform) {
    super({objectMode: true});

    this.workbook = new Excel.Workbook();
    this.stream = this.workbook.xlsx.createInputStream();
    this.ondone = null;
    this.options = options;
    this.transformRow = transform;
  }

  /**
   * Automatically called by stream.Transform for every line in the input file
   * Simply passed through to the XLSX workbook
   * @param {?} chunk Data pushed to the stream
   * @param {string} encoding Encoding of `chunk`, if `chunk` is a string
   * @param {Function} done Callback function
   **/
  _transform(chunk, encoding, done) {
    this.stream.write(chunk, encoding, done);
  }

  /**
   * Automatically called by stream.Transform when
   * the stream's `end()` function is called.
   * Signals 'end of stream' to the XLSX parser
   * and then processes the XLSX workbook.
   * @param {Function} done Callback function
   **/
  _flush(done) {
    this.stream.on('done', () => {
      if (this.options.sheet) {
        const worksheetName = this.options.sheet,
          worksheet = this.workbook.getWorksheet(worksheetName);

        this._pushWorksheet(worksheet, worksheetName);
      } else {
        this.workbook.eachSheet(sheet => this._pushWorksheet(sheet));
      }
      done();
    });

    this.stream.end();
  }

  /**
   * Push an `exceljs` workbook to this stream
   * @param {Object} worksheet ExcelJS worksheet
   * @param {string} worksheetName The name of the worksheet
   **/
  _pushWorksheet(worksheet, worksheetName = '') {
    if (!worksheet) {
      const error = new Error(`Worksheet ${worksheetName} not in XLSX file`);
      this.emit('error', error);
      return;
    }

    const headerRow = worksheet.getRow(1),
      headers = [];

    if (!headerRow) {
      // worksheet is empty
      return;
    }

    // collect object keys from header row
    headerRow.eachCell((cell, columnNumber) => {
      headers.push({
        columnNumber,
        key: cell.value
      });
    });

    // transform each row in the workshet into an Object
    worksheet.eachRow((row, rowNumber) => {
      const result = {};

      if (rowNumber === 1) {
        return;
      }

      headers.forEach(column => {
        const cell = row.getCell(column.columnNumber);

        // assign value to result[key], and set `enumerable` to true for the key
        // this is required when the user sets reserved keys
        Object.defineProperty(result, column.key, {
          value: cell.value,
          enumerable: true
        });
      });

      this.push(this.transformRow ? this.transformRow(result) : result);
    });
  }
}

class XLSXWriter extends stream.Transform {
  /**
   * Creates an XLSXWriter instance.
   * A transform stream which turns objects into XLSX file lines.
   * @param {Object} options XLSXWriter options
   * @param {Function} transform an Optional transformation function which will
                                 be applied to each row before it is written
   **/
  constructor(options, transform) {
    super({objectMode: true});

    this.workbook = new Excel.Workbook();
    this.worksheet = this.workbook.addWorksheet(options.sheet);
    this.headerAccessor = options.headerAccessor || (key => key);
    this.rows = [];
    this.columns = [];
    this.transformRow = transform;

    writerWorkbookOptions.forEach(option => {
      this.workbook[option] = options[option];
    });
  }

  /**
   * Automatically called by stream.Transform every time
   * the user writes data into the stream.
   * @param {Object} chunk Data written by the user
   * @param {string} encoding Encoding if chunk is a string, never used here
   * @param {Function} done Callback function
   **/
  _transform(chunk, encoding, done) {
    const row = {};

    if (this.transformRow) {
      chunk = this.transformRow(chunk);
    }

    Object.keys(chunk).forEach(key => {
      if (!this.columns.find(column => column.key === key)) {
        this.columns.push({
          key,
          header: this.headerAccessor(key)
        });
      }

      // exceljs can not handle objects as value,
      // so we have to stringify each value (or set to empty string if `null`)
      row[key] = chunk[key] === null ? '' : chunk[key].toString();
    });

    this.rows.push(row);
    done();
  }

  /**
   * Push the XLSX data once we received all rows.
   * Automatically called by stream.Transform after stream.end() was called.
   * @param {Function} done Callback function
   **/
  _flush(done) {
    const outStream = new stream.PassThrough();
    outStream.on('data', data => this.push(data));
    outStream.on('end', done);

    this.worksheet.columns = this.columns;
    this.worksheet.addRows(this.rows);
    this.workbook.xlsx.write(outStream);
  }
}

export default {
  /**
   * Creates a transform stream which parses XLSX files into objects.
   * @param {Object} options Options for the XLSX parser.
   * @returns {Object} A transform stream parsing XLSX files into objects.
   **/
  createReadStream: options =>
    new XLSXParser(options.xlsx || {}, options.transform),
  /**
   * Creates a transform stream which parsers objects into XLSX files.
   * @param {Object} options Options for the XLSX writer.
   * @returns {Object} A transform stream parsing objects into XLSX files.
   **/
  createWriteStream: options => {
    const xlsxOptions = Object.assign({sheet: 'Sheet 1'}, options.xlsx);
    return new XLSXWriter(xlsxOptions, options.transform);
  }
};
