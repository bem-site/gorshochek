import Q from 'q';

export default function(model) {
    return function() {
        return Q(model.normalize()).thenResolve(model);
    };
}
