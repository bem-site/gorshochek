var path = require('path'),
    Q = require('q'),
    Model = require('../../../lib/model'),
    baseUtil = require('../../../lib/util'),
    mergeModels = require('../../../lib/tasks-core/merge-models');

describe('tasks-core/merge-models', function() {
    var sandbox = sinon.sandbox.create(),
        model = new Model(),
        options = {modelPath: './some-model.json'},

        modelMergeStub,
        consoleInfoStub,
        copyFileStub,
        readFileFromCacheStub,
        readJSONFileStub;

    beforeEach(function() {
        consoleInfoStub = sandbox.stub(console, 'info');
        readJSONFileStub = sandbox.stub(baseUtil, 'readJSONFile').returns(Q([]));
        copyFileStub = sandbox.stub(baseUtil, 'copyFile').returns(Q());
        readFileFromCacheStub = sandbox.stub(baseUtil, 'readFileFromCache').returns(Q([]));
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should throw error if modelPath parameter was not set on initialization', function() {
        (function() {return mergeModels(model)}).should.throw('modelPath should be defined in task options');
    });

    it('should return function as result', function() {
        mergeModels(model, options).should.be.instanceOf(Function);
    });

    it('should read current model from local path given by "modelPath" option', function() {
        return mergeModels(model, options)().then(function() {
            readJSONFileStub.should.be.calledOnce;
            readJSONFileStub.should.be.calledWithExactly('./some-model.json', null);
        });
    });

    it('should read old model from cache', function() {
        return mergeModels(model, options)().then(function() {
            readFileFromCacheStub.should.be.calledOnce;
            readFileFromCacheStub.should.be.calledWithExactly('model.json', true, []);
        });
    });

    it('should merge models and find differences', function() {
        var modelMergeSpy = sandbox.spy(model, 'merge');

        return mergeModels(model, options)().then(function() {
            modelMergeSpy.should.be.calledOnce;
            modelMergeSpy.should.be.calledWithExactly([], []);
        });
    });

    it('should replace old model file by current', function() {
        return mergeModels(model, options)().then(function() {
            copyFileStub.should.be.calledOnce;
            copyFileStub.should.be.calledWithExactly('./some-model.json', '.builder/cache/model.json');
        });
    });

    it('should log model changes after merging models', function() {
        readJSONFileStub.returns([{url: '/url1'}]);
        return mergeModels(model, options)().then(function() {
            consoleInfoStub.should.be.calledOnce;
            consoleInfoStub.should.be.calledWith('Page with url: /url1 was added')
        });
    });

    it('should return promise with model instance', function() {
        return mergeModels(model, options)().should.eventually.eql(model);
    });
});
