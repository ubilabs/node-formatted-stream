import csv from 'fast-csv';

const defaults = {
  headers: true
};

export default {
  createReadStream: options => {
    const csvOptions = Object.assign({}, defaults, options.csv),
      stream = csv.parse(csvOptions);

    return options.transform ? stream.transform(options.transform) : stream;
  },
  createWriteStream: options => {
    const csvOptions = Object.assign({}, defaults, options.csv),
      stream = csv.format(csvOptions);

    return options.transform ? stream.transform(options.transform) : stream;
  }
};
