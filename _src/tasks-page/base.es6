import Base from '../tasks-core/base';

/**
 * @exports
 * @class PageBase
 * @extends Base
 * @desc Base class for page meta class modules
 */
export default class PageBase extends Base {

    /**
     * Returns logger module
     * @returns {module|Object|*}
     * @static
     */
    static getLoggerName() {
        return module;
    }

    /**
     * Return task human readable description
     * @returns {String}
     * @static
     */
    static getName() {
        return 'page base operations';
    }

    /**
     * Creates map url -> lang -> title
     * @param {Array} pages - array of model pages
     * @returns {Object}
     * @protected
     */
    createPageTitlesMap(pages) {
        return pages.reduce((pagesMap, page) => {
            pagesMap.set(page.url, page.title);
            return pagesMap;
        }, new Map());
    }

    /**
     * Retrieves array with url of given page and all parent urls
     * @param {Object} page - page model object
     * @returns {Array<String>}
     * @protected
     */
    getParentUrls(page) {
        const DELIMETER = '/';
        const chunks = page.url.split(DELIMETER);
        const result = [DELIMETER];

        for(let i = 1; i < chunks.length; i++) {
            let url = '';
            for(let j = 0; j <= i; j++) {
                chunks[j].length && (url += (DELIMETER + chunks[j]));
            }
            url.length && result.push(url);
        }
        return result;
    }

    /**
     * Executes task with optional process function which should be called for each of model pages
     * @param {Model} model - application model instance
     * @param {Function} processFunc - page processing function
     * @returns {Promise.<*>|*}
     * @protected
     */
    run(model, processFunc) {
        const pagesMap = this.createPageTitlesMap(model.getPages());
        model.getPages().forEach(page => processFunc(page, pagesMap));
        this.logger.info(`Successfully finish task "${this.constructor.getName()}"`);
        return Promise.resolve(model);
    }
}
