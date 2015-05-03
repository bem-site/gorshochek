var _ = require('lodash'),
    vow = require('vow'),
    inherit = require('inherit'),
    deepDiff = require('deep-diff'),
    deepExtend = require('deep-extend'),
    Model = require('../model/model.js'),
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
        return 'merge models';
    },

    _generateUrlPageMap: function (arr) {
        return arr.reduce(function (prev, item) {
            prev[item.url] = item;
            return prev;
        }, {});
    },

    /**
     * Performs task
     * @returns {Promise}
     */
    run: function (data) {
        var newModel = data.newModel,
            oldModel = data.oldModel,
            newPages,
            oldPages,
            addedPages,
            modifiedPages = [],
            nonModifiedPages = [],
            removedPages,
            resultModel = new Model();

        this.logger.info('Start to execute "%s" task', this.getName());

        /*
         Для массивов объектов из нового и старого файлов моделей
         вызываем метод _generateUrlPageMap, который строит из данных массивов
         объекты в которых ключами являются url страниц, а значениями сами объекты
         */
        newModel = this._generateUrlPageMap(newModel);
        oldModel = this._generateUrlPageMap(oldModel);

        newPages = _.keys(newModel); // получить все url из новой модели
        oldPages = _.keys(oldModel); // получить все url из старой модели

        /*
         Добавленные страницы можно получить вычислив разницу между массивом url из новой и старой моделей
         Для удаленных страницы наоборот надо вычислить разницу между массивом url из старой и новой моделей
         */
        addedPages = _.difference(newPages, oldPages);
        removedPages = _.difference(oldPages, newPages);

        removedPages.forEach(function (url) {
            this.logger.debug('Page with url: %s was removed from model', url);
            resultModel.getChanges().pages.addRemoved({ url: url });
        }, this);

        // отбрасываем удаленные страницы
        oldPages = _.without(oldPages, removedPages);

        /*
          страницы в старой модели делятся на 2 группы:
          1. Страницы мета-информация (набор полей в модели) для которых была изменена
          2. Страницы, которые остались неизменными
          Соответственно вычисляя глубокий diff делим старые страницы на 2 таких группы
         */
        oldPages.forEach(function (url) {
            deepDiff.diff(newModel[url], oldModel[url]) ?
                modifiedPages.push(url) : nonModifiedPages.push(url);
        });

        /*
        Начинаем строить финальный массив данных для обновленной модели
        Сначала добавляем как есть новые страницы, которых еще не было на сайте
        */
        // add new pages
        resultModel.setCommonPages(
            resultModel.getCommonPages().concat(addedPages.map(function (url) {
                this.logger.debug('Page with url: %s was added to model', url);
                resultModel.getChanges().pages.addAdded({ url: url });
                return newModel[url];
            }, this))
        );

        // Добавляем те страницы, которые не были изменены
        // add non-modified pages
        resultModel.setCommonPages(
            resultModel.getCommonPages().concat(nonModifiedPages.map(function (url) {
                return oldModel[url];
            }))
        );

        // Добавляем измененные страницы, предварительно внедряя изменения которые
        // пришли и новой модели
        // merge modifications
        // add modified pages
        resultModel.setCommonPages(
            resultModel.getCommonPages().concat(modifiedPages.map(function (url) {
                this.logger.debug('Page with url: %s was modified', url);
                resultModel.getChanges().pages.addModified({ url: url });
                return deepExtend(oldModel[url], newModel[url]);
            }, this))
        );

        this.logger.info('Models were merged successfully');
        return vow.resolve(resultModel);
    }
});
