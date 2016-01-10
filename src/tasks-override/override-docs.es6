import Path from 'path';
import Url from 'url';
import _ from 'lodash';
import Q from 'q';
import cheerio from 'cheerio';
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

    /**
     * Parses github url
     * @param {Object} url - parsed url object
     * @returns {{host: *, user: *, repo: *, ref: *, path: *}}
     * @private
     */
    _parseSourceUrl(url) {
        const repoInfo = url.match(/^https?:\/\/(.+?)\/(.+?)\/(.+?)\/(tree|blob)\/(.+?)\/(.+)/);
        return {
            host: repoInfo[1],
            user: repoInfo[2],
            repo: repoInfo[3],
            ref: repoInfo[5],
            path: repoInfo[6]
        };
    }

    /**
     * Resolves full github url by sourceUrl of doc and relative link to another doc
     * @param {String} href - link to another doc
     * @param {String} baseUrl - source url of doc
     * @private
     */
    _resolveFullGithubUrl(href, baseUrl) {
        const repo = this._parseSourceUrl(baseUrl);
        return Url.resolve('https://' +
            Path.join(repo.host, repo.user, repo.repo, 'blob', repo.ref, repo.path || ''), href);
    }

    _findLinkHrefReplacement(linkHref, page, sourceUrlsMap, existedUrls) {
        const _linkHref = linkHref;

        linkHref = linkHref.replace(/&#(x?)([0-9a-fA-F]+);?/g, (str, bs, match) => {
            return String.fromCharCode(parseInt(match, bs === 'x' ? 16 : 10));
        });

        const url = Url.parse(linkHref);

        // якорная ссылка типа #some-anchor
        // ссылки с неподдерживаемыми протоколами, например mail:// git://
        // ссылка которая уже ведет на сайт
        if(this.isAnchor(url) ||
            this.hasUnsupportedProtocol(url) ||
            this.isNativeWebsiteUrl(url, existedUrls)) {
            return linkHref;
        }

        if(this.isAbsoluteHttpUrl(url) && !this.isGithubUrl(url)) {
            return linkHref;
        }

        const variants = [];
        const anchor = url.hash;
        linkHref = Url.format(_.omit(url, 'hash'));

        this.isGithubUrl(url) ?
            variants.push(linkHref) :
            variants.push(this._resolveFullGithubUrl(linkHref, page.sourceUrl));

        if(anchor) {
            linkHref = Url.format(_.merge(Url.parse(linkHref), {hash: anchor}));
        }

        this.logger.verbose(`Replace from: ${_linkHref} to: ${linkHref}`);
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
        if(this.isAbsoluteHttpUrl(url)) {
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
