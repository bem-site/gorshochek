'use strict';

import _ from 'lodash';
import deepDiff from 'deep-diff';
import deepExtend from 'deep-extend';
import Changes from './changes';

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
     * @param {Array} previousModel
     * @param {Array} currentModel
     * @returns {Model}
     */
    merge(previousModel, currentModel) {
        const modifiedPages = [];
        const nonModifiedPages = [];

        /*
         Для массивов объектов из нового и старого файлов моделей
         вызываем метод _generateUrlPageMap, который строит из данных массивов
         объекты в которых ключами являются url страниц, а значениями сами объекты
         */
        const newModel = this.constructor._generateUrlPageMap(currentModel);
        const oldModel = this.constructor._generateUrlPageMap(previousModel);

        const newPages = _.keys(newModel); // получить все url из новой модели
        let oldPages = _.keys(oldModel); // получить все url из старой модели

        /*
         Добавленные страницы можно получить вычислив разницу между массивом url из новой и старой моделей
         Для удаленных страницы наоборот надо вычислить разницу между массивом url из старой и новой моделей
         */
        const addedPages = _.difference(newPages, oldPages);
        const removedPages = _.difference(oldPages, newPages);

        removedPages.forEach(url => {
            this.getChanges().addRemoved({type: 'page', url});
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
                this.getChanges().addAdded({type: 'page', url});
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
                this.getChanges().addModified({type: 'page', url});
                return deepExtend(oldModel[url], newModel[url]);
            }, this))
        );
        return this;
    }

    normalize() {
        /**
         *
         * @param {Object} page - object in model
         * @returns {Object} page
         */
        const normalizePage = (page) => {
            /**
             * В каждом объекте модели есть одно обязательное поле url
             * Для остальных полей нужно провести проверку и выставить значения по умолчанию
             *
             */
            page.aliases = page.aliases || []; // массив алиасов
            page.view = page.view || 'post'; // поле представления страницы
            page.published = !!page.published;

            if(!page.title) {
                page.published = false;
            }
            return page;
        };

        this.setPages(this.getPages().map(normalizePage));
        return this;
    }

    /**
     * Returns pages with anyone language version satisfy getCriteria function criteria
     * @param {Function} criteria function
     * @returns {Array} filtered array of pages
     * @public
     */
    getPagesByCriteria(criteria) {
        return this.getPages().filter(criteria);
    }
}
