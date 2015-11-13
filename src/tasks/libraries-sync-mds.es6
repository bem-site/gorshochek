/**
 * Module for sync libraries MDS libraries data with local system
 * @module src/tasks/libraries-sync-mds.es6
 * @author Kuznetsov Andrey
 */

import path from 'path';
import fsExtra from 'fs-extra';
import MDS from 'mds-wrapper';
import Q from 'q';
import _ from 'lodash';
import LibrariesBase from './libraries-base';

/**
 * @exports
 * @class LibrariesSyncMDS
 * @desc Sync libraries MDS libraries data with local system
 */
export default class LibrariesSyncMDS extends LibrariesBase {

    /**
     * Constructor
     * @param {Config} baseConfig common configuration instance
     * @param {Object} taskConfig special task configuration object
     */
    constructor(baseConfig, taskConfig) {
        super(baseConfig, taskConfig);

        const mdsOptions = taskConfig['mds'];

        if(!mdsOptions) {
            throw new Error('MDS options were not set in task configuration');
        }

        if(!mdsOptions['namespace']) {
            throw new Error('MDS "namespace" property was not set in task configuration');
        }

        if(!mdsOptions['host']) {
            this.logger.warn('MDS host was not set. Default value "127.0.0.1" will be used instead');
            mdsOptions['host'] = '127.0.0.1';
        }

        if(!mdsOptions['port']) {
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

        mdsConfig.post = mdsConfig.get;
        this.api = new MDS(mdsConfig);
    }

    /**
     * Returns module instance for log purposes
     * @returns {Module}
     * @static
     */
    static getLoggerName() {
        return module;
    }

    /**
     * Return task human readable description
     * @returns {String} path
     * @static
     */
    static getName() {
        return 'synchronize libraries data with remote mds storage';
    }

    /**
     * Loads JSON registry file from local cache
     * @returns {Promise}
     * @private
     */
    _getRegistryFromMDS() {
        // загружаем файл реестра с MDS хранилища с помощью MDS API
        // по url: http://{mds host}:{mds port}/get-{mds namespace}/root
        return Q.nfcall(this.api.read, 'root')
            .then(content => {
                return content ? JSON.parse(content) : {};
            })
            .catch(error => {
                this.logger
                    .error(error ? error.message : 'Registry was not found or empty')
                    .warn('Can not load registry file from MDS storage. ' +
                    'Please verify your mds settings. Registry will be assumed as empty');
                return {};
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
        return Object.keys(registry).reduce((prev, lib) => {
            const versions = registry[lib].versions;
            if(versions) {
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
            const item = {lib: k[0], version: k[1]};

            this.logger.debug(`${type} lib: => ${item.lib} version: => ${item.version}`);
            model.getChanges().pages['add' + type](item);
            collection.push(item);
        };

        [...remoteCM.keys()].forEach(key => {
            !localCM.has(key) && processItem(key, added, 'Added');
        });

        [...remoteCM.keys()].forEach(key => {
            if(localCM.has(key)) {
                const vLocal = localCM.get(key);
                const vRemote = remoteCM.get(key);
                if(vLocal['sha'] !== vRemote['sha'] || vLocal['date'] !== vRemote['date']) {
                    processItem(key, modified, 'Modified');
                }
            }
        });

        [...localCM.keys()].forEach(key => {
            !remoteCM.has(key) && processItem(key, removed, 'Removed');
        });

        return {added, modified, removed};
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
        const filePath = path.join(
            this.getLibVersionPath(lib, version), LibrariesBase.getLibVersionDataFilename());

        this.logger.debug(`Load file for library: ${lib} and version: ${version}`);

        // загружается файл с MDS хранилища по url:
        // http://{mds host}:{mds port}/{get-namespace}/{lib}/{version}/data.json
        // сохраняется на файловую систему по пути:
        // {директория кеша}/{baseUrl|libs}/{lib}/{version}/mds.data.json
        return Q.nfcall(fsExtra.ensureDir, this.getLibVersionPath(lib, version))
            .then(() => {
                return Q.nfcall(this.api.read, `${lib}/${version}/data.json`);
            })
            .then(content => {
                return this.writeFileToCache(filePath, content);
            })
            .thenResolve(item)
            .catch(error => {
                this.logger
                    .error(error.message)
                    .error(`Error occur while loading "data.json" file from MDS ` +
                    `for library: ${lib} and version: ${version}`);
                throw error;
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

        return Q.nfcall(fsExtra.remove, this.getLibVersionPath(lib, version))
            .catch(error => {
                this.logger
                    .error(error.message)
                    .error(`Error occur while remove library version mds.data.json file from cache` +
                    `for library: ${lib} and version: ${version}`);
                throw error;
            });
    }

    /**
     * Performs task
     * @public
     * @returns {Promise}
     * @public
     */
    run(model) {
        this.beforeRun();

        fsExtra.ensureDirSync(this.getLibrariesCachePath());

        let _remote;

        return Q.all([
                this.readFileFromCache('registry.json', true),
                this._getRegistryFromMDS()
            ])
            .spread((local, remote) => {
                _remote = remote;
                return this._compareRegistryFiles(model, local, remote);
            })
            .then((diff) => {
                return Q.all([
                    Q([].concat(diff.added).concat(diff.modified)),
                    Q([].concat(diff.removed).concat(diff.modified))
                ]);
            })
            .spread((downloadQueue, removeQueue) => {
                return Q.all(removeQueue.map(this._removeLibraryVersionFolder.bind(this)))
                    .thenResolve(downloadQueue);
            })
            .then((downloadQueue) => {
                const portions = _.chunk(downloadQueue, 5);
                return portions.reduce((prev, portion) => {
                    return prev.then(() => {
                        return Q.all(portion.map(this._saveLibraryVersionFile.bind(this)));
                    });
                }, Q());
            })
            .then(() => {
                return this.writeFileToCache('registry.json', JSON.stringify(_remote));
            })
            .then(() => {
                this.logger.info(`Successfully finish task "${this.constructor.getName()}"`);
                return Q(model);
            });
    }
}
