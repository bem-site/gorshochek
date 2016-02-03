import Q from 'q';

/**
 * Normalize model. Adds default values for some of fields and fix broken values
 * @param {Model} model - application model instance
 * @returns {Function}
 * @example
 * var Q = require('q');
 * var gorshochek = require('gorshochek');
 * var model = gorshochek.createModel();
 * Q()
 *    .then(tasks.core.mergeModels(model, {modelPath: './examples/model.ru.json'}))
 *    .then(tasks.core.normalizeModel(model))
 *    .then(tasks.core.saveModel(model))
 *    .then(tasks.core.rsync(model, {
 *        dest: './data',
 *        exclude: ['*.meta.json', 'model.json', '*.md']
 *    }))
 *    .done();
 */
export default function normalizeModel(model) {
    return function() {
        return Q(model.normalize()).thenResolve(model);
    };
}
