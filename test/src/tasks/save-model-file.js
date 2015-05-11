var fs = require('fs'),
    path = require('path'),
    should = require('should'),
    fsExtra = require('fs-extra'),
    Config = require('../../../lib/config'),
    SaveModelFile = require('../../../lib/tasks/save-model-file');

describe('SaveModelFile', function () {
    before(function () {
        process.chdir(path.resolve(__dirname, '../../stub'));
    });

    describe('instance methods', function () {
        var task,
            config;

        before(function () {
            config = new Config();
            task = new SaveModelFile(config, {});
            fsExtra.mkdirpSync(config.getCacheDirPath());
        });

        it('run', function (done) {
            task.run().then(function () {
                fs.existsSync('./cache/model.json').should.equal(true);
                done();
            });
        });
    });

    after(function () {
        fsExtra.removeSync('./cache');
        process.chdir(path.resolve(__dirname, '../../../'));
    });
});
