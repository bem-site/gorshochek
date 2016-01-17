var Q = require('q'),
    Model = require('../../../lib/model'),
    baseUtil = require('../../../lib/util'),
    saveModel = require('../../../lib/tasks-core/save-model');

describe('tasks-core/save-model', function() {
    var sandbox = sinon.sandbox.create(),
        model = new Model();

    beforeEach(function() {
        sandbox.stub(console, 'error');
        sandbox.stub(baseUtil, 'writeFile').returns(Q());
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return function as result', function() {
        saveModel(model).should.be.instanceOf(Function);
    });

    it('should return promise with model instance', function() {
        return saveModel(model)().should.eventually.be.instanceOf(Model);
    });

    it('should save model file to default path: .builder/cache/data.json', function() {
        return saveModel(model)().then(function() {
            baseUtil.writeFile.should.be.calledWith('.builder/cache/data.json');
        });
    });

    it('should dave model file to given path defined by "dataPath" option', function() {
        return saveModel(model, {dataPath: './some-path'})().then(function() {
            baseUtil.writeFile.should.be.calledWith('some-path/data.json');
        });
    });

    it('should show valid console error message if model saving error occur', function() {
        baseUtil.writeFile.returns(Q.reject('some-error'));

        return saveModel(model)().catch(function() {
            console.error.should.be.calledTwice;
            console.error.firstCall.should.be.calledWith('Error occur while saving model to file');
        });
    });

    it('should return rejected promise if model saving error occur', function() {
        baseUtil.writeFile.returns(Q.reject('some-error'));
        return saveModel(model)().should.be.rejectedWith('some-error');
    });
});
