/**
 * Base libraries task module
 * @module src/tasks/libraries-base.es6
 * @author Kuznetsov Andrey
 */

import path from 'path';
import Base from './base';

/**
 * @exports
 * @class LibrariesBase
 * @desc Sync libraries MDS libraries data with local system
 */
export default class LibrariesBase extends Base {
    /**
     * Returns module instance for log purposes
     * @static
     * @returns {Module}
     */
    static getLoggerName() {
        return module;
    }

    /**
     * Return task human readable description
     * @static
     * @returns {String} path
     */
    static getName() {
        return 'base libraries class';
    }

    /**
     * Returns name of file which should be used for library version data files loaded from remote sources
     * @static
     * @returns {String}
     */
    static getLibVersionDataFilename() {
        return 'storage.data.json';
    }

    /**
     * Returns libraries cache path
     * @returns {String} path
     * @protected
     */
    getLibrariesCachePath() {
        return path.join(this.getBaseConfig().getCacheFolder(), (this.getTaskConfig()['baseUrl'] || '/libs'));
    }

    /**
     * Returns path for saving library version data file from mds storage into cache folder
     * @param {String} lib - name of library
     * @param {String} version - name of library version
     * @returns {String} path
     * @protected
     */
    getLibVersionPath(lib, version) {
        return path.join(this.getLibrariesCachePath(), lib, version);
    }
}
