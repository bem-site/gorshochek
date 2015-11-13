import path from 'path';
import Q from 'q';
import Base from './base';
import Document from './document';
import Level from './level';

/**
 * @exports
 * @class Version
 * @desc version library model class
 */
export default class Version extends Base {
    /**
     * Version constructor
     * @param {String} baseUrl - base libraries url
     * @param {String} basePath - base path for libraries file inside cache folder
     * @param {String} lib - name of library
     * @param {String} version - name of library version
     * @param {String[]} languages - array of languages
     * @constructor
     */
    constructor(baseUrl, basePath, lib, version, languages) {
        super();

        /**
         * Base url for all libraries pages
         * @type {String}
         */
        this.baseUrl = baseUrl;

        /**
         * Base path on cache folder for all libraries data files
         * @type {String}
         */
        this.basePath = basePath;

        /**
         * Array of languages
         * @type {String[]}
         */
        this.languages = languages;

        /**
         * Name of library
         * @type {String}
         */
        this.lib = lib;

        /**
         * Name of library version
         * @type {String}
         */
        this.version = version.replace(/\//g, '-');
    }

    /**
     * Returns source urls per languages
     * @param {Object} data - document data object
     * @param {String[]} languages array
     * @returns {*}
     * @private
     */
    _getSourceUrls(data, languages) {
        const defaultLanguage = languages[0];
        let result = languages.reduce((prev, item) => {
                prev[item] = null;
                return prev;
            }, {});

        if(!data.url) {
            return result;
        }

        result = languages.reduce((prev, item) => {
            prev[item] = `${data.url}/tree/${data.ref}`;
            if(item !== defaultLanguage) {
                prev[item] += `/README.${item}.md`;
            }
            return prev;
        }, result);
        return result;
    }

    _setSource(data) {
        const readme = data.docs ? data.docs['readme'] : data['readme'];
        const basePath = path.join(this.basePath, this.lib, this.version);
        const promises = this.languages.map((lang) => {
            const filePath = path.join(basePath, `${lang}.html`);
            const content = (readme && readme.content) ? readme.content[lang] : null;

            return this.saveFile(filePath, content, false).then(() => {
                return this.setValue('contentFile',
                    [this.baseUrl, this.lib, this.version, lang].join(path.sep) + '.html', lang);
            });
        });

        return Q.all(promises);
    }

    /**
     * Processes all library version documents
     * @param {Object} data - library version data object
     * @returns {Promise}
     * @private
     */
    _processDocuments(data) {
        const documents = data['docs'];
        let promises = [];

        if(!documents) {
            return Promise.resolve(promises);
        }

        promises = Object.keys(documents)
            .filter(item => {
                return item !== 'readme';
            })
            .map(item => {
                return (new Document(this, item)).processData(documents[item]);
            });

        return Q.all(promises);
    }

    /**
     * Processes all block levels
     * @param {Object} data - library version data object
     * @returns {Promise}
     * @private
     */
    _processLevels(data) {
        const levels = data['levels'];

        if(!levels || !levels.length) {
            return Promise.resolve([]);
        }

        return Q.all(levels.map(level => {
            return (new Level(this, level.name).processData(level));
        }));
    }

    /**
     * Saves json content into file in cache folder
     * @param {Object} content data object
     * @returns {Promise}
     * @private
     */
    _saveToCache(content) {
        return this.saveFile(path.join(this.basePath, this.lib, this.version, 'cache.json'), content, true);
    }

    /**
     * Processes version data
     * @param {Object} data - version data object
     * @returns {Promise}
     */
    processData(data) {
        const sourceUrls = this._getSourceUrls(data, this.languages);

        this.setValue('url', `${this.baseUrl}/${this.lib}/${this.version}`)
            .setValue('aliases', []) // алиасы или редиректы
            .setValue('view', 'post') // представление
            .setValue('lib', this.lib) // название библиотеки
            .setValue('version', this.version) // название версии библиотеки
            .setValue('deps', data.deps); // зависимости

        this.languages.forEach(lang => {
            this.setValue('title', this.version, lang)
                .setValue('published', true, lang) // флаг о том что страница опубликована
                .setValue('updateDate', +(new Date()), lang) // дата обновления
                .setValue('hasIssues', data.hasIssues, lang) // флаг того, что репозиторий биб-теки имеет раздел issues
                .setValue('sourceUrl', sourceUrls[lang], lang);
        });

        return this._setSource(data)
            .then(() => {
                return Q.all([
                    this._processDocuments(data),
                    this._processLevels(data)
                ]);
            })
            .spread((documents, levels) => {
                return [this.getData()]
                    .concat(documents)
                    .concat(levels);
            })
            .then(this._saveToCache.bind(this));
    }
}
