import Q from 'q';
import Public from './public';
import Private from './private';

export default class Github{
    /**
     * Constructor
     * @param {Object} options object
     */
    constructor(options) {
        this.apis = {
            public: new Public(options),
            private: new Private(options)
        };
    }

    /**
     * Selects API by given options by host criteria
     * @param {Object} options object
     * @returns {Public|Private}
     * @private
     */
    _getApiByHost(options) {
        const host = options.host;
        const type = (host && host.indexOf('github.com') < 0) ? 'private' : 'public';
        return this.apis[type];
    }

    /**
     * Loads content of file from github via github API
     * @param {Object} options for api request. Fields:
     *    - user {String} name of user or organization which this repository is belong to
     *    - repo {String} name of repository
     *    - ref {String} name of branch
     *    - path {String} relative path from the root of repository
     * @param {Object} headers - optional header params
     * @returns {Promise}
     */
    getContent(options, headers) {
        var api = this._getApiByHost(options);
        return Q
            .nfcall(api.getContent.bind(api), options, headers)
            .catch(this._createErrorHandler(`Error occured while loading content from:`, options));
    }

    /**
     * Returns date of last commit for given file path
     * @param {Object} options for api request. Fields:
     *    - user {String} name of user or organization which this repository is belong to
     *    - repo {String} name of repository
     *    - path {String} relative path from the root of repository
     * @param {Object} headers - optional header params
     * @returns {Promise}
     */
    getLastCommitDate(options, headers) {
        var api = this._getApiByHost(options);
        return Q
            .nfcall(api.getCommits.bind(api), options, headers)
            .catch(this._createErrorHandler(`Error occured while get commits from:`, options))
            .then(result => {
                if(!result || !result[0]) {
                    // TODO: check
                    throw new Error('Can not read commits');
                }
                return (new Date(result[0].commit.committer.date)).getTime();
            });
    }

    /**
     * Checks if given repository has issues section or not
     * @param {Object} options for api request. Fields:
     *    - user {String} name of user or organization which this repository is belong to
     *    - repo {String} name of repository
     * @param {Object} headers - optional header params
     * @returns {Promise}
     */
    hasIssues(options, headers) {
        var api = this._getApiByHost(options);
        return Q
            .nfcall(api.hasIssues.bind(api), options, headers)
            .catch(this._createErrorHandler(`Error occured while getting issues repo information:`, options));
    }

    /**
     * Returns name of branch by path or repository default branch if given path is tag
     * @param {Object} options for api request. Fields:
     *    - user {String} name of user or organization which this repository is belong to
     *    - repo {String} name of repository
     *    - ref {String} name of branch
     * @param {Object} headers - optional header params
     * @returns {Promise}
     */
    getBranchOrDefault(options, headers) {
        var api = this._getApiByHost(options);
        return Q
            .nfcall(api.isBranchExists.bind(api), options, headers)
            .catch(this._createErrorHandler(`Error occured while getting branch information:`, options))
            .then(result => {
                return result ? options.ref : Q.nfcall(api.getDefaultBranch.bind(api), options, headers);
            });
    }

    /**
     * Returns error handler function
     * @param {String} errorMessage - base error message
     * @param {Object} options arg
     * @returns {Function} error handler function
     * @private
     */
    _createErrorHandler(errorMessage, options) {
        return error => {
            console.error(`GH: ${error.message}`);
            console.error(errorMessage);
            console.error(`host: => ${options.host}`);
            console.error(`user: => ${options.user}`);
            console.error(`repo: => ${options.repo}`);

            options.ref && console.error('ref: =>', options.ref);
            options.path && console.error('path: =>', options.path);

            throw error;
        };
    }
}
