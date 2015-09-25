var path = require('path'),
    _ = require('lodash'),
    fsExtra = require('fs-extra');

import Base from './../src/tasks/base';
import Meta from '../src/model/meta';
import People from '../src/model/people';

const META = {
    module: _.pick(module, 'filename'),
    name: 'create person page'
};

export default class CreatePersonPages extends Base {
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig, META);
    }

    _arrayFromMap(m) {
        var arr = [];
        for (let value of m.values()) {
            arr.push(value);
        }
        return arr;
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
        var cacheDir = this.getBaseConfig().getCacheDirPath(),
            metaFilePath = path.join(cacheDir, Meta.getFileName()),
            peopleFilePath = path.join(cacheDir, People.getFileName()),
            baseUrl = this.getTaskConfig().baseUrl,
            type = this.getTaskConfig().type,
            meta = Meta.init(metaFilePath),
            people = People.init(peopleFilePath),
            pagesMap = new Map(),
            ids = { authors: meta.getAuthors(), translators: meta.getTranslators() }[type];

        this.logger.debug(`Create ${type} pages with base url: ${baseUrl}`);

        // проводим итерацию по всем языкам в конфигурации
        // внутри во вложенном цикле перебираем все id авторов (или переводчиков)
        // собранные модулем "collect-meta"
        this.getBaseConfig().getLanguages().forEach(lang => {
            ids[lang].forEach(personId => {
                this.logger.verbose(`create person page: ${personId} for language: ${lang}`);

                pagesMap.set(personId, {
                    url: `${baseUrl}/${personId}`,
                    oldUrls: [],
                    view: type.replace(/s$/, '') // убираем концевую 's' из type (authors -> author)
                });

                // выбираем данные по человеку из модели людей (people.json) по
                // по уникальному id человека и локали
                let person = people.getByIdAndLang(personId, lang);
                pagesMap.get(personId)[lang] = _.extend({}, person,
                    { published: true, title: people.getFullNameByIdAndLang(personId, lang) });
            });
        });

        this.logger.debug(`pages for ${type} were successfully created`);

        // добавляем сгенерированне страницы к массиву общих страниц
        model.setPages(model.getPages().concat(this._arrayFromMap(pagesMap)));
        return Promise.resolve(model);
    }
}
