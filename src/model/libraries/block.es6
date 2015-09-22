import path from 'path';
import vow from 'vow';
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
        const version = this.level.version;
        const basePath = path.join(version.basePath, version.lib, version.version, this.level.level, this.block);
        const blockDoc = data.data || null;
        const blockJSDoc = data.jsdoc || null;
        const promises = version.languages.map(lang => {
            const filePath = path.join(basePath, `${lang}.json`);
            const content = {
                data: this._rectifyBlockDocumentation(blockDoc, lang),
                jsdoc: this._rectifyBlockJSDocumentation(blockJSDoc, lang)
            };

            return this.saveFile(filePath, content, true)
                .then(() => {
                    return this.setValue('contentFile',
                        path.sep + [version.baseUrl, version.lib, version.version,
                            this.level.level, this.block, lang].join(path.sep) + '.json', lang);
                });
        });

        return vow.all(promises);
    }

    /**
     * Processes block data
     * @param {Object} data - block data object
     * @returns {Promise}
     */
    processData(data) {
        const v = this.level.version;

        this.setValue('url', [v.baseUrl, v.lib, v.version, this.level.level, this.block].join('/'))
            .setValue('aliases', []) // алиасы или редиректы
            .setValue('view', 'block') // представление
            .setValue('lib', v.lib) // название библотеки
            .setValue('version', v.version) // название версии (ветки, тега, pr)
            .setValue('level', this.level.level) // навзание уровня переопредления
            .setValue('block', this.block); // имя блока

        v.languages.forEach(lang => {
            this.setValue('title', this.block, lang) // имя блока
                .setValue('published', true, lang) // флаг о том что страница опубликована
                .setValue('updateDate', +(new Date()), lang); // дата обновления
        });
        return this._setSource(data).then(this.getData.bind(this));
    }
}
