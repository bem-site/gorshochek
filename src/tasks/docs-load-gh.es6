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

    _getAPI() {
        return this.api;
    }

    _getGhUrlPattern() {
        return /^https?:\/\/(.+?)\/(.+?)\/(.+?)\/(tree|blob)\/(.+?)\/(.+)/;
    }

    _getGhSource(page, lang) {
        var sourceUrl,
            repoInfo;

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

    _getPagesWithGHSources(pages, languages) {
        return pages.filter(page => {
           return languages.some(lang => {
                return this._getGhSource(page, lang);
           });
        });
    }

    _makePageFolders(page, skip) {
        var mkFolder = (baseFolder, url) => {
            return new Promise((resolve, reject) => {
                fsExtra.ensureDir(path.join(baseFolder, url), (error) => {
                    error ? reject(error) : resolve();
                });
            });
        };

        if (skip) {
            return vow.resolve();
        }

        return vow.all([
            mkFolder(this.getBaseConfig().getCacheDirPath(), page.url) //,
            //mkFolder(this.getBaseConfig().getDestinationDirPath(), page.url)
        ]);
    }

    _loadPageCacheInfo(page, lang) {
        var cacheFilePath = path.join(this.getBaseConfig().getCacheDirPath(), page.url, lang + '.json');
        return new Promise((resolve) => {
            fsExtra.readJSONFile(cacheFilePath, (error, cache) => {
                error ? resolve(null) : resolve(cache);
            });
        });
    }

    _savePageCacheInfo(page, lang, cache) {
        var cacheFilePath = path.join(this.getBaseConfig().getCacheDirPath(), page.url, lang + '.json');
        return new Promise((resolve, reject) => {
            fsExtra.writeJSONFile(cacheFilePath, cache, (error, cache) => {
                error ? reject(error) : resolve(cache);
            });
        });
    }

    _savePageContentToCache(filePath, content) {
        var cacheFilePath = path.join(this.getBaseConfig().getCacheDirPath(), filePath);
        return new Promise((resolve, reject) => {
            fs.writeFile(cacheFilePath, content, { encoding: 'utf-8' }, (error, cache) => {
                error ? reject(error) : resolve(cache);
            });
        });
    }

    _getHeadersByCache(cache) {
        return (cache && cache.etag) ? { 'If-None-Match': cache.etag } : null;
    }

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

    /*
    _copyContentFromCacheToData(filePath){
        var cachePath = path.join(this.getBaseConfig().getCacheDirPath(), filePath),
            dataPath = path.join(this.getBaseConfig().getDestinationDirPath(), filePath);

        return new Promise((resolve, reject) => {
            return fsExtra.copy(cachePath, dataPath, (error) => {
                error ? reject(error) : resolve();
            });
        });
    }
    */

    _syncDoc(model, page, languages) {
        return vow.allResolved(languages.map((language, index) => {
            var repoInfo = this._getGhSource(page, language);
            if (!repoInfo) {
                return vow.resolve();
            }

            this.logger.debug(`Load doc file for language: => ${language} and page with url: => ${page.url}`);
            return this._makePageFolders(page, index > 0)
                .then(() => {
                    return this._loadPageCacheInfo(page, language);
                })
                .then((cache) => {
                    cache = cache || {};
                    return this._getContentFromGh(repoInfo, this._getHeadersByCache(cache))
                        .then((result) => {
                            if (result.meta.status === '304 Not Modified') {
                                this.logger.verbose('Document was not changed: %s', page.url);
                                return Promise.resolve(path.join(page.url, cache.fileName));
                            }

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

                            cache.etag = result.meta.etag;
                            cache.sha = result.sha;

                            var content = new Buffer(result.content, 'base64').toString(),
                                ext = result.name.split('.').pop(),
                                fileName = language + '.' + ext,
                                filePath = path.join(page.url, fileName);

                            cache.fileName = fileName;

                            return vow.all([
                                this._savePageCacheInfo(page, language, cache),
                                this._savePageContentToCache(filePath, content)
                            ]).then(() => {
                                return filePath;
                            });
                        })
                        .then((filePath) => {
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

        var portionSize = 5,
            languages,
            pagesWithGHSources,
            portions,
            loadDocs;

        languages = this.getBaseConfig().getLanguages();
        pagesWithGHSources = this._getPagesWithGHSources(model.getPages(), languages);
        portions = _.chunk(pagesWithGHSources, portionSize);

        loadDocs = portions.reduce((prev, portion, index) => {
            prev = prev.then(() => {
                this.logger.debug('Synchronize portion of pages in range %s - %s',
                    index * portionSize, (index + 1) * portionSize);
                return vow.allResolved(portion.map((page) => {
                    return this._syncDoc(model, page, languages);
                }));
            });
            return prev;
        }, vow.resolve());

        return loadDocs.then(() => {
            //TODO implement setPages with new fields here
            return Promise.resolve(model);
        });
    }
}

