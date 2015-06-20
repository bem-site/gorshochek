var fs = require('fs'),
    fsExtra = require('fs-extra'),
    Config = require('../../../lib/config'),
    SaveModelFile = require('../../../lib/tasks/save-model-file');

describe('SaveModelFile', function () {
    before(function () {
        fsExtra.ensureDirSync('./model');
        fsExtra.ensureDirSync('./cache');
        fsExtra.ensureDirSync('./data');

        fsExtra.copySync('./test/stub/model/model.json', './model/model.json');
    });

    after(function () {
        fsExtra.deleteSync('./model');
        fsExtra.deleteSync('./cache');
        fsExtra.deleteSync('./data');
    });

    it('should return valid task name', function () {
        SaveModelFile.getName().should.equal('save model file');
    });

    describe('instance methods', function () {
        var config = new Config('debug'),
            task;

        before(function () {
            config.setCacheFolder('./cache');
            task = new SaveModelFile(config, {});
        });

        it('run', function (done) {
            task.run().then(function () {
                fs.existsSync('./cache/model.json').should.equal(true);
                done();
            });
        });
    });
});
