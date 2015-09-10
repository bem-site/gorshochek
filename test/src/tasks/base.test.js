var fs = require('fs'),
    fsExtra = require('fs-extra'),
    Config = require('../../../lib/config'),
    TaskBase = require('../../../lib/tasks/base');

describe('TaskBase', function () {
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
            it('should resolved with content of file', function (done) {
                task.readFileFromCache('./file1').then(function (content) {
                    content.should.equal('foo1');
                    done();
                });
            });

            it('should rejected on error if file does not exists', function (done) {
                task.readFileFromCache('./invalid-file').catch(function (error) {
                    error.code.should.equal('ENOENT');
                    done();
                });
            });
        });

        describe('writeFileToCache', function () {
            it('should resolved after success file saving', function (done) {
                task.writeFileToCache('./file2', 'foo3').then(function () {
                    task.readFileFromCache('./file2').then(function (content) {
                        content.should.equal('foo3');
                        done();
                    });
                });
            });

            it('should rejected on error if path to file is invalid', function (done) {
                task.writeFileToCache('./foo/bar', 'foo1').catch(function (error) {
                    error.code.should.equal('ENOENT');
                    done();
                });
            });
        });

        it('run', function (done) {
            task.run().then(function (result) {
                result.should.equal(true);
                done();
            });
        });
    });
});
