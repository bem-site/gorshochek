var path = require('path'),
    _ = require('lodash'),
    fsExtra = require('fs-extra');

import Base from './base';
import Meta from '../model/meta';

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

        /*
         * Задача этого модуля - добавление к массиву страниц набора страниц тегов.
         * Создаются объекты моделей страниц с уникальными урлами построенными по правилу /{baseUrl}/{tag},
         * где baseUrl - базовый урл, который задается в конфигурации модуля, а tag - название тега.
         */
        var cacheDir = this.getBaseConfig().getCacheDirPath(),
            metaFilePath = path.join(cacheDir, Meta.getFileName()),
            baseUrl = this.getTaskConfig().baseUrl,
            type = 'tags',
            meta = Meta.init(metaFilePath),
            tags = meta.getTags(),
            pagesMap = new Map();

        this.logger.debug(`Create ${type} pages with base url: ${baseUrl}`);

        // проводим итерацию по всем языкам в конфигурации
        // внутри во вложенном цикле перебираем все теги
        // собранные модулем "collect-meta"
        this.getBaseConfig().getLanguages().forEach(lang => {
            tags[lang].forEach(tag => {
                this.logger.verbose(`create person page: ${tag} for language: ${lang}`);

                pagesMap.set(tag, {
                    url: `${baseUrl}/${tag}`,
                    oldUrls: [],
                    view: type.replace(/s$/, '')
                });
                pagesMap.get(tag)[lang] = _.extend({}, { title: tag });
            });
        });

        this.logger.debug(`pages for ${type} were successfully created`);

        // добавляем сгенерированне страницы к массиву общих страниц
        model.setPages(model.getPages().concat(pagesMap.values()));
        return Promise.resolve(model);
    }
}

