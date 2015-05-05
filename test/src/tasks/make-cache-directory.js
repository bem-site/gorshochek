var fs = require('fs'),
    path = require('path'),
    should = require('should'),
    fsExtra = require('fs-extra'),
    Config = require('../../../lib/config'),
    MakeCacheDirectory = require('../../../lib/tasks/make-cache-directory');

describe('MakeCacheDirectory', function () {
    before(function () {
        process.chdir(path.resolve(__dirname, '../../stub'));
    });

    describe('instance methods', function () {
        var task,
            config;

        before(function () {
            config = new Config();
            task = new MakeCacheDirectory(config, {});
        });

        it('run', function (done) {
            task.run().then(function () {
                fs.existsSync('./cache').should.equal(true);
                done();
            });
        });
    });

    after(function () {
        fsExtra.removeSync('./cache');
        process.chdir(path.resolve(__dirname, '../../../'));
    });
});