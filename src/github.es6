'use strict';

var _ = require('lodash'),
    Api = require('github'),
    Logger = require('bem-site-logger');

class Base {
    constructor(options) {
        this.options = options;
        this.logger = Logger.setOptions(options.logger).createLogger(module);
    }

    executeAPIMethod(method, options, headers, callback) {
        this.logger.verbose('github API call with options: ');
        this.logger.verbose(' - host: %s', options.host || 'N/A');
        this.logger.verbose(' - user: %s', options.user || 'N/A');
        this.logger.verbose(' - repo: %s', options.repo || 'N/A');
        this.logger.verbose(' - ref: %s',  options.ref  || 'N/A');
        this.logger.verbose(' - path: %s', options.path || 'N/A');
        return this.api['repos'][method](_.extend(headers ? { headers: headers } : {}, options), callback);
    }

    /**
     * Loads content of file from github via github API
     * @param {Object} options for api request. Fields:
     *    - user {String} name of user or organization which this repository is belong to
     *    - repo {String} name of repository
     *    - ref {String} name of branch
     *    - path {String} relative path from the root of repository
     * @param {Object} headers - optional header params
     * @param {Function} callback function
     * @returns {*|Object}
     */
    getContent(options, headers, callback) {
        return this.executeAPIMethod('getContent', options, headers, callback);
    }

    /**
     * Returns list of commits of given file
     * @param {Object} options for api request. Fields:
     *    - user {String} name of user or organization which this repository is belong to
     *    - repo {String} name of repository
     *    - path {String} relative path from the root of repository
     * @param {Object} headers - optional header params
     * @param {Function} callback function
     * @returns {*|Object}
     */
    getCommits(options, headers, callback) {
        return this.executeAPIMethod('getCommits', options, headers, callback);
    }

    /**
     * Returns branch information by given branch name
     * @param {Object} options for api request. Fields:
     *    - user {String} name of user or organization which this repository is belong to
     *    - repo {String} name of repository
     *    - ref {String} name of branch
     * @param {Object} headers - optional header params
     * @param {Function} callback function
     * @returns {*|Object}
     */
    getBranch(options, headers, callback) {
        return this.executeAPIMethod('getBranch', options, headers, callback);
    }

    /**
     * Returns repository information
     * @param {Object} options for api request. Fields:
     *    - user {String} name of user or organization which this repository is belong to
     *    - repo {String} name of repository
     * @param {Object} headers - optional header params
     * @param {Function} callback function
     * @returns {*|Object}
     */
    getRepo(options, headers, callback) {
        return this.executeAPIMethod('get', options, headers, callback);
    }

    getBaseConfig() {
        return {
            version: '3.0.0',
            protocol: 'https',
            timeout: 60000,
            debug: false
        };
    }
}

class Custom extends Base {

    constructor(options){
        super(options);
    }

    /**
     * Returns name of default branch
     * @param {Object} options for api request. Fields:
     *    - user {String} name of user or organization which this repository is belong to
     *    - repo {String} name of repository
     * @param {Object} headers - optional header params
     * @param {Function} callback function
     * @returns {*|Object}
     */
    getDefaultBranch(options, headers, callback) {
        return this.getRepo(options, headers, (error, result) => {
            return error ? callback(error) : callback(null, result['default_branch']);
        });
    }

    /**
     * Check if given branch exists in repository
     * @param {Object} options for api request. Fields:
     *    - user {String} name of user or organization which this repository is belong to
     *    - repo {String} name of repository
     *    - ref {String} name of branch
     * @param {Object} headers - optional header params
     * @param {Function} callback function
     * @returns {*|Object}
     */
    isBranchExists(options, headers, callback) {
        return this.getBranch(options, headers, (error) => {
            if (!error) {
                callback(null, true);
            } else if (error.code === 404) {
                callback(null, false);
            } else {
                callback(error);
            }
        });
    }
}


/**
 * API for calls to public repositories
 * @type {*|exports}
 */
class Public extends Custom {
    constructor(options) {
        super(options);
        this.api = new Api(_.extend({ host: 'api.github.com' }, super.getBaseConfig()));

        if (!this.options.token) {
            this.logger.warn('No github authorization token were set. ' +
            'Number of requests will be limited by 60 requests per hour according to API rules');
            return;
        }

        this.api['authenticate']({ type: 'oauth', token: this.options.token });
    }

    static getType() {
        return 'public';
    }
}

/**
 * Api for calls to private repositories
 * @type {*|exports}
 */
class Private extends Custom {
    constructor(options) {
        super(options);
        this.api = new Api(_.extend({
            host: 'github.yandex-team.ru',
            pathPrefix: '/api/v3'
        }, super.getBaseConfig()));
    }

    static getType() {
        return 'private';
    }
}

export default class Github extends Custom {
    constructor(options) {
        super(options);
        this.apis = new Map();
        this.apis.set(Public.getType(), new Public(options));
        this.apis.set(Private.getType(), new Private(options));
    }

    _getApiByHost(options) {
        var host = options.host,
            type = host.indexOf('github.com') > -1 ? Public.getType() : Private.getType();
        return this.apis.get(type);
    }

    getContent(options, headers, callback) {
        return super.getContent.apply(this._getApiByHost(options), arguments);
    }

    getCommits(options, headers, callback) {
        return super.getCommits.apply(this._getApiByHost(options), arguments);
    }

    getBranch(options, headers, callback) {
        return super.getBranch.apply(this._getApiByHost(options), arguments);
    }

    getRepo(options, headers, callback) {
        return super.getRepo.apply(this._getApiByHost(options), arguments);
    }

    getDefaultBranch(options, headers, callback) {
        return super.getDefaultBranch.apply(this._getApiByHost(options), arguments);
    }

    isBranchExists(options, headers, callback) {
        return super.isBranchExists.apply(this._getApiByHost(options), arguments);
    }
}
