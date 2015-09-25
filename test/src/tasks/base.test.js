var fs = require('fs'),
    should = require('should'),
    fsExtra = require('fs-extra'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model');
    TaskBase = require('../../../lib/tasks/base');

describe('Base', function () {
    beforeEach(function () {
        fsExtra.ensureDirSync('./.builder/cache');
        fs.writeFileSync('./.builder/cache/file1', 'foo1', { encoding: 'utf-8' });
        fs.writeFileSync('./.builder/cache/file2', 'foo2', { encoding: 'utf-8' });
    });

    afterEach(function () {
        fsExtra.removeSync('./.builder');
    });

    it('should return valid task name', function () {
       TaskBase.getName().should.equal('base');
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
        });

        describe('readFileFromCache', function () {
            it('should be resolved with content of file', function () {
                return task.readFileFromCache('./file1').then(function (content) {
                    content.should.equal('foo1');
                });
            });

            it('should be rejected on error if file does not exists', function () {
                return task.readFileFromCache('./invalid-file').catch(function (error) {
                    error.code.should.equal('ENOENT');
                });
            });
        });

        describe('writeFileToCache', function () {
            it('should be resolved after success file saving', function () {
                return task.writeFileToCache('./file2', 'foo3').then(function () {
                    return task.readFileFromCache('./file2').then(function (content) {
                        content.should.equal('foo3');
                    });
                });
            });
        });

        describe('getCriteria', function () {
            it('should return false', function () {
                task.getCriteria().should.equal(false);
            });
        });

        describe('processPage', function () {
            it('should return resolved promise with page', function () {
                var model = new Model(),
                    page = { url: '/url1' };
                return task.processPage(model, page, ['en', 'ru']).then(function (result) {
                    should.deepEqual(result, page);
                });
            });
        });

        it('run', function () {
            return task.run().then(function (result) {
                result.should.equal(true);
            });
        });
    });
});
