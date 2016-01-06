import fs from 'fs';
import path from 'path';
import Q from 'q';
import Base from '../tasks-core/base';

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
     * @returns {Boolean}
     * @private
     */
    getCriteria(page) {
        const sourceUrl = page.sourceUrl;
        return !!sourceUrl && !!sourceUrl.match(/^(\/)?([^\/\0]+(\/)?)+$/);
    }

    /**
     * Reads file from local filesystem
     * @param {Object} page - page model object
     * @param {String} filePath - path to file on local filesystem
     * @returns {Promise}
     * @private
     */
    _readFile(page, filePath) {
        return Q.nfcall(fs.readFile, filePath, {encoding: 'utf-8'})
            .catch(error => {
                this.logger
                    .error(`Error occur while loading file for page: ${page.url}`)
                    .error(error.message);
                throw error;
            });
    }

    /**
     * Loads file to cache
     * @param {Model} model - data model
     * @returns {Promise}
     * @protected
     */
    processPage(model, page) {
        this.logger.debug(`load local file page with url: => ${page.url}`);

        const filePath = page.sourceUrl; // относительный путь к файлу
        const fileName = path.basename(filePath); // имя файла (с расширением)
        const fileExt = path.extname(fileName); // расширение файла

        const localFilePath = path.resolve(filePath);
        const cacheFilePath = path.join(page.url, ('index' + fileExt));

        const onAddedDocument = (promise) => {
            this.logger.debug('Doc added: %s %s', page.url, page.title);
            model.getChanges().pages.addAdded({type: 'doc', url: page.url, title: page.title});
            return this.writeFileToCache(cacheFilePath, promise.valueOf());
        };
        const onModifiedDocument = (promise) => {
            this.logger.debug('Doc modified: %s %s', page.url, page.title);
            model.getChanges().pages.addModified({type: 'doc', url: page.url, title: page.title});
            return this.writeFileToCache(cacheFilePath, promise.valueOf());
        };

        return Q.allSettled([
            this.readFileFromCache(cacheFilePath),
            this._readFile(page, localFilePath)
        ]).spread((cache, local) => {
            if(local.state === 'rejected') {
                return Q.reject(local);
            }else if(cache.state === 'rejected') {
                return onAddedDocument(local);
            }else if(cache.value !== local.value) {
                return onModifiedDocument(local);
            }else {
                return Q(page);
            }
        }).then(() => {
            page.contentFile = cacheFilePath;
            return page;
        });
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        return this
            .processPagesAsync(model, this.getCriteria.bind(this), this.processPage.bind(this), 20)
            .thenResolve(model);
    }
}

