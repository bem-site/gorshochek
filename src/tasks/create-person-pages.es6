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

        /*
         * Задача этого модуля - добавление к массиву страниц набора страниц авторов или переводчиков
         * в зависимости от конфигурации модуля. Создаются объекты моделей страниц с
         * уникальными урлами построенными по правилу /{baseUrl}/{personId}, где baseUrl - базовый
         * урл, который задается в конфигурации модуля, а personId - уникальный идентификатор человека
         * из файла people.json.
         */
        var baseUrl = this.getTaskConfig().baseUrl,
            type = this.getTaskConfig().type,
            ids = {
                authors: model.getMeta().getAuthors(),
                translators: model.getMeta().getTranslators()
            }[type],
            pagesHash = {};

        this.logger.debug(`Create ${type} pages with base url: ${baseUrl}`);

        // проводим итерацию по всем языкам в конфигурации
        // внутри во вложенном цикле перебираем все id авторов (или переводчиков)
        // собранные модулем "collect-meta"
        this.getBaseConfig().getLanguages().forEach(lang => {
            for (let personId of ids[lang].values()) {
                this.logger.verbose(`create person page: ${personId} for language: ${lang}`);

                pagesHash[personId] = pagesHash[personId] || {
                    url: `${baseUrl}/${personId}`,
                    oldUrls: [],
                    view: type.replace(/s$/, '') // убираем концевую 's' из type (authors -> author)
                };

                // выбираем данные по человеку из модели людей (people.json) по
                // по уникальному id человека и локали
                let person = model.getPeople().getByIdAndLang(personId, lang);
                pagesHash[personId][lang] = _.extend({}, person,
                    { title: model.getPeople().getFullNameByIdAndLang(personId, lang) });
            }
        });

        this.logger.debug(`pages for ${type} were successfully created`);

        // добавляем сгенерированне страницы к массиву общих страниц
        model.setPages(model.getPages().concat(_.values(pagesHash)));
        return Promise.resolve(model);
    }
}
