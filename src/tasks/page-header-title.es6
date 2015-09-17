import PageBase from './page-base';

export default class PageHeaderTitle extends PageBase {

    static getLoggerName() {
        return module;
    }

    /**
     * Return task human readable description
     * @returns {string}
     */
    static getName() {
        return 'create page titles';
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
           поле header.title в котором находится строка состоящая из
           соответствующих title-ов всех родительских страниц начиная от корневой
           и заканчивая текущей страницей. title-ы страниц разделены символом "/".
        */
        model.getPages().forEach(page => {
            const urlSet = this.getParentUrls(page).reverse();
            languages.forEach(language => {
                if(page[language]) {
                    page[language].header = page[language].header || {};
                    page[language].header.title = urlSet.map(url => {
                        return pagesMap.get(url).get(language);
                    }).join('/');

                    this.logger.verbose(
                        `page header title: url => ${page.url} lang => ${language} title: => ${page[language].header.title}`);
                }
            });
        });

        this.logger.info(`Successfully finish task "${this.constructor.getName()}"`);
        return Promise.resolve(model);
    }
}




