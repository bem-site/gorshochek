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
           Для каждой языковой версии каждой страницы создаем
           поле header.title в котором находится строка состоящая из
           соответствующих title-ов всех родительских страниц начиная от корневой
           и заканчивая текущей страницей. title-ы страниц разделены символом "/".
        */
        return super.run(model, (page, languages, pageTitlesMap) => {
            const urlSet = this.getParentUrls(page).reverse();
            languages.forEach(language => {
                page[language] && _.chain(page)
                    .get(language)
                    .set('header.title', urlSet.map(url => {
                        return pageTitlesMap.get(url).get(language);
                    }).join('/'))
                    .value();
            });
        });
    }
}
