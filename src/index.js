/* eslint-disable no-console */
import path from 'path';

import csv from './components/csv';
import json from './components/json';

const components = {csv, json};

/*
 * Attempt to guess the file format from a file name
 * This function simply checks the file extension
 * against a list of known formats
 * @param {String} filename The name of the file
 * @return {String} The guessed file format or `null`
 **/
function guessFormat(filename) {
  const extension = path.extname(filename).substr(1),
    componentKey = getKnownFormats()
      .find(format => format === extension);

  return componentKey;
}

/*
 * Retrieve a list of known file formats
 * @return {Array} An array containing the file extension of all known formats
 **/
function getKnownFormats() {
  return Object.keys(components);
}

/*
 * Retrieve a parser object which can be piped to and from
 * @param {String} format The file format to be parsed
 * @param {Object} options The options for the parser
 *                         {transform: (data => data),
 *                           csv: {},
 *                           json: {}}
 * @return {Object} A parser which can be piped to and from
 **/
function from(format, options = {}) {
  const component = components[format];
  options.transform = options.transform || (data => data);
  return component.createReadStream(options);
}

/*
 * Retrieve a writer object which can be piped to
 * @param {String} format The output format
 * @param {Object} options The options for the writer
 *                         {transform: (data => data),
 *                           csv: {},
 *                           json: {}}
 **/
function to(format, options = {}) {
  const component = components[format];
  options.transform = options.transform || (data => data);
  return component.createWriteStream(options);
}

export default {guessFormat, getKnownFormats, from, to};
