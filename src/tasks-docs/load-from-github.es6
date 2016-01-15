import path from 'path';
import Q from 'q';
import GitHub from './github/index';
import * as baseUtil from '../util';

const debug = require('debug')('docs github load');

export default function loadSourcesFromGithub(model, options = {}) {
    const api = new GitHub({token: options.token});

    /**
     * Returns parsed repository info for language version of page. Otherwise returns false
     * @param {Object} page - page model object
     * @returns {Object|Boolean}
     */
    function getCriteria(page) {
        return !!(page.sourceUrl &&
        page.sourceUrl.match(/^https?:\/\/(.+?)\/(.+?)\/(.+?)\/(tree|blob)\/(.+?)\/(.+)/));
    }

    /**
     * Return request headers depending on cache content
     * @param {Object} cache - cache content
     * @returns {Object|null}
     */
    function getHeadersByCache(cache) {
        return (cache && cache.etag) ? {'If-None-Match': cache.etag} : null;
    }

    /**
     * Parses https github url to source
     * @param {String} url - https github url
     * @returns {{host: *, user: *, repo: *, ref: *, path: *}}
     */
    function parseSourceUrl(url) {
        const repoInfo = url.match(/^https?:\/\/(.+?)\/(.+?)\/(.+?)\/(tree|blob)\/(.+?)\/(.+)/);
        return {
            host: repoInfo[1],
            user: repoInfo[2],
            repo: repoInfo[3],
            ref: repoInfo[5],
            path: repoInfo[6]
        };
    }

    /**
     * Returns path to source file in local cache
     * @param {Object} page - model page object
     * @param {Object} result
     * @returns {String|*}
     */
    function getCacheFilePath(page, result) {
        const ext = result.name.split('.').pop();
        return path.join(page.url, 'index.' + ext);
    }

    /**
     * Read source meta.json file from local cache
     * @param {Object} page - model page object
     * @returns {Promise.<T>}
     */
    function readMetaFromCache(page) {
        return baseUtil.readFileFromCache(path.join(page.url, 'index.meta.json'), true, true)
            .then(cache => (cache || {}))
            .catch(() => ({}));
    }

    /**
     * Write source meta.json file to local cache
     * @param {Object} page - model page object
     * @param {Object} result
     * @returns {Promise}
     */
    function writeMetaToCache(page, result) {
        return baseUtil.writeFileToCache(path.join(page.url, 'index.meta.json'),
            JSON.stringify({
                etag: result.meta.etag,
                sha: result.sha,
                fileName: getCacheFilePath(page, result)
            }, null, 4));
    }

    /**
     * Save loaded content to local cache
     * @param {String} content - base64 encoded content of file
     * @returns {Promise}
     */
    function saveContentToFile(content) {
        const filePath = getCacheFilePath(content);
        return baseUtil
            .writeFileToCache(filePath, new Buffer(content.content, 'base64').toString())
            .thenResolve(filePath);
    }

    /*
     Дополнительно загружается некоторая мета-информация
     1. Дата обновления документа как дата последнего коммита
     2. Инфо о том имеет ли данный репозиторий раздел issues или нет
     3. Ветку из которой был загружен документ. Если загрузка была
     произведена из тега - то ссылку на основную ветку репозитория
     */
    function loadAdvancedMetaInformation(page, repoInfo, cache) {
        const getUpdateDate = options.updateDate ? api.getLastCommitDate(repoInfo, getHeadersByCache(cache)) : Q(null);
        const checkForIssues = options.hasIssues ? api.hasIssues(repoInfo, getHeadersByCache(cache)) : Q(null);
        const getBranch = options.getBranch ? api.getBranchOrDefault(repoInfo, getHeadersByCache(cache)) : Q(null);
        return Q.allSettled([getUpdateDate, checkForIssues, getBranch])
            .spread((updateDate, hasIssues, branch) => {
                page.updateDate = updateDate.value;
                page.hasIssues = hasIssues.value;
                page.branch = branch.value;
            });
    }

    /**
     * Synchronize docs for all page language version
     * @param {Model} model - data model
     * @param {Object} page - page model object
     * @returns {*|Promise.<T>}
     */
    function processPage(model, page) {
        debug(`Load doc file for page with url: => ${page.url}`);
        const repoInfo = parseSourceUrl(page.sourceUrl);
        return readMetaFromCache(page)
            .then(cache => Q.all([api.getContent(repoInfo, getHeadersByCache(cache)), cache]))
            .spread((result, cache) => {
                if(result.meta.status === '304 Not Modified' || cache.sha === result.sha) {
                    debug('Document was not changed: %s', page.url);
                    return Q(cache.fileName);
                } else if(!cache.sha) {
                    debug('Doc added: %s %s', page.url, page.title);
                    model.getChanges().pages.addAdded({type: 'doc', url: page.url, title: page.title});
                } else {
                    debug('Doc modified: %s %s %s', page.url, page.title);
                    model.getChanges().pages.addModified({type: 'doc', url: page.url, title: page.title});
                }

                return Q()
                    .then(() => loadAdvancedMetaInformation(page, repoInfo, cache))
                    .then(() => writeMetaToCache(page, result))
                    .then(() => saveContentToFile(result));
            })
            .then(filePath => {
                page.contentFile = filePath;
                return page;
            });
    }

    return function() {
        return baseUtil.processPagesAsync(model, getCriteria, processPage, 5).thenResolve(model);
    };
}
