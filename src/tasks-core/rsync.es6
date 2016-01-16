import _ from 'lodash';
import Q from 'q';
import * as baseUtil from '../util';

const debug = require('debug')('rsync');

/**
 * Synchronize files between different folders
 * @param {Model} model - application model instance
 * @param {Object} [options] - task options object
 * @param {String} [options.src] - source path. (cache folder by default)
 * @param {String} [options.dest] - destination path. (./data folder by default)
 * @param {String} [options.options] - rsync options.
 * @param {String[]} [options.exclude] - array of exclude patterns. Empty array by default
 * @returns {Function}
 */
export default function rsync(model, options = {}) {

    function prepareRsyncOptions() {
        const src = _.get(options, 'src', baseUtil.getCacheFolder());
        const dest = _.get(options, 'dest', './data');
        let rawOptions = _.get(options, 'options', '-rd --delete --delete-excluded --force');

        if(_.has(options, 'exclude')) {
            rawOptions = _.get(options, 'exclude').reduce((prev, pattern) => {
                prev += ' --exclude ' + pattern;
                return prev;
            }, rawOptions);
        }

        const rsyncOptions = {src, dest, sync: false, options: rawOptions};

        debug(rsyncOptions);
        return rsyncOptions;
    }

    return function() {
        return Q.nfcall(baseUtil.rsync, prepareRsyncOptions())
            .thenResolve(model)
            .catch(error => {
                console.error('file synchronization failed');
                console.error(error.stack);
                throw error;
            });
    };
}
