'use strict';

// TODO: merge everything about GH into one class

import _ from 'lodash';

const debug = require('debug')('github api');

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
    }

    /**
     * Executes given github API method with given options and headers
     * @param {String} method - name of github method
     * @param {Object} options
     * @param {Object} headers - github request headers
     * @param {Function} callback function
     */
    executeAPIMethod(method, options, headers, callback) {
        debug('github API call with options:');
        debug(' - host: ' + options.host);
        debug(' - user: ' + options.user);
        debug(' - repo: ' + options.repo);
        debug(' - ref: ' + options.ref);
        debug(' - path: ' + options.path);

        const ATTEMPTS = 5; // максимальное число допустимых повторных обращений к github в случае возникновения ошибки
        const requestFunc = (count) => {
            debug(`attempt #${count}`);
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
