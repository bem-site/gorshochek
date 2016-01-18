import path from 'path';
import Q from 'q';
import mdToHtml from 'bem-md-renderer';
import * as baseUtil from '../../util';

/**
 * Transforms page content source files from markdown format to html
 * @param {Model} model - application model instance
 * @returns {Function}
 */
export default function transformMdToHtml(model) {

    function getCriteria(page) {
        return !!(page.contentFile && page.contentFile.match(/\.md$/));
    }

    /**
     * Transforms source text into html syntax.
     * @param {Object} page - page object
     * @param {String} md - markdown content of page
     * @returns {Promise}
     */
    function transform(page, md) {
        return Q.nfcall(mdToHtml.render, md)
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
            .then(baseUtil.readFileFromCache)
            .then(transform.bind(null, page))
            .then(baseUtil.writeFileToCache.bind(null, htmlFilePath))
            .then(() => {
                page.contentFile = htmlFilePath;
                return page;
            });
    }

    return function() {
        return baseUtil.processPagesAsync(model, getCriteria, processPage, 20).thenResolve(model);
    };
};
