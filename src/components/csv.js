import csv from 'fast-csv';

const defaults = {
  headers: true
};

export default {
  /**
   * Creates a transform stream which parses CSV files into objects.
   * @param {Object} options Options for the CSV parser.
   * @returns {Object} A transform stream parsing CSV files into objects.
   **/
  createReadStream: options => {
    const csvOptions = Object.assign({}, defaults, options.csv),
      stream = csv.parse(csvOptions);

    return options.transform ? stream.transform(options.transform) : stream;
  },
  /**
   * Creates a transform stream which parsers objects into CSV files.
   * @param {Object} options Options for the CSV writer.
   * @returns {Object} A transform stream parsing objects into CSV files.
   **/
  createWriteStream: options => {
    const csvOptions = Object.assign({}, defaults, options.csv),
      stream = csv.format(csvOptions);

    return options.transform ? stream.transform(options.transform) : stream;
  }
};
