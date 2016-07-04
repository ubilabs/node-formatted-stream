import Excel from 'exceljs';
import stream from 'stream';

const writerWorkbookOptions = [
  'creator',
  'lastModifiedBy',
  'created',
  'modified'
];

class XLSXParser extends stream.Transform {
  constructor(options) {
    super({objectMode: true});

    this.workbook = new Excel.Workbook();
    this.stream = this.workbook.xlsx.createInputStream();
    this.ondone = null;
    this.options = options;
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
      keys = [];

    if (!headerRow) {
      return;
    }

    headerRow.eachCell(cell => {
      keys.push(cell.value);
    });

    worksheet.eachRow((row, rowNumber) => {
      let obj = {};

      if (rowNumber === 1) {
        return;
      }

      row.eachCell((cell, colNumber) => {
        if (colNumber > keys.length) {
          return;
        }

        Object.defineProperty(obj, keys[colNumber - 1], { // eslint-disable-line prefer-reflect, max-len
          value: cell.value,
          enumerable: true
        });
      });

      this.push(obj);
    });
  }
}

class XLSXWriter extends stream.Transform {
  constructor(options) {
    super({objectMode: true});

    this.workbook = new Excel.Workbook();
    this.worksheet = this.workbook.addWorksheet(options.sheet || 'Sheet 1');
    this.headerAccessor = options.headerAccessor || (key => key);
    this.rows = [];
    this.columns = [];

    writerWorkbookOptions.forEach(option =>
      this.workbook[option] = options[option]);
  }

  _transform(chunk, encoding, done) {
    Object.keys(chunk).forEach(key => {
      if (!this.columns.find(column => column.key === key)) {
        this.columns.push({
          key,
          header: this.headerAccessor(key)
        });
      }
    });

    this.rows.push(chunk);
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
    new XLSXParser(options.xlsx || {}),
  createWriteStream: options =>
    new XLSXWriter(options.xlsx || {})
};
