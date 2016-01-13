import _ from 'lodash';
import PageBase from './base';

export default class PageSearchMeta extends PageBase {

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
        return 'create page search meta-information';
    }

    /**
     * Performs task
     * @returns {Promise}
     * @public
     */
    run(model) {
        return super.run(model, (page, pageTitlesMap) => {
            const urlSet = this.getParentUrls(page);
            _.chain(page)
                .set('meta.breadcrumbs', urlSet.map(url => ({url, title: pageTitlesMap.get(url)})))
                .set('meta.fields', {type: 'doc', keywords: page.tags || []})
                .value();
        });
    }
}
