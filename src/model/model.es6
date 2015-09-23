import _ from 'lodash';
import deepDiff from 'deep-diff';
import deepExtend from 'deep-extend';
import Changes from './changes/index';

export default class Model {

    constructor() {
        this._changes = new Changes();
        this._pages = [];
    }

    static _generateUrlPageMap(arr) {
        return arr.reduce((prev, item) => {
            prev[item.url] = item;
            return prev;
        }, {});
    }

    /**
     * Returns new model object
     * @returns {Object}
     */
    getNewModel() {
        return this._newModel;
    }

    /**
     * Sets new model
     * @param {Object} model object
     */
    setNewModel(model) {
        this._newModel = model;
    }

    /**
     * Returns old model object
     * @returns {Object}
     */
    getOldModel() {
        return this._oldModel;
    }

    /**
     * Sets old model object
     * @param {Object} model object
     */
    setOldModel(model) {
        this._oldModel = model;
    }

    /**
     * Returns changes model
     * @returns {*}
     */
    getChanges() {
        return this._changes;
    }

    /**
     * Returns array of pages
     * @returns {Array|*}
     */
    getPages() {
        return this._pages;
    }

    /**
     * Sets array of pages
     * @param {Array} pages array
     * @returns {Model}
     */
    setPages(pages) {
        this._pages = pages;
        return this;
    }

    /**
     * Merges models and find differences
     */
    merge() {
        let newModel;
        let oldModel;
        let newPages;
        let oldPages;
        let addedPages;
        const modifiedPages = [];
        const nonModifiedPages = [];
        let removedPages;

        /*
         Для массивов объектов из нового и старого файлов моделей
         вызываем метод _generateUrlPageMap, который строит из данных массивов
         объекты в которых ключами являются url страниц, а значениями сами объекты
         */
        newModel = this.constructor._generateUrlPageMap(this.getNewModel());
        oldModel = this.constructor._generateUrlPageMap(this.getOldModel());

        newPages = _.keys(newModel); // получить все url из новой модели
        oldPages = _.keys(oldModel); // получить все url из старой модели

        /*
         Добавленные страницы можно получить вычислив разницу между массивом url из новой и старой моделей
         Для удаленных страницы наоборот надо вычислить разницу между массивом url из старой и новой моделей
         */
        addedPages = _.difference(newPages, oldPages);
        removedPages = _.difference(oldPages, newPages);

        removedPages.forEach(url => {
            this.getChanges().pages.addRemoved({type: 'page', url});
        });

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
        this.setPages(
            this.getPages().concat(addedPages.map(url => {
                this.getChanges().pages.addAdded({type: 'page', url});
                return newModel[url];
            }))
        );

        // Добавляем те страницы, которые не были изменены
        // add non-modified pages
        this.setPages(
            this.getPages().concat(nonModifiedPages.map(url => {
                return oldModel[url];
            }))
        );

        // Добавляем измененные страницы, предварительно внедряя изменения которые
        // пришли и новой модели
        // merge modifications
        // add modified pages
        this.setPages(
            this.getPages().concat(modifiedPages.map(url => {
                this.getChanges().pages.addModified({type: 'page', url});
                return deepExtend(oldModel[url], newModel[url]);
            }, this))
        );
    }

    normalize(languages) {
        /**
         *
         * @param {Object} page - object in model
         * @param {String[]} languages - array of configured languages
         * @returns {Object} page
         */
        const normalizePage = (page, languages) => {
            /**
             * В каждом объекте модели есть одно обязательное поле url
             * Для остальных полей нужно провести проверку и выставить значения по умолчанию
             *
             */
            page.oldUrls = page.oldUrls || []; // массив старых урлов
            page.view = page.view || 'post'; // поле представления страницы

            languages.forEach(language => {
                // флаг видимости страницы
                page[language].published = !!page[language].published;

                // каждый языковой вариант страницы должен иметь обязательное поле "title"
                // в противном случае, скрываем страницу из показа
                if(!page[language].title) {
                    page[language].published = false;
                }
            }, this);

            return page;
        };

        this.setPages(this.getPages().map(item => {
            return normalizePage(item, languages);
        }));
    }
}
