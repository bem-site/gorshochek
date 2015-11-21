import path from 'path';
import Q from 'q';
import mdToHtml from 'bem-md-renderer';
import Base from './transform-base';

export default class DocsMdToHtml extends Base {

    static getLoggerName() {
        return module;
    }

    /**
     * Return task human readable description
     * @returns {String}
     */
    static getName() {
        return 'docs transform markdown to html';
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
    transform(page, language, md) {
        return Q.nfcall(mdToHtml.render, md)
            .catch(error => {
                this.logger
                    .error(`Error occur while transform md -> html for page: ${page.url} and language ${language}`)
                    .error(error.message);
                throw error;
            });
    }
}