var _ = require('lodash');
import Base from './base';

const META = {
    module: _.pick(module, 'filename'),
    name: 'analyze model'
};

export default class AnalyzeModel extends Base {
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig, META);
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun(this.name);

        var languages = this.getBaseConfig().getLanguages();
        model.setCommonPages(model.getCommonPages().map(item => {
            return this._analyzePage(item, languages);
        }, this));
        return Promise.resolve(model);
    }

    /**
     *
     * @param {Object} page - object in model
     * @param {Array} languages - array of configured languages
     * @returns {*}
     * @private
     */
    _analyzePage(page, languages) {
        this.logger.debug(`Analyze page with url: ${page.url}`);
        
        /**
         * В каждом объекте модели есть одно обязательное поле url
         * Для остальных полей нужно провести проверку и выставить значения по умолчанию
         *
         */
        page.oldUrls = page.oldUrls || []; // массив старых урлов
        page.view = page.view || 'post'; // поле представления страницы

        languages.forEach(language => {
            if (page[language].published !== false) {
                page[language].published = true; // флаг видимости страницы
            }

            // каждый языковой вариант страницы должен иметь обязательное поле "title"
            // в противном случае, скрываем страницу из показа
            if (!page[language].title) {
                this.logger.warn(
                    `Page with url ${page.url} hasn\'t title for language ${language}. It will be hidden.`);
                page[language].published = false;
            }

            // выставляем мета-информацию об авторов если она не была указана
            page[language].authors = page[language].authors || [];

            // выставляем мета-информацию о переводчиках если она не была указана
            page[language].translators = page[language].translators || [];

            // выставляем мета-информацию о тегах если она не была указана
            page[language].tags = page[language].tags || [];
        }, this);

        return page;
    }
}
