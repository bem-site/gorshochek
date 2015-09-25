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

        const languages = this.getBaseConfig().getLanguages();
        const pagesMap = this.getPagesMap(model.getPages(), languages);

        model.getPages().forEach(page => {
            const urlSet = this.getParentUrls(page);
            languages.forEach(language => {
                page[language].meta = {
                    breadcrumbs: urlSet.map(url => {
                        return {
                            url,
                            title: pagesMap.get(url).get(language)
                        };
                    }),
                    fields: {
                        type: 'doc',
                        keywords: page[language].tags || []
                    }
                };
                // TODO add cases for library entities
            });
        });

        this.logger.info(`Successfully finish task "${this.constructor.getName()}"`);
        return Promise.resolve(model);
    }
}
