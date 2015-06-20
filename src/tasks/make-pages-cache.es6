import path from 'path';
import mkdirp from 'mkdirp';
import Base from './base';
import MergeModels from './merge-models';

export default class MakePagesCache extends Base {

    static getLoggerName() {
        return module;
    }

    static getName() {
        return 'make pages cache folders';
    }

    static getDependencies () {
        return [MergeModels];
    }

    /**
     * Make folder for page in cache directory
     * @param {Object} page - page model object
     * @private
     */
    _makeFolder(page) {

        // Для каждой страницы создается папка в директории кеша путь которой совпадает с url страницы
        var make = (baseFolder, url) => {
            return new Promise((resolve, reject) => {
                mkdirp(path.join(baseFolder, url), (error) => {
                    if(error) {
                        this.logger.error(`Error occur while creating cache folder for page: => ${url}`);
                        this.logger.error(error.message);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        };

        this.logger.verbose(`make cache folder for page: => ${page.url}`);
        return make(this.getBaseConfig().getCacheFolder(), page.url);
    }

    /**
     * Performs task
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun(this.name);

        return Promise
            .all(model.getPages().map(page => {
                return this._makeFolder(page);
            }))
            .then(() => {
                this.logger.info('cache folders for pages were successfully created');
                return model;
            });
    }
}

