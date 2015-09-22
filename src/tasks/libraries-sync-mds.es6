/**
 * Module for sync libraries MDS libraries data with local system
 * @module src/tasks/libraries-sync-mds.es6
 * @author Kuznetsov Andrey
 */

import fs from 'fs';
import path from 'path';
import fsExtra from 'fs-extra';
import MDS from 'mds-wrapper';
import vow from 'vow';
import _ from 'lodash';
import LibrariesBase from './libraries-base';

/**
 * @exports
 * @class LibrariesSyncMDS
 * @desc Sync libraries MDS libraries data with local system
 */
export default class LibrariesSyncMDS extends LibrariesBase {

    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig);

        const mdsOptions = taskConfig['mds'];

        // настройки для подключения к MDS - обязательный параметр!
        if (!mdsOptions) {
            throw new Error('MDS options were not set in task configuration');
        }

        // пространство имен для подключения к MDS - обязательный параметр
        if (!mdsOptions['namespace']) {
            throw new Error('MDS "namespace" property was not set in task configuration');
        }

        // хост MDS - 127.0.0.1 по умолчанию
        if (!mdsOptions['host']) {
            this.logger.warn('MDS host was not set. Default value "127.0.0.1" will be used instead');
            mdsOptions['host'] = '127.0.0.1';
        }

        // порт MDS - 80 по умолчанию
        if (!mdsOptions['port']) {
            this.logger.warn('MDS port was not set. Default value "80" will be used instead');
            mdsOptions['port'] = 80;
        }

        const mdsConfig = {
            debug: mdsOptions['debug'] || false,
            namespace: mdsOptions['namespace'],
            get: {
                host: mdsOptions['host'],
                port: mdsOptions['port']
            }
        };

        // в рамках задач сборки будут использоваться только get запросы
        // на чтение данных с mds хранилища, поэтому здесь не принципиальны настроки для post запросов
        mdsConfig.post = mdsConfig.get;
        this.api = new MDS(mdsConfig);
    }

    /**
     * Returns module instance for log purposes
     * @static
     * @returns {Module}
     */
    static getLoggerName () {
        return module;
    }

    /**
     * Return task human readable description
     * @static
     * @returns {String} path
     */
    static getName () {
        return 'synchronize libraries data with remote mds storage';
    }


    /**
     * Returns path to cached "registry.json" file on local filesystem
     * @returns {String} path
     * @private
     */
    _getMDSRegistryFilePath() {
        return path.join(this.getLibrariesCachePath(), 'registry.json');
    }

    /**
     * Loads JSON registry file from remote MDS source
     * @returns {Promise}
     * @private
     */
    _getRegistryFromCache() {
        // загружаем файл реестра из кеша с локальной файловловой системы
        // если такого файла нет, то локальный реестр считается пустым
        return new Promise(resolve => {
            fsExtra.readJSON(this._getMDSRegistryFilePath(), (error, content) => {
                return resolve((error || !content) ? {} : content);
            });
        });
    }

    /**
     * Loads JSON registry file from local cache
     * @returns {Promise}
     * @private
     */
    _getRegistryFromMDS() {
        const REGISTRY_MDS_KEY = 'root';

        // загружаем файл реестра с MDS хранилища с помощью MDS API
        // по url: http://{mds host}:{mds port}/get-{mds namespace}/root
        return new Promise((resolve) => {
            this.api.read(REGISTRY_MDS_KEY, (error, content) => {
                if(error || !content) {
                    this.logger
                        .error(error ? error.message : 'Registry was not found or empty')
                        .warn('Can not load registry file from MDS storage. ' +
                        'Please verify your mds settings. Registry will be assumed as empty');
                    return resolve({});
                }
                resolve(JSON.parse(content));
            });
        });
    }

    /**
     * Creates Map instance with complex keys built as combination of library and version names
     * {lib}||{version} and object values which contains sha sums and build dates
     * @param {Object} registry object
     * @returns {Map}
     * @private
     */
    _createComparatorMap(registry) {
        // Для поиска различий между объекстами реестров построить объект класса Map
        // в котором в качестве ключей будут уникальные сочетания названий библиотек и версий
        // а в качестве значений - объекты в которых хранятся поля по которым можно проверить
        // изменились ли данные для версии библиотеки или нет (sha-сумма и дата сборки в миллисекундах)
        return Object.keys(registry).reduce((prev, lib) => {
            const versions = registry[lib].versions;
            if (versions) {
                Object.keys(versions).forEach(version => {
                    prev.set(`${lib}||${version}`, versions[version]);
                });
            }
            return prev;
        }, new Map());
    }

    /**
     * Compare registry objects loaded from local filesystem and remote mds host
     * Finds differences between them and fills model changes structure
     * @param {Model} model object
     * @param {Object} local - registry object loaded from local filesystem
     * @param {Object} remote - registry object loaded from remote MDS host
     * @returns {{added: Array, modified: Array, removed: Array}}
     * @private
     */
    _compareRegistryFiles(model, local, remote) {
        const localCM = this._createComparatorMap(local);
        const remoteCM = this._createComparatorMap(remote);
        const added = [];
        const modified = [];
        const removed = [];
        const processItem = (key, collection, type) => {
            const k = key.split('||');
            const item = { lib: k[0], version: k[1] };

            this.logger.debug(`${type} lib: => ${item.lib} version: => ${item.version}`);
            model.getChanges().pages['add' + type](item);
            collection.push(item);
        };

        // происходит итерация по ключам Map построенного для реестра загруженного с MDS хоста
        // если локальный Map не содержит сочетания {lib}||{version}, то версия {version} библиотеки
        // {lib} считается добавленной (новой)
        [...remoteCM.keys()].forEach(key => {
            !localCM.has(key) && processItem(key, added, 'Added');
        });

        // если ключи {lib}||{version} присутствуют в обоих Map объектах, то сравниваются значения
        // для этих ключей. Если sha-суммы или даты сборки не совпадают, то версия {version} библиотеки
        // {lib} считается модифицированной (измененной)
        [...remoteCM.keys()].forEach(key => {
            if (localCM.has(key)) {
                const vLocal = localCM.get(key);
                const vRemote = remoteCM.get(key);
                if (vLocal['sha'] !== vRemote['sha'] || vLocal['date'] !== vRemote['date']) {
                    processItem(key, modified, 'Modified');
                }
            }
        });

        // происходит итерация по ключам Map построенного для реестра загруженного с локальной файловой системы
        // если Map загруженный с MDS не содержит сочетания {lib}||{version}, то версия {version} библиотеки
        // {lib} считается удаленной
        [...localCM.keys()].forEach(key => {
            !remoteCM.has(key) && processItem(key, removed, 'Removed');
        });

        return { added, modified, removed };
    }

    /**
     * Downloads library version data.json file from MDS storage to local filesystem
     * @param {Object} item
     * @param {String} item.lib - name of library
     * @param {String} item.version - name of library version
     * @returns {Promise}
     * @private
     */
    _saveLibraryVersionFile(item) {
        const lib = item.lib;
        const version = item.version;
        const onError = (error, lib, version) => {
            this.logger
                .error(error.message)
                .error(`Error occur while loading "data.json" file from MDS ` +
                `for library: ${lib} and version: ${version}`);
        };

        this.logger.debug(`Load file for library: ${lib} and version: ${version}`);

        // загружается файл с MDS хранилища по url:
        // http://{mds host}:{mds port}/{get-namespace}/{lib}/{version}/data.json
        // сохраняется на файловую систему по пути:
        // {директория кеша}/{baseUrl|libs}/{lib}/{version}/mds.data.json
        return new Promise((resolve, reject) => {
            fsExtra.ensureDir(this.getLibVersionPath(lib, version), () => {
                this.api.read(`${lib}/${version}/data.json`, (error, content) => {
                    if (!error) {
                        fs.writeFile(
                            path.join(this.getLibVersionPath(lib, version), LibrariesBase.getLibVersionDataFilename()),
                            content, {encoding: 'utf-8'}, (error) => {
                                if(!error) {
                                    resolve(item);
                                } else {
                                    onError(error, lib, version);
                                    resolve(error);
                                }
                            });
                    } else {
                        onError(error, lib, version);
                        reject(error);
                    }
                });
            });
        });
    }

    /**
     * Removes library version folder from cache on local filesystem
     * @param {Object} item
     * @param {String} item.lib - name of library
     * @param {String} item.version - name of library version
     * @returns {Promise}
     * @private
     */
    _removeLibraryVersionFolder(item) {
        const lib = item.lib;
        const version = item.version;

        this.logger.debug(`Remove "data.json" file for library: ${lib} and version: ${version}`);

        return new Promise((resolve, reject) => {
            fsExtra.remove(this.getLibVersionPath(lib, version), (error) => {
                if(!error) {
                    return resolve(item);
                }
                this.logger
                    .error(error.message)
                    .error(`Error occur while remove library version mds.data.json file from cache` +
                `for library: ${lib} and version: ${version}`);
                reject(error);
            });
        });
    }

    /**
     * Performs task
     * @public
     * @returns {Promise}
     */
    run(model) {
        this.beforeRun();

        fsExtra.ensureDirSync(this.getLibrariesCachePath());

        let _remote;

        return vow
            .all([
                this._getRegistryFromCache(), // загружаем реестр с локальной файловой системы
                this._getRegistryFromMDS() // загружаем реестр с удаленного MDS хоста
            ])
            .spread((local, remote) => {
                _remote = remote;
                return this._compareRegistryFiles(model, local, remote); // сравниваем реестры, находим дифф
            })
            .then((diff) => {
                // формируем списки на удаление директорий версий библиотек
                // и на скачивание обновленных data.json файлов версий библиотек с MDS хранилища
                return vow.all([
                    vow.resolve([].concat(diff.added).concat(diff.modified)),
                    vow.resolve([].concat(diff.removed).concat(diff.modified))
                ]);
            })
            .spread((downloadQueue, removeQueue) => {
                // удаляем папки измененных и удаленных версий библиотек с локальной файловой системы
                return vow
                    .all(removeQueue.map(this._removeLibraryVersionFolder.bind(this)))
                    .then(() => {
                        return downloadQueue;
                    });
            })
            .then((downloadQueue) => {
                // порциями по 10 штук загружаем обновленные data.json файлы
                // и складываем их на файловую систему
                const portions = _.chunk(downloadQueue, 5);
                return portions.reduce((prev, portion) => {
                    return prev.then(() => {
                        return vow.all(portion.map(this._saveLibraryVersionFile.bind(this)));
                    });
                }, vow.resolve());
            })
            .then(() => {
                return new Promise((resolve) => {
                    fsExtra.writeJSON(this._getMDSRegistryFilePath(), _remote, (error) => {
                        if (error) {
                            this.logger
                                .error('Error occur on saving MDS registry file')
                                .error(`Error: ${error.message}`);
                        }
                        this.logger.debug('MDS Registry file has been successfully replaced');
                        resolve();
                    });
                });
            })
            .then(() => {
                // выводим сообщение об успешном завершении задачи
                this.logger.info(`Successfully finish task "${this.constructor.getName()}"`);
                return Promise.resolve(model);
            });
    }
}
