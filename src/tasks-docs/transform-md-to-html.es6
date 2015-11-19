import path from 'path';
import Q from 'q';
import mdToHtml from 'bem-md-renderer';
import Base from '../tasks-core/base';

export default class DocsMdToHtml extends Base {

    static getLoggerName() {
        return module;
    }

    /**
     * Return task human readable description
     * @returns {String}
     */
    static getName() {
        return 'docs markdown to html';
    }

    /**
     * Returns true if page[language] exists and have contentFile
     * pointed to *.md file. Otherwise returns false
     * @param {Object} page - page object
     * @param {String} language version
     * @returns {Boolean}
     * @protected
     */
    getCriteria(page, language) {
        if(!page[language]) {
            return false;
        }

        const contentFile = page[language].contentFile;
        return !!contentFile && !!contentFile.match(/\.md$/);
    }

    /**
     * Transforms markdown text into html syntax with help of marked library
     * wrapped into https://github.com/bem-site/bem-md-renderer npm package
     * @param {Object} page - page object
     * @param {String} language version
     * @param {String} md - text in markdown syntax
     * @returns {Promise}
     * @private
     */
    _mdToHtml(page, language, md) {
        return Q.nfcall(mdToHtml.render, md)
            .catch(error => {
                this.logger
                    .error(`Error occur while transform md -> html for page: ${page.url} and language ${language}`)
                    .error(error.message);
                throw error;
            });
    }

    /**
     * Transform md content of page source file into html syntax
     * @param {Model} model - data model
     * @param {Object} page - page object
     * @param {Array} languages - configured languages array
     * @returns {Promise}
     * @protected
     */
    processPage(model, page, languages) {
        return Q.allSettled(languages.map((language) => {
            if(!this.getCriteria(page, language)) {
                return Q(page);
            }

            const mdFilePath = page[language].contentFile;
            const mdFileDirectory = path.dirname(mdFilePath);
            const htmlFilePath = path.join(mdFileDirectory, language + '.html');

            return Q.when(mdFilePath)
                .then(this.readFileFromCache.bind(this))
                .then(this._mdToHtml.bind(this, page, language))
                .then(this.writeFileToCache.bind(this, htmlFilePath))
                .tap(() => {
                    this.logger.debug(`md -> html for language: => ${language} and page with url: => ${page.url}`);
                })
                .then(() => {
                    page[language].contentFile = htmlFilePath;
                    return page;
                });
        })).thenResolve(page);
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun();
        return this.processPages(model, 20).thenResolve(model);
    }
}
