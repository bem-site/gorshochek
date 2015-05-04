var vow = require('vow'),
    inherit = require('inherit'),
    Base = require('./base');

module.exports = inherit(Base, {

    logger: undefined,

    __constructor: function (baseConfig, taskConfig) {
        this.__base(baseConfig, taskConfig);
        this.logger = this.createLogger(module);
        this.logger.info('Initialize "%s" task successfully', this.getName());
    },

    /**
     * Returns name of current task
     * @returns {string} - name of task
     */
    getName: function () {
        return 'analyze model';
    },

    /**
     * Performs task
     * @returns {Promise}
     */
    run: function (model) {
        this.logger.info('Start to execute "%s" task', this.getName());

        var languages = this.getBaseConfig().getLanguages();
        model.setCommonPages(model.getCommonPages().map(function (item) {
            return this._analyzePage(item, languages);
        }, this));
        return vow.resolve(model);
    },

    _analyzePage: function (page, languages) {
        this.logger.debug('Analyze page with url: %s', page.url);

        page.oldUrls = page.oldUrls || [];
        page.view = page.view || 'post';

        languages.forEach(function (language) {
            if (page[language].published !== false) {
                page[language].published = true;
            }

            if (!page[language].title) {
                this.logger.warn(
                    'Page with url %s hasn\'t title for language %s. It will be hidden.', page.url, language);
                page[language].published = false;
            }

            page[language].authors = page[language].authors || [];
            page[language].translators = page[language].translators || [];
            page[language].tags = page[language].tags || [];
        }, this);

        return page;
    }
});
