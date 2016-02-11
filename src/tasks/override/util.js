'use strict';

/**
 * Returns true if given url is absolute and has http(s) protocol. Otherwise returns false.
 * @param {Object} url - parsed url
 * @returns {Boolean}
 */
exports.isAbsoluteHttpUrl = function(url) {
    // url.protocol is not defined for relative links
    return !!url.protocol && url.protocol.indexOf('http') === 0;
};

/**
 * Returns true if given url is absolute and has not http(s) protocol
 * @param {Object} url - parsed url
 * @returns {Boolean}
 */
exports.hasUnsupportedProtocol = function(url) {
    return !!url.protocol && !this.isAbsoluteHttpUrl(url);
};

/**
 * Returns true if given url is anchor url. (Has only hash attribute)
 * @param {Object} url - parsed url
 * @returns {Boolean}
 */
exports.isOnlyAnchor = function(url) {
    return url.hash && !url.protocol && !url.host && !url.path;
};

/**
 * Returns true if given url is github url.
 * (Hostname attribute should contain word 'github')
 * @param {Object} url - parsed url
 * @returns {Boolean}
 */
exports.isGithubUrl = function(url) {
    return url.hostname && url.hostname.indexOf('github') > -1;
};

/**
 * Returns true if given url is native website url. Otherwise returns false
 * @param {Object} url - parsed url
 * @param {Array} existedUrls - array of existed model urls
 * @returns {Boolean}
 */
exports.isNativeWebsiteUrl = function(url, existedUrls) {
    return existedUrls.indexOf(url.path.replace(/\/$/, '')) > -1;
};

/**
 * Tries to find link replacement from urlHash and site existed urls array for given variants
 * @param {String[]} variants - array of link variants
 * @param {Object} urlHash - hash of page sourceUrl -> page url
 * @param {String[]} existedUrls - array of site existed urls
 * @returns {String|null}
 */
exports.findReplacement = function(variants, urlHash, existedUrls) {
    let replacement = null;

    variants.some(item => {
        const alterItem = item + '/README.md';

        if(urlHash.has(item)) {
            replacement = urlHash.get(item);
            return true;
        }
        if(urlHash.has(alterItem)) {
            replacement = urlHash.get(alterItem);
            return true;
        }
        if(existedUrls.indexOf(item) > -1) {
            replacement = item;
            return true;
        }
        return false;
    });

    return replacement;
};

/**
 * Creates array of urls of all model pages
 * @param {Object[]} pages - array of model pages
 * @returns {String[]}
 */
exports.createArrayOfModelPageUrls = function(pages) {
    return pages.map(page => page.url);
};

/**
 * Creates map with pages sourceUrls as keys and pages urls as values
 * @param {Object[]} pages - array of model pages
 * @returns {Map}
 */
exports.createSourceUrlsMap = function(pages) {
    return pages.reduce((prev, page) => {
        if(page.published && page.sourceUrl) {
            prev.set(page.sourceUrl, page.url);
        }
        return prev;
    }, new Map());
};
