var path = require('path'),
    should = require('should'),
    Config = require('../../../../src/config'),
    TaskMakeDirectoryData = require('../../../../src/tasks/make-directory/data.js');

describe('TaskMakeDirectoryData', function () {
    before(function () {
        process.chdir(path.resolve(__dirname, '../../../stub'));
    });

    describe('instance methods', function () {
        var task,
            config;

        before(function () {
            config = new Config();
            task = new TaskMakeDirectoryData(config, {});
        });

        it('getName', function () {
            task.getName().should.equal('make data directory');
        });

        it('getFolderPath', function () {
            task.getFolderPath().should.equal(config.getDestinationDirPath());
        });
    });

    after(function () {
        process.chdir(path.resolve(__dirname, '../../../../'));
    });
});
