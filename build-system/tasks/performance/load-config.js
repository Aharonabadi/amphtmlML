const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');

const PATH = './config.json';

/**
 * Loads test config from ./config.json
 * @return {{
 *  concurrency:number,
 *  headless:boolean,
 *  runs:number,
 *  handlers:Array<Object>,
 *  urlToHandlers:Object,
 *  adsUrls?:Array<string>
 * }}
 */
function loadConfig() {
  const file = fs.readFileSync(path.join(__dirname, PATH));
  const config = JSON.parse(file.toString());
  // Create mapping of url to handlers for ease of use later
  config.urlToHandlers = config.handlers.reduce((mapping, handlerOptions) => {
    if (argv.url && handlerOptions.handlerName === 'defaultHandler') {
      handlerOptions.urls = [argv.url];
    }
    handlerOptions.urls.forEach((url) => {
      if (mapping[url]) {
        throw new Error(`All urls must be unique: ${url}.`);
      }
      mapping[url] = handlerOptions;
    });
    return mapping;
  }, {});
  if (Object.keys(config.urlToHandlers).length < 1) {
    throw new Error('No URLs found in config.');
  }
  config.headless = !!argv.headless;
  config.devtools = !!argv.devtools;

  maybeExtractAdsUrls(config);
  return config;
}

/**
 * If adsHandler is in use, add the array as top level key to be used for
 * easy access to files for caching.
 * @param {!Object} config
 */
function maybeExtractAdsUrls(config) {
  if (!config || !config.handlers) {
    return;
  }
  for (const handler of config.handlers) {
    if (handler.handlerName === 'adsHandler' && handler.adsUrls) {
      config['adsUrls'] = handler.adsUrls;
    }
  }
}

module.exports = loadConfig;
