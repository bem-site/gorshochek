'use strict';

const fs = require('fs');
const Path = require('path');
const Url = require('url');
const _ = require('lodash');
const Q = require('q');
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

    /**
     * Resolves full image remote url based on page source
     * @param {String} imgSrc - value of img src attribute
     * @param {Object} page - model page entity
     * @returns {String|null}
     */
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

    /**
     * Tries to load image from resolved image url
     * Saves loaded image file into static folder and returns promise with path to this file
     * @param {String} imgSrc - img src attribute value
     * @param {Object} page - model page entity object
     * @returns {Promise}
     */
    function replaceImageSource(imgSrc, page) {
        const imageUrl = resolveImageUrl(imgSrc, page);
        if(!imageUrl) {
            return Q(null);
        }

        const filePath = Path.join(options.imageFolder, sha1(imageUrl));

        debug(`load image from: ${imageUrl} to: ${filePath}`);
        return baseUtil.isFileExists(Path.join(baseUtil.getCacheFolder(), filePath))
            .then(exists => {
                if(exists) {
                    return Q(filePath);
                }
                return baseUtil.loadFileToCacheFromUrl(imageUrl, filePath, imgSrc);
            });
    }

    /**
     * Parses html source with help of cheerio model.
     * Finds all "img" tags with their href and src attributes.
     * Iterates over founded tags and finds replacement for each src attributes
     * @see https://www.npmjs.com/package/cheerio
     * @param {Object} page - model page object
     * @param {String} source - page source html string
     * @returns {String}
     */
    function override(page, source) {
        const $ = cheerio.load(source, {decodeEntities: false});
        const promises = [];
        $('img').each(function() {
             promises.push(replaceImageSource($(this).attr('src'), page)
                 .then(src => $(this).attr('src', src)));
        });
        return Q.allSettled(promises).then(() => _.unescape($.html()));
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
