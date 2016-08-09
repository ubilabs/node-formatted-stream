import JSONStream from 'JSONStream';
import {StreamMap} from '../util';

export default {
  /**
   * Creates a transform stream which parses JSON files into objects.
   * @param {Object} options Options for the JSON parser.
   * @returns {Object} A transform stream parsing JSON files into objects.
   **/
  createReadStream: options => {
    const jsonOptions = Object.assign({path: [true]}, options.json),
      jsonStream = JSONStream.parse(jsonOptions.path);
    return new StreamMap(options.transform, jsonStream);
  },
  /**
   * Creates a transform stream which parsers objects into JSON files.
   * @param {Object} options Options for the JSON writer.
   * @returns {Object} A transform stream parsing objects into JSON files.
   **/
  createWriteStream: options => {
    const json = options.json || {},
      jsonStream = JSONStream.stringify(
        json.open,
        json.sep,
        json.close
      );

    return new StreamMap(options.transform, jsonStream);
  }
};
