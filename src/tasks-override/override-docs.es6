import Url from 'url';
import _ from 'lodash';
import Q from 'q';
import cheerio from 'cheerio';
import * as overrideUtils from './utils';
import Base from './override-base';

export default class OverrideDocs extends Base {

    /**
     * Returns logger module
     * @returns {module|Object|*}
     */
    static getLoggerName() {
        return module;
    }

    /**
     * Return task human readable description
     * @returns {String}
     */
    static getName() {
        return 'override link in docs';
    }

    /**
     * Returns true if page satisfies criteria. Otherwise returns fals
     * @param {Object} page - model page object
     * @returns {Boolean}
     */
    getCriteria(page) {
        return page.contentFile && _.includes(page.contentFile, '.html');
    }

    _findLinkHrefReplacement(linkHref, page, sourceUrlsMap, existedUrls) {
        return linkHref;
    }

    /**
     * Find replacement for img src attribute
     * @param {String} imgSrc - original image source
     * @param {Object} page - model page object
     * @returns {String} replacement
     * @private
     */
    _findImageSourceReplacement(imgSrc, page) {
        if(!imgSrc) {
            return imgSrc;
        }

        const url = Url.parse(imgSrc);
        if(overrideUtils.isAbsoluteHttpUrl(url)) {
            return imgSrc;
        }

        const result = Url.resolve(page.sourceUrl, imgSrc) + '?raw=true';
        this.logger.verbose(imgSrc + ' => ' + result);
        return result;
    }

    /**
     * Parses html source with help of cheerio model.
     * Finds all "a" and "img" tags with their href and srt attributes.
     * Iterates over founded tags and finds replacement for each of href or src attributes
     * @see https://www.npmjs.com/package/cheerio
     * @param {Object} page - model page object
     * @param {Map} sourceUrlsMap - map of page sourceUrls as keys and page urls as values
     * @param {Array} existedUrls - array of all page urls in model
     * @param {String} source - page source html string
     * @returns {String}
     */
    override(page, sourceUrlsMap, existedUrls, source) {
        const _this = this;
        const $ = cheerio.load(source);
        $('a').each(function() {
            $(this).attr('href',
                _this._findLinkHrefReplacement($(this).attr('href'), page, sourceUrlsMap, existedUrls));
        });
        $('img').each(function() {
            $(this).attr('src',
                _this._findImageSourceReplacement($(this).attr('src'), page));
        });
        return $.html();
    }

    /**
     * Returns page processing function
     * @param {Model} model - application model instance
     * @returns {Function}
     */
    createProcessPageFunc(model) {
        const sourceUrlsMap = this.createSourceUrlsMap(model.getPages());
        const existedUrls = this.createArrayOfModelPageUrls(model.getPages());

        return function(model, page) {
            const sourceFilePath = page.contentFile;

            this.logger.debug(`override links for: ${page.url}`);
            return Q(sourceFilePath)
                .then(this.readFileFromCache.bind(this))
                .then(this.override.bind(this, page, sourceUrlsMap, existedUrls))
                .then(this.writeFileToCache.bind(this, sourceFilePath))
                .thenResolve(page);
        };
    }
}
