var path = require('path'),
    _ = require('lodash'),
    fsExtra = require('fs-extra');

import Base from './base';

const META = {
    module: _.pick(module, 'filename'),
    name: 'create tag page'
};

export default class CreateTagPages extends Base {
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
            type = 'tags',
            tags = model.getMeta().getTags(),
            pagesHash = {};

        this.logger.debug(`Create ${type} pages with base url: ${baseUrl}`);

        this.getBaseConfig().getLanguages().forEach(lang => {
            for (let tag of tags[lang].values()) {
                this.logger.verbose(`create person page: ${tag} for language: ${lang}`);

                pagesHash[tag] = pagesHash[tag] || {
                    url: `${baseUrl}/${tag}`,
                    oldUrls: [],
                    view: type.replace(/s$/, '')
                };
                pagesHash[tag][lang] = _.extend({}, { title: tag });
            }
        });

        this.logger.debug(`pages for ${type} were successfully created`);

        model.setPages(model.getPages().concat(_.values(pagesHash)));
        return Promise.resolve(model);
    }
}

