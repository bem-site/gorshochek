var path = require('path'),
    should = require('should'),
    Config = require('../../../../src/config'),
    TaskMakeDirectoryCache = require('../../../../src/tasks/make-directory/cache.js');

describe('TaskMakeDirectoryCache', function () {
    before(function () {
        process.chdir(path.resolve(__dirname, '../../../stub'));
    });

    describe('instance methods', function () {
        var task,
            config;

        before(function () {
            config = new Config();
            task = new TaskMakeDirectoryCache(config, {});
        });

        it('getName', function () {
            task.getName().should.equal('make cache directory');
        });

        it('getFolderPath', function () {
            task.getFolderPath().should.equal(config.getCacheDirPath());
        });
    });

    after(function () {
        process.chdir(path.resolve(__dirname, '../../../../'));
    });
});
