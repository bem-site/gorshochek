import _ from 'lodash';
import Base from '../tasks-core/base';

export default class OverrideBase extends Base {

    /**
     * Returns logger module
     * @returns {module|Object|*}
     */
    static getLoggerName() {
        return module;
    }

    /**
     * Return task human readable description
     * @returns {String}
     */
    static getName() {
        return 'base override functionality';
    }

    createArrayOfModelPageUrls(pages) {
        return _.pluck(pages, 'url');
    }

    /**
     * Creates map with pages sourceUrls as keys and pages urls as values
     * @param {Object[]} pages - array of model pages
     * @returns {Map}
     */
    createSourceUrlsMap(pages) {
        return pages.reduce((prev, page) => {
            if(page.published && page.sourceUrl) {
                prev.set(page.sourceUrl, page.url);
            }
            return prev;
        }, new Map());
    }

    /**
     * Performs task
     * @returns {Promise}
     * @public
     */
    run(model) {
        return this
            .processPagesAsync(model, this.getCriteria.bind(this), this.createProcessPageFunc(model).bind(this), 20)
            .thenResolve(model);
    }
}
