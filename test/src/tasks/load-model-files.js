var fs = require('fs'),
    path = require('path'),
    should = require('should'),
    fsExtra = require('fs-extra'),
    Config = require('../../../lib/config'),
    LoadModelFiles = require('../../../lib/tasks/load-model-files');

describe('LoadModelFiles', function () {
    describe('model file does not exist', function () {
        var task,
            config;

        before(function (done) {
            process.chdir(path.resolve(__dirname, '../../stub'));
            config = new Config();
            task = new LoadModelFiles(config, {});
            fsExtra.move('./model/model.json', './model/_model.json', function () {
                done();
            });
        });

        it('run', function (done) {
            task.run().catch(function (error) {
                error.message.indexOf('Can\'t read or parse model file').should.above(-1);
                done();
            });
        });

        after(function (done) {
            fsExtra.move('./model/_model.json', './model/model.json', function () {
                done();
            });
        });
    });
});
