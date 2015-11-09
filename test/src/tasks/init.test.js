var path = require('path'),
    vow = require('vow'),
    fsExtra = require('fs-extra'),
    sinon = require('sinon'),
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
        task.readFileFromCache.returns(vow.resolve([]));
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return valid task name', function() {
        Init.getName().should.equal('init');
    });

    it('should create cache folder if it does not exists yet', function() {
        return task.run(new Model()).then(function() {
            fsExtra.ensureDirSync.firstCall.calledWith(config.getCacheFolder()).should.equal(true);
        });
    });

    it ('should create data folder if it does not exists yet', function() {
        return task.run(new Model()).then(function() {
            fsExtra.ensureDirSync.secondCall.calledWith(config.getDataFolder()).should.equal(true);
        });
    });

    it('should return rejected promise if new model was not found', function() {
        fsExtra.readJSON.yields(new Error('old model was not found'));
        return task.run(new Model()).catch(function(error) {
            error.message.should.be.equal('old model was not found');
        });
    });

    it('should work with empty odl model if old model file does not exists', function() {
        var setOldModel = sandbox.spy(Model.prototype, 'setOldModel');
        var error = new Error('error');
        error.code = 'ENOENT';
        task.readFileFromCache.returns(vow.reject(error));
        return task.run(new Model()).then(function() {
            setOldModel.calledWith([]).should.be.equal(true);
        });
    });

    it('should return rejected promise if loading of old model file was failed by another reason', function() {
        task.readFileFromCache.returns(vow.reject(new Error('IO error')));
        return task.run(new Model()).catch(function(error) {
            error.message.should.be.equal('IO error');
        });
    });

    it('should merge old and new models', function() {
        var merge = sandbox.spy(Model.prototype, 'merge');
        return task.run(new Model()).then(function() {
            merge.calledOnce.should.be.equal(true);
        });
    });

    it('should replace old model file by new model file', function() {
        return task.run(new Model()).then(function() {
            fsExtra.copy
                .calledWith(config.getModelFilePath(), path.join(config.getCacheFolder(), 'model.json'))
                .should.be.equal(true);
        });
    });

    it('should normalize merged model', function() {
        var normalize = sandbox.spy(Model.prototype, 'normalize');
        return task.run(new Model()).then(function() {
            normalize.calledOnce.should.be.equal(true);
        });
    });

    it('should return fulfilled promise with model instance', function() {
        return task.run(new Model()).then(function(model) {
            model.should.be.instanceOf(Model);
        });
    });
});

