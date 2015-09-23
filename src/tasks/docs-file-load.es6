import fs from 'fs';
import path from 'path';
import vow from 'vow';
import DocsBase from './docs-base';

export default class DocsFileLoad extends DocsBase {

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
     * Returns number of page per portion for processing
     * @returns {Number}
     */
    static getPortionSize() {
        return 20;
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
        return new vow.Promise((resolve, reject) => {
            fs.readFile(filePath, {encoding: 'utf-8'}, (error, content) => {
                if(error || !content) {
                    this.logger.error(
                        `Error occur while loading file for page: ${page.url} and language ${language}`);
                    this.logger.error(error.message);
                    reject(error);
                } else {
                    resolve(content);
                }
            });
        });
    }

    /**
     * Loads file to cache
     * @param {Model} model - data model
     * @param {Object} page - page object
     * @param {Array} languages - configured languages array
     * @returns {Promise}
     * @private
     */
    processPage(model, page, languages) {
        return vow.allResolved(languages.map((language) => {
            const isLocalFile = this.getCriteria(page, language);
            let filePath;
            let fileName;
            let fileExt;
            let cacheFilePath;
            let localFilePath;

            if(!isLocalFile) {
                return Promise.resolve(page);
            }

            this.logger.debug(`load local file for language: => ${language} and page with url: => ${page.url}`);

            filePath = page[language].sourceUrl; // относительный путь к файлу
            fileName = path.basename(filePath); // имя файла (с расширением)
            fileExt = path.extname(fileName); // расширение файла

            localFilePath = path.resolve(filePath);
            cacheFilePath = path.join(page.url, (language + fileExt));

            this.logger.verbose(`filePath: ${filePath}`);
            this.logger.verbose(`fileName: ${fileName}`);
            this.logger.verbose(`fileExt: ${fileExt}`);

            return vow.allResolved([
                this.readFileFromCache(cacheFilePath),
                this._readFile(page, language, localFilePath)
            ]).spread((cache, local) => {
                // если при чтении целевого файла произошла ошибка то возвращаем отмененный промис с ошибкой
                if(local.isRejected()) {
                    return Promise.reject(local.valueOf());

                // если произошла ошибка при чтении файла из кеша, что в подавляющем большинстве
                // происходит если файла еще нет в кеше, то добавляем в модель изменений запись
                // о добавленном документе и записываем файл в кеш
                }else if(cache.isRejected()) {
                    this.logger.debug('Doc added: %s %s %s', page.url, language, page[language].title);
                    model.getChanges().pages.addAdded({type: 'doc', url: page.url, title: page[language].title});
                    return this.writeFileToCache(cacheFilePath, local.valueOf());

                // если содержимое файлов не совпадает, то это значит что файл был изменен
                // добавляем в модель изменений запись об измененном документе
                // и записываем файл в кеш
                }else if(cache.valueOf() !== local.valueOf()) {
                    this.logger.debug('Doc modified: %s %s %s', page.url, language, page[language].title);
                    model.getChanges().pages.addModified({type: 'doc', url: page.url, title: page[language].title});
                    return this.writeFileToCache(cacheFilePath, local.valueOf());

                // файл не поменялся на файловой системе с момента предыдущей проверки
                }else {
                    return Promise.resolve(page);
                }
            }).then(() => {
                // добавляем соответствующее поле в модель
                page[language].contentFile = cacheFilePath;
                return cacheFilePath;
            });
        })).then(() => {
            return page;
        });
    }

    /**
     * Reads file from cache folder
     * @param {String} filePath - path to file (relative to cache folder)
     * @returns {Promise}
     */
    readFileFromCache(filePath) {
        return vow.cast(super.readFileFromCache(filePath));
    }
}

