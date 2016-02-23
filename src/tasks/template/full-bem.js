const vm = require('vm');
const path = require('path');

const _ = require('lodash');
const Q = require('q');
const baseUtil = require('../../util');

const debug = require('debug')('full-bem');

/**
 * Applies BEMTREE + BEMHTML templates to each of model pages
 * Saves result html to destination dir
 * @param {Model} model - application model instance
 * @param {Object} options - task options object
 * @param {Object} options.bemtree - paths to BEMTREE template files { bundle1: path1, bundle2: path2, …}
 * @param {Object} options.bemhtml - paths to BEMHTML template files { bundle1: path1, bundle2: path2, …}
 * @param {String} [options.source] - source data directory path
 * @param {String} [options.destination] - output folder path for compiled html pages
 * @param {Number} [options.concurrency] - number of pages which should be processed per time
 * @param {Object} [options.ctx] - advanced context
 * @returns {Function}
 */
module.exports = function(model, options) {
    options = options || {};

    if(!options.bemtree) {
        throw new Error('Paths to BEMTREE template files was not set');
    }

    if(!options.bemhtml) {
        throw new Error('Paths to BEMHTML template files was not set');
    }

    if(!options.ctx) {
        throw new Error('Context was not set')
    }

    options.source = options.source || './data';
    options.destination = options.destination || './output';
    options.concurrency = options.concurrency || 20;

    const BEMTREE = {};
    for(var bundle in options.bemtree) {
        BEMTREE[bundle] = require(path.join(process.cwd(), options.bemtree[bundle])).BEMTREE;
    }

    const BEMHTML = {};
    for(var bundle in options.bemhtml) {
        BEMHTML[bundle] = require(path.join(process.cwd(), options.bemhtml[bundle])).BEMHTML;
    }

    /**
     * Receives pages for menu
     * Pick only url, title and site fields from each of model pages
     * @returns {Object[]}
     */
    function getPagesDataForMenuCreation() {
        return model.getPages().map(page => _.pick(page, ['url', 'site', 'title']));
    }

    /**
     * Loads page content
     * @param {Object} page
     * @returns {Object}
     */
    function getPageContent(page) {
        if(!page.content && !page.contentFile) {
            return Q('');
        }

        return page.content
            ? Q(page.content)
            : baseUtil.readFile(path.join(options.source, page.contentFile), '');
    }

    /**
     * Creates bemjson via BEMTREE template
     * @param {Object[]} pages - array of pseudo pages for menu creation
     * @param {Object} page
     * @returns {*}
     */
    function createBEMJSON(pages, page) {
        const ctx = {};
        ctx.block = options.ctx.block;
        ctx.data = _.merge({page, pages}, options.ctx.data);
        return BEMTREE[page.bundle].apply(ctx);
    }

    /**
     * Saves compiled page html code into destination path
     * @param {Object} page
     * @param {String} html code for given page
     * @returns {Promise}
     */
    function saveCompiledPage(page, html) {
        const filePath = path.join(options.destination, page.url, 'index.html');
        debug(`${filePath} ${page.title}`);

        return baseUtil.writeFile(filePath, html);
    }

    /**
     * Compound page structure object for templating
     * @param {Object} page
     * @param {String} content - page content
     * @returns {Object} page
     */
    function compoundPage(page, content) {
        if(_.includes(page.contentFile, '.js')) {
            content = BEMHTML[page.bundle].apply(vm.runInNewContext(content))
        }
        return _.set(page, 'content', content);
    }

    /**
     * Creates function for page processing
     * @returns {Function}
     */
    function createProcessPageFunc() {
        const pages = getPagesDataForMenuCreation();

        return (model, page) => {
            return Q(page)
                .then(getPageContent)
                .then(compoundPage.bind(null, page))
                .then(createBEMJSON.bind(null, pages))
                .then(BEMHTML[page.bundle].apply)
                .then(saveCompiledPage.bind(null, page))
                .catch(error => {
                    console.error(`Error occurred while compiling page for url ${page.url}`);
                    console.error(error.stack);
                });
        }
    }

    return () => {
        return baseUtil
            .processPagesAsync(model, _.identity, createProcessPageFunc(), options.concurrency)
            .thenResolve(model);
    };
};
