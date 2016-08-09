import Excel from 'exceljs';
import stream from 'stream';

const writerWorkbookOptions = [
  'creator',
  'lastModifiedBy',
  'created',
  'modified'
];

class XLSXParser extends stream.Transform {
  constructor(options, transform) {
    super({objectMode: true});

    this.workbook = new Excel.Workbook();
    this.stream = this.workbook.xlsx.createInputStream();
    this.ondone = null;
    this.options = options;
    this.transform = transform;
  }

  _transform(chunk, encoding, done) {
    this.stream.write(chunk, encoding, done);
  }

  _flush(done) {
    this.stream.on('done', () => {
      if (this.options.sheet) {
        this.pushWorksheet(this.workbook.getWorksheet(this.options.sheet));
      } else {
        this.workbook.eachSheet(sheet => this.pushWorksheet(sheet));
      }
      done();
    });
    this.stream.end();
  }

  pushWorksheet(worksheet) {
    if (!worksheet) {
      return;
    }

    const headerRow = worksheet.getRow(1),
      headers = [];

    if (!headerRow) {
      return;
    }

    headerRow.eachCell((cell, colNum) => {
      headers.push({
        colNum,
        key: cell.value
      });
    });

    worksheet.eachRow((row, rowNumber) => {
      const obj = {};

      if (rowNumber === 1) {
        return;
      }

      headers.forEach(column => {
        const cell = row.getCell(column.colNum);

        Object.defineProperty(obj, column.key, { // eslint-disable-line prefer-reflect, max-len
          value: cell.value,
          enumerable: true
        });
      });

      this.push(this.transform ? this.transform(obj) : obj);
    });
  }
}

class XLSXWriter extends stream.Transform {
  constructor(options, transform) {
    super({objectMode: true});

    this.workbook = new Excel.Workbook();
    this.worksheet = this.workbook.addWorksheet(options.sheet);
    this.headerAccessor = options.headerAccessor || (key => key);
    this.rows = [];
    this.columns = [];
    this.transform = transform;

    writerWorkbookOptions.forEach(option => {
      this.workbook[option] = options[option];
    });
  }

  _transform(chunk, encoding, done) {
    const object = {};

    if (this.transform) {
      chunk = this.transform(chunk);
    }

    Object.keys(chunk).forEach(key => {
      if (!this.columns.find(column => column.key === key)) {
        this.columns.push({
          key,
          header: this.headerAccessor(key)
        });
      }

      // exceljs cannot handle objects
      object[key] = chunk[key] === null ? '' : chunk[key].toString();
    });

    this.rows.push(object);
    done();
  }

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
  createReadStream: options =>
    new XLSXParser(options.xlsx || {}, options.transform),
  createWriteStream: options => {
    const defaults = {sheet: 'Sheet 1'};
    return new XLSXWriter(Object.assign(defaults, options), options.transform);
  }
};
