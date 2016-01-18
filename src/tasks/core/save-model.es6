import path from 'path';
import _ from 'lodash';
import * as baseUtil from '../../util';

/**
 * Saves model to JSON file
 * @param {Model} model - application model instance
 * @param {Object} [options] - task options object
 * @param {String} [options.dataPath] - destination file path for model saving
 * @returns {Function}
 */
export default function saveModel(model, options = {}) {
    return function() {
        const destinationPath = path.join(options.dataPath || baseUtil.getCacheFolder(), 'data.json');
        return baseUtil.writeFile(destinationPath, JSON.stringify(model.getPages()))
            .thenResolve(model)
            .catch(error => {
                console.error('Error occured while saving model to file');
                console.error(error.stack);
                throw error;
            });
    };
}
