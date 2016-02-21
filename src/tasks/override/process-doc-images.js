'use strict';

const fs = require('fs');
const Path = require('path');
const Url = require('url');
const _ = require('lodash');
const Q = require('q');
const got = require('got');
const sha1 = require('sha1');
const cheerio = require('cheerio');
const baseUtil = require('../../util');
const util = require('./util');

const debug = require('debug')('process-doc-images');

module.exports = (model, options) => {
    options = options || {};

    options.concurrency = options.concurrency || 20;
    options.imageFolder = options.imageFolder || '/static';

    baseUtil.createFolder(Path.join(baseUtil.getCacheFolder(), options.imageFolder));

    /**
     * Returns true if page satisfies criteria. Otherwise returns fals
     * @param {Object} page - model page object
     * @returns {Boolean}
     */
    function isHtmlContentFile(page) {
        return !!page.contentFile && _.includes(page.contentFile, '.html');
    }

    function resolveImageUrl(imgSrc, page) {
        if(!imgSrc) {
            return null;
        }

        const url = Url.parse(imgSrc);
        if(util.isAbsoluteHttpUrl(url)) {
            return imgSrc;
        }

        const source = Url.parse(page.source);
        if(util.isGithubUrl(source)) {
            source.host = 'raw.githubusercontent.com';
            source.path = source.pathname = source.pathname.replace(/\/tree|blob\//, '');
        }
        return Url.resolve(Url.format(source), imgSrc);
    }

    function replaceImageSource(imgSrc, page) {
        const imageUrl = resolveImageUrl(imgSrc, page);
        if(!imageUrl) {
            return Q(null);
        }
        const defer = Q.defer();
        const filePath = Path.join(options.imageFolder, sha1(imageUrl));

        debug(`load image from ${imageUrl} to ${filePath}`);

        got.stream(imageUrl)
            .pipe(fs.createWriteStream(Path.join(baseUtil.getCacheFolder(), filePath)))
            .on('close', () => defer.resolve(filePath))
            .on('error', error => {
                console.error(`Error occurred while loading: ${imageUrl}`);
                console.error(error.stack);
                defer.resolve(imgSrc);
            });

        return defer.promise;
    }

    function override(page, source) {
        const $ = cheerio.load(source);
        const promises = [];
        $('img').each(function() {
             promises.push(replaceImageSource($(this).attr('src'), page)
                 .then(src => $(this).attr('src', src)));
        });
        return Q.allSettled(promises).then(() => $.html());
    }

    function processPage(model, page) {
        const sourceFilePath = page.contentFile;

        return Q(sourceFilePath)
            .then(baseUtil.readFileFromCache.bind(baseUtil))
            .then(override.bind(null, page))
            .then(baseUtil.writeFileToCache.bind(baseUtil, sourceFilePath))
            .thenResolve(page);
    }

    return () => {
        return baseUtil
            .processPagesAsync(model, isHtmlContentFile, processPage, options.concurrency)
            .thenResolve(model);
    };
};
