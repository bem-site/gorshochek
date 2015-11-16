var path = require('path'),
    Q = require('q'),
    fsExtra = require('fs-extra'),
    Model = require('../../../lib/model/model'),
    Config = require('../../../lib/config'),
    Init = require('../../../lib/tasks/init');

describe('Init', function() {
    var sandbox = sinon.sandbox.create(),
        config = new Config(),
        task;

    beforeEach(function() {
        task = new Init(config, {});
        sandbox.stub(fsExtra);
        sandbox.stub(task, 'readFileFromCache');

        fsExtra.copy.yields(null);
        fsExtra.readJSON.yields(null, []);
        task.readFileFromCache.returns(Q([]));
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return valid task name', function() {
        Init.getName().should.equal('init');
    });

    it('should create cache folder if it does not exists yet', function() {
        return task.run(new Model()).then(function() {
            fsExtra.ensureDirSync.firstCall.should.be.calledWith(config.getCacheFolder());
        });
    });

    it ('should create data folder if it does not exists yet', function() {
        return task.run(new Model()).then(function() {
            fsExtra.ensureDirSync.secondCall.should.be.calledWith(config.getDataFolder());
        });
    });

    it('should return rejected promise if new model was not found', function() {
        fsExtra.readJSON.yields(new Error('old model was not found'));
        return task.run(new Model()).should.be.rejectedWith('old model was not found');
    });

    it('should work with empty odl model if old model file does not exists', function() {
        var setOldModel = sandbox.spy(Model.prototype, 'setOldModel');
        var error = new Error('error');
        error.code = 'ENOENT';
        task.readFileFromCache.returns(Q.reject(error));
        return task.run(new Model()).then(function() {
            setOldModel.should.be.calledWith([]);
        });
    });

    it('should return rejected promise if loading of old model file was failed by another reason', function() {
        task.readFileFromCache.returns(Q.reject(new Error('IO error')));
        return task.run(new Model()).should.be.rejectedWith('IO error');
    });

    it('should merge old and new models', function() {
        var merge = sandbox.spy(Model.prototype, 'merge');
        return task.run(new Model()).then(function() {
            merge.calledOnce.should.be.true;
        });
    });

    it('should replace old model file by new model file', function() {
        return task.run(new Model()).then(function() {
            fsExtra.copy.should.be.calledWithMatch(sinon.match.any,
                config.getModelFilePath(), path.join(config.getCacheFolder(), 'model.json'));
        });
    });

    it('should normalize merged model', function() {
        var normalize = sandbox.spy(Model.prototype, 'normalize');
        return task.run(new Model()).then(function() {
            normalize.should.be.calledOnce;
        });
    });

    it('should return fulfilled promise with model instance', function() {
        return task.run(new Model()).then(function(model) {
            model.should.be.instanceof(Model);
        });
    });
});

