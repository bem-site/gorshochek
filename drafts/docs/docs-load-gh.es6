var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    vow = require('vow'),
    fsExtra = require('fs-extra');

import Base from './base';
import GitHub from '../github';

const META = {
    module: _.pick(module, 'filename'),
    name: 'load docs from github'
};

export default class DocsLoadGithub extends Base {
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig, META);

        var ghOptions = _.extend({ token: taskConfig.token }, baseConfig.getLoggerSettings());
        this.api = new GitHub(ghOptions);
    }

    /**
     * Returns github API class instance
     * @returns {Github}
     * @private
     */
    _getAPI() {
        return this.api;
    }

    /**
     * Returns url pattern for http urls of gh sources
     * @returns {RegExp}
     * @private
     */
    _getGhUrlPattern() {
        // Например: https://github.com/bem/bem-method/tree/bem-info-data/method/index/index.en.md
        return /^https?:\/\/(.+?)\/(.+?)\/(.+?)\/(tree|blob)\/(.+?)\/(.+)/;
    }

    /**
     * Returns parsed repository info for language version of page. Otherwise returns false
     * @param {Object} page - page model object
     * @param {String} lang - language
     * @returns {Object|false}
     * @private
     */
    _getGhSource(page, lang) {
        var sourceUrl,
            repoInfo;

        //1. page должен иметь поле {lang}
        //2. page[lang] должен иметь поле 'sourceUrl'
        //3. page[lang].sourceUrl должен матчится на регулярное выражение из _getGhUrlPattern()
        //4. если хотя бы одно из условий не выполняется, то вернется false

        if (!page[lang]) {
            return false;
        }

        sourceUrl = page[lang].sourceUrl
        if (!sourceUrl) {
            return false;
        }

        repoInfo = sourceUrl.match(this._getGhUrlPattern());
        if (!repoInfo) {
            return false;
        }

        return {
            host: repoInfo[1],
            user: repoInfo[2],
            repo: repoInfo[3],
            ref:  repoInfo[5],
            path: repoInfo[6]
        };
    }

    /**
     * Returns pages with anyone language version satisfy _hasMdFile function criteria
     * @param {Array} pages - model pages
     * @param {Array} languages - configured languages array
     * @returns {Array} filtered array of pages
     * @private
     */
    _getPagesWithGHSources(pages, languages) {
        // здесь происходит поиск страниц в модели у которых
        // хотя бы одна из языковых версий удовлетворяет критерию из функции _getGhSource
        return pages.filter(page => {
           return languages.some(lang => {
                return this._getGhSource(page, lang);
           });
        });
    }

    /**
     * Creates header object from cached etag
     * @param {Object} cache object
     * @returns {{If-None-Match: *}}
     * @private
     */
    _getHeadersByCache(cache) {
        return (cache && cache.etag) ? { 'If-None-Match': cache.etag } : null;
    }

    /**
     * Loads content from github via github API
     * @param {Object} repoInfo - gh file object path settings
     * @param {Object} headers - gh api headers
     * @returns {Promise}
     * @private
     */
    _getContentFromGh(repoInfo, headers){
        return new Promise((resolve, reject) => {
            this._getAPI().getContent(repoInfo, headers, (error, result) => {
                if (error) {
                    this.logger
                        .error('GH: %s', error.message)
                        .error('Error occur while loading content from:')
                        .error('host: => %s', repoInfo.host)
                        .error('user: => %s', repoInfo.user)
                        .error('repo: => %s', repoInfo.repo)
                        .error('ref:  => %s', repoInfo.ref)
                        .error('path: => %s', repoInfo.path);
                    return reject(error);
                }
                resolve(result);
            });
        });
    }

    /**
     * Synchronize docs for all page language version
     * @param {Model} model - data model
     * @param {Object} page - page model object
     * @param {Array} languages - array of languages
     * @returns {*|Promise.<T>}
     * @private
     */
    _syncDoc(model, page, languages) {
        return vow.allResolved(languages.map((language, index) => {
            var repoInfo = this._getGhSource(page, language);

            // Проверяем на наличие правильного поля contentFile
            // это сделано потому, что предварительный фильтр мог сработать
            // для страниц у которых только часть из языковых версий удовлетворяла критерию
            if (!repoInfo) {
                return vow.resolve();
            }


            // сначала нужно проверить информацию в кеше
            // там есть etag и sha загруженного файла
            this.logger.debug(`Load doc file for language: => ${language} and page with url: => ${page.url}`);
            return this.readFileFromCache(path.join(page.url, language + '.json'))
                .then(content => {
                    return JSON.parse(content);
                })
                .then(cache => {
                    cache = cache || {};
                    // выполняется запрос на gh
                    return this._getContentFromGh(repoInfo, this._getHeadersByCache(cache))
                        .then((result) => {

                            // если запрос был послан с header содержащим meta etag
                            // и данные не менялись то возвращается 304 статус
                            // берем данные из кеша
                            if (result.meta.status === '304 Not Modified') {
                                this.logger.verbose('Document was not changed: %s', page.url);
                                return Promise.resolve(path.join(page.url, cache.fileName));
                            }

                            // дополнительная проверка изменения в файле путем сравнения sha сум
                            if(cache.sha === result.sha) {
                                return Promise.resolve(path.join(page.url, cache.fileName));
                            }

                            if(!cache.sha) {
                                this.logger.debug('Doc added: %s %s %s', page.url, language, page[language].title);
                                model.getChanges().docs.addAdded({ url: page.url, title: page[language].title });
                            }else {
                                this.logger.debug('Doc modified: %s %s %s', page.url, language, page[language].title);
                                model.getChanges().docs.addModified({ url: page.url, title: page[language].title });
                            }

                            // меняем/добавляем данные в кеш
                            cache.etag = result.meta.etag;
                            cache.sha = result.sha;

                            var content = new Buffer(result.content, 'base64').toString(),
                                ext = result.name.split('.').pop(),
                                fileName = language + '.' + ext,
                                filePath = path.join(page.url, fileName);

                            cache.fileName = fileName;

                            // записываем файл мета-данных и файл с контентом в кеш
                            return vow.all([
                                this.writeFileToCache(path.join(page.url, lang + '.json'), JSON.stringify(cache, null, 4)),
                                this.writeFileToCache(filePath, content)
                            ]).then(() => {
                                return filePath;
                            });
                        })
                        .then((filePath) => {
                            // добавляем соответствующее поле в модель
                            page[language]['contentFile'] = filePath;
                            return filePath;
                        });
                });
        })).then(() => {
            return page;
        });
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun(this.name);

        var PORTION_SIZE = 5,
            languages,
            pagesWithGHSources,
            portions,
            loadDocs;

        languages = this.getBaseConfig().getLanguages();
        pagesWithGHSources = this._getPagesWithGHSources(model.getPages(), languages);
        portions = _.chunk(pagesWithGHSources, PORTION_SIZE);

        loadDocs = portions.reduce((prev, portion, index) => {
            prev = prev.then(() => {
                this.logger.debug('Synchronize portion of pages in range %s - %s',
                    index * PORTION_SIZE, (index + 1) * PORTION_SIZE);
                return vow.allResolved(portion.map((page) => {
                    return this._syncDoc(model, page, languages);
                }));
            });
            return prev;
        }, vow.resolve());

        return loadDocs.then(() => {
            return Promise.resolve(model);
        });
    }
}

