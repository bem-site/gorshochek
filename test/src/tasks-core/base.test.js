var fs = require('fs'),
    fsExtra = require('fs-extra'),
    Config = require('../../../lib/config'),
    Model = require('../../../lib/model/model'),
    TaskBase = require('../../../lib/tasks-core/base');

describe('Base', function() {
    var sandbox = sinon.sandbox.create(),
        config = new Config(),
        task;

    beforeEach(function() {
        task = new TaskBase(config, {}, {module: module, name: 'test base'});
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return valid task name', function() {
       TaskBase.getName().should.be.equal('base');
    });

    it('getBaseConfig', function() {
        task.getBaseConfig().should.be.instanceof(Config);
    });

    it('getTaskConfig', function() {
        task.getTaskConfig().should.be.instanceof(Object);
    });

    describe('"readFileFromCache" method', function() {
        it('should be resolved with content of text file', function() {
            sandbox.stub(fs, 'readFile').yields(null, 'foo1');
            return task.readFileFromCache('./file1').should.eventually.equal('foo1');
        });

        it('should be resolved with parsed content of json file', function() {
            var obj = {foo: 'bar'};
            sandbox.stub(fsExtra, 'readJSON').yields(null, obj);
            return task.readFileFromCache('./file1', true).should.eventually.eql(obj);
        });

        it('should be rejected on error if file does not exists', function() {
            var err = new Error('Error');
            err.code = 'ENOENT';
            sandbox.stub(fs, 'readFile').yields(err);
            return task.readFileFromCache('./invalid-file').catch(function(error) {
                error.code.should.equal(err.code);
            });
        });
    });

    describe('"writeFileToCache" method', function() {
        it('should create directory for target file if it not exists yet', function() {
            sandbox.stub(fsExtra, 'ensureDir').yields(null);
            sandbox.stub(fs, 'writeFile').yields(null);
            return task.writeFileToCache('/path-to-dir/file', 'foo').then(function() {
                fsExtra.ensureDir.should.be.calledOnce;
                fsExtra.ensureDir.should.be.calledWithMatch('/path-to-dir');
            });
        });

        it('should save file to valid file path', function() {
            sandbox.stub(fsExtra, 'ensureDir').yields(null);
            sandbox.stub(fs, 'writeFile').yields(null);
            return task.writeFileToCache('/path-to-dir/file', 'foo').then(function() {
                fs.writeFile.should.be.calledOnce;
                fs.writeFile.should.be.calledWithMatch('/path-to-dir/file');
            });
        });

        it('should return rejected promise in case of error while saving file', function() {
            sandbox.stub(fsExtra, 'ensureDir').yields(null);
            sandbox.stub(fs, 'writeFile').yields(new Error('file error'));
            return task.writeFileToCache('/path-to-dir/file', 'foo').should.be.rejectedWith('file error')
        });
    });

    it('default implementation of "getCriteria" method should return false', function() {
        task.getCriteria().should.be.false;
    });

    describe('processPage', function() {
        it('should return resolved promise with page', function() {
            var page = {url: '/url1'};
            return task.processPage(new Model(), page, ['en', 'ru']).should.eventually.eql(page);
        });
    });

    it('default implementation of "run" function should return resolved promise with true value', function() {
        return task.run().should.eventually.be.true;
    });
});
