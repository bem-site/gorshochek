import _ from 'lodash';
import PageBase from './base';

export default class PageHeaderTitle extends PageBase {

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
        return 'create page titles';
    }

    /**
     * Performs task
     * @returns {Promise}
     * @public
     */
    run(model) {
        /*
           Для каждой страницы создаем
           поле header.title в котором находится строка состоящая из
           соответствующих title-ов всех родительских страниц начиная от корневой
           и заканчивая текущей страницей. title-ы страниц разделены символом "/".
        */
        return super.run(model, (page, pageTitlesMap) => {
            const urlSet = this.getParentUrls(page).reverse();
            _.chain(page)
                .set('header.title', urlSet.map(url => pageTitlesMap.get(url)).join('/'))
                .value();
        });
    }
}
