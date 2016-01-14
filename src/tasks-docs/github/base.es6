'use strict';

import _ from 'lodash';
import Logger from 'bem-site-logger';

/**
 * @exports
 * @class Base
 * @desc Base class for github API methods
 */
export default class Base {
    /**
     * Constructor
     * @param {Object} options object
     */
    constructor(options) {
        this.options = options;
        this.logger = Logger.setOptions(options.logger).createLogger(module);
    }

    /**
     * Executes given github API method with given options and headers
     * @param {String} method - name of github method
     * @param {Object} options
     * @param {Object} headers - github request headers
     * @param {Function} callback function
     */
    executeAPIMethod(method, options, headers, callback) {
        this.logger
            .verbose('github API call with options:')
            .verbose(' - host: %s', options.host || 'N/A')
            .verbose(' - user: %s', options.user || 'N/A')
            .verbose(' - repo: %s', options.repo || 'N/A')
            .verbose(' - ref: %s',  options.ref  || 'N/A')
            .verbose(' - path: %s', options.path || 'N/A');

        const ATTEMPTS = 5; // максимальное число допустимых повторных обращений к github в случае возникновения ошибки
        const requestFunc = (count) => {
            this.logger.verbose(`attempt #${count}`);
            return this.api['repos'][method](_.extend(headers ? {headers} : {}, options),
                (error, result) => {
                    if(!error) {
                        return callback(null, result);
                    }

                    // если число попыток не превысило максимально возможное, то повторно запрашиваем данные
                    if(count < ATTEMPTS) {
                        return requestFunc(++count);
                    }

                    // отправляем callback с ошибкой если все попытки завершились с ошибкой
                    callback(error);
                });
        };

        requestFunc(0);
    }

    getContent(...params) {
        return this.executeAPIMethod('getContent', ...params);
    }

    getCommits(...params) {
        return this.executeAPIMethod('getCommits', ...params);
    }

    getBranch(options, ...params) {
        options.branch = options.branch || options.ref;
        return this.executeAPIMethod('getBranch', options, ...params);
    }

    getRepo(...params) {
        return this.executeAPIMethod('get', ...params);
    }

    /**
     * Returns base github configuration
     * @returns {{version: String, protocol: String, timeout: Number, debug: Boolean}}
     * @static
     */
    static getBaseConfig() {
        return {
            version: '3.0.0',
            protocol: 'https',
            timeout: 60000,
            debug: false
        };
    }
}
