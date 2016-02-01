import * as util from './util';

/*
 Для каждой страницы создаем
 поле breadcrumbs (хлебные крошки). В это поле записывается массив объектов типа
 [
    { url: '/', title: 'main page title' },
    { url: '/url1', title: 'url1 title' },
    { url: '/url1/url2', title: 'url2 title' }
 ]
 */

/**
 * Returns execution function for page breadcrumbs creation
 * @param {Model} model - application model instance
 * @returns {Function}
 */
export default function createBreadcrumbs(model) {
    return util.getExecFunction(model, (map, page) => {
        page.breadcrumbs = util
            .getParentUrls(page)
            .map(url => ({url, title: map[url]}));
    });
}
