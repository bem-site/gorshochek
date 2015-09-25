var _ = require('lodash'),
    path = require('path'),
    fsExtra = require('fs-extra');

import Base from './../src/tasks/base';
import Meta from '../src/model/meta';

const META = {
    module: _.pick(module, 'filename'),
    name: 'collect meta-data'
};

export default class CollectMeta extends Base {
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

        /**
         * Со всех объектов в модели нужно собрать наборы id авторов, переводчиков а также теги
         * При этом все наборы разделены по языкам, например:
         * authors = {
         *  en: [id1, id2, ...],
         *  ru: [id1, id2, ...]
         * }
         * Используя полученные данные сохраняем собранные данные в отдельный файл ./cache/meta.json
         */
        var cacheDir = this.getBaseConfig().getCacheDirPath(),
            filePath = path.join(cacheDir, Meta.getFileName()),
            authors = this._initializeMetaStructure(),
            translators = this._initializeMetaStructure(),
            tags = this._initializeMetaStructure();

        // для каждой страницы
        model.getPages().forEach(page => {
            // для каждого языка
            this.getBaseConfig().getLanguages().forEach(lang => {
                page[lang].authors.forEach(item => { authors[lang].add(item); });
                page[lang].translators.forEach(item => { translators[lang].add(item); });
                page[lang].tags.forEach(item => { tags[lang].add(item); });
            });
        });

        // выводим итоги о собранной информации в консоль
        this.logger.debug('Meta information from model was collected');
        this.getBaseConfig().getLanguages().forEach(lang => {
            this.logger.debug(`Number of authors for lang ${lang} ==> ${authors[lang].size}`);
            this.logger.debug(`Number of translators for lang ${lang} ==> ${translators[lang].size}`);
            this.logger.debug(`Number of tags for lang ${lang} ==> ${tags[lang].size}`);
        });

        // сохраняем файл с собранной мета-информацией
        Meta.save(filePath, authors, translators, tags);
        return Promise.resolve(model);
    }
}

