import path from 'path';
import vow from 'vow';
import DocsBaseGithub from './docs-gh-base';

export default class DocsLoadGithub extends DocsBaseGithub {

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
     * Loads content from github via github API
     * @param {Object} repoInfo - gh file object path settings
     * @param {Object} headers - gh api headers
     * @returns {Promise}
     * @private
     */
    _getContentFromGh(repoInfo, headers) {
        return new Promise((resolve, reject) => {
            this.getAPI().getContent(repoInfo, headers, (error, result) => {
                if(error) {
                    this.logger
                        .error(`GH: ${error.message}`)
                        .error(`Error occur while loading content from:`)
                        .error(`host: => ${repoInfo.host}`)
                        .error(`user: => ${repoInfo.user}`)
                        .error(`repo: => ${repoInfo.repo}`)
                        .error(`ref:  => ${repoInfo.ref}`)
                        .error(`path: => ${repoInfo.path}`);
                    return reject(error);
                }
                resolve(result);
            });
        });
    }

    /**
     * Returns date of last commit for given url
     * @param {Object} repoInfo - gh file object path settings
     * @param {Object} headers - gh api headers
     * @returns {*}
     * @private
     */
    _getUpdateDateInfo(repoInfo, headers) {
        /*
        проверка на то что соответствующая опция задачи сборки включена
        в противном случае возвращаем промис с null
        */
        if(!this.getTaskConfig().updateDate) {
            return vow.resolve(null);
        }

        /*
        Необходимо получить список коммитов для данного файла
        эти коммиты отсортированы в обратном порядке по выполнению
        следовательно 0-й элемент будет последним коммитом
        в соответствующем поле находится дата этого коммита
         */
        return new vow.Promise((resolve, reject) => {
            this.api.getCommits(repoInfo, headers, (error, result) => {
                if(error || !result || !result[0]) {
                    this.logger
                        .error('GH: %s', error ? error.message : 'unknown error')
                        .error(`Error occur while get commits from:`)
                        .error(`host: => ${repoInfo.host}`)
                        .error(`user: => ${repoInfo.user}`)
                        .error(`repo: => ${repoInfo.repo}`)
                        .error(`ref:  => ${repoInfo.ref}`)
                        .error(`path: => ${repoInfo.path}`);
                    return reject(error || new Error('Error'));
                }
                resolve((new Date(result[0].commit.committer.date)).getTime());
            });
        });
    }

    /**
     * Returns true if current repository has issues section. Otherwise returns false
     * @param {Object} repoInfo - gh file object path settings
     * @param {Object} headers - gh api headers
     * @returns {*}
     * @private
     */
    _getIssuesInfo(repoInfo, headers) {
        /*
         проверка на то что соответствующая опция задачи сборки включена
         в противном случае возвращаем промис с null
         */
        if(!this.getTaskConfig().hasIssues) {
            return vow.resolve(null);
        }

        /*Здесь разрезолвленный промис содержит логическое значение true|false*/
        return new vow.Promise((resolve, reject) => {
            this.api.hasIssues(repoInfo, headers, (error, result) => {
                if(error) {
                    this.logger
                        .error(`GH: ${error.message}`)
                        .error(`Error occur while get issues repo information:`)
                        .error(`host: => ${repoInfo.host}`)
                        .error(`user: => ${repoInfo.user}`)
                        .error(`repo: => ${repoInfo.repo}`);
                    return reject(error);
                }
                resolve(result);
            });
        });
    }

    /**
     * Returns name of branch file loaded from or default repository branch
     * (if source ref is tag - not branch)
     * @param {Object} repoInfo - gh file object path settings
     * @param {Object} headers - gh api headers
     * @returns {*}
     * @private
     */
    _getBranch(repoInfo, headers) {
        /*
         проверка на то что соответствующая опция задачи сборки включена
         в противном случае возвращаем промис с null
         */
        if(!this.getTaskConfig().getBranch) {
            return vow.resolve(null);
        }

        /*
        Сначала происходит попытка найти ветку по ее имени. Если такая ветка не
        найдена, то возвращается название основной ветки репозитория
         */
        return new vow.Promise((resolve, reject) => {
            this.api.isBranchExists(repoInfo, headers, (error1, result1) => {
                if(error1) {
                    this.logger
                        .error(`GH: ${error1.message}`)
                        .error(`Error occur while get branch information:`)
                        .error(`host: => ${repoInfo.host}`)
                        .error(`user: => ${repoInfo.user}`)
                        .error(`repo: => ${repoInfo.repo}`);
                    return reject(error1);
                }
                if(result1) {
                    return resolve(repoInfo.ref);
                } else {
                    this.api.getDefaultBranch(repoInfo, headers, (error2, result2) => {
                        if(error2) {
                            this.logger
                                .error(`GH: ${error2.message}`)
                                .error(`Error occur while get default branch name:`)
                                .error(`host: => ${repoInfo.host}`)
                                .error(`user: => ${repoInfo.user}`)
                                .error(`repo: => ${repoInfo.repo}`);
                            return reject(error2);
                        }
                        resolve(result2);
                    });
                }
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
    processPage(model, page, languages) {
        return vow.allResolved(languages.map((language) => {
            const repoInfo = this.getCriteria(page, language);

            // Проверяем на наличие правильного поля contentFile
            // это сделано потому, что предварительный фильтр мог сработать
            // для страниц у которых только часть из языковых версий удовлетворяла критерию
            if(!repoInfo) {
                return vow.resolve();
            }

            // сначала нужно проверить информацию в кеше
            // там есть etag и sha загруженного файла
            this.logger.debug(`Load doc file for language: => ${language} and page with url: => ${page.url}`);
            return this.readFileFromCache(path.join(page.url, language + '.meta.json'))
                .then(content => {
                    return JSON.parse(content);
                })
                .then(cache => {
                    cache = cache || {};
                    // выполняется запрос на gh
                    return this._getContentFromGh(repoInfo, this.getHeadersByCache(cache))
                        .then((result) => {

                            // если запрос был послан с header содержащим meta etag
                            // и данные не менялись то возвращается 304 статус
                            // берем данные из кеша
                            if(result.meta.status === '304 Not Modified') {
                                this.logger.verbose('Document was not changed: %s', page.url);
                                return Promise.resolve(path.join(page.url, cache.fileName));
                            }

                            // дополнительная проверка изменения в файле путем сравнения sha сум
                            if(cache.sha === result.sha) {
                                return Promise.resolve(path.join(page.url, cache.fileName));
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
                            return vow.allResolved([
                                this._getUpdateDateInfo(repoInfo, this.getHeadersByCache(cache)),
                                this._getIssuesInfo(repoInfo, this.getHeadersByCache(cache)),
                                this._getBranch(repoInfo, this.getHeadersByCache(cache))
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
                                return vow.all([
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
        })).then(() => {
            return page;
        });
    }
}

