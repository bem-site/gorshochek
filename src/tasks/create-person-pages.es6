var path = require('path'),
    _ = require('lodash'),
    fsExtra = require('fs-extra');

import Base from './base';

const META = {
    module: _.pick(module, 'filename'),
    name: 'create person page'
};

export default class CreatePersonPages extends Base {
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig, META);
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun(this.name);

        var baseUrl = this.getTaskConfig().baseUrl,
            type = this.getTaskConfig().type,
            ids = {
                authors: model.getMeta().getAuthors(),
                translators: model.getMeta().getTranslators()
            }[type],
            pagesHash = {};

        this.logger.debug(`Create ${type} pages with base url: ${baseUrl}`);

        this.getBaseConfig().getLanguages().forEach(lang => {
            for (let personId of ids[lang].values()) {
                this.logger.verbose(`create person page: ${personId} for language: ${lang}`);

                pagesHash[personId] = pagesHash[personId] || {
                    url: `${baseUrl}/${personId}`,
                    oldUrls: [],
                    view: type.replace(/s$/, '')
                };
                let person = model.getPeople().getByIdAndLang(personId, lang);
                pagesHash[personId][lang] = _.extend({}, person,
                    { title: model.getPeople().getFullNameByIdAndLang(personId, lang) });
            }
        });

        this.logger.debug(`pages for ${type} were successfully created`);

        model.setPages(model.getPages().concat(_.values(pagesHash)));
        return Promise.resolve(model);
    }
}
