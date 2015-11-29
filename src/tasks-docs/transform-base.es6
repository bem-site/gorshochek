import path from 'path';
import Q from 'q';
import Base from '../tasks-core/base';

export default class DocsTransformBase extends Base {

    static getLoggerName() {
        return module;
    }

    /**
     * Return task human readable description
     * @returns {String}
     */
    static getName() {
        return 'doc transform base';
    }

    getCriteria() {
        return true;
    }

    /**
     * Transforms source text into html syntax.
     * This method should be overided in child classes
     * @param {Object} page - page object
     * @param {String} language version
     * @param {String} source content
     * @returns {Promise}
     * @protected
     */
    transform(page, language, source) {
        return Q(source);
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

            const sourceFilePath = page[language].contentFile;
            const mdFileDirectory = path.dirname(sourceFilePath);
            const htmlFilePath = path.join(mdFileDirectory, language + '.html');

            return Q(sourceFilePath)
                .then(this.readFileFromCache.bind(this))
                .then(this.transform.bind(this, page, language))
                .then(this.writeFileToCache.bind(this, htmlFilePath))
                .then(() => {
                    page[language].contentFile = htmlFilePath;
                    return page;
                });
        })).thenResolve(page);
    }

    /**
     * Performs task
     * @param {Model} model
     * @returns {Promise}
     */
    run(model) {
        return this
            .processPagesAsync(model, this.getCriteria.bind(this), this.processPage.bind(this), 20)
            .thenResolve(model);
    }
}

