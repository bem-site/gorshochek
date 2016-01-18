import path from 'path';
import Q from 'q';
import * as baseUtil from '../util';

const debug = require('debug')('docs file load');

/**
 * Loads pages embedded sources from local filesystem
 * @param {Model} model - application model instance
 * @returns {Function}
 */
export default function loadSourcesFromLocal(model) {
    /**
     * Returns true if page[language] exists and have sourceUrl
     * which can be matched as relative file path on filesystem. Otherwise returns false
     * @param {Object} page - page object
     * @returns {Boolean}
     * @private
     */
    function getCriteria(page) {
        const sourceUrl = page.sourceUrl;
        return !!sourceUrl && !!sourceUrl.match(/^(\/)?([^\/\0]+(\/)?)+$/);
    }

    /**
     * Loads file to cache
     * @param {Model} model - data model
     * @returns {Promise}
     * @protected
     */
    function processPage(model, page) {
        debug(`load local file page with url: => ${page.url}`);

        const filePath = page.sourceUrl; // относительный путь к файлу
        const fileName = path.basename(filePath); // имя файла (с расширением)
        const fileExt = path.extname(fileName); // расширение файла

        const localFilePath = path.resolve(filePath);
        const cacheFilePath = path.join(page.url, ('index' + fileExt));

        const onAddedDocument = (promise) => {
            debug('Doc added: %s %s', page.url, page.title);
            model.getChanges().addAdded({type: 'doc', url: page.url, title: page.title});
            return baseUtil.writeFileToCache(cacheFilePath, promise.value);
        };
        const onModifiedDocument = (promise) => {
            debug('Doc modified: %s %s', page.url, page.title);
            model.getChanges().addModified({type: 'doc', url: page.url, title: page.title});
            return baseUtil.writeFileToCache(cacheFilePath, promise.value);
        };

        return Q.allSettled([
            baseUtil.readFileFromCache(cacheFilePath, false, true),
            baseUtil.readFile(localFilePath, null)
        ]).spread((cache, local) => {
            if(local.state === 'rejected') {
                return Q.reject(local);
            }

            if(cache.state === 'rejected') {
                return onAddedDocument(local);
            }

            if(cache.value !== local.value) {
                return onModifiedDocument(local);
            }

            return Q(page);
        }).then(() => {
            page.contentFile = cacheFilePath;
            return page;
        });
    }

    return function() {
        return baseUtil.processPagesAsync(model, getCriteria, processPage, 20).thenResolve(model);
    };
}
