import csv from 'fast-csv';

const defaults = {
  headers: true
};

export default {
  createReadStream: options => {
    const csvOptions = Object.assign({}, defaults, options.csv);
    return csv
      .parse(csvOptions)
      .transform(options.transform);
  },
  createWriteStream: options => {
    const csvOptions = Object.assign({}, defaults, options.csv);
    return csv
      .format(csvOptions)
      .transform(options.transform);
  }
};
