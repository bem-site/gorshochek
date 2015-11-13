import path from 'path';
import Q from 'q';
import _ from 'lodash';
import GitHub from '../github';
import Base from './base';

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
        return 'docs load from gh';
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
        return this._api;
    }

    /**
     * Returns parsed repository info for language version of page. Otherwise returns false
     * @param {Object} page - page model object
     * @param {String} lang - language
     * @returns {Object|Boolean}
     * @protected
     */
    getCriteria(page, lang) {
        let sourceUrl;
        let repoInfo;

        // 1. page должен иметь поле {lang}
        // 2. page[lang] должен иметь поле 'sourceUrl'
        // 3. page[lang].sourceUrl должен матчится на регулярное выражение из _getGhUrlPattern()
        // 4. если хотя бы одно из условий не выполняется, то вернется false

        if(!page[lang]) {
            return false;
        }

        sourceUrl = page[lang].sourceUrl;
        if(!sourceUrl) {
            return false;
        }

        repoInfo = sourceUrl.match(this.constructor.getGhUrlPattern());
        if(!repoInfo) {
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
     * @returns {Object|Null}
     * @private
     */
    _getHeadersByCache(cache) {
        return (cache && cache.etag) ? {'If-None-Match': cache.etag} : null;
    }

    /**
     * Synchronize docs for all page language version
     * @param {Model} model - data model
     * @param {Object} page - page model object
     * @param {Array} languages - array of languages
     * @returns {*|Promise.<T>}
     * @private
     */
    processPage(model, page, languages) {
        return Q.allSettled(languages.map((language) => {
            const repoInfo = this.getCriteria(page, language);

            // Проверяем на наличие правильного поля contentFile
            // это сделано потому, что предварительный фильтр мог сработать
            // для страниц у которых только часть из языковых версий удовлетворяла критерию
            if(!repoInfo) {
                return Q();
            }

            // сначала нужно проверить информацию в кеше
            // там есть etag и sha загруженного файла
            this.logger.debug(`Load doc file for language: => ${language} and page with url: => ${page.url}`);
            return this.readFileFromCache(path.join(page.url, language + '.meta.json'))
                .then(JSON.parse)
                .then(cache => {
                    cache = cache || {};
                    // выполняется запрос на gh
                    return this._getContentFromGh(repoInfo, this._getHeadersByCache(cache))
                        .then((result) => {

                            // если запрос был послан с header содержащим meta etag
                            // и данные не менялись то возвращается 304 статус
                            // берем данные из кеша
                            if(result.meta.status === '304 Not Modified') {
                                this.logger.verbose('Document was not changed: %s', page.url);
                                return Q(path.join(page.url, cache.fileName));
                            }

                            // дополнительная проверка изменения в файле путем сравнения sha сум
                            if(cache.sha === result.sha) {
                                return Q(path.join(page.url, cache.fileName));
                            }

                            if(!cache.sha) {
                                this.logger.debug('Doc added: %s %s %s', page.url, language, page[language].title);
                                model.getChanges().pages.addAdded({type: 'doc', url: page.url, title: page[language].title});
                            }else {
                                this.logger.debug('Doc modified: %s %s %s', page.url, language, page[language].title);
                                model.getChanges().pages.addModified({type: 'doc', url: page.url, title: page[language].title});
                            }

                            // меняем/добавляем данные в кеш
                            cache.etag = result.meta.etag;
                            cache.sha = result.sha;

                            const content = new Buffer(result.content, 'base64').toString();
                            const ext = result.name.split('.').pop();
                            const fileName = language + '.' + ext;
                            const filePath = path.join(page.url, fileName);

                            cache.fileName = fileName;

                            /*
                            Дополнительно загружается некоторая мета-информация
                            1. Дата обновления документа как дата последнего коммита
                            2. Инфо о том имеет ли данный репозиторий раздел issues или нет
                            3. Ветку из которой был загружен документ. Если загрузка была
                            произведена из тега - то ссылку на основную ветку репозитория
                            */
                            return Q.allSettled([
                                this._getUpdateDateInfo(repoInfo, this._getHeadersByCache(cache)),
                                this._getIssuesInfo(repoInfo, this._getHeadersByCache(cache)),
                                this._getBranch(repoInfo, this._getHeadersByCache(cache))
                            ]).spread((updateDate, hasIssues, branch) => {
                                updateDate = updateDate.isResolved() ? updateDate.valueOf() : null;
                                hasIssues = hasIssues.isResolved() ? hasIssues.valueOf() : null;
                                branch = branch.isResolved() ? branch.valueOf() : null;

                                if(updateDate) {
                                    page[language].updateDate = updateDate;
                                }

                                if(hasIssues) {
                                    page[language].hasIssues = hasIssues;
                                }

                                if(branch) {
                                    page[language].branch = branch;
                                }

                                // записываем файл мета-данных и файл с контентом в кеш
                                return Q.all([
                                    this.writeFileToCache(path.join(page.url, language + '.meta.json'), JSON.stringify(cache, null, 4)),
                                    this.writeFileToCache(filePath, content)
                                ]);
                            }).then(() => {
                                return filePath;
                            });
                        })
                        .then((filePath) => {
                            // добавляем соответствующее поле в модель
                            page[language].contentFile = filePath;
                            return filePath;
                        });
                });
        })).thenResolve(page);
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun();
        return this.processPages(model).thenResolve(model);
    }
}

