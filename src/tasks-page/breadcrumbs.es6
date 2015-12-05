import PageBase from './base';

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
        /*
         Для каждой страницы создаем
         поле breadcrumbs (хлебные крошки). В это поле записывается массив объектов типа
         [
            { url: '/', title: 'main page title' },
            { url: '/url1', title: 'url1 title' },
            { url: '/url1/url2', title: 'url2 title' }
         ]
         */
        return super.run(model, (page, pageTitlesMap) => {
            page.breadcrumbs = this
                .getParentUrls(page)
                .map(url => ({url, title: pageTitlesMap.get(url)}));
        });
    }
}
