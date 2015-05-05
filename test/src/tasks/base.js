var path = require('path'),
    should = require('should'),
    Logger = require('bem-site-logger'),
    Config = require('../../../lib/config'),
    TaskBase = require('../../../lib/tasks/base');

describe('TaskBase', function () {
    before(function () {
        process.chdir(path.resolve(__dirname, '../../stub'));
    });

    it('initialization', function () {
        // TODO implement initialization tests
    });

    describe('instance methods', function () {
        var task;

        before(function () {
            var config = new Config();
            task = new TaskBase(config, {}, { module: module, name: 'test base' });
        });

        it('getBaseConfig', function () {
            task.getBaseConfig().should.be.instanceOf(Config);
        });

        it('getTaskConfig', function () {
            task.getTaskConfig().should.be.instanceOf(Object);
            Object.keys(task.getTaskConfig()).should.have.length(0);
        });

        it('run', function (done) {
            task.run().then(function (result) {
                result.should.equal(true);
                done();
            });
        });
    });

    after(function () {
        process.chdir(path.resolve(__dirname, '../../../'));
    });
});
