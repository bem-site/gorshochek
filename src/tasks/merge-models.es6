var _ = require('lodash'),
    deepDiff = require('deep-diff'),
    deepExtend = require('deep-extend');

import Base from './base';

const META = {
    module: _.pick(module, 'filename'),
    name: 'merge models'
};

export default class MergeModels extends Base {
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig, META);
    }

    static _generateUrlPageMap(arr) {
        return arr.reduce((prev, item) => {
            prev[item.url] = item;
            return prev;
        }, {});
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun(this.name);

        var newModel = model.getNewModel(),
            oldModel = model.getOldModel(),
            newPages,
            oldPages,
            addedPages,
            modifiedPages = [],
            nonModifiedPages = [],
            removedPages;

        /*
         Для массивов объектов из нового и старого файлов моделей
         вызываем метод _generateUrlPageMap, который строит из данных массивов
         объекты в которых ключами являются url страниц, а значениями сами объекты
         */
        newModel = MergeModels._generateUrlPageMap(newModel);
        oldModel = MergeModels._generateUrlPageMap(oldModel);

        newPages = _.keys(newModel); // получить все url из новой модели
        oldPages = _.keys(oldModel); // получить все url из старой модели

        /*
         Добавленные страницы можно получить вычислив разницу между массивом url из новой и старой моделей
         Для удаленных страницы наоборот надо вычислить разницу между массивом url из старой и новой моделей
         */
        addedPages = _.difference(newPages, oldPages);
        removedPages = _.difference(oldPages, newPages);

        removedPages.forEach(url => {
            this.logger.debug(`Page with url: ${url} was removed from model`);
            model.getChanges().pages.addRemoved({ url: url });
        }, this);

        // отбрасываем удаленные страницы
        oldPages = _.difference(oldPages, removedPages);

        /*
          страницы в старой модели делятся на 2 группы:
          1. Страницы мета-информация (набор полей в модели) для которых была изменена
          2. Страницы, которые остались неизменными
          Соответственно вычисляя глубокий diff делим старые страницы на 2 таких группы
         */
        oldPages.forEach(url => {
            deepDiff.diff(newModel[url], oldModel[url]) ?
                modifiedPages.push(url) : nonModifiedPages.push(url);
        });

        /*
        Начинаем строить финальный массив данных для обновленной модели
        Сначала добавляем как есть новые страницы, которых еще не было на сайте
        */
        // add new pages
        model.setPages(
            model.getPages().concat(addedPages.map(url => {
                this.logger.debug(`Page with url: ${url} was added to model`);
                model.getChanges().pages.addAdded({ url: url });
                return newModel[url];
            }, this))
        );

        // Добавляем те страницы, которые не были изменены
        // add non-modified pages
        model.setPages(
            model.getPages().concat(nonModifiedPages.map(url => {
                return oldModel[url];
            }))
        );

        // Добавляем измененные страницы, предварительно внедряя изменения которые
        // пришли и новой модели
        // merge modifications
        // add modified pages
        model.setPages(
            model.getPages().concat(modifiedPages.map(url => {
                this.logger.debug(`Page with url: ${url} was modified`);
                model.getChanges().pages.addModified({ url: url });
                return deepExtend(oldModel[url], newModel[url]);
            }, this))
        );

        this.logger.info('Models were merged successfully');
        return Promise.resolve(model);
    }
}
