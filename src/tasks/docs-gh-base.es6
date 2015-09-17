import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import GitHub from '../github';
import DocsBase from './docs-base';

export default class DocsBaseGithub extends DocsBase {

    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig);

        const ghOptions = _.extend({ token: taskConfig.token }, baseConfig.getLoggerSettings());
        this.api = new GitHub(ghOptions);
    }

    static getLoggerName() {
        return module;
    }

    /**
     * Return task human readable description
     * @returns {string}
     */
    static getName() {
        return 'docs base github operations';
    }

    /**
     * Returns url pattern for http urls of gh sources
     * @returns {RegExp}
     * @private
     */
    static getGhUrlPattern() {
        // Например: https://github.com/bem/bem-method/tree/bem-info-data/method/index/index.en.md
        return /^https?:\/\/(.+?)\/(.+?)\/(.+?)\/(tree|blob)\/(.+?)\/(.+)/;
    }

    /**
     * Returns github API class instance
     * @returns {Github}
     * @private
     */
    getAPI() {
        return this.api;
    }

    /**
     * Returns parsed repository info for language version of page. Otherwise returns false
     * @param {Object} page - page model object
     * @param {String} lang - language
     * @returns {Object|false}
     * @private
     */
    getCriteria(page, lang) {
        let sourceUrl;
        let repoInfo;

        //1. page должен иметь поле {lang}
        //2. page[lang] должен иметь поле 'sourceUrl'
        //3. page[lang].sourceUrl должен матчится на регулярное выражение из _getGhUrlPattern()
        //4. если хотя бы одно из условий не выполняется, то вернется false

        if (!page[lang]) {
            return false;
        }

        sourceUrl = page[lang].sourceUrl;
        if (!sourceUrl) {
            return false;
        }

        repoInfo = sourceUrl.match(this.constructor.getGhUrlPattern());
        if (!repoInfo) {
            return false;
        }

        return {
            host: repoInfo[1],
            user: repoInfo[2],
            repo: repoInfo[3],
            ref: repoInfo[5],
            path: repoInfo[6]
        };
    }

    /**
     * Creates header object from cached etag
     * @param {Object} cache object
     * @returns {{If-None-Match: *}}
     * @private
     */
    getHeadersByCache(cache) {
        return (cache && cache.etag) ? { 'If-None-Match': cache.etag } : null;
    }

    /**
     * Reads file from cache folder
     * @param {String} filePath - path to file (relative to cache folder)
     * @returns {Promise}
     */
    readFileFromCache(filePath){
        const o = { encoding: 'utf-8' };
        const basePath = this.getBaseConfig().getCacheFolder();

        return new Promise((resolve) => {
            fs.readFile(path.join(basePath, filePath), o, (error, content) => {
                resolve(content || '{}');
            });
        });
    }
}


