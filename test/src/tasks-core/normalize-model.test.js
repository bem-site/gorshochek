var Model = require('../../../lib/model'),
    normalizeModel = require('../../../index').tasks.core.normalizeModel;

describe('tasks-core/normalize-model', function() {
    var sandbox = sinon.sandbox.create(),
        model = new Model();

    it('should return function as result', function() {
        normalizeModel(model).should.be.instanceOf(Function);
    });

    it('should call model normalization function', function() {
        sandbox.stub(model, 'normalize').returns(model);
        return normalizeModel(model)().then(function() {
            model.normalize.should.be.called;
        });
    });

    it('should return promise with model instance', function() {
        return normalizeModel(model)().should.eventually.instanceOf(Model);
    });
});
