import Q from 'q';
import * as util from './util';

export default function createBreadcrumbs(model) {
    /*
     Для каждой страницы создаем
     поле breadcrumbs (хлебные крошки). В это поле записывается массив объектов типа
     [
         { url: '/', title: 'main page title' },
         { url: '/url1', title: 'url1 title' },
         { url: '/url1/url2', title: 'url2 title' }
     ]
     */
    function processFunc(map, page) {
        page.breadcrumbs = this
            .getParentUrls(page)
            .map(url => ({url, title: map.get(url)}));
    }

    return function() {
        model.getPages().forEach(processFunc.bind(null, util.createPageTitlesMap(model.getPages())));
        return Q(model);
    };
}
