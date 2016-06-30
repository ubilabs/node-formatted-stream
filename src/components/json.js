import JSONStream from 'JSONStream';
import es from 'event-stream';

export default {
  createReadStream: options =>
    JSONStream.parse(options.json || [true], options.transform),
  createWriteStream: options => {
    const json = options.json || {};
    return es.mapSync(options.transform)
      .pipe(JSONStream.stringify(
        json.open,
        json.sep,
        json.close
      ));
  }
};
