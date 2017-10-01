'use strict';

const Q = require('q');
const _ = require('lodash');
const path = require('path');
const hljs = require('highlight.js');
const bemhtml = require('bem-xjst').bemhtml;
const slugger = new (require('github-slugger'))();
const mdToBemjson = require('md-to-bemjson');

const baseUtil = require('../../util');

/**
 * Transforms page content source files from markdown format to html
 * @param {Model} model - application model instance
 * @param {Object} options - task options
 * @param {Object} [options.mdToBemjson] - md-to-bemjson options
 * @param {Function} [options.templates] - bem-xjst templates
 * @param {Function} [options.processHTML] - function to process HTML before saving to file
 * @param {Number} [options.concurrency] - number of pages processed at the same time
 * @returns {Function}
 * @example
 * var Q = require('q');
 * var gorshochek = require('gorshochek');
 * var model = gorshochek.createModel();
 * Q()
 *    .then(tasks.core.mergeModels(model, {modelPath: './examples/model.ru.json'}))
 *    .then(tasks.docs.loadSourcesFromLocal(model))
 *    .then(tasks.docs.transformMdToHtml(model))
 *    .then(tasks.core.saveModel(model))
 *    .then(tasks.core.rsync(model, {
 *        dest: './data',
 *        exclude: ['*.meta.json', 'model.json', '*.md']
 *    }))
 *    .done();
 */
module.exports = (model, options) => {
    options = options || {};
    options.concurrency = options.concurrency || 20;

    /**
     * Returns true if given page has contentFile field
     * and value of this field ends on .md
     * @param {Object} page - model page object
     * @returns {Boolean}
     */
    function hasMarkdownSource(page) {
        return !!(page.contentFile && page.contentFile.match(/\.md$/));
    }

    /**
     * Transforms source text into BEMJSON.
     * @param {Object} page - page object
     * @param {String} md - markdown content of page
     * @returns {Promise}
     */
    function transformToBemjson(page, md) {
        slugger.reset();

        return Q(mdToBemjson.convert(md, options.mdToBemjson))
            .catch(error => {
                console.error(`Error occur while transform md -> html for page: ${page.url}`);
                console.error(error.stack);
                throw error;
            });
    }

    /**
     * Transforms BEMJSON into html syntax.
     * @param {Object} page - page object
     * @param {Object} bemjson - bemjson content of page
     * @returns {String}
     */
    function transformToHtml(page, bemjson) {
        bemjson.hljs = hljs;
        bemjson.slugger = slugger;

        return (options.templates || bemhtml.compile(function() {})).apply(bemjson);
    }

    /**
     * @param {Object} page - page object
     * @param {String} html - html content of page
     * @returns {String}
     */
    function processHTML(page, html) {
        if (options.processHTML) {
            return options.processHTML(page, html);
        }

        return html;
    }

    /**
     * Transform md content of page source file into html syntax
     * @param {Model} model - data model
     * @param {Object} page - page object
     * @returns {Promise}
     */
    function processPage(model, page) {
        const sourceFilePath = page.contentFile;
        const mdFileDirectory = path.dirname(sourceFilePath);
        const htmlFilePath = path.join(mdFileDirectory, 'index.html');
        const bemjsonFilePath = path.join(mdFileDirectory, 'index.bemjson.js');

        return Q(sourceFilePath)
            .then(baseUtil.readFileFromCache.bind(baseUtil))
            .then(transformToBemjson.bind(null, page))
            .then(bemjson => {
                return Q.all([
                    baseUtil.writeFileToCache(
                        bemjsonFilePath,
                        'module.exports = ' + JSON.stringify(bemjson, null, 2) + ';'
                    ),
                    baseUtil.writeFileToCache(
                        htmlFilePath,
                        processHTML(page, transformToHtml(page, bemjson))
                    ),
                    () => {
                        page.contentFile = htmlFilePath;
                        page.contentBemjsonFile = bemjsonFilePath;
                    }
                ]);
            })
            .catch(error => {
                console.error(`Error occur while transform md -> html for page: ${page.url}`);
                console.error(error.stack);
                throw error;
            });
    }

    return () => {
        return baseUtil
            .processPagesAsync(model, hasMarkdownSource, processPage, options.concurrency)
            .thenResolve(model);
    };
};
