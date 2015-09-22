import vow from 'vow';
import fsExtra from 'fs-extra';
import Logger from 'bem-site-logger';

/**
 * @exports
 * @class Base
 * @desc base library model class
 */
export default class Base {
    /**
     * @constructor
     */
    constructor() {
        /**
         * Instance of logger
         * @type {Logger}
         */
        this.logger = Logger.createLogger(module);

        /**
         * Private data property for hold all key-value data pairs
         * @type {{}}
         * @private
         */
        this._data = {};
    }

    /**
     * Sets value to given this._data object field.
     * If lang option was set, then value will be set to this._data[lang][field]
     * @param {String} field id
     * @param {String|Number|Array|Boolean} value
     * @param {String} [lang] - language option
     * @returns {Base} - instance of class
     * @public
     */
    setValue(field, value, lang) {
        if(lang) {
            this._data[lang] = this._data[lang] || {};
            this._data[lang][field] = value;
        }
        this._data[field] = value;
        return this;
    }

    /**
     * Saves given content to file placed by given filePath
     * @param {String} filePath - path to file
     * @param {String|Object} content content string or js object (JSON stringify will be used before saving)
     * @param {Boolean} [isJSON] - if true then given content object will be saved as string
     * inside fsExtra.outputJSON method. Otherwise fsExtra.outputFile method will be used
     * @returns {Promise}
     * @public
     */
    saveFile(filePath, content, isJSON) {
        var method = isJSON ? 'outputJSON' : 'outputFile';
        return new vow.Promise((resolve, reject) => {
            fsExtra[method](filePath, content, (error) => {
                if (error) {
                    this.logger
                        .error(`Error occur while saving file: ${filePath}`)
                        .error(`Error: ${error.message}`);
                    reject(error);
                }
                resolve(filePath);
            });
        });
    }

    /**
     * Returns page meta-data object
     * @returns {Object}
     * @public
     */
    getData() {
        return this._data;
    }
}
