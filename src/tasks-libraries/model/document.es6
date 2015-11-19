import path from 'path';
import Q from 'q';
import Base from './base';

/**
 * @exports
 * @class Document
 * @desc library document model class
 */
export default class Document extends Base {
    /**
     * Document constructor
     * @param {Object}    version data object
     * @param {String[]}  version.languages - array of languages
     * @param {String}    version.baseUrl - base libraries url
     * @param {String}    version.basePath - base path for libraries file inside cache folder
     * @param {String}    version.lib - name of library
     * @param {String}    version.version - name of library version
     * @param {String}    document - name of document
     * @constructor
     */
    constructor(version, document) {
        super();

        /**
         * Library version data object
         * @type {{languages: String[], baseUrl: String, basePath: String, lib: String, version: String}}
         */
        this.version = version;

        /**
         * Name of document
         * @type {String}
         */
        this.document = document;
    }

    /**
     * Returns title for document
     * @param {Object} data - document data object
     * @param {String} lang - language
     * @returns {String}
     */
    getTitle(data, lang) {
        const TITLES = {
            changelog: {en: 'Changelog', ru: 'История изменений'},
            migration: {en: 'Migration', ru: 'Миграция'},
            notes: {en: 'Release Notes', ru: 'Примечания к релизу'}
        };

        if(!data.title || !data.title[lang]) {
            return TITLES[this.document][lang];
        }

        return data.title[lang];
    }

    /**
     * Returns source url for document on github
     * @param {Object} data - document data object
     * @param {String} lang - language
     * @returns {String|Null}
     * @private
     */
    _getSourceUrl(data, lang) {
        if(!data.url || !data.url[lang]) {
            return null;
        }
        return data.url[lang];
    }

    /**
     * Saves document content into linked file
     * @param {Object} data - document data object
     * @returns {Promise}
     * @private
     */
    _setSource(data) {
        const {basePath, baseUrl, lib, version, languages} = this.version;
        const sourcePath = path.join(basePath, lib, version, this.document);
        const promises = languages.map(lang => {
            const filePath = path.join(sourcePath, `${lang}.html`);
            const contentFilePath = [baseUrl, lib, version, this.document, lang].join(path.sep) + '.html';
            const content = data.content ? data.content[lang] : null;

            if(!content) {
                this.setValue('published', false, lang);
            }

            return this.saveFile(filePath, content, false).then(() => {
                return this.setValue('contentFile', contentFilePath, lang);
            });
        });

        return Q.all(promises);
    }

    /**
     * Processes document data
     * @param {Object} data - document data object
     * @returns {Promise}
     */
    processData(data) {
        const version = this.version;

        this.setValue('url', [version.baseUrl, version.lib, version.version, this.document].join('/'))
            .setValue('aliases', []) // алиасы или редиректы
            .setValue('view', 'post') // представление
            .setValue('lib', version.lib) // название библиотеки
            .setValue('version', version.version) // название версии библиотеки
            .setValue('document', this.document); // имя уровня переопредления WTF?

        version.languages.forEach(lang => {
            this.setValue('title', this.getTitle(data, lang), lang) // имя уровня переопределения
                .setValue('published', true, lang) // флаг о том что страница опубликована
                .setValue('updateDate', +(new Date()), lang); // дата обновления

            this.setValue('sourceUrl', this._getSourceUrl(data, lang), lang);
        });

        return this._setSource(data).then(this.getData.bind(this));
    }
}
