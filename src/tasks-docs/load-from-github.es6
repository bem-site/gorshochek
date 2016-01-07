import path from 'path';
import Q from 'q';
import _ from 'lodash';
import GitHub from './github/index';
import Base from '../tasks-core/base';

export default class DocsLoadGithub extends Base {

    /**
     * Constructor
     * @param {Config} baseConfig common configuration instance
     * @param {Object} taskConfig special task configuration object
     */
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig);

        const ghOptions = _.extend({token: taskConfig.token}, baseConfig.getLoggerSettings());
        this._api = new GitHub(ghOptions);
    }

    static getLoggerName() {
        return module;
    }

    /**
     * Return task human readable description
     * @returns {String}
     */
    static getName() {
        return 'docs load from github';
    }

    /**
     * Returns github API class instance
     * @returns {Github}
     * @private
     */
    getAPI() {
        return this._api;
    }

    /**
     * Returns parsed repository info for language version of page. Otherwise returns false
     * @param {Object} page - page model object
     * @returns {Object|Boolean}
     * @protected
     */
    getCriteria(page) {
        return !!(page.sourceUrl &&
            page.sourceUrl.match(/^https?:\/\/(.+?)\/(.+?)\/(.+?)\/(tree|blob)\/(.+?)\/(.+)/));
    }

    /**
     * Synchronize docs for all page language version
     * @param {Model} model - data model
     * @param {Object} page - page model object
     * @returns {*|Promise.<T>}
     * @private
     */
    processPage(model, page) {
        function getHeadersByCache(cache) {
            return (cache && cache.etag) ? {'If-None-Match': cache.etag} : null;
        }

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

        const readFromCache = () => {
            return this.readFileFromCache(path.join(page.url, 'index.meta.json'), true, true)
                .catch(() => ({}));
        };

        /*
         Дополнительно загружается некоторая мета-информация
         1. Дата обновления документа как дата последнего коммита
         2. Инфо о том имеет ли данный репозиторий раздел issues или нет
         3. Ветку из которой был загружен документ. Если загрузка была
         произведена из тега - то ссылку на основную ветку репозитория
         */
        const loadAdvancedMetaInformation = (repoInfo, cache) => {
            const getUpdateDate = this.getTaskConfig().updateDate ?
                this.getAPI().getLastCommitDate(repoInfo, getHeadersByCache(cache)) :
                Q(null);
            const checkForIssues = this.getTaskConfig().hasIssues ?
                this.getAPI().hasIssues(repoInfo, getHeadersByCache(cache)) :
                Q(null);
            const getBranch = this.getTaskConfig().getBranch ?
                this.getAPI().getBranchOrDefault(repoInfo, getHeadersByCache(cache)) :
                Q(null);
            return Q.allSettled([getUpdateDate, checkForIssues, getBranch])
                .spread((updateDate, hasIssues, branch) => {
                    page.updateDate = updateDate.value;
                    page.hasIssues = hasIssues.value;
                    page.branch = branch.value;
                });
        };

        const updateCacheMetaData = (result) => {
            return this.writeFileToCache(path.join(page.url, 'index.meta.json'),
                JSON.stringify({etag: result.meta.etag, sha: result.sha}, null, 4));
        };

        const saveResultToFileSystem = (result) => {
            const ext = result.name.split('.').pop();
            const filePath = path.join(page.url, 'index.' + ext);
            return this
                .writeFileToCache(filePath, new Buffer(result.content, 'base64').toString())
                .thenResolve(filePath);
        };

        this.logger.debug(`Load doc file for page with url: => ${page.url}`);
        const repoInfo = parseSourceUrl(page.sourceUrl);
        return readFromCache()
            .then(cache => {
                return Q.all([
                    this.getAPI().getContent(repoInfo, getHeadersByCache(cache)),
                    cache
                ]);
            })
            .spread((result, cache) => {
                if(result.meta.status === '304 Not Modified' || cache.sha === result.sha) {
                    this.logger.verbose('Document was not changed: %s', page.url);
                    return Q(page.contentFile);
                } else if(!cache.sha) {
                    this.logger.debug('Doc added: %s %s', page.url, page.title);
                    model.getChanges().pages.addAdded({type: 'doc', url: page.url, title: page.title});
                } else {
                    this.logger.debug('Doc modified: %s %s %s', page.url, page.title);
                    model.getChanges().pages.addModified({type: 'doc', url: page.url, title: page.title});
                }

                return Q()
                    .then(() => loadAdvancedMetaInformation(repoInfo, cache))
                    .then(() => updateCacheMetaData(result))
                    .then(() => saveResultToFileSystem(result));
            })
            .then(filePath => {
                page.contentFile = filePath;
                return page;
            });
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        return this
            .processPagesAsync(model, this.getCriteria.bind(this), this.processPage.bind(this), 5)
            .thenResolve(model);
    }
}
