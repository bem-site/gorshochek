import PageBase from './page-base';

export default class PageBreadcrumbs extends PageBase {

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
        return 'create page breadcrumbs';
    }

    /**
     * Performs task
     * @returns {Promise}
     * @public
     */
    run(model) {
        this.beforeRun();
        /*
         Для каждой языковой версии каждой страницы создаем
         поле breadcrumbs (хлебные крошки). В это поле записывается массив объектов типа
         [
            { url: '/', title: 'main page title' },
            { url: '/url1', title: 'url1 title' },
            { url: '/url1/url2', title: 'url2 title' }
         ]
         */
        return super.run(model, (page, languages, pageTitlesMap) => {
            const urlSet = this.getParentUrls(page);
            languages.forEach(language => {
                page[language] && (page[language].breadcrumbs = urlSet.map(url => {
                    return {url, title: pageTitlesMap.get(url).get(language)};
                }));
            });
        });
    }
}
