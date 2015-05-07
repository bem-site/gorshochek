var _ = require('lodash'),
    path = require('path'),
    fsExtra = require('fs-extra');

import Base from './base';

const META = {
    module: _.pick(module, 'filename'),
    name: 'collect meta-data'
};

export default class LoadModelFiles extends Base {
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig, META);
    }

    _initializeMetaStructure() {
        return this.getBaseConfig().getLanguages().reduce((prev, lang) => {
            prev[lang] = new Set();
            return prev;
        }, {});
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun(this.name);

        var authors = this._initializeMetaStructure(),
            translators = this._initializeMetaStructure(),
            tags = this._initializeMetaStructure();

        model.getCommonPages().forEach(page => {
            this.getBaseConfig().getLanguages().forEach(lang => {
                page[lang].authors.forEach(item => { authors[lang].add(item); });
                page[lang].translators.forEach(item => { translators[lang].add(item); });
                page[lang].tags.forEach(item => { tags[lang].add(item); });
            });
        });

        this.logger.debug('Meta information from model was collected');
        this.getBaseConfig().getLanguages().forEach(lang => {
            this.logger.debug(`Number of authors for lang ${lang} ==> ${authors[lang].size}`);
            this.logger.debug(`Number of translators for lang ${lang} ==> ${translators[lang].size}`);
            this.logger.debug(`Number of tags for lang ${lang} ==> ${tags[lang].size}`);
        });

        model.initMeta(authors, translators, tags);
        return Promise.resolve(model);
    }
}

