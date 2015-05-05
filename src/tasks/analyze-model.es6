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

    _analyzePage(page, languages) {
        this.logger.debug(`Analyze page with url: ${page.url}`);

        page.oldUrls = page.oldUrls || [];
        page.view = page.view || 'post';

        languages.forEach(language => {
            if (page[language].published !== false) {
                page[language].published = true;
            }

            if (!page[language].title) {
                this.logger.warn(
                    `Page with url ${page.url} hasn\'t title for language ${language}. It will be hidden.`);
                page[language].published = false;
            }

            page[language].authors = page[language].authors || [];
            page[language].translators = page[language].translators || [];
            page[language].tags = page[language].tags || [];
        }, this);

        return page;
    }
}
