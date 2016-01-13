import _ from 'lodash';
import Q from 'q';
import * as util from './util';

export default function createPageTitle(model, options) {
    options || (options = {});
    options.delimeter || (options.delimeter = '/');

    /*
     Для каждой страницы создаем
     поле header.title в котором находится строка состоящая из
     соответствующих title-ов всех родительских страниц начиная от корневой
     и заканчивая текущей страницей. title-ы страниц разделены символом "/".
     */
    function processFunc(map, page) {
        const urlSet = util.getParentUrls(page).reverse();
        _.chain(page)
            .set('header.title', urlSet.map(url => map.get(url)).join(options.delimeter))
            .value();
    }

    return function() {
        model.getPages().forEach(processFunc.bind(null, util.createPageTitlesMap(model.getPages())));
        return Q(model);
    };
}

