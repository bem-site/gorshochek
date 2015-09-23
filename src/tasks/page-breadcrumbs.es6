import PageBase from './page-base';

export default class PageBreadcrumbs extends PageBase {

    static getLoggerName() {
        return module;
    }

    /**
     * Return task human readable description
     * @returns {String}
     */
    static getName() {
        return 'create page breadcrumbs';
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun();

        const languages = this.getBaseConfig().getLanguages();
        const pagesMap = this.getPagesMap(model.getPages(), languages);

        /*
         Для каждой языковой версии каждой страницы создаем
         поле breadcrumbs (хлебные крошки). В это поле записывается массив объектов типа
         [
            { url: '/', title: 'main page title' },
            { url: '/url1', title: 'url1 title' },
            { url: '/url1/url2', title: 'url2 title' }
         ]
         */
        model.getPages().forEach(page => {
            const urlSet = this.getParentUrls(page);
            languages.forEach(language => {
                if(page[language]) {
                    page[language].breadcrumbs = urlSet.map(url => {
                        return {
                            url,
                            title: pagesMap.get(url).get(language)
                        };
                    });
                }
            });
        });

        this.logger.info(`Successfully finish task "${this.constructor.getName()}"`);
        return Promise.resolve(model);
    }
}
