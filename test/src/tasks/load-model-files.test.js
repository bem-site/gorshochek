var fs = require('fs'),
    should = require('should'),
    mockFs = require('mock-fs'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    LoadModelFiles = require('../../../lib/tasks/load-model-files');

describe('LoadModelFiles', function () {
    var config,
        model,
        task;

    beforeEach(function () {
        mockFs({
            model: {
                'model.json': JSON.stringify([])
            },
            '.builder': {
                cache: {}
            }
        });

        model = new Model();
        config = new Config('debug');
        task = new LoadModelFiles(config, {});
    });

    afterEach(function () {
        mockFs.restore();
    });

    it('should return valid task name', function () {
        LoadModelFiles.getName().should.equal('load model files');
    });

    it('should be rejected if new model file is missed or invalid', function (done) {
        config.setModelFilePath('./model/invalid_model.json');
        task.run(model).catch(function (error) {
            error.message.indexOf('Can\'t read or parse model file').should.above(-1);
            done();
        });
    });

    it('should be resolved if new model file exists', function (done) {
        task.run(model).then(function (model) {
            should.deepEqual(model.getNewModel(), []);
            done();
        });
    });

    it('should take old model if it exists', function (done) {
        fs.writeFileSync('./.builder/cache/model.json', JSON.stringify([
            {
                url: '/old-model/url'
            }
        ]));
        task.run(model).then(function (model) {
            should.deepEqual(model.getNewModel(), []);
            should.deepEqual(model.getOldModel(), [{
                url: '/old-model/url'
            }]);
            done();
        });
    });

    it('should create empty old model if it does not exist', function (done) {
        task.run(model).then(function (model) {
            should.deepEqual(model.getNewModel(), []);
            should.deepEqual(model.getOldModel(), []);
            done();
        });
    });
});
