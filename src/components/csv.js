import csv from 'fast-csv';

const defaults = {
  headers: true
};

export default {
  createReadStream: options => {
    const csvOptions = Object.assign({}, options.csv, defaults);
    return csv
      .parse(csvOptions)
      .transform(options.transform);
  },
  createWriteStream: options => {
    const csvOptions = Object.assign({}, options.csv, defaults);
    return csv
      .createWriteStream(csvOptions)
      .transform(options.transform);
  }
};
