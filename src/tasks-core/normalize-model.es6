import Q from 'q';

export default function normalizeModel(model) {
    return function() {
        return Q(model.normalize()).thenResolve(model);
    };
}
