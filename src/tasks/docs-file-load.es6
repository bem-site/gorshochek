import fs from 'fs';
import path from 'path';
import Q from 'Q';
import Base from './base';

export default class DocsFileLoad extends Base {

    static getLoggerName() {
        return module;
    }

    /**
     * Returns task human readable description
     * @returns {String}
     */
    static getName() {
        return 'docs load from file';
    }

    /**
     * Returns true if page[language] exists and have sourceUrl
     * which can be matched as relative file path on filesystem. Otherwise returns false
     * @param {Object} page - page object
     * @param {String} language version
     * @returns {Boolean}
     * @private
     */
    getCriteria(page, language) {
        // проверяем существование языковой версии страницы
        if(!page[language]) {
            return false;
        }

        // проверяем поле sourceUrl. Оно должно существовать и значением
        // этого поля должен быть относительный путь на UNIX файловой системе
        const sourceUrl = page[language].sourceUrl;
        return !!sourceUrl && !!sourceUrl.match(/^(\/)?([^\/\0]+(\/)?)+$/);
    }

    /**
     * Reads file from local filesystem
     * @param {Object} page - page model object
     * @param {String} language version
     * @param {String} filePath - path to file on local filesystem
     * @returns {*}
     * @private
     */
    _readFile(page, language, filePath) {
        return Q.nfcall(fs.readFile, filePath, {encoding: 'utf-8'})
            .catch(error => {
                this.logger
                    .error(`Error occur while loading file for page: ${page.url} and language ${language}`)
                    .error(error.message);
                throw error;
            });
    }

    /**
     * Processes given language version of model page
     * @param {Model} model - data model
     * @param {Object} page - page object
     * @param {String} language - language identifier
     * @returns {Promise}
     * @private
     */
    _processPageForLang(model, page, language) {
        if(!this.getCriteria(page, language)) {
            return Promise.resolve(page);
        }

        this.logger.debug(`load local file for language: => ${language} and page with url: => ${page.url}`);

        const filePath = page[language].sourceUrl; // относительный путь к файлу
        const fileName = path.basename(filePath); // имя файла (с расширением)
        const fileExt = path.extname(fileName); // расширение файла

        const localFilePath = path.resolve(filePath);
        const cacheFilePath = path.join(page.url, (language + fileExt));

        const onReadFileError = (promise) => {
            return Promise.reject(promise.valueOf());
        };
        const onAddedDocument = (promise) => {
            this.logger.debug('Doc added: %s %s %s', page.url, language, page[language].title);
            model.getChanges().pages.addAdded({type: 'doc', url: page.url, title: page[language].title});
            return this.writeFileToCache(cacheFilePath, promise.valueOf());
        };
        const onModifiedDocument = (promise) => {
            this.logger.debug('Doc modified: %s %s %s', page.url, language, page[language].title);
            model.getChanges().pages.addModified({type: 'doc', url: page.url, title: page[language].title});
            return this.writeFileToCache(cacheFilePath, promise.valueOf());
        };

        this.logger
            .verbose(`filePath: ${filePath}`)
            .verbose(`fileName: ${fileName}`)
            .verbose(`fileExt: ${fileExt}`);

        return Q.allSettled([
            this.readFileFromCache(cacheFilePath),
            this._readFile(page, language, localFilePath)
        ]).spread((cache, local) => {
            if(local.isRejected()) {
                return onReadFileError(local);
            }else if(cache.isRejected()) {
                return onAddedDocument(local);
            }else if(cache.valueOf() !== local.valueOf()) {
                return onModifiedDocument(local);
            }else {
                return Promise.resolve(page);
            }
        }).then(() => {
            page[language].contentFile = cacheFilePath;
            return cacheFilePath;
        });
    }

    /**
     * Loads file to cache
     * @param {Model} model - data model
     * @param {Object} page - page object
     * @param {Array} languages - configured languages array
     * @returns {Promise}
     * @protected
     */
    processPage(model, page, languages) {
        return Q.allSettled(languages.map((language) => {
            return this._processPageForLang(model, page, language);
        })).thenResolve(page);
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun();
        return this.processPages(model, 20).thenResolve(model);
    }
}

