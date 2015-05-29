var fs = require('fs'),
    mockFs = require('mock-fs'),
    should = require('should'),
    Config = require('../../../lib/config'),
    MakeDirectory = require('../../../lib/tasks/make-directory');

describe('MakeDirectory', function () {
    beforeEach(function () {
        mockFs({});
    });

    afterEach(function () {
        mockFs.restore();
    });

    it('should return valid task name', function () {
        MakeDirectory.getName().should.equal('make directory');
    });

    describe('instance methods', function () {
        describe('run', function (done) {
            it('should create new dir if it does not exists yet', function (done) {
                var task = new MakeDirectory(new Config(), { path: './foo' });
                task.run().then(function () {
                    var exists = fs.existsSync('./foo');
                    exists.should.equal(true);
                    done();
                });
            });

            it('should successfully resolved if directory already exists', function (done) {
                fs.mkdirSync('./foo');
                var task = new MakeDirectory(new Config(), { path: './foo' });
                task.run().then(function () {
                    var exists = fs.existsSync('./foo');
                    exists.should.equal(true);
                    done();
                });
            });

            /*
            it('should rejected if directory path invalid', function (done) {
                var task = new MakeDirectory(new Config(), { path: './foo/bar' });
                task.run().catch(function (error) {
                    error.code.should.equal('ENOENT');
                    done();
                });
            });
            */
        });
    });
});
