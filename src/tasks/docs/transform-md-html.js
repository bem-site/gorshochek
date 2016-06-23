'use strict';

const path = require('path');
const Q = require('q');
const _ = require('lodash');
const marked = require('marked');
const baseUtil = require('../../util');

const DEFAULT_MARKED_OPTIONS = {
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
};

/**
 * Transforms page content source files from markdown format to html
 * @param {Model} model - application model instance
 * @param {Object} options - task options
 * @param {Object} [options.markedOptions] - marked options for markdown parsing
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
    options.markedOptions = _.merge(DEFAULT_MARKED_OPTIONS, options.markedOptions || {});
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
     * Transforms source text into html syntax.
     * @param {Object} page - page object
     * @param {String} md - markdown content of page
     * @returns {Promise}
     */
    function transform(page, md) {
        options.markedOptions.slugger && options.markedOptions.slugger.reset();

        return Q.denodeify(marked)(md, options.markedOptions)
            .catch(error => {
                console.error(`Error occur while transform md -> html for page: ${page.url}`);
                console.error(error.stack);
                throw error;
            });
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

        return Q(sourceFilePath)
            .then(baseUtil.readFileFromCache.bind(baseUtil))
            .then(transform.bind(null, page))
            .then(baseUtil.writeFileToCache.bind(baseUtil, htmlFilePath))
            .then(() => {
                page.contentFile = htmlFilePath;
                return page;
            });
    }

    return () => {
        return baseUtil
            .processPagesAsync(model, hasMarkdownSource, processPage, options.concurrency)
            .thenResolve(model);
    };
};
