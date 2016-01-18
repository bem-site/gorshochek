/**
 * Returns true if given url is absolute and has http(s) protocol. Otherwise returns false.
 * @param {Object} url - parsed url
 * @returns {Boolean}
 */
export function isAbsoluteHttpUrl(url) {
    return url.protocol.indexOf('http') === 0;
}

/**
 * Returns true if given url is absolute and has not http(s) protocol
 * @param {Object} url - parsed url
 * @returns {Boolean}
 */
export function hasUnsupportedProtocol(url) {
    return url.protocol && !this.isAbsoluteHttpUrl(url);
}

/**
 * Returns true if given url is anchor url. (Has only hash attribute)
 * @param {Object} url - parsed url
 * @returns {Boolean}
 */
 // TODO: rename to isOnlyAnchor
export function isAnchor(url) {
    return url.hash && !url.protocol && !url.host && !url.path;
}

/**
 * Returns true if given url is github url.
 * (Hostname attribute should contain word 'github')
 * @param {Object} url - parsed url
 * @returns {Boolean}
 */
export function isGithubUrl(url) {
    return url.hostname.includes('github');
}

/**
 * Returns true if given url is native website url. Otherwise returns false
 * @param {Object} url - parsed url
 * @param {Array} existedUrls - array of existed model urls
 * @returns {Boolean}
 */
export function isNativeWebsiteUrl(url, existedUrls) {
    return existedUrls.includes(url.path.replace(/\/$/, ''));
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
        if(existedUrls.includes(item)) {
            replacement = item;
            return true;
        }
        return false;
    });

    return replacement;
}

export function createArrayOfModelPageUrls(pages) {
    return pages.map(page => page.url);
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
