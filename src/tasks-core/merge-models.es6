import path from 'path';
import _ from 'lodash';
import Q from 'q';
import debug from 'debug';
import * as baseUtil from '../util';

debug = debug('merge-models');

export default function(model, options) {
    options || (options = {});

    if(!_.has(options, 'modelPath')) {
        throw new Error('modelPath should be defined in task options');
    }

    /**
     * Prints changes for all types to log
     * @param {Model} model - application model
     * @private
     */
    function logModelChanges(model) {
        ['added', 'modified', 'removed'].forEach(type => {
            model.getChanges()[type].forEach(item => {
                console.info(`Page with url: ${item.url} was ${type}`);
            });
        });
    }

    /**
     * Copies new model file into cache folder and replace old model file
     * @returns {Promise}
     */
    function replaceModelFileInCache() {
        return baseUtil.copyFile(_.get(options, 'modelPath'), path.join(baseUtil.getCacheFolder(), 'model.json'));
    }

    return function() {
        return Q.all([
                baseUtil.readFileFromCache('model.json', true, []),
                baseUtil.readJSONFile(_.get(options, 'modelPath'), null)
            ])
            .spread(model.merge.bind(model))
            .then(logModelChanges)
            .then(replaceModelFileInCache)
            .thenResolve(model);
    };
}
