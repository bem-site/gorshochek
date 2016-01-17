import _ from 'lodash';

/**
 * Returns true if given url is absolute and has http(s) protocol. Otherwise returns false.
 * @param {Object} url - parsed url
 * @returns {Boolean}
 */
export function isAbsoluteHttpUrl(url) {
    return _.includes(['http:', 'https:'], url.protocol);
}

/**
 * Returns true if given url is absolute and has not http(s) protocol
 * @param {Object} url - parsed url
 * @returns {Boolean}
 */
export function hasUnsupportedProtocol(url) {
    return !!url.protocol && !this.isAbsoluteHttpUrl(url);
}

/**
 * Returns true if given url is anchor url. (Has only hash attribute)
 * @param {Object} url - parsed url
 * @returns {Boolean}
 */
export function isAnchor(url) {
    return !!url.hash && !url.protocol && !url.host && !url.path;
}

/**
 * Returns true if given url is github url.
 * (Hostname attribute should contain word 'github')
 * @param {Object} url - parsed url
 * @returns {Boolean}
 */
export function isGithubUrl(url) {
    return _.includes(url.hostname, 'github');
}

/**
 * Returns true if given url is native website url. Otherwise returns false
 * @param {Object} url - parsed url
 * @param {Array} existedUrls - array of existed model urls
 * @returns {Boolean}
 */
export function isNativeWebsiteUrl(url, existedUrls) {
    return _.includes(existedUrls, url.path.replace(/\/$/, ''));
}

export function findReplacement(variants, urlHash, existedUrls) {
    var replacement = null;

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
        if(_.includes(existedUrls, item)) {
            replacement = item;
            return true;
        }
        return false;
    });

    return replacement;
}

export function createArrayOfModelPageUrls(pages) {
    return _.pluck(pages, 'url');
}

/**
 * Creates map with pages sourceUrls as keys and pages urls as values
 * @param {Object[]} pages - array of model pages
 * @returns {Map}
 */
export function createSourceUrlsMap(pages) {
    return pages.reduce((prev, page) => {
        if(page.published && page.sourceUrl) {
            prev.set(page.sourceUrl, page.url);
        }
        return prev;
    }, new Map());
}
