import PageBase from './page-base';

export default class PageHeaderMeta extends PageBase {

    static getLoggerName() {
        return module;
    }

    /**
     * Return task human readable description
     * @returns {string}
     */
    static getName() {
        return 'create page header meta-information';
    }

    /**
     * Add header meta-information data to page
     * @param {Object} page - page model object
     * @param {String} language
     * @private
     */
    _addMetaToPage(page, language) {
        const p = page[language];
        const getKeywords = _p => {
            return _p.tags ? _p.tags.join(', ') : '';
        };

        if(!p) {
            return;
        }
        p.header = p.header || {};
        p.header.meta = {
            ogUrl: page.url,
            ogType: 'article',
            description: p.title,
            ogDescription: p.title,
            keywords: getKeywords(p),
            ogKeywords: getKeywords(p)
        };
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun();

        const languages = this.getBaseConfig().getLanguages();

        /*
         Для каждой языковой версии каждой страницы создаем
         поле header.meta в котором находится структура содержащая мета-информацию для header страницы.
          - ogUrl
          - ogType
          - description
          - ogDescription
          - keywords
          - ogKeywords
         */
        model.getPages().forEach(page => {
            languages.forEach(language => {
                this._addMetaToPage(page, language);
            });
        });

        this.logger.info(`Successfully finish task "${this.constructor.getName()}"`);
        return Promise.resolve(model);
    }
}





