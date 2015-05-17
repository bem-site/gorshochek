var fs = require('fs'),
    mockFs = require('mock-fs'),
    Logger = require('bem-site-logger'),
    Config = require('../../../lib/config'),
    TaskBase = require('../../../lib/tasks/base');

describe('TaskBase', function () {
    before(function () {
        var configFile = fs.readFileSync('./test/stub/.builder/make.js', { encoding: 'utf-8' });
        mockFs({
            '.builder': {
              'make.js': configFile
            },
            cache: {},
            data: {}
        });
    });

    after(function () {
        mockFs.restore();
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
});
