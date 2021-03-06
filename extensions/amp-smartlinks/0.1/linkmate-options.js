/**
 * Get the config values from the tag on the amp page
 * @param {!Element} element
 * @return {!Object}
 */
export function getConfigOptions(element) {
  return {
    nrtvSlug: getNrtvAccountName_(element),
    linkmateEnabled: hasLinkmateFlag_(element),
    exclusiveLinks: hasExclusiveLinksFlag_(element),
    linkAttribute: getLinkAttribute_(element),
    linkSelector: getLinkSelector_(element),
  };
}

/**
 * The slug used to distinguish Narrativ accounts.
 * @param {!Element} element
 * @return {string}
 * @private
 */
function getNrtvAccountName_(element) {
  const nrtvSlug = element.getAttribute('nrtv-account-name');

  return nrtvSlug.toLowerCase();
}

/**
 * Flag to run the Linkmate service on an article.
 * @param {!Element} element
 * @return {boolean}
 * @private
 */
function hasLinkmateFlag_(element) {
  return !!element.hasAttribute('linkmate');
}

/**
 * Flag to mark links as exclusive.
 * @param {!Element} element
 * @return {boolean}
 */
function hasExclusiveLinksFlag_(element) {
  return !!element.hasAttribute('exclusive-links');
}

/**
 * What attribute the outbound link variable is stored in an anchor.
 * @param {!Element} element
 * @return {string}
 * @private
 */
function getLinkAttribute_(element) {
  const linkAttribute = element.getAttribute('link-attribute');

  return linkAttribute ? linkAttribute.toLowerCase() : 'href';
}

/**
 * Selector used to get all links that are meant to be monetized.
 * @param {!Element} element
 * @return {string}
 * @private
 */
function getLinkSelector_(element) {
  const linkSelector = element.getAttribute('link-selector');

  return linkSelector ? linkSelector.toLowerCase() : 'a';
}
