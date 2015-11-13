import path from 'path';
import Q from 'q';
import Base from './base';

/**
 * @exports
 * @class Block
 * @desc block library model class
 */
export default class Block extends Base {
    /**
     * Block constructor
     * @param {Object} level data object
     * @param {Object} level.version - version object
     * @param {String} level.level - name of block level
     * @param {String} block - name of block
     * @constructor
     */
    constructor(level, block) {
        super();

        /**
         * Level data object
         * @type {{version: Object, level: String}}
         */
        this.level = level;

        /**
         * Name of block
         * @type {String}
         */
        this.block = block;
    }

    /**
     * Transforms block documentation data into common format
     * @param {Object} blockDocumentation - block documentation object
     * @param {String} lang - language
     * @returns {Object}
     * @private
     */
    _rectifyBlockDocumentation(blockDocumentation, lang) {
        blockDocumentation = blockDocumentation || null;
        // TODO реализовать выпрямление данных документации здесь
        // TODO оставить только данные для языка lang
        lang;
        return blockDocumentation;
    }

    /**
     * Transforms block jsdoc data into common format
     * @param {Object|String} blockJSDocumentation - block jsdoc object
     * @param {String} lang - language
     * @returns {Object}
     * @private
     */
    _rectifyBlockJSDocumentation(blockJSDocumentation, lang) {
        blockJSDocumentation = blockJSDocumentation || null;
        // TODO реализовать выпрямление данных jsdoc здесь
        // TODO оставить только данные для языка lang
        lang;
        return blockJSDocumentation;
    }

    /**
     * Saves block documentation and jsdoc data into linked files
     * @param {Object} data - block data object
     * @returns {Promise}
     * @private
     */
    _setSource(data) {
        const {basePath, baseUrl, lib, version, languages} = this.level.version;
        const sourcePath = path.join(basePath, lib, version, this.level.level, this.block);
        const promises = languages.map(lang => {
            const filePath = path.join(sourcePath, `${lang}.json`);
            const contentFilePath = [baseUrl, lib, version,
                    this.level.level, this.block, lang].join(path.sep) + '.json';
            return Q({
                    data: this._rectifyBlockDocumentation(data.data, lang),
                    jsdoc: this._rectifyBlockJSDocumentation(data.jsdoc, lang)
                })
                .then(content => this.saveFile(filePath, content, true))
                .then(() => this.setValue('contentFile', contentFilePath, lang));
        });

        return Q.all(promises);
    }

    /**
     * Processes block data
     * @param {Object} data - block data object
     * @returns {Promise}
     */
    processData(data) {
        const {baseUrl, lib, version, languages} = this.level.version;

        this.setValue('url', [baseUrl, lib, version, this.level.level, this.block].join('/'))
            .setValue('aliases', []) // алиасы или редиректы
            .setValue('view', 'block') // представление
            .setValue('lib', lib) // название библотеки
            .setValue('version', version) // название версии (ветки, тега, pr)
            .setValue('level', this.level.level) // название уровня переопредления
            .setValue('block', this.block); // имя блока

        languages.forEach(lang => {
            this.setValue('title', this.block, lang) // имя блока
                .setValue('published', true, lang) // флаг о том что страница опубликована
                .setValue('updateDate', +(new Date()), lang); // дата обновления
        });
        return this._setSource(data).then(this.getData.bind(this));
    }
}
