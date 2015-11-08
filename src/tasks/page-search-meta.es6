import _ from 'lodash';
import PageBase from './page-base';

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
        this.beforeRun();

        return super.run(model, (page, languages, pageTitlesMap) => {
            const urlSet = this.getParentUrls(page);
            languages.forEach(language => {
                // TODO add cases for library entities
                page[language] && _.chain(page)
                    .get(language)
                    .set('meta.breadcrumbs', urlSet.map(url => {
                        return {url, title: pageTitlesMap.get(url).get(language)};
                    }))
                    .set('meta.fields', {type: 'doc', keywords: page[language].tags || []})
                    .value();
            });
        });
    }
}
