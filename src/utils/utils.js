import _ from 'lodash';

/**
 * Check if current script is running in browser or not
 * @returns {boolean}
 */
export const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const loadPromises = {};

/**
 * Load stylesheet
 * @param path
 * @returns {Promise}
 */
export const loadStyle = (path) => {
  const pathHash = generateStringHash(path, 'CSS');

  if (loadPromises[pathHash]) return loadPromises[pathHash];

  loadPromises[pathHash] = new Promise((resolve, reject) => {
    if (!isBrowser()) {
      reject('Cannot call from server. Function can be executed only from browser');
    }


    // Do not load css if already loaded
    const previousLink = document.getElementById(pathHash.toString());
    if (previousLink) {
      resolve();
      return previousLink;
    }

    const head = document.getElementsByTagName('head')[0];
    // reference to document.head for appending/ removing link nodes

    const link = document.createElement('link'); // create the link node

    link.setAttribute('href', path);
    link.setAttribute('id', pathHash.toString());
    link.setAttribute('rel', 'stylesheet');
    link.async = true;
    link.defer = true;
    link.setAttribute('type', 'text/css');

    let sheet; let
      cssRules;
    // get the correct properties to check for depending on the browser
    if ('sheet' in link) {
      sheet = 'sheet';
      cssRules = 'cssRules';
    } else {
      sheet = 'styleSheet';
      cssRules = 'rules';
    }

    // start checking whether the style sheet has successfully loaded
    const interval_id = setInterval(() => {
      try {
        // SUCCESS! our style sheet has loaded
        if (link[sheet] && link[sheet][cssRules].length) {
          // clear the counters
          clearInterval(interval_id);

          // Declared after "," so it will be available in Interval
          clearTimeout(timeout_id);
          resolve();
        }
      } catch (e) {
        // Do nothing, timeout will handle it for fail after 15 seconds
      }
    }, 10);

    // how often to check if the stylesheet is loaded

    // start counting down till fail

    let timeout_id = setTimeout(() => {
      // clear the counters
      clearInterval(interval_id);
      clearTimeout(timeout_id);

      // since the style sheet didn't load, remove the link node from the DOM
      head.removeChild(link);
      reject('Timeout, unable to load css file');
      // how long to wait before failing
    }, 15000);

    // insert the link node into the DOM and start loading the style sheet

    head.appendChild(link);
    // return the link node;
    return link;
  });
  return loadPromises[pathHash];
};

/**
 * Load javascript file by path
 * @param path
 * @param attributes
 * @returns {Promise}
 */
export const loadScript = (path, attributes = {}) => {
  const pathHash = generateStringHash(path, 'JS').toString();
  if (loadPromises[pathHash]) return loadPromises[pathHash];

  loadPromises[pathHash] = new Promise((resolve, reject) => {
    if (!isBrowser()) {
      // If not a browser then do not allow loading of
      // css file, return with success->false
      reject('Cannot call from server. Function can be executed only from browser');
      return;
    }


    // Do not load script if already loaded
    const previousLink = document.getElementById(pathHash);
    if (previousLink) {
      resolve();
      return previousLink;
    }

    let s; let r; let
      t;
    r = false;
    s = document.createElement('script');
    s.type = 'text/javascript';
    s.id = pathHash;
    s.src = path;
    s.defer = true;
    s.onload = s.onreadystatechange = function () {
      if (!r && (!this.readyState || this.readyState === 'complete')) {
        r = true;
        resolve();
      }
    };
    // Add custom attribute added by user
    for (const attr in attributes) {
      s[attr] = attributes[attr];
    }
    t = document.getElementsByTagName('script')[0];
    t.parentNode.insertBefore(s, t);
    return s;
  });
  return loadPromises[pathHash];
};


/**
 * Simple numeric hash of a string, used for non-secure usage only
 * @param str
 * @param namespace
 * @returns {string}
 */
export const generateStringHash = (str, namespace) => {
  namespace = namespace || '';
  let hash = 0; let i; let
    chr;
  if (str.length === 0) return `${namespace}__${hash}`;
  str = `${namespace}_${str}`;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return `${namespace}__${hash}`;
};


/**
 * Return assets as array
 * @param assets
 * @returns {Array}
 */
export const assetsToArray = (assets) => {
  let allAssets = [];
  if (assets instanceof Object) {
    _.each(assets, (a) => {
      if (typeof a === 'string') {
        allAssets.push(a);
      } else if (a instanceof Object) {
        allAssets = allAssets.concat(assetsToArray(a));
      }
    });
  } else if (typeof assets === 'string') {
    allAssets.push(assets);
  }
  allAssets = _.sortBy(allAssets, a => a.indexOf('hot-update') !== -1);
  return _.uniq(allAssets);
};
