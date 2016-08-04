import JSONStream from 'JSONStream';
import {StreamMap} from '../util';

export default {
  createReadStream: options => {
    const jsonStream = JSONStream.parse(options.json || [true]);
    return new StreamMap(options.transform, jsonStream);
  },
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
