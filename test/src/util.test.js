var fs = require('fs'),
    fsExtra = require('fs-extra'),
    Q = require('q'),

    util = require('../../lib/util');

describe('util', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function() {
        sandbox.stub(console, 'error');
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return valid path to cache folder', function() {
        util.getCacheFolder().should.equal('./.builder/cache');
    });

    it('should create folder with given path', function() {
        sandbox.stub(fsExtra, 'ensureDirSync');
        util.createFolder('./some-path');
        fsExtra.ensureDirSync.should.be.calledWithExactly('./some-path');
    });

    it('should copy file from given source to given destination path', function() {
        sandbox.stub(fsExtra, 'copy').yields(null);
        return util.copyFile('./some-source-path', './some-destination-path').then(function() {
            fsExtra.copy.should.be.calledWith('./some-source-path', './some-destination-path');
        });
    });

    describe('readFile', function() {
        var readFileStub;

        beforeEach(function() {
            readFileStub = sandbox.stub(fs, 'readFile');
        });

        it('should call properly method with valid params for file reading from file system', function() {
            readFileStub.yields();
            return util.readFile('./some-path').then(function() {
                fs.readFile.should.be.calledWith('./some-path', {encoding: 'utf-8'});
            });
        });

        it('should read and return content from file on file system', function() {
            readFileStub.yields(null, 'Hello World');
            return util.readFile('./some-path').should.eventually.equal('Hello World');
        });

        it('should rejected with error if fs error occur and fallback value was not set', function() {
            readFileStub.yields(new Error('some-fs-error'));
            return util.readFile('./some-path').should.be.rejectedWith('some-fs-error');
        });

        it('should rejected with error if fallback value was set but fs error is not ENOENT ', function() {
            var error = new Error('some-fs-error');
            error.code = 'EISDIR';

            readFileStub.yields(error);
            return util.readFile('./some-path', 'some-fallback').should.be.rejectedWith('some-fs-error');
        });

        it('should resolve with given fallback value if file does not exist on filesystem', function() {
            var error = new Error('some-fs-error');
            error.code = 'ENOENT';

            readFileStub.yields(error);
            return util.readFile('./some-path', 'some-fallback').should.be.eventually.equal('some-fallback');
        });
    });

    describe('readJSONFile', function() {
        var readFileStub;

        beforeEach(function() {
            readFileStub = sandbox.stub(fsExtra, 'readJSON');
        });

        it('should call properly method with valid params for file reading from file system', function() {
            readFileStub.yields();
            return util.readJSONFile('./some-path').then(function() {
                fsExtra.readJSON.should.be.calledWith('./some-path', {encoding: 'utf-8'});
            });
        });

        it('should read and return content from file on file system', function() {
            var expected = {name: 'Hello World'};
            readFileStub.yields(null, expected);
            return util.readJSONFile('./some-path').should.eventually.eql(expected);
        });

        it('should rejected with error if fs error occur and fallback value was not set', function() {
            readFileStub.yields(new Error('some-fs-error'));
            return util.readJSONFile('./some-path').should.be.rejectedWith('some-fs-error');
        });

        it('should rejected with error if fallback value was set but fs error is not ENOENT ', function() {
            var error = new Error('some-fs-error');
            error.code = 'EISDIR';

            readFileStub.yields(error);
            return util.readJSONFile('./some-path', 'some-fallback').should.be.rejectedWith('some-fs-error');
        });

        it('should resolve with given fallback value if file does not exist on filesystem', function() {
            var error = new Error('some-fs-error');
            error.code = 'ENOENT';

            readFileStub.yields(error);
            return util.readJSONFile('./some-path', 'some-fallback').should.be.eventually.equal('some-fallback');
        });
    });

    describe('readFileFromCache', function() {
        it('should be resolved with content of text file', function() {
            sandbox.stub(fs, 'readFile').yields(null, 'foo1');
            return util.readFileFromCache('./file1').should.eventually.equal('foo1');
        });

        it('should be resolved with parsed content of json file', function() {
            var obj = {foo: 'bar'};
            sandbox.stub(fsExtra, 'readJSON').yields(null, obj);

            return util.readFileFromCache('./file1', true).should.eventually.eql(obj);
        });

        it('should be rejected on error if file does not exists', function() {
            var err = new Error('Error');
            err.code = 'ENOENT';
            sandbox.stub(fs, 'readFile').yields(err);

            return util.readFileFromCache('./invalid-file').catch(function(error) {
                error.code.should.equal(err.code);
            });
        });
    });

    describe('writeFileToCache', function() {
        it('should create directory for target file if it not exists yet', function() {
            sandbox.stub(fsExtra, 'ensureDir').yields(null);
            sandbox.stub(fs, 'writeFile').yields(null);

            return util.writeFileToCache('/path-to-dir/file', 'foo').then(function() {
                fsExtra.ensureDir.should.be.calledOnce;
                fsExtra.ensureDir.should.be.calledWithMatch('/path-to-dir');
            });
        });

        it('should save file to valid file path', function() {
            sandbox.stub(fsExtra, 'ensureDir').yields(null);
            sandbox.stub(fs, 'writeFile').yields(null);

            return util.writeFileToCache('/path-to-dir/file', 'foo').then(function() {
                fs.writeFile.should.be.calledOnce;
                fs.writeFile.should.be.calledWithMatch('/path-to-dir/file');
            });
        });

        it('should return rejected promise in case of error while saving file', function() {
            sandbox.stub(fsExtra, 'ensureDir').yields(null);
            sandbox.stub(fs, 'writeFile').yields(new Error('file error'));

            return util.writeFileToCache('/path-to-dir/file', 'foo').should.be.rejectedWith('file error');
        });
    });

    describe('processPagesAsync', function() {

    });
});
