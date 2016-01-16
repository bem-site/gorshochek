import path from 'path';
import _ from 'lodash';
import Q from 'q';
import * as baseUtil from '../util';

/**
 * Find difference between current and previous models
 * Merges models and saves current model file in cache
 * @param {Model} model - application model instance
 * @param {Object} options - options object
 * @param {Object} options.modelPath - path to model JSON file
 * @returns {Function}
 */
export default function mergeModels(model, options = {}) {

    if(!_.has(options, 'modelPath')) {
        throw new Error('modelPath should be defined in task options');
    }

    /**
     * Prints changes for all types to log
     * @param {Model} model - application model
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
