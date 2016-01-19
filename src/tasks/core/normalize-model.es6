import Q from 'q';

/**
 * Normalize model. Adds default values for some of fields and fix broken values
 * @param {Model} model - application model instance
 * @returns {Function}
 */
export default function normalizeModel(model) {
    return function() {
        return Q(model.normalize()).thenResolve(model);
    };
}
